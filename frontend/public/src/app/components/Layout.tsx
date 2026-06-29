import { Outlet, NavLink, useLocation } from "react-router";
import { Home, CalendarDays, ShieldAlert, Dumbbell, Gavel, Award, LineChart, ChevronDown, Flag, Globe, Radio, DollarSign, UserCog, Shield, LogOut, User as UserIcon, ClipboardCheck, ShieldCheck, Settings, Box, Building2, Users } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { useState } from "react";
import { usePermissions } from "../hooks/usePermissions";
import { logoutUser } from "../data/users";
import { useNavigate } from "react-router";
import logoImg from "figma:asset/a66d0715b1669c88badc1b57f275bd3b2182d59e.png";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Custom emoji icon component
function EmojiIcon({ emoji, className }: { emoji: string; className?: string }) {
  return (
    <span 
      className={cn("inline-flex items-center justify-center", className)} 
      style={{ fontSize: '1.375rem', lineHeight: '1' }}
    >
      {emoji}
    </span>
  );
}

const navItems = [
  { icon: Home, label: "Dashboard", path: "/home", permission: null },
  { 
    emoji: "🏛️",
    label: "Clubs", 
    path: "/home/clubs",
    permission: "fighters.view"
  },
  { 
    emoji: "🧑‍🤝‍🧑",
    label: "Fighters", 
    path: "/home/fighters",
    permission: "fighters.view",
    submenu: [
      { icon: Flag, label: "Kun Khmer Fighters", path: "/home/fighters/kunkhmer", permission: "fighters.view" },
      { icon: Globe, label: "Foreigner Fighters", path: "/home/fighters/foreigner", permission: "fighters.view" }
    ]
  },
  { 
    emoji: "🗓️",
    label: "Program", 
    path: "/home/program",
    permission: "events.view",
    submenu: [
      { emoji: "🎟️", label: "Events", path: "/home/events", permission: "events.view" },
      { emoji: "🥊", label: "Matches", path: "/home/matches", permission: "matches.view" },
      { emoji: "🏆", label: "Champion", path: "/home/champion", permission: "events.view" }
    ]
  },
  { icon: ClipboardCheck, label: "Match Proposals", path: "/home/match-proposals", permission: "matches.view_proposals" },
  { icon: ShieldCheck, label: "KKF Workflow", path: "/home/kkf-workflow", permission: "federation.view" },
  { icon: Users, label: "User Management", path: "/home/user-management", permission: "users.view" },
  { icon: Settings, label: "System Settings", path: "/home/settings", permission: null },
];

export function Layout() {
  const location = useLocation();
  const [openSubmenu, setOpenSubmenu] = useState<string | null>("Program");

  const toggleSubmenu = (label: string) => {
    setOpenSubmenu(openSubmenu === label ? null : label);
  };

  const permissions = usePermissions();
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutUser();
    navigate("/login");
  };

  return (
    <div className="flex h-screen bg-[#F4F5F8] text-[#1A1A24] font-sans selection:bg-[#F2C94C]/30 relative overflow-hidden">
      {/* Top brand line */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#0A3D91] via-[#C8102E] to-[#F2C94C] z-50" />
      
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-72 flex-col bg-gradient-to-b from-[#0A3D91] to-[#051C42] relative z-40 shadow-2xl">
        {/* Subtle texture overlay */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none mix-blend-overlay" />
        
        <div className="h-24 flex items-center px-8 border-b border-[#FFFFFF]/10 relative z-10">
          <div className="flex items-center gap-4">
            <div className="relative flex items-center justify-center p-1.5 bg-[#FFFFFF] rounded-xl shadow-[0_0_15px_rgba(255,255,255,0.2)]">
              <img src={logoImg} alt="KUN KHMER Mascot" className="w-10 h-10 object-contain" />
            </div>
            <div className="flex flex-col">
              <span className="font-black text-2xl tracking-tighter uppercase leading-none text-[#FFFFFF] drop-shadow-md">KUN KHMER</span>
              <span className="text-[10px] text-[#F2C94C] font-bold tracking-[0.2em] uppercase mt-1">Digital Platform</span>
            </div>
          </div>
        </div>
        
        <nav className="flex-1 px-4 py-8 space-y-1.5 overflow-y-auto relative z-10 no-scrollbar">
          <div className="text-[10px] font-bold text-[#FFFFFF]/40 uppercase tracking-[0.15em] mb-4 px-4">Menu</div>
          {navItems
            .filter(item => !item.permission || permissions.hasPermission(item.permission))
            .map((item) => {
            const isActive = item.path === "/home" ? location.pathname === "/home" : location.pathname.startsWith(item.path);
            const hasSubmenu = item.submenu && item.submenu.length > 0;
            const isSubmenuOpen = openSubmenu === item.label;
            
            return (
              <div key={item.path}>
                {hasSubmenu ? (
                  <>
                    <button
                      onClick={() => toggleSubmenu(item.label)}
                      className={cn(
                        "w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 text-sm font-bold relative overflow-hidden group outline-none focus-visible:ring-2 focus-visible:ring-[#F2C94C]",
                        isActive
                          ? "text-[#FFFFFF] bg-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] backdrop-blur-md border border-white/10"
                          : "text-[#B0C4DE] hover:text-[#FFFFFF] hover:bg-white/5 border border-transparent"
                      )}
                    >
                      {isActive && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-1/2 rounded-r-full bg-gradient-to-b from-[#F2C94C] to-[#C8102E] shadow-[0_0_12px_rgba(242,201,76,0.8)]" />
                      )}
                      {item.icon ? (
                        <item.icon className={cn(
                          "w-[22px] h-[22px] transition-all duration-300", 
                          isActive ? "text-[#F2C94C] scale-110 drop-shadow-[0_0_8px_rgba(242,201,76,0.5)]" : "text-[#B0C4DE] group-hover:scale-110 group-hover:text-white"
                        )} />
                      ) : (
                        <EmojiIcon emoji={item.emoji!} className={cn(
                          "w-[22px] h-[22px] transition-all duration-300", 
                          isActive ? "text-[#F2C94C] scale-110 drop-shadow-[0_0_8px_rgba(242,201,76,0.5)]" : "text-[#B0C4DE] group-hover:scale-110 group-hover:text-white"
                        )} />
                      )}
                      <span className="tracking-wide flex-1 text-left">{item.label}</span>
                      <ChevronDown className={cn(
                        "w-4 h-4 transition-transform duration-300",
                        isSubmenuOpen ? "rotate-180" : ""
                      )} />
                    </button>
                    
                    {isSubmenuOpen && (
                      <div className="ml-4 mt-1 space-y-1 border-l-2 border-white/10 pl-2">
                        {item.submenu
                          .filter(subItem => !subItem.permission || permissions.hasPermission(subItem.permission))
                          .map((subItem) => {
                          const isSubActive = location.pathname === subItem.path || location.pathname.startsWith(subItem.path + "/");
                          
                          return (
                            <NavLink
                              key={subItem.path}
                              to={subItem.path}
                              className={cn(
                                "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 text-sm font-semibold",
                                isSubActive
                                  ? "text-[#F2C94C] bg-white/5"
                                  : "text-[#B0C4DE] hover:text-[#FFFFFF] hover:bg-white/5"
                              )}
                            >
                              {subItem.icon ? (
                                <subItem.icon className="w-4 h-4" />
                              ) : (
                                <EmojiIcon emoji={subItem.emoji!} className="w-4 h-4" />
                              )}
                              <span className="tracking-wide">{subItem.label}</span>
                            </NavLink>
                          );
                        })}
                      </div>
                    )}
                  </>
                ) : (
                  <NavLink
                    to={item.path}
                    className={cn(
                      "flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 text-sm font-bold relative overflow-hidden group outline-none focus-visible:ring-2 focus-visible:ring-[#F2C94C]",
                      isActive
                        ? "text-[#FFFFFF] bg-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] backdrop-blur-md border border-white/10"
                        : "text-[#B0C4DE] hover:text-[#FFFFFF] hover:bg-white/5 border border-transparent"
                    )}
                  >
                    {isActive && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-1/2 rounded-r-full bg-gradient-to-b from-[#F2C94C] to-[#C8102E] shadow-[0_0_12px_rgba(242,201,76,0.8)]" />
                    )}
                    {item.icon ? (
                      <item.icon className={cn(
                        "w-[22px] h-[22px] transition-all duration-300", 
                        isActive ? "text-[#F2C94C] scale-110 drop-shadow-[0_0_8px_rgba(242,201,76,0.5)]" : "text-[#B0C4DE] group-hover:scale-110 group-hover:text-white"
                      )} />
                    ) : (
                      <EmojiIcon emoji={item.emoji!} className={cn(
                        "w-[22px] h-[22px] transition-all duration-300", 
                        isActive ? "text-[#F2C94C] scale-110 drop-shadow-[0_0_8px_rgba(242,201,76,0.5)]" : "text-[#B0C4DE] group-hover:scale-110 group-hover:text-white"
                      )} />
                    )}
                    <span className="tracking-wide">{item.label}</span>
                  </NavLink>
                )}
              </div>
            );
          })}
        </nav>

        {/* User Profile Snippet */}
        <div className="p-6 relative z-10 border-t border-[#FFFFFF]/10 bg-black/10">
          <div className="flex items-center gap-3">
            {permissions.currentUser?.avatar ? (
              <img 
                src={permissions.currentUser.avatar} 
                alt={permissions.currentUser.fullName}
                className="w-10 h-10 rounded-full border-2 border-white/20 object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#C8102E] to-[#0A3D91] flex items-center justify-center text-white font-bold border-2 border-white/20">
                {permissions.currentUser?.fullName.charAt(0) || "U"}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate">{permissions.currentUser?.fullName || "Guest"}</p>
              <p className="text-xs text-[#B0C4DE] truncate">{permissions.currentUser?.email || ""}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="absolute top-2 right-2 w-5 h-5 text-[#F2C94C] hover:text-[#C8102E] transition-colors duration-300"
          >
            <LogOut />
          </button>
        </div>
      </aside>

      {/* Mobile Top Header */}
      <header className="md:hidden h-16 bg-gradient-to-r from-[#0A3D91] to-[#051C42] border-b border-[#FFFFFF]/10 flex items-center px-4 shrink-0 z-40 relative shadow-lg">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center p-1 bg-[#FFFFFF] rounded-lg shadow-sm">
            <img src={logoImg} alt="KUN KHMER Mascot" className="w-8 h-8 object-contain" />
          </div>
          <div className="flex flex-col">
            <span className="font-black text-lg tracking-tighter uppercase leading-none text-[#FFFFFF]">KUN KHMER</span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto relative bg-[#F4F5F8]">
        <div className="flex-1 pb-24 md:pb-8">
          <Outlet />
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-[72px] bg-white/90 backdrop-blur-xl border-t border-[#E0E0E0] flex items-center justify-around px-2 z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] pb-safe">
        {navItems
          .filter(item => !item.permission || permissions.hasPermission(item.permission))
          .slice(0, 5)
          .map((item) => {
          const isActive = item.path === "/home" ? location.pathname === "/home" : location.pathname.startsWith(item.path);
          
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                "relative flex flex-col items-center justify-center w-full h-full space-y-1 transition-all duration-300 rounded-xl mx-1",
                isActive 
                  ? "text-[#0A3D91]" 
                  : "text-[#B0B0B0] hover:text-[#707070]"
              )}
            >
              {isActive && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-1 rounded-b-full bg-gradient-to-r from-[#C8102E] to-[#F2C94C]" />
              )}
              <div className={cn(
                "p-1.5 rounded-xl transition-all duration-300",
                isActive ? "bg-[#0A3D91]/10 scale-110" : ""
              )}>
                {item.icon ? (
                  <item.icon className={cn(
                    "w-[22px] h-[22px]", 
                    isActive ? "text-[#0A3D91]" : ""
                  )} />
                ) : (
                  <EmojiIcon emoji={item.emoji!} className={cn(
                    "w-[22px] h-[22px]", 
                    isActive ? "text-[#0A3D91]" : ""
                  )} />
                )}
              </div>
              <span className={cn("text-[9px] font-bold tracking-wide", isActive ? "text-[#0A3D91]" : "")}>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}