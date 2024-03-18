import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input.tsx";
import {
  ChevronLeft,
  ChevronRight,
  Cloud,
  DownloadCloud,
  GripVertical,
  Link,
  Plus,
  Search,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";
import React, { useMemo, useState } from "react";
import { isUrl, splitList } from "@/utils/base.ts";
import { Model } from "@/api/types.tsx";
import { useDispatch, useSelector } from "react-redux";
import {
  addModelList,
  closeMarket,
  removeModelList,
  selectModel,
  selectModelList,
  selectSupportModels,
  setModel,
  setSupportModels,
} from "@/store/chat.ts";
import { Button } from "@/components/ui/button.tsx";
import { levelSelector } from "@/store/subscription.ts";
import { teenagerSelector } from "@/store/package.ts";
import { ToastAction } from "@/components/ui/toast.tsx";
import { selectAuthenticated } from "@/store/auth.ts";
import { useToast } from "@/components/ui/use-toast.ts";
import { docsEndpoint } from "@/conf/env.ts";
import { goAuth } from "@/utils/app.ts";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "react-beautiful-dnd";
import { savePreferenceModels } from "@/conf/storage.ts";
import { cn } from "@/components/ui/lib/utils.ts";
import { Badge } from "@/components/ui/badge.tsx";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip.tsx";
import { useMobile } from "@/utils/device.ts";
import Tips from "@/components/Tips.tsx";
import { includingModelFromPlan } from "@/conf/subscription.tsx";
import { subscriptionDataSelector } from "@/store/globals.ts";
import {
  ChargeBaseProps,
  nonBilling,
  timesBilling,
  tokenBilling,
} from "@/admin/charge.ts";
import { ScrollArea } from "@/components/ui/scroll-area.tsx";

type SearchBarProps = {
  value: string;
  onChange: (value: string) => void;
};

function getTags(model: Model): string[] {
  let raw = model.tag || [];

  if (model.free && !raw.includes("free")) raw = ["free", ...raw];
  if (model.high_context && !raw.includes("high-context"))
    raw = ["high-context", ...raw];

  return raw;
}

export function getModelAvatar(avatar: string) {
  return isUrl(avatar) ? avatar : `/icons/${avatar}`;
}

function SearchBar({ value, onChange }: SearchBarProps) {
  const { t } = useTranslation();

  return (
    <div className={`search-bar`}>
      <Search size={16} className={`search-icon`} />
      <Input
        placeholder={t("market.search")}
        className={`rounded-full input-box`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <X
        size={16}
        className={cn("clear-icon", value.length > 0 && "active")}
        onClick={() => onChange("")}
      />
    </div>
  );
}

type ModelProps = React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLDivElement>,
  HTMLDivElement
> & {
  model: Model;
  className?: string;
  style?: React.CSSProperties;
  forwardRef?: React.Ref<HTMLDivElement>;
};

type PriceTagProps = ChargeBaseProps & {
  pro: boolean;
};

function PriceTag({ type, input, output, pro }: PriceTagProps) {
  const { t } = useTranslation();

  const className = cn("flex flex-row tag-item", pro && "pro");

  switch (type) {
    case nonBilling:
      return (
        <span className={className}>
          <Cloud className={`h-4 w-4 mr-1 translate-y-[1px]`} />
          {t("tag.badges.non-billing")}
        </span>
      );
    case timesBilling:
      return (
        <span className={className}>
          <Cloud className={`h-4 w-4 mr-1 translate-y-[1px]`} />
          {t("tag.badges.times-billing", { price: output })}
        </span>
      );
    case tokenBilling:
      return (
        <>
          <span className={className}>
            <UploadCloud className={`h-4 w-4 mr-1 translate-y-[1px]`} />
            {input.toFixed(2)} / 1k tokens
          </span>
          <span className={className}>
            <DownloadCloud className={`h-4 w-4 mr-1 translate-y-[1px]`} />
            {output.toFixed(2)} / 1k tokens
          </span>
        </>
      );
  }
}

function ModelItem({
  model,
  className,
  style,
  forwardRef,
  ...props
}: ModelProps) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { toast } = useToast();
  const list = useSelector(selectModelList);
  const current = useSelector(selectModel);

  const mobile = useMobile();

  const level = useSelector(levelSelector);
  const student = useSelector(teenagerSelector);
  const auth = useSelector(selectAuthenticated);

  const subscriptionData = useSelector(subscriptionDataSelector);

  const state = useMemo(() => {
    if (current === model.id) return 0;
    if (list.includes(model.id)) return 1;
    return 2;
  }, [model, current, list]);

  const pro = useMemo(() => {
    return includingModelFromPlan(subscriptionData, level, model.id);
  }, [subscriptionData, model, level, student]);

  const avatar = useMemo(() => {
    return isUrl(model.avatar) ? model.avatar : `/icons/${model.avatar}`;
  }, [model]);

  const tags = useMemo(
    (): string[] => getTags(model).filter((tag) => tag !== "free"),
    [model],
  );

  return (
    <div
      className={`model-item ${className}`}
      style={style}
      ref={forwardRef}
      {...props}
      onClick={() => {
        dispatch(addModelList(model.id));

        if (!auth && model.auth) {
          toast({
            title: t("login-require"),
            action: (
              <ToastAction altText={t("login")} onClick={goAuth}>
                {t("login")}
              </ToastAction>
            ),
          });
          return;
        }

        dispatch(setModel(model.id));
        dispatch(closeMarket());
      }}
    >
      <GripVertical className={`grip-icon h-4 w-4 translate-x-[-1rem]`} />
      <img className={`model-avatar`} src={avatar} alt={model.name} />
      <div className={`model-info`}>
        <div className={cn("model-name", pro && "pro")}>
          <p>{model.name}</p>
          {mobile ? (
            <Tips className={`market-tip`}>
              <div className={`flex flex-col items-center justify-center`}>
                <p>{t("market.model-api")}</p>
                <Badge className={`badge whitespace-nowrap mt-2`}>
                  {model.id}
                </Badge>
              </div>
            </Tips>
          ) : (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Badge
                    className={`badge whitespace-nowrap inline-block ml-2`}
                  >
                    {model.id}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>{t("market.model-api")}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        {model.description && (
          <p className={`model-description`}>{model.description}</p>
        )}
        <div className={`model-tag`}>
          {tags.map((tag, index) => {
            return (
              <span className={`tag-item`} key={index}>
                {t(`tag.${tag}`)}
              </span>
            );
          })}
          {model.price && <PriceTag {...model.price} pro={pro} />}
        </div>
      </div>
      <div className={`grow`} />
      <div className={`model-action`}>
        <Button
          size={`icon`}
          variant={`ghost`}
          className={`scale-90`}
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();

            if (state === 0) dispatch(closeMarket());
            else if (state === 1) dispatch(removeModelList(model.id));
            else dispatch(addModelList(model.id));
          }}
        >
          {state === 0 ? (
            <ChevronRight className={`h-4 w-4`} />
          ) : state === 1 ? (
            <Trash2 className={`w-4 h-4`} />
          ) : (
            <Plus className={`w-4 h-4`} />
          )}
        </Button>
      </div>
    </div>
  );
}

type MarketPlaceProps = {
  search: string;
};

function MarketPlace({ search }: MarketPlaceProps) {
  const { t } = useTranslation();
  const select = useSelector(selectModel);
  const supportModels = useSelector(selectSupportModels);
  const dispatch = useDispatch();

  const models = useMemo(() => {
    if (search.length === 0) return supportModels;
    // fuzzy search
    const raw = splitList(search.toLowerCase(), [" ", ",", ";", "-"]);
    return supportModels.filter((model) => {
      const name = model.name.toLowerCase();

      const tag = getTags(model);
      const tag_name = tag.join(" ").toLowerCase();
      const tag_translated_name = tag
        .map((item) => t(`tag.${item}`))
        .join(" ")
        .toLowerCase();
      const id = model.id.toLowerCase();

      return raw.every(
        (item) =>
          name.includes(item) ||
          tag_name.includes(item) ||
          tag_translated_name.includes(item) ||
          id.includes(item),
      );
    });
  }, [supportModels, search]);

  const queryIndex = (id: number) => {
    const model = models[id];
    if (!model) return -1;

    return supportModels.findIndex((item) => item.id === model.id);
  };

  const onDragEnd = (result: DropResult) => {
    const { destination, source } = result;
    if (
      !destination ||
      destination.index === source.index ||
      destination.index === -1
    )
      return;

    const from = queryIndex(source.index);
    const to = queryIndex(destination.index);
    if (from === -1 || to === -1) return;

    const list = [...supportModels];
    const [removed] = list.splice(from, 1);
    list.splice(to, 0, removed);

    dispatch(setSupportModels(list));
    savePreferenceModels(list);
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId={`model-market-droppable`}>
        {(provided) => (
          <div
            className={`model-list`}
            {...provided.droppableProps}
            ref={provided.innerRef}
          >
            {models.map((model, index) => (
              <Draggable key={model.id} draggableId={model.id} index={index}>
                {(provided) => (
                  <ModelItem
                    model={model}
                    className={cn(select === model.id && "active")}
                    forwardRef={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                  />
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}

function MarketHeader() {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  return (
    <div className={`market-header`}>
      <Button
        size={`icon`}
        variant={`ghost`}
        className={`close-action`}
        onClick={() => {
          dispatch(closeMarket());
        }}
      >
        <ChevronLeft className={`h-4 w-4`} />
      </Button>
      <p className={`title select-none text-center text-primary font-bold`}>
        {t("market.explore")}
      </p>
    </div>
  );
}

function MarketFooter() {
  const { t } = useTranslation();

  return (
    <div className={`market-footer`}>
      <a href={docsEndpoint} target={`_blank`}>
        <Link size={14} className={`mr-1`} />
        {t("pricing")}
      </a>
    </div>
  );
}

function ModelMarket() {
  const [search, setSearch] = useState<string>("");

  return (
    <ScrollArea className={`model-market`}>
      <div className={`market-wrapper`}>
        <MarketHeader />
        <SearchBar value={search} onChange={setSearch} />
        <MarketPlace search={search} />
        <MarketFooter />
      </div>
    </ScrollArea>
  );
}

export default ModelMarket;
