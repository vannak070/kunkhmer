/**
 * My profile: the signed-in staff member's real account (GET /api/users/me). Anyone can edit
 * their name and email and change their password (current password required).
 */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { Eye, EyeOff, KeyRound, LogOut, Mail, ShieldCheck, UserRound } from "lucide-react";
import { api } from "../utils/api";
import { APPROVALS_ENABLED } from "../config/features";
import { type Lang, type TextKey, formatDay, khmerDigits, roleNameKey, useT } from "../i18n/program";

interface Me {
  id: string;
  username: string;
  fullName: string;
  email: string;
  role: string;
  status: string;
  lastLogin: string | null;
  createdAt: string | null;
}

const ROLE_HELP: Record<string, string> = {
  "Super Admin": "Full access, including staff accounts and system settings.",
  "KKF Officer": APPROVALS_ENABLED
    ? "Federation staff: verify fighters, record results and titles, manage news and partners."
    : "Federation staff: run events, fight cards, bouts, fighters, results and titles; manage news and partners.",
  Organizer: APPROVALS_ENABLED ? "Create and run events, fight cards and matches." : "Read-only for now: view events, fight cards and fighters.",
  "Club/Gym": APPROVALS_ENABLED ? "Manage your club's fighters and respond to its matches." : "Read-only for now: view events, fight cards and fighters.",
  Referee: "Match official account.",
  Judge: "Match official account.",
};

/** The same help in the dictionary; wording that only applies with approvals on stays English. */
const ROLE_HELP_TEXT: Record<string, TextKey | undefined> = {
  "Super Admin": "users.desc.admin",
  "KKF Officer": APPROVALS_ENABLED ? undefined : "users.desc.officer",
  Organizer: APPROVALS_ENABLED ? undefined : "prof.desc.readOnly",
  "Club/Gym": APPROVALS_ENABLED ? undefined : "prof.desc.readOnly",
  Referee: "prof.desc.official",
  Judge: "prof.desc.official",
};

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD = 8;
const field = "w-full h-11 px-3 rounded-xl border border-slate-300 bg-white text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10";
const initials = (name: string) => name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase() || "?";
const pad = (n: number) => String(n).padStart(2, "0");
const fmt = (v: string | null, lang: Lang) => {
  if (!v) return "—";
  const d = new Date(v);
  if (lang !== "km" || isNaN(d.getTime())) return d.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
  // Khmer: local day written by formatDay, then the time in Khmer digits.
  return `${formatDay(`${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`, lang)} ${khmerDigits(`${pad(d.getHours())}:${pad(d.getMinutes())}`)}`;
};

function PasswordInput({ id, value, onChange, autoComplete }: { id: string; value: string; onChange: (v: string) => void; autoComplete: string }) {
  const { t } = useT();
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input id={id} type={show ? "text" : "password"} className={`${field} pr-11`} value={value} onChange={(e) => onChange(e.target.value)} autoComplete={autoComplete} />
      <button type="button" onClick={() => setShow((s) => !s)} aria-label={t(show ? "prof.hidePassword" : "prof.showPassword")} className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-slate-500 hover:text-slate-800">
        {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
  );
}

export function Profile() {
  const { t, lang } = useT();
  const navigate = useNavigate();
  const [me, setMe] = useState<Me | null>(() => api.auth.getCurrentUser());
  const [name, setName] = useState(me?.fullName ?? "");
  const [email, setEmail] = useState(me?.email ?? "");
  const [savingDetails, setSavingDetails] = useState(false);
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pwError, setPwError] = useState<string | null>(null);
  const [savingPw, setSavingPw] = useState(false);

  useEffect(() => {
    api.auth.me().then((u: Me) => {
      setMe(u);
      setName(u.fullName);
      setEmail(u.email);
    }).catch(() => {});
  }, []);

  const detailsChanged = me && (name.trim() !== me.fullName || email.trim() !== me.email);

  const saveDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return toast.error(t("prof.needName"));
    if (!EMAIL.test(email.trim())) return toast.error(t("prof.badEmail"));
    setSavingDetails(true);
    try {
      const u = await api.auth.updateMe({ fullName: name.trim(), email: email.trim() });
      setMe(u);
      toast.success(t("prof.saved"));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("prof.saveError"));
    } finally {
      setSavingDetails(false);
    }
  };

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwError(null);
    if (!current) return setPwError(t("prof.needCurrent"));
    if (next.length < MIN_PASSWORD) return setPwError(t("prof.shortPassword", { n: MIN_PASSWORD }));
    if (next !== confirmPw) return setPwError(t("prof.mismatch"));
    if (next === current) return setPwError(t("prof.samePassword"));
    setSavingPw(true);
    try {
      await api.auth.changePassword(current, next);
      setCurrent("");
      setNext("");
      setConfirmPw("");
      toast.success(t("prof.passwordChanged"), { description: t("prof.passwordChangedHint") });
    } catch (err) {
      setPwError(err instanceof Error ? err.message : t("prof.passwordError"));
    } finally {
      setSavingPw(false);
    }
  };

  const signOut = async () => {
    await api.auth.logout();
    navigate("/login");
  };

  if (!me) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <header>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">{t("frame.profile")}</h1>
        <p className="text-slate-600 mt-1">{t("prof.intro")}</p>
      </header>

      {/* Summary */}
      <section className="rounded-2xl border border-slate-200 bg-gradient-to-br from-[#eef3fb] to-white p-6 flex flex-col sm:flex-row sm:items-center gap-5">
        <span className="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center text-xl font-bold shrink-0">{initials(me.fullName)}</span>
        <div className="flex-1 min-w-0">
          <p className="text-xl font-bold text-slate-900 truncate">{me.fullName}</p>
          <p className="text-sm text-slate-600 truncate">@{me.username} · {me.email}</p>
          <p className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold px-2 py-1 rounded-md bg-white border border-[#d5e0f3] text-primary">
            <ShieldCheck className="w-3.5 h-3.5" aria-hidden /> {roleNameKey(me.role) ? t(roleNameKey(me.role)!) : me.role}
          </p>
          {ROLE_HELP[me.role] && <p className="mt-1.5 text-sm text-slate-600">{ROLE_HELP_TEXT[me.role] ? t(ROLE_HELP_TEXT[me.role]!) : ROLE_HELP[me.role]}</p>}
        </div>
        <button type="button" onClick={signOut} className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-xl border border-slate-300 bg-white text-sm font-semibold text-slate-700 hover:border-red-300 hover:text-red-700">
          <LogOut className="w-4 h-4" aria-hidden /> {t("frame.signOut")}
        </button>
      </section>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Details */}
        <form onSubmit={saveDetails} className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2"><UserRound className="w-5 h-5 text-primary" aria-hidden /> {t("prof.details")}</h2>
          <div>
            <label htmlFor="p-name" className="block text-sm font-medium text-slate-700 mb-1">{t("users.fullName")}</label>
            <input id="p-name" className={field} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
          </div>
          <div>
            <label htmlFor="p-email" className="block text-sm font-medium text-slate-700 mb-1">{t("users.email")}</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" aria-hidden />
              <input id="p-email" type="email" className={`${field} pl-9`} value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
            </div>
          </div>
          <dl className="grid grid-cols-2 gap-3 text-sm pt-1">
            <div><dt className="text-slate-500">{t("users.username")}</dt><dd className="font-medium text-slate-800">@{me.username}</dd></div>
            <div><dt className="text-slate-500">{t("users.col.lastSignIn")}</dt><dd className="font-medium text-slate-800">{fmt(me.lastLogin, lang)}</dd></div>
          </dl>
          <p className="text-xs text-slate-500">{t("prof.askAdmin")}</p>
          <button type="submit" disabled={!detailsChanged || savingDetails} className="h-11 px-5 rounded-xl bg-primary hover:bg-[#083073] disabled:opacity-50 text-white text-sm font-semibold">
            {savingDetails ? t("common.saving") : t("prof.saveDetails")}
          </button>
        </form>

        {/* Password */}
        <form onSubmit={changePassword} className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2"><KeyRound className="w-5 h-5 text-primary" aria-hidden /> {t("prof.changePassword")}</h2>
          <div>
            <label htmlFor="p-current" className="block text-sm font-medium text-slate-700 mb-1">{t("prof.currentPassword")}</label>
            <PasswordInput id="p-current" value={current} onChange={setCurrent} autoComplete="current-password" />
          </div>
          <div>
            <label htmlFor="p-new" className="block text-sm font-medium text-slate-700 mb-1">{t("users.newPassword")}</label>
            <PasswordInput id="p-new" value={next} onChange={setNext} autoComplete="new-password" />
            <p className="mt-1 text-xs text-slate-500">{t("prof.passwordHint", { n: MIN_PASSWORD })}</p>
          </div>
          <div>
            <label htmlFor="p-confirm" className="block text-sm font-medium text-slate-700 mb-1">{t("prof.repeatPassword")}</label>
            <PasswordInput id="p-confirm" value={confirmPw} onChange={setConfirmPw} autoComplete="new-password" />
          </div>
          {pwError && <p role="alert" className="text-sm text-red-600">{pwError}</p>}
          <button type="submit" disabled={savingPw} className="h-11 px-5 rounded-xl bg-primary hover:bg-[#083073] disabled:opacity-50 text-white text-sm font-semibold">
            {savingPw ? t("prof.changing") : t("prof.changePassword")}
          </button>
        </form>
      </div>
    </div>
  );
}
