import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Home from "./routes/Home.tsx";
import NotFound from "./routes/NotFound.tsx";
import Auth from "./routes/Auth.tsx";
import { lazy, Suspense } from "react";
import { useDeeptrain } from "@/utils/env.ts";
import Register from "@/routes/Register.tsx";
import Forgot from "@/routes/Forgot.tsx";

const Generation = lazy(() => import("@/routes/Generation.tsx"));
const Sharing = lazy(() => import("@/routes/Sharing.tsx"));
const Article = lazy(() => import("@/routes/Article.tsx"));

const Admin = lazy(() => import("@/routes/Admin.tsx"));
const Dashboard = lazy(() => import("@/routes/admin/DashBoard.tsx"));
const Channel = lazy(() => import("@/routes/admin/Channel.tsx"));
const System = lazy(() => import("@/routes/admin/System.tsx"));
const Charge = lazy(() => import("@/routes/admin/Charge.tsx"));
const Users = lazy(() => import("@/routes/admin/Users.tsx"));
const Broadcast = lazy(() => import("@/routes/admin/Broadcast.tsx"));

const router = createBrowserRouter(
  [
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
    !useDeeptrain &&
      ({
        id: "register",
        path: "/register",
        Component: Register,
        ErrorBoundary: NotFound,
      } as any),
    !useDeeptrain &&
      ({
        id: "forgot",
        path: "/forgot",
        Component: Forgot,
        ErrorBoundary: NotFound,
      } as any),
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
      children: [
        {
          id: "admin-dashboard",
          path: "",
          element: (
            <Suspense>
              <Dashboard />
            </Suspense>
          ),
        },
        {
          id: "admin-users",
          path: "users",
          element: (
            <Suspense>
              <Users />
            </Suspense>
          ),
        },
        {
          id: "admin-channel",
          path: "channel",
          element: (
            <Suspense>
              <Channel />
            </Suspense>
          ),
        },
        {
          id: "admin-system",
          path: "system",
          element: (
            <Suspense>
              <System />
            </Suspense>
          ),
        },
        {
          id: "admin-charge",
          path: "charge",
          element: (
            <Suspense>
              <Charge />
            </Suspense>
          ),
        },
        {
          id: "admin-broadcast",
          path: "broadcast",
          element: (
            <Suspense>
              <Broadcast />
            </Suspense>
          ),
        },
      ],
      ErrorBoundary: NotFound,
    },
  ].filter(Boolean),
);

export function AppRouter() {
  return <RouterProvider router={router} />;
}

export default router;
