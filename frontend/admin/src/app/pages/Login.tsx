import { useState } from "react";
import { useNavigate } from "react-router";
import { LogIn, AlertCircle, Eye, EyeOff } from "lucide-react";
import { api } from "../utils/api";
import logoImg from "../../assets/modern_logo.png";

export function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A3D91] via-[#051C42] to-[#0A3D91] flex items-center justify-center p-4 relative overflow-hidden animate-fadeIn">
      {/* Background decorations */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none" />
      <div className="absolute top-0 left-0 w-96 h-96 bg-[#C8102E] rounded-full blur-3xl opacity-20 -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#F2C94C] rounded-full blur-3xl opacity-20 translate-x-1/2 translate-y-1/2" />
      <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-white rounded-full blur-3xl opacity-5 -translate-x-1/2 -translate-y-1/2" />

      <div className="w-full max-w-md relative z-10 animate-fadeIn">
        {/* ── Login Card ── */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border-4 border-white/20">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#C8102E] to-[#A00D24] px-8 py-10 text-center">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg overflow-hidden p-1.5">
              <img src={logoImg} alt="DIGITAL KUNKHMER" className="w-full h-full object-contain animate-fadeIn" />
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
                  onChange={(e) => { setUsername(e.target.value); }}
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