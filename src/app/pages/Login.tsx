import { useState } from "react";
import { useNavigate } from "react-router";
import { LogIn, Shield, AlertCircle, Crown, Settings, Eye, EyeOff, Users, Building2, ClipboardList } from "lucide-react";
import { api } from "../utils/api";
import logoImg from "../../assets/modern_logo.png";

const DEMO_ACCOUNTS = [
  {
    username: "admin",
    password: "admin123",
    label: "KKF Super Admin",
    emoji: "👑",
    icon: Crown,
    color: {
      border: "border-purple-200 hover:border-purple-400",
      badge: "bg-purple-100 text-purple-700 border border-purple-300",
      icon: "text-purple-600",
      mono: "group-hover:text-purple-700",
    },
    description: "Full system control — approve, reject, manage users & system config",
  },
  {
    username: "officer",
    password: "officer123",
    label: "KKF Officer",
    emoji: "⚙️",
    icon: Settings,
    color: {
      border: "border-red-200 hover:border-red-400",
      badge: "bg-red-100 text-red-700 border border-red-300",
      icon: "text-red-600",
      mono: "group-hover:text-red-700",
    },
    description: "Day-to-day operations — events, fighters, matches, clubs, officials",
  },
  {
    username: "organizer",
    password: "org123",
    label: "Event Organizer",
    emoji: "📋",
    icon: ClipboardList,
    color: {
      border: "border-blue-200 hover:border-blue-400",
      badge: "bg-blue-100 text-blue-700 border border-blue-300",
      icon: "text-blue-600",
      mono: "group-hover:text-blue-700",
    },
    description: "Creates events & matches, submits for federation approval",
  },
  {
    username: "manager",
    password: "manager123",
    label: "KKF Manager",
    emoji: "👔",
    icon: Users,
    color: {
      border: "border-amber-200 hover:border-amber-400",
      badge: "bg-amber-100 text-amber-700 border border-amber-300",
      icon: "text-amber-600",
      mono: "group-hover:text-amber-700",
    },
    description: "Reviews and approves events & matches submitted by organizers",
  },
  {
    username: "club",
    password: "club123",
    label: "Club / Gym",
    emoji: "🥊",
    icon: Building2,
    color: {
      border: "border-emerald-200 hover:border-emerald-400",
      badge: "bg-emerald-100 text-emerald-700 border border-emerald-300",
      icon: "text-emerald-600",
      mono: "group-hover:text-emerald-700",
    },
    description: "Manages fighters, accepts or rejects match proposals",
  },
];

export function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeCard, setActiveCard] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await api.auth.login(username, password);
      navigate("/");
    } catch (err: any) {
      setError(err.message || "Invalid username or password");
    } finally {
      setLoading(false);
    }
  };

  const fillCredentials = (user: string, pass: string) => {
    setUsername(user);
    setPassword(pass);
    setActiveCard(user);
    setError("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A3D91] via-[#051C42] to-[#0A3D91] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none" />
      <div className="absolute top-0 left-0 w-96 h-96 bg-[#C8102E] rounded-full blur-3xl opacity-20 -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#F2C94C] rounded-full blur-3xl opacity-20 translate-x-1/2 translate-y-1/2" />
      <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-white rounded-full blur-3xl opacity-5 -translate-x-1/2 -translate-y-1/2" />

      <div className="w-full max-w-5xl relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* ── Login Card ── */}
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border-4 border-white/20">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#C8102E] to-[#A00D24] px-8 py-10 text-center">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg overflow-hidden p-1.5">
                <img src={logoImg} alt="DIGITAL KUNKHMER" className="w-full h-full object-contain" />
              </div>
              <h1 className="text-3xl font-black text-white uppercase tracking-tight mb-1">
                DIGITAL KUNKHMER
              </h1>
              <p className="text-white/80 font-bold text-sm">Management System</p>
            </div>

            {/* Form */}
            <div className="p-8">
              <h2 className="text-2xl font-black text-[#0A3D91] uppercase tracking-tight mb-1 text-center">
                Sign In
              </h2>
              <p className="text-[#707070] text-sm text-center mb-8">Enter your credentials to continue</p>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl flex items-start gap-3 animate-pulse">
                  <AlertCircle className="w-5 h-5 text-[#C8102E] shrink-0 mt-0.5" />
                  <p className="text-sm font-bold text-[#C8102E]">{error}</p>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-5">
                {/* Username */}
                <div>
                  <label className="block text-xs font-black text-[#707070] uppercase tracking-wider mb-2">
                    Username
                  </label>
                  <input
                    id="login-username"
                    type="text"
                    value={username}
                    onChange={(e) => { setUsername(e.target.value); setActiveCard(null); }}
                    className="w-full bg-[#F4F5F8] border-2 border-[#E0E0E0] rounded-xl px-4 py-3.5 text-[#1A1A24] font-semibold focus:outline-none focus:ring-2 focus:ring-[#0A3D91] focus:border-[#0A3D91] transition-all"
                    placeholder="Enter username"
                    required
                    autoComplete="username"
                  />
                </div>

                {/* Password */}
                <div>
                  <label className="block text-xs font-black text-[#707070] uppercase tracking-wider mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-[#F4F5F8] border-2 border-[#E0E0E0] rounded-xl px-4 py-3.5 pr-12 text-[#1A1A24] font-semibold focus:outline-none focus:ring-2 focus:ring-[#0A3D91] focus:border-[#0A3D91] transition-all"
                      placeholder="Enter password"
                      required
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#707070] hover:text-[#0A3D91] transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <button
                  id="login-submit-btn"
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-[#C8102E] to-[#A00D24] hover:from-[#A00D24] hover:to-[#8A0B20] text-white px-6 py-4 rounded-xl font-black text-lg uppercase tracking-wide transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Signing In...
                    </>
                  ) : (
                    <>
                      <LogIn className="w-5 h-5" />
                      Sign In
                    </>
                  )}
                </button>
              </form>

              {/* Active credential hint */}
              {activeCard && (
                <p className="text-center text-xs text-[#0A3D91] font-bold mt-4">
                  ✅ Credentials loaded — click Sign In to continue
                </p>
              )}
            </div>
          </div>

          {/* ── Demo Credentials Panel ── */}
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden border-4 border-white/20 flex flex-col">
            <div className="p-6 pb-3">
              <div className="flex items-center gap-2 mb-1">
                <Shield className="w-5 h-5 text-[#0A3D91]" />
                <h3 className="text-lg font-black text-[#0A3D91] uppercase tracking-wide">Demo Accounts</h3>
              </div>
              <p className="text-[10px] text-[#707070] mb-4">Click any card to auto-fill credentials</p>

              <div className="space-y-2.5 overflow-y-auto max-h-[520px] pr-1">
                {DEMO_ACCOUNTS.map((account) => {
                  const Icon = account.icon;
                  const isActive = activeCard === account.username;
                  return (
                    <div
                      key={account.username}
                      onClick={() => fillCredentials(account.username, account.password)}
                      className={`p-3.5 bg-white rounded-xl border-2 transition-all cursor-pointer group select-none
                        ${isActive
                          ? "border-[#0A3D91] shadow-md ring-2 ring-[#0A3D91]/20"
                          : account.color.border + " hover:shadow-md"
                        }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <Icon className={`w-4 h-4 ${account.color.icon}`} />
                          <span className={`inline-flex px-2 py-0.5 rounded-lg text-[11px] font-bold ${account.color.badge}`}>
                            {account.emoji} {account.label}
                          </span>
                        </div>
                        {isActive && (
                          <span className="text-[10px] font-bold text-[#0A3D91] bg-blue-50 px-2 py-0.5 rounded-full">
                            Selected
                          </span>
                        )}
                      </div>

                      {/* Credential row */}
                      <div className="flex items-center gap-3 mb-1.5">
                        <code className={`text-xs font-mono font-bold bg-gray-50 px-2 py-0.5 rounded border ${account.color.mono} transition-colors`}>
                          {account.username}
                        </code>
                        <span className="text-[#C0C0C0] text-xs">/</span>
                        <code className={`text-xs font-mono font-bold bg-gray-50 px-2 py-0.5 rounded border ${account.color.mono} transition-colors`}>
                          {account.password}
                        </code>
                      </div>

                      <p className="text-[10px] text-[#707070] leading-relaxed">
                        {account.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Footer info */}
            <div className="mt-auto p-4 pt-2">
              <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl">
                <p className="text-[10px] text-[#707070] text-center leading-relaxed">
                  <span className="font-bold text-[#0A3D91]">Platform v3.0</span> — 5 role types available
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-white/60 text-sm mt-6 font-medium">
          © 2026 Kun Khmer Federation. All rights reserved. | Platform v3.0.0
        </p>
      </div>
    </div>
  );
}