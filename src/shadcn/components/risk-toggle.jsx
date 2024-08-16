import {
  Moon,
  RollerCoaster,
  Signal,
  SignalHigh,
  SignalMedium,
  Sun,
} from "lucide-react";

import { Button } from "@/shadcn/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shadcn/components/ui/dropdown-menu";
import { useFirestore } from "@/hooks/useFirestore";
import { useAuthContext } from "@/hooks/useAuthContext";
import { useUserContext } from "@/hooks/useUserContext";
import Spinner from "@/components/Spinner";

export function RiskToggle() {
  const { user } = useAuthContext();
  const { userDoc } = useUserContext();
  const { updateDocument: updateUser } = useFirestore("users");

  const setRisk = async (risk) => {
    await updateUser(user.uid, {
      risk,
    });
  };

  if (!userDoc) return <Spinner />;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          {userDoc.risk === "low" && (
            <SignalMedium className={`h-[1.2rem] w-[1.2rem] transition-all`} />
          )}
          {userDoc.risk === "medium" && (
            <SignalHigh
              className={`absolute h-[1.2rem] w-[1.2rem] transition-all `}
            />
          )}
          {userDoc.risk === "high" && (
            <Signal className="absolute h-[1.2rem] w-[1.2rem] transition-all" />
          )}
          <span className="sr-only">Risco</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setRisk("low")}>
          Baixo
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setRisk("medium")}>
          Médio
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setRisk("high")}>
          Alto
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
