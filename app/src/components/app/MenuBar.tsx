import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { logout, selectUsername } from "../../store/auth.ts";
import {
  openDialog as openQuotaDialog,
  quotaSelector,
} from "../../store/quota.ts";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu.tsx";
import { Button } from "../ui/button.tsx";
import {
  BadgeCent,
  Boxes,
  CalendarPlus,
  Cloud, Gift,
  ListStart,
  Plug,
} from "lucide-react";
import { openDialog as openSub } from "../../store/subscription.ts";
import { openDialog as openPackageDialog } from "../../store/package.ts";
import { openDialog as openInvitationDialog } from "../../store/invitation.ts";
import { openDialog as openSharingDialog } from "../../store/sharing.ts";
import { openDialog as openApiDialog } from "../../store/api.ts";

type MenuBarProps = {
  children: React.ReactNode;
  className?: string;
};

function MenuBar({ children, className }: MenuBarProps) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const username = useSelector(selectUsername);
  const quota = useSelector(quotaSelector);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
      <DropdownMenuContent className={className} align={`end`}>
        <DropdownMenuLabel className={`username`}>{username}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => dispatch(openQuotaDialog())}>
          <Cloud className={`h-4 w-4 mr-1`} />
          {quota}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => dispatch(openQuotaDialog())}>
          <BadgeCent className={`h-4 w-4 mr-1`} />
          {t("quota")}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => dispatch(openSub())}>
          <CalendarPlus className={`h-4 w-4 mr-1`} />
          {t("sub.title")}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => dispatch(openPackageDialog())}>
          <Boxes className={`h-4 w-4 mr-1`} />
          {t("pkg.title")}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => dispatch(openInvitationDialog())}>
          <Gift className={`h-4 w-4 mr-1`} />
          {t("invitation.title")}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => dispatch(openSharingDialog())}>
          <ListStart className={`h-4 w-4 mr-1`} />
          {t("share.manage")}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => dispatch(openApiDialog())}>
          <Plug className={`h-4 w-4 mr-1`} />
          {t("api.title")}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Button
            size={`sm`}
            className={`action-button`}
            onClick={() => dispatch(logout())}
          >
            {t("logout")}
          </Button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default MenuBar;
