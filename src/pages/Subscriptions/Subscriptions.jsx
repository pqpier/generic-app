import React from "react";
import { useAuthContext } from "@/hooks/useAuthContext";
import { Input } from "@/shadcn/components/ui/input";
import { Card, CardContent } from "@/shadcn/components/ui/card";
import { Button } from "@/shadcn/components/ui/button";
import { useUserContext } from "@/hooks/useUserContext";
import Loading from "@/components/Loading";

export default function Subscriptions() {
  const { user } = useAuthContext();
  const { userDoc } = useUserContext();

  const getPlanStatus = () => {
    if (userDoc.plan.status === "active") return "Ativo";
    if (userDoc.plan.status === "refunded") return "Reembolsado";
    if (userDoc.plan.status === "chargedback") return "Pedido de chargeback";
  };

  if (!userDoc) return <Loading />;

  return (
    <div className="mt-5 px-0 py-5 w-full xl:w-3/5 mx-auto 2xl:w-1/3">
      <h1 className="font-medium text-xl">Gerenciar assinatura</h1>
      <p className="text-muted-foreground font-light text-md text-left">
        {isLatam
          ? "Cambie los datos de su cuenta"
          : "Gerencie a sua assinatura do Generic App"}
      </p>

      <Card className="mt-2.5 w-full">
        <CardContent>
          <p className="mt-5 text-muted-foreground mb-1.5">Plano atual</p>
          <Input disabled value={"Premium"} readOnly type="text" />
          <p className="mt-5 text-muted-foreground mb-1.5">Status do plano</p>
          <Input disabled value={getPlanStatus(userDoc.plan.status)} readOnly />
          <p className="mt-5 mb-1.5">
            Para recuperar o acesso à Generic App, adquira novamente uma
            assinatura clicando no botão abaixo:
          </p>
          <Button
            className="mt-2.5"
            onClick={() => {
              window.open("https://checkoutlink.com");
            }}
          >
            Assinar agora
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
