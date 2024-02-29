import "@/assets/pages/navbar.less";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import {
  selectAuthenticated,
  selectUsername,
  validateToken,
} from "@/store/auth.ts";
import { Button } from "@/components/ui/button.tsx";
import { Menu } from "lucide-react";
import { useEffect } from "react";
import { tokenField } from "@/conf/bootstrap.ts";
import { toggleMenu } from "@/store/menu.ts";
import ProjectLink from "@/components/ProjectLink.tsx";
import ModeToggle from "@/components/ThemeProvider.tsx";
import router from "@/router.tsx";
import MenuBar from "./MenuBar.tsx";
import { getMemory } from "@/utils/memory.ts";
import { goAuth } from "@/utils/app.ts";
import Avatar from "@/components/Avatar.tsx";
import { appLogo } from "@/conf/env.ts";
import Announcement from "@/components/app/Announcement.tsx";

function NavMenu() {
  const username = useSelector(selectUsername);

  return (
    <div className={`avatar`}>
      <MenuBar>
        <Button variant={`ghost`} size={`icon`}>
          <Avatar username={username} />
        </Button>
      </MenuBar>
    </div>
  );
}

function NavBar() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  useEffect(() => {
    validateToken(dispatch, getMemory(tokenField));
  }, []);
  const auth = useSelector(selectAuthenticated);

  return (
    <nav className={`navbar`}>
      <div className={`items`}>
        <Button
          size={`icon`}
          variant={`ghost`}
          onClick={() => dispatch(toggleMenu())}
        >
          <Menu />
        </Button>
        <img
          className={`logo`}
          src={appLogo}
          alt=""
          onClick={() => router.navigate("/")}
        />
        <div className={`grow`} />
        <ProjectLink />
        <Announcement />
        <ModeToggle />
        {auth ? (
          <NavMenu />
        ) : (
          <Button size={`sm`} onClick={goAuth}>
            {t("login")}
          </Button>
        )}
      </div>
    </nav>
  );
}

export default NavBar;
