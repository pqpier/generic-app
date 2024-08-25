import "./App.css";
import Sidebar from "./components/Sidebar";
import Home from "./pages/Home/Home";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login/Login";
import { ThemeProvider } from "./providers/ThemeProvider";
import { useAuthContext } from "./hooks/useAuthContext";
import Loading from "./components/Loading";
import Profile from "./pages/Profile/Profile";
import { useEffect, useState } from "react";
import { Toaster } from "@/shadcn/components/ui/toaster";
import { UserDocProvider } from "./contexts/UserDocContext";
import useMediaQuery from "./hooks/useMediaQuery";
import Topbar from "./components/Topbar";
import PasswordRecovery from "./pages/Recover/Recover";
import Help from "./pages/Help/Help";
import Training from "./pages/Training/Training";
import Refer from "./pages/Refer/Refer";
import { ReferrerDocProvider } from "./contexts/ReferrerDocContext";
import { db } from "./firebase/config";
import { doc, onSnapshot } from "firebase/firestore";
import Onboarding from "./pages/Onboarding/Onboarding";
import Admin from "./pages/Admin/Admin";

function AppRoutes() {
  const { user, authIsReady } = useAuthContext();
  const [rerender, setRerender] = useState(false);
  const [onboarding, setOnboarding] = useState(null);
  const [redirectToRoute, setRedirectToRoute] = useState(null);
  const [userDoc, setUserDoc] = useState(null);
  const [error, setError] = useState(null);
  const isMobile = useMediaQuery("(max-width: 640px)");

  useEffect(() => {
    let unsub = () => {};

    const checkOnboarding = () => {
      unsub = onSnapshot(
        doc(db, "users", user.uid),
        (docSnapshot) => {
          if (docSnapshot.exists()) {
            const userData = { ...docSnapshot.data(), id: docSnapshot.id };
            setUserDoc(userData);
            setError(null);
            setOnboarding(userData.onboarding || 0);
            setRedirectToRoute(
              userData.redirectToRoute || { active: false, path: null }
            );
          } else {
            setError("Dados não encontrados.");
            setUserDoc(undefined);
            setOnboarding(0);
            setRedirectToRoute({ active: false, path: null });
            console.log(
              `Dados não encontrados. Collection: users, ID: ${user.uid}`
            );
          }
        },
        (err) => {
          setError(err.message);
          setUserDoc(undefined);
          setOnboarding(0);
          setRedirectToRoute({ active: false, path: null });
          console.log(
            "Erro ao ler documento da coleção:",
            "users",
            "com ID:",
            user.uid
          );
          alert("Erro ao carregar onboarding.");
        }
      );
    };

    if (authIsReady && user) {
      checkOnboarding();
    }

    return () => unsub();
  }, [authIsReady, user]);

  if (!authIsReady) return <Loading />;

  if (user && (onboarding === null || !userDoc)) return <Loading />;

  if (user && onboarding > -1 && userDoc.new) {
    return (
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <div className="App flex flex-col sm:flex-row">
          <BrowserRouter>
            <Routes>
              <Route
                path="*"
                element={
                  <Onboarding userDoc={userDoc} onboarding={onboarding} />
                }
              />
            </Routes>
          </BrowserRouter>
        </div>
      </ThemeProvider>
    );
  }

  if (user && redirectToRoute.active) {
    return (
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <div className="App flex flex-col sm:flex-row">
          <BrowserRouter>
            <Routes>
              <Route
                path="*"
                element={<Training redirectToRoute={redirectToRoute} />}
              />
            </Routes>
          </BrowserRouter>
        </div>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <div className="App flex flex-col sm:flex-row">
        <Toaster />
        <BrowserRouter>
          {user ? (
            <UserDocProvider user={user}>
              <ReferrerDocProvider user={user}>
                {isMobile ? (
                  <Topbar setRerender={setRerender} />
                ) : (
                  <div className="w-[250px] h-screen fixed top-0 left-0 overflow-y-auto">
                    <Sidebar rerender={rerender} setRerender={setRerender} />
                  </div>
                )}

                <div className="mt-5 px-0 sm:px-0 sm:mt-0 flex-grow sm:ml-[250px]">
                  <Routes>
                    <Route exact path="/" element={<Home />} />
                    <Route path="/treinamento" element={<Training />} />
                    <Route path="/indique" element={<Refer />} />
                    <Route
                      path="/conta"
                      element={
                        <Profile
                          rerender={rerender}
                          setRerender={setRerender}
                        />
                      }
                    />
                    <Route
                      path="/perfil"
                      element={
                        <Onboarding userDoc={userDoc} onboarding={onboarding} />
                      }
                    />
                    <Route path="/help" element={<Help />} />
                    <Route path="*" element={<Home />} />
                  </Routes>
                </div>
              </ReferrerDocProvider>
            </UserDocProvider>
          ) : (
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/password/recovery" element={<PasswordRecovery />} />
              <Route path="*" element={<Login />} />
            </Routes>
          )}
        </BrowserRouter>
      </div>
    </ThemeProvider>
  );
}

export default AppRoutes;
