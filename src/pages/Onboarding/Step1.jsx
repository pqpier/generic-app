import React, { useState } from "react";
import { Button } from "@/shadcn/components/ui/button";
import { increment } from "firebase/firestore";
import Logo from "@/components/Logo";
import { useFirestore } from "@/hooks/useFirestore";
import { Input } from "@/shadcn/components/ui/input";
import { useAuthContext } from "@/hooks/useAuthContext";

const url =
  "https://us-central1-trading-app-e0773.cloudfunctions.net/createUsername";

export default function Step1() {
  const { user } = useAuthContext();
  const [username, setUsername] = useState("");
  const [error, setError] = useState({ what: null, message: "" });
  const [isPending, setIsPending] = useState(false);

  const handleUsernameChange = (e) => {
    setError({ what: null, message: "" });
    let value = e.target.value;

    // Regex para permitir letras minúsculas, números, e um único "_" e "."
    const regex = /^[a-z0-9]*[_.]?[a-z0-9]*$/;

    // Verifica se o valor atende às regras e se tem no máximo um "_" e um "."
    const valid =
      regex.test(value) &&
      (value.match(/_/g)?.length || 0) <= 1 &&
      (value.match(/\./g)?.length || 0) <= 1;

    if (valid || value === "") {
      setUsername(value);
    }
  };

  const saveUsername = async (e) => {
    e.preventDefault();
    setIsPending(true);

    if (username === "") {
      setError({
        what: "username",
        message: "Por favor, escolha um nome de usuário.",
      });
      setIsPending(false);
      return;
    }

    if (username.length < 5) {
      setError({
        what: "username",
        message: "O nome de usuário deve ter no mínimo 5 caracteres.",
      });
      setIsPending(false);
      return;
    }

    let idToken;
    try {
      idToken = await user.getIdToken(true);
    } catch (err) {
      alert("Erro ao obter token de autenticação.");
    }

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${idToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username,
        }),
      });

      console.log(response);
    } catch (err) {
      console.error(err);
    }

    setIsPending(false);
  };

  return (
    <div className="h-screen w-full p-2.5 flex flex-col items-center justify-center">
      <div className="sm:w-1/4 2xl:w-1/5">
        <div className="flex flex-col items-center gap-2.5">
          <Logo />
          <h3 className="text-lg font-semibold">1 | Perfil de Investidor</h3>
        </div>
        <div className="mt-10 flex flex-col items-center w-10/12 sm:w-full">
          <p className="text-center">
            Primeiro, vamos definir um nome de usuário para a sua conta Solyd.
          </p>
          <div className="mt-5 flex items-center w-10/12 gap-1">
            <span className="text-muted-foreground">@</span>
            <Input
              autoComplete="off"
              placeholder="Ex: joao.123"
              type="text"
              value={username}
              onChange={handleUsernameChange}
            />
          </div>
          {error.what === "username" && (
            <p className="text-red-500 text-sm mt-1.5 text-center">
              {error.message}
            </p>
          )}
        </div>
        <p className="mt-5 text-center text-muted-foreground">
          Clique no botão abaixo para continuar
        </p>
        <Button
          size="lg"
          className={`mt-2.5 w-10/12 sm:w-full text-md ${
            isPending ? "opacity-50" : ""
          }`}
          onClick={saveUsername}
          disabled={isPending}
        >
          {isPending ? "Aguarde..." : "Continuar"}
        </Button>
      </div>
    </div>
  );
}
