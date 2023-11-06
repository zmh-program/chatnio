import {useSelector} from "react-redux";
import {selectMenu} from "@/store/menu.ts";
import React, {useEffect, useMemo, useState} from "react";
import {LayoutDashboard, Settings} from "lucide-react";
import router from "@/router.tsx";
import {useLocation} from "react-router-dom";

type MenuItemProps = {
  title: string;
  icon: React.ReactNode;
  path: string;
}

function MenuItem({ title, icon, path }: MenuItemProps) {
  const location = useLocation();
  const active = useMemo(() => (
    location.pathname === `/admin${path}` || (location.pathname + "/") === `/admin${path}`
  ), [location.pathname, path]);

  return (
    <div className={`menu-item ${active ? "active" : ""}`}
         onClick={() => router.navigate(`/admin${path}`)}
    >
      <div className={`menu-item-icon`}>
        {icon}
      </div>
      <div className={`menu-item-title`}>
        {title}
      </div>
    </div>
  )
}

function MenuBar() {
  const open = useSelector(selectMenu);
  const [close, setClose] = useState(false);
  useEffect(() => {
    if (open) setClose(false);
    else setTimeout(() => setClose(true), 200);
  }, [open]);

  return (
    <div className={`admin-menu ${open ? "open" : ""} ${close ? "close" : ""}`}>
      <MenuItem title={"Dashboard"} icon={<LayoutDashboard />} path={"/"} />
      <MenuItem title={"Dashboard"} icon={<Settings />} path={"/config"} />
    </div>
  )
}

export default MenuBar;
