/**
 * Sign in (/login). Light, one short form, plain words, English + Khmer (switch at the top), made for officers
 * who aren't comfortable with technology:
 *  - phone-friendly: 48 px fields, 16 px text (no zoom on iPhone), the username is not auto-capitalised and
 *    stray spaces around it are ignored;
 *  - "Show" / "Hide" with a word instead of an eye icon, and a Caps Lock warning;
 *  - errors say what to do (wrong details / too many tries + how long to wait / no connection);
 *  - says what to do when the password is forgotten (a Super Admin sets a new one) and that one account is signed in
 *    on one device at a time;
 *  - shows the "no internet" / "new version" notices, and no outside pictures or invented version numbers.
 * See claude/updates/admin-login-page.md.
 */
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { AlertCircle, Info, LogIn } from "lucide-react";
import { api } from "../utils/api";
import { useT } from "../i18n/program";
import { LangSwitch } from "../components/program/shared";
import { PwaBar } from "../components/pwa/PwaBar";
import logoImg from "../../assets/modern_logo-small.webp";

const input =
  "w-full h-12 rounded-xl border border-slate-300 bg-white px-4 text-base text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary";

export function Login() {
  const navigate = useNavigate();
  const { t } = useT();
  // Sent here by the API because the sign-in ended (claude/updates/session-expired.md).
  const expired = useSearchParams()[0].get("expired") === "1";
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [capsLock, setCapsLock] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.auth.login(username.trim(), password);
      navigate("/");
    } catch (err: any) {
      if (err?.status === 429) setError(t("login.tooMany", { n: Math.max(1, Math.ceil((err.retryAfter ?? 60) / 60)) }));
      else if (err?.status === 401 || err?.status === 422) setError(t("login.wrong"));
      else if (!err?.status) setError(t("login.network"));
      else setError(err.message || t("login.wrong"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh bg-gradient-to-b from-[#eef3fb] to-white flex flex-col">
      <PwaBar />
      <div className="flex justify-end px-4 pt-4 sm:px-6">
        <LangSwitch />
      </div>

      <main className="flex-1 flex items-start sm:items-center justify-center px-4 pt-4 pb-10">
        <div className="w-full max-w-md">
          <header className="text-center mb-6">
            <img src={logoImg} alt="" width={96} height={96} className="w-24 h-24 mx-auto mb-4 rounded-full object-contain bg-white shadow-sm border border-slate-200 p-1" />
            <h1 className="text-3xl font-bold text-[#0A3D91]">KKF Admin</h1>
            <p className="text-base text-slate-600 mt-1">{t("login.org")}</p>
          </header>

          <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
            <h2 className="text-xl font-bold text-slate-900">{t("login.title")}</h2>
            <p className="text-base text-slate-600 mt-1 mb-6">{t("login.lead")}</p>

            {expired && !error && (
              <div role="status" className="mb-5 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" aria-hidden />
                <p className="text-sm text-amber-900">{t("login.expired")}</p>
              </div>
            )}

            {error && (
              <div role="alert" className="mb-5 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" aria-hidden />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label htmlFor="login-username" className="block text-sm font-semibold text-slate-800 mb-1.5">{t("login.username")}</label>
                <input
                  id="login-username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className={input}
                  required
                  autoFocus
                  autoComplete="username"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  enterKeyHint="next"
                />
              </div>

              <div>
                <label htmlFor="login-password" className="block text-sm font-semibold text-slate-800 mb-1.5">{t("login.password")}</label>
                <div className="relative">
                  <input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => setCapsLock(e.getModifierState?.("CapsLock") ?? false)}
                    onKeyUp={(e) => setCapsLock(e.getModifierState?.("CapsLock") ?? false)}
                    className={`${input} pr-24`}
                    required
                    autoComplete="current-password"
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                    enterKeyHint="go"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    aria-pressed={showPassword}
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 h-9 px-3 rounded-lg text-sm font-semibold text-primary hover:bg-primary/10"
                  >
                    {showPassword ? t("login.hide") : t("login.show")}
                  </button>
                </div>
                {capsLock && <p role="status" className="mt-2 text-sm text-amber-800">{t("login.capsLock")}</p>}
              </div>

              <button
                id="login-submit-btn"
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-xl bg-primary hover:bg-[#083073] text-white text-base font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" aria-hidden />
                    {t("login.submitting")}
                  </>
                ) : (
                  <>
                    <LogIn className="w-5 h-5" aria-hidden />
                    {t("login.submit")}
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-slate-100 space-y-3 text-sm text-slate-600">
              <p>{t("login.forgot")}</p>
              <p className="flex items-start gap-2 text-slate-500">
                <Info className="w-4 h-4 mt-0.5 shrink-0" aria-hidden />
                <span>{t("login.oneDevice")}</span>
              </p>
            </div>
          </section>

          <p className="text-center text-slate-500 text-sm mt-6">© 2026 {t("login.org")}</p>
        </div>
      </main>
    </div>
  );
}
