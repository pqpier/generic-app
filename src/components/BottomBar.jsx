import { routeOptions } from "@/constants/constants";
import { useAuthContext } from "@/hooks/useAuthContext";
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function BottomBar({ activeRoute, setActiveRoute }) {
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
            className={`relative flex flex-col gap-1 items-center justify-center w-full h-full text-xs font-medium text-center transition-all duration-300
            ${
              activeRoute === option.route
                ? "text-brand"
                : "text-muted-foreground"
            }
            `}
            onClick={() => {
              setActiveRoute(option.route);
              navigate(option.route);
            }}
          >
            {option.icon}
            {option.badge && (
              <p className="absolute top-1.5 right-5 text-[18px] font-light rounded-sm">
                {option.badge}
              </p>
            )}
            {option.name}
          </div>
        );
      })}
    </div>
  );
}
