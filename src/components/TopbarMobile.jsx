import { HamburgerMenuIcon, PersonIcon, BellIcon } from "@radix-ui/react-icons";
import React, { useState } from "react";
import { getToken } from "firebase/messaging";
import { messaging } from "@/firebase/config";
import { useAuthContext } from "@/hooks/useAuthContext";
import { useUserContext } from "@/hooks/useUserContext";
import Loading from "./Loading";
import { useDocument } from "@/hooks/useDocument";
import useIsPWA from "@/hooks/useIsPWA";
import Logo from "./Logo";

export default function TopbarMobile({ setRerender }) {
  const { userDoc } = useUserContext();
  const isPwa = useIsPWA();
  const [open, setOpen] = useState(false);
  const { user } = useAuthContext();

  const { document: tokenDoc } = useDocument("tokens", user.uid);

  if (!userDoc) return <Loading />;

  async function requestPermission() {
    //requesting permission using Notification API
    const permission = await Notification.requestPermission();

    let authToken;
    try {
      authToken = await user.getIdToken(true);
    } catch (errToken) {
      alert("Erro ao obter token de autenticação.");
    }

    if (permission === "granted") {
      const token = await getToken(messaging, {
        vapidKey:
          "BJaZkU7IEQWsEg9YpG_cryhAbGCyc8btkFIPaKKoeZ-QXNHP9ZYfI5-1uaeeDyfXqzzF-f6jAwtTbTb78bvAu2k",
      });

      //We can send token to server
      console.log("Token generated : ", token);
      await fetch("https://suaapi.com/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + authToken,
        },
        body: JSON.stringify({
          token: token,
        }),
      });
    } else if (permission === "denied") {
      //notifications are blocked
      alert("Você recusou a permissão para notificações.");
    }
  }

  if (!userDoc) return <Loading />;

  return (
    <div className="fixed w-full bg-muted border border-border h-16 flex justify-between items-center">
      <div className="w-full flex justify-center">
        <Logo />
      </div>
    </div>
  );
}
