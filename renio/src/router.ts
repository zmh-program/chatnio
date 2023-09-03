import {createBrowserRouter} from "react-router-dom";
import Home from "./routes/Home.tsx";
import NotFound from "./routes/NotFound.tsx";

const router = createBrowserRouter([
  {
    id: 'home',
    path: '/',
    Component: Home,
    ErrorBoundary: NotFound,
  }
]);

export default router;
