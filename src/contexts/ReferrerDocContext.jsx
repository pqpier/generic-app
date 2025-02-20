import { createContext } from "react";
import { useDocument } from "@/hooks/useDocument";
import Loading from "@/components/Loading";

export const ReferrerDocContext = createContext();

export function ReferrerDocProvider({ children, user }) {
  // const { document: referrerDoc } = useDocument("referrals", user.uid);
  const { document: referrerDoc2 } = useDocument("referrals2", user.uid);

  if (referrerDoc2 === null) return <Loading />;

  return (
    <ReferrerDocContext.Provider value={{ referrerDoc2 }}>
      {children}
    </ReferrerDocContext.Provider>
  );
}
