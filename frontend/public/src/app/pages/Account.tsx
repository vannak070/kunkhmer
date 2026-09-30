import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { BellPlus, Loader2, LogOut, ShieldAlert, UserRound } from "lucide-react";
import { toast } from "sonner";
import { SiteHeader } from "../components/layout/SiteHeader";
import { SiteFooter } from "../components/layout/SiteFooter";
import { HubAskAbout } from "../components/hub/HubAskAbout";
import { useFan } from "../contexts/FanContext";
import { getFighterSlug } from "../data/masterData";
import { usePageMeta } from "../hooks/usePageTitle";
import { useI18n } from "../i18n/LanguageContext";
import { fanApi, FanApiError, type FollowedFighter } from "../utils/fanApi";

const inputClass =
  "w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0A3D91]/30 focus:border-[#0A3D91]";

/** Only same-site paths are allowed after sign-in (no open redirects). */
function safeNext(next: string | null) {
  return next && next.startsWith("/") && !next.startsWith("//") ? next : null;
}

function errorText(err: unknown, fallback: string) {
  return err instanceof FanApiError ? err.message : fallback;
}

function AuthForms() {
  const { t } = useI18n();
  const { signIn, signUp } = useFan();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [mode, setMode] = useState<"signIn" | "signUp">("signIn");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      if (mode === "signIn") await signIn(email, password);
      else await signUp({ email, password, displayName });
      toast.success(t("account.welcomeToast", { name: displayName || email.split("@")[0] }));
      const next = safeNext(params.get("next"));
      if (next) navigate(next);
    } catch (err) {
      setError(errorText(err, t("common.error")));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid md:grid-cols-2 gap-8 items-start">
      <div className="space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-[#C8102E] text-white flex items-center justify-center">
          <BellPlus className="w-7 h-7" aria-hidden />
        </div>
        <h1 className="text-3xl md:text-4xl font-black text-gray-900">{t("account.welcome")}</h1>
        <p className="text-gray-600 leading-relaxed">{t("account.welcomeText")}</p>
      </div>

      <form onSubmit={submit} className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 md:p-8 space-y-4">
        <div role="tablist" className="grid grid-cols-2 gap-1 p-1 bg-gray-100 rounded-xl">
          {(["signIn", "signUp"] as const).map((m) => (
            <button
              key={m}
              type="button"
              role="tab"
              aria-selected={mode === m}
              onClick={() => {
                setMode(m);
                setError(null);
              }}
              className={`py-2 rounded-lg text-sm font-bold transition-colors ${mode === m ? "bg-white shadow-sm text-gray-900" : "text-gray-500"}`}
            >
              {t(m === "signIn" ? "account.signIn" : "account.signUp")}
            </button>
          ))}
        </div>

        {mode === "signUp" && (
          <label className="block">
            <span className="block text-sm font-bold text-gray-700 mb-1">{t("account.displayName")}</span>
            <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} required minLength={2} maxLength={50} autoComplete="nickname" className={inputClass} />
          </label>
        )}
        <label className="block">
          <span className="block text-sm font-bold text-gray-700 mb-1">{t("account.email")}</span>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" className={inputClass} />
        </label>
        <label className="block">
          <span className="block text-sm font-bold text-gray-700 mb-1">{t("account.password")}</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={mode === "signUp" ? 8 : undefined}
            autoComplete={mode === "signUp" ? "new-password" : "current-password"}
            className={inputClass}
          />
          {mode === "signUp" && <span className="block text-xs text-gray-500 mt-1">{t("account.passwordHint")}</span>}
        </label>

        {error && <p role="alert" className="text-sm font-semibold text-red-600">{error}</p>}

        <button type="submit" disabled={busy} className="w-full inline-flex items-center justify-center gap-2 py-3 bg-[#0A3D91] hover:bg-blue-800 text-white rounded-xl font-bold transition-colors disabled:opacity-60">
          {busy && <Loader2 className="w-4 h-4 animate-spin" aria-hidden />}
          {t(mode === "signIn" ? "account.signIn" : "account.signUp")}
        </button>
        <p className="text-sm text-gray-500 text-center">
          {t(mode === "signIn" ? "account.noAccount" : "account.haveAccount")}{" "}
          <button type="button" onClick={() => setMode(mode === "signIn" ? "signUp" : "signIn")} className="font-bold text-[#0A3D91] hover:underline">
            {t(mode === "signIn" ? "account.signUp" : "account.signIn")}
          </button>
        </p>
      </form>
    </div>
  );
}

function Dashboard() {
  const { t, localName } = useI18n();
  const { fan, followedIds, updateProfile, signOut, deleteAccount } = useFan();
  const navigate = useNavigate();
  const [follows, setFollows] = useState<FollowedFighter[] | null>(null);
  const [displayName, setDisplayName] = useState(fan!.displayName);
  const [language, setLanguage] = useState(fan!.language);
  const [notifyEmail, setNotifyEmail] = useState(fan!.notifyEmail);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [deletePassword, setDeletePassword] = useState("");

  // Reload the list whenever follows change (e.g. unfollowed on a profile).
  useEffect(() => {
    fanApi.follows().then(setFollows).catch(() => setFollows([]));
  }, [followedIds]);

  const run = async (fn: () => Promise<void>, success: string) => {
    try {
      await fn();
      toast.success(success);
    } catch (err) {
      toast.error(errorText(err, t("common.error")));
    }
  };

  const card = "bg-white rounded-3xl border border-gray-200 p-6 md:p-8";

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-[#0A3D91] text-white text-2xl font-black flex items-center justify-center">
            {fan!.displayName.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-gray-900">{t("account.account")}</h1>
            <p className="text-sm text-gray-500">{t("account.signedInAs", { name: fan!.email })}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={async () => {
            await signOut();
            toast(t("account.signedOut"));
            navigate("/");
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 border border-gray-200 hover:border-gray-400 rounded-xl text-sm font-bold text-gray-700"
        >
          <LogOut className="w-4 h-4" aria-hidden />
          {t("account.signOut")}
        </button>
      </div>

      <section className={card}>
        <h2 className="text-lg font-black text-gray-900 mb-4">{t("account.following")}</h2>
        {follows === null ? (
          <Loader2 className="w-5 h-5 animate-spin text-gray-400" aria-hidden />
        ) : follows.length === 0 ? (
          <div className="text-sm text-gray-500 space-y-3">
            <p>{t("account.followingEmpty")}</p>
            <Link to="/fighters" className="inline-flex px-4 py-2 bg-[#0A3D91] text-white rounded-xl font-bold">{t("account.browseFighters")}</Link>
          </div>
        ) : (
          <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {follows.map((f) => (
              <li key={f.fighterId}>
                <Link to={`/fighters/${getFighterSlug({ id: f.fighterId, name: f.name })}`} className="flex items-center gap-3 p-3 rounded-2xl border border-gray-100 hover:border-[#0A3D91]/40 hover:bg-gray-50">
                  {f.image ? (
                    <img src={f.image} alt="" className="w-12 h-12 rounded-full object-cover" />
                  ) : (
                    <span className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center"><UserRound className="w-5 h-5 text-gray-400" /></span>
                  )}
                  <span className="min-w-0">
                    <span className="block font-bold text-gray-900 truncate">{localName(f.name, f.nameKhmer)}</span>
                    <span className="block text-xs text-gray-500 truncate">{[f.record, f.clubName].filter(Boolean).join(" · ")}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
        {/* KUNKHMER HUB Phase D3: questions about the fighters this fan follows (hidden when the Hub is off). */}
        {follows && follows.length > 0 && <HubAskAbout className="mt-4" questions={[t("hub.qMyNext"), t("hub.qMyRecent")]} />}
      </section>

      <div className="grid lg:grid-cols-2 gap-6">
        <form
          className={`${card} space-y-4`}
          onSubmit={(e) => {
            e.preventDefault();
            run(() => updateProfile({ displayName, language, notifyEmail }), t("account.saved"));
          }}
        >
          <h2 className="text-lg font-black text-gray-900">{t("account.profile")}</h2>
          <label className="block">
            <span className="block text-sm font-bold text-gray-700 mb-1">{t("account.displayName")}</span>
            <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} required minLength={2} maxLength={50} className={inputClass} />
          </label>
          <label className="block">
            <span className="block text-sm font-bold text-gray-700 mb-1">{t("account.language")}</span>
            <select value={language} onChange={(e) => setLanguage(e.target.value as "en" | "km")} className={inputClass}>
              <option value="en">English</option>
              <option value="km">ភាសាខ្មែរ</option>
            </select>
          </label>
          <label className="flex items-start gap-3">
            <input type="checkbox" checked={notifyEmail} onChange={(e) => setNotifyEmail(e.target.checked)} className="mt-1 w-4 h-4 accent-[#0A3D91]" />
            <span>
              <span className="block text-sm font-bold text-gray-700">{t("account.emailUpdates")}</span>
              <span className="block text-xs text-gray-500">{t("account.emailUpdatesSoon")}</span>
            </span>
          </label>
          <button type="submit" className="px-5 py-2.5 bg-[#0A3D91] hover:bg-blue-800 text-white rounded-xl font-bold text-sm">{t("account.save")}</button>
        </form>

        <div className="space-y-6">
          <form
            className={`${card} space-y-4`}
            onSubmit={(e) => {
              e.preventDefault();
              run(async () => {
                await updateProfile({ currentPassword, newPassword });
                setCurrentPassword("");
                setNewPassword("");
              }, t("account.passwordChanged"));
            }}
          >
            <h2 className="text-lg font-black text-gray-900">{t("account.security")}</h2>
            <input type="password" placeholder={t("account.currentPassword")} aria-label={t("account.currentPassword")} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required autoComplete="current-password" className={inputClass} />
            <input type="password" placeholder={t("account.newPassword")} aria-label={t("account.newPassword")} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={8} autoComplete="new-password" className={inputClass} />
            <button type="submit" className="px-5 py-2.5 border border-gray-300 hover:border-[#0A3D91] rounded-xl font-bold text-sm text-gray-700">{t("account.changePassword")}</button>
          </form>

          <form
            className={`${card} space-y-3 border-red-200`}
            onSubmit={(e) => {
              e.preventDefault();
              run(async () => {
                await deleteAccount(deletePassword);
                navigate("/");
              }, t("account.deleted"));
            }}
          >
            <h2 className="flex items-center gap-2 text-lg font-black text-red-700">
              <ShieldAlert className="w-5 h-5" aria-hidden />
              {t("account.danger")}
            </h2>
            <p className="text-sm text-gray-600">{t("account.dangerText")}</p>
            <input type="password" placeholder={t("account.deleteConfirm")} aria-label={t("account.deleteConfirm")} value={deletePassword} onChange={(e) => setDeletePassword(e.target.value)} required autoComplete="current-password" className={inputClass} />
            <button type="submit" className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-sm">{t("account.delete")}</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export function Account() {
  const { t } = useI18n();
  const { fan, loading } = useFan();
  usePageMeta({ title: fan ? t("account.account") : t("account.signIn") });

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <SiteHeader />
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 md:px-6 py-10 md:py-16">
        {loading ? (
          <div className="py-24 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-[#0A3D91]" aria-hidden /></div>
        ) : fan ? (
          <Dashboard />
        ) : (
          <AuthForms />
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
