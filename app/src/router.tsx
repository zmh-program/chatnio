import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Home from "./routes/Home.tsx";
import NotFound from "./routes/NotFound.tsx";
import Auth from "./routes/Auth.tsx";
import Generation from "./routes/Generation.tsx";
import Sharing from "./routes/Sharing.tsx";

const router = createBrowserRouter([
  {
    id: "home",
    path: "/",
    Component: Home,
    ErrorBoundary: NotFound,
  },
  {
    id: "login",
    path: "/login",
    Component: Auth,
    ErrorBoundary: NotFound,
  },
  {
    id: "generation",
    path: "/generate",
    Component: Generation,
  },
  {
    id: "share",
    path: "/share/:hash",
    Component: Sharing,
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}

export default router;
