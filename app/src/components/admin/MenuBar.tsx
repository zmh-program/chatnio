import { useDispatch, useSelector } from "react-redux";
import { closeMenu, selectMenu } from "@/store/menu.ts";
import React, { useMemo } from "react";
import {
  BookCopy,
  CalendarRange,
  CloudCog,
  FileClock,
  Gauge,
  GitFork,
  LogOut,
  Radio,
  Settings,
  Users,
} from "lucide-react";
import router from "@/router.tsx";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { mobile } from "@/utils/device.ts";
import { cn } from "@/components/ui/lib/utils.ts";

type MenuItemProps = {
  title: string;
  icon: React.ReactNode;
  path: string;
  exit?: boolean;
};

function MenuItem({ title, icon, path, exit }: MenuItemProps) {
  const location = useLocation();
  const dispatch = useDispatch();
  const active = useMemo(
    () =>
      !exit &&
      (location.pathname === `/admin${path}` ||
        location.pathname + "/" === `/admin${path}`),
    [location.pathname, path],
  );

  const redirect = async () => {
    if (exit) return await router.navigate("/");

    if (mobile) dispatch(closeMenu());
    await router.navigate(`/admin${path}`);
  };

  return (
    <div className={cn("menu-item", active && "active")} onClick={redirect}>
      <div className={`menu-item-icon`}>{icon}</div>
      <div className={`menu-item-title`}>{title}</div>
    </div>
  );
}

function MenuBar() {
  const { t } = useTranslation();
  const open = useSelector(selectMenu);
  return (
    <div className={cn("admin-menu", open && "open")}>
      <MenuItem title={t("admin.dashboard")} icon={<Gauge />} path={"/"} />
      <MenuItem title={t("admin.user")} icon={<Users />} path={"/users"} />
      <MenuItem
        title={t("admin.market.title")}
        icon={<BookCopy />}
        path={"/market"}
      />
      <MenuItem
        title={t("admin.broadcast")}
        icon={<Radio />}
        path={"/broadcast"}
      />
      <MenuItem
        title={t("admin.channel")}
        icon={<GitFork />}
        path={"/channel"}
      />
      <MenuItem title={t("admin.prize")} icon={<CloudCog />} path={"/charge"} />
      <MenuItem
        title={t("admin.subscription")}
        icon={<CalendarRange />}
        path={"/subscription"}
      />
      <MenuItem
        title={t("admin.settings")}
        icon={<Settings />}
        path={"/system"}
      />
      <MenuItem
        title={t("admin.logger.title")}
        icon={<FileClock />}
        path={"/logger"}
      />
      <MenuItem title={t("admin.exit")} icon={<LogOut />} path={""} exit />
    </div>
  );
}

export default MenuBar;
