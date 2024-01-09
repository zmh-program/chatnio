import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";
import { useTranslation } from "react-i18next";
import {
  Dispatch,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";
import { Model as RawModel } from "@/api/types.ts";
import { supportModels } from "@/conf.ts";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import { Input } from "@/components/ui/input.tsx";
import { GripVertical, HelpCircle, Plus, Trash2 } from "lucide-react";
import { generateRandomChar, isUrl } from "@/utils/base.ts";
import Require from "@/components/Require.tsx";
import { Textarea } from "@/components/ui/textarea.tsx";
import { toast } from "sonner";
import Tips from "@/components/Tips.tsx";
import { Switch } from "@/components/ui/switch.tsx";
import { Toggle } from "@/components/ui/toggle.tsx";
import { marketEditableTags, modelImages } from "@/admin/market.ts";
import { Checkbox } from "@/components/ui/checkbox.tsx";
import { Button } from "@/components/ui/button.tsx";
import { updateMarket } from "@/admin/api/market.ts";
import { Combobox } from "@/components/ui/combo-box.tsx";
import { channelModels } from "@/admin/channel.ts";

type Model = RawModel & {
  seed?: string;
};

type MarketForm = Model[];

const initialState: MarketForm = [];

const generateSeed = () => generateRandomChar(8);

function reducer(state: MarketForm, action: any): MarketForm {
  switch (action.type) {
    case "set":
      return [
        ...action.payload.map((model: RawModel) => ({
          ...model,
          seed: generateSeed(),
        })),
      ];
    case "add":
      return [
        ...state,
        {
          ...action.payload,
          seed: generateSeed(),
        },
      ];
    case "new":
      return [
        ...state,
        {
          id: "",
          name: "",
          free: false,
          auth: false,
          description: "",
          high_context: false,
          default: false,
          tag: [],
          avatar: modelImages[0],
          seed: generateSeed(),
        },
      ];
    case "remove":
      let { idx } = action.payload;
      return [...state.slice(0, idx), ...state.slice(idx + 1)];
    case "update":
      let { index, data } = action.payload;
      return [...state.slice(0, index), data, ...state.slice(index + 1)];
    case "update-id":
      return [
        ...state.map((model, idx) => {
          if (idx === action.payload.idx) {
            return { ...model, id: action.payload.id };
          }
          return model;
        }),
      ];
    case "update-name":
      return [
        ...state.map((model, idx) => {
          if (idx === action.payload.idx) {
            return { ...model, name: action.payload.name };
          }
          return model;
        }),
      ];
    case "update-description":
      return [
        ...state.map((model, idx) => {
          if (idx === action.payload.idx) {
            return { ...model, description: action.payload.description };
          }
          return model;
        }),
      ];
    case "update-context":
      return [
        ...state.map((model, idx) => {
          if (idx === action.payload.idx) {
            return { ...model, high_context: action.payload.context };
          }
          return model;
        }),
      ];
    case "update-default":
      return [
        ...state.map((model, idx) => {
          if (idx === action.payload.idx) {
            return { ...model, default: action.payload.default };
          }
          return model;
        }),
      ];
    case "update-tags":
      return [
        ...state.map((model, idx) => {
          if (idx === action.payload.idx) {
            return { ...model, tag: action.payload.tags };
          }
          return model;
        }),
      ];
    case "add-tag":
      return [
        ...state.map((model, idx) => {
          if (idx === action.payload.idx) {
            const tag = model.tag || [];
            tag.push(action.payload.tag);
            return {
              ...model,
              tag: [...tag],
            };
          }
          return model;
        }),
      ];
    case "remove-tag":
      return [
        ...state.map((model, idx) => {
          if (idx === action.payload.idx) {
            const tag = model.tag || [];
            return {
              ...model,
              tag: tag.filter((t) => t !== action.payload.tag),
            };
          }
          return model;
        }),
      ];
    case "set-avatar":
      return [
        ...state.map((model, idx) => {
          if (idx === action.payload.idx) {
            return { ...model, avatar: action.payload.avatar };
          }
          return model;
        }),
      ];
    case "replace":
      const { from, to } = action.payload;
      const [removed] = state.splice(from, 1);
      state.splice(to, 0, removed);
      return [...state];
    default:
      throw new Error();
  }
}

type MarketTagsProps = {
  tag: string[] | undefined;
  idx: number;
  dispatch: Dispatch<any>;
};

function MarketTags({ tag, idx, dispatch }: MarketTagsProps) {
  const { t } = useTranslation();
  const tags = useMemo((): Record<string, boolean> => {
    const selected = tag || [];

    return marketEditableTags.reduce(
      (acc, name) => {
        acc[name] = selected.includes(name);
        return acc;
      },
      {} as Record<string, boolean>,
    );
  }, [tag]);

  return (
    <div className={`market-tags`}>
      {tags &&
        Object.keys(tags).map((name) => (
          <Toggle
            key={name}
            variant={`outline`}
            size={`sm`}
            pressed={tags[name]}
            className={`market-tag`}
            onPressedChange={(state) => {
              dispatch({
                type: state ? "add-tag" : "remove-tag",
                payload: {
                  idx,
                  tag: name,
                },
              });
            }}
          >
            {t(`tag.${name}`)}
          </Toggle>
        ))}
    </div>
  );
}

type MarketImageProps = {
  image: string;
  idx: number;
  dispatch: Dispatch<any>;
};

function MarketImage({ image, idx, dispatch }: MarketImageProps) {
  const { t } = useTranslation();

  const [customized, setCustomized] = useState<boolean>(false);
  const [customizedImage, setCustomizedImage] = useState<string>("");

  const targetImages = useMemo((): string[] => {
    return customized ? [...modelImages, image] : modelImages;
  }, [customized, image]);

  const setAvatar = (source: string) =>
    dispatch({
      type: "set-avatar",
      payload: {
        idx,
        avatar: source,
      },
    });

  return (
    <div className={`market-image-wrapper`}>
      <div className={`market-images`}>
        {targetImages.map((source) => (
          <Toggle
            key={source}
            variant={`outline`}
            size={`sm`}
            pressed={source === image}
            className={`market-image ${source === image ? "active" : ""}`}
            onPressedChange={(state) => {
              if (!state) return;
              if (customized) {
                setCustomized(false);
              }
              setAvatar(source);
            }}
          >
            {source ? (
              <img
                src={isUrl(source) ? customizedImage : `/icons/${source}`}
                alt={source}
              />
            ) : (
              <HelpCircle className={`h-6 w-6`} />
            )}
          </Toggle>
        ))}
      </div>
      <div className={`market-custom-image`}>
        <div className={`market-checkbox`}>
          <Checkbox
            checked={customized}
            onCheckedChange={(raw) => {
              const state = !!raw;
              setCustomized(state);
              setAvatar(state ? customizedImage : modelImages[0]);
            }}
          />
          {t("admin.market.custom-image")}
        </div>
        <Input
          value={customizedImage}
          placeholder={t("admin.market.custom-image-placeholder")}
          onChange={(e) => {
            setCustomizedImage(e.target.value);
            setAvatar(e.target.value);
          }}
          disabled={!customized}
        />
      </div>
    </div>
  );
}

function Market() {
  const { t } = useTranslation();
  const [form, dispatch] = useReducer(reducer, initialState);
  const timer = useRef<number | null>(null);
  const sync = useRef<boolean>(false);

  const update = async (): Promise<void> => {
    const resp = await updateMarket(form);

    if (!resp.status) {
      toast(t("admin.market.update-failed"), {
        description: t("admin.market.update-failed-prompt", {
          reason: resp.error,
        }),
      });
      return;
    }

    toast(t("admin.market.update-success"), {
      description: t("admin.market.update-success-prompt"),
    });
  };

  useEffect(() => {
    if (form.length === 0 && supportModels.length > 0) {
      dispatch({ type: "set", payload: [...supportModels] });
    }
    sync.current = true;
  }, [supportModels]);

  useEffect(() => {
    if (timer.current) {
      clearTimeout(timer.current);
    }

    timer.current = Number(
      setTimeout(async () => {
        if (sync.current) {
          sync.current = false;
          return;
        }

        console.debug(
          `[market] model market migrated, sync to server (models: ${form.length})`,
        );
        await update();
      }, 2000),
    );
  }, [form]);

  const doCheck = (index: number) => {
    return useMemo((): boolean => {
      const model = form[index];

      return model.id.trim().length > 0 && model.name.trim().length > 0;
    }, [form, index]);
  };

  return (
    <div className={`market`}>
      <Card className={`market-card`}>
        <CardHeader className={`flex flex-row items-center select-none`}>
          <CardTitle>{t("admin.market.title")}</CardTitle>
          <Button
            loading={true}
            className={`ml-auto mt-0 whitespace-nowrap`}
            size={`sm`}
            style={{ marginTop: 0 }}
            onClick={update}
          >
            {t("admin.market.update")}
          </Button>
        </CardHeader>
        <CardContent>
          <DragDropContext
            onDragEnd={(result) => {
              const { destination, source } = result;
              if (
                !destination ||
                destination.index === source.index ||
                destination.index === -1
              )
                return;

              const from = source.index;
              const to = destination.index;

              dispatch({ type: "replace", payload: { from, to } });
            }}
          >
            <Droppable droppableId={`admin-market`}>
              {(provided) => (
                <div
                  className={`market-list`}
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                >
                  {form.map((model, index) => (
                    <Draggable
                      draggableId={`admin-model-${model.seed}`}
                      index={index}
                      key={model.seed}
                    >
                      {(provided) => (
                        <div
                          className={`market-item ${
                            doCheck(index) ? "" : "error"
                          }`}
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                        >
                          <GripVertical className={`drop-icon h-4 w-4 mr-2`} />
                          <div className={`model-wrapper`}>
                            <div className={`market-row`}>
                              <span>
                                <Require />
                                {t("admin.market.model-name")}
                              </span>
                              <Input
                                value={model.name}
                                placeholder={t(
                                  "admin.market.model-name-placeholder",
                                )}
                                onChange={(e) => {
                                  dispatch({
                                    type: "update-name",
                                    payload: {
                                      idx: index,
                                      name: e.target.value,
                                    },
                                  });
                                }}
                              />
                            </div>
                            <div className={`market-row`}>
                              <span>
                                <Require />
                                {t("admin.market.model-id")}
                              </span>
                              <Combobox
                                value={model.id}
                                onChange={(id: string) => {
                                  dispatch({
                                    type: "update-id",
                                    payload: { idx: index, id },
                                  });
                                }}
                                className={`ml-auto`}
                                list={channelModels}
                                placeholder={t(
                                  "admin.market.model-id-placeholder",
                                )}
                              />
                            </div>
                            <div className={`market-row`}>
                              <span>{t("admin.market.model-description")}</span>
                              <Textarea
                                value={model.description || ""}
                                placeholder={t(
                                  "admin.market.model-description-placeholder",
                                )}
                                onChange={(e) => {
                                  dispatch({
                                    type: "update-description",
                                    payload: {
                                      idx: index,
                                      description: e.target.value,
                                    },
                                  });
                                }}
                              />
                            </div>
                            <div className={`market-row`}>
                              <span>
                                {t("admin.market.model-context")}
                                <Tips
                                  content={t("admin.market.model-context-tip")}
                                />
                              </span>
                              <Switch
                                className={`ml-auto`}
                                checked={model.high_context}
                                onCheckedChange={(state) => {
                                  dispatch({
                                    type: "update-context",
                                    payload: {
                                      idx: index,
                                      context: state,
                                    },
                                  });
                                }}
                              />
                            </div>
                            <div className={`market-row`}>
                              <span>
                                {t("admin.market.model-is-default")}
                                <Tips
                                  content={t(
                                    "admin.market.model-is-default-tip",
                                  )}
                                />
                              </span>
                              <Switch
                                className={`ml-auto`}
                                checked={model.default}
                                onCheckedChange={(state) => {
                                  dispatch({
                                    type: "update-default",
                                    payload: {
                                      idx: index,
                                      default: state,
                                    },
                                  });
                                }}
                              />
                            </div>
                            <div className={`market-row`}>
                              <span>{t("admin.market.model-tag")}</span>
                              <MarketTags
                                tag={model.tag}
                                idx={index}
                                dispatch={dispatch}
                              />
                            </div>
                            <div className={`market-row`}>
                              <span>{t("admin.market.model-image")}</span>
                              <MarketImage
                                image={model.avatar}
                                idx={index}
                                dispatch={dispatch}
                              />
                            </div>
                            <div className={`market-row`}>
                              <div className={`grow`} />
                              <Button
                                variant={`outline`}
                                size={`icon`}
                                onClick={() =>
                                  dispatch({
                                    type: "remove",
                                    payload: { idx: index },
                                  })
                                }
                              >
                                <Trash2 className={`h-4 w-4`} />
                              </Button>
                              {index === form.length - 1 && (
                                <Button
                                  size={`icon`}
                                  onClick={() => dispatch({ type: "new" })}
                                >
                                  <Plus className={`h-4 w-4`} />
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </CardContent>
      </Card>
    </div>
  );
}

export default Market;
