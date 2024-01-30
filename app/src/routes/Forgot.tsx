import { useTranslation } from "react-i18next";
import { useToast } from "@/components/ui/use-toast.ts";
import { useReducer } from "react";
import { formReducer, isEmailValid, isTextInRange } from "@/utils/form.ts";
import { doReset, ResetForm, sendCode } from "@/api/auth.ts";
import router from "@/router.tsx";
import { Card, CardContent } from "@/components/ui/card.tsx";
import { Label } from "@/components/ui/label.tsx";
import Require, {
  EmailRequire,
  LengthRangeRequired,
  SameRequired,
} from "@/components/Require.tsx";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input.tsx";
import { Button } from "@/components/ui/button.tsx";
import TickButton from "@/components/TickButton.tsx";
import { appLogo } from "@/conf/env.ts";
import { useSelector } from "react-redux";
import { infoMailSelector } from "@/store/info.ts";
import { AlertCircle } from "lucide-react";

function Forgot() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const enabled = useSelector(infoMailSelector);

  const [form, dispatch] = useReducer(formReducer<ResetForm>(), {
    email: "",
    code: "",
    password: "",
    repassword: "",
  });

  const onVerify = async () => await sendCode(t, toast, form.email);

  const onSubmit = async () => {
    if (
      !isEmailValid(form.email) ||
      !form.code.length ||
      !isTextInRange(form.password, 6, 36) ||
      form.password.trim() !== form.repassword.trim()
    )
      return;

    const res = await doReset(form);
    if (!res.status) {
      toast({
        title: t("error"),
        description: res.error,
      });
      return;
    }

    toast({
      title: t("auth.reset-success"),
      description: t("auth.reset-success-prompt"),
    });

    sessionStorage.setItem("username", form.email);
    sessionStorage.setItem("password", form.password);
    await router.navigate("/login");
  };

  return (
    <div className={`auth-container`}>
      <img className={`logo`} src={appLogo} alt="" />
      <div className={`title`}>{t("auth.reset-password")}</div>
      <Card className={`auth-card`}>
        <CardContent className={`pb-0`}>
          <div className={`auth-wrapper`}>
            {!enabled && (
              <Alert className={`p-4`}>
                <AlertCircle className={`h-4 w-4`} />
                <AlertDescription>{t("auth.disabled-mail")}</AlertDescription>
              </Alert>
            )}
            <Label>
              <Require />
              {t("auth.email")}
              <EmailRequire content={form.email} hideOnEmpty={true} />
            </Label>
            <Input
              placeholder={t("auth.email-placeholder")}
              value={form.email}
              onChange={(e) =>
                dispatch({
                  type: "update:email",
                  payload: e.target.value,
                })
              }
            />

            <Label>
              <Require /> {t("auth.code")}
            </Label>

            <div className={`flex flex-row`}>
              <Input
                placeholder={t("auth.code-placeholder")}
                value={form.code}
                onChange={(e) =>
                  dispatch({
                    type: "update:code",
                    payload: e.target.value,
                  })
                }
              />
              <TickButton
                className={`ml-2 whitespace-nowrap`}
                loading={true}
                onClick={onVerify}
                tick={60}
                disabled={!enabled}
              >
                {t("auth.send-code")}
              </TickButton>
            </div>

            <Label>
              <Require />
              {t("auth.password")}
              <LengthRangeRequired
                content={form.password}
                min={6}
                max={36}
                hideOnEmpty={true}
              />
            </Label>
            <Input
              placeholder={t("auth.password-placeholder")}
              value={form.password}
              type={"password"}
              onChange={(e) =>
                dispatch({ type: "update:password", payload: e.target.value })
              }
            />

            <Label>
              <Require />
              {t("auth.check-password")}
              <SameRequired
                content={form.password}
                compare={form.repassword}
                hideOnEmpty={true}
              />
            </Label>
            <Input
              placeholder={t("auth.check-password-placeholder")}
              value={form.repassword}
              type={"password"}
              onChange={(e) =>
                dispatch({
                  type: "update:repassword",
                  payload: e.target.value,
                })
              }
            />

            <Button
              disabled={!enabled}
              onClick={onSubmit}
              className={`mt-2`}
              loading={true}
            >
              {t("reset")}
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
