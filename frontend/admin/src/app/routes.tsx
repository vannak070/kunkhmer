import { createBrowserRouter } from "react-router";
import { ScheduleTitleBout } from "./pages/ScheduleTitleBout";
import { getRouterBasename } from "./utils/basePath";
import { Layout } from "./components/Layout";
import { Home } from "./pages/Home";
import { Fighters } from "./pages/Fighters";
import { FighterDetail } from "./pages/FighterDetail";
import { AddFighter } from "./pages/AddFighter";
import { MatchDetail } from "./pages/MatchDetail";
import { CreateEvent } from "./pages/CreateEvent";
import { FightNight } from "./pages/FightNight";
import { FightCardWeighIn } from "./pages/FightCardWeighIn";
import { FightCardResults } from "./pages/FightCardResults";
import { FightCardRedirect } from "./components/program/FightCardRedirect";
import { CreateMatchFromBatch } from "./pages/CreateMatchFromBatch";
import { MatchCreatedSuccess } from "./pages/MatchCreatedSuccess";
import { CreateBatch } from "./pages/CreateBatch";
import { CreateChampion } from "./pages/CreateChampion";
import { ChampionDetail } from "./pages/ChampionDetail";
import { ChampionHistory } from "./pages/ChampionHistory";
import { Profile } from "./pages/Profile";
import { MatchProposals } from "./pages/MatchProposals";
import { RedirectToHomeEvents } from "./pages/RedirectToHomeEvents";
import { RedirectToFighters } from "./pages/RedirectToFighters";
import { SystemSettings } from "./pages/SystemSettings";
import { Help } from "./pages/Help";
import { NotFound } from "./pages/NotFound";
import { Login } from "./pages/Login";
import { Clubs } from "./pages/Clubs";
import { ClubDetail } from "./pages/ClubDetail";
import { AddClub } from "./pages/AddClub";
import AssignOfficials from "./pages/AssignOfficials";
import { ShareFightCard } from "./pages/ShareFightCard";
import { UserManagement } from "./pages/UserManagement";
import { Navigate, useParams } from "react-router";
import { Officials } from "./pages/Officials";
import { MyBouts } from "./pages/MyBouts";
import { News } from "./pages/News";
import { Video } from "./pages/Video";
import { StrategicPartners } from "./pages/StrategicPartners";
import { PartnerOrganizations } from "./pages/PartnerOrganizations";
import { ProgramDashboard } from "./pages/ProgramDashboard";
import { HubAnswers } from "./pages/HubAnswers";
import { StaffAssistant } from "./pages/StaffAssistant";
import { KnowledgeBase } from "./pages/KnowledgeBase";
import { FederationPage } from "./pages/FederationPage";

/** Old or removed admin URLs → the page that does that job now (Phase 2). */
function ToFightCard() {
  const { subEventId } = useParams();
  return <Navigate to={`/home/matches/${subEventId}`} replace />;
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
    errorElement: <NotFound />,
    children: [
      { index: true, element: <Home /> },
      { path: "fighters", element: <Fighters /> },
      { path: "fighters/kunkhmer", element: <Fighters /> },
      { path: "fighters/foreigner", element: <Fighters /> },
      { path: "fighters/kunkhmer/new", element: <AddFighter /> },
      { path: "fighters/foreigner/new", element: <AddFighter /> },
      { path: "fighters/:id/edit", element: <AddFighter /> },
      { path: "fighters/:id", element: <FighterDetail /> },
      { path: "clubs/:id", element: <ClubDetail /> },
      { path: "clubs/:id/edit", element: <AddClub /> },
      { path: "clubs/new", element: <AddClub /> },
      { path: "clubs", element: <Clubs /> },
      { path: "matches/new", element: <CreateBatch /> },
      { path: "matches/:batchId/edit", element: <CreateBatch /> },
      { path: "matches/:batchId/create-match", element: <CreateMatchFromBatch /> },
      { path: "matches/:batchId/assign-officials", element: <AssignOfficials /> },
      { path: "matches/created", element: <MatchCreatedSuccess /> },
      // The fight card lives on its fight night page now (claude/updates/program-officer-friendly.md).
      { path: "matches/:batchId", element: <FightCardRedirect /> },
      { path: "batches/:batchId", element: <FightCardRedirect /> },
      { path: "fight-cards/:cardId/weigh-in", element: <FightCardWeighIn /> },
      { path: "fight-cards/:cardId/results", element: <FightCardResults /> },
      { path: "batches/:batchId/share", element: <ShareFightCard /> },
      { path: "program", element: <ProgramDashboard /> },
      { path: "matches", element: <Navigate to="/home/program?tab=events" replace /> },
      { path: "matches-old", element: <Navigate to="/home/program?tab=events" replace /> },
      { path: "match/new", element: <ScheduleTitleBout /> },
      { path: "match/:id", element: <MatchDetail /> },
      { path: "match/:id/update-result", element: <ToMatch /> },
      { path: "events/new", element: <CreateEvent /> },
      { path: "events/:eventId/assign-fighters", element: <ToEvent /> },
      { path: "events/:id", element: <FightNight /> },
      { path: "events/:eventId/sub-events/:subEventId", element: <ToFightCard /> },
      { path: "events/:eventId/sub-events/:subEventId/add-match", element: <ToFightCard /> },
      { path: "events/:eventId/add-match", element: <ToEvent /> },
      { path: "events", element: <Navigate to="/home/program?tab=events" replace /> },
      { path: "champion", element: <Navigate to="/home/program?tab=champions" replace /> },
      { path: "champion/new", element: <CreateChampion /> },
      { path: "champion/:id", element: <ChampionDetail /> },
      { path: "champion/:id/schedule-defense", element: <ScheduleTitleBout /> },
      { path: "champion/:id/history", element: <ChampionHistory /> },
      { path: "kkf-workflow", element: <Navigate to="/home" replace /> },
      { path: "kkf-workflow/:requestId", element: <Navigate to="/home" replace /> },
      { path: "profile", element: <Profile /> },
      { path: "match-proposals", element: <MatchProposals /> },
      { path: "officials", element: <Officials /> },
      { path: "kkf-officers", element: <Navigate to="/home/officials" replace /> },
      { path: "my-bouts", element: <MyBouts /> },
      { path: "hub-answers", element: <HubAnswers /> },
      { path: "assistant", element: <StaffAssistant /> },
      { path: "knowledge", element: <KnowledgeBase /> },
      { path: "federation", element: <FederationPage /> },
      { path: "user-management", element: <UserManagement /> },
      { path: "user-management/new", element: <UserManagement /> },
      { path: "user-management/:userId/edit", element: <UserManagement /> },
      { path: "user-management/:userId", element: <UserManagement /> },
      { path: "rankings", element: <RedirectToFighters /> },
      { path: "workflow-demo", element: <Navigate to="/home" replace /> },
      { path: "settings", element: <SystemSettings /> },
      { path: "help", element: <Help /> },
      { path: "process-flow", element: <Navigate to="/home/help" replace /> },
      { path: "assign-officials", element: <Navigate to="/home/program?tab=events" replace /> },
      { path: "product-management", element: <Navigate to="/home" replace /> },
      { path: "categories-setting", element: <Navigate to="/home" replace /> },
      { path: "store-settings", element: <Navigate to="/home" replace /> },
      { path: "media/news", element: <News /> },
      { path: "media/video", element: <Video /> },
      { path: "strategic-partners/organizations/new", element: <PartnerOrganizations /> },
      { path: "strategic-partners/organizations/:orgId/edit", element: <PartnerOrganizations /> },
      { path: "strategic-partners/organizations", element: <PartnerOrganizations /> },
      { path: "strategic-partners/:partnerType/new", element: <StrategicPartners /> },
      { path: "strategic-partners/:partnerType/:partnerId/edit", element: <StrategicPartners /> },
      { path: "strategic-partners/:partnerType", element: <StrategicPartners /> },
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