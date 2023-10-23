import "@/assets/navbar.less";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import {
  logout,
  selectAuthenticated,
  selectUsername,
  validateToken,
} from "../../store/auth.ts";
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
  Cloud,
  ListStart,
  Plug,
} from "lucide-react";
import { openDialog as openSub } from "../../store/subscription.ts";
import { openDialog as openPackageDialog } from "../../store/package.ts";
import { openDialog as openSharingDialog } from "../../store/sharing.ts";
import { openDialog as openApiDialog } from "../../store/api.ts";
import { useEffect } from "react";
import { login, tokenField } from "../../conf.ts";
import { toggleMenu } from "../../store/menu.ts";
import ProjectLink from "../ProjectLink.tsx";
import ModeToggle from "../ThemeProvider.tsx";
import I18nProvider from "../I18nProvider.tsx";
import router from "../../router.tsx";

function Menu() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const username = useSelector(selectUsername);
  const quota = useSelector(quotaSelector);

  return (
    <div className={`avatar`}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant={`ghost`} size={`icon`}>
            <img src={`https://api.deeptrain.net/avatar/${username}`} alt="" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align={`end`}>
          <DropdownMenuLabel className={`username`}>
            {username}
          </DropdownMenuLabel>
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
    </div>
  );
}

function NavBar() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  useEffect(() => {
    validateToken(dispatch, localStorage.getItem(tokenField) ?? "");
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
          src="/favicon.ico"
          alt=""
          onClick={() => router.navigate("/")}
        />
        <div className={`grow`} />
        <ProjectLink />
        <ModeToggle />
        <I18nProvider />
        {auth ? (
          <Menu />
        ) : (
          <Button size={`sm`} onClick={login}>
            {t("login")}
          </Button>
        )}
      </div>
    </nav>
  );
}

export default NavBar;
