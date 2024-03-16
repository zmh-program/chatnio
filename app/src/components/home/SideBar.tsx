import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { selectAuthenticated, selectUsername } from "@/store/auth.ts";
import {
  closeMarket,
  selectCurrent,
  selectHistory,
  selectMaskItem,
  useConversationActions,
} from "@/store/chat.ts";
import React, { useRef, useState } from "react";
import { ConversationInstance } from "@/api/types.tsx";
import { useToast } from "@/components/ui/use-toast.ts";
import { extractMessage, filterMessage } from "@/utils/processor.ts";
import { copyClipboard } from "@/utils/dom.ts";
import { useEffectAsync, useAnimation } from "@/utils/hook.ts";
import { mobile, openWindow } from "@/utils/device.ts";
import { Button } from "@/components/ui/button.tsx";
import { selectMenu, setMenu } from "@/store/menu.ts";
import {
  Copy,
  Eraser,
  LogIn,
  MoreHorizontal,
  Paintbrush,
  Plus,
  RotateCw,
} from "lucide-react";
import ConversationSegment from "./ConversationSegment.tsx";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog.tsx";
import { getSharedLink, shareConversation } from "@/api/sharing.ts";
import { Input } from "@/components/ui/input.tsx";
import MenuBar from "@/components/app/MenuBar.tsx";
import { Separator } from "@/components/ui/separator.tsx";
import { goAuth } from "@/utils/app.ts";
import Avatar from "@/components/Avatar.tsx";
import { cn } from "@/components/ui/lib/utils.ts";
import { getNumberMemory } from "@/utils/memory.ts";

type Operation = {
  target: ConversationInstance | null;
  type: string;
};

type SidebarActionProps = {
  setOperateConversation: (operation: Operation) => void;
};

type ConversationListProps = {
  operateConversation: Operation;
  setOperateConversation: (operation: Operation) => void;
};

function SidebarAction({ setOperateConversation }: SidebarActionProps) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { toast } = useToast();
  const {
    toggle,
    refresh: refreshAction,
    removeAll: removeAllAction,
  } = useConversationActions();
  const refreshRef = useRef(null);
  const [removeAll, setRemoveAll] = useState<boolean>(false);

  const current = useSelector(selectCurrent);
  const mask = useSelector(selectMaskItem);

  async function handleDeleteAll(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    e.stopPropagation();

    (await removeAllAction())
      ? toast({
          title: t("conversation.delete-success"),
          description: t("conversation.delete-success-prompt"),
        })
      : toast({
          title: t("conversation.delete-failed"),
          description: t("conversation.delete-failed-prompt"),
        });

    await refreshAction();
    setOperateConversation({ target: null, type: "" });
    setRemoveAll(false);
  }

  return (
    <div className={`sidebar-action`}>
      <Button
        variant={`ghost`}
        size={`icon`}
        onClick={async () => {
          await toggle(-1);
          if (mobile) dispatch(setMenu(false));
          dispatch(closeMarket());
        }}
      >
        {current === -1 && mask ? (
          <Paintbrush className={`h-4 w-4`} />
        ) : (
          <Plus className={`h-4 w-4`} />
        )}
      </Button>
      <div className={`grow`} />
      <AlertDialog open={removeAll} onOpenChange={setRemoveAll}>
        <AlertDialogTrigger asChild>
          <Button variant={`ghost`} size={`icon`}>
            <Eraser className={`h-4 w-4`} />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("conversation.remove-all-title")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("conversation.remove-all-description")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("conversation.cancel")}</AlertDialogCancel>
            <Button
              variant={`destructive`}
              loading={true}
              onClick={handleDeleteAll}
            >
              {t("conversation.delete")}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <Button
        className={`refresh-action`}
        variant={`ghost`}
        size={`icon`}
        id={`refresh`}
        ref={refreshRef}
        onClick={() => {
          const hook = useAnimation(refreshRef, "active", 500);
          refreshAction().finally(hook);
        }}
      >
        <RotateCw className={`h-4 w-4`} />
      </Button>
    </div>
  );
}

function SidebarConversationList({
  operateConversation,
  setOperateConversation,
}: ConversationListProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { remove } = useConversationActions();
  const history: ConversationInstance[] = useSelector(selectHistory);
  const [shared, setShared] = useState<string>("");
  const current = useSelector(selectCurrent);

  async function handleDelete(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    e.stopPropagation();

    if (await remove(operateConversation?.target?.id || -1))
      toast({
        title: t("conversation.delete-success"),
        description: t("conversation.delete-success-prompt"),
      });
    else
      toast({
        title: t("conversation.delete-failed"),
        description: t("conversation.delete-failed-prompt"),
      });
    setOperateConversation({ target: null, type: "" });
  }

  async function handleShare(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    e.stopPropagation();

    const resp = await shareConversation(operateConversation?.target?.id || -1);
    if (resp.status) setShared(getSharedLink(resp.data));
    else
      toast({
        title: t("share.failed"),
        description: resp.message,
      });

    setOperateConversation({ target: null, type: "" });
  }

  return (
    <>
      <div className={`conversation-list`}>
        {history.length ? (
          history.map((conversation, i) => (
            <ConversationSegment
              operate={setOperateConversation}
              conversation={conversation}
              current={current}
              key={i}
            />
          ))
        ) : (
          <div className={`empty`}>{t("conversation.empty")}</div>
        )}
      </div>
      <AlertDialog
        open={
          operateConversation.type === "delete" && !!operateConversation.target
        }
        onOpenChange={(open) => {
          if (!open) setOperateConversation({ target: null, type: "" });
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("conversation.remove-title")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("conversation.remove-description")}
              <strong className={`conversation-name`}>
                {extractMessage(
                  filterMessage(operateConversation?.target?.name || ""),
                )}
              </strong>
              {t("end")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("conversation.cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              {t("conversation.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={
          operateConversation.type === "share" && !!operateConversation.target
        }
        onOpenChange={(open) => {
          if (!open) setOperateConversation({ target: null, type: "" });
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("share.title")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("share.description")}
              <strong className={`conversation-name`}>
                {extractMessage(
                  filterMessage(operateConversation?.target?.name || ""),
                )}
              </strong>
              {t("end")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("conversation.cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleShare}>
              {t("share.title")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={shared.length > 0}
        onOpenChange={(open) => {
          if (!open) {
            setShared("");
            setOperateConversation({ target: null, type: "" });
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("share.success")}</AlertDialogTitle>
            <AlertDialogDescription>
              <div className={`share-wrapper mt-4 mb-2`}>
                <Input value={shared} />
                <Button
                  variant={`default`}
                  size={`icon`}
                  onClick={async () => {
                    await copyClipboard(shared);
                    toast({
                      title: t("share.copied"),
                      description: t("share.copied-description"),
                    });
                  }}
                >
                  <Copy className={`h-4 w-4`} />
                </Button>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("close")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={async (e) => {
                e.preventDefault();
                e.stopPropagation();
                openWindow(shared, "_blank");
              }}
            >
              {t("share.view")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function SidebarMenu() {
  const username = useSelector(selectUsername);
  return (
    <div className={`sidebar-menu`}>
      <Separator orientation={`horizontal`} className={`mb-2`} />
      <MenuBar className={`menu-bar`}>
        <Button variant={`ghost`} className={`sidebar-wrapper`}>
          <Avatar username={username} />
          <span className={`username`}>{username}</span>
          <MoreHorizontal className={`h-4 w-4`} />
        </Button>
      </MenuBar>
    </div>
  );
}
function SideBar() {
  const { t } = useTranslation();
  const { refresh, toggle } = useConversationActions();
  const current = useSelector(selectCurrent);
  const open = useSelector(selectMenu);
  const auth = useSelector(selectAuthenticated);
  const [operateConversation, setOperateConversation] = useState<Operation>({
    target: null,
    type: "",
  });
  useEffectAsync(async () => {
    const resp = await refresh();

    const store = getNumberMemory("history_conversation", -1);
    if (current === store) return; // no need to dispatch current
    if (store === -1) return; // -1 is default, no need to dispatch
    if (!resp.map((item) => item.id).includes(store)) return; // not in the list, no need to dispatch
    await toggle(store);
  }, []);

  return (
    <div className={cn("sidebar", open && "open")}>
      {auth ? (
        <div className={`sidebar-content`}>
          <SidebarAction setOperateConversation={setOperateConversation} />
          <SidebarConversationList
            operateConversation={operateConversation}
            setOperateConversation={setOperateConversation}
          />
          <SidebarMenu />
        </div>
      ) : (
        <Button className={`login-action`} variant={`default`} onClick={goAuth}>
          <LogIn className={`h-3 w-3 mr-2`} /> {t("login")}
        </Button>
      )}
    </div>
  );
}

export default SideBar;
