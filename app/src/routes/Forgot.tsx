import { useTranslation } from "react-i18next";
import { useToast } from "@/components/ui/use-toast.ts";
import { useDispatch } from "react-redux";
import { useReducer } from "react";
import { formReducer } from "@/utils/form.ts";
import { doLogin, LoginForm, ResetForm } from "@/api/auth.ts";
import { validateToken } from "@/store/auth.ts";
import router from "@/router.tsx";
import { getErrorMessage } from "@/utils/base.ts";
import { Card, CardContent } from "@/components/ui/card.tsx";
import { Label } from "@/components/ui/label.tsx";
import Require from "@/components/Require.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Button } from "@/components/ui/button.tsx";

function Forgot() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const globalDispatch = useDispatch();
  const [form, dispatch] = useReducer(formReducer<ResetForm>(), {
    email: "",
    code: "",
    password: "",
    repassword: "",
  });

  const onSubmit = async () => {
    if (!form.username.trim().length || !form.password.trim().length) return;

    try {
      const resp = await doLogin(form);
      if (!resp.status) {
        toast({
          title: t("login-failed"),
          description: t("login-failed-prompt", { reason: resp.error }),
        });
        return;
      }

      toast({
        title: t("login-success"),
        description: t("login-success-prompt"),
      });

      validateToken(globalDispatch, resp.token);
      await router.navigate("/");
    } catch (err) {
      console.debug(err);
      toast({
        title: t("server-error"),
        description: `${t("server-error-prompt")}\n${getErrorMessage(err)}`,
      });
    }
  };

  return (
    <div className={`auth-container`}>
      <img className={`logo`} src="/favicon.ico" alt="" />
      <div className={`title`}>{t("auth.reset-password")}</div>
      <Card className={`auth-card`}>
        <CardContent className={`pb-0`}>
          <div className={`auth-wrapper`}>
            <Label>
              <Require /> {t("auth.username-or-email")}
            </Label>
            <Input
              placeholder={t("auth.username-or-email-placeholder")}
              value={form.username}
              onChange={(e) =>
                dispatch({ type: "update:username", payload: e.target.value })
              }
            />

            <Label>
              <Require /> {t("auth.password")}
            </Label>
            <Input
              placeholder={t("auth.password-placeholder")}
              value={form.password}
              onChange={(e) =>
                dispatch({ type: "update:password", payload: e.target.value })
              }
            />

            <Button onClick={onSubmit} className={`mt-2`} loading={true}>
              {t("login")}
            </Button>
          </div>
        </CardContent>
      </Card>
      <div className={`auth-card addition-wrapper`}>
        <div className={`row`}>
          {t("auth.no-account")}
          <a className={`link`} onClick={() => router.navigate("/register")}>
            {t("auth.register")}
          </a>
        </div>
        <div className={`row`}>
          {t("auth.have-account")}
          <a className={`link`} onClick={() => router.navigate("/login")}>
            {t("auth.login")}
          </a>
        </div>
      </div>
    </div>
  );
}

export default Forgot;
