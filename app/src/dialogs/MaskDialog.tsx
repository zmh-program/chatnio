import "@/assets/pages/mask.less";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog.tsx";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import {
  closeMask,
  selectCustomMasks,
  selectMask,
  setMask,
  updateMasks,
  useConversationActions,
} from "@/store/chat.ts";
import { MASKS } from "@/masks/prompts.ts";
import { CustomMask, initialCustomMask, Mask } from "@/masks/types.ts";
import { Input } from "@/components/ui/input.tsx";
import React, { useMemo, useReducer, useState } from "react";
import { splitList } from "@/utils/base.ts";
import { Button } from "@/components/ui/button.tsx";
import {
  ChevronDown,
  ChevronUp,
  FolderInput,
  MoreVertical,
  MousePointerSquareDashed,
  Pencil,
  Plus,
  RotateCw,
  Search,
  Trash,
} from "lucide-react";
import EmojiPicker, { Theme } from "emoji-picker-react";
import { themeSelector } from "@/store/globals.ts";
import { cn } from "@/components/ui/lib/utils.ts";
import Tips from "@/components/Tips.tsx";
import { getRoleIcon, Roles, UserRole } from "@/api/types.tsx";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer.tsx";
import { FlexibleTextarea } from "@/components/ui/textarea.tsx";
import Icon from "@/components/utils/Icon.tsx";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu.tsx";
import EditorProvider from "@/components/EditorProvider.tsx";
import { deleteMask, saveMask } from "@/api/mask.ts";
import { toastState } from "@/api/common.ts";
import { useToast } from "@/components/ui/use-toast.ts";
import { selectAuthenticated } from "@/store/auth.ts";

function getEmojiSource(emoji: string): string {
  return `https://cdn.staticfile.net/emoji-datasource-apple/15.0.1/img/apple/64/${emoji}.png`;
}

export function Emoji({
  emoji,
  className,
}: {
  emoji: string;
  className?: string;
}) {
  return (
    <img
      className={cn("select-none", className)}
      src={getEmojiSource(emoji)}
      alt={""}
    />
  );
}

type RoleActionProps = {
  role: string;
  onClick: (role: string) => void;
};

function RoleAction({ role, onClick }: RoleActionProps) {
  const icon = getRoleIcon(role);

  const toggle = () => {
    const index = Roles.indexOf(role);
    const next = (index + 1) % Roles.length;

    onClick(Roles[next]);
  };

  return (
    <Button
      variant={`outline`}
      size={`icon`}
      className={`shrink-0`}
      onClick={toggle}
    >
      <Icon icon={icon} className={`h-4 w-4`} />
    </Button>
  );
}

type MaskItemProps = {
  mask: Mask | CustomMask;
  event: (e: any) => void;
  custom?: boolean;
};

function MaskItem({ mask, event, custom }: MaskItemProps) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { toast } = useToast();

  const { mask: setMask } = useConversationActions();

  const [open, setOpen] = useState(false);

  const prevent = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <div
      className={`mask-item`}
      onClick={(e) => {
        e.preventDefault();

        setMask(mask);
        dispatch(closeMask());
      }}
    >
      <Emoji emoji={mask.avatar} className={`mask-avatar`} />
      <div className={`mask-content`}>
        <div className={`mask-name`}>{mask.name}</div>
        <div className={`mask-info`}>
          {t("mask.context", { length: mask.context.length })}
        </div>
      </div>
      <div className={`grow`} />
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant={`outline`}
            size={`icon`}
            className={`mr-4`}
            onClick={(e) => prevent(e)}
          >
            <MoreVertical className={`h-4 w-4`} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align={`end`}>
          <DropdownMenuItem
            onClick={(e) => {
              prevent(e);

              setMask(mask);
              dispatch(closeMask());

              setOpen(false);
            }}
          >
            <MousePointerSquareDashed className={`h-4 w-4 mr-2`} />
            {t("mask.actions.use")}
          </DropdownMenuItem>

          {custom && (
            <DropdownMenuItem
              onClick={(e) => {
                prevent(e);
                event({ type: "set-mask", payload: mask });

                setOpen(false);
              }}
            >
              <Pencil className={`h-4 w-4 mr-2`} />
              {t("mask.actions.edit")}
            </DropdownMenuItem>
          )}

          <DropdownMenuItem
            onClick={(e) => {
              prevent(e);
              event({ type: "import-mask", payload: mask });

              setOpen(false);
            }}
          >
            <FolderInput className={`h-4 w-4 mr-2`} />
            {t("mask.actions.clone")}
          </DropdownMenuItem>

          {custom && (
            <DropdownMenuItem
              onClick={async (e) => {
                prevent(e);

                const resp = await deleteMask((mask as CustomMask).id);
                toastState(toast, t, resp, true);
                if (!resp.status) return;

                await updateMasks(dispatch);

                setOpen(false);
              }}
            >
              <Trash className={`h-4 w-4 mr-2`} />
              {t("mask.actions.delete")}
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

type MaskActionProps = {
  children: React.ReactNode;
  disabled?: boolean;
  onClick?: () => void;
};

function MaskAction({ children, disabled, onClick }: MaskActionProps) {
  return (
    <div
      className={cn(`mask-action`, disabled && "disabled")}
      onClick={disabled ? undefined : onClick}
    >
      {children}
    </div>
  );
}

type CustomMaskDialogProps = {
  mask: CustomMask;
  dispatch: (action: any) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function CustomMaskDialog({
  mask,
  dispatch,
  open,
  onOpenChange,
}: CustomMaskDialogProps) {
  const { t } = useTranslation();
  const { toast } = useToast();

  const auth = useSelector(selectAuthenticated);
  const theme = useSelector(themeSelector);

  const [picker, setPicker] = useState(false);

  const [editor, setEditor] = useState(false);
  const [editorIndex, setEditorIndex] = useState(-1);

  const global = useDispatch();

  const openEditor = (index: number) => {
    setEditorIndex(index);
    setEditor(true);
  };

  const post = async () => {
    const data = { ...mask };
    data.context = mask.context.filter(
      (item) => item.content.trim().length > 0,
    );

    if (data.name.trim().length === 0) return;
    if (data.context.length === 0) return;

    const resp = await saveMask(data);
    toastState(toast, t, resp, true);

    if (!resp.status) return;

    await updateMasks(global);
    onOpenChange(false);
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <div className={`mask-drawer-viewport py-4 max-w-[620px] mx-auto`}>
          <DrawerHeader>
            <DrawerTitle className={`text-center mb-4`}>
              {mask.id !== -1 ? t("mask.edit") : t("mask.create")}
            </DrawerTitle>
            <DrawerDescription>
              <EditorProvider
                value={editor ? mask.context[editorIndex].content : ""}
                onChange={(content) =>
                  dispatch({
                    type: "update-message-content",
                    index: editorIndex,
                    payload: content,
                  })
                }
                open={editor}
                setOpen={setEditor}
              />
              <div
                className={`mask-editor-container no-scrollbar max-h-[60vh] overflow-y-auto`}
              >
                <div className={`mask-editor-row`}>
                  <div className={`mask-editor-column`}>
                    <p>{t("mask.avatar")}</p>
                    <div className={`grow`} />

                    <Tips
                      trigger={
                        <Button
                          variant={`outline`}
                          size={`icon`}
                          className={`shrink-0`}
                        >
                          <Emoji emoji={mask.avatar} className={`h-6 w-6`} />
                        </Button>
                      }
                      open={picker}
                      onOpenChange={setPicker}
                      align={`end`}
                      classNamePopup={`mask-picker-dialog`}
                      notHide
                    >
                      <EmojiPicker
                        className={`picker`}
                        height={360}
                        lazyLoadEmojis
                        skinTonesDisabled
                        theme={theme as Theme}
                        open={true}
                        searchPlaceHolder={t("mask.search-emoji")}
                        getEmojiUrl={getEmojiSource}
                        onEmojiClick={(emoji) => {
                          setPicker(false);
                          dispatch({
                            type: "update-avatar",
                            payload: emoji.unified,
                          });
                        }}
                      />
                    </Tips>
                  </div>
                  <div className={`mask-editor-column`}>
                    <p>{t("mask.name")}</p>
                    <Input
                      value={mask.name}
                      className={`ml-4`}
                      placeholder={t("mask.name-placeholder")}
                      onChange={(e) =>
                        dispatch({
                          type: "update-name",
                          payload: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className={`mask-editor-column`}>
                    <p>{t("mask.description")}</p>
                    <FlexibleTextarea
                      value={mask.description || ""}
                      className={`ml-4`}
                      placeholder={t("mask.description-placeholder")}
                      onChange={(e) =>
                        dispatch({
                          type: "update-description",
                          payload: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div className={`mask-conversation-list`}>
                  <div className={`mask-conversation-title`}>
                    {t("mask.conversation")}
                  </div>
                  {mask.context.map((item, index) => (
                    <div key={index} className={`mask-conversation-wrapper`}>
                      <div className={`mask-conversation`}>
                        <RoleAction
                          role={item.role}
                          onClick={(role) =>
                            dispatch({
                              type: "update-message-role",
                              index,
                              payload: role,
                            })
                          }
                        />
                        <FlexibleTextarea
                          className={`ml-4`}
                          value={item.content}
                          onChange={(e) =>
                            dispatch({
                              type: "update-message-content",
                              index,
                              payload: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className={`mask-actions`}>
                        <MaskAction
                          onClick={() =>
                            dispatch({ type: "new-message-below", index })
                          }
                        >
                          <Plus />
                        </MaskAction>
                        <MaskAction onClick={() => openEditor(index)}>
                          <Pencil />
                        </MaskAction>
                        <MaskAction
                          disabled={index === 0}
                          onClick={() =>
                            dispatch({
                              type: "change-index",
                              payload: { from: index, to: index - 1 },
                            })
                          }
                        >
                          <ChevronUp />
                        </MaskAction>
                        <MaskAction
                          disabled={index === mask.context.length - 1}
                          onClick={() =>
                            dispatch({
                              type: "change-index",
                              payload: { from: index, to: index + 1 },
                            })
                          }
                        >
                          <ChevronDown />
                        </MaskAction>
                        <MaskAction
                          disabled={mask.context.length === 1}
                          onClick={() =>
                            dispatch({ type: "remove-message", index })
                          }
                        >
                          <Trash />
                        </MaskAction>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </DrawerDescription>
          </DrawerHeader>
          <DrawerFooter>
            <Button loading={true} onClick={post} disabled={!auth}>
              {auth ? t("submit") : t("login-require")}
            </Button>
            <DrawerClose asChild>
              <Button variant="outline">{t("cancel")}</Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

function reducer(state: CustomMask, action: any): CustomMask {
  switch (action.type) {
    case "update-avatar":
      return { ...state, avatar: action.payload };
    case "update-name":
      return { ...state, name: action.payload };
    case "update-description":
      return { ...state, description: action.payload };
    case "set-conversation":
      return {
        ...state,
        context: action.payload,
      };
    case "new-message":
      return {
        ...state,
        context: [...state.context, { role: UserRole, content: "" }],
      };
    case "new-message-below":
      return {
        ...state,
        context: [
          ...state.context.slice(0, action.index + 1),
          { role: UserRole, content: "" },
          ...state.context.slice(action.index + 1),
        ],
      };
    case "update-message-role":
      return {
        ...state,
        context: state.context.map((item, idx) => {
          if (idx === action.index) return { ...item, role: action.payload };
          return item;
        }),
      };
    case "update-message-content":
      return {
        ...state,
        context: state.context.map((item, idx) => {
          if (idx === action.index) return { ...item, content: action.payload };
          return item;
        }),
      };
    case "change-index":
      const { from, to } = action.payload;
      const context = [...state.context];
      const [removed] = context.splice(from, 1);
      context.splice(to, 0, removed);
      return { ...state, context };
    case "remove-message":
      return {
        ...state,
        context: state.context.filter((_, idx) => idx !== action.index),
      };
    case "reset":
      return { ...initialCustomMask };
    case "set-mask":
      return {
        ...action.payload,
      };
    case "import-mask":
      return {
        ...action.payload,
        description: action.payload.description || "",
        id: -1,
      };
    default:
      return state;
  }
}

function searchMasks(search: string, masks: Mask[]): Mask[] {
  if (search.trim().length === 0) return masks;

  const raw = splitList(search.toLowerCase(), [" ", ",", ";", "-"]);
  return masks.filter((mask) => {
    return raw.every((keyword) =>
      mask.name.toLowerCase().includes(keyword.toLowerCase()),
    );
  });
}

function MaskSelector() {
  const { t } = useTranslation();
  const global = useDispatch();
  const [search, setSearch] = useState("");

  const custom_masks = useSelector(selectCustomMasks);

  const system = useMemo(() => searchMasks(search, MASKS), [MASKS, search]);
  const custom = useMemo(
    () => searchMasks(search, custom_masks),
    [custom_masks, search],
  );

  const [open, setOpen] = useState(false);
  const [selected, dispatch] = useReducer(reducer, { ...initialCustomMask });

  const [loading, setLoading] = useState(false);

  const event = (e: any) => {
    dispatch(e);
    setOpen(true);
  };

  return (
    <div className={`mask-wrapper`}>
      <CustomMaskDialog
        mask={selected}
        dispatch={dispatch}
        open={open}
        onOpenChange={setOpen}
      />
      <div
        className={`mask-header-actions flex flex-row translate-y-[-0.5rem] mb-1`}
      >
        <Button
          className={`shrink-0`}
          onClick={() => {
            dispatch({ type: "reset" });
            setOpen(true);
          }}
        >
          <Plus className={`h-4 w-4 mr-1`} />
          {t("mask.create")}
        </Button>
        <div className={`grow`} />
        <Button
          variant={`outline`}
          size={`icon`}
          className={`shrink-0`}
          onClick={async () => {
            setLoading(true);
            await updateMasks(global);
            setLoading(false);
          }}
        >
          <RotateCw className={cn(`h-4 w-4`, loading && "animate-spin")} />
        </Button>
      </div>
      <div className={`mask-header`}>
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t("mask.search")}
          className={`mr-2`}
        />
        <Button variant={`outline`} size={`icon`} className={`shrink-0`}>
          <Search className={`h-4 w-4`} />
        </Button>
      </div>

      <div className={`mask-viewport thin-scrollbar`}>
        {(custom.length > 0 || system.length === 0) && (
          <div className={`mask-col`}>
            <p className={`mask-col-title`}>{t("mask.custom")}</p>
            {
              <div className={`mask-list`}>
                {custom.length > 0 ? (
                  custom.map((mask, index) => (
                    <MaskItem key={index} mask={mask} event={event} custom />
                  ))
                ) : (
                  <p className={`my-12 text-center`}>
                    {t("conversation.empty")}
                  </p>
                )}
              </div>
            }
          </div>
        )}

        {(system.length > 0 || custom.length === 0) && (
          <div className={`mask-col`}>
            <p className={`mask-col-title`}>{t("mask.system")}</p>
            <div className={`mask-list`}>
              {system.length > 0 ? (
                system.map((mask, index) => (
                  <MaskItem key={index} mask={mask} event={event} />
                ))
              ) : (
                <p className={`my-12 text-center`}>{t("conversation.empty")}</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function MaskDialog() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const open = useSelector(selectMask);

  return (
    <Dialog open={open} onOpenChange={(open) => dispatch(setMask(open))}>
      <DialogContent className={`flex-dialog mask-dialog h-[70vh]`}>
        <DialogHeader>
          <DialogTitle>{t("mask.title")}</DialogTitle>
          <DialogDescription asChild>
            <div className={`mask-container w-full h-full`}>
              <MaskSelector />
            </div>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}

export default MaskDialog;
