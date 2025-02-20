import "./App.css";
import Sidebar from "./components/Sidebar";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login/Login";
import { ThemeProvider } from "./providers/ThemeProvider";
import { useAuthContext } from "./hooks/useAuthContext";
import Loading from "./components/Loading";
import Profile from "./pages/Profile/Profile";
import { useEffect, useRef, useState } from "react";
import { Toaster } from "@/shadcn/components/ui/toaster";
import { UserDocProvider } from "./contexts/UserDocContext";
import useMediaQuery from "./hooks/useMediaQuery";
import Topbar from "./components/Topbar";
import PasswordRecovery from "./pages/Recover/Recover";
import Help from "./pages/Help/Help";
import Training from "./pages/Training/Training";
import { ReferrerDocProvider } from "./contexts/ReferrerDocContext";
import { db } from "./firebase/config";
import { doc, onSnapshot } from "firebase/firestore";
import Dashboard from "./pages/Dashboard/Dashboard";
import TopbarMobile from "./components/TopbarMobile";
import BottomBar from "./components/BottomBar";
import Content from "./pages/Content/Content";

function AppRoutes() {
  const { user, authIsReady } = useAuthContext();
  const [rerender, setRerender] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [isWatching, setIsWatching] = useState(false);
  const [redirectToRoute, setRedirectToRoute] = useState(null);
  const [userDoc, setUserDoc] = useState(null);
  const [error, setError] = useState(null);
  const isMobile = useMediaQuery("(max-width: 640px)");
  const scrollToTop = useRef(null);

  if (!authIsReady) {
    console.log("Not auth is ready");
    return <Loading />;
  }

  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <div
        ref={scrollToTop}
        className="App flex flex-col sm:flex-row bg-background "
      >
        <Toaster />
        <BrowserRouter>
          {user ? (
            <UserDocProvider user={user}>
              <ReferrerDocProvider user={user}>
                {isMobile ? (
                  <TopbarMobile setRerender={setRerender} />
                ) : (
                  <Topbar setRerender={setRerender} />
                )}
                {isMobile ? null : (
                  <div
                    className={`${
                      sidebarExpanded ? "w-[284px]" : "w-[90px]"
                    } w-[286px] h-[calc(100vh_-_120px)] fixed top-24 left-5 bottom-5 overflow-y-hidden border rounded-md`}
                  >
                    <Sidebar
                      rerender={rerender}
                      setRerender={setRerender}
                      sidebarExpanded={sidebarExpanded}
                      setSidebarExpanded={setSidebarExpanded}
                      isWatching={isWatching}
                      setIsWatching={setIsWatching}
                    />
                  </div>
                )}
                <div className="sm:w-[calc(100%_-_300px)] sm:ml-[310px] mt-[80px] px-2.5 sm:px-5 sm:mt-[112px]">
                  <Routes>
                    <Route exact path="/" element={<Dashboard />} />
                    <Route path="/content" element={<Content />} />
                    <Route
                      path="/conta"
                      element={
                        <Profile
                          rerender={rerender}
                          setRerender={setRerender}
                        />
                      }
                    />
                    <Route path="/help" element={<Help />} />
                    <Route path="*" element={<Dashboard />} />
                  </Routes>
                </div>
                {isMobile ? (
                  <div className="h-16 fixed bottom-0 left-0">
                    <BottomBar />
                  </div>
                ) : null}
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
