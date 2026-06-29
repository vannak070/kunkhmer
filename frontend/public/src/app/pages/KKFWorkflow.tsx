import { useState } from "react";
import { useNavigate } from "react-router";
import { 
  CheckCircle, XCircle, Clock, AlertCircle, Calendar, Users, Shield, 
  MessageSquare, FileText, Trophy, Scale, Target, Eye, UserPlus, Building2,
  Crown, Plus, Filter, Search, ArrowRight, Upload, CheckSquare, X, ChevronDown, ChevronUp,
  MapPin, Award
} from "lucide-react";
import { MOCK_EVENTS, MOCK_MATCHES, MOCK_FIGHTERS, MOCK_CLUBS } from "../data/mock";
import { usePermissions } from "../hooks/usePermissions";
import { MOCK_USERS } from "../data/users";
import { createWorkflowEntry } from "../utils/workflowValidation";
import { toast } from "sonner";
import { MOCK_CHAMPIONS } from "../data/champion";
import { KKFDetailModal } from "../components/KKFDetailModal";
import { KKFEnhancedDetailModal } from "../components/KKFEnhancedDetailModal";

type WorkflowType = "event" | "match" | "fighter" | "club" | "champion";
type WorkflowStatus = "draft" | "submitted" | "under_review" | "approved" | "rejected" | "info_requested";

interface ValidationCheck {
  label: string;
  status: "valid" | "invalid" | "missing";
  message?: string;
}

interface WorkflowRequest {
  id: string;
  type: WorkflowType;
  title: string;
  status: WorkflowStatus;
  createdBy: string;
  createdDate: string;
  submittedDate?: string;
  reviewedBy?: string;
  reviewedDate?: string;
  comments?: string;
  data: any;
  validation?: ValidationCheck[];
  healthStatus?: "valid" | "expired" | "missing";
  auditTrail?: Array<{
    action: string;
    by: string;
    date: string;
    comment?: string;
  }>;
}

// Mock workflow requests data
const MOCK_WORKFLOW_REQUESTS: WorkflowRequest[] = [
  {
    id: "wf-001",
    type: "fighter",
    title: "Register Fighter: Sok Bunthoeun",
    status: "pending",
    createdBy: "u3",
    createdDate: "2025-03-20",
    submittedDate: "2025-03-22",
    data: {
      fighterName: "Sok Bunthoeun",
      club: "Tiger Kun Khmer",
      weight: 67.5,
      type: "Professional",
      origin: "Local",
      documents: ["ID Card", "Medical Certificate"]
    }
  },
  {
    id: "wf-002",
    type: "club",
    title: "Register Club: Dragon Fight Academy",
    status: "pending",
    createdBy: "u5",
    createdDate: "2025-03-18",
    submittedDate: "2025-03-20",
    data: {
      clubName: "Dragon Fight Academy",
      headCoach: "Master Vong Sarath",
      location: "Siem Reap",
      fightersCount: 0,
      verificationDocs: ["Business License", "Facility Photos"]
    }
  },
  {
    id: "wf-007",
    type: "match",
    title: "Match Batch: Sorn Seavmey vs Chan Rothana",
    status: "pending",
    createdBy: "u3",
    createdDate: "2025-03-21",
    submittedDate: "2025-03-22",
    data: {
      matchId: "m1",
      eventName: "Kun Khmer Championship 2026",
      eventDate: "2026-04-12",
      fighterA: "Sorn Seavmey (The Tiger)",
      fighterB: "Chan Rothana (Dragon)",
      fighterARecord: "34-5-2",
      fighterBRecord: "28-8-0",
      agreedWeight: 66.0,
      rounds: 5,
      gloveSize: "8oz",
      gloveType: "Twins Special",
      status: "Ready to Fight",
      weighInWeightA: 65.9,
      weighInWeightB: 65.8,
      weighInDate: "2026-04-11"
    }
  },
  {
    id: "wf-008",
    type: "match",
    title: "Match Batch: Nou Srey Pov vs Kem Sitha",
    status: "pending",
    createdBy: "u3",
    createdDate: "2025-03-19",
    submittedDate: "2025-03-20",
    data: {
      matchId: "m2",
      eventName: "Kun Khmer Championship 2026",
      eventDate: "2026-04-12",
      fighterA: "Nou Srey Pov (Iron Hands)",
      fighterB: "Kem Sitha (Thunder Kick)",
      fighterARecord: "19-3-1",
      fighterBRecord: "31-12-3",
      agreedWeight: 58.0,
      rounds: 3,
      gloveSize: "6oz",
      gloveType: "Fairtex BGV1",
      status: "Weigh-In Complete",
      weighInWeightA: 52.3,
      weighInWeightB: 57.6,
      weighInDate: "2026-02-28"
    }
  },
  {
    id: "wf-009",
    type: "match",
    title: "Match Batch: John Doe vs Prak Sophea",
    status: "approved",
    createdBy: "u3",
    createdDate: "2025-03-15",
    submittedDate: "2025-03-16",
    reviewedBy: "u2",
    reviewedDate: "2025-03-17",
    data: {
      matchId: "m3",
      eventName: "Kun Khmer Championship 2026",
      eventDate: "2026-04-12",
      fighterA: "John Doe (The Eagle)",
      fighterB: "Prak Sophea (The Elbow King)",
      fighterARecord: "3-1-0",
      fighterBRecord: "42-7-1",
      agreedWeight: 70.0,
      rounds: 5,
      gloveSize: "10oz",
      gloveType: "Twins Special",
      status: "Club Confirmed"
    }
  },
  {
    id: "wf-003",
    type: "champion",
    title: "Title Fight: KKF National Champion 70kg",
    status: "pending",
    createdBy: "u2",
    createdDate: "2025-03-15",
    submittedDate: "2025-03-17",
    data: {
      championId: "champ-001",
      titleName: "KKF National Champion 70kg",
      championType: "KKF National",
      weightClass: 70,
      organization: "KKF",
      champion: "Sok Thy",
      championRecord: "45-8-2",
      challenger: "Kim Sovannak",
      challengerRecord: "38-6-1",
      defenseCount: 3,
      lastDefenseDate: "2026-03-15",
      nextDefenseDeadline: "2026-06-15",
      eventName: "KUN KHMER Championship 2026",
      rounds: 5,
      weightLimit: 70,
      ranking: "Both fighters ranked Top 5 in KKF"
    }
  },
  {
    id: "wf-010",
    type: "champion",
    title: "Title Fight: ISKA Cambodia Champion 60kg",
    status: "pending",
    createdBy: "u2",
    createdDate: "2025-03-18",
    submittedDate: "2025-03-19",
    data: {
      championId: "champ-002",
      titleName: "ISKA Cambodia Champion 60kg",
      championType: "ISKA Cambodia",
      weightClass: 60,
      organization: "KKF",
      champion: "Kimsan Vorn",
      championRecord: "28-4-1",
      challenger: "Chantha Pov",
      challengerRecord: "32-7-2",
      defenseCount: 2,
      lastDefenseDate: "2026-02-28",
      nextDefenseDeadline: "2026-05-28",
      eventName: "New Year Fight Night",
      rounds: 5,
      weightLimit: 60,
      ranking: "Challenger is #1 contender"
    }
  },
  {
    id: "wf-011",
    type: "champion",
    title: "Title Fight: IPCC International Champion 65kg",
    status: "approved",
    createdBy: "u2",
    createdDate: "2025-03-10",
    submittedDate: "2025-03-11",
    reviewedBy: "u1",
    reviewedDate: "2025-03-12",
    data: {
      championId: "champ-003",
      titleName: "IPCC International Champion 65kg",
      championType: "IPCC International",
      weightClass: 65,
      organization: "WMC",
      champion: "Chantha Pov",
      championRecord: "32-5-1",
      challenger: "Ratanak Seng",
      challengerRecord: "29-8-0",
      defenseCount: 1,
      lastDefenseDate: "2026-02-05",
      eventName: "WMC World Championship 2025",
      rounds: 5,
      weightLimit: 65,
      ranking: "International title defense"
    }
  },
  {
    id: "wf-006",
    type: "fighter",
    title: "Register Fighter: Chan Virak",
    status: "pending",
    createdBy: "u3",
    createdDate: "2025-03-23",
    submittedDate: "2025-03-24",
    data: {
      fighterName: "Chan Virak",
      club: "Phnom Penh Warriors",
      weight: 58.3,
      type: "Amateur",
      origin: "Local",
      documents: ["ID Card", "Medical Certificate", "Parental Consent"]
    }
  },
  {
    id: "wf-004",
    type: "fighter",
    title: "Register Fighter: Nget Daravuth",
    status: "approved",
    createdBy: "u4",
    createdDate: "2025-03-10",
    submittedDate: "2025-03-11",
    reviewedBy: "u1",
    reviewedDate: "2025-03-12",
    data: {
      fighterName: "Nget Daravuth",
      club: "Angkor Warriors",
      weight: 70.0,
      type: "Professional",
      origin: "Local",
      documents: ["ID Card", "Medical Certificate", "Fight Record"]
    }
  },
  {
    id: "wf-005",
    type: "club",
    title: "Register Club: Phnom Penh Fight Club",
    status: "rejected",
    createdBy: "u6",
    createdDate: "2025-03-08",
    submittedDate: "2025-03-09",
    reviewedBy: "u1",
    reviewedDate: "2025-03-10",
    comments: "Incomplete documentation - missing facility license",
    data: {
      clubName: "Phnom Penh Fight Club",
      headCoach: "Master Kim Virak",
      location: "Phnom Penh",
      fightersCount: 0,
      verificationDocs: ["Business License"]
    }
  }
];

export function KKFWorkflow() {
  const navigate = useNavigate();
  const permissions = usePermissions();
  const currentUser = permissions.currentUser;
  
  const [selectedTab, setSelectedTab] = useState<"fighter" | "event" | "batch" | "champion">("fighter");
  const [filterType, setFilterType] = useState<WorkflowType | "all">("all");
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "approved" | "rejected">("pending");
  const [searchQuery, setSearchQuery] = useState("");
  
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<WorkflowRequest | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [approvalAction, setApprovalAction] = useState<"approve" | "reject" | null>(null);
  const [reviewComments, setReviewComments] = useState("");
  const [showDetailModal, setShowDetailModal] = useState(false);

  if (!currentUser || !permissions.hasPermission('federation.view')) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-8 text-center">
          <AlertCircle className="w-12 h-12 text-[#C8102E] mx-auto mb-4" />
          <h2 className="text-2xl font-black text-[#C8102E] mb-2">Access Denied</h2>
          <p className="text-[#707070] font-medium">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  // Role-based data filtering
  const getVisibleRequests = () => {
    let visibleRequests = [...MOCK_WORKFLOW_REQUESTS];

    // 🏛️ Club: Only see their own submissions
    if (permissions.isClub()) {
      visibleRequests = visibleRequests.filter(req => req.createdBy === currentUser.id);
    }

    // 📡 Organizer: Only see approved items
    if (permissions.isOrganizer()) {
      visibleRequests = visibleRequests.filter(req => req.status === "approved");
    }

    // 🥊 Referee: No access to workflow (should be blocked by permission check above)
    if (permissions.isReferee()) {
      return [];
    }

    // 👨‍⚖️ KKF Officer, 👑 Super Admin: See all
    // (No additional filtering needed)

    return visibleRequests;
  };

  // Filter workflow requests by tab with role-based access
  const getFilteredRequestsByTab = () => {
    let typeFilter: WorkflowType | null = null;
    
    if (selectedTab === "fighter") typeFilter = "fighter";
    else if (selectedTab === "event") typeFilter = "event";
    else if (selectedTab === "batch") typeFilter = "match";
    else if (selectedTab === "champion") typeFilter = "champion";
    
    const visibleRequests = getVisibleRequests();
    
    return visibleRequests.filter(req => {
      const matchesTab = !typeFilter || req.type === typeFilter;
      const matchesStatus = filterStatus === "all" || req.status === filterStatus;
      const matchesSearch = !searchQuery || req.title.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesTab && matchesStatus && matchesSearch;
    });
  };

  const filteredRequests = getFilteredRequestsByTab();

  // Filter events by KKF status
  const getEventsByStatus = (status: string) => {
    return MOCK_EVENTS.filter(e => {
      const matchesStatus = status === "all" || e.kkfStatus === status;
      const matchesSearch = !searchQuery || e.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  };

  const pendingEvents = MOCK_EVENTS.filter(e => e.kkfStatus === "pending");
  const approvedEvents = MOCK_EVENTS.filter(e => e.kkfStatus === "approved");
  const rejectedEvents = MOCK_EVENTS.filter(e => e.kkfStatus === "rejected");
  
  // Filter events for Event Approvals tab
  const filteredEvents = selectedTab === "event" ? getEventsByStatus(filterStatus) : [];
  
  // Get match batches for display (pending matches)
  const matchBatches = MOCK_MATCHES.filter(m => 
    m.status === "Pending Club Confirmation" || 
    m.status === "Club Confirmed" ||
    m.status === "Weigh-In Complete" ||
    m.status === "Ready to Fight"
  );
  
  // Get title fight matches from champions
  const titleFights = MOCK_CHAMPIONS.filter(c => 
    c.status === "Title Defense Scheduled" || c.status === "Active"
  );

  // Get status badge
  const getStatusBadge = (status: "pending" | "approved" | "rejected") => {
    if (status === "pending") {
      return (
        <span className="inline-flex items-center gap-2 bg-white border-2 border-amber-500 text-amber-700 px-4 py-2 rounded-xl font-bold">
          <Clock className="w-4 h-4" />
          Pending Review
        </span>
      );
    } else if (status === "approved") {
      return (
        <span className="inline-flex items-center gap-2 bg-white border-2 border-green-500 text-green-700 px-4 py-2 rounded-xl font-bold">
          <CheckCircle className="w-4 h-4" />
          Approved
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-2 bg-white border-2 border-red-500 text-red-700 px-4 py-2 rounded-xl font-bold">
          <XCircle className="w-4 h-4" />
          Rejected
        </span>
      );
    }
  };

  // Handle approve/reject event
  const handleApproveRejectEvent = (event: any, action: "approve" | "reject") => {
    setSelectedEvent(event);
    setApprovalAction(action);
    setShowApprovalModal(true);
  };

  // Handle approve/reject request
  const handleApproveRejectRequest = (request: WorkflowRequest, action: "approve" | "reject") => {
    setSelectedRequest(request);
    setApprovalAction(action);
    setShowApprovalModal(true);
  };

  // Submit approval/rejection
  const handleSubmitApproval = () => {
    if (!approvalAction) return;

    const actionText = approvalAction === "approve" ? "approved" : "rejected";
    const targetName = selectedEvent ? selectedEvent.name : selectedRequest?.title;

    toast.success(`Successfully ${actionText} ${targetName}`);

    // Close modal and reset state
    setShowApprovalModal(false);
    setSelectedEvent(null);
    setSelectedRequest(null);
    setApprovalAction(null);
    setReviewComments("");
  };

  // Get statistics
  const pendingCount = MOCK_WORKFLOW_REQUESTS.filter(r => r.status === "pending").length;
  const approvedCount = MOCK_WORKFLOW_REQUESTS.filter(r => r.status === "approved").length;
  const rejectedCount = MOCK_WORKFLOW_REQUESTS.filter(r => r.status === "rejected").length;

  return (
    <div className="min-h-screen bg-[#F8F9FA] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section - Enhanced */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-3">
            <div className="p-3 bg-gradient-to-br from-[#0A3D91] to-[#0854C2] rounded-2xl shadow-lg">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-[#0A3D91] tracking-tight">
                KKF Workflow Management
              </h1>
              <p className="text-base text-[#707070] font-medium mt-1">
                Review and approve federation submissions
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards - Enhanced with Glassmorphism */}
        <div className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Pending Review Card */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-400 via-amber-500 to-orange-600 p-[3px] shadow-2xl hover:shadow-[0_20px_60px_rgba(245,158,11,0.4)] transition-all duration-300 group">
              <div className="relative bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl p-6 h-full backdrop-blur-sm">
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/20 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-amber-900 font-black text-xs uppercase tracking-widest">
                      Pending Review
                    </p>
                    <Clock className="w-10 h-10 text-amber-600/40 group-hover:rotate-12 transition-transform duration-300" />
                  </div>
                  <p className="text-6xl font-black text-amber-900 mb-2 group-hover:scale-110 transition-transform duration-300">
                    {pendingCount}
                  </p>
                  <p className="text-sm font-bold text-amber-700">
                    Awaiting your action
                  </p>
                </div>
              </div>
            </div>

            {/* Approved Card */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-400 via-green-500 to-teal-600 p-[3px] shadow-2xl hover:shadow-[0_20px_60px_rgba(16,185,129,0.4)] transition-all duration-300 group">
              <div className="relative bg-gradient-to-br from-emerald-50 to-green-50 rounded-3xl p-6 h-full backdrop-blur-sm">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-400/20 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-emerald-900 font-black text-xs uppercase tracking-widest">
                      Approved
                    </p>
                    <CheckCircle className="w-10 h-10 text-emerald-600/40 group-hover:scale-110 transition-transform duration-300" />
                  </div>
                  <p className="text-6xl font-black text-emerald-900 mb-2 group-hover:scale-110 transition-transform duration-300">
                    {approvedCount}
                  </p>
                  <p className="text-sm font-bold text-emerald-700">
                    Successfully processed
                  </p>
                </div>
              </div>
            </div>

            {/* Rejected Card */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-red-400 via-rose-500 to-pink-600 p-[3px] shadow-2xl hover:shadow-[0_20px_60px_rgba(239,68,68,0.4)] transition-all duration-300 group">
              <div className="relative bg-gradient-to-br from-red-50 to-rose-50 rounded-3xl p-6 h-full backdrop-blur-sm">
                <div className="absolute top-0 right-0 w-32 h-32 bg-red-400/20 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-red-900 font-black text-xs uppercase tracking-widest">
                      Rejected
                    </p>
                    <XCircle className="w-10 h-10 text-red-600/40 group-hover:rotate-12 transition-transform duration-300" />
                  </div>
                  <p className="text-6xl font-black text-red-900 mb-2 group-hover:scale-110 transition-transform duration-300">
                    {rejectedCount}
                  </p>
                  <p className="text-sm font-bold text-red-700">
                    Requires revision
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs - Enhanced Design */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl mb-8 p-3 border-2 border-[#E0E0E0]">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <button
              onClick={() => setSelectedTab("fighter")}
              className={`relative px-6 py-4 rounded-2xl font-bold transition-all duration-300 group overflow-hidden ${
                selectedTab === "fighter"
                  ? "bg-gradient-to-r from-[#0A3D91] to-[#0854C2] text-white shadow-lg scale-105"
                  : "bg-[#F8F9FA] text-[#707070] hover:bg-gray-200"
              }`}
            >
              <div className={`absolute inset-0 bg-gradient-to-r from-[#0A3D91] to-[#0854C2] opacity-0 group-hover:opacity-10 transition-opacity ${selectedTab === "fighter" ? "opacity-0" : ""}`} />
              <div className="relative flex flex-col items-center gap-2">
                <UserPlus className="w-6 h-6" />
                <span className="text-sm">Fighter Registration</span>
              </div>
            </button>
            <button
              onClick={() => setSelectedTab("event")}
              className={`relative px-6 py-4 rounded-2xl font-bold transition-all duration-300 group overflow-hidden ${
                selectedTab === "event"
                  ? "bg-gradient-to-r from-[#0A3D91] to-[#0854C2] text-white shadow-lg scale-105"
                  : "bg-[#F8F9FA] text-[#707070] hover:bg-gray-200"
              }`}
            >
              <div className={`absolute inset-0 bg-gradient-to-r from-[#0A3D91] to-[#0854C2] opacity-0 group-hover:opacity-10 transition-opacity ${selectedTab === "event" ? "opacity-0" : ""}`} />
              <div className="relative flex flex-col items-center gap-2">
                <Trophy className="w-6 h-6" />
                <span className="text-sm">Event Approvals</span>
              </div>
            </button>
            <button
              onClick={() => setSelectedTab("batch")}
              className={`relative px-6 py-4 rounded-2xl font-bold transition-all duration-300 group overflow-hidden ${
                selectedTab === "batch"
                  ? "bg-gradient-to-r from-[#0A3D91] to-[#0854C2] text-white shadow-lg scale-105"
                  : "bg-[#F8F9FA] text-[#707070] hover:bg-gray-200"
              }`}
            >
              <div className={`absolute inset-0 bg-gradient-to-r from-[#0A3D91] to-[#0854C2] opacity-0 group-hover:opacity-10 transition-opacity ${selectedTab === "batch" ? "opacity-0" : ""}`} />
              <div className="relative flex flex-col items-center gap-2">
                <Scale className="w-6 h-6" />
                <span className="text-sm">Match Batches</span>
              </div>
            </button>
            <button
              onClick={() => setSelectedTab("champion")}
              className={`relative px-6 py-4 rounded-2xl font-bold transition-all duration-300 group overflow-hidden ${
                selectedTab === "champion"
                  ? "bg-gradient-to-r from-[#0A3D91] to-[#0854C2] text-white shadow-lg scale-105"
                  : "bg-[#F8F9FA] text-[#707070] hover:bg-gray-200"
              }`}
            >
              <div className={`absolute inset-0 bg-gradient-to-r from-[#0A3D91] to-[#0854C2] opacity-0 group-hover:opacity-10 transition-opacity ${selectedTab === "champion" ? "opacity-0" : ""}`} />
              <div className="relative flex flex-col items-center gap-2">
                <Crown className="w-6 h-6" />
                <span className="text-sm">Title Fights</span>
              </div>
            </button>
          </div>
        </div>

        {/* Search & Filter Bar - Enhanced */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl p-6 mb-8 border-2 border-[#E0E0E0]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative group">
              <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#707070] group-focus-within:text-[#0A3D91] transition-colors" />
              <input
                type="text"
                placeholder="Search requests by title, fighter name, or event..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-14 pr-6 py-4 bg-[#F8F9FA] border-2 border-[#E0E0E0] rounded-2xl font-medium text-[#1A1A24] placeholder-[#707070] focus:outline-none focus:border-[#0A3D91] focus:ring-4 focus:ring-[#0A3D91] focus:ring-opacity-10 transition-all"
              />
            </div>
            <div className="relative group">
              <Filter className="absolute left-5 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#707070] group-focus-within:text-[#0A3D91] transition-colors pointer-events-none" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="w-full pl-14 pr-12 py-4 bg-[#F8F9FA] border-2 border-[#E0E0E0] rounded-2xl font-bold text-[#1A1A24] focus:outline-none focus:border-[#0A3D91] focus:ring-4 focus:ring-[#0A3D91] focus:ring-opacity-10 appearance-none cursor-pointer transition-all"
              >
                <option value="pending">⏳ Pending Review</option>
                <option value="approved">✅ Approved</option>
                <option value="rejected">❌ Rejected</option>
                <option value="all">📋 All Status</option>
              </select>
              <ChevronDown className="absolute right-5 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#707070] pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Requests Tab Content */}
        {selectedTab !== "event" && (
          <div className="space-y-6">
            {/* Section Header with Count */}
            {filteredRequests.length > 0 && (
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-3xl p-6 border-2 border-amber-300 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-amber-500 rounded-xl">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-amber-900">
                      Pending KKF Approval ({filteredRequests.length})
                    </h2>
                    <p className="text-sm text-amber-700 font-medium">
                      Review and process submission requests
                    </p>
                  </div>
                </div>
              </div>
            )}

            {filteredRequests.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredRequests.map(request => {
                  const submitter = MOCK_USERS.find(u => u.id === request.createdBy);
                  return (
                    <div
                      key={request.id}
                      onClick={() => {
                        setSelectedRequest(request);
                        setShowDetailModal(true);
                      }}
                      className="group bg-white rounded-3xl shadow-xl border-2 border-[#E0E0E0] hover:border-[#0A3D91] hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 overflow-hidden cursor-pointer"
                    >
                      <div className="bg-gradient-to-r from-[#0A3D91] to-[#0854C2] p-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />
                        <div className="relative z-10 flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <h3 className="text-xl font-black text-white mb-3">{request.title}</h3>
                            <div className="flex flex-wrap items-center gap-3 text-sm text-blue-100">
                              <span className="flex items-center gap-1.5 bg-white/20 px-3 py-1.5 rounded-lg backdrop-blur-sm">
                                <Users className="w-4 h-4" />
                                {submitter?.fullName}
                              </span>
                              <span className="flex items-center gap-1.5 bg-white/20 px-3 py-1.5 rounded-lg backdrop-blur-sm">
                                <Calendar className="w-4 h-4" />
                                {new Date(request.submittedDate || request.createdDate).toLocaleDateString('en-GB')}
                              </span>
                            </div>
                          </div>
                          <div>
                            {getStatusBadge(request.status)}
                          </div>
                        </div>
                      </div>

                      <div className="p-6">
                        {request.type === "fighter" && (
                          <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <span className="text-xs text-[#707070] font-medium block mb-1">Weight</span>
                                <span className="text-sm text-[#1A1A24] font-bold block">{request.data.weight} kg</span>
                              </div>
                              <div>
                                <span className="text-xs text-[#707070] font-medium block mb-1">Type</span>
                                <span className={`text-sm font-bold inline-block px-2 py-1 rounded ${
                                  request.data.type === 'Professional' ? 'bg-[#0A3D91] text-white' : 'bg-[#F2C94C] text-[#333333]'
                                }`}>{request.data.type}</span>
                              </div>
                              <div>
                                <span className="text-xs text-[#707070] font-medium block mb-1">Origin</span>
                                <span className={`text-sm font-bold inline-block px-2 py-1 rounded ${
                                  request.data.origin === 'Local' ? 'bg-green-100 text-green-800' : 'bg-purple-100 text-purple-800'
                                }`}>{request.data.origin}</span>
                              </div>
                              <div>
                                <span className="text-xs text-[#707070] font-medium block mb-1">Club/Gym</span>
                                <span className="text-sm text-[#1A1A24] font-bold block">{request.data.club}</span>
                              </div>
                            </div>
                            <div>
                              <span className="text-xs text-[#707070] font-medium block mb-2">Submitted Documents</span>
                              <div className="flex flex-wrap gap-2">
                                {request.data.documents.map((doc: string, idx: number) => (
                                  <span key={idx} className="inline-flex items-center gap-1 text-xs bg-white border-2 border-[#E0E0E0] text-[#1A1A24] font-bold px-3 py-1 rounded-lg">
                                    <CheckSquare className="w-3 h-3 text-green-600" />
                                    {doc}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}

                        {request.type === "club" && (
                          <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="col-span-2">
                                <span className="text-xs text-[#707070] font-medium block mb-1">Club Name</span>
                                <span className="text-base text-[#1A1A24] font-bold block">{request.data.clubName}</span>
                              </div>
                              <div>
                                <span className="text-xs text-[#707070] font-medium block mb-1">Head Coach</span>
                                <span className="text-sm text-[#1A1A24] font-bold block">{request.data.headCoach}</span>
                              </div>
                              <div>
                                <span className="text-xs text-[#707070] font-medium block mb-1">Location</span>
                                <span className="text-sm text-[#1A1A24] font-bold block">{request.data.location}</span>
                              </div>
                              {request.data.fightersCount !== undefined && (
                                <div>
                                  <span className="text-xs text-[#707070] font-medium block mb-1">Current Fighters</span>
                                  <span className="text-sm text-[#1A1A24] font-bold block">{request.data.fightersCount}</span>
                                </div>
                              )}
                            </div>
                            <div>
                              <span className="text-xs text-[#707070] font-medium block mb-2">Verification Documents</span>
                              <div className="flex flex-wrap gap-2">
                                {request.data.verificationDocs.map((doc: string, idx: number) => (
                                  <span key={idx} className="inline-flex items-center gap-1 text-xs bg-white border-2 border-[#E0E0E0] text-[#1A1A24] font-bold px-3 py-1 rounded-lg">
                                    <CheckSquare className="w-3 h-3 text-green-600" />
                                    {doc}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}

                        {request.type === "match" && (
                          <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="col-span-2">
                                <span className="text-xs text-[#707070] font-medium block mb-1">Event</span>
                                <span className="text-base text-[#1A1A24] font-bold block">{request.data.eventName}</span>
                              </div>
                              <div className="col-span-2 p-3 bg-[#F8F9FA] rounded-lg border-2 border-[#E0E0E0]">
                                <div className="flex items-center justify-between">
                                  <div className="flex-1">
                                    <span className="text-sm font-bold text-[#0A3D91] block">{request.data.fighterA}</span>
                                    <span className="text-xs text-[#707070] font-medium">Record: {request.data.fighterARecord}</span>
                                  </div>
                                  <span className="text-lg font-black text-[#C8102E] px-4">VS</span>
                                  <div className="flex-1 text-right">
                                    <span className="text-sm font-bold text-[#0A3D91] block">{request.data.fighterB}</span>
                                    <span className="text-xs text-[#707070] font-medium">Record: {request.data.fighterBRecord}</span>
                                  </div>
                                </div>
                              </div>
                              <div>
                                <span className="text-xs text-[#707070] font-medium block mb-1">Agreed Weight</span>
                                <span className="text-sm text-[#1A1A24] font-bold block">{request.data.agreedWeight} kg</span>
                              </div>
                              <div>
                                <span className="text-xs text-[#707070] font-medium block mb-1">Rounds</span>
                                <span className="text-sm text-[#1A1A24] font-bold block">{request.data.rounds}</span>
                              </div>
                              <div>
                                <span className="text-xs text-[#707070] font-medium block mb-1">Glove Type</span>
                                <span className="text-sm text-[#1A1A24] font-bold block">{request.data.gloveSize} - {request.data.gloveType}</span>
                              </div>
                              <div>
                                <span className="text-xs text-[#707070] font-medium block mb-1">Match Status</span>
                                <span className="text-sm font-bold inline-block px-2 py-1 rounded bg-blue-100 text-blue-800">{request.data.status}</span>
                              </div>
                              {request.data.weighInDate && (
                                <>
                                  <div>
                                    <span className="text-xs text-[#707070] font-medium block mb-1">Fighter A Weight</span>
                                    <span className="text-sm text-[#1A1A24] font-bold block">{request.data.weighInWeightA} kg</span>
                                  </div>
                                  <div>
                                    <span className="text-xs text-[#707070] font-medium block mb-1">Fighter B Weight</span>
                                    <span className="text-sm text-[#1A1A24] font-bold block">{request.data.weighInWeightB} kg</span>
                                  </div>
                                  <div className="col-span-2">
                                    <span className="text-xs text-[#707070] font-medium block mb-1">Weigh-In Date</span>
                                    <span className="text-sm text-[#1A1A24] font-bold block">{new Date(request.data.weighInDate).toLocaleDateString('en-GB')}</span>
                                  </div>
                                </>
                              )}
                              <div className="col-span-2">
                                <span className="text-xs text-[#707070] font-medium block mb-1">Event Date</span>
                                <span className="text-sm text-[#1A1A24] font-bold block">{new Date(request.data.eventDate).toLocaleDateString('en-GB')}</span>
                              </div>
                            </div>
                          </div>
                        )}

                        {request.type === "champion" && (
                          <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="col-span-2">
                                <span className="text-xs text-[#707070] font-medium block mb-1">Title</span>
                                <span className="text-base text-[#1A1A24] font-bold block">{request.data.titleName}</span>
                              </div>
                              <div className="col-span-2 p-3 bg-[#F8F9FA] rounded-lg border-2 border-[#E0E0E0]">
                                <div className="flex items-center justify-between">
                                  <div className="flex-1">
                                    <span className="text-xs text-[#707070] font-medium block mb-1">Champion</span>
                                    <span className="text-sm font-bold text-[#0A3D91] block">{request.data.champion}</span>
                                    {request.data.championRecord && (
                                      <span className="text-xs text-[#707070] font-medium">Record: {request.data.championRecord}</span>
                                    )}
                                  </div>
                                  <span className="text-lg font-black text-[#F2C94C] px-4">VS</span>
                                  <div className="flex-1 text-right">
                                    <span className="text-xs text-[#707070] font-medium block mb-1">Challenger</span>
                                    <span className="text-sm font-bold text-[#C8102E] block">{request.data.challenger}</span>
                                    {request.data.challengerRecord && (
                                      <span className="text-xs text-[#707070] font-medium">Record: {request.data.challengerRecord}</span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              {request.data.championType && (
                                <div className="col-span-2">
                                  <span className="text-xs text-[#707070] font-medium block mb-1">Championship Type</span>
                                  <span className="text-sm font-bold inline-block px-3 py-1 rounded bg-[#0A3D91] text-white">{request.data.championType}</span>
                                </div>
                              )}
                              <div>
                                <span className="text-xs text-[#707070] font-medium block mb-1">Weight Class</span>
                                <span className="text-sm text-[#1A1A24] font-bold block">{request.data.weightLimit} kg</span>
                              </div>
                              <div>
                                <span className="text-xs text-[#707070] font-medium block mb-1">Rounds</span>
                                <span className="text-sm text-[#1A1A24] font-bold block">{request.data.rounds}</span>
                              </div>
                              {request.data.defenseCount !== undefined && (
                                <div>
                                  <span className="text-xs text-[#707070] font-medium block mb-1">Title Defenses</span>
                                  <span className="text-sm text-[#1A1A24] font-bold block">{request.data.defenseCount}</span>
                                </div>
                              )}
                              {request.data.organization && (
                                <div>
                                  <span className="text-xs text-[#707070] font-medium block mb-1">Organization</span>
                                  <span className="text-sm text-[#1A1A24] font-bold block">{request.data.organization}</span>
                                </div>
                              )}
                              <div className="col-span-2">
                                <span className="text-xs text-[#707070] font-medium block mb-1">Event</span>
                                <span className="text-sm text-[#1A1A24] font-bold block">{request.data.eventName}</span>
                              </div>
                              {request.data.ranking && (
                                <div className="col-span-2 p-2 bg-blue-50 rounded border-2 border-blue-200">
                                  <span className="text-xs text-[#707070] font-medium block mb-1">Fighter Rankings</span>
                                  <span className="text-sm text-blue-900 font-bold">{request.data.ranking}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Rejection Comments */}
                        {request.status === "rejected" && request.comments && (
                          <div className="mt-4 p-3 bg-red-50 border-2 border-red-200 rounded-lg">
                            <p className="text-xs font-bold text-red-900 mb-1">Rejection Reason:</p>
                            <p className="text-sm text-red-800">{request.comments}</p>
                          </div>
                        )}

                        {/* Action Buttons */}
                        {request.status === "pending" && permissions.hasPermission('federation.approve') && (
                          <div className="flex gap-3 mt-4 pt-4 border-t-2 border-[#E0E0E0]">
                            <button
                              onClick={() => handleApproveRejectRequest(request, "approve")}
                              className="flex-1 bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-lg font-bold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                            >
                              <CheckCircle className="w-5 h-5" />
                              Approve
                            </button>
                            <button
                              onClick={() => handleApproveRejectRequest(request, "reject")}
                              className="flex-1 bg-[#C8102E] hover:bg-red-700 text-white px-5 py-3 rounded-lg font-bold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                            >
                              <XCircle className="w-5 h-5" />
                              Reject
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl p-16 text-center border-2 border-[#E0E0E0]">
                <div className="max-w-md mx-auto">
                  <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center mx-auto mb-6">
                    <FileText className="w-12 h-12 text-gray-400" />
                  </div>
                  <h3 className="text-2xl font-black text-[#1A1A24] mb-3">No Requests Found</h3>
                  <p className="text-base text-[#707070] font-medium mb-6">
                    There are no submission requests matching your current filters.
                  </p>
                  <p className="text-sm text-[#707070]">
                    Try adjusting your search criteria or status filter to see more results.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Events Tab */}
        {selectedTab === "event" && (
          <div className="space-y-6">
            {/* Pending Approvals Header */}
            {pendingEvents.length > 0 && (
              <div className="bg-gradient-to-r from-amber-100 via-orange-100 to-amber-100 rounded-3xl p-6 border-2 border-amber-300 shadow-xl">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-amber-500 rounded-xl shadow-lg">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-amber-900">
                      Pending KKF Approval ({pendingEvents.length})
                    </h2>
                    <p className="text-sm text-amber-700 font-medium mt-1">
                      Review event submissions and make approval decisions
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Event Cards Grid - 2 Columns */}
            {pendingEvents.length > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {pendingEvents.map(event => {
                  const organizer = MOCK_USERS.find(u => u.id === event.createdBy);
                  return (
                    <div key={event.id} className="group bg-white rounded-3xl shadow-xl border-2 border-amber-400 hover:border-amber-500 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 overflow-hidden">
                      {/* Header with gradient background */}
                      <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />
                        <div className="relative z-10 flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <h3 className="text-2xl font-black text-white mb-3">{event.name}</h3>
                            <div className="flex flex-wrap items-center gap-3 text-sm text-amber-100">
                              <span className="flex items-center gap-1.5 bg-white/20 px-3 py-1.5 rounded-lg backdrop-blur-sm">
                                <Calendar className="w-4 h-4" />
                                {new Date(event.date).toLocaleDateString('en-GB')}
                              </span>
                              <span className="flex items-center gap-1.5 bg-white/20 px-3 py-1.5 rounded-lg backdrop-blur-sm">
                                <Clock className="w-4 h-4" />
                                {new Date(event.submittedDate).toLocaleDateString('en-GB')}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur-sm rounded-full">
                            <Clock className="w-4 h-4 text-amber-600" />
                            <span className="text-sm font-bold text-amber-700">Pending Review</span>
                          </div>
                        </div>
                      </div>

                      {/* Card Body */}
                      <div className="p-6">
                        <div className="space-y-4">
                          {/* Organizer */}
                          <div>
                            <span className="text-xs text-[#707070] font-medium block mb-1">Organizer</span>
                            <span className="text-base text-[#1A1A24] font-bold block">{organizer?.fullName}</span>
                          </div>

                          {/* Event Sponsors */}
                          <div>
                            <span className="text-xs text-[#707070] font-medium block mb-2">Event Sponsors</span>
                            <div className="flex flex-wrap gap-2">
                              {event.sponsors.map((sponsor: string, idx: number) => (
                                <span key={idx} className="inline-flex items-center bg-[#F2C94C] text-[#333333] text-xs font-bold px-4 py-2 rounded-full">
                                  {sponsor}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        {permissions.hasPermission('federation.approve_event') && (
                          <div className="grid grid-cols-3 gap-3 mt-6 pt-6 border-t-2 border-amber-100">
                            <button
                              onClick={() => handleApproveRejectEvent(event, "approve")}
                              className="bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-2xl font-bold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                            >
                              <CheckCircle className="w-5 h-5" />
                              <span className="text-sm">Approve Event</span>
                            </button>
                            <button
                              onClick={() => handleApproveRejectEvent(event, "reject")}
                              className="bg-[#C8102E] hover:bg-red-700 text-white px-4 py-3 rounded-2xl font-bold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                            >
                              <XCircle className="w-5 h-5" />
                              <span className="text-sm">Reject Event</span>
                            </button>
                            <button
                              onClick={() => navigate(`/home/events/${event.id}`)}
                              className="bg-[#0A3D91] hover:bg-blue-800 text-white px-4 py-3 rounded-2xl font-bold transition-all shadow-md hover:shadow-lg flex items-center justify-center"
                            >
                              <Eye className="w-5 h-5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Approved Events Header */}
            {approvedEvents.length > 0 && (
              <div className="bg-gradient-to-r from-emerald-100 via-green-100 to-emerald-100 rounded-3xl p-6 border-2 border-green-300 shadow-xl">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-green-600 rounded-xl shadow-lg">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-green-900">
                      Approved Events ({approvedEvents.length})
                    </h2>
                    <p className="text-sm text-green-700 font-medium mt-1">
                      Successfully approved event submissions
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Approved Event Cards Grid - 2 Columns */}
            {approvedEvents.length > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {approvedEvents.map(event => {
                  const organizer = MOCK_USERS.find(u => u.id === event.createdBy);
                  return (
                    <div key={event.id} className="group bg-white rounded-3xl shadow-xl border-2 border-green-400 hover:border-green-500 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 overflow-hidden">
                      {/* Header with gradient background */}
                      <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />
                        <div className="relative z-10 flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <h3 className="text-2xl font-black text-white mb-3">{event.name}</h3>
                            <div className="flex flex-wrap items-center gap-3 text-sm text-green-100">
                              <span className="flex items-center gap-1.5 bg-white/20 px-3 py-1.5 rounded-lg backdrop-blur-sm">
                                <Calendar className="w-4 h-4" />
                                {new Date(event.date).toLocaleDateString('en-GB')}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur-sm rounded-full">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span className="text-sm font-bold text-green-700">Approved</span>
                          </div>
                        </div>
                      </div>

                      {/* Card Body */}
                      <div className="p-6">
                        <div>
                          <span className="text-xs text-[#707070] font-medium block mb-1">Organizer</span>
                          <span className="text-base text-[#1A1A24] font-bold block">{organizer?.fullName}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
                </div>
              )}

            {/* Rejected Events Header */}
            {rejectedEvents.length > 0 && (
              <div className="bg-gradient-to-r from-red-100 via-rose-100 to-red-100 rounded-3xl p-6 border-2 border-red-300 shadow-xl">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-red-600 rounded-xl shadow-lg">
                    <XCircle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-red-900">
                      Rejected Events ({rejectedEvents.length})
                    </h2>
                    <p className="text-sm text-red-700 font-medium mt-1">
                      Events requiring revision or resubmission
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Rejected Event Cards Grid - 2 Columns */}
            {rejectedEvents.length > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {rejectedEvents.map(event => {
                  const organizer = MOCK_USERS.find(u => u.id === event.createdBy);
                  return (
                    <div key={event.id} className="group bg-white rounded-3xl shadow-xl border-2 border-red-400 hover:border-red-500 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 overflow-hidden">
                      {/* Header with gradient background */}
                      <div className="bg-gradient-to-r from-red-600 to-rose-600 p-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />
                        <div className="relative z-10 flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <h3 className="text-2xl font-black text-white mb-3">{event.name}</h3>
                            <div className="flex flex-wrap items-center gap-3 text-sm text-red-100">
                              <span className="flex items-center gap-1.5 bg-white/20 px-3 py-1.5 rounded-lg backdrop-blur-sm">
                                <Calendar className="w-4 h-4" />
                                {new Date(event.date).toLocaleDateString('en-GB')}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur-sm rounded-full">
                            <XCircle className="w-4 h-4 text-red-600" />
                            <span className="text-sm font-bold text-red-700">Rejected</span>
                          </div>
                        </div>
                      </div>

                      {/* Card Body */}
                      <div className="p-6">
                        <div>
                          <span className="text-xs text-[#707070] font-medium block mb-1">Organizer</span>
                          <span className="text-base text-[#1A1A24] font-bold block">{organizer?.fullName}</span>
                        </div>
                      </div>
                    </div>
                  );
                  })}
                </div>
              )}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedRequest && (
        <KKFEnhancedDetailModal
          request={selectedRequest}
          onClose={() => setShowDetailModal(false)}
          onApprove={() => {
            setShowDetailModal(false);
            handleApproveRejectRequest(selectedRequest, "approve");
          }}
          onReject={() => {
            setShowDetailModal(false);
            handleApproveRejectRequest(selectedRequest, "reject");
          }}
          onRequestInfo={() => {
            setShowDetailModal(false);
            setSelectedRequest(selectedRequest);
            setApprovalAction("reject");
            setShowApprovalModal(true);
            // Note: In production, this would be a separate "info_requested" action
          }}
          hasApprovePermission={permissions.hasPermission('federation.approve')}
        />
      )}

      {/* Approval/Rejection Modal */}
      {showApprovalModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-auto">
            <div className={`p-6 border-b-2 ${
              approvalAction === "approve" ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
            }`}>
              <div className="flex items-center gap-3">
                {approvalAction === "approve" ? (
                  <CheckCircle className="w-8 h-8 text-green-600" />
                ) : (
                  <XCircle className="w-8 h-8 text-red-600" />
                )}
                <h2 className={`text-2xl font-black ${
                  approvalAction === "approve" ? "text-green-900" : "text-red-900"
                }`}>
                  {approvalAction === "approve" ? "Approve" : "Reject"} Request
                </h2>
              </div>
            </div>

            <div className="p-6">
              <div className="mb-6">
                <h3 className="text-xl font-black text-[#1A1A24] mb-2">
                  {selectedEvent ? selectedEvent.name : selectedRequest?.title}
                </h3>
                <p className="text-sm text-[#707070] font-medium">
                  You are about to {approvalAction} this request. Please add any comments below.
                </p>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-bold text-[#1A1A24] mb-2">
                  Comments {approvalAction === "reject" && <span className="text-[#C8102E]">*</span>}
                </label>
                <textarea
                  value={reviewComments}
                  onChange={(e) => setReviewComments(e.target.value)}
                  placeholder={`Add ${approvalAction === "reject" ? "rejection reason" : "approval notes"}...`}
                  rows={4}
                  className="w-full px-4 py-3 bg-[#F8F9FA] border-2 border-[#E0E0E0] rounded-xl font-medium text-[#1A1A24] placeholder-[#707070] focus:outline-none focus:border-[#0A3D91] focus:ring-2 focus:ring-[#0A3D91] focus:ring-opacity-20 resize-none"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowApprovalModal(false);
                    setSelectedEvent(null);
                    setSelectedRequest(null);
                    setApprovalAction(null);
                    setReviewComments("");
                  }}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-[#1A1A24] px-6 py-3 rounded-xl font-bold transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitApproval}
                  disabled={approvalAction === "reject" && !reviewComments.trim()}
                  className={`flex-1 px-6 py-3 rounded-xl font-bold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 ${
                    approvalAction === "approve"
                      ? "bg-green-600 hover:bg-green-700 text-white"
                      : "bg-[#C8102E] hover:bg-red-700 text-white"
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {approvalAction === "approve" ? (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      Confirm Approval
                    </>
                  ) : (
                    <>
                      <XCircle className="w-5 h-5" />
                      Confirm Rejection
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}