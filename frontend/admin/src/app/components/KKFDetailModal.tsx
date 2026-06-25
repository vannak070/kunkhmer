import { X, CheckCircle, XCircle, Users, Calendar, CheckSquare } from "lucide-react";
import { MOCK_USERS } from "../data/users";

interface WorkflowRequest {
  id: string;
  type: "event" | "match" | "fighter" | "club" | "champion";
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

interface KKFDetailModalProps {
  request: WorkflowRequest;
  onClose: () => void;
  onApprove: () => void;
  onReject: () => void;
  getStatusBadge: (status: "pending" | "approved" | "rejected") => JSX.Element;
  hasApprovePermission: boolean;
}

export function KKFDetailModal({
  request,
  onClose,
  onApprove,
  onReject,
  getStatusBadge,
  hasApprovePermission
}: KKFDetailModalProps) {
  const submitter = MOCK_USERS.find(u => u.id === request.createdBy);

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" 
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-auto" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-gradient-to-r from-[#0A3D91] to-[#0854C2] p-6 border-b-2 border-[#E0E0E0] flex items-center justify-between">
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
            className="ml-4 text-white hover:text-blue-200 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {request.status === "pending" && hasApprovePermission && (
            <div className="flex gap-4 mb-6 pb-6 border-b-2 border-[#E0E0E0]">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onApprove();
                }}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white px-6 py-4 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-6 h-6" />
                Approve
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onReject();
                }}
                className="flex-1 bg-[#C8102E] hover:bg-red-700 text-white px-6 py-4 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                <XCircle className="w-6 h-6" />
                Reject
              </button>
            </div>
          )}

          <p className="text-sm text-[#707070] font-bold mb-4 uppercase tracking-wide">Request Details</p>
          
          <div className="bg-[#F8F9FA] rounded-xl p-4 border-2 border-[#E0E0E0]">
            {request.type === "fighter" && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
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
                  <div>
                    <span className="text-sm text-[#707070] font-medium block mb-1">Club/Gym</span>
                    <span className="text-lg text-[#1A1A24] font-bold block">{request.data.club}</span>
                  </div>
                </div>
                <div>
                  <span className="text-sm text-[#707070] font-medium block mb-2">Submitted Documents</span>
                  <div className="flex flex-wrap gap-2">
                    {request.data.documents.map((doc: string, idx: number) => (
                      <span key={idx} className="inline-flex items-center gap-1 text-sm bg-white border-2 border-[#E0E0E0] text-[#1A1A24] font-bold px-4 py-2 rounded-lg">
                        <CheckSquare className="w-4 h-4 text-green-600" />
                        {doc}
                      </span>
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

          {request.status === "rejected" && request.comments && (
            <div className="mt-4 p-4 bg-red-50 border-2 border-red-200 rounded-xl">
              <p className="text-sm font-bold text-red-900 mb-1">Rejection Reason:</p>
              <p className="text-base text-red-800">{request.comments}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
