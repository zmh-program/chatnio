import {RouterProvider } from "react-router-dom";
import "./assets/navbar.less";
import ModeToggle, {ThemeProvider} from "./components/ThemeProvider.tsx";
import {Button} from "./components/ui/button.tsx";
import router from "./router.ts";

function login() {
  location.href = "https://deeptrain.lightxi.com/login?app=chatnio"
}

function NavBar() {
  return (
    <nav className={`navbar`}>
      <div className={`items`}>
        <img className={`logo`} src="/favicon.ico" alt="" onClick={() => router.navigate('/')} />
        <div className={`grow`} />
        <ModeToggle />
        <Button size={`sm`} onClick={login}>Login</Button>
      </div>
    </nav>
  )
}

function App() {
  return (
    <>
      <NavBar />
      <ThemeProvider />
      <RouterProvider router={router} />
    </>
  )
}


export default App
