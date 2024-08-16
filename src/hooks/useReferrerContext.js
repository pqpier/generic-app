import { useContext } from "react";
import { ReferrerDocContext } from "../contexts/ReferrerDocContext";

export const useReferrerContext = () => {
  const context = useContext(ReferrerDocContext);
  if (!context) {
    throw Error("useReferrerContext must be inside an ReferrerDocContext.");
  }

  return context;
};
