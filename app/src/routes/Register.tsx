import { Card, CardContent } from "@/components/ui/card.tsx";
import { Label } from "@/components/ui/label.tsx";
import Require, {
  EmailRequire,
  LengthRangeRequired,
  SameRequired,
} from "@/components/Require.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Button } from "@/components/ui/button.tsx";
import router from "@/router.tsx";
import { useTranslation } from "react-i18next";
import { formReducer, isEmailValid, isTextInRange } from "@/utils/form.ts";
import React, { useReducer, useState } from "react";
import { doRegister, doVerify, RegisterForm } from "@/api/auth.ts";
import { useToast } from "@/components/ui/use-toast.ts";
import TickButton from "@/components/TickButton.tsx";

type CompProps = {
  form: RegisterForm;
  dispatch: React.Dispatch<any>;
  next: boolean;
  setNext: (next: boolean) => void;
};

function Preflight({ form, dispatch, setNext }: CompProps) {
  const { t } = useTranslation();

  const onSubmit = () => {
    if (
      !isTextInRange(form.username, 2, 24) ||
      !isTextInRange(form.password, 6, 36) ||
      form.password.trim() !== form.repassword.trim()
    )
      return;

    setNext(true);
  };

  return (
    <div className={`auth-wrapper`}>
      <Label>
        <Require />
        {t("auth.username")}
        <LengthRangeRequired
          content={form.username}
          min={2}
          max={24}
          hideOnEmpty={true}
        />
      </Label>
      <Input
        placeholder={t("auth.username-placeholder")}
        value={form.username}
        onChange={(e) =>
          dispatch({
            type: "update:username",
            payload: e.target.value,
          })
        }
      />

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
        onChange={(e) =>
          dispatch({
            type: "update:password",
            payload: e.target.value,
          })
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
        onChange={(e) =>
          dispatch({
            type: "update:repassword",
            payload: e.target.value,
          })
        }
      />

      <Button className={`mt-2`} onClick={onSubmit}>
        {t("auth.next-step")}
      </Button>
    </div>
  );
}

function doFormat(form: RegisterForm): RegisterForm {
  return {
    ...form,
    username: form.username.trim(),
    password: form.password.trim(),
    repassword: form.repassword.trim(),
    email: form.email.trim(),
    code: form.code.trim(),
  };
}

function Verify({ form, dispatch, setNext }: CompProps) {
  const { t } = useTranslation();
  const { toast } = useToast();

  const onSubmit = async () => {
    const data = doFormat(form);

    if (!isEmailValid(data.email) || !data.code.trim().length) return;

    const res = await doRegister(data);
    if (!res.status) {
      toast({
        title: t("error"),
        description: res.error,
      });
      return;
    }
  };

  const onVerify = async () => {
    if (form.email.trim().length === 0 || !isEmailValid(form.email))
      return false;

    const res = await doVerify(form.email);
    if (!res.status) {
      toast({
        title: t("error"),
        description: res.error,
      });
      return false;
    }

    return true;
  };

  return (
    <div className={`auth-wrapper`}>
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
        >
          {t("auth.send-code")}
        </TickButton>
      </div>

      <Button className={`mt-2`} loading={true} onClick={onSubmit}>
        {t("register")}
      </Button>

      <div className={`mt-1 translate-y-1 text-center text-sm`}>
        {t("auth.incorrect-info")}
        <a
          className={`underline underline-offset-4 cursor-pointer`}
          onClick={() => setNext(false)}
        >
          {t("auth.fall-back")}
        </a>
      </div>
    </div>
  );
}

function Register() {
  const { t } = useTranslation();
  const [next, setNext] = useState(false);
  const [form, dispatch] = useReducer(formReducer<RegisterForm>(), {
    username: "",
    password: "",
    repassword: "",
    email: "",
    code: "",
  });

  return (
    <div className={`auth-container`}>
      <img className={`logo`} src="/favicon.ico" alt="" />
      <div className={`title`}>{t("register")} Chat Nio</div>
      <Card className={`auth-card`}>
        <CardContent className={`pb-0`}>
          {!next ? (
            <Preflight
              form={form}
              dispatch={dispatch}
              next={next}
              setNext={setNext}
            />
          ) : (
            <Verify
              form={form}
              dispatch={dispatch}
              next={next}
              setNext={setNext}
            />
          )}
        </CardContent>
      </Card>
      <div className={`auth-card addition-wrapper`}>
        <div className={`row`}>
          {t("auth.have-account")}
          <a className={`link`} onClick={() => router.navigate("/login")}>
            {t("auth.login")}
          </a>
        </div>
        <div className={`row`}>
          {t("auth.forgot-password")}
          <a className={`link`} onClick={() => router.navigate("/forgot")}>
            {t("auth.reset-password")}
          </a>
        </div>
      </div>
    </div>
  );
}

export default Register;
