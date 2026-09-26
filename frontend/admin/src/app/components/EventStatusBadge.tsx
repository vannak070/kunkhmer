import { EVENT_STATUS_CONFIG, type EventStatus } from "../data/eventStatuses";

interface EventStatusBadgeProps {
  status: EventStatus;
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
  showDescription?: boolean;
  className?: string;
}

export function EventStatusBadge({ 
  status, 
  size = "md", 
  showIcon = true,
  showDescription = false,
  className = ""
}: EventStatusBadgeProps) {
  const config = EVENT_STATUS_CONFIG[status];
  
  // Statuses the API stores but this list doesn't describe (e.g. "Published") show as plain text.
  if (!config) {
    return status ? (
      <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-bold border-2 bg-slate-50 text-slate-700 border-slate-200">{status}</span>
    ) : (
      <span className="text-[#707070] text-sm">Not set</span>
    );
  }

  const sizeClasses = {
    sm: "px-2 py-1 text-xs",
    md: "px-3 py-1.5 text-sm",
    lg: "px-4 py-2 text-base"
  };

  return (
    <div className={`inline-flex flex-col gap-1 ${className}`}>
      <div 
        className={`inline-flex items-center gap-2 rounded-lg font-bold border-2 ${config.bgColor} ${config.color} ${config.borderColor} ${sizeClasses[size]}`}
      >
        {showIcon && <span className="text-base">{config.icon}</span>}
        <span>{config.label}</span>
      </div>
      {showDescription && (
        <p className="text-xs text-[#707070] max-w-xs">
          {config.description}
        </p>
      )}
    </div>
  );
}

// Compact version for tables
export function EventStatusCompact({ status }: { status: EventStatus }) {
  const config = EVENT_STATUS_CONFIG[status];
  if (!config) return <span>-</span>;
  
  return (
    <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-semibold border ${config.bgColor} ${config.color} ${config.borderColor}`}>
      <span>{config.icon}</span>
      <span>{config.label}</span>
    </div>
  );
}

// Full card version with actions
export function EventStatusCard({ status }: { status: EventStatus }) {
  const config = EVENT_STATUS_CONFIG[status];
  if (!config) return null;

  return (
    <div className={`p-6 rounded-2xl border-2 ${config.bgColor} ${config.borderColor}`}>
      <div className="flex items-start gap-4">
        <div className="text-4xl">{config.icon}</div>
        <div className="flex-1">
          <h3 className={`text-xl font-black mb-2 ${config.color}`}>
            {config.label}
          </h3>
          <p className="text-sm text-[#1A1A24] mb-4">
            {config.description}
          </p>
          
          {config.conditions.length > 0 && (
            <div className="mb-4">
              <h4 className="text-xs font-bold text-[#707070] uppercase mb-2">Conditions:</h4>
              <ul className="space-y-1">
                {config.conditions.map((condition, idx) => (
                  <li key={idx} className="text-xs text-[#1A1A24] flex items-start gap-2">
                    <span className="text-[#0A3D91] font-bold">•</span>
                    {condition}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {config.organizerActions.length > 0 && (
            <div className="mb-4">
              <h4 className="text-xs font-bold text-[#707070] uppercase mb-2">Organizer Can:</h4>
              <ul className="space-y-1">
                {config.organizerActions.map((action, idx) => (
                  <li key={idx} className="text-xs text-[#1A1A24] flex items-start gap-2">
                    <span className="font-bold">→</span>
                    {action}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {config.kkfActions.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-[#707070] uppercase mb-2">KKF Can:</h4>
              <ul className="space-y-1">
                {config.kkfActions.map((action, idx) => (
                  <li key={idx} className="text-xs text-[#1A1A24] flex items-start gap-2">
                    <span className="font-bold">→</span>
                    {action}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Quick info badges */}
      <div className="flex gap-2 mt-4 pt-4 border-t border-current/20">
        <div className="flex items-center gap-1.5 text-xs font-semibold">
          <span>{config.organizerCanEdit ? "✅" : "🔒"}</span>
          <span>{config.organizerCanEdit ? "Can Edit" : "Locked"}</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-semibold">
          <span>{config.canCreateMatches ? "✅" : "❌"}</span>
          <span>{config.canCreateMatches ? "Can Create Matches" : "Cannot Create Matches"}</span>
        </div>
      </div>
    </div>
  );
}
