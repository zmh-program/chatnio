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
  Activity,
  AlertCircle,
  Cloud,
  DownloadCloud,
  Eraser,
  EyeOff,
  KanbanSquareDashed,
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
import { toastState } from "@/api/common.ts";
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
import {
  deleteCharge,
  listCharge,
  setCharge,
  syncCharge,
} from "@/admin/api/charge.ts";
import { useEffectAsync } from "@/utils/hook.ts";
import { cn } from "@/components/ui/lib/utils.ts";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert.tsx";
import Tips from "@/components/Tips.tsx";
import { getQuerySelector, scrollUp } from "@/utils/dom.ts";
import PopupDialog, { popupTypes } from "@/components/PopupDialog.tsx";
import { getApiCharge, getV1Path } from "@/api/v1.ts";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog.tsx";
import { getUniqueList, isEnter, parseNumber } from "@/utils/base.ts";
import { defaultChannelModels } from "@/admin/channel.ts";
import { getPricing } from "@/admin/datasets/charge.ts";
import { useAllModels } from "@/admin/hook.tsx";

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
    case "toggle-model":
      if (action.payload.trim().length === 0) return state;
      return state.models.includes(action.payload)
        ? {
            ...state,
            models: state.models.filter((model) => model !== action.payload),
          }
        : { ...state, models: [...state.models, action.payload] };
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

type SyncDialogProps = {
  current: string[];
  builtin: boolean;
  open: boolean;
  setOpen: (open: boolean) => void;
  onRefresh: () => void;
};

function SyncDialog({
  builtin,
  current,
  open,
  setOpen,
  onRefresh,
}: SyncDialogProps) {
  const { t } = useTranslation();
  const { toast } = useToast();

  const [siteCharge, setSiteCharge] = useState<ChargeProps[]>([]);
  const [siteOpen, setSiteOpen] = useState(false);

  const [overwrite, setOverwrite] = useState(false);
  const siteModels = useMemo(
    () => siteCharge.flatMap((charge) => charge.models),
    [siteCharge],
  );
  const influencedModels = useMemo(
    () =>
      overwrite
        ? siteModels
        : siteModels.filter((model) => !current.includes(model)),
    [overwrite, siteModels, current],
  );

  return (
    <>
      <PopupDialog
        type={popupTypes.Number}
        title={t("admin.charge.sync-builtin")}
        name={t("admin.charge.usd-currency")}
        open={open && builtin}
        setOpen={setOpen}
        defaultValue={"7.1"}
        onSubmit={async (_currency: string): Promise<boolean> => {
          const currency = parseNumber(_currency);
          const pricing = getPricing(currency);

          setSiteCharge(pricing);
          setSiteOpen(true);

          return true;
        }}
      />
      <PopupDialog
        type={popupTypes.Text}
        title={t("admin.charge.sync")}
        name={t("admin.charge.sync-site")}
        placeholder={t("admin.charge.sync-placeholder")}
        open={open && !builtin}
        setOpen={setOpen}
        defaultValue={"https://api.chatnio.net"}
        alert={t("admin.chatnio-format-only")}
        onSubmit={async (endpoint): Promise<boolean> => {
          const path = getV1Path("/v1/charge", { endpoint });
          const charge = await getApiCharge({ endpoint });

          if (charge.length === 0) {
            toast({
              title: t("admin.charge.sync-failed"),
              description: t("admin.charge.sync-failed-prompt", {
                endpoint: path,
              }),
            });
            return false;
          }

          setSiteCharge(charge);
          setSiteOpen(true);
          return true;
        }}
      />
      <Dialog open={siteOpen} onOpenChange={setSiteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("admin.charge.sync-option")}</DialogTitle>
            <DialogDescription className={`pt-1.5`}>
              {t("admin.charge.sync-prompt", {
                length: siteModels.length,
                influence: influencedModels.length,
              })}
            </DialogDescription>
          </DialogHeader>
          <div className={`pt-1 flex flex-row items-center justify-center`}>
            <span className={`mr-4 whitespace-nowrap`}>
              {t("admin.charge.sync-overwrite")}
            </span>
            <Switch checked={overwrite} onCheckedChange={setOverwrite} />
          </div>
          <DialogFooter>
            <Button
              variant={`outline`}
              onClick={() => {
                setSiteOpen(false);
                setSiteCharge([]);
              }}
            >
              {t("cancel")}
            </Button>
            <Button
              loading={true}
              variant={overwrite ? `destructive` : `default`}
              onClick={async () => {
                const resp = await syncCharge({
                  data: siteCharge,
                  overwrite,
                });
                toastState(toast, t, resp, true);

                if (resp.status) {
                  setOpen(false);
                  setSiteOpen(false);
                  setSiteCharge([]);

                  onRefresh();
                }
              }}
            >
              {t("admin.charge.sync-confirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

type ChargeActionProps = {
  loading: boolean;
  onRefresh: () => void;
  currentModels: string[];
};

function ChargeAction({
  loading,
  onRefresh,
  currentModels,
}: ChargeActionProps) {
  const { t } = useTranslation();
  const [popup, setPopup] = useState(false);
  const [builtin, setBuiltin] = useState(false);

  const open = (builtin: boolean) => {
    setBuiltin(builtin);
    setPopup(true);
  };

  return (
    <div className={`flex flex-row w-full h-max`}>
      <SyncDialog
        builtin={builtin}
        onRefresh={onRefresh}
        current={currentModels}
        open={popup}
        setOpen={setPopup}
      />
      <Button variant={`default`} className={`mr-2`} onClick={() => open(true)}>
        <KanbanSquareDashed className={`w-4 h-4 mr-2`} />
        {t("admin.charge.sync-builtin")}
      </Button>
      <Button variant={`outline`} onClick={() => open(false)}>
        <Activity className={`w-4 h-4 mr-2`} />
        {t("admin.charge.sync")}
      </Button>
      <div className={`grow`} />
      <Button variant={`outline`} size={`icon`} onClick={onRefresh}>
        <RotateCw className={cn("w-4 h-4", loading && "animate-spin")} />
      </Button>
    </div>
  );
}

type ChargeAlertProps = {
  models: string[];
  onClick: (model: string) => void;
};

function ChargeAlert({ models, onClick }: ChargeAlertProps) {
  const { t } = useTranslation();

  return (
    models.length > 0 && (
      <Alert className={`charge-alert`}>
        <AlertTitle className={`flex flex-row items-center select-none`}>
          <AlertCircle className="h-4 w-4 mr-2" />
          <p>{t("admin.charge.unused-model")}</p>
          <Tips content={t("admin.charge.unused-model-tip")} />
        </AlertTitle>
        <AlertDescription className={`model-list`}>
          {models.map((model, index) => (
            <div
              key={index}
              className={`model cursor-pointer select-none`}
              onClick={() => onClick(model)}
            >
              {model}
            </div>
          ))}
        </AlertDescription>
      </Alert>
    )
  );
}

type ChargeEditorProps = {
  form: ChargeProps;
  dispatch: (action: any) => void;
  onRefresh: () => void;
  usedModels: string[];
  allModels: string[];
};

function ChargeEditor({
  form,
  dispatch,
  onRefresh,
  usedModels,
  allModels,
}: ChargeEditorProps) {
  const { t } = useTranslation();
  const { toast } = useToast();

  const [model, setModel] = useState("");

  const channelModels = useMemo(
    () => getUniqueList([...allModels, ...defaultChannelModels]),
    [allModels],
  );

  const unusedModels = useMemo(() => {
    return channelModels.filter(
      (model) =>
        !form.models.includes(model) &&
        !usedModels.includes(model) &&
        model.trim() !== "",
    );
  }, [form.models, usedModels]);

  const disabled = useMemo(() => {
    if (model.trim() !== "") return false;
    return form.models.length === 0;
  }, [model, form.models]);

  const [loading, setLoading] = useState(false);

  async function post() {
    const raw = model.trim();
    const data = preflight({ ...form });
    if (raw !== "" && !data.models.includes(raw)) {
      data.models = [raw, ...data.models];
      setModel("");
    }

    const resp = await setCharge(data);
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
            if (isEnter(e)) {
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
      <Table classNameWrapper={`table`}>
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
              <TableCell className={`charge-id`}>{charge.id}</TableCell>
              <TableCell>
                <Badge className={`whitespace-nowrap`}>
                  {t(`admin.charge.${charge.type}`)}
                </Badge>
              </TableCell>
              <TableCell>
                <pre>{charge.models.join("\n")}</pre>
              </TableCell>
              <TableCell>
                {charge.input === 0 ? 0 : charge.input.toFixed(3)}
              </TableCell>
              <TableCell>
                {charge.output === 0 ? 0 : charge.output.toFixed(3)}
              </TableCell>
              <TableCell>{t(String(charge.anonymous))}</TableCell>
              <TableCell>
                <div className={`inline-flex flex-row flex-wrap gap-2`}>
                  <OperationAction
                    tooltip={t("admin.channels.edit")}
                    onClick={async () => {
                      const props: ChargeProps = { ...charge };
                      dispatch({ type: "set", payload: props });

                      // scroll to top
                      scrollUp(
                        getQuerySelector(
                          ".admin-content > .scrollarea-viewport",
                        )!,
                      );
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
    </div>
  );
}

function ChargeWidget() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [data, setData] = useState<ChargeProps[]>([]);
  const [form, dispatch] = useReducer(reducer, initialState);
  const [loading, setLoading] = useState(false);

  const { allModels, update } = useAllModels();

  const currentModels = useMemo(() => {
    return data.flatMap((charge) => charge.models);
  }, [data]);

  const usedModels = useMemo((): string[] => {
    return data.flatMap((charge) => charge.models);
  }, [data]);

  const unusedModels = useMemo(() => {
    if (loading) return [];
    return allModels.filter(
      (model) => !usedModels.includes(model) && model.trim() !== "",
    );
  }, [loading, allModels, usedModels]);

  async function refresh(ignoreUpdate?: boolean) {
    setLoading(true);
    const resp = await listCharge();
    if (!ignoreUpdate) await update();

    setLoading(false);
    toastState(toast, t, resp);
    setData(resp.data);
  }

  useEffectAsync(async () => await refresh(true), []);

  return (
    <div className={`charge-widget`}>
      <ChargeAction
        loading={loading}
        onRefresh={refresh}
        currentModels={currentModels}
      />
      <ChargeAlert
        models={unusedModels}
        onClick={(model) => dispatch({ type: "toggle-model", payload: model })}
      />
      <ChargeEditor
        onRefresh={refresh}
        form={form}
        dispatch={dispatch}
        allModels={allModels}
        usedModels={usedModels}
      />
      <ChargeTable data={data} dispatch={dispatch} onRefresh={refresh} />
    </div>
  );
}

export default ChargeWidget;
