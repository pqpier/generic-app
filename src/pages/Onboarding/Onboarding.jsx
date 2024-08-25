import React from "react";
import Step0 from "./Step0";
import Step1 from "./Step1";
import Step2 from "./Step2";
import Step3 from "./Step3";
import Step4 from "./Step4";

export default function Onboarding({ userDoc, onboarding }) {
  if (userDoc.onboarding === 0 || onboarding === 0) {
    return <Step0 />;
  }

  if (userDoc.onboarding === 1) {
    return <Step1 />;
  }

  if (userDoc.onboarding === 2) {
    return <Step2 />;
  }

  if (userDoc.onboarding === 3) {
    return <Step3 />;
  }

  if (userDoc.onboarding === 4) {
    return <Step4 />;
  }

  return (
    <div className="flex items-center justify-center h-screen">
      <h4 className="text-xl text-red-400">Erro XKKD. Contate o suporte.</h4>
    </div>
  );
}
