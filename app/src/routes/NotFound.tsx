import "../assets/404.less";
import { Button } from "../components/ui/button.tsx";
import { HelpCircle } from "lucide-react";
import router from "../router.ts";
import { useTranslation } from "react-i18next";

function NotFound() {
  const { t } = useTranslation();

  return (
    <div className={`error-page`}>
      <HelpCircle className={`icon`} />
      <h1>404</h1>
      <p>{t("not-found")}</p>
      <Button onClick={() => router.navigate("/")}>{t("home")}</Button>
    </div>
  );
}

export default NotFound;
