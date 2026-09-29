import type { ComponentType } from "react";
import { createBrowserRouter, Navigate, useParams } from "react-router";
import { getRouterBasename } from "./utils/basePath";
import { SuperAppHome } from "./pages/SuperAppHome";

/**
 * Every page except the home shell loads on demand, so a visitor downloads only the code for the
 * pages they open (claude/updates/step5a-seo-speed-login.md).
 */
const page = <K extends string>(load: () => Promise<Record<K, ComponentType>>, name: K) => ({
  lazy: async () => ({ Component: (await load())[name] }),
});

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
    ...page(() => import("./pages/SuperAppFighterDetail"), "SuperAppFighterDetail"),
  },
  {
    path: "/article/:id",
    ...page(() => import("./pages/ArticleDetail"), "ArticleDetail"),
  },
  {
    // Rankings was removed (2026-09-28) until KKF can manage official rankings.
    path: "/rankings",
    element: <Navigate to="/fighters" replace />,
  },
  {
    path: "/compare",
    ...page(() => import("./pages/Compare"), "Compare"),
  },
  {
    path: "/account",
    ...page(() => import("./pages/Account"), "Account"),
  },
  {
    path: "/events",
    element: <Navigate to="/matches?tab=events" replace />,
  },
  {
    path: "/events/:id",
    ...page(() => import("./pages/EventDetail"), "EventDetail"),
  },
  {
    path: "/about",
    ...page(() => import("./pages/AboutKunKhmer"), "AboutKunKhmer"),
  },
  {
    path: "/hub",
    ...page(() => import("./pages/KunKhmerHub"), "KunKhmerHub"),
  },
  {
    path: "/clubs/:slug",
    ...page(() => import("./pages/PartnerPages"), "ClubPage"),
  },
  {
    path: "/partners/sponsors/:slug",
    ...page(() => import("./pages/PartnerPages"), "SponsorPage"),
  },
  {
    path: "/partners/broadcasters/:slug",
    ...page(() => import("./pages/PartnerPages"), "BroadcasterPage"),
  },
  // Partner pages used to live at these addresses (the partner was only in memory).
  { path: "/club-detail", element: <Navigate to="/strategic-partners?tab=clubs" replace /> },
  { path: "/sponsor-detail", element: <Navigate to="/strategic-partners?tab=sponsors" replace /> },
  { path: "/broadcast-detail", element: <Navigate to="/strategic-partners?tab=broadcasters" replace /> },
  { path: "/match-detail", element: <Navigate to="/matches" replace /> },
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
    ...page(() => import("./pages/NotFound"), "NotFound"),
  },
],
  { basename: getRouterBasename() }
);
