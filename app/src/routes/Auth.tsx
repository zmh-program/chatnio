import { useToast } from "@/components/ui/use-toast.ts";
import { useLocation } from "react-router-dom";
import { ToastAction } from "@/components/ui/toast.tsx";
import { login } from "@/conf.ts";
import { useEffect } from "react";
import Loader from "@/components/Loader.tsx";
import "@/assets/auth.less";
import axios from "axios";
import { validateToken } from "@/store/auth.ts";
import { useDispatch } from "react-redux";
import router from "@/router.tsx";
import { useTranslation } from "react-i18next";

function Auth() {
  const { toast } = useToast();
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const search = new URLSearchParams(useLocation().search);
  const token = (search.get("token") || "").trim();

  useEffect(() => {
    if (!token.length) {
      toast({
        title: t("invalid-token"),
        description: t("invalid-token-prompt"),
        action: (
          <ToastAction altText={t("try-again")} onClick={login}>
            {t("try-again")}
          </ToastAction>
        ),
      });

      setTimeout(login, 2500);
      return;
    }

    axios
      .post("/login", { token })
      .then((res) => {
        const data = res.data;
        if (!data.status) {
          toast({
            title: t("login-failed"),
            description: t("login-failed-prompt"),
            action: (
              <ToastAction altText={t("try-again")} onClick={login}>
                {t("try-again")}
              </ToastAction>
            ),
          });
        } else
          validateToken(dispatch, data.token, () => {
            toast({
              title: t("login-success"),
              description: t("login-success-prompt"),
            });

            router.navigate("/");
          });
      })
      .catch((err) => {
        console.debug(err);
        toast({
          title: t("server-error"),
          description: t("server-error-prompt"),
          action: (
            <ToastAction altText={t("try-again")} onClick={login}>
              {t("try-again")}
            </ToastAction>
          ),
        });
      });
  }, []);

  return (
    <div className={`auth`}>
      <Loader prompt={t("login")} />
    </div>
  );
}

export default Auth;
