import {RouterProvider } from "react-router-dom";
import "./assets/navbar.less";
import ModeToggle, {ThemeProvider} from "./components/ThemeProvider.tsx";
import {Button} from "./components/ui/button.tsx";
import router from "./router.ts";
import I18nProvider from "./components/I18nProvider.tsx";
import ProjectLink from "./components/ProjectLink.tsx";
import {Menu} from "lucide-react";
import {Provider, useDispatch, useSelector} from "react-redux";
import {toggleMenu} from "./store/menu.ts";
import store from "./store/index.ts";
import {logout, selectAuthenticated, selectUsername, validateToken} from "./store/auth.ts";
import {useEffect} from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./components/ui/dropdown-menu.tsx";
import {Toaster} from "./components/ui/toaster.tsx";
import {login} from "./conf.ts";

function Settings() {
  const dispatch = useDispatch();
  const username = useSelector(selectUsername);

  return (
    <div className={`avatar`}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant={`ghost`} size={`icon`}>
            <img src={`https://api.deeptrain.net/avatar/${username}`} alt="" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align={`end`}>
          <DropdownMenuLabel className={`username`}>{ username }</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Quota</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Button size={`sm`} className={`action-button`} onClick={() => dispatch(logout())}>
              Logout
            </Button>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

function NavBar() {
  const dispatch = useDispatch();
  useEffect(() => {
    validateToken(dispatch, localStorage.getItem("token") ?? "");
  }, []);
  const auth = useSelector(selectAuthenticated);

  return (
    <nav className={`navbar`}>
      <div className={`items`}>
        <Button size={`icon`} variant={`ghost`} onClick={() => dispatch(toggleMenu())}>
          <Menu />
        </Button>
        <img className={`logo`} src="/favicon.ico" alt="" onClick={() => router.navigate('/')} />
        <div className={`grow`} />
        <ProjectLink />
        <ModeToggle />
        <I18nProvider />
        {
          auth ?
            <Settings />
            : <Button size={`sm`} onClick={login}>Login</Button>
        }
      </div>
    </nav>
  )
}

function App() {
  return (
    <Provider store={store}>
      <NavBar />
      <ThemeProvider />
      <RouterProvider router={router} />
      <Toaster />
    </Provider>
  )
}


export default App
