import React, { useEffect, useRef, useState } from "react";
import { useAuthContext } from "@/hooks/useAuthContext";
import { Card, CardContent } from "@/shadcn/components/ui/card";
import { Button } from "@/shadcn/components/ui/button";

import { Checkbox } from "@/shadcn/components/ui/checkbox";
import { useFirestore } from "@/hooks/useFirestore";
import { CheckCircledIcon, CopyIcon } from "@radix-ui/react-icons";
import { useCollection } from "@/hooks/useCollection";
import { useReferrerContext } from "@/hooks/useReferrerContext";
import { Input } from "@/shadcn/components/ui/input";

export default function Refer() {
  const { user } = useAuthContext();
  const { referrerDoc } = useReferrerContext();
  const { updateDocument: updateReferral } = useFirestore(
    "referrals",
    user.uid
  );
  const { documents: referrals } = useCollection(
    "referrals",
    null,
    ["totalPurchases", "desc"],
    null,
    8
  );
  const { documents: rewardPurchases } = useCollection("rewardPurchases", [
    "referrerId",
    "==",
    referrerDoc.referrerId,
  ]);
  const [userAcceptedTerms, setUserAcceptedTerms] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [analytics, setAnalytics] = useState(null);
  const [textCopied, setTextCopied] = useState("");
  const [paymentDetails, setPaymentDetails] = useState({
    name: "",
    pixKey: "",
  });
  const generateLink = useRef(false);

  const subscribeToRewardsProgram = async () => {
    if (!userAcceptedTerms) {
      setErrorMessage("Você precisa aceitar os termos para participar.");
      return;
    }
    await updateReferral(user.uid, { acceptedTerms: true });
  };

  async function copyToClipboard(text, what) {
    try {
      await navigator.clipboard.writeText(text);
      setTextCopied(what);
      setTimeout(() => {
        setTextCopied("");
      }, 3000);
    } catch (err) {
      console.error("Falha ao copiar o texto para o clipboard:", err);
    }
  }

  const getRankColor = (index) => {
    switch (index) {
      case 0:
        return "bg-yellow-500 text-white";
      case 1:
        return "bg-gray-500 text-white";
      case 2:
        return "bg-yellow-600 text-white";
      default:
        return "bg-gray-200 text-gray-900";
    }
  };

  const getVideoPurchases = () => {
    return rewardPurchases?.filter((purchase) =>
      purchase.referrer.includes("video")
    ).length;
  };

  const getPayPurchases = () => {
    return rewardPurchases?.filter((purchase) =>
      purchase.referrer.includes("pay")
    ).length;
  };

  const savePaymentDetails = async () => {
    await updateReferral(user.uid, {
      paymentDetails: paymentDetails,
    });
  };

  useEffect(() => {
    if (referrerDoc && referrerDoc.paymentDetails) {
      setPaymentDetails(referrerDoc.paymentDetails);
    }
  }, [referrerDoc]);

  useEffect(() => {
    async function getLinkAnalytics() {
      const idToken = await user.getIdToken();
      const url =
        "https://us-central1-trading-app-e0773.cloudfunctions.net/getLinkAnalytics";

      try {
        const response = await fetch(url, {
          method: "POST",
          body: JSON.stringify({
            checkoutUrl: referrerDoc.checkoutLink,
            videoUrl: referrerDoc.videoLink,
          }),
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${idToken}`,
          },
        });
        const data = await response.json();
        setAnalytics(data);
      } catch (err) {
        console.error("Erro ao buscar dados de analytics:", err);
      }
    }
    if (referrerDoc && referrerDoc.checkoutLink && referrerDoc.videoLink) {
      getLinkAnalytics();
    }
  }, [referrerDoc]);

  useEffect(() => {
    async function fixLinks() {
      await updateReferral(user.uid, { regenerateLink: true });
      console.log("ran fixLinks");
    }
    if (referrerDoc && referrerDoc.acceptedTerms) {
      if (
        !referrerDoc.checkoutLink &&
        !referrerDoc.videoLink &&
        generateLink.current === false
      ) {
        if (!referrerDoc.regenerateLink) {
          generateLink.current = true;
          fixLinks();
        }
      }
    }
  }, [referrerDoc]);

  return (
    <div className="mt-5 px-2.5 py-12 lg:px-0 lg:py-5 w-full xl:w-3/5 mx-auto 2xl:w-2/5">
      <div className="px-1 lg:px-0">
        {" "}
        <h1 className="font-medium text-xl">Programa de Recompensas</h1>
        <p className="text-muted-foreground font-light text-md text-left">
          Indique o Solyd para seus amigos e conhecidos e ganhe 100 reais por
          indicação válida.
        </p>
      </div>

      <Card className="mt-2.5 w-full">
        <CardContent className="p-5">
          {referrerDoc.acceptedTerms ? (
            <>
              <h3>Copie seus links abaixo e compartilhe para ganhar</h3>
              <p className="text-sm mt-5 mb-1.5">
                Vídeo de apresentação{" "}
                <span className="text-muted-foreground">
                  {analytics?.videoUrlTotalClicks} cliques |{" "}
                  {getVideoPurchases()} compras
                </span>
              </p>
              <div
                className="flex items-center justify-between h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background cursor-pointer"
                type="text"
                onClick={() => copyToClipboard(referrerDoc.videoLink, "video")}
              >
                <p className="text-muted-foreground">
                  {referrerDoc
                    ? referrerDoc.videoLink
                      ? referrerDoc.videoLink
                      : "Gerando link, aguarde..."
                    : ""}
                </p>
                {textCopied === "video" ? (
                  <CheckCircledIcon className="text-green-500 w-4 h-4" />
                ) : (
                  <CopyIcon className="text-blue-400 w-4 h-4" />
                )}
              </div>
              {textCopied === "video" ? (
                <p className="text-green-500 text-sm mt-2.5">
                  Link copiado para a área de transferência.
                </p>
              ) : null}
              <p className="mt-5 text-sm mb-1.5">
                Página de pagamentos{" "}
                <span className="text-muted-foreground">
                  {analytics?.checkoutUrlTotalClicks} cliques |{" "}
                  {getPayPurchases()} compras
                </span>
              </p>
              <div
                className="flex items-center justify-between h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background cursor-pointer"
                type="text"
                onClick={() =>
                  copyToClipboard(referrerDoc.checkoutLink, "checkout")
                }
              >
                <p className="text-muted-foreground">
                  {referrerDoc
                    ? referrerDoc.checkoutLink
                      ? referrerDoc.checkoutLink
                      : "Gerando link, aguarde..."
                    : ""}
                </p>
                {textCopied === "checkout" ? (
                  <CheckCircledIcon className="text-green-500 w-4 h-4" />
                ) : (
                  <CopyIcon className="text-blue-400 w-4 h-4" />
                )}
              </div>
              {textCopied === "checkout" ? (
                <p className="text-green-500 text-sm mt-2.5">
                  Link copiado para a área de transferência.
                </p>
              ) : null}

              <div className="pt-1.5"></div>
            </>
          ) : (
            <>
              <h3>
                Para participar do <b>Programa de Recompensas</b> do Solyd, leia
                o regulamento abaixo, aceite os termos e clique no botão para
                confirmar a sua inscrição.{" "}
              </h3>
              <div className="mt-5">
                <h4>Regulamento:</h4>
                <p className="mt-2.5 text-muted-foreground">
                  1. O Solyd pagará 100 reais para cada usuário que indicar um
                  amigo que, através dessa indicação, comprar a licença de uso
                  do Solyd.{" "}
                  <u>
                    A indicação será válida para pagamento através deste
                    programa de recompensas apenas após o usuário indicado
                    passar dos 30 dias de garantia.
                  </u>
                </p>
                <p className="mt-2.5 text-muted-foreground">
                  2. Os pagamentos serão feitos uma vez por mês, todo dia 1º de
                  cada mês. Ou seja, todo dia primeiro de cada mês você receberá
                  o pagamento das indicações válidas (usuários indicados que já
                  passaram do período de garantia).
                </p>
                <p className="mt-2.5 text-muted-foreground">
                  3. O pagamento será realizado via Pix para uma conta bancária
                  da titularidade do usuário participante deste Programa de
                  Recompensas.
                </p>
                <p className="mt-2.5 text-muted-foreground">
                  4. Para estar habilitado a receber as comissões geradas pelas
                  indicações válidas, você precisa ser um usuário do Solyd com
                  um plano ativo.
                </p>
                <div className="mt-5 flex gap-1.5 items-center">
                  <Checkbox
                    id="terms"
                    checked={userAcceptedTerms}
                    onCheckedChange={() => {
                      if (userAcceptedTerms === false) {
                        setErrorMessage("");
                      }
                      setUserAcceptedTerms((prev) => !prev);
                    }}
                  />
                  <label
                    htmlFor="terms"
                    className="text-sm text-muted-foreground font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Declaro que li e aceito o regulamento e quero participar do
                    Programa de Recompensas
                  </label>
                </div>
                {errorMessage ? (
                  <p className="text-red-500 text-sm mt-2.5">{errorMessage}</p>
                ) : null}
                <Button className="mt-5" onClick={subscribeToRewardsProgram}>
                  Participar do Programa de Recompensas
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
      {referrerDoc.acceptedTerms && (
        <Card className="mt-2.5 w-full">
          <CardContent className="p-5">
            <h3 className="mb-1.5">Dados para pagamento:</h3>
            <div className="flex flex-col sm:flex-row gap-1.5">
              <Input
                type="text"
                placeholder="Informe seu nome completo"
                value={paymentDetails.name}
                onChange={(e) =>
                  setPaymentDetails({
                    ...paymentDetails,
                    name: e.target.value,
                  })
                }
              />
              <Input
                type="text"
                placeholder="Informe a sua chave Pix"
                value={paymentDetails.pixKey}
                onChange={(e) =>
                  setPaymentDetails({
                    ...paymentDetails,
                    pixKey: e.target.value,
                  })
                }
              />
              <Button onClick={savePaymentDetails}>
                Salvar dados para pagamento
              </Button>
            </div>
            <div className="pt-1.5"></div>
          </CardContent>
        </Card>
      )}
      {referrerDoc.acceptedTerms && (
        <Card className="mt-2.5 w-full">
          <CardContent className="p-5">
            <h3 className="mb-2.5">Ranking de Parceiros:</h3>
            <ul className="flex flex-col gap-2.5">
              {referrals &&
                referrals.map((referral, index) => (
                  <li
                    key={referral.referrerId}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`${getRankColor(
                          index
                        )} py-1.5 px-3 rounded-sm`}
                      >
                        {index + 1}
                      </span>
                      <h3>
                        @{referral.referrerId}{" "}
                        {referral.referrerId === referrerDoc.referrerId
                          ? "(você)"
                          : ""}
                      </h3>
                    </div>
                    <span>{referral.totalPurchases}</span>
                  </li>
                ))}
            </ul>
            <div className="pt-1.5"></div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
