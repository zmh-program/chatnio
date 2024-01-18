import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";
import { useTranslation } from "react-i18next";
import { useMemo, useReducer, useState } from "react";
import { getPlanConfig, PlanConfig, setPlanConfig } from "@/admin/api/plan.ts";
import { useEffectAsync } from "@/utils/hook.ts";
import { Switch } from "@/components/ui/switch.tsx";
import {
  BookDashed,
  ChevronDown,
  ChevronUp,
  Loader2,
  Plus,
  Trash,
} from "lucide-react";
import {
  getPlanName,
  SubscriptionIcon,
  subscriptionIconsList,
} from "@/conf/subscription.tsx";
import { Plan, PlanItem } from "@/api/types.ts";
import Tips from "@/components/Tips.tsx";
import { NumberInput } from "@/components/ui/number-input.tsx";
import { Input } from "@/components/ui/input.tsx";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group.tsx";
import { MultiCombobox } from "@/components/ui/multi-combobox.tsx";
import { channelModels } from "@/admin/channel.ts";
import { Button } from "@/components/ui/button.tsx";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu.tsx";
import { toastState } from "@/admin/utils.ts";
import { useToast } from "@/components/ui/use-toast.ts";
import { dispatchSubscriptionData } from "@/store/globals.ts";
import { useDispatch } from "react-redux";

const planInitialConfig: PlanConfig = {
  enabled: false,
  plans: [],
};

function reducer(state: PlanConfig, action: Record<string, any>): PlanConfig {
  switch (action.type) {
    case "set":
      return action.payload;
    case "set-enabled":
      return {
        ...state,
        enabled: action.payload,
      };
    case "set-price":
      return {
        ...state,
        plans: state.plans.map((plan: Plan) => {
          if (plan.level === action.payload.level) {
            return {
              ...plan,
              price: action.payload.price,
            };
          }
          return plan;
        }),
      };
    case "set-item-id":
      return {
        ...state,
        plans: state.plans.map((plan: Plan) => {
          if (plan.level === action.payload.level) {
            return {
              ...plan,
              items: plan.items.map((item: PlanItem, index: number) => {
                if (index === action.payload.index) {
                  return {
                    ...item,
                    id: action.payload.id,
                  };
                }
                return item;
              }),
            };
          }
          return plan;
        }),
      };
    case "set-item-name":
      return {
        ...state,
        plans: state.plans.map((plan: Plan) => {
          if (plan.level === action.payload.level) {
            return {
              ...plan,
              items: plan.items.map((item: PlanItem, index: number) => {
                if (index === action.payload.index) {
                  return {
                    ...item,
                    name: action.payload.name,
                  };
                }
                return item;
              }),
            };
          }
          return plan;
        }),
      };
    case "set-item-value":
      return {
        ...state,
        plans: state.plans.map((plan: Plan) => {
          if (plan.level === action.payload.level) {
            return {
              ...plan,
              items: plan.items.map((item: PlanItem, index: number) => {
                if (index === action.payload.index) {
                  return {
                    ...item,
                    value: action.payload.value,
                  };
                }
                return item;
              }),
            };
          }
          return plan;
        }),
      };
    case "set-item-icon":
      return {
        ...state,
        plans: state.plans.map((plan: Plan) => {
          if (plan.level === action.payload.level) {
            return {
              ...plan,
              items: plan.items.map((item: PlanItem, index: number) => {
                if (index === action.payload.index) {
                  return {
                    ...item,
                    icon: action.payload.icon,
                  };
                }
                return item;
              }),
            };
          }
          return plan;
        }),
      };
    case "add-item":
      return {
        ...state,
        plans: state.plans.map((plan: Plan) => {
          if (plan.level === action.payload.level) {
            return {
              ...plan,
              items: [
                ...plan.items,
                {
                  id: "",
                  name: "",
                  value: 0,
                  icon: subscriptionIconsList[0],
                  models: [],
                },
              ],
            };
          }
          return plan;
        }),
      };
    case "set-item-models":
      return {
        ...state,
        plans: state.plans.map((plan: Plan) => {
          if (plan.level === action.payload.level) {
            return {
              ...plan,
              items: plan.items.map((item: PlanItem, index: number) => {
                if (index === action.payload.index) {
                  return {
                    ...item,
                    models: action.payload.models,
                  };
                }
                return item;
              }),
            };
          }
          return plan;
        }),
      };
    case "remove-item":
      return {
        ...state,
        plans: state.plans.map((plan: Plan) => {
          if (plan.level === action.payload.level) {
            return {
              ...plan,
              items: plan.items.filter(
                (_: PlanItem, index: number) => index !== action.payload.index,
              ),
            };
          }
          return plan;
        }),
      };
    case "upward-item":
      return {
        ...state,
        plans: state.plans.map((plan: Plan) => {
          if (plan.level === action.payload.level) {
            const items = plan.items;
            const index = action.payload.index;
            if (index > 0) {
              const tmp = items[index];
              items[index] = items[index - 1];
              items[index - 1] = tmp;
            }
            return {
              ...plan,
              items,
            };
          }
          return plan;
        }),
      };
    case "downward-item":
      return {
        ...state,
        plans: state.plans.map((plan: Plan) => {
          if (plan.level === action.payload.level) {
            const items = plan.items;
            const index = action.payload.index;
            if (index < items.length - 1) {
              const tmp = items[index];
              items[index] = items[index + 1];
              items[index + 1] = tmp;
            }
            return {
              ...plan,
              items,
            };
          }
          return plan;
        }),
      };
    case "import-item":
      const { level, id, target } = action.payload;
      const plan = state.plans.find((p: Plan) => p.level === level);
      const item = plan?.items.find((i: PlanItem) => i.id === id);
      if (!plan || !item) return state;

      return {
        ...state,
        plans: state.plans.map((p: Plan) => {
          if (p.level === target) {
            const items = p.items;
            items.push(item);
            return {
              ...p,
              items,
            };
          }
          return p;
        }),
      };
    default:
      throw new Error();
  }
}

type ItemIconEditorProps = {
  value: string;
  onValueChange: (value: string) => void;
};

function ItemIconEditor({ value, onValueChange }: ItemIconEditorProps) {
  return (
    <ToggleGroup
      variant={`outline`}
      type={`single`}
      value={value}
      onValueChange={onValueChange}
      className={`flex-wrap`}
    >
      {subscriptionIconsList.map((key, index) => (
        <ToggleGroupItem value={key} key={index}>
          <SubscriptionIcon type={key} className={`h-4 w-4`} />
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}

type ImportActionProps = {
  plans: Plan[];
  level: number;
  dispatch: (action: Record<string, any>) => void;
};

type ImportActionItem = {
  item: PlanItem;
  level: number;
};

function ImportAction({ plans, level, dispatch }: ImportActionProps) {
  const { t } = useTranslation();
  const usableItems = useMemo((): ImportActionItem[] => {
    const raw = plans.filter((p: Plan) => p.level !== level);
    return raw
      .map((p: Plan) =>
        p.items.map((item: PlanItem) => ({ level: p.level, item })),
      )
      .flat();
  }, [plans, level]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={`outline`}>
          <BookDashed className={`h-4 w-4 mr-1`} />
          {t("admin.plan.import-item")}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {usableItems.map(
          ({ level: from, item }: ImportActionItem, index: number) => (
            <DropdownMenuItem
              key={index}
              onClick={() => {
                dispatch({
                  type: "import-item",
                  payload: { level: from, id: item.id, target: level },
                });
              }}
            >
              {t(`sub.${getPlanName(from)}`)} - {item.name} ({item.id})
            </DropdownMenuItem>
          ),
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function PlanConfig() {
  const { t } = useTranslation();
  const [form, formDispatch] = useReducer(reducer, planInitialConfig);
  const [loading, setLoading] = useState<boolean>(false);
  const dispatch = useDispatch();
  const { toast } = useToast();

  useEffectAsync(async () => {
    setLoading(true);
    const res = await getPlanConfig();
    formDispatch({ type: "set", payload: res });
    setLoading(false);
  }, []);

  const save = async () => {
    const res = await setPlanConfig(form);
    toastState(toast, t, res, true);
    if (res.status)
      dispatchSubscriptionData(dispatch, form.enabled ? form.plans : []);
  };

  return (
    <div className={`plan-config`}>
      <div className={`plan-config-row`}>
        <p>
          {t("admin.plan.enable")}
          {loading && (
            <Loader2 className={`h-4 w-4 ml-1 inline-block animate-spin`} />
          )}
        </p>
        <div className={`grow`} />
        <Switch
          checked={form.enabled}
          onCheckedChange={(checked: boolean) =>
            formDispatch({ type: "set-enabled", payload: checked })
          }
        />
      </div>

      {form.enabled &&
        form.plans.map((plan: Plan, index: number) => (
          <div className={`plan-config-card`} key={index}>
            <p className={`plan-config-title`}>
              {t(`sub.${getPlanName(plan.level)}`)}
            </p>
            <div className={`plan-editor-row`}>
              <p className={`select-none flex flex-row items-center mr-2`}>
                {t("admin.plan.price")}
                <Tips
                  className={`inline-block translate-y-[2px]`}
                  content={t("admin.plan.price-tip")}
                />
              </p>
              <NumberInput
                value={plan.price}
                onValueChange={(value: number) => {
                  formDispatch({
                    type: "set-price",
                    payload: { level: plan.level, price: value },
                  });
                }}
              />
            </div>
            <div className={`plan-items-wrapper`}>
              {plan.items.map((item: PlanItem, index: number) => (
                <div className={`plan-item`} key={index}>
                  <div className={`plan-editor-row`}>
                    <p className={`plan-editor-label mr-2`}>
                      {t(`admin.plan.item-id`)}
                      <Tips content={t("admin.plan.item-id-placeholder")} />
                    </p>
                    <Input
                      value={item.id}
                      onChange={(e) => {
                        formDispatch({
                          type: "set-item-id",
                          payload: {
                            level: plan.level,
                            id: e.target.value,
                            index,
                          },
                        });
                      }}
                      placeholder={t(`admin.plan.item-id-placeholder`)}
                    />
                  </div>
                  <div className={`plan-editor-row`}>
                    <p className={`plan-editor-label mr-2`}>
                      {t(`admin.plan.item-name`)}
                      <Tips content={t("admin.plan.item-name-placeholder")} />
                    </p>
                    <Input
                      value={item.name}
                      onChange={(e) => {
                        formDispatch({
                          type: "set-item-name",
                          payload: {
                            level: plan.level,
                            name: e.target.value,
                            index,
                          },
                        });
                      }}
                      placeholder={t(`admin.plan.item-name-placeholder`)}
                    />
                  </div>
                  <div className={`plan-editor-row`}>
                    <p className={`plan-editor-label mr-2`}>
                      {t(`admin.plan.item-value`)}
                      <Tips content={t("admin.plan.item-value-tip")} />
                    </p>
                    <NumberInput
                      value={item.value}
                      onValueChange={(value: number) => {
                        formDispatch({
                          type: "set-item-value",
                          payload: { level: plan.level, value, index },
                        });
                      }}
                    />
                  </div>
                  <div className={`plan-editor-row`}>
                    <p className={`plan-editor-label mr-2`}>
                      {t(`admin.plan.item-models`)}
                      <Tips content={t("admin.plan.item-models-tip")} />
                    </p>
                    <MultiCombobox
                      align={`start`}
                      value={item.models}
                      onChange={(value: string[]) => {
                        formDispatch({
                          type: "set-item-models",
                          payload: { level: plan.level, models: value, index },
                        });
                      }}
                      placeholder={t(`admin.plan.item-models-placeholder`, {
                        length: item.models.length,
                      })}
                      searchPlaceholder={t(
                        `admin.plan.item-models-search-placeholder`,
                      )}
                      list={channelModels}
                      className={`w-full max-w-full`}
                    />
                  </div>
                  <div className={`plan-editor-row`}>
                    <p className={`plan-editor-label mr-2`}>
                      {t(`admin.plan.item-icon`)}
                      <Tips content={t("admin.plan.item-icon-tip")} />
                    </p>
                    <div className={`grow`} />
                    <ItemIconEditor
                      value={item.icon}
                      onValueChange={(value: string) => {
                        formDispatch({
                          type: "set-item-icon",
                          payload: { level: plan.level, icon: value, index },
                        });
                      }}
                    />
                  </div>
                  <div className={`flex flex-row flex-wrap gap-1`}>
                    <div className={`grow`} />
                    <Button
                      variant={`outline`}
                      onClick={() => {
                        formDispatch({
                          type: "upward-item",
                          payload: { level: plan.level, index },
                        });
                      }}
                      disabled={index === 0}
                    >
                      <ChevronUp className={`h-4 w-4 mr-1`} />
                      {t("upward")}
                    </Button>
                    <Button
                      variant={`outline`}
                      onClick={() => {
                        formDispatch({
                          type: "downward-item",
                          payload: { level: plan.level, index },
                        });
                      }}
                      disabled={index === plan.items.length - 1}
                    >
                      <ChevronDown className={`h-4 w-4 mr-1`} />
                      {t("downward")}
                    </Button>
                    <Button
                      variant={`default`}
                      onClick={() => {
                        formDispatch({
                          type: "remove-item",
                          payload: { level: plan.level, index },
                        });
                      }}
                    >
                      <Trash className={`h-4 w-4 mr-1`} />
                      {t("remove")}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <div className={`plan-items-action`}>
              <div className={`grow`} />
              <ImportAction
                plans={form.plans}
                level={plan.level}
                dispatch={formDispatch}
              />
              <Button
                variant={`default`}
                onClick={() => {
                  formDispatch({
                    type: "add-item",
                    payload: { level: plan.level },
                  });
                }}
              >
                <Plus className={`h-4 w-4 mr-1`} />
                {t("admin.plan.add-item")}
              </Button>
            </div>
          </div>
        ))}
      <div className={`flex flex-row flex-wrap gap-1`}>
        <div className={`grow`} />
        <Button loading={true} onClick={save}>
          {t("save")}
        </Button>
      </div>
    </div>
  );
}

function Subscription() {
  const { t } = useTranslation();
  return (
    <div className={`admin-subscription`}>
      <Card className={`admin-card sub-card`}>
        <CardHeader className={`select-none`}>
          <CardTitle>{t("admin.subscription")}</CardTitle>
        </CardHeader>
        <CardContent>
          <PlanConfig />
        </CardContent>
      </Card>
    </div>
  );
}

export default Subscription;
