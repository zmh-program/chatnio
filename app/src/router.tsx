import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Home from "./routes/Home.tsx";
import NotFound from "./routes/NotFound.tsx";
import Auth from "./routes/Auth.tsx";
import { lazy, Suspense } from "react";

const Generation = lazy(() => import("@/routes/Generation.tsx"));
const Sharing = lazy(() => import("@/routes/Sharing.tsx"));
const Article = lazy(() => import("@/routes/Article.tsx"));
const Admin = lazy(() => import("@/routes/Admin.tsx"));

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
    element: (
      <Suspense>
        <Generation />
      </Suspense>
    ),
    ErrorBoundary: NotFound,
  },
  {
    id: "share",
    path: "/share/:hash",
    element: (
      <Suspense>
        <Sharing />
      </Suspense>
    ),
    ErrorBoundary: NotFound,
  },
  {
    id: "article",
    path: "/article",
    element: (
      <Suspense>
        <Article />
      </Suspense>
    ),
    ErrorBoundary: NotFound,
  },
  {
    id: "admin",
    path: "/admin",
    element: (
      <Suspense>
        <Admin />
      </Suspense>
    ),
    children: [],
    ErrorBoundary: NotFound,
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}

export default router;
