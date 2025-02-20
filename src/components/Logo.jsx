import LogoDarkPng from "@/assets/logo_dark_theme.png";
import LogoLightPng from "@/assets/logo_light_theme.png";
import { useTheme } from "@/providers/ThemeProvider";
import { useNavigate } from "react-router-dom";

export default function Logo({ size, justify }) {
  const width = size || 190;
  const logoLightTheme =
    "https://media.atomicatpages.net/u/0BVrOWOoOHYYehGtCMVYjXF1KZk1/Pictures/3jvna/YyJdnu8769826.png";
  const logoDarktheme =
    "https://media.atomicatpages.net/u/0B1zizlSngfFNS7TlZ858AKj77o1/Pictures/BautmI9164143.png";
  const { theme } = useTheme();

  const navigate = useNavigate();

  const navigateToHome = () => navigate("/");

  return (
    <div role="button" onClick={navigateToHome}>
      <img
        src={theme === "dark" ? logoDarktheme : logoLightTheme}
        style={{ width: width }}
        alt=""
      />
    </div>
  );
}
