import { Button } from "@/shadcn/components/ui/button";
import {
  InfoCircledIcon,
  PersonIcon,
  ExitIcon,
  BellIcon,
} from "@radix-ui/react-icons";
import { useNavigate } from "react-router-dom";
import { useLogout } from "@/hooks/useLogout";
import Logo from "./Logo";
import { Separator } from "@/shadcn/components/ui/separator";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shadcn/components/ui/avatar";
import { useAuthContext } from "@/hooks/useAuthContext";
import getInitials from "@/utils/getInitials";
import Loading from "./Loading";
import { useState } from "react";
import { ProfilePicDialog } from "./ProfilePicDialog";
import { routeOptions } from "@/constants/constants.jsx";
import { useUserContext } from "@/hooks/useUserContext";
import { getToken } from "firebase/messaging";
import { messaging } from "@/firebase/config";
import { useDocument } from "@/hooks/useDocument";

export default function Sidebar({ rerender, setRerender }) {
  const navigate = useNavigate();
  const { logout, isPending } = useLogout();
  const { user } = useAuthContext();
  const { userDoc } = useUserContext();
  const [activeRoute, setActiveRoute] = useState(0);
  const { document: tokenDoc } = useDocument("tokens", user.uid);

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

  const handleLogout = () => {
    logout();
  };

  if (!userDoc) return <Loading />;

  return (
    <nav className="relative overflow-y-auto min-h-[calc(100vh_-_64px)] hidden sm:flex sm:flex-col sm:justify-between h-full w-[250px] bg-background border border-border">
      {isPending && <Loading />}
      <div className="bg-background fixed h-[calc(100vh_-_96px)] w-[248px] sm:flex-grow sm:flex sm:flex-col sm:justify-between">
        <div>
          <div className="py-5 pl-5">
            <Logo size="sm" />
          </div>
          <div className="flex items-center gap-3 p-5">
            <ProfilePicDialog setRerender={setRerender}>
              <Avatar className="h-12 w-12" role="button">
                <AvatarImage src={user.photoURL?.replace("=s96-c", "")} />
                <AvatarFallback className="bg-primary text-secondary">
                  {getInitials(user.displayName)}
                </AvatarFallback>
              </Avatar>
            </ProfilePicDialog>

            <div>
              <p className="font-medium">{user.displayName}</p>
              <p className="text-muted-foreground/75 text-sm">
                Premium account
              </p>
            </div>
          </div>
          <div
            role="button"
            className={`py-3 px-5 flex items-center gap-3 transition-all duration-300 hover:bg-primary/5 ${
              -1 === activeRoute ? "bg-primary/5 font-medium" : ""
            }`}
            onClick={() => {
              setActiveRoute(-1);
              navigate("/conta");
            }}
          >
            <PersonIcon />
            <p className="text-md">Minha conta</p>
          </div>
          <Separator className="my-2.5" />
          <div className="box-border">
            {routeOptions.map((option, index) => {
              if (option.admin && !userDoc.admin) return null;
              if (
                option.turma &&
                userDoc.turma &&
                option.turma !== userDoc.turma
              ) {
                return null;
              }

              if (option.turma && !userDoc.turma) {
                return null;
              }

              return (
                <div
                  key={option.route}
                  role="button"
                  className={`py-3 px-5 flex items-center gap-3 transition-all duration-300 hover:bg-primary/5  ${
                    index === activeRoute ? "bg-primary/5 font-medium" : ""
                  }`}
                  onClick={() => {
                    setActiveRoute(index);
                    if (option.external) {
                      window.open(option.route, "_blank");
                    } else {
                      navigate(option.route);
                    }
                  }}
                >
                  {option.icon}
                  <p className="text-md">{option.name}</p>
                </div>
              );
            })}

            {/* {!tokenDoc && (
              <div
                role="button"
                className="py-3 px-5 flex items-center gap-3 transition-all duration-300 hover:bg-primary/5"
                onClick={requestPermission}
              >
                <BellIcon />
                <p className="text-md">Ativar notificações</p>
              </div>
            )} */}
          </div>
        </div>
        <div>
          <Separator className="my-3" />
          <div className="flex flex-col py-2.5">
            {/* <Button
              size="noPadding"
              variant="ghost"
              onClick={() => {
                setActiveRoute(3.14);
                navigate("/help");
              }}
              className={`justify-start px-5 py-4 w-full opacity-50 transition-all duration-300 hover:bg-primary/10 ${
                activeRoute === 3.14 ? "bg-primary/10 font-medium" : ""
              }`}
            >
              <InfoCircledIcon className="w-4 h-4 mr-2" />
              Central de Ajuda
            </Button> */}
            <Button
              size="noPadding"
              variant="ghost"
              onClick={handleLogout}
              className="justify-start px-5 py-4 w-full opacity-50 transition-all duration-300 hover:bg-primary/10"
            >
              <ExitIcon className="w-4 h-4 mr-2" />
              Sair da conta
            </Button>
          </div>
        </div>
      </div>
      {rerender && <span className="hidden"></span>}
    </nav>
  );
}
