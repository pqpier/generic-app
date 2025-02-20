import {
  ChatBubbleIcon,
  LockClosedIcon,
  PlayIcon,
  RocketIcon,
  SketchLogoIcon,
} from "@radix-ui/react-icons";
import {
  BrainCogIcon,
  ChartCandlestickIcon,
  GemIcon,
  MessagesSquareIcon,
  PictureInPicture2Icon,
  PlaySquareIcon,
  UserCogIcon,
  WalletIcon,
} from "lucide-react";

export const routeOptions = [
  {
    route: "/",
    name: "Dashboard",
    icon: <PictureInPicture2Icon className="text-brand h-6 sm:h-5" />,
  },
  {
    route: "/rota-1",
    name: "Rota 1",
    badge: "🔥 hot",
    miniBadge: "🔥",
    icon: <BrainCogIcon className="text-brand h-6 sm:h-5" />,
  },
  // {
  //   route: "/learn",
  //   name: "Conteúdo",
  //   icon: <PlaySquareIcon className="text-brand h-6 sm:h-5" />,
  // },
  {
    route: "/rota-2",
    name: "Rota 2",
    icon: <MessagesSquareIcon className="text-brand h-6 sm:h-5" />,
  },
  // {
  //  route: "https://hotmart.com",
  //   name: "Indique e ganhe",
  //   icon: <GemIcon className="text-brand h-6 sm:h-5" />,
  //   external: true,
  // },
];
