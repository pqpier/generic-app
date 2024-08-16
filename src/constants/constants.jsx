import {
  ChatBubbleIcon,
  LockClosedIcon,
  PlayIcon,
  RocketIcon,
  SketchLogoIcon,
} from "@radix-ui/react-icons";

export const routeOptions = [
  {
    route: "/oportunidades",
    name: "Oportunidades",
    icon: <RocketIcon />,
  },
  {
    route: "/treinamento",
    name: "Assistir treinamento",
    icon: <PlayIcon />,
  },
  {
    route: "https://chat.whatsapp.com/Fg2audUTMNaFwtEsmwlPTa",
    name: "Comunidade WhatsApp",
    icon: <ChatBubbleIcon />,
    external: true,
  },
  {
    route: "/indique",
    name: "Indique e ganhe",
    icon: <SketchLogoIcon />,
  },
];
