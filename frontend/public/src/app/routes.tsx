import { createBrowserRouter, Navigate, useParams } from "react-router";
import { getRouterBasename } from "./utils/basePath";
import { SuperAppHome } from "./pages/SuperAppHome";
import { SuperAppFighterDetail } from "./pages/SuperAppFighterDetail";
import { ArticleDetail } from "./pages/ArticleDetail";
import { AboutKunKhmer } from "./pages/AboutKunKhmer";
import { Compare } from "./pages/Compare";
import { Account } from "./pages/Account";
import { EventDetail } from "./pages/EventDetail";
import { KunKhmerHub } from "./pages/KunKhmerHub";
import { BroadcasterPage, ClubPage, SponsorPage } from "./pages/PartnerPages";
import { NotFound } from "./pages/NotFound";

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
    // Rankings was removed (2026-09-28) until KKF can manage official rankings.
    path: "/rankings",
    element: <Navigate to="/fighters" replace />,
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
    path: "/events",
    element: <Navigate to="/matches?tab=events" replace />,
  },
  {
    path: "/events/:id",
    element: <EventDetail />,
  },
  {
    path: "/about",
    element: <AboutKunKhmer />,
  },
  {
    path: "/hub",
    element: <KunKhmerHub />,
  },
  {
    path: "/clubs/:slug",
    element: <ClubPage />,
  },
  {
    path: "/partners/sponsors/:slug",
    element: <SponsorPage />,
  },
  {
    path: "/partners/broadcasters/:slug",
    element: <BroadcasterPage />,
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
    element: <NotFound />,
  },
],
  { basename: getRouterBasename() }
);
