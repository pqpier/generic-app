import React, { useState } from "react";
import { Button } from "@/shadcn/components/ui/button";
import { increment } from "firebase/firestore";
import Logo from "@/components/Logo";
import { useFirestore } from "@/hooks/useFirestore";
import { Input } from "@/shadcn/components/ui/input";
import { useAuthContext } from "@/hooks/useAuthContext";
import questions from "./questions";

const url =
  "https://us-central1-trading-app-e0773.cloudfunctions.net/createUsername";

export default function Step4() {
  const { user } = useAuthContext();
  const { updateDocument: updateUser } = useFirestore("users");

  const lastStep = async () => {
    await updateUser(user.uid, {
      onboarding: -1,
      redirectToRoute: {
        active: true,
        path: "/treinamento",
      },
    });
  };

  return (
    <div className="h-screen w-full p-2.5 flex flex-col items-center justify-center">
      <div className="flex flex-col items-center gap-2.5">
        <Logo />
        <h3 className="text-lg font-semibold">✅ &nbsp; Análise concluída </h3>
      </div>
      <div className="mt-5 flex flex-col gap-4 items-center w-11/12 sm:w-1/4 2xl:w-1/4">
        <p className="text-sm sm:text-md">
          Com base nas respostas fornecidas, determinamos que o seu perfil de
          investidor é <b>moderado</b>.
        </p>
        <p className="text-sm">
          Utilizaremos essa informação para personalizar a sua experiência de
          investimento e buscar a melhor rentabilidade para o seu perfil e para
          os seus objetivos.
        </p>
        <p className="text-sm">
          Agora o próximo passo é assistir ao mini-treinamento com atenção, e ao
          fim dele você estará preparado para começar a operar com o Solyd,
          ainda que seja a sua primeira experiência com Forex.
        </p>
        <Button
          onClick={() => {
            lastStep();
          }}
          className="mt-2.5 w-full bg-[#00FFA3] hover:bg-[#00FFA3] hover:brightness-110"
        >
          Continuar para o treinamento
        </Button>
      </div>
    </div>
  );
}
