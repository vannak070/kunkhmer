import { X, CheckCircle, XCircle, Users, Calendar, CheckSquare, AlertTriangle, Info, Clock, FileText, Activity, Shield, Upload, Crown, Trophy } from "lucide-react";
import { MOCK_USERS } from "../data/users";
import { useState } from "react";
import idCardImage from "figma:asset/9930c85cadfdb2498375e16d0d3df531f49fbecd.png";

type WorkflowStatus = "draft" | "submitted" | "under_review" | "approved" | "rejected" | "info_requested" | "pending";

interface ValidationCheck {
  label: string;
  status: "valid" | "invalid" | "missing";
  message?: string;
}

interface WorkflowRequest {
  id: string;
  type: "event" | "match" | "fighter" | "club" | "champion";
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

interface KKFEnhancedDetailModalProps {
  request: WorkflowRequest;
  onClose: () => void;
  onApprove: () => void;
  onReject: () => void;
  onRequestInfo: () => void;
  hasApprovePermission: boolean;
}

export function KKFEnhancedDetailModal({
  request,
  onClose,
  onApprove,
  onReject,
  onRequestInfo,
  hasApprovePermission
}: KKFEnhancedDetailModalProps) {
  const submitter = MOCK_USERS.find(u => u.id === request.createdBy);
  const reviewer = request.reviewedBy ? MOCK_USERS.find(u => u.id === request.reviewedBy) : null;
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null);

  // Mock document images - in real app, these would come from the request data
  const documentImages: Record<string, string> = {
    "ID Card": idCardImage,
    "Medical Certificate": idCardImage, // Using same image for demo
    "National ID Card": idCardImage,
    "Blood Test Results": idCardImage,
    "Fight Record": idCardImage,
    "Parental Consent": idCardImage,
    "Club Registration": idCardImage
  };

  // Get status badge with enhanced states
  const getStatusBadge = (status: WorkflowStatus) => {
    const statusConfig: Record<string, { color: string; icon: any; label: string }> = {
      draft: { color: "bg-gray-100 border-gray-300 text-gray-700", icon: FileText, label: "Draft" },
      submitted: { color: "bg-blue-100 border-blue-300 text-blue-700", icon: Upload, label: "Submitted" },
      under_review: { color: "bg-amber-100 border-amber-400 text-amber-700", icon: Clock, label: "Under Review" },
      approved: { color: "bg-green-100 border-green-400 text-green-700", icon: CheckCircle, label: "Approved" },
      rejected: { color: "bg-red-100 border-red-400 text-red-700", icon: XCircle, label: "Rejected" },
      info_requested: { color: "bg-purple-100 border-purple-400 text-purple-700", icon: Info, label: "Info Requested" },
      pending: { color: "bg-amber-100 border-amber-400 text-amber-700", icon: Clock, label: "Pending Review" }
    };

    const config = statusConfig[status] || statusConfig.submitted;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-2 ${config.color} border-2 px-4 py-2 rounded-xl font-bold`}>
        <Icon className="w-4 h-4" />
        {config.label}
      </span>
    );
  };

  // Progress bar for submission flow
  const getProgressSteps = () => {
    const steps = [
      { key: "draft", label: "Draft" },
      { key: "submitted", label: "Submitted" },
      { key: "under_review", label: "Review" },
      { key: "approved", label: "Approved" }
    ];

    const statusOrder = ["draft", "submitted", "under_review", "info_requested", "approved", "rejected"];
    const currentIndex = statusOrder.indexOf(request.status);

    return steps.map((step, index) => {
      const isActive = index <= currentIndex || request.status === "approved";
      const isCurrent = step.key === request.status;
      const isRejected = request.status === "rejected";

      return (
        <div key={step.key} className="flex-1 flex items-center">
          <div className="flex flex-col items-center w-full">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border-2 transition-all ${
              isRejected && index >= currentIndex
                ? "bg-red-100 border-red-400 text-red-700"
                : isActive
                ? "bg-[#0A3D91] border-[#0A3D91] text-white"
                : "bg-gray-200 border-gray-300 text-gray-500"
            }`}>
              {isActive ? <CheckCircle className="w-5 h-5" /> : index + 1}
            </div>
            <span className={`mt-2 text-xs font-bold ${
              isCurrent ? "text-[#0A3D91]" : isActive ? "text-gray-700" : "text-gray-400"
            }`}>
              {step.label}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div className={`h-1 flex-1 mx-2 rounded-full ${
              isActive ? "bg-[#0A3D91]" : "bg-gray-200"
            }`} />
          )}
        </div>
      );
    });
  };

  // Generate mock validation checks for fighter registration
  const getValidationChecks = (): ValidationCheck[] => {
    if (request.validation) return request.validation;

    if (request.type === "fighter") {
      return [
        { label: "ID Card Uploaded", status: "valid" },
        { label: "Medical Certificate", status: request.data.documents.includes("Medical Certificate") ? "valid" : "missing", message: request.data.documents.includes("Medical Certificate") ? undefined : "Required for registration" },
        { label: "Fight Record", status: request.data.type === "Professional" && request.data.documents.includes("Fight Record") ? "valid" : request.data.type === "Amateur" ? "valid" : "missing" },
        { label: "Weight in Range", status: request.data.weight > 45 && request.data.weight < 100 ? "valid" : "invalid", message: request.data.weight > 45 && request.data.weight < 100 ? undefined : "Weight must be between 45kg and 100kg" },
        { label: "No Duplicate Fighter", status: "valid" },
        { label: "Health Status Valid", status: request.healthStatus || "valid" }
      ];
    }

    return [];
  };

  const validationChecks = getValidationChecks();
  const hasInvalidChecks = validationChecks.some(check => check.status === "invalid" || check.status === "missing");

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" 
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-auto" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0A3D91] to-[#0854C2] p-6 border-b-2 border-[#E0E0E0] sticky top-0 z-10">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="flex-1">
              <h2 className="text-2xl font-black text-white mb-2">{request.title}</h2>
              <div className="flex items-center gap-3 text-sm text-blue-100">
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {submitter?.fullName}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {new Date(request.submittedDate || request.createdDate).toLocaleDateString('en-GB')}
                </span>
              </div>
            </div>
            <div>
              {getStatusBadge(request.status)}
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-blue-200 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="flex items-center gap-2 mt-6">
            {getProgressSteps()}
          </div>
        </div>

        <div className="p-6">
          {/* Quick Actions - Only for pending/under_review/info_requested */}
          {(request.status === "pending" || request.status === "submitted" || request.status === "under_review" || request.status === "info_requested") && hasApprovePermission && (
            <div className="grid grid-cols-3 gap-3 mb-6 pb-6 border-b-2 border-[#E0E0E0]">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onApprove();
                }}
                disabled={hasInvalidChecks}
                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-6 py-4 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-6 h-6" />
                Approve
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRequestInfo();
                }}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-4 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                <Info className="w-6 h-6" />
                Request Info
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onReject();
                }}
                className="bg-[#C8102E] hover:bg-red-700 text-white px-6 py-4 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                <XCircle className="w-6 h-6" />
                Reject
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Main Details */}
            <div className="lg:col-span-2 space-y-6">
              <div>
                <h3 className="text-sm text-[#707070] font-bold mb-4 uppercase tracking-wide flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Request Details
                </h3>
                
                <div className="bg-[#F8F9FA] rounded-xl p-5 border-2 border-[#E0E0E0]">
                  {request.type === "fighter" && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-sm text-[#707070] font-medium block mb-1">Fighter Name</span>
                          <span className="text-lg text-[#1A1A24] font-bold block">{request.data.fighterName}</span>
                        </div>
                        <div>
                          <span className="text-sm text-[#707070] font-medium block mb-1">Weight</span>
                          <span className="text-lg text-[#1A1A24] font-bold block">{request.data.weight} kg</span>
                        </div>
                        <div>
                          <span className="text-sm text-[#707070] font-medium block mb-1">Type</span>
                          <span className={`text-sm font-bold inline-block px-3 py-2 rounded ${
                            request.data.type === 'Professional' ? 'bg-[#0A3D91] text-white' : 'bg-[#F2C94C] text-[#333333]'
                          }`}>{request.data.type}</span>
                        </div>
                        <div>
                          <span className="text-sm text-[#707070] font-medium block mb-1">Origin</span>
                          <span className={`text-sm font-bold inline-block px-3 py-2 rounded ${
                            request.data.origin === 'Local' ? 'bg-green-100 text-green-800' : 'bg-purple-100 text-purple-800'
                          }`}>{request.data.origin}</span>
                        </div>
                        <div className="col-span-2">
                          <span className="text-sm text-[#707070] font-medium block mb-1">Club/Gym</span>
                          <span className="text-lg text-[#1A1A24] font-bold block">{request.data.club}</span>
                        </div>
                      </div>
                      <div>
                        <span className="text-sm text-[#707070] font-medium block mb-2">Submitted Documents</span>
                        <div className="flex flex-wrap gap-2">
                          {request.data.documents.map((doc: string, idx: number) => (
                            <button
                              key={idx}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedDocument(doc);
                              }}
                              className="inline-flex items-center gap-1 text-sm bg-white border-2 border-green-500 hover:border-green-600 text-[#1A1A24] font-bold px-4 py-2 rounded-lg cursor-pointer hover:bg-green-50 transition-all shadow-sm hover:shadow-md"
                            >
                              <CheckSquare className="w-4 h-4 text-green-600" />
                              {doc}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {request.type === "match" && (
                    <div className="space-y-4">
                      <div>
                        <span className="text-sm text-[#707070] font-medium block mb-1">Event</span>
                        <span className="text-xl text-[#1A1A24] font-bold block">{request.data.eventName}</span>
                      </div>
                      
                      {request.data.matches && Array.isArray(request.data.matches) ? (
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-3 mb-2">
                            <div className="bg-[#F8F9FA] border border-[#E0E0E0] rounded-xl p-3">
                              <span className="text-xs text-[#707070] font-medium block mb-0.5">Batch Number</span>
                              <span className="text-sm font-bold text-[#0A3D91]">{request.data.batchNumber}</span>
                            </div>
                            <div className="bg-[#F8F9FA] border border-[#E0E0E0] rounded-xl p-3">
                              <span className="text-xs text-[#707070] font-medium block mb-0.5">Category</span>
                              <span className="text-sm font-bold text-[#0A3D91]">{request.data.category || "Professional"}</span>
                            </div>
                            <div className="bg-[#F8F9FA] border border-[#E0E0E0] rounded-xl p-3">
                              <span className="text-xs text-[#707070] font-medium block mb-0.5">Total Matches</span>
                              <span className="text-sm font-bold text-[#1A1A24]">{request.data.matchCount}</span>
                            </div>
                            <div className="bg-[#F8F9FA] border border-[#E0E0E0] rounded-xl p-3">
                              <span className="text-xs text-[#707070] font-medium block mb-0.5">Total Fighters</span>
                              <span className="text-sm font-bold text-[#1A1A24]">{request.data.totalFighters}</span>
                            </div>
                          </div>

                          <div className="pb-2 border-b border-[#E0E0E0]">
                            <h5 className="text-xs font-black uppercase tracking-wider text-[#0A3D91] flex items-center gap-1.5">
                              <Shield className="w-4 h-4" />
                              Match Details ({request.data.matchCount} Matches)
                            </h5>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[40vh] overflow-y-auto pr-1">
                            {request.data.matches.map((match: any, idx: number) => (
                              <div key={idx} className="bg-white border-2 border-[#E0E0E0] rounded-xl p-4 hover:border-[#0A3D91] transition-all">
                                <div className="flex items-center justify-between mb-3">
                                  <span className="text-xs font-black uppercase tracking-wider text-[#0A3D91]">Match #{match.matchNumber}</span>
                                  {match.isMainEvent && (
                                    <span className="text-[10px] font-bold inline-block px-2.5 py-0.5 rounded bg-amber-500 text-white shadow-sm">
                                      ⭐ MAIN EVENT
                                    </span>
                                  )}
                                </div>

                                {match.titleFight && (
                                  <div className="mb-2 bg-gradient-to-r from-amber-500/10 to-amber-500/20 border border-amber-300 rounded-lg p-2 flex items-center gap-1.5">
                                    <Crown className="w-3.5 h-3.5 text-amber-600" />
                                    <span className="text-[10px] font-black text-amber-800 uppercase tracking-wide">{match.titleFight}</span>
                                  </div>
                                )}

                                <div className="space-y-2 mb-3">
                                  {/* Red Corner */}
                                  <div className="bg-red-50/50 border-l-4 border-[#C8102E] rounded p-2 text-xs">
                                    <div className="flex justify-between font-bold text-gray-900 mb-0.5">
                                      <span>{match.fighterA.name}</span>
                                      <span className="bg-red-100 text-red-800 px-1 rounded text-[9px]">Grade {match.fighterA.grade}</span>
                                    </div>
                                    <div className="text-[10px] text-gray-500">
                                      {match.fighterA.weight} kg • {match.fighterA.record} • {match.fighterA.club}
                                    </div>
                                  </div>

                                  <div className="text-center text-[10px] font-bold text-gray-400">VS</div>

                                  {/* Blue Corner */}
                                  <div className="bg-blue-50/50 border-l-4 border-[#0A3D91] rounded p-2 text-xs">
                                    <div className="flex justify-between font-bold text-gray-900 mb-0.5">
                                      <span>{match.fighterB.name}</span>
                                      <span className="bg-blue-100 text-blue-800 px-1 rounded text-[9px]">Grade {match.fighterB.grade}</span>
                                    </div>
                                    <div className="text-[10px] text-gray-500">
                                      {match.fighterB.weight} kg • {match.fighterB.record} • {match.fighterB.club}
                                    </div>
                                  </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100 text-center text-[10px]">
                                  <div>
                                    <div className="text-gray-400 font-medium">Agreement</div>
                                    <div className="font-bold text-gray-800">{match.weightAgreement} kg</div>
                                  </div>
                                  <div>
                                    <div className="text-gray-400 font-medium">Rounds</div>
                                    <div className="font-bold text-gray-800">{match.rounds}</div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="p-4 bg-white rounded-xl border-2 border-[#0A3D91]">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <span className="text-lg font-bold text-[#0A3D91] block">{request.data.fighterA}</span>
                                <span className="text-sm text-[#707070] font-medium">Record: {request.data.fighterARecord}</span>
                              </div>
                              <span className="text-2xl font-black text-[#C8102E] px-6">VS</span>
                              <div className="flex-1 text-right">
                                <span className="text-lg font-bold text-[#0A3D91] block">{request.data.fighterB}</span>
                                <span className="text-sm text-[#707070] font-medium">Record: {request.data.fighterBRecord}</span>
                              </div>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <span className="text-sm text-[#707070] font-medium block mb-1">Agreed Weight</span>
                              <span className="text-lg text-[#1A1A24] font-bold block">{request.data.agreedWeight} kg</span>
                            </div>
                            <div>
                              <span className="text-sm text-[#707070] font-medium block mb-1">Rounds</span>
                              <span className="text-lg text-[#1A1A24] font-bold block">{request.data.rounds}</span>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  {request.type === "champion" && (
                    <div className="space-y-4">
                      <div>
                        <span className="text-sm text-[#707070] font-medium block mb-1">Title</span>
                        <span className="text-xl text-[#1A1A24] font-bold block">{request.data.titleName}</span>
                      </div>
                      <div className="p-4 bg-white rounded-xl border-2 border-[#0A3D91]">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <span className="text-sm text-[#707070] font-medium block mb-1">Champion</span>
                            <span className="text-lg font-bold text-[#0A3D91] block">{request.data.champion}</span>
                          </div>
                          <span className="text-2xl font-black text-[#F2C94C] px-6">VS</span>
                          <div className="flex-1 text-right">
                            <span className="text-sm text-[#707070] font-medium block mb-1">Challenger</span>
                            <span className="text-lg font-bold text-[#C8102E] block">{request.data.challenger}</span>
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-sm text-[#707070] font-medium block mb-1">Weight Class</span>
                          <span className="text-lg text-[#1A1A24] font-bold block">{request.data.weightLimit} kg</span>
                        </div>
                        <div>
                          <span className="text-sm text-[#707070] font-medium block mb-1">Rounds</span>
                          <span className="text-lg text-[#1A1A24] font-bold block">{request.data.rounds}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Feedback Section */}
              {request.status === "rejected" && request.comments && (
                <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl">
                  <h4 className="text-sm font-bold text-red-900 mb-2 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    Rejection Reason
                  </h4>
                  <p className="text-base text-red-800">{request.comments}</p>
                  {reviewer && (
                    <p className="text-sm text-red-700 mt-2">
                      Reviewed by {reviewer.fullName} on {request.reviewedDate && new Date(request.reviewedDate).toLocaleDateString('en-GB')}
                    </p>
                  )}
                </div>
              )}

              {request.status === "info_requested" && request.comments && (
                <div className="p-4 bg-purple-50 border-2 border-purple-200 rounded-xl">
                  <h4 className="text-sm font-bold text-purple-900 mb-2 flex items-center gap-2">
                    <Info className="w-4 h-4" />
                    Additional Information Requested
                  </h4>
                  <p className="text-base text-purple-800">{request.comments}</p>
                </div>
              )}
            </div>

            {/* Right Column: Validation & Audit Trail */}
            <div className="space-y-6">
              {/* Validation Checklist */}
              {validationChecks.length > 0 && (
                <div>
                  <h3 className="text-sm text-[#707070] font-bold mb-4 uppercase tracking-wide flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Validation Checklist
                  </h3>
                  <div className="bg-white rounded-xl border-2 border-[#E0E0E0] p-4 space-y-3">
                    {validationChecks.map((check, index) => (
                      <div key={index} className="flex items-start gap-3">
                        {check.status === "valid" && <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />}
                        {check.status === "invalid" && <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />}
                        {check.status === "missing" && <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />}
                        <div className="flex-1">
                          <p className={`text-sm font-bold ${
                            check.status === "valid" ? "text-green-900" :
                            check.status === "invalid" ? "text-red-900" :
                            "text-amber-900"
                          }`}>
                            {check.label}
                          </p>
                          {check.message && (
                            <p className="text-xs text-[#707070] mt-1">{check.message}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  {hasInvalidChecks && (
                    <div className="mt-3 p-3 bg-amber-50 border-2 border-amber-200 rounded-lg">
                      <p className="text-xs text-amber-900 font-bold flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" />
                        Action required before approval
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Audit Trail */}
              {(request.auditTrail && request.auditTrail.length > 0) && (
                <div>
                  <h3 className="text-sm text-[#707070] font-bold mb-4 uppercase tracking-wide flex items-center gap-2">
                    <Activity className="w-4 h-4" />
                    Audit Trail
                  </h3>
                  <div className="bg-white rounded-xl border-2 border-[#E0E0E0] p-4 space-y-3">
                    {request.auditTrail.map((entry, index) => (
                      <div key={index} className="pb-3 border-b-2 border-[#E0E0E0] last:border-0 last:pb-0">
                        <p className="text-sm font-bold text-[#1A1A24]">{entry.action}</p>
                        <p className="text-xs text-[#707070] mt-1">
                          By {MOCK_USERS.find(u => u.id === entry.by)?.fullName} on {new Date(entry.date).toLocaleDateString('en-GB')}
                        </p>
                        {entry.comment && (
                          <p className="text-xs text-[#707070] mt-2 italic">"{entry.comment}"</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Document Viewer */}
        {selectedDocument && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
              <div className="bg-gradient-to-r from-[#0A3D91] to-[#0854C2] p-6 border-b-2 border-[#E0E0E0] sticky top-0 z-10">
                <div className="flex items-center justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <h2 className="text-2xl font-black text-white mb-2">{selectedDocument}</h2>
                    <div className="flex items-center gap-3 text-sm text-blue-100">
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {submitter?.fullName}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(request.submittedDate || request.createdDate).toLocaleDateString('en-GB')}
                      </span>
                    </div>
                  </div>
                  <div>
                    {getStatusBadge(request.status)}
                  </div>
                  <button
                    onClick={() => setSelectedDocument(null)}
                    className="text-white hover:text-blue-200 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>
              <div className="p-6">
                <img src={documentImages[selectedDocument]} alt={selectedDocument} className="w-full h-auto" />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}