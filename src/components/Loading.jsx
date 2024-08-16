import { useTheme } from "@/providers/ThemeProvider";
import "./Loading.css";

export default function Loading() {
  const { theme } = useTheme();

  return (
    <div
      className={`sp sp-circle fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 ${
        theme === "light"
          ? ""
          : "border-4 border-[rgba(255,255,255,0.25)] border-t-4 border-t-[#fff]"
      }`}
    ></div>
  );
}
