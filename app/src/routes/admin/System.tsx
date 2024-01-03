import { useTranslation } from "react-i18next";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";
import Paragraph, {
  ParagraphDescription,
  ParagraphFooter,
  ParagraphItem,
} from "@/components/Paragraph.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Label } from "@/components/ui/label.tsx";
import { Input } from "@/components/ui/input.tsx";
import { useReducer, useState } from "react";
import { formReducer } from "@/utils/form.ts";
import { NumberInput } from "@/components/ui/number-input.tsx";
import {
  GeneralState,
  getConfig,
  initialSystemState,
  MailState,
  SearchState,
  setConfig,
  SystemProps,
  updateRootPassword,
} from "@/admin/api/system.ts";
import { useEffectAsync } from "@/utils/hook.ts";
import { toastState } from "@/admin/utils.ts";
import { toast, useToast } from "@/components/ui/use-toast.ts";
import { doVerify } from "@/api/auth.ts";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
} from "@/components/ui/dialog.tsx";
import { DialogTitle } from "@radix-ui/react-dialog";
import Require from "@/components/Require.tsx";

type CompProps<T> = {
  data: T;
  dispatch: (action: any) => void;
  onChange: (doToast?: boolean) => Promise<void>;
};

function RootDialog() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [open, setOpen] = useState<boolean>(false);
  const [password, setPassword] = useState<string>("");
  const [repeat, setRepeat] = useState<string>("");

  const onPost = async () => {
    const res = await updateRootPassword(password);
    toastState(toast, t, res, true);
    if (res.status) {
      setPassword("");
      setRepeat("");
      setOpen(false);

      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={`outline`} size={`sm`}>
          {t("admin.system.updateRoot")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("admin.system.updateRoot")}</DialogTitle>
          <DialogDescription>
            <div className={`mb-4 select-none`}>
              {t("admin.system.updateRootTip")}
            </div>
            <Input
              className={`mb-2`}
              type={`password`}
              placeholder={t("admin.system.updateRootPlaceholder")}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Input
              type={`password`}
              placeholder={t("admin.system.updateRootRepeatPlaceholder")}
              value={repeat}
              onChange={(e) => setRepeat(e.target.value)}
            />
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant={`outline`}
            onClick={() => {
              setPassword("");
              setRepeat("");
              setOpen(false);
            }}
          >
            {t("admin.cancel")}
          </Button>
          <Button
            variant={`default`}
            loading={true}
            onClick={onPost}
            disabled={
              password.trim().length === 0 || password.trim() !== repeat.trim()
            }
          >
            {t("admin.confirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function General({ data, dispatch, onChange }: CompProps<GeneralState>) {
  const { t } = useTranslation();

  return (
    <Paragraph
      title={t("admin.system.general")}
      configParagraph={true}
      isCollapsed={true}
    >
      <ParagraphItem>
        <Label>{t("admin.system.title")}</Label>
        <Input
          value={data.title}
          onChange={(e) =>
            dispatch({
              type: "update:general.title",
              value: e.target.value,
            })
          }
          placeholder={t("admin.system.titleTip")}
        />
      </ParagraphItem>
      <ParagraphItem>
        <Label>{t("admin.system.logo")}</Label>
        <Input
          value={data.logo}
          onChange={(e) =>
            dispatch({
              type: "update:general.logo",
              value: e.target.value,
            })
          }
          placeholder={t("admin.system.logoTip", {
            logo: `${window.location.protocol}//${window.location.host}/favicon.ico`,
          })}
        />
      </ParagraphItem>
      <ParagraphItem>
        <Label>
          <Require /> {t("admin.system.backend")}
        </Label>
        <Input
          value={data.backend}
          onChange={(e) =>
            dispatch({
              type: "update:general.backend",
              value: e.target.value,
            })
          }
          placeholder={t("admin.system.backendPlaceholder", {
            backend: `${window.location.protocol}//${window.location.host}/api`,
          })}
        />
      </ParagraphItem>
      <ParagraphDescription>
        {t("admin.system.backendTip")}
      </ParagraphDescription>
      <ParagraphFooter>
        <div className={`grow`} />
        <RootDialog />
        <Button
          size={`sm`}
          loading={true}
          onClick={async () => await onChange()}
        >
          {t("admin.system.save")}
        </Button>
      </ParagraphFooter>
    </Paragraph>
  );
}

function Mail({ data, dispatch, onChange }: CompProps<MailState>) {
  const { t } = useTranslation();
  const [email, setEmail] = useState<string>("");

  const [mailDialog, setMailDialog] = useState<boolean>(false);

  const onTest = async () => {
    if (!email.trim()) return;
    await onChange(false);
    const res = await doVerify(email);
    toastState(toast, t, res, true);

    if (res.status) setMailDialog(false);
  };

  return (
    <Paragraph
      title={t("admin.system.mail")}
      configParagraph={true}
      isCollapsed={true}
    >
      <ParagraphItem>
        <Label>
          <Require /> {t("admin.system.mailHost")}
        </Label>
        <Input
          value={data.host}
          onChange={(e) =>
            dispatch({
              type: "update:mail.host",
              value: e.target.value,
            })
          }
          placeholder={`smtp.qcloudmail.com`}
        />
      </ParagraphItem>
      <ParagraphItem>
        <Label>
          <Require /> {t("admin.system.mailPort")}
        </Label>
        <NumberInput
          value={data.port}
          onValueChange={(value) =>
            dispatch({ type: "update:mail.port", value })
          }
          placeholder={`465`}
          min={0}
          max={65535}
        />
      </ParagraphItem>
      <ParagraphItem>
        <Label>
          <Require /> {t("admin.system.mailUser")}
        </Label>
        <Input
          value={data.username}
          onChange={(e) =>
            dispatch({
              type: "update:mail.username",
              value: e.target.value,
            })
          }
          placeholder={t("admin.system.mailUser")}
        />
      </ParagraphItem>
      <ParagraphItem>
        <Label>
          <Require /> {t("admin.system.mailPass")}
        </Label>
        <Input
          value={data.password}
          onChange={(e) =>
            dispatch({
              type: "update:mail.password",
              value: e.target.value,
            })
          }
          placeholder={t("admin.system.mailPass")}
        />
      </ParagraphItem>
      <ParagraphItem>
        <Label>
          <Require /> {t("admin.system.mailFrom")}
        </Label>
        <Input
          value={data.from}
          onChange={(e) =>
            dispatch({
              type: "update:mail.from",
              value: e.target.value,
            })
          }
          placeholder={`bot@${location.host}`}
        />
      </ParagraphItem>
      <ParagraphFooter>
        <div className={`grow`} />
        <Dialog open={mailDialog} onOpenChange={setMailDialog}>
          <DialogTrigger asChild>
            <Button variant={`outline`} size={`sm`}>
              {t("admin.system.test")}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("admin.system.test")}</DialogTitle>
              <DialogDescription className={`pt-2`}>
                <Input
                  placeholder={t("auth.email-placeholder")}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant={`outline`}
                onClick={() => {
                  setEmail("");
                  setMailDialog(false);
                }}
              >
                {t("admin.cancel")}
              </Button>
              <Button variant={`default`} loading={true} onClick={onTest}>
                {t("admin.confirm")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <Button
          size={`sm`}
          loading={true}
          onClick={async () => await onChange()}
        >
          {t("admin.system.save")}
        </Button>
      </ParagraphFooter>
    </Paragraph>
  );
}

function Search({ data, dispatch, onChange }: CompProps<SearchState>) {
  const { t } = useTranslation();

  return (
    <Paragraph
      title={t("admin.system.search")}
      configParagraph={true}
      isCollapsed={true}
    >
      <ParagraphItem>
        <Label>{t("admin.system.searchEndpoint")}</Label>
        <Input
          value={data.endpoint}
          onChange={(e) =>
            dispatch({
              type: "update:search.endpoint",
              value: e.target.value,
            })
          }
          placeholder={`DuckDuckGo API Endpoint`}
        />
      </ParagraphItem>
      <ParagraphItem>
        <Label>{t("admin.system.searchQuery")}</Label>
        <NumberInput
          value={data.query}
          onValueChange={(value) =>
            dispatch({ type: "update:search.query", value })
          }
          placeholder={`5`}
          min={0}
          max={50}
        />
      </ParagraphItem>
      <ParagraphDescription>{t("admin.system.searchTip")}</ParagraphDescription>
      <ParagraphFooter>
        <div className={`grow`} />
        <Button
          size={`sm`}
          loading={true}
          onClick={async () => await onChange()}
        >
          {t("admin.system.save")}
        </Button>
      </ParagraphFooter>
    </Paragraph>
  );
}

function System() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [data, setData] = useReducer(
    formReducer<SystemProps>(),
    initialSystemState,
  );

  const doSaving = async (doToast?: boolean) => {
    const res = await setConfig(data);

    if (doToast !== false) toastState(toast, t, res, true);
  };

  useEffectAsync(async () => {
    const res = await getConfig();
    toastState(toast, t, res);
    if (res.status) {
      setData({ type: "set", value: res.data });
    }
  }, []);

  return (
    <div className={`system`}>
      <Card className={`system-card`}>
        <CardHeader className={`select-none`}>
          <CardTitle>{t("admin.settings")}</CardTitle>
        </CardHeader>
        <CardContent className={`flex flex-col gap-1`}>
          <General data={data.general} dispatch={setData} onChange={doSaving} />
          <Mail data={data.mail} dispatch={setData} onChange={doSaving} />
          <Search data={data.search} dispatch={setData} onChange={doSaving} />
        </CardContent>
      </Card>
    </div>
  );
}

export default System;
