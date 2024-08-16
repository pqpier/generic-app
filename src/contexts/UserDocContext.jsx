import { createContext } from "react";
import { useDocument } from "@/hooks/useDocument";
import Loading from "@/components/Loading";

export const UserDocContext = createContext();

export function UserDocProvider({ children, user }) {
  const { document: userDoc } = useDocument("users", user.uid);

  if (!userDoc) return <Loading />;

  return (
    <UserDocContext.Provider value={{ userDoc }}>
      {children}
    </UserDocContext.Provider>
  );
}
