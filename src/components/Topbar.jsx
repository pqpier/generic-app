import { HamburgerMenuIcon, PersonIcon, BellIcon } from "@radix-ui/react-icons";
import React, { useState } from "react";
import { getToken } from "firebase/messaging";
import { messaging } from "@/firebase/config";
import { ProfilePicDialog } from "./ProfilePicDialog";
import getInitials from "@/utils/getInitials";
import { useAuthContext } from "@/hooks/useAuthContext";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shadcn/components/ui/avatar";
import { routeOptions } from "@/constants/constants.jsx";
import { useLogout } from "@/hooks/useLogout";
import { useNavigate } from "react-router-dom";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/shadcn/components/ui/sheet";
import { Separator } from "@/shadcn/components/ui/separator";
import { useUserContext } from "@/hooks/useUserContext";
import Loading from "./Loading";
import { useDocument } from "@/hooks/useDocument";
import useIsPWA from "@/hooks/useIsPWA";

export default function Topbar({ setRerender }) {
  const { userDoc } = useUserContext();
  const isPwa = useIsPWA();
  const [open, setOpen] = useState(false);
  const { user } = useAuthContext();
  const { logout } = useLogout();
  const navigate = useNavigate();
  const [hideAdmin, setHideAdmin] = useState(false);

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
      await fetch("https://api.solydapp.com/v1/save-token", {
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

  return (
    <div className="fixed w-full bg-muted border border-border h-16 flex justify-between items-center px-5">
      {/* <Logo size="sm" justify="justify-center" /> */}
      <img
        className="w-20"
        src="https://media.atomicatpages.com/u/0BVrOWOoOHYYehGtCMVYjXF1KZk1/Pictures/qoKsbk4432782.png"
      />
      <div className="flex gap-2.5">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger>
            <HamburgerMenuIcon className="h-8 w-8" />
          </SheetTrigger>
          <SheetContent>
            <div className="flex items-center gap-2.5">
              <ProfilePicDialog setRerender={setRerender}>
                <Avatar className="h-10 w-10" role="button">
                  <AvatarImage src={user.photoURL?.replace("=s96-c", "")} />
                  <AvatarFallback className="bg-primary text-secondary text-sm">
                    {getInitials(user.displayName)}
                  </AvatarFallback>
                </Avatar>
              </ProfilePicDialog>
              <div
                onClick={() => {
                  navigate("/account");
                  setOpen(false);
                }}
              >
                <p className="text-sm font-medium">{user.displayName}</p>
                <p className="text-muted-foreground/75 text-xs">
                  Premium account
                </p>
              </div>
            </div>
            <Separator className="opacity-50 my-5" />
            <div className="flex flex-col gap-5">
              {routeOptions.map((option) => {
                if (option.admin && (!userDoc.admin || hideAdmin)) return null;
                if (option.turma && option.turma !== userDoc.turma) return null;

                return (
                  <div
                    className="flex gap-3 items-center"
                    key={option.route}
                    onClick={() => {
                      if (option.external) {
                        if (user.uid === "h1SKqzfs39X7UAgPlkDrnXbRrhy2") {
                          setHideAdmin(true);
                          return;
                        }
                        window.open(option.route, "_blank");
                      } else {
                        navigate(option.route);
                      }
                      setOpen(false);
                    }}
                  >
                    {option.icon}
                    <p>{option.name}</p>
                  </div>
                );
              })}
              <div
                className="flex gap-3 items-center"
                onClick={() => {
                  navigate("/account");
                  setOpen(false);
                }}
              >
                <PersonIcon />
                <p>Minha conta</p>
              </div>
              {!tokenDoc && isPwa && (
                <div
                  className="flex gap-3 items-center"
                  onClick={requestPermission}
                >
                  <BellIcon />
                  <p>Ativar notificações</p>
                </div>
              )}
            </div>
            <Separator className="opacity-50 my-5" />
            <p onClick={logout}>Sair</p>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}
