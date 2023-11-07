import { useSelector } from "react-redux";
import { selectMenu } from "@/store/menu.ts";
import React, { useMemo } from "react";
import { LayoutDashboard, Settings, Users } from "lucide-react";
import router from "@/router.tsx";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

type MenuItemProps = {
  title: string;
  icon: React.ReactNode;
  path: string;
};

function MenuItem({ title, icon, path }: MenuItemProps) {
  const location = useLocation();
  const active = useMemo(
    () =>
      location.pathname === `/admin${path}` ||
      location.pathname + "/" === `/admin${path}`,
    [location.pathname, path],
  );

  return (
    <div
      className={`menu-item ${active ? "active" : ""}`}
      onClick={() => router.navigate(`/admin${path}`)}
    >
      <div className={`menu-item-icon`}>{icon}</div>
      <div className={`menu-item-title`}>{title}</div>
    </div>
  );
}

function MenuBar() {
  const { t } = useTranslation();
  const open = useSelector(selectMenu);
  return (
    <div className={`admin-menu ${open ? "open" : ""}`}>
      <MenuItem
        title={t("admin.dashboard")}
        icon={<LayoutDashboard />}
        path={"/"}
      />
      <MenuItem title={t("admin.users")} icon={<Users />} path={"/users"} />
      <MenuItem
        title={t("admin.settings")}
        icon={<Settings />}
        path={"/settings"}
      />
    </div>
  );
}

export default MenuBar;
