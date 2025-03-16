import { useUserContext } from "@/hooks/useUserContext";
import {
  BadgePercentIcon,
  HandCoinsIcon,
  LockIcon,
  PiggyBankIcon,
} from "lucide-react";
import React from "react";

export default function Content() {
  const { userDoc } = useUserContext();
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
  return (
    <div>
      <h1 className="text-xl font-semibold">Conteúdo</h1>
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
          </div>
        ))}
      </div>
    </div>
  );
}
