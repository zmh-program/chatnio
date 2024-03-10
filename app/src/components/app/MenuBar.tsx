import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { logout, selectAdmin, selectUsername } from "@/store/auth.ts";
import { openDialog as openQuotaDialog, quotaSelector } from "@/store/quota.ts";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu.tsx";
import { Button } from "@/components/ui/button.tsx";
import {
  Boxes,
  CalendarPlus,
  Cloud,
  CloudOff,
  Gift,
  ListStart,
  Plug,
  Shield,
  User,
} from "lucide-react";
import { openDialog as openSub } from "@/store/subscription.ts";
import { openDialog as openPackageDialog } from "@/store/package.ts";
import { openDialog as openInvitationDialog } from "@/store/invitation.ts";
import { openDialog as openSharingDialog } from "@/store/sharing.ts";
import { openDialog as openApiDialog } from "@/store/api.ts";
import router from "@/router.tsx";
import { deeptrainEndpoint } from "@/conf/env.ts";
import React from "react";
import { subscriptionDataSelector } from "@/store/globals.ts";
import { openWindow } from "@/utils/device.ts";
import { DeeptrainOnly } from "@/conf/deeptrain.tsx";

type MenuBarProps = {
  children: React.ReactNode;
  className?: string;
};

function MenuBar({ children, className }: MenuBarProps) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const username = useSelector(selectUsername);
  const quota = useSelector(quotaSelector);
  const admin = useSelector(selectAdmin);

  const subscriptionData = useSelector(subscriptionDataSelector);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
      <DropdownMenuContent className={className} align={`end`}>
        <DropdownMenuLabel className={`username`}>{username}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => dispatch(openQuotaDialog())}>
          {!isNaN(quota) ? (
            <>
              <Cloud className={`h-4 w-4 mr-1`} />
              {quota.toFixed(2)}
            </>
          ) : (
            <>
              <CloudOff className={`h-4 w-4 mr-1 text-red-500`} />
              <p className={`text-red-500`}>{t("offline")}</p>
            </>
          )}
        </DropdownMenuItem>
        {subscriptionData.length > 0 && (
          <DropdownMenuItem onClick={() => dispatch(openSub())}>
            <CalendarPlus className={`h-4 w-4 mr-1`} />
            {t("sub.title")}
          </DropdownMenuItem>
        )}
        <DeeptrainOnly>
          <DropdownMenuItem onClick={() => dispatch(openPackageDialog())}>
            <Boxes className={`h-4 w-4 mr-1`} />
            {t("pkg.title")}
          </DropdownMenuItem>
        </DeeptrainOnly>
        <DropdownMenuItem onClick={() => dispatch(openInvitationDialog())}>
          <Gift className={`h-4 w-4 mr-1`} />
          {t("invitation.invitation")}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => dispatch(openSharingDialog())}>
          <ListStart className={`h-4 w-4 mr-1`} />
          {t("share.manage")}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => dispatch(openApiDialog())}>
          <Plug className={`h-4 w-4 mr-1`} />
          {t("api.title")}
        </DropdownMenuItem>
        <DeeptrainOnly>
          <DropdownMenuItem
            onClick={() => openWindow(`${deeptrainEndpoint}/home`)}
          >
            <User className={`h-4 w-4 mr-1`} />
            {t("my-account")}
          </DropdownMenuItem>
        </DeeptrainOnly>
        {admin && (
          <DropdownMenuItem onClick={() => router.navigate("/admin")}>
            <Shield className={`h-4 w-4 mr-1`} />
            {t("admin.users")}
          </DropdownMenuItem>
        )}
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
