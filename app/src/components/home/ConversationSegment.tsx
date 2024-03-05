import { mobile } from "@/utils/device.ts";
import { filterMessage } from "@/utils/processor.ts";
import { setMenu } from "@/store/menu.ts";
import {
  Loader2,
  MessageSquare,
  MoreHorizontal,
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
  const [open, setOpen] = useState(false);
  const [offset, setOffset] = useState(0);

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
    >
      <MessageSquare className={`h-4 w-4 mr-1`} />
      <div className={`title`}>{filterMessage(conversation.name)}</div>
      <div className={cn("id", loading && "loading")}>
        {loading ? (
          <Loader2 className={`mr-0.5 h-4 w-4 animate-spin`} />
        ) : (
          conversation.id
        )}
      </div>
      <DropdownMenu
        open={open}
        onOpenChange={(state: boolean) => {
          setOpen(state);
          if (state) setOffset(new Date().getTime());
        }}
      >
        <DropdownMenuTrigger
          className={`outline-none`}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          <MoreHorizontal className={`more h-5 w-5 p-0.5`} />
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem
            onClick={(e) => {
              // prevent click event from opening the dropdown menu
              if (offset + 500 > new Date().getTime()) return;

              e.preventDefault();
              e.stopPropagation();
              operate({ target: conversation, type: "delete" });

              setOpen(false);
            }}
          >
            <Trash2 className={`more h-4 w-4 mx-1`} />
            {t("conversation.delete-conversation")}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              operate({ target: conversation, type: "share" });

              setOpen(false);
            }}
          >
            <Share2 className={`more h-4 w-4 mx-1`} />
            {t("share.share-conversation")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export default ConversationSegment;
