import { useState } from "react";
import { useNavigate } from "react-router";
import { LogIn, Shield, AlertCircle, Crown, Search, Settings, Tv, Dumbbell, Gavel } from "lucide-react";
import { loginUser, MOCK_USERS } from "../data/users";
import logoImg from "figma:asset/a66d0715b1669c88badc1b57f275bd3b2182d59e.png";

export function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Simulate network delay
    setTimeout(() => {
      const user = loginUser(username, password);
      
      if (user) {
        // Successful login
        navigate("/");
      } else {
        setError("Invalid username or password");
      }
      
      setLoading(false);
    }, 500);
  };

  const fillCredentials = (user: string, pass: string) => {
    setUsername(user);
    setPassword(pass);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A3D91] via-[#051C42] to-[#0A3D91] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none" />
      <div className="absolute top-0 left-0 w-96 h-96 bg-[#C8102E] rounded-full blur-3xl opacity-20 -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#F2C94C] rounded-full blur-3xl opacity-20 translate-x-1/2 translate-y-1/2" />

      <div className="w-full max-w-5xl relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Login Card */}
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border-4 border-white/20">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#C8102E] to-[#A00D24] px-8 py-10 text-center">
              <div className="w-24 h-24 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <img src={logoImg} alt="KUN KHMER" className="w-20 h-20 object-contain" />
              </div>
              <h1 className="text-3xl font-black text-white uppercase tracking-tight mb-2">
                KUN KHMER
              </h1>
              <p className="text-white/80 font-bold text-sm">Digital Platform v3.0</p>
            </div>

            {/* Login Form */}
            <div className="p-8">
              <h2 className="text-2xl font-black text-[#0A3D91] uppercase tracking-tight mb-2 text-center">
                Sign In
              </h2>
              <p className="text-[#707070] text-sm text-center mb-8">Enter your credentials to continue</p>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-[#C8102E] shrink-0 mt-0.5" />
                  <p className="text-sm font-bold text-[#C8102E]">{error}</p>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-6">
                <div>
                  <label className="block text-xs font-black text-[#707070] uppercase tracking-wider mb-2">
                    Username
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-[#F4F5F8] border-2 border-[#E0E0E0] rounded-xl px-4 py-3.5 text-[#1A1A24] font-semibold focus:outline-none focus:ring-2 focus:ring-[#0A3D91] focus:border-[#0A3D91] transition-all"
                    placeholder="Enter username"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-[#707070] uppercase tracking-wider mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#F4F5F8] border-2 border-[#E0E0E0] rounded-xl px-4 py-3.5 text-[#1A1A24] font-semibold focus:outline-none focus:ring-2 focus:ring-[#0A3D91] focus:border-[#0A3D91] transition-all"
                    placeholder="Enter password"
                    required
                  />
                </div>

                <button
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
            </div>
          </div>

          {/* Demo Credentials - Updated with 6 Roles */}
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden border-4 border-white/20 p-8">
            <div className="flex items-center gap-2 mb-6">
              <Shield className="w-6 h-6 text-[#0A3D91]" />
              <h3 className="text-xl font-black text-[#0A3D91] uppercase tracking-wide">Demo Credentials</h3>
            </div>

            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
              {/* 1. KKF Super Admin */}
              <div 
                className="p-4 bg-white rounded-xl border-2 border-purple-200 hover:border-purple-400 hover:shadow-md transition-all cursor-pointer group"
                onClick={() => fillCredentials('superadmin', 'admin123')}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Crown className="w-5 h-5 text-purple-600" />
                    <span className="inline-flex px-2.5 py-1 bg-purple-100 text-purple-700 rounded-lg text-xs font-bold border border-purple-300">
                      👑 KKF Super Admin
                    </span>
                  </div>
                </div>
                <p className="text-xs text-[#707070] font-mono mb-2 group-hover:text-[#0A3D91] transition-colors">
                  superadmin / admin123
                </p>
                <p className="text-[10px] text-[#707070] leading-relaxed">
                  <span className="font-bold text-[#1A1A24]">Oversight & Approvals:</span> Approve/reject submissions, manage users, override decisions, system configuration
                </p>
              </div>

              {/* 2. KKF Officer (Execution) */}
              <div 
                className="p-4 bg-white rounded-xl border-2 border-red-200 hover:border-red-400 hover:shadow-md transition-all cursor-pointer group"
                onClick={() => fillCredentials('officer1', 'officer123')}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Settings className="w-5 h-5 text-[#C8102E]" />
                    <span className="inline-flex px-2.5 py-1 bg-red-100 text-[#C8102E] rounded-lg text-xs font-bold border border-red-300">
                      ⚙️ KKF Officer
                    </span>
                  </div>
                </div>
                <p className="text-xs text-[#707070] font-mono mb-2 group-hover:text-[#0A3D91] transition-colors">
                  officer1 / officer123
                </p>
                <p className="text-[10px] text-[#707070] leading-relaxed">
                  <span className="font-bold text-[#1A1A24]">Operations & Execution:</span> Create/manage events, fighters, matches, clubs, sponsors, broadcasts, assign officials, weigh-ins, enter results
                </p>
              </div>
            </div>

            {/* Info Box */}
            <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl">
              <p className="text-xs text-[#0A3D91] font-bold text-center mb-2">
                💡 Click any credential card to auto-fill
              </p>
              <p className="text-[10px] text-[#707070] text-center leading-relaxed">
                <span className="font-bold">v3.0:</span> 2 primary roles - Super Admin (full control) and KKF Officer (execution tasks)
              </p>
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