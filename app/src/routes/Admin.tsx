import "@/assets/admin/all.less";
import MenuBar from "@/components/admin/MenuBar.tsx";
import { Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectAdmin, selectInit } from "@/store/auth.ts";
import { useEffect } from "react";
import router from "@/router.tsx";
import { ScrollArea } from "@/components/ui/scroll-area.tsx";

function Admin() {
  const init = useSelector(selectInit);
  const admin = useSelector(selectAdmin);

  useEffect(() => {
    if (init && !admin) router.navigate("/");
  }, [init]);

  return (
    <div className={`admin-page`}>
      <MenuBar />
      <ScrollArea className={`admin-content`}>
        <Outlet />
      </ScrollArea>
    </div>
  );
}

export default Admin;
