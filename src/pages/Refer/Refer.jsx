import React, { useEffect, useState } from "react";
import { useAuthContext } from "@/hooks/useAuthContext";
import { Card, CardContent } from "@/shadcn/components/ui/card";
import { Button } from "@/shadcn/components/ui/button";

import { Checkbox } from "@/shadcn/components/ui/checkbox";
import { useFirestore } from "@/hooks/useFirestore";
import { CheckCircledIcon, CopyIcon } from "@radix-ui/react-icons";
import { useCollection } from "@/hooks/useCollection";
import { useReferrerContext } from "@/hooks/useReferrerContext";

export default function Refer() {
  const { user } = useAuthContext();
  const { referrerDoc } = useReferrerContext();
  const { createDocument: createReferral } = useFirestore(
    "referrals",
    user.uid
  );
  const { documents: rewardPurchases } = useCollection("rewardPurchases", [
    "referrerId",
    "==",
    referrerDoc?.referrerId || "123",
  ]);
  const [userAcceptedTerms, setUserAcceptedTerms] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [analytics, setAnalytics] = useState(null);
  const [textCopied, setTextCopied] = useState("");

  const subscribeToRewardsProgram = async () => {
    if (!userAcceptedTerms) {
      setErrorMessage("Você precisa aceitar os termos para participar.");
      return;
    }
    await createReferral(user.uid, { id: user.uid, acceptedTerms: true });
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

  useEffect(() => {
    async function getLinkAnalytics() {
      const idToken = await user.getIdToken();
      const url =
        "https://us-central1-trading-app-e0773.cloudfunctions.net/getLinkAnalytics";
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
    }
    if (referrerDoc) {
      getLinkAnalytics();
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
          {referrerDoc ? (
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
    </div>
  );
}
