import type { ComponentType } from "react";
import { createBrowserRouter } from "react-router";
import { PageSpinner } from "./components/PageSpinner";
import { getRouterBasename } from "./utils/basePath";
import { Layout } from "./components/Layout";
import { RedirectToHomeEvents } from "./pages/RedirectToHomeEvents";
import { RedirectToFighters } from "./pages/RedirectToFighters";
import { NotFound } from "./pages/NotFound";
import { Login } from "./pages/Login";
import { Navigate, useParams, useSearchParams } from "react-router";


/**
 * Every page loads on demand, so a phone downloads only the code of the screens it opens (the shell, login and
 * "not found" stay in the first file). Fast first load, small updates. See claude/updates/admin-pwa-performance.md.
 */
const page = (load: () => Promise<Record<string, any>>, name: string) => ({
  lazy: async () => {
    const m = await load();
    return { Component: (m[name] ?? m.default) as ComponentType };
  },
});

/** Old or removed admin URLs → the page that does that job now (Phase 2). */
function ToFightCard() {
  const { subEventId } = useParams();
  return <Navigate to={`/home/matches/${subEventId}`} replace />;
}
function ToFightCardPage() {
  const { batchId } = useParams();
  return <Navigate to={`/home/matches/${batchId}`} replace />;
}
function ToTitle() {
  const { id } = useParams();
  return <Navigate to={`/home/champion/${id}`} replace />;
}
/** The old Program page: ?tab=champions is Titles; ?tab=overview / events are Matches. */
function ProgramRedirect() {
  const [params] = useSearchParams();
  return <Navigate to={params.get("tab") === "champions" ? "/home/titles" : "/home/matches"} replace />;
}
function ToEvent() {
  const { eventId } = useParams();
  return <Navigate to={`/home/events/${eventId}`} replace />;
}
function ToMatch() {
  const { id } = useParams();
  return <Navigate to={`/home/match/${id}`} replace />;
}

export const router = createBrowserRouter(
  [
  {
    path: "/login",
    element: <Login />,
    HydrateFallback: PageSpinner,
  },
  {
    path: "/",
    element: <Navigate to="/home" replace />,
  },
  // Redirects for old event paths (backward compatibility)
  {
    path: "/events/new",
    element: <RedirectToHomeEvents />,
  },
  {
    path: "/events/:id",
    element: <RedirectToHomeEvents />,
  },
  // The printable program sheet of one match, outside the admin frame so it prints clean (claude/features/weekly-program.md).
  { path: "/events/:id/sheet", ...page(() => import("./pages/ProgramSheet"), "ProgramSheet") },
  {
    path: "/events/:eventId/sub-events/:subEventId",
    element: <RedirectToHomeEvents />,
  },
  {
    path: "/events/:eventId/sub-events/:subEventId/add-match",
    element: <RedirectToHomeEvents />,
  },
  {
    path: "/events/:eventId/add-match",
    element: <RedirectToHomeEvents />,
  },
  {
    path: "/champion/new",
    element: <RedirectToHomeEvents />,
  },
  {
    path: "/champion/:id",
    element: <RedirectToHomeEvents />,
  },
  {
    path: "/champion/:id/history",
    element: <RedirectToHomeEvents />,
  },
  // Redirects for old fighter paths (backward compatibility)
  {
    path: "/fighters",
    element: <RedirectToHomeEvents />,
  },
  {
    path: "/fighters/kunkhmer",
    element: <RedirectToHomeEvents />,
  },
  {
    path: "/fighters/foreigner",
    element: <RedirectToHomeEvents />,
  },
  {
    path: "/fighters/kunkhmer/new",
    element: <RedirectToHomeEvents />,
  },
  {
    path: "/fighters/foreigner/new",
    element: <RedirectToHomeEvents />,
  },
  {
    path: "/fighters/:id",
    element: <RedirectToHomeEvents />,
  },
  {
    path: "/fighters/:id/edit",
    element: <RedirectToHomeEvents />,
  },
  // Redirects for old match paths (backward compatibility)
  {
    path: "/matches",
    element: <RedirectToHomeEvents />,
  },
  {
    path: "/matches/new",
    element: <RedirectToHomeEvents />,
  },
  {
    path: "/matches/:batchId",
    element: <RedirectToHomeEvents />,
  },
  {
    path: "/matches/:batchId/create-match",
    element: <RedirectToHomeEvents />,
  },
  {
    path: "/matches/:batchId/assign-officials",
    element: <RedirectToHomeEvents />,
  },
  {
    path: "/match/:id",
    element: <RedirectToHomeEvents />,
  },
  {
    path: "/match/:id/update-result",
    element: <RedirectToHomeEvents />,
  },
  {
    path: "/batches/:batchId",
    element: <RedirectToHomeEvents />,
  },
  {
    path: "/batches/:batchId/share",
    element: <RedirectToHomeEvents />,
  },
  // Redirects for old club paths (backward compatibility)
  {
    path: "/clubs",
    element: <RedirectToHomeEvents />,
  },
  {
    path: "/clubs/new",
    element: <RedirectToHomeEvents />,
  },
  {
    path: "/home",
    element: <Layout />,
    HydrateFallback: PageSpinner,
    errorElement: <NotFound />,
    children: [
      { index: true, ...page(() => import("./pages/Home"), "Home") },
      { path: "fighters", ...page(() => import("./pages/Fighters"), "Fighters") },
      { path: "fighters/kunkhmer", ...page(() => import("./pages/Fighters"), "Fighters") },
      { path: "fighters/foreigner", ...page(() => import("./pages/Fighters"), "Fighters") },
      { path: "fighters/kunkhmer/new", ...page(() => import("./pages/AddFighter"), "AddFighter") },
      { path: "fighters/foreigner/new", ...page(() => import("./pages/AddFighter"), "AddFighter") },
      { path: "fighters/:id/edit", ...page(() => import("./pages/AddFighter"), "AddFighter") },
      { path: "fighters/:id", ...page(() => import("./pages/FighterDetail"), "FighterDetail") },
      { path: "clubs/:id", ...page(() => import("./pages/ClubDetail"), "ClubDetail") },
      { path: "clubs/:id/edit", ...page(() => import("./pages/AddClub"), "AddClub") },
      { path: "clubs/new", ...page(() => import("./pages/AddClub"), "AddClub") },
      { path: "clubs", ...page(() => import("./pages/Clubs"), "Clubs") },
      // The old "create fight card" form is gone: fight cards are added on their fight night page.
      { path: "matches/new", element: <Navigate to="/home/matches" replace /> },
      { path: "matches/:batchId/edit", element: <ToFightCardPage /> },
      { path: "matches/:batchId/create-match", ...page(() => import("./pages/AddBout"), "AddBout") },
      { path: "matches/:batchId/quick-bouts", ...page(() => import("./pages/QuickBouts"), "QuickBouts") },
      { path: "matches/:batchId/assign-officials", ...page(() => import("./pages/AssignOfficials"), "AssignOfficials") },
      { path: "matches/created", element: <Navigate to="/home/matches" replace /> },
      // The fight card lives on its fight night page now (claude/updates/program-officer-friendly.md).
      { path: "matches/:batchId", ...page(() => import("./components/program/FightCardRedirect"), "FightCardRedirect") },
      { path: "batches/:batchId", ...page(() => import("./components/program/FightCardRedirect"), "FightCardRedirect") },
      { path: "fight-cards/:cardId/weigh-in", ...page(() => import("./pages/FightCardWeighIn"), "FightCardWeighIn") },
      { path: "fight-cards/:cardId/results", ...page(() => import("./pages/FightCardResults"), "FightCardResults") },
      { path: "batches/:batchId/share", ...page(() => import("./pages/ShareFightCard"), "ShareFightCard") },
      // Program became Matches (list) + Titles; old Program links still land in the right place.
      { path: "program", element: <ProgramRedirect /> },
      { path: "matches", ...page(() => import("./pages/Matches"), "Matches") },
      { path: "titles", ...page(() => import("./pages/Titles"), "Titles") },
      { path: "matches-old", element: <Navigate to="/home/matches" replace /> },
      { path: "match/new", ...page(() => import("./pages/ScheduleTitleBout"), "ScheduleTitleBout") },
      { path: "match/:id", ...page(() => import("./pages/MatchDetail"), "MatchDetail") },
      { path: "match/:id/update-result", element: <ToMatch /> },
      { path: "events/new", ...page(() => import("./pages/NewFightNight"), "NewFightNight") },
      { path: "events/:eventId/assign-fighters", element: <ToEvent /> },
      { path: "events/:id/match-day", ...page(() => import("./pages/MatchDay"), "MatchDay") },
      { path: "events/:id", ...page(() => import("./pages/FightNight"), "FightNight") },
      { path: "events/:eventId/sub-events/:subEventId", element: <ToFightCard /> },
      { path: "events/:eventId/sub-events/:subEventId/add-match", element: <ToFightCard /> },
      { path: "events/:eventId/add-match", element: <ToEvent /> },
      { path: "events", element: <Navigate to="/home/matches" replace /> },
      { path: "champion", element: <Navigate to="/home/titles" replace /> },
      { path: "champion/new", ...page(() => import("./pages/CreateChampion"), "CreateChampion") },
      { path: "champion/:id", ...page(() => import("./pages/ChampionDetail"), "ChampionDetail") },
      { path: "champion/:id/schedule-defense", ...page(() => import("./pages/ScheduleTitleBout"), "ScheduleTitleBout") },
      { path: "champion/:id/edit", ...page(() => import("./pages/CreateChampion"), "CreateChampion") },
      // The history is on the title page now.
      { path: "champion/:id/history", element: <ToTitle /> },
      { path: "kkf-workflow", element: <Navigate to="/home" replace /> },
      { path: "kkf-workflow/:requestId", element: <Navigate to="/home" replace /> },
      { path: "profile", ...page(() => import("./pages/Profile"), "Profile") },
      { path: "match-proposals", ...page(() => import("./pages/MatchProposals"), "MatchProposals") },
      { path: "officials", ...page(() => import("./pages/Officials"), "Officials") },
      { path: "kkf-officers", element: <Navigate to="/home/officials" replace /> },
      { path: "my-bouts", ...page(() => import("./pages/MyBouts"), "MyBouts") },
      { path: "hub-answers", ...page(() => import("./pages/HubAnswers"), "HubAnswers") },
      { path: "assistant", ...page(() => import("./pages/StaffAssistant"), "StaffAssistant") },
      { path: "knowledge", ...page(() => import("./pages/KnowledgeBase"), "KnowledgeBase") },
      { path: "federation", ...page(() => import("./pages/FederationPage"), "FederationPage") },
      { path: "user-management", ...page(() => import("./pages/UserManagement"), "UserManagement") },
      { path: "user-management/new", ...page(() => import("./pages/UserManagement"), "UserManagement") },
      { path: "user-management/:userId/edit", ...page(() => import("./pages/UserManagement"), "UserManagement") },
      { path: "user-management/:userId", ...page(() => import("./pages/UserManagement"), "UserManagement") },
      { path: "rankings", element: <RedirectToFighters /> },
      { path: "workflow-demo", element: <Navigate to="/home" replace /> },
      { path: "settings", ...page(() => import("./pages/SystemSettings"), "SystemSettings") },
      { path: "help", ...page(() => import("./pages/Help"), "Help") },
      { path: "process-flow", element: <Navigate to="/home/help" replace /> },
      { path: "assign-officials", element: <Navigate to="/home/matches" replace /> },
      { path: "product-management", element: <Navigate to="/home" replace /> },
      { path: "categories-setting", element: <Navigate to="/home" replace /> },
      { path: "store-settings", element: <Navigate to="/home" replace /> },
      { path: "media/news", ...page(() => import("./pages/News"), "News") },
      { path: "media/video", ...page(() => import("./pages/Video"), "Video") },
      { path: "strategic-partners/organizations/new", ...page(() => import("./pages/PartnerOrganizations"), "PartnerOrganizations") },
      { path: "strategic-partners/organizations/:orgId/edit", ...page(() => import("./pages/PartnerOrganizations"), "PartnerOrganizations") },
      { path: "strategic-partners/organizations", ...page(() => import("./pages/PartnerOrganizations"), "PartnerOrganizations") },
      { path: "strategic-partners/:partnerType/new", ...page(() => import("./pages/StrategicPartners"), "StrategicPartners") },
      { path: "strategic-partners/:partnerType/:partnerId/edit", ...page(() => import("./pages/StrategicPartners"), "StrategicPartners") },
      { path: "strategic-partners/:partnerType", ...page(() => import("./pages/StrategicPartners"), "StrategicPartners") },
      { path: "strategic-partners", element: <Navigate to="/home/strategic-partners/broadcasters" replace /> },
      { path: "*", element: <NotFound /> },
    ],
  },
  {
    path: "*",
    element: <NotFound />,
  },
],
  { basename: getRouterBasename() }
);