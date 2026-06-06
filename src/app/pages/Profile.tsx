import { UserCircle, Shield, Settings, LogOut, Phone, Building } from "lucide-react";
import { usePermissions } from "../hooks/usePermissions";
import { ROLE_LABELS, logoutUser } from "../data/users";
import { useNavigate } from "react-router";

export function Profile() {
  const permissions = usePermissions();
  const currentUser = permissions.currentUser;
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutUser();
    navigate("/login");
  };

  const roleInfo = currentUser 
    ? ROLE_LABELS[currentUser.role] 
    : { label: "Guest", color: "bg-slate-100 text-slate-700 border-slate-200", description: "" };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8 animate-fadeIn">
      <header>
        <h1 className="text-2xl font-semibold text-foreground tracking-tight">Account Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your profile information, roles, and security sessions.</p>
      </header>

      {/* Profile Overview Card */}
      <div className="card-premium !p-6 md:!p-8">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="relative">
            {currentUser?.avatar ? (
              <img 
                src={currentUser.avatar} 
                alt={currentUser.fullName} 
                className="w-24 h-24 md:w-28 md:h-28 rounded-full object-cover border-4 border-[#F8FAFC] shadow-md"
              />
            ) : (
              <div className="w-24 h-24 md:w-28 md:h-28 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-3xl border-4 border-[#F8FAFC] shadow-md">
                {currentUser?.fullName?.charAt(0) || "U"}
              </div>
            )}
            <button className="absolute bottom-0 right-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white border-2 border-white hover:bg-primary/90 transition-colors shadow-md">
              <Settings className="w-4 h-4" />
            </button>
          </div>
          
          <div className="flex-1 text-center sm:text-left">
            <h2 className="text-xl font-bold text-foreground mb-1">{currentUser?.fullName || "Guest User"}</h2>
            <p className="text-sm text-muted-foreground mb-3">{currentUser?.email || "No email provided"}</p>
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <span className={`badge-premium ${roleInfo.color}`}>
                <Shield className="w-3 h-3 shrink-0" />
                <span>{roleInfo.label}</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Contact and Organization Details */}
        <div className="card-premium !p-0 overflow-hidden">
          <div className="p-4 border-b border-border bg-muted/30">
            <h3 className="text-sm font-semibold text-foreground">Organization & Info</h3>
          </div>
          <div className="p-4 space-y-4">
            <div className="flex items-center gap-3 text-sm">
              <Building className="w-5 h-5 text-muted-foreground shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Affiliated Organization</p>
                <p className="font-semibold text-foreground">{currentUser?.organization || "Kun Khmer Federation (KKF)"}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 text-sm">
              <Phone className="w-5 h-5 text-muted-foreground shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Phone Number</p>
                <p className="font-semibold text-foreground">{currentUser?.phone || "+855 12 345 678"}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-sm">
              <UserCircle className="w-5 h-5 text-muted-foreground shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Username</p>
                <p className="font-semibold text-foreground">@{currentUser?.username || "username"}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Security & Access */}
        <div className="card-premium !p-0 overflow-hidden">
          <div className="p-4 border-b border-border bg-muted/30">
            <h3 className="text-sm font-semibold text-foreground">Security & Access</h3>
          </div>
          <div className="p-5 space-y-5">
            <div>
              <p className="text-sm font-semibold text-foreground mb-1">Role Permissions</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {roleInfo.description || "Grants dynamic permissions based on your registered combat organization role."}
              </p>
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground mb-2">Active Session</p>
              <div className="flex items-center justify-between text-xs p-3 bg-muted/40 rounded-lg border border-border">
                <span className="text-muted-foreground">MacBook Pro - Chrome</span>
                <span className="text-emerald-600 font-semibold">Active Now</span>
              </div>
            </div>
            
            <button 
              onClick={handleLogout}
              className="btn-secondary w-full mt-2"
            >
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}