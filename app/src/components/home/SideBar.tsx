import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store";
import { selectAuthenticated } from "../../store/auth.ts";
import { selectCurrent, selectHistory } from "../../store/chat.ts";
import { useRef, useState } from "react";
import { ConversationInstance } from "../../conversation/types.ts";
import { useToast } from "../ui/use-toast.ts";
import {
  copyClipboard,
  extractMessage,
  filterMessage,
  mobile,
  useAnimation,
  useEffectAsync,
} from "../../utils.ts";
import {
  deleteConversation,
  toggleConversation,
  updateConversationList,
} from "../../conversation/history.ts";
import { Button } from "../ui/button.tsx";
import { setMenu } from "../../store/menu.ts";
import { Copy, LogIn, Plus, RotateCw } from "lucide-react";
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
} from "../ui/alert-dialog.tsx";
import {getSharedLink, shareConversation} from "../../conversation/sharing.ts";
import { Input } from "../ui/input.tsx";
import { login } from "../../conf.ts";

function SideBar() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const open = useSelector((state: RootState) => state.menu.open);
  const auth = useSelector(selectAuthenticated);
  const current = useSelector(selectCurrent);
  const [operateConversation, setOperateConversation] = useState<{
    target: ConversationInstance | null;
    type: string;
  }>({ target: null, type: "" });
  const { toast } = useToast();
  const history: ConversationInstance[] = useSelector(selectHistory);
  const refresh = useRef(null);
  const [shared, setShared] = useState<string>("");
  useEffectAsync(async () => {
    await updateConversationList(dispatch);
  }, []);

  // @ts-ignore
  return (
    <div className={`sidebar ${open ? "open" : ""}`}>
      {auth ? (
        <div className={`sidebar-content`}>
          <div className={`sidebar-action`}>
            <Button
              variant={`ghost`}
              size={`icon`}
              onClick={async () => {
                await toggleConversation(dispatch, -1);
                if (mobile) dispatch(setMenu(false));
              }}
            >
              <Plus className={`h-4 w-4`} />
            </Button>
            <div className={`grow`} />
            <Button
              className={`refresh-action`}
              variant={`ghost`}
              size={`icon`}
              id={`refresh`}
              ref={refresh}
              onClick={() => {
                const hook = useAnimation(refresh, "active", 500);
                updateConversationList(dispatch)
                  .catch(() =>
                    toast({
                      title: t("conversation.refresh-failed"),
                      description: t("conversation.refresh-failed-prompt"),
                    }),
                  )
                  .finally(hook);
              }}
            >
              <RotateCw className={`h-4 w-4`} />
            </Button>
          </div>
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
              operateConversation.type === "delete" &&
              !!operateConversation.target
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
                <AlertDialogCancel>
                  {t("conversation.cancel")}
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={async (e) => {
                    e.preventDefault();
                    e.stopPropagation();

                    if (
                      await deleteConversation(
                        dispatch,
                        operateConversation?.target?.id || -1,
                      )
                    )
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
                  }}
                >
                  {t("conversation.delete")}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <AlertDialog
            open={
              operateConversation.type === "share" &&
              !!operateConversation.target
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
                <AlertDialogCancel>
                  {t("conversation.cancel")}
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={async (e) => {
                    e.preventDefault();
                    e.stopPropagation();

                    const resp = await shareConversation(
                      operateConversation?.target?.id || -1,
                    );
                    if (resp.status)
                      setShared(getSharedLink(resp.data));
                    else
                      toast({
                        title: t("share.failed"),
                        description: resp.message,
                      });

                    setOperateConversation({ target: null, type: "" });
                  }}
                >
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
                    window.open(shared, "_blank");
                  }}
                >
                  {t("share.view")}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      ) : (
        <Button className={`login-action`} variant={`default`} onClick={login}>
          <LogIn className={`h-3 w-3 mr-2`} /> {t("login")}
        </Button>
      )}
    </div>
  );
}

export default SideBar;
