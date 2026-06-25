import { FIGHTER_STATUS_CONFIG, type FighterStatus, checkFighterEligibility } from "../data/fighterStatuses";
import { AlertCircle, CheckCircle, Clock, AlertTriangle, Ban, XCircle, UserX, ShieldCheck } from "lucide-react";

export const FEDERATION_STATUS_CONFIG: Record<string, { label: string; bgColor: string; color: string; borderColor: string }> = {
  draft: {
    label: "Draft",
    bgColor: "bg-slate-100",
    color: "text-slate-700",
    borderColor: "border-slate-300",
  },
  "pending kkf verification": {
    label: "Pending KKF",
    bgColor: "bg-amber-50",
    color: "text-amber-700",
    borderColor: "border-amber-200",
  },
  active: {
    label: "Active",
    bgColor: "bg-emerald-50",
    color: "text-emerald-700",
    borderColor: "border-emerald-200",
  },
  suspended: {
    label: "Suspended",
    bgColor: "bg-red-50",
    color: "text-red-700",
    borderColor: "border-red-200",
  },
  inactive: {
    label: "Inactive",
    bgColor: "bg-slate-50",
    color: "text-slate-500",
    borderColor: "border-slate-200",
  },
  retired: {
    label: "Retired",
    bgColor: "bg-gray-100",
    color: "text-gray-500",
    borderColor: "border-gray-300",
  },
  banned: {
    label: "Banned",
    bgColor: "bg-red-100",
    color: "text-red-700",
    borderColor: "border-red-300",
  },
};

interface FighterStatusBadgeProps {
  status: FighterStatus;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function FighterStatusBadge({ status, showIcon = true, size = 'md' }: FighterStatusBadgeProps) {
  const s = (status || '').toLowerCase();
  const fedConfig = FEDERATION_STATUS_CONFIG[s];
  
  if (fedConfig) {
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
    
    let StatusIcon = ShieldCheck;
    if (s === 'draft') StatusIcon = AlertCircle;
    if (s === 'pending kkf verification') StatusIcon = Clock;
    if (s === 'suspended' || s === 'banned') StatusIcon = Ban;
    if (s === 'inactive' || s === 'retired') StatusIcon = UserX;

    return (
      <div className={`inline-flex items-center gap-1.5 ${fedConfig.bgColor} ${fedConfig.color} ${fedConfig.borderColor} border-2 rounded-lg font-bold uppercase tracking-wide ${sizeClasses[size]}`}>
        {showIcon && <StatusIcon className={iconSizes[size]} />}
        <span>{fedConfig.label}</span>
      </div>
    );
  }

  const normalizeStatus = (s: string): FighterStatus => {
    const lower = (s || '').toLowerCase();
    if (lower === 'active') return 'available';
    if (lower === 'suspended') return 'suspended';
    if (lower === 'retired') return 'retired';
    if (lower === 'draft') return 'not_eligible';
    if (lower === 'pending kkf verification') return 'not_eligible';
    if (lower === 'inactive') return 'not_eligible';
    if (lower === 'banned') return 'suspended';
    if (lower === 'injured') return 'injured';
    return (lower as FighterStatus) in FIGHTER_STATUS_CONFIG ? (lower as FighterStatus) : 'available';
  };

  const normalized = normalizeStatus(status);
  const config = FIGHTER_STATUS_CONFIG[normalized] || FIGHTER_STATUS_CONFIG.available;
  
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
  
  const StatusIcon = getStatusIcon(normalized);
  
  return (
    <div className={`inline-flex items-center gap-1.5 ${config.bgColor} ${config.color} ${config.borderColor} border-2 rounded-lg font-bold uppercase tracking-wide ${sizeClasses[size]}`}>
      {showIcon && <StatusIcon className={iconSizes[size]} />}
      <span>{config.label}</span>
    </div>
  );
}

function getStatusIcon(status: FighterStatus) {
  const normalized = (status || '').toLowerCase() as FighterStatus;
  const icons: Record<FighterStatus, any> = {
    available: CheckCircle,
    scheduled: Clock,
    resting: AlertTriangle,
    injured: AlertCircle,
    suspended: Ban,
    not_eligible: XCircle,
    retired: UserX,
  };
  return icons[normalized] || CheckCircle;
}

// Full status card with description
export function FighterStatusCard({ status }: { status: FighterStatus }) {
  const normalizeStatus = (s: string): FighterStatus => {
    const lower = (s || '').toLowerCase();
    if (lower === 'active') return 'available';
    if (lower === 'suspended') return 'suspended';
    if (lower === 'retired') return 'retired';
    if (lower === 'draft') return 'not_eligible';
    if (lower === 'pending kkf verification') return 'not_eligible';
    if (lower === 'inactive') return 'not_eligible';
    if (lower === 'banned') return 'suspended';
    if (lower === 'injured') return 'injured';
    return (lower as FighterStatus) in FIGHTER_STATUS_CONFIG ? (lower as FighterStatus) : 'available';
  };

  const normalized = normalizeStatus(status);
  const config = FIGHTER_STATUS_CONFIG[normalized] || FIGHTER_STATUS_CONFIG.available;
  const StatusIcon = getStatusIcon(normalized);
  
  return (
    <div className={`p-4 rounded-xl border-2 ${config.bgColor} ${config.borderColor}`}>
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg bg-white/80 ${config.color}`}>
          <StatusIcon className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className={`font-black text-lg uppercase ${config.color}`}>
              {config.label}
            </h4>
            {!config.canAcceptMatch && (
              <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-bold">
                Cannot Fight
              </span>
            )}
          </div>
          <p className="text-sm text-[#707070] leading-relaxed">
            {config.description}
          </p>
          {config.requiresAction && (
            <div className="mt-2 p-2 bg-white/60 rounded-lg">
              <p className="text-xs font-bold text-[#1A1A24]">
                ⚠️ Action Required: {config.requiresAction}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Eligibility checker component
export function FighterEligibilityChecker({ fighter }: {
  fighter: {
    status: FighterStatus;
    medicalExpiryDate?: string;
    lastFightDate?: string;
    scheduledMatches?: number;
  }
}) {
  const blocks = checkFighterEligibility(fighter);
  const errors = blocks.filter(b => b.severity === 'error');
  const warnings = blocks.filter(b => b.severity === 'warning');
  
  if (blocks.length === 0) {
    return (
      <div className="p-4 bg-green-50 border-2 border-green-200 rounded-xl">
        <div className="flex items-center gap-3">
          <CheckCircle className="w-6 h-6 text-green-600" />
          <div>
            <h4 className="font-black text-green-700 uppercase">Fighter Eligible</h4>
            <p className="text-sm text-green-600">Ready to accept match proposals</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-3">
      {errors.length > 0 && (
        <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl">
          <div className="flex items-start gap-3">
            <XCircle className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-black text-red-700 uppercase mb-2">Cannot Accept Matches</h4>
              <div className="space-y-2">
                {errors.map((error, idx) => (
                  <div key={idx} className="p-3 bg-white/80 rounded-lg">
                    <p className="text-sm font-bold text-red-700 mb-1">
                      🚫 {error.reason}
                    </p>
                    <p className="text-xs text-[#707070]">
                      <span className="font-bold">Required:</span> {error.requiredAction}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {warnings.length > 0 && (
        <div className="p-4 bg-amber-50 border-2 border-amber-200 rounded-xl">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-black text-amber-700 uppercase mb-2">Warnings</h4>
              <div className="space-y-2">
                {warnings.map((warning, idx) => (
                  <div key={idx} className="p-3 bg-white/80 rounded-lg">
                    <p className="text-sm font-bold text-amber-700 mb-1">
                      ⚠️ {warning.reason}
                    </p>
                    <p className="text-xs text-[#707070]">
                      <span className="font-bold">Recommended:</span> {warning.requiredAction}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Fighter availability summary for club dashboard
export function FighterAvailabilitySummary({ stats }: {
  stats: {
    available: number;
    scheduled: number;
    resting: number;
    notEligible: number;
    total: number;
  }
}) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="p-4 bg-green-50 border-2 border-green-200 rounded-xl">
        <div className="text-3xl font-black text-green-700 mb-1">
          {stats.available}%
        </div>
        <div className="text-xs font-bold text-green-600 uppercase">
          🟢 Available
        </div>
      </div>
      
      <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
        <div className="text-3xl font-black text-blue-700 mb-1">
          {stats.scheduled}%
        </div>
        <div className="text-xs font-bold text-blue-600 uppercase">
          🔵 Scheduled
        </div>
      </div>
      
      <div className="p-4 bg-amber-50 border-2 border-amber-200 rounded-xl">
        <div className="text-3xl font-black text-amber-700 mb-1">
          {stats.resting}%
        </div>
        <div className="text-xs font-bold text-amber-600 uppercase">
          🟡 Resting
        </div>
      </div>
      
      <div className="p-4 bg-gray-50 border-2 border-gray-200 rounded-xl">
        <div className="text-3xl font-black text-gray-700 mb-1">
          {stats.notEligible}%
        </div>
        <div className="text-xs font-bold text-gray-600 uppercase">
          ⚫ Not Eligible
        </div>
      </div>
    </div>
  );
}
