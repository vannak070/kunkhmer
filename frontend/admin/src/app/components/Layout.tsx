import { Home, CalendarDays, Dumbbell, ChevronDown, Shield, LogOut, User as UserIcon, ClipboardCheck, Settings, Building2, Users, FileText, Newspaper, Bell, Handshake, Menu, X } from "lucide-react";
import { Outlet, NavLink, useLocation, useNavigate, Link } from "react-router";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { useState, useEffect } from "react";
import { usePermissions } from "../hooks/usePermissions";
import { api } from "../utils/api";
import { useAdminOverview } from "../hooks/useAdminOverview";
import { HeaderSearch } from "./HeaderSearch";
import logoImg from "../../assets/modern_logo.png";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type NavIcon = typeof Home;
interface NavItem {
  icon: NavIcon;
  label: string;
  path: string;
  permission: string | null;
  submenu?: { label: string; path: string; permission: string | null }[];
}

/** Menu grouped by job, so staff can find things quickly. Paths and permissions are unchanged. */
const navGroups: { title: string | null; items: NavItem[] }[] = [
  {
    title: null,
    items: [{ icon: Home, label: "Dashboard", path: "/home", permission: null }],
  },
  {
    title: "Competition",
    items: [
      {
        icon: CalendarDays,
        label: "Program",
        path: "/home/program",
        permission: "events.view",
        submenu: [
          { label: "Overview", path: "/home/program?tab=overview", permission: "events.view" },
          { label: "Events", path: "/home/program?tab=events", permission: "events.view" },
          { label: "Matches", path: "/home/program?tab=matches", permission: "events.view" },
          { label: "Champions", path: "/home/program?tab=champions", permission: "events.view" },
        ],
      },
      {
        icon: Dumbbell,
        label: "Fighters",
        path: "/home/fighters",
        permission: "fighters.view",
        submenu: [
          { label: "Kun Khmer", path: "/home/fighters/kunkhmer", permission: "fighters.view" },
          { label: "Foreigner", path: "/home/fighters/foreigner", permission: "fighters.view" },
        ],
      },
      { icon: Building2, label: "Clubs", path: "/home/clubs", permission: "fighters.view" },
      { icon: ClipboardCheck, label: "Match Proposals", path: "/home/match-proposals", permission: "matches.view_proposals" },
    ],
  },
  {
    title: "Content & partners",
    items: [
      {
        icon: Newspaper,
        label: "Media",
        path: "/home/media",
        permission: null,
        submenu: [
          { label: "News", path: "/home/media/news", permission: null },
          { label: "Video", path: "/home/media/video", permission: null },
        ],
      },
      {
        icon: Handshake,
        label: "Strategic Partners",
        path: "/home/strategic-partners",
        permission: null,
        submenu: [
          { label: "Broadcasters", path: "/home/strategic-partners/broadcasters", permission: null },
          { label: "Sponsors", path: "/home/strategic-partners/sponsors", permission: null },
        ],
      },
    ],
  },
  {
    title: "Administration",
    items: [
      { icon: Users, label: "Users", path: "/home/user-management", permission: "users.view" },
      { icon: Shield, label: "KKF Officers", path: "/home/kkf-officers", permission: "officials.assign" },
      { icon: Settings, label: "System Settings", path: "/home/settings", permission: null },
      { icon: FileText, label: "Process Flow", path: "/home/process-flow", permission: null },
    ],
  },
];

const navItems = navGroups.flatMap((g) => g.items);

/** Account role as the API names it ("Super Admin", "KKF Officer", ...). */
const apiRole = () => (api.auth.getCurrentUser()?.role as string | undefined) ?? "";

export function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const permissions = usePermissions();
  const [openSubmenu, setOpenSubmenu] = useState<string | null>("Program");
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const todoCount = useAdminOverview().data?.todos.length ?? 0;

  useEffect(() => {
    const activeItem = navItems.find((item) =>
      item.submenu?.some((sub) => location.pathname.startsWith(sub.path.split("?")[0])),
    );
    if (activeItem) setOpenSubmenu(activeItem.label);
    setMobileMenu(false);
  }, [location.pathname]);

  const allowed = (permission: string | null) => !permission || permissions.hasPermission(permission);
  const fullName = permissions.currentUser?.fullName || "Guest";
  const initial = fullName.charAt(0).toUpperCase() || "U";

  const handleLogout = async () => {
    await api.auth.logout();
    navigate("/login");
  };

  const sidebar = (
    <>
      <div className="h-16 flex items-center justify-between px-5 border-b border-slate-200 shrink-0">
        <Link to="/home" className="flex items-center gap-3 min-w-0">
          <img src={logoImg} alt="" className="w-9 h-9 rounded-full object-contain bg-white shrink-0" />
          <div className="min-w-0">
            <p className="font-extrabold text-[#0A3D91] text-sm tracking-wide leading-none">KUNKHMER</p>
            <p className="text-[11px] text-slate-500 mt-1">Management system</p>
          </div>
        </Link>
        <button type="button" onClick={() => setMobileMenu(false)} aria-label="Close menu" className="md:hidden w-9 h-9 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-500">
          <X className="w-5 h-5" />
        </button>
      </div>

      <nav aria-label="Main" className="flex-1 px-3 py-4 overflow-y-auto no-scrollbar space-y-5">
        {navGroups.map((group) => {
          const items = group.items.filter((item) => allowed(item.permission));
          if (items.length === 0) return null;
          return (
            <div key={group.title ?? "top"}>
              {group.title && <p className="px-3 mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">{group.title}</p>}
              <div className="space-y-0.5">
                {items.map((item) => {
                  const isActive = item.path === "/home" ? location.pathname === "/home" : location.pathname.startsWith(item.path);
                  const Icon = item.icon;
                  const rowClass = cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                    isActive ? "bg-[#eef3fb] text-[#0A3D91]" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                  );
                  const iconClass = cn("w-[18px] h-[18px] shrink-0", isActive ? "text-[#0A3D91]" : "text-slate-400");
                  if (!item.submenu) {
                    return (
                      <NavLink key={item.path} to={item.path} className={rowClass}>
                        <Icon className={iconClass} aria-hidden />
                        <span>{item.label}</span>
                      </NavLink>
                    );
                  }
                  const open = openSubmenu === item.label;
                  return (
                    <div key={item.path}>
                      <button type="button" onClick={() => setOpenSubmenu(open ? null : item.label)} aria-expanded={open} className={rowClass}>
                        <Icon className={iconClass} aria-hidden />
                        <span className="flex-1 text-left">{item.label}</span>
                        <ChevronDown className={cn("w-4 h-4 text-slate-400 transition-transform", open && "rotate-180")} aria-hidden />
                      </button>
                      {open && (
                        <div className="mt-0.5 mb-1 ml-[21px] pl-3 border-l border-slate-200 space-y-0.5">
                          {item.submenu.filter((sub) => allowed(sub.permission)).map((sub) => {
                            const here = location.pathname + (location.search || "");
                            const subActive = sub.path.includes("?")
                              ? here === sub.path || (sub.path.endsWith("overview") && here === "/home/program")
                              : location.pathname === sub.path || location.pathname.startsWith(sub.path + "/");
                            return (
                              <NavLink
                                key={sub.path}
                                to={sub.path}
                                className={cn(
                                  "block px-3 py-2 rounded-lg text-sm transition-colors",
                                  subActive ? "text-[#0A3D91] font-semibold bg-[#eef3fb]" : "text-slate-500 hover:text-slate-900 hover:bg-slate-100",
                                )}
                              >
                                {sub.label}
                              </NavLink>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      <div className="p-3 border-t border-slate-200 shrink-0">
        <div className="flex items-center gap-3 rounded-xl p-2 hover:bg-slate-50">
          <Link to="/home/profile" className="flex items-center gap-3 flex-1 min-w-0" title="My profile">
            <span className="w-9 h-9 rounded-full bg-[#0A3D91] text-white flex items-center justify-center font-bold text-sm shrink-0">{initial}</span>
            <span className="min-w-0">
              <span className="block text-sm font-semibold text-slate-900 truncate">{fullName}</span>
              <span className="block text-xs text-slate-500 truncate">{apiRole()}</span>
            </span>
          </Link>
          <button type="button" onClick={handleLogout} title="Sign out" aria-label="Sign out" className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-background text-foreground font-sans selection:bg-accent/30 overflow-hidden">
      {/* Desktop sidebar (light) */}
      <aside className="hidden md:flex w-[260px] flex-col bg-white border-r border-slate-200 shrink-0">{sidebar}</aside>

      {/* Phone menu drawer */}
      {mobileMenu && (
        <div className="md:hidden fixed inset-0 z-[60]">
          <button type="button" aria-label="Close menu" onClick={() => setMobileMenu(false)} className="absolute inset-0 bg-slate-900/40" />
          <aside className="relative h-full w-[280px] max-w-[85vw] flex flex-col bg-white shadow-2xl">{sidebar}</aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#F8FAFC]">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between gap-3 px-4 md:px-6 shrink-0 z-30">
          <button type="button" onClick={() => setMobileMenu(true)} aria-label="Open menu" className="md:hidden w-10 h-10 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-600 shrink-0">
            <Menu className="w-5 h-5" />
          </button>
          <HeaderSearch />

          <div className="flex items-center gap-2 md:gap-4 shrink-0">
            {/* Bell = the dashboard's "Needs your attention" count. */}
            <Link
              to="/home#todo"
              title={todoCount ? `${todoCount} ${todoCount === 1 ? "thing needs" : "things need"} your attention` : "Nothing needs your attention"}
              aria-label={todoCount ? `${todoCount} to-do items` : "No to-do items"}
              className="relative p-2 text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-muted"
            >
              <Bell className="w-5 h-5" />
              {todoCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-5 h-5 px-1 rounded-full bg-destructive text-white text-[11px] font-bold flex items-center justify-center ring-2 ring-white">
                  {todoCount > 99 ? "99+" : todoCount}
                </span>
              )}
            </Link>
            <div className="hidden md:block h-8 w-px bg-border mx-2" />
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 cursor-pointer focus:outline-none hover:opacity-85 transition-opacity"
              >
                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">{initial}</div>
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-border rounded-lg shadow-lg py-1 z-50 animate-fadeIn">
                  <Link to="/home/profile" onClick={() => setShowProfileMenu(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors">
                    <UserIcon className="w-4 h-4 text-muted-foreground" />
                    <span>My profile</span>
                  </Link>
                  <Link to="/home/settings" onClick={() => setShowProfileMenu(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors">
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
                    <span>Sign out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8">
          <Outlet />
        </main>
      </div>

      {/* Phone bottom navigation */}
      <nav aria-label="Quick" className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-border flex items-center justify-around px-2 z-50">
        {[navItems[0], ...navItems.slice(1).filter((i) => allowed(i.permission)).slice(0, 3)].map((item) => {
          const isActive = item.path === "/home" ? location.pathname === "/home" : location.pathname.startsWith(item.path);
          const Icon = item.icon;
          return (
            <NavLink key={item.path} to={item.path} className={cn("flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors", isActive ? "text-primary" : "text-muted-foreground")}>
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </NavLink>
          );
        })}
        <button type="button" onClick={() => setMobileMenu(true)} className="flex flex-col items-center justify-center w-full h-full space-y-1 text-muted-foreground">
          <Menu className="w-5 h-5" />
          <span className="text-[10px] font-medium">Menu</span>
        </button>
      </nav>
    </div>
  );
}
