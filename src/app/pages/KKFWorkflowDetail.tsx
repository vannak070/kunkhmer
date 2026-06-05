import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { 
  CheckCircle, XCircle, ArrowLeft, AlertCircle, Calendar, Users, Shield, 
  MessageSquare, FileText, Trophy, Crown, Building2, CheckSquare, User,
  Phone, Mail, MapPin, HeartPulse, Activity, Dumbbell, Award, IdCard, Home
} from "lucide-react";
import { MOCK_EVENTS, MOCK_MATCHES, MOCK_FIGHTERS, MOCK_CLUBS } from "../data/mock";
import { usePermissions } from "../hooks/usePermissions";
import { MOCK_USERS } from "../data/users";
import { toast } from "sonner";

type WorkflowType = "event" | "match" | "fighter" | "club" | "champion";

interface WorkflowRequest {
  id: string;
  type: WorkflowType;
  title: string;
  status: "pending" | "approved" | "rejected";
  createdBy: string;
  createdDate: string;
  submittedDate?: string;
  reviewedBy?: string;
  reviewedDate?: string;
  comments?: string;
  data: any;
}

// Mock workflow requests data (same as in KKFWorkflow)
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
      // Personal Information
      fighterName: "Sok Bunthoeun",
      nameKH: "សុខ ប៊ុនធឿន",
      alias: "The Thunder",
      dob: "1998-05-15",
      pob: "Phnom Penh, Cambodia",
      nationality: "Cambodia",
      gender: "Male",
      
      // KYC Documents
      idType: "National ID",
      idNumber: "010012345",
      idExpiry: "2028-05-15",
      
      // Contact Details
      phone: "+855 12 345 678",
      email: "sokbunthoeun@gmail.com",
      address: "St. 271, Toul Kork",
      city: "Phnom Penh",
      emergencyName: "Sok Ratha",
      emergencyRelation: "Father",
      emergencyPhone: "+855 89 123 456",
      
      // Medical Information
      bloodType: "O+",
      lastMedicalCheck: "2025-03-01",
      medicalExpiry: "2026-03-01",
      medicalConditions: "None",
      allergies: "None",
      
      // Combat Profile
      weight: 67.5,
      height: "175 cm",
      reach: "178 cm",
      experience: "5 years",
      styles: ["Aggressive", "Clinch Master"],
      type: "Professional",
      grade: "B",
      origin: "Local",
      
      // Club/Training
      club: "Tiger Kun Khmer",
      clubId: "club-001",
      trainer: "Master Vong",
      promoter: "KKF Official",
      
      // Documents
      documents: ["National ID Card", "Medical Certificate", "Blood Test Results", "Club Registration"]
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
    id: "wf-003",
    type: "champion",
    title: "Title Fight: KKF Bantamweight Championship",
    status: "pending",
    createdBy: "u2",
    createdDate: "2025-03-15",
    submittedDate: "2025-03-17",
    data: {
      titleName: "KKF Bantamweight Championship",
      beltType: "Championship Belt",
      challenger: "Pich Sambath",
      champion: "Kim Sovannak",
      weightLimit: 61.2,
      rounds: 5,
      ranking: "Both fighters in Top 5",
      eventName: "Khmer New Year Fight Festival"
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
    id: "wf-007",
    type: "event",
    title: "Event Request: Battambang Fight Night",
    status: "pending",
    createdBy: "u2",
    createdDate: "2025-03-21",
    submittedDate: "2025-03-23",
    data: {
      eventName: "Battambang Fight Night",
      date: "2025-04-20",
      location: "Battambang Sports Arena",
      expectedMatches: 8,
      sponsors: ["Angkor Beer", "Wing Bank"]
    }
  },
  {
    id: "wf-008",
    type: "match",
    title: "Match Batch: BATCH-001 (Cambodia Fight Series)",
    status: "pending",
    createdBy: "u2",
    createdDate: "2025-03-22",
    submittedDate: "2025-03-23",
    data: {
      batchNumber: "BATCH-001",
      eventName: "Cambodia Fight Series",
      matchCount: 5,
      category: "Professional",
      totalFighters: 10,
      date: "2025-04-15",
      matches: [
        {
          matchNumber: 1,
          fighterA: {
            name: "Sok Bunthoeun",
            weight: 67.5,
            record: "12-3-0",
            club: "Tiger Kun Khmer",
            grade: "B"
          },
          fighterB: {
            name: "Pich Sambath",
            weight: 67.8,
            record: "10-2-1",
            club: "Diamond Fighters Gym",
            grade: "B"
          },
          weightAgreement: 68.0,
          rounds: 5,
          type: "Professional",
          isMainEvent: false
        },
        {
          matchNumber: 2,
          fighterA: {
            name: "Chan Virak",
            weight: 58.3,
            record: "8-1-0",
            club: "Phnom Penh Warriors",
            grade: "C"
          },
          fighterB: {
            name: "Meas Chanthy",
            weight: 58.5,
            record: "9-2-0",
            club: "Royal Combat Club",
            grade: "C"
          },
          weightAgreement: 59.0,
          rounds: 3,
          type: "Professional",
          isMainEvent: false
        },
        {
          matchNumber: 3,
          fighterA: {
            name: "Ly Sokha",
            weight: 70.3,
            record: "15-1-0",
            club: "Golden Lion Gym",
            grade: "A"
          },
          fighterB: {
            name: "Kim Sovannak",
            weight: 70.0,
            record: "14-2-1",
            club: "Angkor Warriors",
            grade: "A"
          },
          weightAgreement: 70.5,
          rounds: 5,
          type: "Professional",
          isMainEvent: true,
          titleFight: "KKF Lightweight Championship"
        },
        {
          matchNumber: 4,
          fighterA: {
            name: "Heng Bunna",
            weight: 61.2,
            record: "6-4-0",
            club: "Battambang Fight Club",
            grade: "D"
          },
          fighterB: {
            name: "Noun Sopheap",
            weight: 61.5,
            record: "7-3-2",
            club: "Siem Reap Champions",
            grade: "D"
          },
          weightAgreement: 62.0,
          rounds: 3,
          type: "Professional",
          isMainEvent: false
        },
        {
          matchNumber: 5,
          fighterA: {
            name: "Ouk Piseth",
            weight: 75.0,
            record: "11-5-1",
            club: "Khmer Pride Gym",
            grade: "B"
          },
          fighterB: {
            name: "Nguyen Van Thanh",
            weight: 75.2,
            record: "13-4-0",
            club: "Hanoi Champions",
            grade: "B"
          },
          weightAgreement: 75.5,
          rounds: 5,
          type: "Professional",
          isMainEvent: false
        }
      ]
    }
  },
  {
    id: "wf-004",
    type: "fighter",
    title: "Register Fighter: Nguyen Van Thanh",
    status: "approved",
    createdBy: "u3",
    createdDate: "2025-03-10",
    submittedDate: "2025-03-12",
    reviewedBy: "u1",
    reviewedDate: "2025-03-14",
    comments: "All documents verified. Fighter approved for competition.",
    data: {
      fighterName: "Nguyen Van Thanh",
      club: "Hanoi Champions",
      weight: 70.0,
      type: "Professional",
      origin: "Foreigner",
      documents: ["Passport", "Medical Certificate", "Visa"]
    }
  },
  {
    id: "wf-009",
    type: "event",
    title: "Event Request: Khmer New Year Fight Festival",
    status: "approved",
    createdBy: "u2",
    createdDate: "2025-03-05",
    submittedDate: "2025-03-07",
    reviewedBy: "u1",
    reviewedDate: "2025-03-10",
    comments: "Event approved. Excellent venue and organization plan.",
    data: {
      eventName: "Khmer New Year Fight Festival",
      date: "2025-04-14",
      location: "National Olympic Stadium",
      expectedMatches: 12,
      sponsors: ["Smart Axiata", "Cellcard", "Metfone"]
    }
  },
  {
    id: "wf-010",
    type: "champion",
    title: "Title Fight: KKF Lightweight Championship",
    status: "approved",
    createdBy: "u2",
    createdDate: "2025-03-08",
    submittedDate: "2025-03-10",
    reviewedBy: "u1",
    reviewedDate: "2025-03-12",
    comments: "Both fighters meet championship requirements. Title fight approved.",
    data: {
      titleName: "KKF Lightweight Championship",
      beltType: "Championship Belt",
      challenger: "Meas Chanthy",
      champion: "Ly Sokha",
      weightLimit: 70.3,
      rounds: 5,
      ranking: "Challenger ranked #1, Champion current titleholder",
      eventName: "Khmer New Year Fight Festival"
    }
  },
  {
    id: "wf-005",
    type: "club",
    title: "Register Club: Phnom Penh Elite Gym",
    status: "rejected",
    createdBy: "u6",
    createdDate: "2025-03-08",
    submittedDate: "2025-03-09",
    reviewedBy: "u1",
    reviewedDate: "2025-03-11",
    comments: "Facility does not meet KKF safety standards. Please upgrade equipment and reapply.",
    data: {
      clubName: "Phnom Penh Elite Gym",
      headCoach: "Chan Sophal",
      location: "Phnom Penh",
      fightersCount: 0,
      verificationDocs: ["Business License"]
    }
  },
  {
    id: "wf-011",
    type: "fighter",
    title: "Register Fighter: Lee Jae-sung",
    status: "rejected",
    createdBy: "u5",
    createdDate: "2025-03-16",
    submittedDate: "2025-03-18",
    reviewedBy: "u1",
    reviewedDate: "2025-03-19",
    comments: "Medical certificate expired. Please submit updated medical clearance.",
    data: {
      fighterName: "Lee Jae-sung",
      club: "Seoul Fight Academy",
      weight: 75.0,
      type: "Professional",
      origin: "Foreigner",
      documents: ["Passport", "Expired Medical Certificate"]
    }
  },
  {
    id: "wf-012",
    type: "fighter",
    title: "Register Fighter: Meas Bopha",
    status: "pending",
    createdBy: "u4",
    createdDate: "2025-03-25",
    submittedDate: "2025-03-26",
    data: {
      fighterName: "Meas Bopha",
      club: "Diamond Fighters Gym",
      weight: 62.0,
      type: "Professional",
      origin: "Local",
      documents: ["ID Card", "Medical Certificate", "Blood Test Results"]
    }
  }
];

const getTypeIcon = (type: WorkflowType) => {
  switch (type) {
    case "fighter": return Users;
    case "club": return Building2;
    case "event": return Calendar;
    case "match": return Shield;
    case "champion": return Trophy;
  }
};

const getTypeColor = (type: WorkflowType) => {
  switch (type) {
    case "fighter": return "bg-blue-100 text-blue-800 border-blue-300";
    case "club": return "bg-purple-100 text-purple-800 border-purple-300";
    case "event": return "bg-green-100 text-green-800 border-green-300";
    case "match": return "bg-orange-100 text-orange-800 border-orange-300";
    case "champion": return "bg-yellow-100 text-yellow-800 border-yellow-300";
  }
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case "pending":
      return <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-yellow-100 border-2 border-yellow-300 text-yellow-800 font-bold text-sm">
        <AlertCircle className="w-4 h-4" />
        Pending Review
      </span>;
    case "approved":
      return <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-100 border-2 border-green-300 text-green-800 font-bold text-sm">
        <CheckCircle className="w-4 h-4" />
        Approved
      </span>;
    case "rejected":
      return <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-100 border-2 border-red-300 text-red-800 font-bold text-sm">
        <XCircle className="w-4 h-4" />
        Rejected
      </span>;
  }
};

export function KKFWorkflowDetail() {
  const { requestId } = useParams();
  const navigate = useNavigate();
  const permissions = usePermissions();
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewAction, setReviewAction] = useState<"approve" | "reject">("approve");
  const [reviewComments, setReviewComments] = useState("");

  const request = MOCK_WORKFLOW_REQUESTS.find(r => r.id === requestId);

  if (!request) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F4F5F8] to-white p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center border-2 border-[#E0E0E0]">
            <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-[#1A1A24] mb-2">Request Not Found</h2>
            <p className="text-[#707070] mb-6">The workflow request you're looking for doesn't exist.</p>
            <button
              onClick={() => navigate("/kkf-workflow")}
              className="bg-[#0A3D91] text-white px-6 py-3 rounded-lg font-bold hover:bg-[#082E6E] transition-all"
            >
              Back to Workflow
            </button>
          </div>
        </div>
      </div>
    );
  }

  const submitter = MOCK_USERS.find(u => u.id === request.createdBy);
  const reviewer = request.reviewedBy ? MOCK_USERS.find(u => u.id === request.reviewedBy) : null;
  const TypeIcon = getTypeIcon(request.type);

  const handleReviewSubmit = () => {
    if (reviewAction === "reject" && !reviewComments.trim()) {
      toast.error("Please provide comments for rejection");
      return;
    }

    // Simulate approval/rejection
    toast.success(`Request ${reviewAction === "approve" ? "approved" : "rejected"} successfully!`);
    setShowReviewModal(false);
    
    // Navigate back after a short delay
    setTimeout(() => {
      navigate("/kkf-workflow");
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F4F5F8] to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#0A3D91] to-[#0D4DB8] text-white py-8 px-6 shadow-lg">
        <div className="max-w-6xl mx-auto">
          <button
            onClick={() => navigate("/kkf-workflow")}
            className="inline-flex items-center gap-2 text-white/90 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-bold">Back to Workflow</span>
          </button>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div className={`p-3 rounded-xl ${getTypeColor(request.type)} bg-opacity-20`}>
                  <TypeIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <span className="text-xs font-black uppercase tracking-wider text-white/70 block mb-1">
                    {request.type} Request
                  </span>
                  <h1 className="text-2xl font-black">{request.title}</h1>
                </div>
              </div>
            </div>
            <div>
              {getStatusBadge(request.status)}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto p-4 md:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Left Column - Details */}
          <div className="lg:col-span-2 space-y-4 md:space-y-6">
            {/* Request Information */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-[#E0E0E0]">
              <h2 className="text-lg font-black uppercase tracking-wider text-[#0A3D91] mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Complete Request Details
              </h2>
              
              <div className="bg-gradient-to-br from-[#F4F5F8] to-white rounded-xl border-2 border-[#E0E0E0] p-5 space-y-3">
                {request.type === "fighter" && (
                  <>
                    {/* Personal Information */}
                    {request.data.nameKH && (
                      <>
                        <div className="pb-3 border-b border-[#E0E0E0]">
                          <h5 className="text-xs font-black uppercase tracking-wider text-[#0A3D91] mb-2 flex items-center gap-2">
                            <User className="w-4 h-4" />
                            Personal Information
                          </h5>
                        </div>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                          <div>
                            <span className="text-xs text-[#707070] font-medium block mb-1">Full Name (EN)</span>
                            <span className="text-sm text-[#1A1A24] font-bold block">{request.data.fighterName}</span>
                          </div>
                          <div>
                            <span className="text-xs text-[#707070] font-medium block mb-1">Full Name (KH)</span>
                            <span className="text-sm text-[#1A1A24] font-bold block">{request.data.nameKH}</span>
                          </div>
                          {request.data.alias && (
                            <div className="col-span-2">
                              <span className="text-xs text-[#707070] font-medium block mb-1">Fighting Alias</span>
                              <span className="text-sm text-[#1A1A24] font-bold italic block">"{request.data.alias}"</span>
                            </div>
                          )}
                          {request.data.dob && (
                            <div>
                              <span className="text-xs text-[#707070] font-medium block mb-1">Date of Birth</span>
                              <span className="text-sm text-[#1A1A24] font-bold block">
                                {new Date(request.data.dob).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                              </span>
                            </div>
                          )}
                          {request.data.gender && (
                            <div>
                              <span className="text-xs text-[#707070] font-medium block mb-1">Gender</span>
                              <span className="text-sm text-[#1A1A24] font-bold block">{request.data.gender}</span>
                            </div>
                          )}
                          {request.data.nationality && (
                            <div>
                              <span className="text-xs text-[#707070] font-medium block mb-1">Nationality</span>
                              <span className="text-sm text-[#1A1A24] font-bold block">{request.data.nationality}</span>
                            </div>
                          )}
                          {request.data.pob && (
                            <div>
                              <span className="text-xs text-[#707070] font-medium block mb-1">Place of Birth</span>
                              <span className="text-sm text-[#1A1A24] font-bold block">{request.data.pob}</span>
                            </div>
                          )}
                        </div>
                      </>
                    )}

                    {/* KYC Documents */}
                    {request.data.idType && (
                      <>
                        <div className="pb-3 border-b border-[#E0E0E0] mt-6">
                          <h5 className="text-xs font-black uppercase tracking-wider text-[#0A3D91] mb-2 flex items-center gap-2">
                            <IdCard className="w-4 h-4" />
                            KYC Documents
                          </h5>
                        </div>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                          <div>
                            <span className="text-xs text-[#707070] font-medium block mb-1">ID Type</span>
                            <span className="text-sm text-[#1A1A24] font-bold block">{request.data.idType}</span>
                          </div>
                          <div>
                            <span className="text-xs text-[#707070] font-medium block mb-1">ID Number</span>
                            <span className="text-sm text-[#1A1A24] font-bold block">{request.data.idNumber}</span>
                          </div>
                          {request.data.idExpiry && (
                            <div>
                              <span className="text-xs text-[#707070] font-medium block mb-1">ID Expiry</span>
                              <span className="text-sm text-[#1A1A24] font-bold block">
                                {new Date(request.data.idExpiry).toLocaleDateString('en-GB')}
                              </span>
                            </div>
                          )}
                        </div>
                      </>
                    )}

                    {/* Contact Information */}
                    {request.data.phone && (
                      <>
                        <div className="pb-3 border-b border-[#E0E0E0] mt-6">
                          <h5 className="text-xs font-black uppercase tracking-wider text-[#0A3D91] mb-2 flex items-center gap-2">
                            <Phone className="w-4 h-4" />
                            Contact Information
                          </h5>
                        </div>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                          <div>
                            <span className="text-xs text-[#707070] font-medium block mb-1">Phone</span>
                            <span className="text-sm text-[#1A1A24] font-bold block">{request.data.phone}</span>
                          </div>
                          {request.data.email && (
                            <div>
                              <span className="text-xs text-[#707070] font-medium block mb-1">Email</span>
                              <span className="text-sm text-[#1A1A24] font-bold block">{request.data.email}</span>
                            </div>
                          )}
                          {request.data.address && (
                            <div className="col-span-2">
                              <span className="text-xs text-[#707070] font-medium block mb-1">Address</span>
                              <span className="text-sm text-[#1A1A24] font-bold block">{request.data.address}, {request.data.city}</span>
                            </div>
                          )}
                          {request.data.emergencyName && (
                            <>
                              <div className="col-span-2 mt-2">
                                <span className="text-[10px] font-black text-orange-600 uppercase tracking-wider block mb-2">Emergency Contact</span>
                              </div>
                              <div>
                                <span className="text-xs text-[#707070] font-medium block mb-1">Name</span>
                                <span className="text-sm text-[#1A1A24] font-bold block">{request.data.emergencyName}</span>
                              </div>
                              <div>
                                <span className="text-xs text-[#707070] font-medium block mb-1">Relation</span>
                                <span className="text-sm text-[#1A1A24] font-bold block">{request.data.emergencyRelation}</span>
                              </div>
                              <div>
                                <span className="text-xs text-[#707070] font-medium block mb-1">Phone</span>
                                <span className="text-sm text-[#1A1A24] font-bold block">{request.data.emergencyPhone}</span>
                              </div>
                            </>
                          )}
                        </div>
                      </>
                    )}

                    {/* Medical Information */}
                    {request.data.bloodType && (
                      <>
                        <div className="pb-3 border-b border-[#E0E0E0] mt-6">
                          <h5 className="text-xs font-black uppercase tracking-wider text-[#0A3D91] mb-2 flex items-center gap-2">
                            <HeartPulse className="w-4 h-4" />
                            Medical Information
                          </h5>
                        </div>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                          <div>
                            <span className="text-xs text-[#707070] font-medium block mb-1">Blood Type</span>
                            <span className="inline-block px-3 py-1 bg-red-100 text-red-800 text-sm font-bold rounded">{request.data.bloodType}</span>
                          </div>
                          {request.data.lastMedicalCheck && (
                            <div>
                              <span className="text-xs text-[#707070] font-medium block mb-1">Last Medical Check</span>
                              <span className="text-sm text-[#1A1A24] font-bold block">
                                {new Date(request.data.lastMedicalCheck).toLocaleDateString('en-GB')}
                              </span>
                            </div>
                          )}
                          {request.data.medicalExpiry && (
                            <div>
                              <span className="text-xs text-[#707070] font-medium block mb-1">Medical Expires</span>
                              <span className="text-sm text-[#1A1A24] font-bold block">
                                {new Date(request.data.medicalExpiry).toLocaleDateString('en-GB')}
                              </span>
                            </div>
                          )}
                          <div className="col-span-2">
                            <span className="text-xs text-[#707070] font-medium block mb-1">Medical Conditions</span>
                            <span className="text-sm text-[#1A1A24] font-bold block">{request.data.medicalConditions || "None"}</span>
                          </div>
                          <div className="col-span-2">
                            <span className="text-xs text-[#707070] font-medium block mb-1">Allergies</span>
                            <span className="text-sm text-[#1A1A24] font-bold block">{request.data.allergies || "None"}</span>
                          </div>
                        </div>
                      </>
                    )}

                    {/* Combat Profile */}
                    <div className="pb-3 border-b border-[#E0E0E0] mt-6">
                      <h5 className="text-xs font-black uppercase tracking-wider text-[#0A3D91] mb-2 flex items-center gap-2">
                        <Activity className="w-4 h-4" />
                        Combat Profile
                      </h5>
                    </div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                      <div>
                        <span className="text-xs text-[#707070] font-medium block mb-1">Weight (kg)</span>
                        <span className="text-sm text-[#1A1A24] font-bold block">{request.data.weight} kg</span>
                      </div>
                      {request.data.height && (
                        <div>
                          <span className="text-xs text-[#707070] font-medium block mb-1">Height</span>
                          <span className="text-sm text-[#1A1A24] font-bold block">{request.data.height}</span>
                        </div>
                      )}
                      {request.data.reach && (
                        <div>
                          <span className="text-xs text-[#707070] font-medium block mb-1">Reach</span>
                          <span className="text-sm text-[#1A1A24] font-bold block">{request.data.reach}</span>
                        </div>
                      )}
                      {request.data.experience && (
                        <div>
                          <span className="text-xs text-[#707070] font-medium block mb-1">Experience</span>
                          <span className="text-sm text-[#1A1A24] font-bold block">{request.data.experience}</span>
                        </div>
                      )}
                      <div>
                        <span className="text-xs text-[#707070] font-medium block mb-1">Type</span>
                        <span className={`text-sm font-bold inline-block px-2 py-1 rounded ${
                          request.data.type === 'Professional' ? 'bg-[#0A3D91] text-white' : 'bg-[#F2C94C] text-[#333333]'
                        }`}>{request.data.type}</span>
                      </div>
                      {request.data.grade && (
                        <div>
                          <span className="text-xs text-[#707070] font-medium block mb-1">Grade</span>
                          <span className={`inline-block px-3 py-1 text-sm font-bold rounded ${
                            request.data.grade === 'A' ? 'bg-green-500 text-white' :
                            request.data.grade === 'B' ? 'bg-blue-500 text-white' :
                            request.data.grade === 'C' ? 'bg-yellow-500 text-white' :
                            'bg-gray-500 text-white'
                          }`}>Grade {request.data.grade}</span>
                        </div>
                      )}
                      <div>
                        <span className="text-xs text-[#707070] font-medium block mb-1">Origin</span>
                        <span className={`text-sm font-bold inline-block px-2 py-1 rounded ${
                          request.data.origin === 'Local' ? 'bg-green-100 text-green-800' : 'bg-purple-100 text-purple-800'
                        }`}>{request.data.origin}</span>
                      </div>
                      {request.data.styles && request.data.styles.length > 0 && (
                        <div className="col-span-2">
                          <span className="text-xs text-[#707070] font-medium block mb-2">Fighting Styles</span>
                          <div className="flex flex-wrap gap-2">
                            {request.data.styles.map((style: string, idx: number) => (
                              <span key={idx} className="inline-block px-3 py-1 bg-gradient-to-r from-[#0A3D91] to-[#0847A8] text-white text-xs font-bold rounded-lg">
                                {style}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Club & Training */}
                    <div className="pb-3 border-b border-[#E0E0E0] mt-6">
                      <h5 className="text-xs font-black uppercase tracking-wider text-[#0A3D91] mb-2 flex items-center gap-2">
                        <Dumbbell className="w-4 h-4" />
                        Club & Training
                      </h5>
                    </div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                      <div className="col-span-2">
                        <span className="text-xs text-[#707070] font-medium block mb-1">Club/Gym</span>
                        <span className="text-sm text-[#1A1A24] font-bold block">{request.data.club}</span>
                      </div>
                      {request.data.trainer && (
                        <div>
                          <span className="text-xs text-[#707070] font-medium block mb-1">Trainer</span>
                          <span className="text-sm text-[#1A1A24] font-bold block">{request.data.trainer}</span>
                        </div>
                      )}
                      {request.data.promoter && (
                        <div>
                          <span className="text-xs text-[#707070] font-medium block mb-1">Promoter</span>
                          <span className="text-sm text-[#1A1A24] font-bold block">{request.data.promoter}</span>
                        </div>
                      )}
                    </div>

                    {/* Documents */}
                    <div className="pb-3 border-b border-[#E0E0E0] mt-6">
                      <h5 className="text-xs font-black uppercase tracking-wider text-[#0A3D91] mb-2 flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Submitted Documents
                      </h5>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {request.data.documents.map((doc: string, idx: number) => (
                        <span key={idx} className="inline-flex items-center gap-1 text-xs bg-white border-2 border-green-300 text-[#1A1A24] font-bold px-3 py-1.5 rounded-lg">
                          <CheckSquare className="w-3 h-3 text-green-600" />
                          {doc}
                        </span>
                      ))}
                    </div>
                  </>
                )}

                {request.type === "club" && (
                  <>
                    <div className="pb-3 border-b border-[#E0E0E0]">
                      <h5 className="text-xs font-black uppercase tracking-wider text-[#0A3D91] mb-2">Club Information</h5>
                    </div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-3">
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
                      <div className="col-span-2">
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
                  </>
                )}

                {request.type === "champion" && (
                  <>
                    <div className="pb-3 border-b border-[#E0E0E0]">
                      <h5 className="text-xs font-black uppercase tracking-wider text-[#0A3D91] mb-2 flex items-center gap-2">
                        <Trophy className="w-4 h-4 text-[#F2C94C]" />
                        Championship Title Fight
                      </h5>
                    </div>
                    <div className="space-y-4">
                      <div className="bg-white border-2 border-[#F2C94C] rounded-lg p-4">
                        <span className="text-xs text-[#707070] font-medium block mb-1">Title</span>
                        <span className="text-base text-[#1A1A24] font-bold block">{request.data.titleName}</span>
                        <span className="text-xs text-[#707070] mt-1 block">{request.data.beltType || 'Championship Belt'}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-red-50 border-2 border-red-200 rounded-lg p-3">
                          <span className="text-xs font-black uppercase tracking-wider text-red-700 block mb-1">Challenger</span>
                          <span className="text-sm text-[#1A1A24] font-bold block">{request.data.challenger}</span>
                        </div>
                        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-3">
                          <span className="text-xs font-black uppercase tracking-wider text-blue-700 block mb-1 flex items-center gap-1">
                            <Crown className="w-3 h-3" />
                            Champion
                          </span>
                          <span className="text-sm text-[#1A1A24] font-bold block">{request.data.champion}</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <span className="text-xs text-[#707070] font-medium block mb-1">Weight Limit</span>
                          <span className="text-sm text-[#1A1A24] font-bold block">{request.data.weightLimit} kg</span>
                        </div>
                        <div>
                          <span className="text-xs text-[#707070] font-medium block mb-1">Rounds</span>
                          <span className="text-sm text-[#1A1A24] font-bold block">{request.data.rounds || 5}</span>
                        </div>
                        {request.data.eventName && (
                          <div className="col-span-3">
                            <span className="text-xs text-[#707070] font-medium block mb-1">Event</span>
                            <span className="text-sm text-[#1A1A24] font-bold block">{request.data.eventName}</span>
                          </div>
                        )}
                      </div>
                      <div className="bg-gradient-to-r from-green-50 to-green-100 border-2 border-green-300 rounded-lg p-3">
                        <span className="text-xs font-black uppercase tracking-wider text-green-800 block mb-1">Eligibility Status</span>
                        <span className="text-sm text-green-900 font-bold block">{request.data.ranking}</span>
                      </div>
                    </div>
                  </>
                )}

                {request.type === "event" && (
                  <>
                    <div className="pb-3 border-b border-[#E0E0E0]">
                      <h5 className="text-xs font-black uppercase tracking-wider text-[#0A3D91] mb-2">Event Information</h5>
                    </div>
                    <div className="space-y-3">
                      <div className="bg-white border-2 border-[#0A3D91] rounded-lg p-4">
                        <span className="text-base text-[#1A1A24] font-bold block mb-2">{request.data.eventName}</span>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div className="flex items-center gap-2 text-[#707070]">
                            <Calendar className="w-4 h-4 text-[#0A3D91]" />
                            <span>{new Date(request.data.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                          </div>
                          <div className="flex items-center gap-2 text-[#707070]">
                            <Building2 className="w-4 h-4 text-[#0A3D91]" />
                            <span>{request.data.location}</span>
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-gradient-to-br from-[#F4F5F8] to-white border border-[#E0E0E0] rounded-lg p-3">
                          <span className="text-xs text-[#707070] font-medium block mb-1">Expected Matches</span>
                          <span className="text-lg text-[#1A1A24] font-bold block">{request.data.expectedMatches}</span>
                        </div>
                      </div>
                      <div>
                        <span className="text-xs text-[#707070] font-medium block mb-2">Event Sponsors</span>
                        <div className="flex flex-wrap gap-2">
                          {request.data.sponsors.map((sponsor: string, idx: number) => (
                            <span key={idx} className="inline-block text-xs bg-gradient-to-r from-[#F2C94C] to-[#E2B93C] text-[#333333] font-bold px-3 py-1.5 rounded-lg">
                              {sponsor}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {request.type === "match" && (
                  <>
                    <div className="pb-3 border-b border-[#E0E0E0]">
                      <h5 className="text-xs font-black uppercase tracking-wider text-[#0A3D91] mb-2">Match Batch Information</h5>
                    </div>
                    <div className="space-y-3">
                      <div className="bg-white border-2 border-[#0A3D91] rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-black uppercase tracking-wider text-[#707070]">Batch Number</span>
                          <span className="text-lg text-[#0A3D91] font-bold">{request.data.batchNumber}</span>
                        </div>
                        <span className="text-sm text-[#707070] font-medium">Event: <strong className="text-[#1A1A24]">{request.data.eventName}</strong></span>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-gradient-to-br from-[#F4F5F8] to-white border border-[#E0E0E0] rounded-lg p-3">
                          <span className="text-xs text-[#707070] font-medium block mb-1">Match Date</span>
                          <span className="text-sm text-[#1A1A24] font-bold block">{request.data.date ? new Date(request.data.date).toLocaleDateString('en-GB') : 'TBD'}</span>
                        </div>
                        <div className="bg-gradient-to-br from-[#F4F5F8] to-white border border-[#E0E0E0] rounded-lg p-3">
                          <span className="text-xs text-[#707070] font-medium block mb-1">Category</span>
                          <span className={`text-sm font-bold inline-block px-2 py-1 rounded ${
                            request.data.category === 'Professional' ? 'bg-[#0A3D91] text-white' : 'bg-[#F2C94C] text-[#333333]'
                          }`}>{request.data.category}</span>
                        </div>
                        <div className="bg-gradient-to-br from-[#F4F5F8] to-white border border-[#E0E0E0] rounded-lg p-3">
                          <span className="text-xs text-[#707070] font-medium block mb-1">Total Matches</span>
                          <span className="text-lg text-[#1A1A24] font-bold block">{request.data.matchCount}</span>
                        </div>
                        <div className="bg-gradient-to-br from-[#F4F5F8] to-white border border-[#E0E0E0] rounded-lg p-3">
                          <span className="text-xs text-[#707070] font-medium block mb-1">Total Fighters</span>
                          <span className="text-lg text-[#1A1A24] font-bold block">{request.data.totalFighters}</span>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="pb-3 border-b border-[#E0E0E0]">
                          <h5 className="text-xs font-black uppercase tracking-wider text-[#0A3D91] mb-2 flex items-center gap-2">
                            <Shield className="w-4 h-4" />
                            Match Details ({request.data.matchCount} Matches)
                          </h5>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {request.data.matches.map((match: any, idx: number) => (
                          <div key={idx} className="bg-white border-2 border-[#E0E0E0] rounded-xl p-4 hover:border-[#0A3D91] transition-all hover:shadow-lg">
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-xs font-black uppercase tracking-wider text-[#0A3D91]">Match #{match.matchNumber}</span>
                              <span className={`text-xs font-bold inline-block px-2.5 py-1 rounded-lg shadow-sm ${
                                match.isMainEvent ? 'bg-gradient-to-r from-[#0A3D91] to-[#0847A8] text-white' : 'bg-gradient-to-r from-[#F2C94C] to-[#E2B93C] text-[#333333]'
                              }`}>{match.isMainEvent ? '⭐ MAIN EVENT' : 'Supporting'}</span>
                            </div>

                            {/* Title Fight Badge */}
                            {match.titleFight && (
                              <div className="mb-3 bg-gradient-to-r from-[#F2C94C] to-[#E2B93C] border-2 border-[#F2C94C] rounded-lg p-2.5 flex items-center gap-2">
                                <Crown className="w-4 h-4 text-[#333333]" />
                                <span className="text-xs font-black text-[#333333] uppercase tracking-wide">{match.titleFight}</span>
                              </div>
                            )}

                            {/* Fighter Cards */}
                            <div className="space-y-2 mb-3">
                              <div className="bg-gradient-to-br from-red-50 to-white border-l-4 border-[#C8102E] rounded-lg p-3">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-[10px] font-black uppercase tracking-wider text-[#C8102E]">Red Corner</span>
                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                    match.fighterA.grade === 'A' ? 'bg-green-500 text-white' :
                                    match.fighterA.grade === 'B' ? 'bg-blue-500 text-white' :
                                    match.fighterA.grade === 'C' ? 'bg-yellow-500 text-white' :
                                    'bg-gray-500 text-white'
                                  }`}>Grade {match.fighterA.grade}</span>
                                </div>
                                <div className="font-bold text-[#1A1A24] mb-1">{match.fighterA.name}</div>
                                <div className="grid grid-cols-2 gap-1 text-[10px] text-[#707070]">
                                  <div>Weight: <span className="font-bold text-[#1A1A24]">{match.fighterA.weight} kg</span></div>
                                  <div>Record: <span className="font-bold text-[#1A1A24]">{match.fighterA.record}</span></div>
                                  <div className="col-span-2">Club: <span className="font-bold text-[#1A1A24]">{match.fighterA.club}</span></div>
                                </div>
                              </div>

                              <div className="text-center py-1">
                                <span className="text-xs font-black text-[#707070] uppercase tracking-wider">VS</span>
                              </div>

                              <div className="bg-gradient-to-br from-blue-50 to-white border-l-4 border-[#0A3D91] rounded-lg p-3">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-[10px] font-black uppercase tracking-wider text-[#0A3D91]">Blue Corner</span>
                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                    match.fighterB.grade === 'A' ? 'bg-green-500 text-white' :
                                    match.fighterB.grade === 'B' ? 'bg-blue-500 text-white' :
                                    match.fighterB.grade === 'C' ? 'bg-yellow-500 text-white' :
                                    'bg-gray-500 text-white'
                                  }`}>Grade {match.fighterB.grade}</span>
                                </div>
                                <div className="font-bold text-[#1A1A24] mb-1">{match.fighterB.name}</div>
                                <div className="grid grid-cols-2 gap-1 text-[10px] text-[#707070]">
                                  <div>Weight: <span className="font-bold text-[#1A1A24]">{match.fighterB.weight} kg</span></div>
                                  <div>Record: <span className="font-bold text-[#1A1A24]">{match.fighterB.record}</span></div>
                                  <div className="col-span-2">Club: <span className="font-bold text-[#1A1A24]">{match.fighterB.club}</span></div>
                                </div>
                              </div>
                            </div>

                            {/* Match Details */}
                            <div className="grid grid-cols-2 gap-2 pt-3 border-t border-[#E0E0E0]">
                              <div className="text-center">
                                <div className="text-[10px] text-[#707070] font-medium">Weight Agreement</div>
                                <div className="text-sm font-bold text-[#0A3D91]">{match.weightAgreement} kg</div>
                              </div>
                              <div className="text-center">
                                <div className="text-[10px] text-[#707070] font-medium">Rounds</div>
                                <div className="text-sm font-bold text-[#0A3D91]">{match.rounds}</div>
                              </div>
                            </div>
                          </div>
                        ))}
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Review Comments (if exists) */}
            {request.comments && (
              <div className={`rounded-2xl shadow-lg p-6 border-2 ${
                request.status === "approved" 
                  ? "bg-green-50 border-green-200" 
                  : "bg-red-50 border-red-200"
              }`}>
                <div className="flex items-start gap-3">
                  <MessageSquare className={`w-6 h-6 mt-0.5 ${request.status === "approved" ? "text-green-700" : "text-[#C8102E]"}`} />
                  <div className="flex-1">
                    <h3 className={`text-sm font-black uppercase tracking-wider ${request.status === "approved" ? "text-green-900" : "text-red-900"} mb-2`}>
                      Review Comments
                    </h3>
                    <p className={`text-base ${request.status === "approved" ? "text-green-800" : "text-red-800"} mb-3`}>
                      {request.comments}
                    </p>
                    {reviewer && (
                      <p className="text-sm text-[#707070]">
                        Reviewed by <strong>{reviewer.fullName}</strong> on {new Date(request.reviewedDate!).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Metadata & Actions */}
          <div className="space-y-6">
            {/* Submission Info */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-[#E0E0E0]">
              <h3 className="text-sm font-black uppercase tracking-wider text-[#707070] mb-4">Submission Details</h3>
              <div className="space-y-4">
                <div className="bg-gradient-to-br from-blue-50 to-white border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-4 h-4 text-[#0A3D91]" />
                    <span className="text-xs font-black uppercase tracking-wider text-[#707070]">Submitted By</span>
                  </div>
                  <p className="text-sm font-bold text-[#1A1A24]">{submitter?.fullName || "Unknown"}</p>
                  <p className="text-xs text-[#707070] mt-1">{submitter?.role || ""}</p>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-white border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4 text-[#0A3D91]" />
                    <span className="text-xs font-black uppercase tracking-wider text-[#707070]">Submission Date</span>
                  </div>
                  <p className="text-sm font-bold text-[#1A1A24]">
                    {new Date(request.submittedDate || request.createdDate).toLocaleDateString('en-GB', { 
                      day: 'numeric', 
                      month: 'long', 
                      year: 'numeric' 
                    })}
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            {request.status === "pending" && permissions.hasPermission('federation.approve') && (
              <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-[#E0E0E0]">
                <h3 className="text-sm font-black uppercase tracking-wider text-[#707070] mb-4">Review Actions</h3>
                <div className="space-y-3">
                  <button
                    onClick={() => {
                      setReviewAction("approve");
                      setShowReviewModal(true);
                    }}
                    className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-5 py-3 rounded-lg font-bold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-5 h-5" />
                    Approve Request
                  </button>
                  <button
                    onClick={() => {
                      setReviewAction("reject");
                      setShowReviewModal(true);
                    }}
                    className="w-full bg-gradient-to-r from-[#C8102E] to-red-700 hover:from-red-700 hover:to-red-800 text-white px-5 py-3 rounded-lg font-bold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                  >
                    <XCircle className="w-5 h-5" />
                    Reject Request
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Review Modal with Validation Drawer & Signature Pad */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 transition-all duration-300">
          <div className="bg-[#1A1A24] border-2 border-white/10 text-white rounded-3xl shadow-2xl max-w-xl w-full p-6 overflow-hidden relative">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none" />
            
            <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-300 uppercase tracking-tight mb-4 flex items-center gap-2 relative z-10">
              {reviewAction === "approve" ? "✍️ Sanction & Approve Request" : "❌ Reject Request"}
            </h2>

            {/* Validation Requirements Checklist */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-4 relative z-10">
              <h3 className="text-xs font-black text-[#F2C94C] uppercase tracking-[0.2em] mb-3">
                KKF Official Compliance Checklist
              </h3>
              
              <div className="space-y-2.5">
                <label className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-xl cursor-pointer transition-colors">
                  <input type="checkbox" defaultChecked className="w-5 h-5 rounded border-white/20 text-[#0A3D91] focus:ring-[#0A3D91]" />
                  <span className="text-xs text-gray-200">Legal Name / Khmer Native script match verification</span>
                </label>
                <label className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-xl cursor-pointer transition-colors">
                  <input type="checkbox" defaultChecked className="w-5 h-5 rounded border-white/20 text-[#0A3D91] focus:ring-[#0A3D91]" />
                  <span className="text-xs text-gray-200">Medical cert & Blood-type compatibility verified</span>
                </label>
                <label className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-xl cursor-pointer transition-colors">
                  <input type="checkbox" defaultChecked className="w-5 h-5 rounded border-white/20 text-[#0A3D91] focus:ring-[#0A3D91]" />
                  <span className="text-xs text-gray-200">Club/Gym license verification check complete</span>
                </label>
              </div>
            </div>
            
            <div className="mb-4 relative z-10">
              <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">
                Official Review Notes {reviewAction === "reject" && <span className="text-[#C8102E]">*</span>}
              </label>
              <textarea
                value={reviewComments}
                onChange={(e) => setReviewComments(e.target.value)}
                placeholder={reviewAction === "approve" ? "Optional sanction notes..." : "Reason for rejection..."}
                rows={3}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-500 focus:border-[#F2C94C] focus:outline-none text-sm transition-all"
              />
            </div>

            {/* Digital Signature Pad Mockup */}
            {reviewAction === "approve" && (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-6 relative z-10">
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-xs font-black text-[#F2C94C] uppercase tracking-wider">
                    Digital Signature Pad
                  </label>
                  <span className="text-[10px] text-green-400 font-bold uppercase tracking-wider">Secure Connection</span>
                </div>
                
                {/* Visual signature drawing simulator container */}
                <div className="h-28 bg-[#111119] border-2 border-dashed border-white/10 rounded-xl flex items-center justify-center relative overflow-hidden group">
                  {/* Mock drawn signature line SVG */}
                  <svg className="w-48 h-16 text-[#F2C94C] opacity-80" viewBox="0 0 200 60" fill="none" stroke="currentColor" strokeWidth="3">
                    <path d="M10,40 Q30,10 60,35 T110,20 T150,45 T190,15" strokeLinecap="round" />
                  </svg>
                  <span className="absolute bottom-2 right-3 text-[9px] text-gray-500 uppercase tracking-wider font-mono">KKF_ADMIN_SECURE_KEY</span>
                </div>
              </div>
            )}

            <div className="flex gap-3 relative z-10">
              <button
                onClick={() => {
                  setShowReviewModal(false);
                  setReviewComments("");
                }}
                className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 text-white px-5 py-3 rounded-xl font-bold transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleReviewSubmit}
                className={`flex-1 ${
                  reviewAction === "approve"
                    ? "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                    : "bg-gradient-to-r from-[#C8102E] to-red-700 hover:from-red-700 hover:to-red-800"
                } text-white px-5 py-3 rounded-xl font-bold transition-all shadow-lg`}
              >
                Confirm {reviewAction === "approve" ? "Sanction & Approval" : "Rejection"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}