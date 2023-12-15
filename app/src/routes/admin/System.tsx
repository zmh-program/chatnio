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
import { useReducer } from "react";
import { formReducer } from "@/utils/form.ts";
import { NumberInput } from "@/components/ui/number-input.tsx";

type GeneralState = {
  backend: string;
};

function General() {
  const { t } = useTranslation();
  const [general, generalDispatch] = useReducer(formReducer<GeneralState>(), {
    backend: "",
  } as GeneralState);

  return (
    <Paragraph
      title={t("admin.system.general")}
      configParagraph={true}
      isCollapsed={true}
    >
      <ParagraphItem>
        <Label>{t("admin.system.backend")}</Label>
        <Input
          value={general.backend}
          onChange={(e) =>
            generalDispatch({
              type: "update:backend",
              value: e.target.value,
            })
          }
          placeholder={`${window.location.protocol}//${window.location.host}/api`}
        />
      </ParagraphItem>
      <ParagraphDescription>
        {t("admin.system.backendTip")}
      </ParagraphDescription>
      <ParagraphFooter>
        <div className={`grow`} />
        <Button size={`sm`} loading={true}>
          {t("admin.system.save")}
        </Button>
      </ParagraphFooter>
    </Paragraph>
  );
}

type MailState = {
  host: string;
  port: number;
  username: string;
  password: string;
};

function Mail() {
  const { t } = useTranslation();
  const [mail, mailDispatch] = useReducer(formReducer<MailState>(), {
    host: "",
    port: 465,
    username: "",
    password: "",
  } as MailState);

  return (
    <Paragraph
      title={t("admin.system.mail")}
      configParagraph={true}
      isCollapsed={true}
    >
      <ParagraphItem>
        <Label>{t("admin.system.mailHost")}</Label>
        <Input
          value={mail.host}
          onChange={(e) =>
            mailDispatch({
              type: "update:host",
              value: e.target.value,
            })
          }
          placeholder={`smtp.qcloudmail.com`}
        />
      </ParagraphItem>
      <ParagraphItem>
        <Label>{t("admin.system.mailPort")}</Label>
        <NumberInput
          value={mail.port}
          onValueChange={(value) =>
            mailDispatch({ type: "update:port", value })
          }
          placeholder={`465`}
          min={0}
          max={65535}
        />
      </ParagraphItem>
      <ParagraphItem>
        <Label>{t("admin.system.mailUser")}</Label>
        <Input
          value={mail.username}
          onChange={(e) =>
            mailDispatch({
              type: "update:username",
              value: e.target.value,
            })
          }
          placeholder={t("admin.system.mailUser")}
        />
      </ParagraphItem>
      <ParagraphItem>
        <Label>{t("admin.system.mailPass")}</Label>
        <Input
          value={mail.password}
          onChange={(e) =>
            mailDispatch({
              type: "update:password",
              value: e.target.value,
            })
          }
          placeholder={t("admin.system.mailPass")}
        />
      </ParagraphItem>
      <ParagraphFooter>
        <div className={`grow`} />
        <Button size={`sm`} loading={true}>
          {t("admin.system.save")}
        </Button>
      </ParagraphFooter>
    </Paragraph>
  );
}

type SearchState = {
  endpoint: string;
  query: number;
};

function Search() {
  const { t } = useTranslation();
  const [search, searchDispatch] = useReducer(formReducer<SearchState>(), {
    endpoint: "https://duckduckgo-api.vercel.app",
    query: 5,
  } as SearchState);

  return (
    <Paragraph
      title={t("admin.system.search")}
      configParagraph={true}
      isCollapsed={true}
    >
      <ParagraphItem>
        <Label>{t("admin.system.searchEndpoint")}</Label>
        <Input
          value={search.endpoint}
          onChange={(e) =>
            searchDispatch({
              type: "update:endpoint",
              value: e.target.value,
            })
          }
          placeholder={`DuckDuckGo API Endpoint`}
        />
      </ParagraphItem>
      <ParagraphItem>
        <Label>{t("admin.system.searchQuery")}</Label>
        <NumberInput
          value={search.query}
          onValueChange={(value) =>
            searchDispatch({ type: "update:query", value })
          }
          placeholder={`5`}
          min={0}
          max={50}
        />
      </ParagraphItem>
      <ParagraphDescription>{t("admin.system.searchTip")}</ParagraphDescription>
      <ParagraphFooter>
        <div className={`grow`} />
        <Button size={`sm`} loading={true}>
          {t("admin.system.save")}
        </Button>
      </ParagraphFooter>
    </Paragraph>
  );
}

function System() {
  const { t } = useTranslation();

  return (
    <div className={`system`}>
      <Card className={`system-card`}>
        <CardHeader className={`select-none`}>
          <CardTitle>{t("admin.settings")}</CardTitle>
        </CardHeader>
        <CardContent className={`flex flex-col gap-1`}>
          <General />
          <Mail />
          <Search />
        </CardContent>
      </Card>
    </div>
  );
}

export default System;
