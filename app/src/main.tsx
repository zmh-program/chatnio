import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./conf.ts";
import "./i18n.ts";
import "./assets/main.less";
import "./assets/globals.less";
import "./conf.ts";
import ReloadPrompt from "./components/ReloadService.tsx";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ReloadPrompt />
    <App />
  </React.StrictMode>,
);
