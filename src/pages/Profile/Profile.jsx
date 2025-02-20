import React, { useState } from "react";
import { ModeToggle } from "@/shadcn/components/mode-toggle";
import { useAuthContext } from "@/hooks/useAuthContext";
import { Input } from "@/shadcn/components/ui/input";
import { Card, CardContent } from "@/shadcn/components/ui/card";
import { Button } from "@/shadcn/components/ui/button";
import { RiskToggle } from "@/shadcn/components/risk-toggle";
import { useUserContext } from "@/hooks/useUserContext";
import Loading from "@/components/Loading";

// TODO: Trocar pela URL da sua Cloud Function
const url =
  "https://us-central1-trading-app-e0773.cloudfunctions.net/changePassword";

export default function Profile({ rerender, setRerender }) {
  const { user } = useAuthContext();
  const { userDoc } = useUserContext();
  const [message, setMessage] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const isEmailProvider =
    user.providerData &&
    user.providerData.length &&
    user.providerData[0].providerId === "google.com"
      ? false
      : true;

  const changePassword = async (e) => {
    e.preventDefault();

    if (password !== passwordConfirmation) {
      setMessage("As senhas não coincidem.");
      return;
    }

    const idToken = await user.getIdToken(true);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${idToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        oldPassword: currentPassword,
        newPassword: password,
      }),
    });
  };

  if (!userDoc) return <Loading />;

  const isLatam = userDoc.latam;

  return (
    <div className="mt-5 px-0 py-5 w-full xl:w-3/5 mx-auto 2xl:w-1/3">
      {rerender && <span className="hidden"></span>}
      <h1 className="font-medium text-xl">
        {isLatam ? "Su cuenta" : "Sua conta"}
      </h1>
      <p className="text-muted-foreground font-light text-md text-left">
        {isLatam
          ? "Cambie los datos de su cuenta"
          : "Altere os dados da sua conta"}
      </p>

      <Card className="mt-2.5 w-full">
        <CardContent>
          <p className="mt-5 text-muted-foreground mb-1.5">
            {isLatam ? "Nombre completo" : "Nome completo"}
          </p>
          <Input disabled value={user.displayName} readOnly type="text" />
          <p className="mt-5 text-muted-foreground mb-1.5">
            {isLatam ? "Correo electrónico" : "E-mail"}
          </p>
          <Input disabled value={user.email} readOnly type="email" />
          <div className="flex gap-5">
            <div>
              <p className="mt-5 text-muted-foreground mb-1.5">
                {isLatam ? "Nivel de riesgo" : "Nível de risco"}
              </p>
              <RiskToggle />
            </div>
            <div>
              <p className="mt-5 text-muted-foreground mb-1.5">
                Tema (claro/{isLatam ? "oscuro" : "escuro"})
              </p>
              <ModeToggle />
            </div>
          </div>

          {isEmailProvider && (
            <form onSubmit={changePassword}>
              <p className="mt-5 text-muted-foreground mb-1.5">
                {isLatam ? "Contraseña actual" : "Senha atual"}
              </p>
              <Input
                autoComplete="current-password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                type="password"
              />
              <p className="mt-1.5 text-muted-foreground mb-1.5">
                {isLatam ? "Nueva contraseña" : "Nova senha"}
              </p>
              <Input
                autoComplete="new-password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setMessage("");
                }}
                type="password"
              />
              <p className="mt-1.5 text-muted-foreground mb-1.5">
                {isLatam ? "Confirme la contraseña" : "Confirme a senha"}
              </p>
              <Input
                autoComplete="new-password"
                value={passwordConfirmation}
                onChange={(e) => {
                  setPasswordConfirmation(e.target.value);
                  setMessage("");
                }}
                type="password"
              />
              {message && (
                <p className="text-sm mt-1.5 text-red-500">{message}</p>
              )}
              <Button className="mt-2.5" type="submit">
                {isLatam ? "Cambiar la contraseña" : "Alterar a senha"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
