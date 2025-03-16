import {
  AlignJustifyIcon,
  BookOpenIcon,
  BrainCogIcon,
  HomeIcon,
  MessagesSquareIcon,
  PawPrintIcon,
  PictureInPicture2Icon,
  SyringeIcon,
} from "lucide-react";

export const routeOptions = [
  {
    route: "/",
    name: "Início",
    icon: <HomeIcon className="h-6 sm:h-5" />,
  },
  {
    route: "/adestramento",
    name: "Adestramento",
    // badge: "🔥 hot",
    // miniBadge: "🔥",
    icon: <PawPrintIcon className="h-6 sm:h-5" />,
  },
  {
    route: "/diario",
    name: "Diário",
    icon: <BookOpenIcon className="h-6 sm:h-5" />,
  },
  {
    route: "/vacinas",
    name: "Vacinas",
    icon: <SyringeIcon className="h-6 sm:h-5" />,
  },
  {
    route: "/mais",
    name: "Mais",
    icon: <AlignJustifyIcon className="h-6 sm:h-5" />,
  },
];
