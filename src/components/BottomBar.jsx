import { routeOptions } from "@/constants/constants";
import { useAuthContext } from "@/hooks/useAuthContext";
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function BottomBar() {
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="fixed w-full bg-muted border border-border h-16 flex justify-between items-center">
      {routeOptions.map(function (option, index) {
        return (
          <div
            key={option.route}
            role="button"
            className={`relative flex flex-col items-center justify-center w-full h-full text-xs font-medium text-center transition-all duration-300 ${
              index === 0 ? "text-primary" : "text-secondary"
            }`}
            onClick={() => {
              if (option.external) {
                window.open(option.route, "_blank");
              } else {
                navigate(option.route);
              }
            }}
          >
            {option.icon}
            {option.badge && (
              <p className="absolute top-1.5 right-5 text-[18px] font-light rounded-sm">
                {option.badge}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
