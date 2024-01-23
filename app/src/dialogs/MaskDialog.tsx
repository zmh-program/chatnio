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
import { closeMask, selectMask, setMask } from "@/store/chat.ts";
import { MASKS } from "@/masks/prompts.ts";
import { Mask } from "@/masks/types.ts";
import { Input } from "@/components/ui/input.tsx";
import { useMemo, useState } from "react";
import { splitList } from "@/utils/base.ts";
import { maskEvent } from "@/events/mask.ts";

function getEmojiSource(emoji: string): string {
  return `https://cdn.staticfile.net/emoji-datasource-apple/15.0.1/img/apple/64/${emoji}.png`;
}

function MaskItem({ mask }: { mask: Mask }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  return (
    <div
      className={`mask-item`}
      onClick={(e) => {
        e.preventDefault();

        maskEvent.emit(mask);
        dispatch(closeMask());
      }}
    >
      <img
        src={getEmojiSource(mask.avatar)}
        alt={``}
        className={`mask-avatar`}
      />
      <div className={`mask-content`}>
        <div className={`mask-name`}>{mask.name}</div>
        <div className={`mask-info`}>
          {t("mask.context", { length: mask.context.length })}
        </div>
      </div>
    </div>
  );
}

function MaskSelector() {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const arr = useMemo(() => {
    if (search.trim().length === 0) return MASKS;

    const raw = splitList(search.toLowerCase(), [" ", ",", ";", "-"]);
    return MASKS.filter((mask) => {
      return raw.every((keyword) =>
        mask.name.toLowerCase().includes(keyword.toLowerCase()),
      );
    });
  }, [search]);

  return (
    <div className={`mask-wrapper`}>
      <Input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder={t("mask.search")}
      />
      <div className={`mask-list`}>
        {arr.length > 0 ? (
          arr.map((mask, index) => <MaskItem key={index} mask={mask} />)
        ) : (
          <p className={`my-8 text-center`}>{t("conversation.empty")}</p>
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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("mask.title")}</DialogTitle>
          <DialogDescription asChild>
            <div className={`mask-dialog`}>
              <MaskSelector />
            </div>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}

export default MaskDialog;
