import { APPROVAL_STATUS_CONFIG, type FighterApprovalStatus, type FighterApprovalRecord } from "../data/fighterApproval";
import { Clock, CheckCircle, XCircle, RefreshCw, Ban, AlertTriangle } from "lucide-react";

interface FighterApprovalBadgeProps {
  status: FighterApprovalStatus;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function FighterApprovalBadge({ status, showIcon = true, size = 'md' }: FighterApprovalBadgeProps) {
  const config = APPROVAL_STATUS_CONFIG[status];
  
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
  };
  
  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };
  
  const StatusIcon = getApprovalIcon(status);
  
  return (
    <div className={`inline-flex items-center gap-1.5 ${config.bgColor} ${config.color} ${config.borderColor} border-2 rounded-lg font-bold uppercase tracking-wide ${sizeClasses[size]}`}>
      {showIcon && <StatusIcon className={iconSizes[size]} />}
      <span>{config.label}</span>
    </div>
  );
}

function getApprovalIcon(status: FighterApprovalStatus) {
  const icons: Record<FighterApprovalStatus, any> = {
    pending: Clock,
    approved: CheckCircle,
    rejected: XCircle,
    revision: RefreshCw,
    suspended: Ban,
  };
  return icons[status];
}

// Full approval card with history
export function FighterApprovalCard({ approval }: { approval: FighterApprovalRecord }) {
  const config = APPROVAL_STATUS_CONFIG[approval.status];
  const StatusIcon = getApprovalIcon(approval.status);
  
  return (
    <div className={`p-6 rounded-2xl border-2 ${config.bgColor} ${config.borderColor}`}>
      <div className="flex items-start gap-4 mb-4">
        <div className={`p-3 rounded-xl bg-white/80 ${config.color}`}>
          <StatusIcon className="w-8 h-8" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h3 className={`text-xl font-black ${config.color}`}>
              {approval.fighterName}
            </h3>
            <FighterApprovalBadge status={approval.status} size="md" />
          </div>
          <div className="flex items-center gap-4 text-sm text-[#707070]">
            <span>Club: <strong>{approval.clubName}</strong></span>
            <span>Submitted: {new Date(approval.submittedDate).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
      
      <div className="mb-4">
        <p className="text-sm text-[#707070] leading-relaxed">
          {config.description}
        </p>
      </div>
      
      {!config.canFight && (
        <div className="mb-4 p-3 bg-white/60 rounded-lg border border-red-200">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-red-700">Fighter Cannot Compete</p>
              <p className="text-xs text-[#707070] mt-1">
                This fighter is not approved and cannot be selected for matches.
              </p>
            </div>
          </div>
        </div>
      )}
      
      {approval.comments && (
        <div className="mb-4 p-3 bg-white/80 rounded-lg">
          <p className="text-xs font-bold text-[#1A1A24] mb-1">KKF Comments:</p>
          <p className="text-sm text-[#707070]">{approval.comments}</p>
        </div>
      )}
      
      {approval.rejectionReason && (
        <div className="mb-4 p-3 bg-red-50 rounded-lg border border-red-200">
          <p className="text-xs font-bold text-red-700 mb-1">Rejection Reason:</p>
          <p className="text-sm text-red-600">{approval.rejectionReason}</p>
        </div>
      )}
      
      {approval.revisionRequired && approval.revisionRequired.length > 0 && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-xs font-bold text-blue-700 mb-2">Required Actions:</p>
          <ul className="space-y-1">
            {approval.revisionRequired.map((item, idx) => (
              <li key={idx} className="text-sm text-blue-600 flex items-start gap-2">
                <span className="text-blue-400">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {approval.history && approval.history.length > 0 && (
        <div className="mt-4">
          <p className="text-xs font-bold text-[#1A1A24] mb-2 uppercase tracking-wide">Approval History</p>
          <div className="space-y-2">
            {approval.history.map((entry, idx) => (
              <div key={idx} className="p-3 bg-white/80 rounded-lg border border-[#E0E0E0]">
                <div className="flex items-center gap-2 mb-1">
                  <FighterApprovalBadge status={entry.status} size="sm" />
                  <span className="text-xs text-[#707070]">
                    {new Date(entry.date).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-xs text-[#707070]">
                  <strong>{entry.actor}</strong> ({entry.actorRole})
                  {entry.comments && `: ${entry.comments}`}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Club dashboard widget showing pending approvals
export function PendingApprovalsSummary({ approvals }: { approvals: FighterApprovalRecord[] }) {
  const pending = approvals.filter(a => a.status === 'pending').length;
  const approved = approvals.filter(a => a.status === 'approved').length;
  const rejected = approvals.filter(a => a.status === 'rejected').length;
  const revision = approvals.filter(a => a.status === 'revision').length;
  
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="p-4 bg-amber-50 border-2 border-amber-200 rounded-xl">
        <Clock className="w-6 h-6 text-amber-700 mb-2" />
        <div className="text-3xl font-black text-amber-700">{pending}</div>
        <div className="text-xs font-bold text-amber-600 uppercase">⏳ Pending</div>
      </div>
      
      <div className="p-4 bg-green-50 border-2 border-green-200 rounded-xl">
        <CheckCircle className="w-6 h-6 text-green-700 mb-2" />
        <div className="text-3xl font-black text-green-700">{approved}</div>
        <div className="text-xs font-bold text-green-600 uppercase">✅ Approved</div>
      </div>
      
      <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl">
        <XCircle className="w-6 h-6 text-red-700 mb-2" />
        <div className="text-3xl font-black text-red-700">{rejected}</div>
        <div className="text-xs font-bold text-red-600 uppercase">❌ Rejected</div>
      </div>
      
      <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
        <RefreshCw className="w-6 h-6 text-blue-700 mb-2" />
        <div className="text-3xl font-black text-blue-700">{revision}</div>
        <div className="text-xs font-bold text-blue-600 uppercase">🔄 Revision</div>
      </div>
    </div>
  );
}
