import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";
import { useTranslation } from "react-i18next";
import { Dispatch, useEffect, useMemo, useReducer, useRef } from "react";
import { Model as RawModel } from "@/api/types.ts";
import { supportModels } from "@/conf.ts";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import { Input } from "@/components/ui/input.tsx";
import { GripVertical } from "lucide-react";
import { generateRandomChar } from "@/utils/base.ts";
import Require from "@/components/Require.tsx";
import { Textarea } from "@/components/ui/textarea.tsx";
import { toast } from "sonner";
import Tips from "@/components/Tips.tsx";
import { Switch } from "@/components/ui/switch.tsx";
import { Toggle } from "@/components/ui/toggle.tsx";
import { marketEditableTags, modelImages } from "@/admin/market.ts";

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

  return (
    <div className={`market-images`}>
      {modelImages.map((source) => (
        <Toggle
          key={source}
          variant={`outline`}
          size={`sm`}
          pressed={source === image}
          className={`market-image ${source === image ? "active" : ""}`}
          onPressedChange={(state) => {
            if (!state) return;
            dispatch({
              type: "set-avatar",
              payload: {
                idx,
                avatar: source,
              },
            });
          }}
        >
          <img src={`/icons/${source}`} alt={source} />
        </Toggle>
      ))}
    </div>
  );
}

function Market() {
  const { t } = useTranslation();
  const [form, dispatch] = useReducer(reducer, initialState);
  const timer = useRef<number | null>(null);
  const sync = useRef<boolean>(false);

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
      setTimeout(() => {
        if (sync.current) {
          sync.current = false;
          return;
        }

        console.debug(
          `[market] model market migrated, sync to server (models: ${form.length})`,
        );

        toast(t("admin.market.update-success"), {
          description: t("admin.market.update-success-prompt"),
        });
      }, 2000),
    );
    console.debug(
      `[market] model market changed, wait for sync... (triggered task id: ${timer.current})`,
    );
  }, [form]);

  return (
    <div className={`market`}>
      <Card className={`market-card`}>
        <CardHeader className={`select-none`}>
          <CardTitle>{t("admin.market.title")}</CardTitle>
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
                          className={`market-item`}
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
                              <Input
                                value={model.id}
                                placeholder={t(
                                  "admin.market.model-id-placeholder",
                                )}
                                onChange={(e) => {
                                  dispatch({
                                    type: "update-id",
                                    payload: {
                                      idx: index,
                                      id: e.target.value,
                                    },
                                  });
                                }}
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
