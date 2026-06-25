import { Clock, User, MessageSquare, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

interface WorkflowHistoryEntry {
  status: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: string;
  comments?: string | null;
}

interface WorkflowHistoryProps {
  history: WorkflowHistoryEntry[];
  title?: string;
  defaultExpanded?: boolean;
}

export function WorkflowHistory({ history, title = "Workflow History", defaultExpanded = false }: WorkflowHistoryProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const getStatusColor = (status: string) => {
    const statusColors: Record<string, string> = {
      "Draft": "bg-gray-100 text-gray-700 border-gray-200",
      "Pending KKF Approval": "bg-amber-100 text-amber-700 border-amber-200",
      "KKF Approved": "bg-green-100 text-green-700 border-green-200",
      "Rejected": "bg-red-100 text-red-700 border-red-200",
      "Proposed": "bg-purple-100 text-purple-700 border-purple-200",
      "Pending Club Confirmation": "bg-amber-100 text-amber-700 border-amber-200",
      "Club Confirmed": "bg-green-100 text-green-700 border-green-200",
      "Assigned to Event": "bg-blue-100 text-blue-700 border-blue-200",
      "Weigh-In Complete": "bg-green-100 text-green-700 border-green-200",
      "Ready to Fight": "bg-yellow-100 text-yellow-700 border-yellow-200",
      "In Progress": "bg-blue-100 text-blue-700 border-blue-200",
      "Results Recorded": "bg-purple-100 text-purple-700 border-purple-200",
      "Completed": "bg-green-100 text-green-700 border-green-200",
      "Closed": "bg-gray-100 text-gray-700 border-gray-200"
    };

    return statusColors[status] || "bg-gray-100 text-gray-700 border-gray-200";
  };

  if (!history || history.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full bg-gradient-to-r from-gray-50 to-gray-100 p-6 border-b-2 border-gray-200 flex items-center justify-between hover:from-gray-100 hover:to-gray-150 transition-all"
      >
        <div className="flex items-center gap-3">
          <Clock className="w-6 h-6 text-gray-700" />
          <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">
            {title}
          </h3>
          <span className="bg-gray-200 text-gray-700 text-xs font-bold px-3 py-1 rounded-full">
            {history.length} {history.length === 1 ? 'Entry' : 'Entries'}
          </span>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-gray-700" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-700" />
        )}
      </button>

      {/* Timeline */}
      {isExpanded && (
        <div className="p-6">
          <div className="relative space-y-6">
            {/* Vertical Timeline Line */}
            <div className="absolute left-[19px] top-3 bottom-3 w-0.5 bg-gradient-to-b from-gray-300 via-gray-200 to-transparent" />

            {history.map((entry, index) => (
              <div key={index} className="relative pl-12 pb-6 last:pb-0">
                {/* Timeline Dot */}
                <div className={`absolute left-0 top-1 w-10 h-10 rounded-full border-4 border-white shadow-md flex items-center justify-center ${
                  index === 0 
                    ? 'bg-gradient-to-br from-[#0A3D91] to-blue-700 ring-4 ring-blue-100' 
                    : 'bg-gradient-to-br from-gray-400 to-gray-500'
                }`}>
                  <div className="w-2 h-2 bg-white rounded-full" />
                </div>

                {/* Content Card */}
                <div className="bg-gradient-to-r from-gray-50 to-white rounded-xl border-2 border-gray-200 p-4 hover:shadow-md transition-all">
                  {/* Timestamp and Status */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 text-sm text-gray-500 font-medium mb-2">
                        <Clock className="w-4 h-4" />
                        {formatTimestamp(entry.timestamp)}
                      </div>
                      <span className={`inline-block text-xs font-black uppercase px-3 py-1.5 rounded-lg border-2 ${getStatusColor(entry.status)}`}>
                        {entry.status}
                      </span>
                    </div>
                  </div>

                  {/* Action */}
                  <div className="flex items-start gap-2 mb-2">
                    <div className="flex-1">
                      <p className="text-base font-bold text-gray-900">{entry.action}</p>
                    </div>
                  </div>

                  {/* User */}
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                    <User className="w-4 h-4" />
                    <span className="font-medium">{entry.userName}</span>
                  </div>

                  {/* Comments */}
                  {entry.comments && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="flex items-start gap-2 text-sm text-gray-700">
                        <MessageSquare className="w-4 h-4 mt-0.5 text-gray-500" />
                        <p className="flex-1 italic">{entry.comments}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Footer Info */}
          <div className="mt-6 pt-4 border-t-2 border-gray-200 text-center">
            <p className="text-xs text-gray-500 font-medium">
              All timestamps are in Indochina Time (ICT)
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
