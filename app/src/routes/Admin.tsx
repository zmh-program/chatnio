import "@/assets/admin/all.less";
import MenuBar from "@/components/admin/MenuBar.tsx";
import { Outlet } from "react-router-dom";

function Admin() {
  return (
    <div className={`admin-page`}>
      <MenuBar />
      <div className={`admin-content`}>
        <Outlet />
      </div>
    </div>
  );
}

export default Admin;
