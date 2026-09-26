import { createBrowserRouter, Navigate, useParams } from "react-router";
import { getRouterBasename } from "./utils/basePath";
import { SuperAppHome } from "./pages/SuperAppHome";
import { SuperAppFighterDetail } from "./pages/SuperAppFighterDetail";
import { ArticleDetail } from "./pages/ArticleDetail";
import { AboutKunKhmer } from "./pages/AboutKunKhmer";
import { Rankings } from "./pages/Rankings";
import { Compare } from "./pages/Compare";
import { Account } from "./pages/Account";

function LegacySuperAppRedirect() {
  const { section } = useParams();
  return <Navigate to={section ? `/${section}` : "/"} replace />;
}

function LegacySuperAppFighterRedirect() {
  const { id } = useParams();
  return <Navigate to={`/fighters/${id}`} replace />;
}

function LegacySuperAppArticleRedirect() {
  const { id } = useParams();
  return <Navigate to={`/article/${id}`} replace />;
}

export const router = createBrowserRouter(
  [
  {
    path: "/",
    element: <SuperAppHome />,
  },
  {
    path: "/fighters/:id",
    element: <SuperAppFighterDetail />,
  },
  {
    path: "/article/:id",
    element: <ArticleDetail />,
  },
  {
    path: "/rankings",
    element: <Rankings />,
  },
  {
    path: "/compare",
    element: <Compare />,
  },
  {
    path: "/account",
    element: <Account />,
  },
  {
    path: "/about",
    element: <AboutKunKhmer />,
  },
  {
    path: "/:section",
    element: <SuperAppHome />,
  },
  {
    path: "/superapp",
    element: <Navigate to="/" replace />,
  },
  {
    path: "/superapp/fighters/:id",
    element: <LegacySuperAppFighterRedirect />,
  },
  {
    path: "/superapp/article/:id",
    element: <LegacySuperAppArticleRedirect />,
  },
  {
    path: "/superapp/:section",
    element: <LegacySuperAppRedirect />,
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
],
  { basename: getRouterBasename() }
);
