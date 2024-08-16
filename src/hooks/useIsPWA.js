import { useState, useEffect } from "react";

const useIsPWA = () => {
  const [isPWA, setIsPWA] = useState(false);

  useEffect(() => {
    const checkPWA = () => {
      // Verifica se está rodando como PWA
      const isStandaloneMode = window.matchMedia(
        "(display-mode: standalone)"
      ).matches;
      const isStandaloneIOS = window.navigator.standalone;

      setIsPWA(isStandaloneMode || isStandaloneIOS);
    };

    checkPWA();

    window.addEventListener("resize", checkPWA);
    return () => window.removeEventListener("resize", checkPWA);
  }, []);

  return isPWA;
};

export default useIsPWA;
