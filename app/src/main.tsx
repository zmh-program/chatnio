import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./conf";
import "./i18n.ts";
import "./assets/main.less";
import "./assets/globals.less";
import "./conf";
import ReloadPrompt from "./components/ReloadService.tsx";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <>
    <ReloadPrompt />
    <App />
  </>,
);
