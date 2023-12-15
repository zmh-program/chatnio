import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group.tsx";
import { Label } from "@/components/ui/label.tsx";
import {
  ChargeProps,
  chargeTypes,
  defaultChargeType,
  nonBilling,
  timesBilling,
  tokenBilling,
} from "@/admin/charge.ts";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input.tsx";
import { useMemo, useReducer, useState } from "react";
import { Button } from "@/components/ui/button.tsx";
import {
  Cloud,
  DownloadCloud,
  Eraser,
  EyeOff,
  Minus,
  PencilLine,
  Plus,
  RotateCw,
  Search,
  Settings2,
  Trash,
  UploadCloud,
} from "lucide-react";
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
} from "@/components/ui/command.tsx";
import { channelModels } from "@/admin/channel.ts";
import { toastState } from "@/admin/utils.ts";
import { Switch } from "@/components/ui/switch.tsx";
import { NumberInput } from "@/components/ui/number-input.tsx";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table.tsx";
import OperationAction from "@/components/OperationAction.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { useToast } from "@/components/ui/use-toast";
import { deleteCharge, listCharge, setCharge } from "@/admin/api/charge.ts";
import { useEffectAsync } from "@/utils/hook.ts";

const initialState: ChargeProps = {
  id: -1,
  type: defaultChargeType,
  models: [],
  anonymous: false,
  input: 0,
  output: 0,
};

function reducer(state: ChargeProps, action: any): ChargeProps {
  switch (action.type) {
    case "set":
      return { ...action.payload };
    case "set-models":
      return { ...state, models: action.payload };
    case "add-model":
      const model = action.payload.trim();
      if (model.length === 0 || state.models.includes(model)) return state;
      return { ...state, models: [...state.models, model] };
    case "remove-model":
      return {
        ...state,
        models: state.models.filter((model) => model !== action.payload),
      };
    case "set-type":
      return { ...state, type: action.payload };
    case "set-anonymous":
      return { ...state, anonymous: action.payload };
    case "set-input":
      return { ...state, input: action.payload };
    case "set-output":
      return { ...state, output: action.payload };
    case "clear":
      return initialState;
    case "clear-param":
      return { ...initialState, id: state.id };
    default:
      return state;
  }
}

function preflight(state: ChargeProps): ChargeProps {
  state.models = state.models
    .map((model) => model.trim())
    .filter((model) => model.length > 0);
  switch (state.type) {
    case nonBilling:
      state.input = 0;
      state.output = 0;
      break;
    case timesBilling:
      state.input = 0;
      state.anonymous = false;
      break;
    case tokenBilling:
      state.anonymous = false;
      break;
  }

  if (state.input < 0) state.input = 0;
  if (state.output < 0) state.output = 0;

  return state;
}

type ChargeEditorProps = {
  form: ChargeProps;
  dispatch: (action: any) => void;
  onRefresh: () => void;
  usedModels: string[];
};

function ChargeEditor({
  form,
  dispatch,
  onRefresh,
  usedModels,
}: ChargeEditorProps) {
  const { t } = useTranslation();
  const { toast } = useToast();

  const [model, setModel] = useState("");
  const unusedModels = useMemo(() => {
    return channelModels.filter(
      (model) =>
        !form.models.includes(model) &&
        !usedModels.includes(model) &&
        model.trim() !== "",
    );
  }, [form.models, usedModels]);

  const disabled = useMemo(() => {
    return form.models.length === 0;
  }, [form.models]);

  const [loading, setLoading] = useState(false);

  async function post() {
    const resp = await setCharge(preflight({ ...form }));
    toastState(toast, t, resp, true);

    if (resp.status) clear();
    onRefresh();
  }

  function clear() {
    dispatch({ type: "clear" });
    setModel("");
  }

  return (
    <div className={`charge-editor`}>
      <div className={`w-full h-max mb-5`}>
        <RadioGroup
          value={form.type}
          onValueChange={(value) =>
            dispatch({ type: "set-type", payload: value })
          }
          className={`flex flex-row gap-5 whitespace-nowrap flex-wrap`}
        >
          {chargeTypes.map((chargeType, index) => (
            <div
              className="flex items-center space-x-2 cursor-pointer"
              key={index}
            >
              <RadioGroupItem
                className={`transition-all duration-200`}
                value={chargeType}
                id={chargeType}
              />
              <Label htmlFor={chargeType} className={`cursor-pointer`}>
                {t(`admin.charge.${chargeType}`)}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>
      <div className={`flex flex-row w-full h-max mb-4`}>
        <Button
          onClick={() => {
            dispatch({ type: "add-model", payload: model });
            setModel("");
          }}
          size={`icon`}
          className={`mr-2 shrink-0`}
        >
          <Plus className={`w-4 h-4`} />
        </Button>
        <Input
          value={model}
          onChange={(e) => setModel(e.target.value)}
          placeholder={t("admin.channels.model")}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              dispatch({ type: "add-model", payload: model });
              setModel("");
            }
          }}
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size={`icon`} className={`ml-2 shrink-0`}>
              <Search className={`w-4 h-4`} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align={`end`} asChild>
            <Command>
              <CommandInput placeholder={t("admin.channels.search-model")} />
              <CommandList className={`thin-scrollbar`}>
                {unusedModels.map((model, idx) => (
                  <CommandItem
                    key={idx}
                    value={model}
                    onSelect={(value) =>
                      dispatch({ type: "add-model", payload: value })
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
      </div>
      <div className={`flex flex-col w-full h-max mb-2`}>
        {form.models.map((model, index) => (
          <div
            className={`flex flex-row w-full h-max shrink-0 mb-2 select-none`}
            key={index}
          >
            <Input value={model} readOnly />
            <Button
              onClick={() => dispatch({ type: "remove-model", payload: model })}
              size={`icon`}
              variant={`outline`}
              className={`ml-2 shrink-0`}
            >
              <Minus className={`w-4 h-4`} />
            </Button>
          </div>
        ))}
      </div>

      {form.type === nonBilling && (
        <div className={`flex flex-row w-full h-max items-center mt-4 mb-6`}>
          <EyeOff className={`w-4 h-4 mr-2`} />
          <Label className={`grow`}>{t("admin.charge.anonymous")}</Label>
          <Switch
            checked={form.anonymous}
            onCheckedChange={(checked) =>
              dispatch({ type: "set-anonymous", payload: checked })
            }
          />
        </div>
      )}

      {form.type === timesBilling && (
        <div className={`flex flex-row w-full h-max items-center`}>
          <Cloud className={`w-4 h-4 mr-2`} />
          <Label className={`grow`}>{t("admin.charge.time-count")}</Label>
          <NumberInput
            value={form.output}
            onValueChange={(value) =>
              dispatch({ type: "set-output", payload: value })
            }
            acceptNegative={false}
            className={`w-20`}
            min={0}
            max={99999}
          />
        </div>
      )}

      {form.type === tokenBilling && (
        <div className={`flex flex-col w-full h-max gap-2`}>
          <div className={`flex flex-row w-full h-max items-center`}>
            <UploadCloud className={`w-4 h-4 mr-2`} />
            <Label className={`grow`}>
              {t("admin.charge.input-count")}
              <span className={`token`}> / 1k tokens</span>
            </Label>
            <NumberInput
              value={form.input}
              onValueChange={(value) =>
                dispatch({ type: "set-input", payload: value })
              }
              acceptNegative={false}
              className={`w-20`}
              min={0}
              max={99999}
            />
          </div>
          <div className={`flex flex-row w-full h-max items-center`}>
            <DownloadCloud className={`w-4 h-4 mr-2`} />
            <Label className={`grow`}>
              {t("admin.charge.output-count")}
              <span className={`token`}> / 1k tokens</span>
            </Label>
            <NumberInput
              value={form.output}
              onValueChange={(value) =>
                dispatch({ type: "set-output", payload: value })
              }
              acceptNegative={false}
              className={`w-20`}
              min={0}
              max={99999}
            />
          </div>
        </div>
      )}

      <div
        className={`flex flex-row w-full h-max mt-5 gap-2 items-center flex-wrap`}
      >
        <div className={`object-id`}>
          <span className={`mr-2`}>ID</span>
          {form.id === -1 ? (
            <Plus className={`w-3 h-3`} />
          ) : (
            <span className={`id`}>{form.id}</span>
          )}
        </div>
        <div className={`grow`} />
        <Button
          variant={`outline`}
          size={`icon`}
          className={`shrink-0`}
          onClick={clear}
        >
          <Eraser className={`w-4 h-4`} />
        </Button>
        <Button
          disabled={disabled}
          onClick={post}
          loading={true}
          onLoadingChange={setLoading}
          className={`whitespace-nowrap shrink-0`}
        >
          {form.id === -1 ? (
            <>
              {!loading && <Plus className={`w-4 h-4 mr-2`} />}
              {t("admin.charge.add-rule")}
            </>
          ) : (
            <>
              {!loading && <PencilLine className={`w-4 h-4 mr-2`} />}
              {t("admin.charge.update-rule")}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

type ChargeTableProps = {
  data: ChargeProps[];
  dispatch: (action: any) => void;
  onRefresh: () => void;
};

function ChargeTable({ data, dispatch, onRefresh }: ChargeTableProps) {
  const { t } = useTranslation();
  const { toast } = useToast();

  return (
    <div className={`charge-table`}>
      <Table>
        <TableHeader>
          <TableRow className={`select-none whitespace-nowrap`}>
            <TableCell>{t("admin.charge.id")}</TableCell>
            <TableCell>{t("admin.charge.type")}</TableCell>
            <TableCell>{t("admin.charge.model")}</TableCell>
            <TableCell>{t("admin.charge.input")}</TableCell>
            <TableCell>{t("admin.charge.output")}</TableCell>
            <TableCell>{t("admin.charge.support-anonymous")}</TableCell>
            <TableCell>{t("admin.charge.action")}</TableCell>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((charge, idx) => (
            <TableRow key={idx}>
              <TableCell>{charge.id}</TableCell>
              <TableCell>
                <Badge>{charge.type.split("-")[0]}</Badge>
              </TableCell>
              <TableCell>
                <pre>{charge.models.join("\n")}</pre>
              </TableCell>
              <TableCell>
                {charge.input === 0 ? 0 : charge.input.toFixed(2)}
              </TableCell>
              <TableCell>
                {charge.output === 0 ? 0 : charge.output.toFixed(2)}
              </TableCell>
              <TableCell>{t(String(charge.anonymous))}</TableCell>
              <TableCell>
                <div className={`inline-flex flex-row flex-wrap gap-2`}>
                  <OperationAction
                    tooltip={t("admin.channels.edit")}
                    onClick={async () => {
                      const props: ChargeProps = { ...charge };
                      dispatch({ type: "set", payload: props });
                    }}
                  >
                    <Settings2 className={`h-4 w-4`} />
                  </OperationAction>
                  <OperationAction
                    tooltip={t("admin.channels.delete")}
                    variant={`destructive`}
                    onClick={async () => {
                      const resp = await deleteCharge(charge.id);
                      toastState(toast, t, resp, true);
                      onRefresh();
                    }}
                  >
                    <Trash className={`h-4 w-4`} />
                  </OperationAction>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className={`mt-6 pr-2 flex flex-row w-full h-max`}>
        <div className={`grow`} />
        <Button
          variant={`outline`}
          size={`icon`}
          className={`mr-2`}
          onClick={onRefresh}
        >
          <RotateCw className={`h-4 w-4`} />
        </Button>
      </div>
    </div>
  );
}

function ChargeWidget() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [data, setData] = useState<ChargeProps[]>([]);
  const [form, dispatch] = useReducer(reducer, initialState);

  const usedModels = useMemo((): string[] => {
    return data.flatMap((charge) => charge.models);
  }, [data]);

  async function refresh() {
    const resp = await listCharge();
    toastState(toast, t, resp);
    setData(resp.data);
  }

  useEffectAsync(refresh, []);

  return (
    <div className={`charge-widget`}>
      <ChargeEditor
        onRefresh={refresh}
        form={form}
        dispatch={dispatch}
        usedModels={usedModels}
      />
      <ChargeTable data={data} onRefresh={refresh} dispatch={dispatch} />
    </div>
  );
}

export default ChargeWidget;
