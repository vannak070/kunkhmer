import { createBrowserRouter } from "react-router";
import { getRouterBasename } from "./utils/basePath";
import { Layout } from "./components/Layout";
import { Home } from "./pages/Home";
import { Fighters } from "./pages/Fighters";
import { FighterDetail } from "./pages/FighterDetail";
import { AddFighter } from "./pages/AddFighter";
import { Matches } from "./pages/Matches";
import { MatchDetail } from "./pages/MatchDetail";
import { MatchDetailView } from "./pages/MatchDetailView";
import { CreateEvent } from "./pages/CreateEvent";
import { AssignFightersToEvent } from "./pages/AssignFightersToEvent";
import { EventDetailNew } from "./pages/EventDetailNewSimple";
import { SubEventDetail } from "./pages/SubEventDetail";
import { AddMatchToEvent } from "./pages/AddMatchToEvent";
import { CreateMatchFromBatch } from "./pages/CreateMatchFromBatch";
import { MatchCreatedSuccess } from "./pages/MatchCreatedSuccess";
import { BatchDetail } from "./pages/BatchDetail";
import { CreateBatch } from "./pages/CreateBatch";
import { CreateChampion } from "./pages/CreateChampion";
import { ChampionDetail } from "./pages/ChampionDetail";
import { ChampionHistory } from "./pages/ChampionHistory";
import { KKFWorkflow } from "./pages/KKFWorkflow";
import { KKFWorkflowDetail } from "./pages/KKFWorkflowDetail";
import { Profile } from "./pages/Profile";
import { MatchProposals } from "./pages/MatchProposals";
import { RedirectToHomeEvents } from "./pages/RedirectToHomeEvents";
import { RedirectToFighters } from "./pages/RedirectToFighters";
import { WorkflowDemo } from "./pages/WorkflowDemo";
import { SystemSettings } from "./pages/SystemSettings";
import { SystemProcessFlow } from "./pages/SystemProcessFlow";
import { NotFound } from "./pages/NotFound";
import { Login } from "./pages/Login";
import { Clubs } from "./pages/Clubs";
import { ClubDetail } from "./pages/ClubDetail";
import { AddClub } from "./pages/AddClub";
import AssignOfficials from "./pages/AssignOfficials";
import { ShareFightCard } from "./pages/ShareFightCard";
import { UserManagement } from "./pages/UserManagement";
import { Navigate } from "react-router";
import { KKFOfficers } from "./pages/KKFOfficers";
import { StoreManagement } from "./pages/StoreManagement";
import { CategoriesSetting } from "./pages/CategoriesSetting";
import { StoreSettings } from "./pages/StoreSettings";
import { News } from "./pages/News";
import { Video } from "./pages/Video";
import { StrategicPartners } from "./pages/StrategicPartners";
import { ProgramDashboard } from "./pages/ProgramDashboard";

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
      { path: "matches/:batchId", element: <BatchDetail /> },
      { path: "batches/:batchId", element: <BatchDetail /> },
      { path: "batches/:batchId/share", element: <ShareFightCard /> },
      { path: "program", element: <ProgramDashboard /> },
      { path: "matches", element: <Navigate to="/home/program?tab=matches" replace /> },
      { path: "matches-old", element: <Matches /> },
      { path: "match/:id", element: <MatchDetail /> },
      { path: "match/:id/update-result", element: <MatchDetailView /> },
      { path: "events/new", element: <CreateEvent /> },
      { path: "events/:eventId/assign-fighters", element: <AssignFightersToEvent /> },
      { path: "events/:id", element: <EventDetailNew /> },
      { path: "events/:eventId/sub-events/:subEventId", element: <SubEventDetail /> },
      { path: "events/:eventId/sub-events/:subEventId/add-match", element: <AddMatchToEvent /> },
      { path: "events/:eventId/add-match", element: <AddMatchToEvent /> },
      { path: "events", element: <Navigate to="/home/program?tab=events" replace /> },
      { path: "champion", element: <Navigate to="/home/program?tab=champions" replace /> },
      { path: "champion/new", element: <CreateChampion /> },
      { path: "champion/:id", element: <ChampionDetail /> },
      { path: "champion/:id/history", element: <ChampionHistory /> },
      { path: "kkf-workflow", element: <KKFWorkflow /> },
      { path: "kkf-workflow/:requestId", element: <KKFWorkflowDetail /> },
      { path: "profile", element: <Profile /> },
      { path: "match-proposals", element: <MatchProposals /> },
      { path: "kkf-officers", element: <KKFOfficers /> },
      { path: "user-management", element: <UserManagement /> },
      { path: "user-management/new", element: <UserManagement /> },
      { path: "user-management/:userId/edit", element: <UserManagement /> },
      { path: "user-management/:userId", element: <UserManagement /> },
      { path: "rankings", element: <RedirectToFighters /> },
      { path: "workflow-demo", element: <WorkflowDemo /> },
      { path: "settings", element: <SystemSettings /> },
      { path: "process-flow", element: <SystemProcessFlow /> },
      { path: "assign-officials", element: <AssignOfficials /> },
      { path: "product-management", element: <StoreManagement /> },
      { path: "categories-setting", element: <CategoriesSetting /> },
      { path: "store-settings", element: <StoreSettings /> },
      { path: "media/news", element: <News /> },
      { path: "media/video", element: <Video /> },
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