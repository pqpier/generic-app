import React from "react";
import { twMerge } from "tailwind-merge";

export default function Row({ children, className, ...rest }) {
  return (
    <div className={twMerge("flex", className)} {...rest}>
      {children}
    </div>
  );
}
