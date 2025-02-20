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
import { isAfter } from "date-fns";
import { LogOutIcon, UserIcon } from "lucide-react";
import useMediaQuery from "@/hooks/useMediaQuery";

export default function Sidebar({
  rerender,
  setRerender,
  sidebarExpanded,
  setSidebarExpanded,
  isWatching,
  setIsWatching,
}) {
  const navigate = useNavigate();
  const isWideScreen = useMediaQuery("(min-width: 1920px)");
  const { logout, isPending } = useLogout();
  const { user } = useAuthContext();
  const { userDoc } = useUserContext();
  const [activeRoute, setActiveRoute] = useState(0);

  const handleLogout = () => {
    logout();
  };

  if (!userDoc) return <Loading />;

  return (
    <nav
      className={`${
        sidebarExpanded ? "w-[282px]" : "w-[88px]"
      } bg-white transition-all relative overflow-y-auto min-h-[calc(100vh_-_120px)] hidden sm:flex sm:flex-col sm:justify-between h-full border-none`}
    >
      {isPending && <Loading />}
      <div
        className={`${
          sidebarExpanded ? "w-[282px]" : "w-[88px]"
        } fixed h-[calc(100vh_-_120px)] sm:flex-grow sm:flex sm:flex-col sm:justify-between p-5`}
      >
        <div className="flex flex-col gap-3 box-border">
          {routeOptions.map((option, index) => {
            if (option.admin && !userDoc.admin) return null;

            if (option.hidden) return null;

            if (userDoc.name === "Aluno Teste" && option.route === "/maia") {
              return null;
            }

            return (
              <div
                key={option.route}
                role="button"
                className={`${
                  sidebarExpanded ? "w-full py-3 pl-2" : "w-fit p-3"
                } relative flex items-center gap-3 transition-all duration-300 hover:bg-[#dfdfff55] rounded-md  ${
                  index === activeRoute ? "bg-[#dfdfff55] font-medium" : ""
                }`}
                onClick={() => {
                  setActiveRoute(index);
                  if (option.external) {
                    window.open(option.route, "_blank");
                  } else {
                    if (option.route === "/assistir" && !isWideScreen) {
                      if (!isWideScreen) {
                        setSidebarExpanded(false);
                      }
                      setIsWatching(true);
                    } else {
                      setSidebarExpanded(true);
                    }
                    navigate(option.route);
                  }
                }}
              >
                {option.icon}
                {sidebarExpanded && (
                  <p className="text-sm text-black/75 font-normal">
                    {option.name}
                  </p>
                )}
                {option.badge && sidebarExpanded && (
                  <p className="absolute top-0 -right-3 text-[11px] font-light bg-brand text-white px-1 rounded-sm">
                    {option.badge}
                  </p>
                )}
                {option.miniBadge && !sidebarExpanded && (
                  <p className="absolute -top-[2px] right-[3px] text-[15px]">
                    {option.miniBadge}
                  </p>
                )}
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
        <div>
          <Separator className="my-3 opacity-15" />
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
              className={`${
                sidebarExpanded ? "w-full py-3 pl-2" : "w-fit p-3"
              } gap-3 rounded-md justify-start transition-all duration-300 hover:bg-[#dfdfff55] text-black/75 font-normal`}
            >
              <LogOutIcon className="w-5 h-5 text-brand" />
              {sidebarExpanded ? "Sair da conta" : null}
            </Button>
          </div>
        </div>
      </div>
      {rerender && <span className="hidden"></span>}
    </nav>
  );
}
