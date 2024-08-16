import React, { useCallback, useEffect, useState } from "react";
import {
  ArrowTopRightIcon,
  ArrowBottomRightIcon,
  TrashIcon,
  Pencil1Icon,
} from "@radix-ui/react-icons";
import { useCollection } from "@/hooks/useCollection";
import { useFirestore } from "@/hooks/useFirestore";
import { useAuthContext } from "@/hooks/useAuthContext";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/shadcn/components/ui/alert-dialog";
import { Input } from "@/shadcn/components/ui/input";
import { useDocument } from "@/hooks/useDocument";
import { debounce } from "lodash";
import { Skeleton } from "@/shadcn/components/ui/skeleton";
import { Separator } from "@/shadcn/components/ui/separator";
import Loading from "@/components/Loading";

import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/shadcn/components/ui/button";
import useIsPWA from "@/hooks/useIsPWA";

export default function Home() {
  const { document: currentAppVersion } = useDocument("appVersion", "current");
  const isPwa = useIsPWA();
  const [balance, setBalance] = useState("");
  const [adjustedEntryPrice, setAdjustedEntryPrice] = useState("");
  const { user } = useAuthContext();
  const { document: userDoc } = useDocument("users", user.uid);
  const { updateDocument: updateUser } = useFirestore("users");
  const { documents: signalsDocs } = useCollection(
    "signals",
    ["closedAt", "==", null],
    ["createdAt", "desc"],
    null
  );
  const { documents: tradesDocs } = useCollection(
    "trades",
    ["ownerId", "==", user.uid],
    ["openedAt", "desc"]
  );

  const { documents: discardedTrades } = useCollection(
    "trades",
    ["ownerId", "==", user.uid],
    null,
    ["discarded", "==", true]
  );

  const { addDocument: addTrade, updateDocument: updateTrade } =
    useFirestore("trades");

  const openTrade = async (signal) => {
    await addTrade({
      ...signal,
      ownerId: user.uid,
      signalId: signal.id,
      openedAt: new Date(),
      id: undefined,
      closedAt: null,
      lotSize: getLotSize(signal.ticker, balance, userDoc.risk),
    });
  };

  const discardSignal = async (signal) => {
    await addTrade({
      ...signal,
      ownerId: user.uid,
      signalId: signal.id,
      openedAt: new Date(),
      id: undefined,
      closedAt: new Date(),
      discarded: true,
      lotSize: getLotSize(signal.ticker, balance, userDoc.risk),
    });
  };

  const closeTrade = async (openTrade) => {
    await updateTrade(openTrade.id, {
      closedAt: new Date(),
    });
  };

  const editTrade = async (openTrade) => {
    await updateTrade(openTrade.id, {
      entryPrice: adjustedEntryPrice,
    });
    setAdjustedEntryPrice("");
  };

  const updateBalanceInDB = async (value) => {
    try {
      await updateUser(user.uid, { balance: value });
    } catch (error) {
      console.error("Error updating balance: ", error);
    }
  };

  const debouncedUpdateBalance = useCallback(
    debounce((value) => updateBalanceInDB(value), 1000),
    []
  );

  const changeBalance = (value) => {
    setBalance(value);
    debouncedUpdateBalance(value);
  };

  const isEntryPriceClose = (newEntryPrice, ticker) => {
    const newEntry = parseFloat(newEntryPrice);

    let pipDifference = 0.0015;

    if (ticker === "US100") {
      pipDifference = 100;
    } else if (ticker === "NZDUSD") {
      // pipDifference = 0.002;
    }

    return openTrades?.some((trade) => {
      if (trade.ticker !== ticker) return false;
      const openEntry = parseFloat(trade.entryPrice);
      const diff = Math.abs(newEntry - openEntry);

      return diff < pipDifference;
    });
  };

  function roundToNearest(what, num) {
    let factor = 100;
    if (what === "tenth") factor = 10;
    return Math.floor(num * factor) / factor;
  }

  const getLotSize = (ticker, capital, risk) => {
    let custom_factor = 0.5;

    if (ticker === "US100") custom_factor = 1;

    // if (ticker === "NZDUSD" || ticker === "AUDCAD") custom_factor = 1;

    let valor_do_lote = 100;
    if (ticker === "US100") {
      valor_do_lote = 37.6;
    }

    let max_operations;
    if (Number(capital) >= 2000) {
      max_operations = 10;
    } else if (Number(capital) >= 1000) {
      max_operations = 7;
    } else {
      max_operations = 5;
    }

    const risk_margin_levels = {
      low: 1700,
      medium: 1000,
      high: 300,
    };

    const nivel_de_margem = risk_margin_levels[risk];

    // Calcula o capital disponível por operação
    const capital_por_operacao = capital / max_operations;

    // Calcula a margem utilizada por operação com base no nível de margem
    const margem_utilizada_por_operacao =
      capital_por_operacao / (nivel_de_margem / 100);

    // Calcula o tamanho do lote que pode ser alocado por operação
    const tamanho_do_lote =
      (margem_utilizada_por_operacao / valor_do_lote) * custom_factor;

    const lot_size = roundToNearest(
      ticker === "US100" ? "tenth" : "hundreth",
      tamanho_do_lote
    ).toFixed(2);

    if (ticker === "US100") {
      return lot_size > 0.1 ? lot_size : (0.1).toFixed(2);
    }

    return lot_size > 0.01 ? lot_size : (0.01).toFixed(2);
  };

  const getRisk = (risk) => {
    if (risk === "low") {
      return "Baixo";
    } else if (risk === "medium") {
      return "Médio";
    }
    return "Alto";
  };

  const getHealthyMargin = () => {
    if (userDoc?.risk === "low") {
      return "1000%";
    } else if (userDoc?.risk === "medium") {
      return "600%";
    }
    return "300%";
  };

  useEffect(() => {
    if (userDoc) {
      setBalance(userDoc.balance || "");
    }
  }, [userDoc]);

  // const openTrades = tradesDocs?.filter((tr) => !tr.closedAt);

  const openTrades = tradesDocs?.filter((tr) => {
    // Verifica se a trade está aberta
    if (tr.closedAt) return false;

    // Encontra o sinal correspondente
    const correspondingSignal = signalsDocs.find((signal) => {
      if (signal.id === tr.signalId) return false;
    });

    if (tr.signalId === "3Z5hz7fLL3Vr4MlKU2mW") {
    }

    // Verifica se o sinal correspondente não está fechado com lucro
    if (
      correspondingSignal &&
      correspondingSignal.status === "closed on profit"
    ) {
      return false;
    }

    // Inclui a trade se não for fechada e o sinal não estiver fechado com lucro
    return true;
  });

  const notOpenSignals = signalsDocs?.filter((signal) => {
    const tradeExists =
      tradesDocs?.find((trade) => trade.signalId === signal.id) !== undefined;
    const discardedTradeExists =
      discardedTrades?.find((trade) => trade.signalId === signal.id) !==
      undefined;
    const isInProgress = signal.status === "in progress";

    return !tradeExists && !discardedTradeExists && !isInProgress;
  });

  const updateAppVersion = async () => {
    await updateUser(user.uid, { appVersion: currentAppVersion.version });
    window.location.reload(true);
  };

  const getTradeId = async (trade) => {
    let tradeId;
    for (let i = 0; i < tradesDocs.length; i++) {
      if (tradesDocs[i].id === trade.id) {
        tradeId = i + 1;
      }
    }

    return tradeId.toString();
  };

  const isMarketClosed = () => {
    const now = new Date();
    const brasiliaOffset = -3; // UTC-3

    // Ajuste para o horário de Brasília
    const localTime = new Date(now.getTime() + brasiliaOffset * 60 * 60 * 1000);

    const day = localTime.getUTCDay(); // 0 (Domingo) - 6 (Sábado)
    const hour = localTime.getUTCHours(); // 0 - 23

    // Horário de funcionamento: das 18h do domingo até as 18h da sexta-feira
    const isSundayAfter6PM = day === 0 && hour >= 18;
    const isWeekday = day > 0 && day < 5; // Segunda a quinta-feira
    const isFridayBefore6PM = day === 5 && hour < 18;

    // O mercado está aberto de domingo às 18h até sexta-feira às 18h
    const isMarketOpen = isSundayAfter6PM || isWeekday || isFridayBefore6PM;

    return !isMarketOpen;
  };

  if (!currentAppVersion) return <Loading />;

  if (!userDoc) return <Loading />;

  return (
    <>
      {userDoc.appVersion !== currentAppVersion.version && isPwa && (
        <div
          onClick={updateAppVersion}
          className="mt-12 bg-amber-400 p-2.5 text-center text-black text-md rounded-md cursor-pointer"
        >
          <b>Existe uma nova versão do app disponível. </b>
          Clique aqui para atualizar.
        </div>
      )}

      {isMarketClosed() && (
        <div className="mt-14 bg-blue-400 p-2.5 text-center text-black text-md rounded-md mx-2 sm:mx-5">
          <b>O mercado está fechado no momento.</b> <br />
          Seu horário de funcionamento é das 18h do domingo até as 18h da
          sexta-feira, 24 horas por dia.
        </div>
      )}

      <div className="mt-12 py-4 px-5 sm:p-8 sm:w-2/3 xl:w-1/2 mx-auto bg-background rounded-xl min-h-[calc(100vh_-_96px)]">
        <div className="flex gap-2.5 items-center">
          <h1 className="sm:text-lg font-medium">Capital (USD):</h1>
          <Input
            className="w-20 text-right"
            type="text"
            maxLength={6}
            placeholder="Informe"
            value={balance}
            onChange={(e) =>
              changeBalance(e.target.value.replace(/[^0-9.]/g, ""))
            }
          />
        </div>
        <div className="mt-2.5 flex items-center justify-between">
          <div className="w-1/2">
            <span className="text-md font-medium">Nível de risco:</span>{" "}
            <span className="font-light text-muted-foreground">
              {getRisk(userDoc?.risk)}
            </span>
          </div>
          <div className="w-1/2">
            <span className="text-md font-medium ">
              Nível de margem saudável:
            </span>{" "}
            <span className="font-light text-muted-foreground">
              {getHealthyMargin(userDoc?.risk)}
            </span>
          </div>
        </div>
        <Separator className="my-5" />
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-medium">Oportunidades de negociação</h1>
        </div>
        <div className="pt-5"></div>
        {notOpenSignals ? (
          notOpenSignals?.length ? (
            <div className="flex mb-2.5 text-sm">
              <p className="text-muted-foreground basis-5/12 pl-5">Ativo</p>
              <p className="text-muted-foreground basis-5/12 text-center -ml-8">
                Entrada
              </p>
              <p className="text-muted-foreground basis-4/12 pl-2.5">Tipo</p>
            </div>
          ) : null
        ) : (
          <div className="flex mb-2.5 pl-5 pr-5">
            <div className="w-5/12">
              <Skeleton className="w-12 h-4" />
            </div>
            <div className="w-5/12">
              <Skeleton className="w-12 h-4" />
            </div>
            <div className="w-4/12">
              <Skeleton className="w-12 h-4" />
            </div>
          </div>
        )}
        {notOpenSignals ? (
          notOpenSignals.length ? (
            notOpenSignals.map((signal) => {
              // if (signal.ticker === "TESTE" && !userDoc?.admin) return null;

              if (signal.ticker === "US100" && balance < 500) return null;

              const isClose =
                isEntryPriceClose(signal.entryPrice, signal.ticker) &&
                !signal.bypassProtection;

              return (
                <AlertDialog key={signal.id}>
                  <AlertDialogTrigger asChild>
                    <div className="relative bg-muted py-2.5 px-3 rounded-md flex flex-col items-center mb-2.5 cursor-pointer hover:bg-muted/75 transition-colors duration-200 ease-in-out">
                      <div className="flex items-center w-full">
                        <h3 className="text-foreground w-5/12 font-semibold">
                          {signal.ticker}
                        </h3>
                        <p className="text-foreground/90 w-5/12 text-[15px] font-light text-center -ml-5">
                          {signal.entryPrice}
                        </p>
                        <div
                          className={`flex justify-center items-center gap-1 text-foreground w-4/12 ${
                            signal.type === "BUY"
                              ? "bg-green-900/30 text-green-500"
                              : "bg-red-900/30 text-red-500"
                          } py-1.5 px-2.5 text-sm font-medium rounded-lg`}
                        >
                          <p className="w-fit text-xs">
                            {signal.type === "BUY" ? "Comprar" : "Vender"}
                          </p>
                          {signal.type === "BUY" ? (
                            <ArrowTopRightIcon className="w-4 h-4 mt-px shrink-0" />
                          ) : (
                            <ArrowBottomRightIcon className="w-4 h-4 mt-px shrink-0" />
                          )}
                        </div>
                      </div>
                      <div className="flex justify-between mt-2.5 w-full">
                        <p className="font-normal w-1/3 sm:w-9/12 text-[15px]">
                          Lote:{" "}
                          <span className="text-muted-foreground">
                            {balance
                              ? getLotSize(
                                  signal.ticker,
                                  userDoc.balance,
                                  userDoc.risk
                                )
                              : "Informe o capital"}
                          </span>
                        </p>
                        <p className="font-medium w-1/3 sm:w-3/12 text-[15px] text-center">
                          TP:{" "}
                          <span className="text-muted-foreground">
                            {signal.takeProfit}
                          </span>
                        </p>
                      </div>
                      <div className="flex justify-between mt-2.5 w-full">
                        <p className="font-light text-xs w-9/12">
                          <span className="text-muted-foreground">
                            {signal.createdAt
                              ? formatDistanceToNow(signal.createdAt.toDate(), {
                                  addSuffix: true,
                                  locale: ptBR,
                                })
                              : null}
                          </span>
                        </p>
                      </div>
                      {isClose && (
                        <div className="absolute top-0 left-0 w-full h-full bg-yellow-400/90 rounded-md flex flex-col items-center justify-center">
                          <p className="text-secondary font-semibold text-sm text-center leading-4">
                            Você já possui uma operação em um valor de entrada
                            muito próximo para esse ativo.
                          </p>
                          <p className="text-secondary text-sm text-center mt-1">
                            Clique para descartar a operação.
                          </p>
                        </div>
                      )}
                    </div>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        {isClose
                          ? "Deseja descartar a operação?"
                          : "Deseja abrir a operação?"}
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        {isClose
                          ? "Esta é a ação recomendada."
                          : "Essa ação não pode ser desfeita."}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      {!isClose && (
                        <Button
                          variant="outline"
                          className={
                            "border-yellow-500/20 font-medium flex gap-2.5 text-yellow-500 text-sm mt-1.5 sm:mt-0 sm:mr-auto"
                          }
                          onClick={() => discardSignal(signal)}
                        >
                          <TrashIcon className="h-5 w-5" />
                          <p className="sm:hidden">Descartar a operação</p>
                          <p className="hidden sm:block">Descartar</p>
                        </Button>
                      )}
                      <div className="py-2.5"></div>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        className={
                          isClose
                            ? "bg-white hover:bg-white/90 font-semibold"
                            : "bg-green-500 hover:bg-green-600 font-semibold"
                        }
                        onClick={() => {
                          if (isClose) {
                            discardSignal(signal);
                            return;
                          }
                          openTrade(signal);
                        }}
                      >
                        {isClose
                          ? "Sim, descartar a operação"
                          : "Sim, abrir a operação"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              );
            })
          ) : (
            <p className="text-muted-foreground">
              Não há novas oportunidades de negociação.
            </p>
          )
        ) : (
          <div>
            <Skeleton className="w-full h-28 mb-2.5" />
            <Skeleton className="w-full h-28" />
          </div>
        )}

        <div className="pt-5"></div>

        <h1 className="text-xl font-medium mt-5">Operações abertas</h1>
        <div className="pt-5"></div>
        {openTrades?.length ? (
          <div className="flex mb-2.5 text-sm">
            <p className="text-muted-foreground basis-5/12 pl-5">Ativo</p>
            <p className="text-muted-foreground basis-5/12 text-center -ml-16">
              Entrada
            </p>
            <p className="text-muted-foreground basis-4/12 pl-2.5">Tipo</p>
          </div>
        ) : null}

        {openTrades?.length ? (
          openTrades.map((trade) => (
            <div key={trade.id} className="flex items-center gap-2.5">
              <AlertDialog className="w-full">
                <AlertDialogTrigger asChild>
                  <div className="w-full bg-muted p-5 rounded-md flex flex-col items-center mb-2.5 cursor-pointer hover:bg-muted/75 transition-colors duration-200 ease-in-out">
                    <div className="flex items-center w-full">
                      <h3 className="text-foreground w-5/12 font-semibold">
                        {trade.ticker}
                      </h3>
                      <p className="text-foreground/90 w-5/12 text-[15px] -ml-5 font-light text-center">
                        {trade.entryPrice}
                      </p>
                      <div
                        className={`flex justify-center items-center gap-1 text-foreground w-4/12 ${
                          trade.type === "BUY"
                            ? "bg-green-900/30 text-green-500"
                            : "bg-red-900/30 text-red-500"
                        } py-1.5 px-2.5 text-xs font-medium rounded-lg`}
                      >
                        <p className="w-fit">
                          {trade.type === "BUY" ? "Comprar" : "Vender"}
                        </p>
                        {trade.type === "BUY" ? (
                          <ArrowTopRightIcon className="w-4 h-4 mt-px shrink-0" />
                        ) : (
                          <ArrowBottomRightIcon className="w-4 h-4 mt-px shrink-0" />
                        )}
                      </div>
                    </div>
                    <div className="flex justify-between mt-2.5 w-full">
                      <p className="font-normal text-[15px] w-1/3 sm:w-9/12">
                        Lote:{" "}
                        <span className="text-muted-foreground">
                          {" "}
                          {trade.lotSize}
                        </span>
                      </p>
                      <p className="font-medium text-[15px] w-1/3 sm:w-3/12 text-center">
                        TP:{" "}
                        <span className="text-muted-foreground">
                          {trade.takeProfit}
                        </span>
                      </p>
                    </div>
                    <div className="flex justify-between mt-2.5 w-full">
                      <p className="font-normal text-xs">
                        <span className="text-muted-foreground">
                          {trade.createdAt
                            ? formatDistanceToNow(trade.createdAt.toDate(), {
                                addSuffix: true,
                                locale: ptBR,
                              })
                            : null}
                        </span>
                      </p>
                      <p className="font-normal text-xs">
                        <span className="text-muted-foreground">
                          {`#${trade.id.slice(0, 4)}`}
                        </span>
                      </p>
                    </div>
                  </div>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Deseja fechar a operação?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      Essa ação não pode ser desfeita.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-red-500 hover:bg-red-600 font-semibold"
                      onClick={() => closeTrade(trade)}
                    >
                      Sim, fechar operação
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="p-0 h-8 w-10">
                    <Pencil1Icon />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Deseja ajustar a entrada da operação?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      Para melhor acompanhamento, você pode ajustar o valor de
                      entrada conforme o que foi aberto na corretora.
                    </AlertDialogDescription>
                    <p className="text-foreground font-light text-sm text-left mb-1">
                      Valor real de entrada
                    </p>
                    <Input
                      placeholder={trade.entryPrice}
                      maxLength={6}
                      value={adjustedEntryPrice}
                      onChange={(e) =>
                        setAdjustedEntryPrice(
                          e.target.value.replace(/[^0-9.]/g, "")
                        )
                      }
                    />
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-green-500 hover:bg-green-600 font-semibold"
                      onClick={() => editTrade(trade)}
                    >
                      Sim, ajustar valor de entrada
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          ))
        ) : (
          <p className="text-muted-foreground">Não há operações abertas.</p>
        )}
      </div>
    </>
  );
}
