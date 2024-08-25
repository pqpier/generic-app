import React, { useState } from "react";
import { Button } from "@/shadcn/components/ui/button";
import { increment } from "firebase/firestore";
import Logo from "@/components/Logo";
import { useFirestore } from "@/hooks/useFirestore";
import { Input } from "@/shadcn/components/ui/input";
import { useAuthContext } from "@/hooks/useAuthContext";

const url =
  "https://us-central1-trading-app-e0773.cloudfunctions.net/createUsername";

export default function Step2() {
  const { user } = useAuthContext();
  const { updateDocument: updateUser } = useFirestore("users");

  const nextStep = async () => {
    await updateUser(user.uid, {
      onboarding: increment(1),
    });
  };

  return (
    <div className="h-screen w-full p-2.5 flex flex-col items-center justify-center">
      <div className="sm:w-1/4 2xl:w-1/4">
        <div className="flex flex-col items-center gap-2.5">
          <Logo />
          <h3 className="text-lg font-semibold">Perfil de Investidor</h3>
        </div>
        <div className="mt-10 flex flex-col items-center w-11/12 sm:w-full">
          <p className="text-center">
            Agora, precisamos de algumas informações para definir o seu perfil
            de investidor.
          </p>
        </div>
        <p className="mt-5 text-center text-muted-foreground">
          Clique no botão abaixo para iniciar
        </p>
        <Button
          size="lg"
          className="mt-2.5 w-10/12 sm:w-full text-md"
          onClick={nextStep}
        >
          Iniciar teste de perfil
        </Button>
      </div>
    </div>
  );
}
