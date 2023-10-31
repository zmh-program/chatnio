import { useToast } from "@/components/ui/use-toast.ts";
import { useLocation } from "react-router-dom";
import { ToastAction } from "@/components/ui/toast.tsx";
import { login, tokenField } from "@/conf.ts";
import { useEffect } from "react";
import Loader from "@/components/Loader.tsx";
import "@/assets/pages/auth.less";
import axios from "axios";
import { validateToken } from "@/store/auth.ts";
import { useDispatch } from "react-redux";
import router from "@/router.tsx";
import { useTranslation } from "react-i18next";
import { getQueryParam } from "@/utils/path.ts";
import { setMemory } from "@/utils/memory.ts";

function Auth() {
  const { toast } = useToast();
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const token = getQueryParam("token").trim();

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

    setMemory(tokenField, token);
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
