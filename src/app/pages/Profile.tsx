import { UserCircle, Shield, Settings, Bell, LogOut } from "lucide-react";

export function Profile() {
  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8">
      <header>
        <h1 className="text-3xl font-extrabold tracking-tight uppercase text-[#0A3D91]">Account Settings</h1>
        <p className="text-[#707070] mt-1">Manage your profile, roles, and preferences.</p>
      </header>

      <div className="bg-[#FFFFFF] border border-[#E0E0E0] rounded-2xl p-6 md:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="relative">
            <img 
              src="https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=150&h=150" 
              alt="Admin" 
              className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover border-4 border-[#F5F5F7] shadow-md"
            />
            <button className="absolute bottom-0 right-0 w-8 h-8 bg-[#C8102E] rounded-full flex items-center justify-center text-white border-2 border-[#FFFFFF] hover:bg-[#A00D24] transition-colors shadow-sm">
              <Settings className="w-4 h-4" />
            </button>
          </div>
          
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-2xl font-bold text-[#333333] mb-1">Sokha M.</h2>
            <p className="text-[#707070] mb-3">sokha@kunkhmer.org</p>
            <div className="flex items-center justify-center md:justify-start gap-2">
              <span className="flex items-center gap-1.5 px-3 py-1 bg-red-100 text-[#C8102E] text-xs font-bold uppercase tracking-widest rounded-md border border-red-200">
                <Shield className="w-3 h-3" /> Administrator
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#FFFFFF] border border-[#E0E0E0] rounded-xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-[#E0E0E0] bg-[#F5F5F7]">
            <h3 className="font-bold uppercase tracking-wide text-[#707070]">Preferences</h3>
          </div>
          <div className="p-2">
            {[
              { icon: Bell, label: "Notifications", desc: "Match alerts, medical updates" },
              { icon: UserCircle, label: "Personal Info", desc: "Update name, contact details" },
              { icon: Settings, label: "System Settings", desc: "Scoring method, weights" },
            ].map((item, i) => (
              <button key={i} className="w-full flex items-center gap-4 p-4 hover:bg-[#F5F5F7] rounded-lg transition-colors text-left group">
                <div className="w-10 h-10 rounded-lg bg-[#E0E0E0] flex items-center justify-center group-hover:bg-[#0A3D91] transition-colors">
                  <item.icon className="w-5 h-5 text-[#707070] group-hover:text-white" />
                </div>
                <div>
                  <p className="font-bold text-sm text-[#333333] group-hover:text-[#0A3D91]">{item.label}</p>
                  <p className="text-xs text-[#B0B0B0]">{item.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-[#FFFFFF] border border-[#E0E0E0] rounded-xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-[#E0E0E0] bg-[#F5F5F7]">
            <h3 className="font-bold uppercase tracking-wide text-[#707070]">Security & Access</h3>
          </div>
          <div className="p-6 space-y-6">
            <div>
              <p className="text-sm font-bold text-[#333333] mb-1">Current Role</p>
              <p className="text-xs text-[#707070] leading-relaxed">
                You have <span className="text-[#C8102E] font-bold">Admin</span> privileges. This grants full access to create events, manage fighters, and overwrite match decisions.
              </p>
            </div>
            <div>
              <p className="text-sm font-bold text-[#333333] mb-2">Active Sessions</p>
              <div className="flex items-center justify-between text-xs p-3 bg-[#F5F5F7] rounded-lg border border-[#E0E0E0]">
                <span className="text-[#707070]">MacBook Pro - Chrome</span>
                <span className="text-emerald-600 font-medium">Current</span>
              </div>
            </div>
            
            <button className="w-full flex items-center justify-center gap-2 py-3 mt-4 text-[#C8102E] font-bold bg-[#C8102E]/10 hover:bg-[#C8102E]/20 rounded-lg transition-colors">
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}