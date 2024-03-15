import { useReducer, useState } from "react";
import ChannelTable from "@/components/admin/assemblies/ChannelTable.tsx";
import ChannelEditor from "@/components/admin/assemblies/ChannelEditor.tsx";
import { Channel, getChannelInfo } from "@/admin/channel.ts";

const initialProxyState = {
  proxy: "",
  proxy_type: 0,
  username: "",
  password: "",
};

const initialState: Channel = {
  id: -1,
  type: "openai",
  name: "",
  models: [],
  priority: 0,
  weight: 1,
  retry: 1,
  secret: "",
  endpoint: getChannelInfo().endpoint,
  mapper: "",
  state: true,
  group: [],
  proxy: { ...initialProxyState },
};

function reducer(state: Channel, action: any): Channel {
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
    case "set-group":
      return { ...state, group: action.value };
    case "set-proxy":
      return {
        ...state,
        proxy: {
          proxy: action.value as string,
          proxy_type: state?.proxy?.proxy_type || 0,
          password: state?.proxy?.password || "",
          username: state?.proxy?.username || "",
        },
      };
    case "set-proxy-type":
      return {
        ...state,
        proxy: {
          proxy: state?.proxy?.proxy || "",
          proxy_type: action.value as number,
          password: state?.proxy?.password || "",
          username: state?.proxy?.username || "",
        },
      };
    case "set-proxy-username":
      return {
        ...state,
        proxy: {
          proxy: state?.proxy?.proxy || "",
          proxy_type: state?.proxy?.proxy_type || 0,
          password: state?.proxy?.password || "",
          username: action.value as string,
        },
      };
    case "set-proxy-password":
      return {
        ...state,
        proxy: {
          proxy: state?.proxy?.proxy || "",
          proxy_type: state?.proxy?.proxy_type || 0,
          password: action.value as string,
          username: state?.proxy?.username || "",
        },
      };
    case "set":
      return { ...state, ...action.value };
    default:
      return state;
  }
}

function ChannelSettings() {
  const [enabled, setEnabled] = useState<boolean>(false);
  const [id, setId] = useState<number>(-1);

  const [edit, dispatch] = useReducer(reducer, { ...initialState });

  return (
    <>
      <ChannelTable
        setEnabled={setEnabled}
        setId={setId}
        display={!enabled}
        dispatch={dispatch}
      />
      <ChannelEditor
        setEnabled={setEnabled}
        id={id}
        display={enabled}
        edit={edit}
        dispatch={dispatch}
      />
    </>
  );
}

export default ChannelSettings;
