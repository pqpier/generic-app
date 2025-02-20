import Loading from "@/components/Loading";
import { useUserContext } from "@/hooks/useUserContext";
import {
  BadgePercentIcon,
  BrainCogIcon,
  FlameIcon,
  HandCoinsIcon,
  LockIcon,
  MapPin,
  MapPinIcon,
  PictureInPicture2Icon,
  PiggyBankIcon,
} from "lucide-react";
import React from "react";
import { useNavigate } from "react-router-dom";
import useMediaQuery from "@/hooks/useMediaQuery";
import { useAuthContext } from "@/hooks/useAuthContext";
import Subscriptions from "../Subscriptions/Subscriptions";

export default function Dashboard() {
  const { user } = useAuthContext();
  const { userDoc } = useUserContext();
  const isWideScreen = useMediaQuery("(min-width: 1920px)");
  const navigate = useNavigate();

  const options = [
    {
      name: "Comece aqui",
      icon: (
        <MapPinIcon className="h-6 w-6 sm:w-8 sm:h-8 shrink-0 text-brand" />
      ),
      description:
        "lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    },
  ];
  const options2 = [
    {
      name: "Name 1",
      icon: (
        <HandCoinsIcon className="h-6 w-6 sm:w-8 sm:h-8 shrink-0 text-brand" />
      ),
      description:
        "lorem Ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    },
    {
      name: "Name 2",
      icon: (
        <BadgePercentIcon className="h-6 w-6 sm:w-8 sm:h-8 shrink-0 text-brand" />
      ),
      description:
        "lorem Ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    },
    {
      name: "Name 3",
      icon: (
        <PiggyBankIcon className="h-6 w-6 sm:w-8 sm:h-8 shrink-0 text-brand" />
      ),
      description:
        "lorem Ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    },
  ];

  if (!userDoc) return <Loading />;
  if (userDoc.plan.status !== "active") return <Subscriptions />;

  return (
    <div className="h-[200vh] py-2.5 px-2.5 sm:px-0 lg:w-1/2">
      <div className="flex gap-3 items-center">
        <MapPinIcon className="text-brand" />
        <h1 className="text-xl font-medium text-black/75">Comece aqui</h1>
      </div>
      <div className="mt-3 sm:mt-5 flex gap-6">
        {options.map((option) => (
          <div
            key={option.name}
            className="flex items-center sm:gap-5 border p-3 sm:p-6 bg-white //xl:w-[45%] rounded-md cursor-pointer"
            onClick={() => navigate("/content")}
          >
            <div className="flex flex-col gap-1.5">
              <p className="text-md font-medium text-brand">{option.name}</p>
              <p className="text-black/75 text-[13px] sm:text-sm">
                {option.description}
              </p>
            </div>
            {option.icon}
          </div>
        ))}
      </div>

      <div className="mt-5 flex gap-3 items-center">
        <PictureInPicture2Icon className="text-brand" />
        <h1 className="text-xl font-medium text-black/75">Conteúdo</h1>
      </div>
      <div className="mt-1">
        <p className="text-xs text-muted-foreground">
          Conclua o módulo "Comece por aqui" para desbloquear o restante do
          conteúdo.
        </p>
      </div>
      <div className="mt-2.5 flex flex-col lg:flex-row gap-2.5 sm:gap-6 flex-wrap">
        {options2.map((option) => (
          <div
            key={option.name}
            className={`${
              userDoc.startHere ? "" : "opacity-50 grayscale"
            } brightness-25 relative flex flex-nowrap items-center gap-2.5 sm:gap-5 border p-3 sm:p-6 bg-white //xl:w-[45%] rounded-md cursor-pointer`}
          >
            <div className="flex flex-col gap-1.5">
              <p className="text-md font-medium text-brand">{option.name}</p>
              <p className="text-black/75 text-sm">{option.description}</p>
            </div>
            {userDoc.startHere ? (
              option.icon
            ) : (
              <LockIcon className="h-6 w-6 sm:w-8 sm:h-8 shrink-0" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
