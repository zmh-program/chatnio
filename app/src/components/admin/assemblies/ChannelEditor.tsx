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
  Channel,
  channelGroups,
  channelModels,
  ChannelTypes,
  getChannelInfo,
} from "@/admin/channel.ts";
import { CommonResponse, toastState } from "@/admin/utils.ts";
import { Textarea } from "@/components/ui/textarea.tsx";
import { NumberInput } from "@/components/ui/number-input.tsx";
import { Button } from "@/components/ui/button.tsx";
import { useTranslation } from "react-i18next";
import { useMemo, useReducer, useState } from "react";
import Required from "@/components/Require.tsx";
import { Loader2, Plus, Search, X } from "lucide-react";
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
import {
  createChannel,
  getChannel,
  updateChannel,
} from "@/admin/api/channel.ts";
import { toast } from "@/components/ui/use-toast.ts";
import { useEffectAsync } from "@/utils/hook.ts";
import { cn } from "@/components/ui/lib/utils.ts";

const initialState: Channel = {
  id: -1,
  type: "openai",
  name: "",
  models: [],
  priority: 0,
  weight: 1,
  retry: 3,
  secret: "",
  endpoint: getChannelInfo().endpoint,
  mapper: "",
  state: true,
  group: [],
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

function reducer(state: Channel, action: any) {
  switch (action.type) {
    case "type":
      const isChanged =
        getChannelInfo(state.type).endpoint !== state.endpoint &&
        state.endpoint.trim() !== "";
      const endpoint = isChanged
        ? state.endpoint
        : getChannelInfo(action.value).endpoint;
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
    case "add-group":
      return {
        ...state,
        group: state.group ? [...state.group, action.value] : [action.value],
      };
    case "remove-group":
      return {
        ...state,
        group: state.group
          ? state.group.filter((group) => group !== action.value)
          : [],
      };
    case "set":
      return { ...state, ...action.value };
    default:
      return state;
  }
}

function validator(state: Channel): boolean {
  return (
    state.name.trim() !== "" &&
    state.models.length > 0 &&
    state.secret.trim() !== "" &&
    state.endpoint.trim() !== ""
  );
}

function handler(data: Channel): Channel {
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
  data.group = data.group
    ? data.group.filter((group) => group.trim() !== "")
    : [];
  return data;
}

type ChannelEditorProps = {
  display: boolean;
  id: number;
  setEnabled: (enabled: boolean) => void;
};

function ChannelEditor({ display, id, setEnabled }: ChannelEditorProps) {
  const { t } = useTranslation();
  const [edit, dispatch] = useReducer(reducer, { ...initialState });
  const info = useMemo(() => getChannelInfo(edit.type), [edit.type]);
  const unusedModels = useMemo(() => {
    return channelModels.filter(
      (model) => !edit.models.includes(model) && model !== "",
    );
  }, [edit.models]);
  const enabled = useMemo(() => validator(edit), [edit]);

  const [loading, setLoading] = useState(false);

  const unusedGroups = useMemo(() => {
    if (!edit.group) return channelGroups;
    return channelGroups.filter(
      (group) => !edit.group.includes(group) && group !== "",
    );
  }, [edit.group]);

  function close(clear?: boolean) {
    if (clear) dispatch({ type: "clear" });
    setEnabled(false);
  }

  async function post() {
    const data = handler(edit);
    console.debug(`[channel] preflight channel data`, data);

    const resp =
      id === -1 ? await createChannel(data) : await updateChannel(id, data);
    toastState(toast, t, resp as CommonResponse, true);

    if (resp.status) {
      close(true);
    }
  }

  useEffectAsync(async () => {
    if (id === -1) dispatch({ type: "clear" });
    else {
      setLoading(true);
      const resp = await getChannel(id);
      setLoading(false);
      toastState(toast, t, resp as CommonResponse);
      if (resp.data) dispatch({ type: "set", value: resp.data });
    }
  }, [id]);

  return (
    display && (
      <div className={`channel-editor`}>
        {loading && (
          <Loader2 className={`channel-loader h-4 w-4 animate-spin`} />
        )}
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
              onChange={(e) =>
                dispatch({ type: "name", value: e.target.value })
              }
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
                  <Button>
                    <Search className={`h-4 w-4 mr-2`} />
                    {t("admin.channels.add-model")}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align={`start`} asChild>
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
                  const models = model.split(" ");
                  dispatch({ type: "add-models", value: models });
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
          <div className={`channel-row`}>
            <div className={`channel-content`}>
              {t("admin.channels.group")}
              <Tips content={t("admin.channels.group-tip")} />
            </div>
            <div className={`flex flex-row gap-2 items-center`}>
              <div
                className={`channel-model-wrapper`}
                style={{ minHeight: "2.5rem" }}
              >
                {(edit.group || []).map((item: string, idx: number) => (
                  <div className={`channel-model-item`} key={idx}>
                    {item}
                    <X
                      className={`remove-action`}
                      onClick={() =>
                        dispatch({ type: "remove-group", value: item })
                      }
                    />
                  </div>
                ))}
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    disabled={unusedGroups.length === 0}
                    className={`h-full`}
                  >
                    <Plus className={`w-4 h-4 mr-1`} />
                    {t("add")}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align={`end`} asChild>
                  <Command>
                    <CommandList
                      className={
                        unusedGroups.length ? `thin-scrollbar` : `no-scrollbar`
                      }
                    >
                      {unusedGroups.length === 0 ? (
                        <p className={`p-2 text-center`}>
                          {t("conversation.empty")}
                        </p>
                      ) : (
                        unusedGroups.map((item, idx) => (
                          <CommandItem
                            key={idx}
                            value={item}
                            onSelect={() =>
                              dispatch({ type: "add-group", value: item })
                            }
                            className={cn("px-2", idx > 1 && "gold-text")}
                          >
                            {item}
                          </CommandItem>
                        ))
                      )}
                    </CommandList>
                  </Command>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
        <div className={`mt-4 flex flex-row w-full h-max pr-2 items-center`}>
          <div className={`object-id`}>
            <span className={`mr-2`}>ID</span>
            {edit.id === -1 ? (
              <Plus className={`w-3 h-3`} />
            ) : (
              <span className={`id`}>{edit.id}</span>
            )}
          </div>
          <div className={`grow`} />
          <Button variant={`outline`} onClick={() => close()}>
            {t("cancel")}
          </Button>
          <Button
            className={`ml-2`}
            loading={true}
            onClick={post}
            disabled={!enabled}
          >
            {t("confirm")}
          </Button>
        </div>
      </div>
    )
  );
}

export default ChannelEditor;
