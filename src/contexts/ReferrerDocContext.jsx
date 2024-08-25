import { createContext } from "react";
import { useDocument } from "@/hooks/useDocument";
import Loading from "@/components/Loading";

export const ReferrerDocContext = createContext();

export function ReferrerDocProvider({ children, user }) {
  const { document: referrerDoc } = useDocument("referrals", user.uid);

  if (!referrerDoc) return <Loading />;

  return (
    <ReferrerDocContext.Provider value={{ referrerDoc }}>
      {children}
    </ReferrerDocContext.Provider>
  );
}
