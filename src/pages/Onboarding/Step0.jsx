import React from "react";
import { Button } from "@/shadcn/components/ui/button";
import { increment } from "firebase/firestore";
import Logo from "@/components/Logo";
import { useFirestore } from "@/hooks/useFirestore";
import { useAuthContext } from "@/hooks/useAuthContext";

export default function Step0() {
  const { user } = useAuthContext();
  const { updateDocument: updateUser } = useFirestore("users");

  const nextStep = async () => {
    await updateUser(user.uid, {
      onboarding: increment(1),
    });
  };

  return (
    <div className="h-screen w-full p-2.5 flex flex-col items-center justify-center">
      <div className="sm:w-1/3 2xl:w-1/4">
        <div className="flex flex-col items-center gap-2.5">
          <Logo />
          <h3 className="text-lg font-semibold">
            Seja bem-vindo ao Solyd App.
          </h3>
        </div>
        <div className="mt-10 flex flex-col items-center">
          <p className="text-center">
            O primeiro passo na sua jornada com o Solyd é preencher o seu perfil
            de investidor.
          </p>
          <p className="mt-10 text-center text-muted-foreground">
            Clique no botão abaixo para começar.
          </p>
          <Button
            size="lg"
            className="mt-2.5 w-10/12 text-md"
            onClick={nextStep}
          >
            Começar agora
          </Button>
        </div>
      </div>
    </div>
  );
}
