import { Home, CalendarDays, ShieldAlert, Dumbbell, Gavel, Award, LineChart, ChevronDown, Flag, Globe, Radio, DollarSign, UserCog, Shield, LogOut, User as UserIcon, ClipboardCheck, ShieldCheck, Settings, Box, Building2, Users, FileText, Package, ShoppingBag, Tag, Newspaper, Video, Search, Bell } from "lucide-react";
import { Outlet, NavLink, useLocation, useNavigate, Link } from "react-router";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { useState } from "react";
import { usePermissions } from "../hooks/usePermissions";
import { logoutUser } from "../data/users";
import logoImg from "../../assets/modern_logo.png";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

function EmojiIcon({ emoji, className }: { emoji: string; className?: string }) {
  return (
    <span 
      className={cn("inline-flex items-center justify-center grayscale brightness-200", className)} 
      style={{ fontSize: '1.25rem', lineHeight: '1' }}
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
      { icon: Flag, label: "Kun Khmer", path: "/home/fighters/kunkhmer", permission: "fighters.view" },
      { icon: Globe, label: "Foreigner", path: "/home/fighters/foreigner", permission: "fighters.view" }
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
      { emoji: "🏆", label: "Champions", path: "/home/champion", permission: "events.view" }
    ]
  },
  { icon: ClipboardCheck, label: "Match Proposals", path: "/home/match-proposals", permission: "matches.view_proposals" },
  { icon: Shield, label: "KKF Officers", path: "/home/kkf-officers", permission: "officials.assign" },
  {
    emoji: "📰",
    label: "Media",
    path: "/home/media",
    permission: null,
    submenu: [
      { icon: Newspaper, label: "News", path: "/home/media/news", permission: null },
      { icon: Video, label: "Video", path: "/home/media/video", permission: null }
    ]
  },
  {
    icon: ShoppingBag,
    label: "Store",
    path: "/home/product-management",
    permission: null,
    submenu: [
      { icon: Package, label: "Products", path: "/home/product-management", permission: "users.view" },
      { icon: Tag, label: "Categories", path: "/home/categories-setting", permission: "users.view" },
      { icon: Settings, label: "Settings", path: "/home/store-settings", permission: "users.view" }
    ]
  },
  { icon: Users, label: "Users", path: "/home/user-management", permission: "users.view" },
  { icon: FileText, label: "Process Flow", path: "/home/process-flow", permission: null },
  { icon: Settings, label: "System Settings", path: "/home/settings", permission: null },
];

export function Layout() {
  const location = useLocation();
  const [openSubmenu, setOpenSubmenu] = useState<string | null>("Program");
  const [showProfileMenu, setShowProfileMenu] = useState(false);

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
    <div className="flex h-screen bg-background text-foreground font-sans selection:bg-accent/30 overflow-hidden">
      
      {/* Desktop Sidebar - Solid Navy Blue */}
      <aside className="hidden md:flex w-[260px] flex-col bg-[#0A3D91] text-white border-r border-[#083073] relative z-40 shadow-xl shrink-0">
        <div className="h-16 flex items-center px-6 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center overflow-hidden p-0.5 shadow-sm shrink-0">
              <img src={logoImg} alt="Logo" className="w-full h-full object-contain" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-[#F2C94C] text-sm tracking-wide leading-none uppercase">DIGITAL KUNKHMER</span>
              <span className="text-[10px] text-white/60 uppercase tracking-widest mt-1">Management System</span>
            </div>
          </div>
        </div>
        
        <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto no-scrollbar">
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
                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium group",
                        isActive
                          ? "bg-white/10 text-white"
                          : "text-white/70 hover:bg-white/5 hover:text-white"
                      )}
                    >
                      {item.icon ? (
                        <item.icon className={cn("w-[18px] h-[18px]", isActive ? "text-white" : "text-white/70 group-hover:text-white")} />
                      ) : (
                        <EmojiIcon emoji={item.emoji!} className="w-[18px] h-[18px]" />
                      )}
                      <span className="flex-1 text-left">{item.label}</span>
                      <ChevronDown className={cn("w-4 h-4 transition-transform", isSubmenuOpen ? "rotate-180" : "")} />
                    </button>
                    
                    {isSubmenuOpen && (
                      <div className="mt-1 mb-2 space-y-1 relative before:absolute before:left-[21px] before:top-0 before:bottom-0 before:w-px before:bg-white/10">
                        {item.submenu
                          .filter(subItem => !subItem.permission || permissions.hasPermission(subItem.permission))
                          .map((subItem) => {
                          const isSubActive = location.pathname === subItem.path || location.pathname.startsWith(subItem.path + "/");
                          return (
                            <NavLink
                              key={subItem.path}
                              to={subItem.path}
                              className={cn(
                                "flex items-center gap-3 pl-10 pr-3 py-2 rounded-lg transition-colors text-sm",
                                isSubActive
                                  ? "bg-white/10 text-white font-medium"
                                  : "text-white/60 hover:text-white hover:bg-white/5"
                              )}
                            >
                              <span className="truncate">{subItem.label}</span>
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
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium group",
                      isActive
                        ? "bg-white/10 text-white"
                        : "text-white/70 hover:bg-white/5 hover:text-white"
                    )}
                  >
                    {item.icon ? (
                      <item.icon className={cn("w-[18px] h-[18px]", isActive ? "text-white" : "text-white/70 group-hover:text-white")} />
                    ) : (
                      <EmojiIcon emoji={item.emoji!} className="w-[18px] h-[18px]" />
                    )}
                    <span>{item.label}</span>
                  </NavLink>
                )}
              </div>
            );
          })}
        </nav>

        {/* User Profile Snippet in Sidebar */}
        <div className="p-4 bg-[#083073] border-t border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white font-bold border border-white/10">
              {permissions.currentUser?.fullName?.charAt(0) || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{permissions.currentUser?.fullName || "Guest"}</p>
              <p className="text-xs text-white/60 truncate capitalize">{permissions.currentUser?.role.replace('_', ' ') || ""}</p>
            </div>
            <button
              onClick={handleLogout}
              className="w-8 h-8 flex items-center justify-center rounded hover:bg-white/10 text-white/70 hover:text-white transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#F8FAFC]">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-border flex items-center justify-between px-6 shrink-0 shadow-sm z-30">
          <div className="flex items-center w-full max-w-md relative group">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3 group-focus-within:text-primary transition-colors" />
            <input 
              type="text" 
              placeholder="Search fighters, matches, events..." 
              className="w-full pl-9 pr-4 py-2 bg-muted/15 border border-border/60 hover:border-slate-300 focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/5 rounded-xl text-sm transition-all outline-none"
            />
          </div>
          
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-muted">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full ring-2 ring-white" />
            </button>
            <div className="h-8 w-px bg-border mx-2" />
            <div className="relative">
              <button 
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 cursor-pointer focus:outline-none hover:opacity-85 transition-opacity"
              >
                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                  {permissions.currentUser?.fullName?.charAt(0) || "U"}
                </div>
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              </button>
              
              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-border rounded-lg shadow-lg py-1 z-50 animate-fadeIn">
                  <Link 
                    to="/home/profile" 
                    onClick={() => setShowProfileMenu(false)}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                  >
                    <UserIcon className="w-4 h-4 text-muted-foreground" />
                    <span>View Profile</span>
                  </Link>
                  <Link 
                    to="/home/settings" 
                    onClick={() => setShowProfileMenu(false)}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                  >
                    <Settings className="w-4 h-4 text-muted-foreground" />
                    <span>Settings</span>
                  </Link>
                  <hr className="border-border my-1" />
                  <button 
                    onClick={() => {
                      setShowProfileMenu(false);
                      handleLogout();
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-destructive hover:bg-red-50 text-left transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-border flex items-center justify-around px-2 z-50">
        {navItems.slice(0, 5).map((item) => {
          const isActive = item.path === "/home" ? location.pathname === "/home" : location.pathname.startsWith(item.path);
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              {item.icon ? (
                <item.icon className="w-5 h-5" />
              ) : (
                <EmojiIcon emoji={item.emoji!} className="w-5 h-5 grayscale-0" />
              )}
              <span className="text-[10px] font-medium">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}