import {createBrowserRouter} from "react-router-dom";
import Home from "./routes/Home.tsx";
import NotFound from "./routes/NotFound.tsx";
import Auth from "./routes/Auth.tsx";

const router = createBrowserRouter([
  {
    id: 'home',
    path: '/',
    Component: Home,
    ErrorBoundary: NotFound,
  },
  {
    id: 'login',
    path: '/login',
    Component: Auth,
    ErrorBoundary: NotFound,
  },
]);

export default router;
