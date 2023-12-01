import Tips from "@/components/Tips.tsx";
import { Input } from "@/components/ui/input.tsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectGroup,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select.tsx";
import {
  ChannelEditProps,
  ChannelInfos,
  ChannelModels,
  ChannelTypes,
} from "@/admin/channel.ts";
import { Textarea } from "@/components/ui/textarea.tsx";
import { NumberInput } from "@/components/ui/number-input.tsx";
import { Button } from "@/components/ui/button.tsx";
import { useTranslation } from "react-i18next";
import { useMemo, useReducer, useState } from "react";
import Required from "@/components/Require.tsx";
import { X } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu.tsx";
import {
  Command,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import Markdown from "@/components/Markdown.tsx";

const initialState: ChannelEditProps = {
  type: "openai",
  name: "",
  models: [],
  priority: 0,
  weight: 1,
  retry: 3,
  secret: "",
  endpoint: ChannelInfos["openai"].endpoint,
  mapper: "",
};

type CustomActionProps = {
  onPost: (model: string) => void;
};
function CustomAction({ onPost }: CustomActionProps) {
  const { t } = useTranslation();
  const [model, setModel] = useState("");

  function post() {
    const data = model.trim();
    if (data === "") return;
    onPost(data);
    setModel("");
  }

  return (
    <div className={`flex flex-row grow gap-0 custom-action`}>
      <Input
        value={model}
        placeholder={t("admin.channels.add-custom-model")}
        className={`rounded-r-none`}
        onChange={(e) => setModel(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") post();
        }}
      />
      <Button className={`rounded-l-none`} onClick={post}>
        {t("add")}
      </Button>
    </div>
  );
}

function reducer(state: ChannelEditProps, action: any) {
  switch (action.type) {
    case "type":
      const isChanged = ChannelInfos[state.type].endpoint !== state.endpoint;
      const endpoint = isChanged
        ? state.endpoint
        : ChannelInfos[action.value].endpoint;
      return { ...state, endpoint, type: action.value };
    case "name":
      return { ...state, name: action.value };
    case "models":
      return { ...state, models: action.value };
    case "add-model":
      if (state.models.includes(action.value) || action.value === "") {
        return state;
      }
      return { ...state, models: [...state.models, action.value] };
    case "add-models":
      const models = action.value.filter(
        (model: string) => !state.models.includes(model) && model !== "",
      );
      return { ...state, models: [...state.models, ...models] };
    case "remove-model":
      return {
        ...state,
        models: state.models.filter((model) => model !== action.value),
      };
    case "clear-models":
      return { ...state, models: [] };
    case "priority":
      return { ...state, priority: action.value };
    case "weight":
      return { ...state, weight: action.value };
    case "secret":
      return { ...state, secret: action.value };
    case "endpoint":
      return { ...state, endpoint: action.value };
    case "mapper":
      return { ...state, mapper: action.value };
    case "retry":
      return { ...state, retry: action.value };
    case "clear":
      return { ...initialState };
    default:
      return state;
  }
}

function validator(state: ChannelEditProps): boolean {
  return (
    state.name.trim() !== "" &&
    state.models.length > 0 &&
    state.secret.trim() !== "" &&
    state.endpoint.trim() !== ""
  );
}

function handler(data: ChannelEditProps): ChannelEditProps {
  data.models = data.models.filter((model) => model.trim() !== "");
  data.name = data.name.trim();
  data.secret = data.secret
    .trim()
    .split("\n")
    .filter((line) => line.trim() !== "")
    .join("\n");
  data.endpoint = data.endpoint.trim();
  data.mapper = data.mapper
    .trim()
    .split("\n")
    .filter((line) => {
      if (line.trim() === "") return false;
      const values = line.split(">");
      return (
        values.length === 2 &&
        values[0].trim() !== "" &&
        values[1].trim() !== ""
      );
    })
    .join("\n");
  return data;
}

type ChannelEditorProps = {
  setEnabled: (enabled: boolean) => void;
};

function ChannelEditor({ setEnabled }: ChannelEditorProps) {
  const { t } = useTranslation();
  const [edit, dispatch] = useReducer(reducer, { ...initialState });
  const info = useMemo(() => {
    return ChannelInfos[edit.type];
  }, [edit.type]);
  const unusedModels = useMemo(() => {
    return ChannelModels.filter(
      (model) => !edit.models.includes(model) && model !== "",
    );
  }, [edit.models]);
  const enabled = useMemo(() => validator(edit), [edit]);

  function post() {
    const data = handler(edit);
    console.debug(`[channel] preflight channel data`, data);
    // setEnabled(false);
  }

  return (
    <div className={`channel-editor`}>
      <div className={`channel-wrapper w-full h-max`}>
        <div className={`channel-row`}>
          <div className={`channel-content`}>
            <Required />
            {t("admin.channels.name")}
            <Tips content={t("admin.channels.name-tip")} />
          </div>
          <Input
            value={edit.name}
            placeholder={t("admin.channels.name-placeholder")}
            onChange={(e) => dispatch({ type: "name", value: e.target.value })}
          />
        </div>
        <div className={`channel-row`}>
          <div className={`channel-content`}>
            <Required />
            {t("admin.channels.type")}
          </div>
          <Select
            value={edit.type}
            onValueChange={(value) => dispatch({ type: "type", value })}
          >
            <SelectTrigger>
              <SelectValue placeholder={t("admin.channels.type")} />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {Object.entries(ChannelTypes).map(([key, value], idx) => (
                  <SelectItem key={idx} value={key}>
                    {value}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          {info.description && (
            <Markdown className={`channel-description mt-4 mb-1`}>
              {info.description}
            </Markdown>
          )}
        </div>
        <div className={`channel-row`}>
          <div className={`channel-content`}>
            <Required />
            {t("admin.channels.model")}
          </div>
          <div className={`channel-model-wrapper`}>
            {edit.models.map((model: string, idx: number) => (
              <div className={`channel-model-item`} key={idx}>
                {model}
                <X
                  className={`remove-action`}
                  onClick={() =>
                    dispatch({ type: "remove-model", value: model })
                  }
                />
              </div>
            ))}
          </div>
          <div className={`channel-model-action mt-4`}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button>{t("admin.channels.add-model")}</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent asChild>
                <Command>
                  <CommandInput
                    placeholder={t("admin.channels.search-model")}
                  />
                  <CommandList className={`thin-scrollbar`}>
                    {unusedModels.map((model, idx) => (
                      <CommandItem
                        key={idx}
                        value={model}
                        onSelect={() =>
                          dispatch({ type: "add-model", value: model })
                        }
                        className={`px-2`}
                      >
                        {model}
                      </CommandItem>
                    ))}
                  </CommandList>
                </Command>
              </DropdownMenuContent>
            </DropdownMenu>
            <CustomAction
              onPost={(model) => {
                dispatch({ type: "add-model", value: model });
              }}
            />
            <Button
              onClick={() =>
                dispatch({ type: "add-models", value: info.models })
              }
            >
              {t("admin.channels.fill-template-models", {
                number: info.models.length,
              })}
            </Button>
            <Button
              variant={`outline`}
              onClick={() => dispatch({ type: "clear-models" })}
            >
              {t("admin.channels.clear-models")}
            </Button>
          </div>
        </div>
        <div className={`channel-row`}>
          <div className={`channel-content`}>
            <Required />
            {t("admin.channels.secret")}
          </div>
          <Textarea
            value={edit.secret}
            placeholder={t("admin.channels.secret-placeholder", {
              format: info.format,
            })}
            onChange={(e) =>
              dispatch({ type: "secret", value: e.target.value })
            }
          />
        </div>
        <div className={`channel-row`}>
          <div className={`channel-content`}>
            <Required />
            {t("admin.channels.endpoint")}
          </div>
          <Input
            value={edit.endpoint}
            placeholder={t("admin.channels.endpoint-placeholder")}
            onChange={(e) =>
              dispatch({ type: "endpoint", value: e.target.value })
            }
          />
        </div>
        <div className={`channel-row`}>
          <div className={`channel-content`}>
            {t("admin.channels.priority")}
            <Tips content={t("admin.channels.priority-tip")} />
          </div>
          <NumberInput
            value={edit.priority}
            acceptNegative={true}
            onValueChange={(value) => dispatch({ type: "priority", value })}
          />
        </div>
        <div className={`channel-row`}>
          <div className={`channel-content`}>
            {t("admin.channels.weight")}
            <Tips content={t("admin.channels.weight-tip")} />
          </div>
          <NumberInput
            value={edit.weight}
            min={1}
            onValueChange={(value) => dispatch({ type: "weight", value })}
          />
        </div>
        <div className={`channel-row`}>
          <div className={`channel-content`}>
            {t("admin.channels.retry")}
            <Tips content={t("admin.channels.retry-tip")} />
          </div>
          <NumberInput
            value={edit.retry}
            min={1}
            onValueChange={(value) => dispatch({ type: "retry", value })}
          />
        </div>
        <div className={`channel-row`}>
          <div className={`channel-content`}>
            {t("admin.channels.mapper")}
            <Tips content={t("admin.channels.mapper-tip")} />
          </div>
          <Textarea
            value={edit.mapper}
            placeholder={t("admin.channels.mapper-placeholder")}
            onChange={(e) =>
              dispatch({ type: "mapper", value: e.target.value })
            }
          />
        </div>
      </div>
      <div className={`mt-4 flex flex-row w-full h-max pr-2`}>
        <div className={`grow`} />
        <Button variant={`outline`} onClick={() => setEnabled(false)}>
          {t("cancel")}
        </Button>
        <Button className={`ml-2`} onClick={post} disabled={!enabled}>
          {t("confirm")}
        </Button>
      </div>
    </div>
  );
}

export default ChannelEditor;
