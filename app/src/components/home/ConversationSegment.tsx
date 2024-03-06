import { mobile } from "@/utils/device.ts";
import { filterMessage } from "@/utils/processor.ts";
import { setMenu } from "@/store/menu.ts";
import {
  Loader2,
  MessageSquare,
  MoreHorizontal,
  PencilLine,
  Share2,
  Trash2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu.tsx";
import { useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { ConversationInstance } from "@/api/types.tsx";
import { useState } from "react";
import { closeMarket, useConversationActions } from "@/store/chat.ts";
import { cn } from "@/components/ui/lib/utils.ts";
import PopupDialog, { popupTypes } from "@/components/PopupDialog.tsx";
import { toastState } from "@/api/common.ts";
import { useToast } from "@/components/ui/use-toast.ts";

type ConversationSegmentProps = {
  conversation: ConversationInstance;
  current: number;
  operate: (conversation: {
    target: ConversationInstance;
    type: string;
  }) => void;
};
function ConversationSegment({
  conversation,
  current,
  operate,
}: ConversationSegmentProps) {
  const dispatch = useDispatch();
  const { toggle } = useConversationActions();
  const { t } = useTranslation();
  const { toast } = useToast();
  const { rename } = useConversationActions();
  const [open, setOpen] = useState(false);
  const [offset, setOffset] = useState(0);

  const [editDialog, setEditDialog] = useState(false);

  const loading = conversation.id <= 0;

  return (
    <div
      className={cn("conversation", current === conversation.id && "active")}
      onClick={async (e) => {
        const target = e.target as HTMLElement;
        if (
          target.classList.contains("delete") ||
          target.parentElement?.classList.contains("delete")
        )
          return;
        await toggle(conversation.id);
        if (mobile) dispatch(setMenu(false));
        dispatch(closeMarket());
      }}
      onContextMenu={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setOpen(true);
      }}
    >
      <MessageSquare className={`h-4 w-4 mr-1`} />
      <div className={`title`}>{filterMessage(conversation.name)}</div>
      <DropdownMenu
        open={open}
        onOpenChange={(state: boolean) => {
          setOpen(state);
          if (state) setOffset(new Date().getTime());
        }}
      >
        <DropdownMenuTrigger
          className={`flex flex-row outline-none`}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          <div className={cn("id", loading && "loading")}>
            {loading ? (
              <Loader2 className={`mr-0.5 h-4 w-4 animate-spin`} />
            ) : (
              conversation.id
            )}
          </div>
          <MoreHorizontal className={`more h-5 w-5`} />
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <PopupDialog
            title={t("conversation.edit-title")}
            open={editDialog}
            setOpen={setEditDialog}
            type={popupTypes.Text}
            name={t("title")}
            defaultValue={conversation.name}
            onSubmit={async (name) => {
              const resp = await rename(conversation.id, name);
              toastState(toast, t, resp, true);
              if (!resp.status) return false;

              setEditDialog(false);
              return true;
            }}
          />
          <DropdownMenuItem
            onClick={(e) => {
              // prevent click event from opening the dropdown menu
              if (offset + 500 > new Date().getTime()) return;

              e.preventDefault();
              e.stopPropagation();

              setEditDialog(true);
            }}
          >
            <PencilLine className={`h-4 w-4 mx-1`} />
            {t("conversation.edit-title")}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              operate({ target: conversation, type: "share" });

              setOpen(false);
            }}
          >
            <Share2 className={`h-4 w-4 mx-1`} />
            {t("share.share-conversation")}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              operate({ target: conversation, type: "delete" });

              setOpen(false);
            }}
          >
            <Trash2 className={`h-4 w-4 mx-1`} />
            {t("conversation.delete-conversation")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export default ConversationSegment;
