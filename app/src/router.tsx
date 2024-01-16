import {
  createBrowserRouter,
  RouterProvider,
  useLocation,
  useNavigate,
} from "react-router-dom";
import Home from "./routes/Home.tsx";
import NotFound from "./routes/NotFound.tsx";
import Auth from "./routes/Auth.tsx";
import React, { Suspense, useEffect } from "react";
import { useDeeptrain } from "@/conf/env.ts";
import Register from "@/routes/Register.tsx";
import Forgot from "@/routes/Forgot.tsx";
import { lazyFactor } from "@/utils/loader.tsx";
import { useSelector } from "react-redux";
import { selectAdmin, selectAuthenticated, selectInit } from "@/store/auth.ts";

const Generation = lazyFactor(() => import("@/routes/Generation.tsx"));
const Sharing = lazyFactor(() => import("@/routes/Sharing.tsx"));
const Article = lazyFactor(() => import("@/routes/Article.tsx"));

const Admin = lazyFactor(() => import("@/routes/Admin.tsx"));
const Dashboard = lazyFactor(() => import("@/routes/admin/DashBoard.tsx"));
const Market = lazyFactor(() => import("@/routes/admin/Market.tsx"));
const Channel = lazyFactor(() => import("@/routes/admin/Channel.tsx"));
const System = lazyFactor(() => import("@/routes/admin/System.tsx"));
const Charge = lazyFactor(() => import("@/routes/admin/Charge.tsx"));
const Users = lazyFactor(() => import("@/routes/admin/Users.tsx"));
const Broadcast = lazyFactor(() => import("@/routes/admin/Broadcast.tsx"));
const Subscription = lazyFactor(
  () => import("@/routes/admin/Subscription.tsx"),
);
const Logger = lazyFactor(() => import("@/routes/admin/Logger.tsx"));

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
      element: (
        <AuthForbidden>
          <Auth />
        </AuthForbidden>
      ),
      ErrorBoundary: NotFound,
    },
    !useDeeptrain &&
      ({
        id: "register",
        path: "/register",
        element: (
          <AuthForbidden>
            <Register />
          </AuthForbidden>
        ),
        ErrorBoundary: NotFound,
      } as any),
    !useDeeptrain &&
      ({
        id: "forgot",
        path: "/forgot",
        element: (
          <AuthForbidden>
            <Forgot />
          </AuthForbidden>
        ),
        ErrorBoundary: NotFound,
      } as any),
    {
      id: "generation",
      path: "/generate",
      element: (
        <AuthRequired>
          <Suspense>
            <Generation />
          </Suspense>
        </AuthRequired>
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
        <AuthRequired>
          <Suspense>
            <Article />
          </Suspense>
        </AuthRequired>
      ),
      ErrorBoundary: NotFound,
    },
    {
      id: "admin",
      path: "/admin",
      element: (
        <AdminRequired>
          <Suspense>
            <Admin />
          </Suspense>
        </AdminRequired>
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
          id: "admin-market",
          path: "market",
          element: (
            <Suspense>
              <Market />
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
        {
          id: "admin-subscription",
          path: "subscription",
          element: (
            <Suspense>
              <Subscription />
            </Suspense>
          ),
        },
        {
          id: "admin-logger",
          path: "logger",
          element: (
            <Suspense>
              <Logger />
            </Suspense>
          ),
        },
      ],
      ErrorBoundary: NotFound,
    },
    {
      id: "not-found",
      path: "*",
      element: <NotFound />,
    },
  ].filter(Boolean),
);

export function AuthRequired({ children }: { children: React.ReactNode }) {
  const init = useSelector(selectInit);
  const authenticated = useSelector(selectAuthenticated);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (init && !authenticated) {
      navigate("/login", { state: { from: location.pathname } });
    }
  }, [init, authenticated]);

  return <>{children}</>;
}

export function AuthForbidden({ children }: { children: React.ReactNode }) {
  const init = useSelector(selectInit);
  const authenticated = useSelector(selectAuthenticated);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (init && authenticated) {
      navigate("/", { state: { from: location.pathname } });
    }
  }, [init, authenticated]);

  return <>{children}</>;
}

export function AdminRequired({ children }: { children: React.ReactNode }) {
  const init = useSelector(selectInit);
  const admin = useSelector(selectAdmin);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (init && !admin) {
      navigate("/", { state: { from: location.pathname } });
    }
  }, [init, admin]);

  return <>{children}</>;
}

export function AppRouter() {
  return <RouterProvider router={router} />;
}

export default router;
