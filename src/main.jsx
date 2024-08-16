import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { AuthContextProvider } from "./contexts/AuthContext";
import { registerSW } from "virtual:pwa-register";

// import { Toaster } from "@/shadcn/components/ui/toaster";

// if ("serviceWorker" in navigator) {
//   navigator.serviceWorker
//     .register("/firebase-messaging-sw.js")
//     .then(function (registration) {
//       console.log("Service Worker registrado com sucesso:", registration);

//       // Solicitar permissões de notificação e obter o token
//       Notification.requestPermission().then((permission) => {
//         console.log("Requested permission ", permission);
//         if (permission === "granted") {
//           console.log("Permission granted.");
//           // Obtém o token FCM
//           getToken(messaging, {
//             vapidKey:
//               "BJaZkU7IEQWsEg9YpG_cryhAbGCyc8btkFIPaKKoeZ-QXNHP9ZYfI5-1uaeeDyfXqzzF-f6jAwtTbTb78bvAu2k",
//           })
//             .then((currentToken) => {
//               if (currentToken) {
//                 console.log(currentToken);
//                 updateToken(currentToken);
//                 console.log("Token de inscrição:", currentToken);
//                 // Envie o token para o servidor e salve-o para enviar notificações push
//               } else {
//                 console.log("Não foi possível obter o token.");
//               }
//             })
//             .catch((err) => {
//               console.log("Erro ao obter o token:", err);
//             });
//         }
//       });
//     })
//     .catch(function (err) {
//       console.log("Falha ao registrar o Service Worker:", err);
//     });
// }

registerSW({ immediate: true });

ReactDOM.createRoot(document.getElementById("root")).render(
  <AuthContextProvider>
    <App />
    {/* <Toaster /> */}
  </AuthContextProvider>
);
