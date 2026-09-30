/**
 * Officials (Phase 4): the referees and judges KKF assigns to bouts. Each is a Referee or
 * Judge account (they sign in to see "My bouts"), with a grade and the year they started.
 * KKF staff add, edit and deactivate them here; the list comes from `GET /officials`.
 */
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Gavel, Loader2, Plus, Search, Shield, UserCheck, UserX } from "lucide-react";
import { api } from "../utils/api";
import { type Official, OFFICIAL_GRADES, useOfficials } from "../hooks/useOfficials";
import { type TextKey, khmerDigits, useT } from "../i18n/program";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../components/ui/dialog";

type RoleFilter = "all" | "Referee" | "Judge";

const ROLE_TABS: Record<RoleFilter, TextKey> = { all: "off.all", Referee: "off.referees", Judge: "off.judges" };
const ROLE_TEXT: Record<Official["role"], TextKey> = { Referee: "off.role.Referee", Judge: "off.role.Judge" };
const GRADE_TEXT: Record<string, TextKey> = {
  "International A": "off.grade.International A",
  "National A": "off.grade.National A",
  "National B": "off.grade.National B",
};

const inputClass = "w-full h-11 rounded-xl border border-slate-300 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none px-3 text-sm bg-white";

export function Officials() {
  const { t, lang } = useT();
  const { officials, loading, reload } = useOfficials();
  const [role, setRole] = useState<RoleFilter>("all");
  const [search, setSearch] = useState("");
  const [showInactive, setShowInactive] = useState(false);
  const [editing, setEditing] = useState<Official | "new" | null>(null);

  const shown = useMemo(() => {
    const q = search.trim().toLowerCase();
    return officials.filter(
      (o) =>
        (role === "all" || o.role === role) &&
        (showInactive || o.status === "Active") &&
        (!q || o.fullName.toLowerCase().includes(q) || (o.username ?? "").toLowerCase().includes(q)),
    );
  }, [officials, role, search, showInactive]);

  const count = (r: RoleFilter) => officials.filter((o) => o.status === "Active" && (r === "all" || o.role === r)).length;

  /** "International A · 12 yrs" in the chosen language, skipping what isn't known. */
  const summary = (o: Official) =>
    [
      o.grade ? (GRADE_TEXT[o.grade] ? t(GRADE_TEXT[o.grade]) : o.grade) : null,
      o.yearsExperience != null ? t(o.yearsExperience === 1 ? "off.yearOne" : "off.yearMany", { n: o.yearsExperience }) : null,
    ].filter(Boolean).join(" · ");

  const toggleActive = async (o: Official) => {
    const next = o.status === "Active" ? "Inactive" : "Active";
    try {
      await api.officials.update(o.id, { status: next });
      toast.success(t(next === "Active" ? "off.activeAgain" : "off.nowInactive", { name: o.fullName }));
      reload();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("off.statusError"));
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground flex items-center gap-2">
            <Shield className="w-6 h-6 text-primary" aria-hidden /> {t("menu.officials")}
          </h1>
          <p className="text-sm text-muted-foreground mt-1 font-medium">
            {t("off.intro")}
          </p>
        </div>
        <button type="button" onClick={() => setEditing("new")} className="btn-primary py-2.5 px-5">
          <Plus className="w-4 h-4" aria-hidden /> {t("off.add")}
        </button>
      </header>

      <div className="flex flex-col md:flex-row gap-3 md:items-center">
        <div role="tablist" aria-label={t("off.roleTabs")} className="flex gap-1 rounded-xl bg-slate-100 p-1">
          {(["all", "Referee", "Judge"] as RoleFilter[]).map((r) => (
            <button
              key={r}
              role="tab"
              type="button"
              aria-selected={role === r}
              onClick={() => setRole(r)}
              className={`flex-1 md:flex-none h-9 px-3 whitespace-nowrap rounded-lg text-sm font-semibold transition-colors ${role === r ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"}`}
            >
              {t(ROLE_TABS[r])} <span className="ml-1 text-xs font-bold text-slate-400">{lang === "km" ? khmerDigits(count(r)) : count(r)}</span>
            </button>
          ))}
        </div>
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" aria-hidden />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("off.searchPlaceholder")}
            aria-label={t("off.searchLabel")}
            className={`${inputClass} pl-10`}
          />
        </div>
        <label className="inline-flex items-center gap-2 text-sm text-slate-600 whitespace-nowrap">
          <input type="checkbox" checked={showInactive} onChange={(e) => setShowInactive(e.target.checked)} className="w-4 h-4 rounded border-slate-300" />
          {t("off.showInactive")}
        </label>
      </div>

      {loading && <div className="flex items-center gap-2 text-sm text-slate-500"><Loader2 className="w-4 h-4 animate-spin" aria-hidden /> {t("off.loading")}</div>}
      {!loading && shown.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">
          {t(officials.length ? "off.noMatch" : "off.empty")}
        </div>
      )}

      <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {shown.map((o) => (
          <li key={o.id} className={`rounded-2xl border bg-white p-4 flex flex-col gap-3 ${o.status === "Active" ? "border-slate-200" : "border-slate-200 opacity-70"}`}>
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${o.role === "Referee" ? "bg-blue-50 text-blue-700" : "bg-amber-50 text-amber-700"}`}>
                <Gavel className="w-5 h-5" aria-hidden />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-slate-900 truncate">{o.fullName}</p>
                <p className="text-sm text-slate-600">{t(ROLE_TEXT[o.role])}{summary(o) ? ` · ${summary(o)}` : ""}</p>
                {o.username && <p className="text-xs text-slate-400 truncate">@{o.username}</p>}
              </div>
              {o.status !== "Active" && <span className="text-[11px] font-semibold rounded-lg border border-slate-200 bg-slate-50 px-2 py-0.5 text-slate-500">{t("off.deactivated")}</span>}
            </div>
            <p className="text-sm text-slate-600">
              {o.upcomingBouts ? t(o.upcomingBouts === 1 ? "off.upcomingOne" : "off.upcomingMany", { n: o.upcomingBouts }) : t("off.noUpcoming")}
            </p>
            <div className="mt-auto flex gap-2">
              <button type="button" onClick={() => setEditing(o)} className="h-9 px-3 rounded-lg border border-slate-300 text-sm font-semibold text-slate-700 hover:border-primary hover:text-primary">
                {t("common.edit")}
              </button>
              <button type="button" onClick={() => toggleActive(o)} className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg text-sm font-semibold text-slate-600 hover:text-slate-900">
                {o.status === "Active" ? <><UserX className="w-4 h-4" aria-hidden /> {t("off.deactivate")}</> : <><UserCheck className="w-4 h-4" aria-hidden /> {t("off.activate")}</>}
              </button>
            </div>
          </li>
        ))}
      </ul>

      {editing && (
        <OfficialDialog
          official={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); reload(); }}
        />
      )}
    </div>
  );
}

function OfficialDialog({ official, onClose, onSaved }: { official: Official | null; onClose: () => void; onSaved: () => void }) {
  const { t } = useT();
  const isNew = !official;
  const [form, setForm] = useState({
    fullName: official?.fullName ?? "",
    role: official?.role ?? "Referee",
    grade: official?.grade ?? "",
    since: official?.since ? String(official.since) : "",
    username: official?.username ?? "",
    email: official?.email ?? "",
    password: "",
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName.trim()) return setError(t("off.needName"));
    if (isNew && (!form.username.trim() || !form.email.trim())) return setError(t("off.needAccount"));
    if ((isNew || form.password) && form.password.length < 8) return setError(t("off.shortPassword"));
    setBusy(true);
    setError(null);
    const body: Record<string, unknown> = {
      fullName: form.fullName,
      role: form.role,
      grade: form.grade || null,
      since: form.since ? Number(form.since) : null,
      email: form.email,
    };
    if (isNew) body.username = form.username;
    if (form.password) body.password = form.password;
    try {
      if (isNew) await api.officials.create(body);
      else await api.officials.update(official!.id, body);
      toast.success(t(!isNew ? "off.saved" : form.role === "Judge" ? "off.addedJudge" : "off.addedReferee", { name: form.fullName }));
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("off.saveError"));
    } finally {
      setBusy(false);
    }
  };

  const thisYear = new Date().getFullYear();
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-lg rounded-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isNew ? t("off.add") : t("off.editTitle", { name: official?.fullName ?? "" })}</DialogTitle>
          <DialogDescription>
            {t(isNew ? "off.addHint" : "off.editHint")}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={save} className="space-y-4">
          <div>
            <label htmlFor="o-name" className="block text-sm font-medium text-slate-700 mb-1">{t("off.fullName")}</label>
            <input id="o-name" value={form.fullName} onChange={set("fullName")} className={inputClass} autoComplete="off" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="o-role" className="block text-sm font-medium text-slate-700 mb-1">{t("off.roleTabs")}</label>
              <select id="o-role" value={form.role} onChange={set("role")} className={inputClass}>
                <option value="Referee">{t("off.role.Referee")}</option>
                <option value="Judge">{t("off.role.Judge")}</option>
              </select>
            </div>
            <div>
              <label htmlFor="o-grade" className="block text-sm font-medium text-slate-700 mb-1">{t("off.grade")}</label>
              <select id="o-grade" value={form.grade} onChange={set("grade")} className={inputClass}>
                <option value="">{t("common.notSet")}</option>
                {OFFICIAL_GRADES.map((g) => <option key={g} value={g}>{GRADE_TEXT[g] ? t(GRADE_TEXT[g]) : g}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label htmlFor="o-since" className="block text-sm font-medium text-slate-700 mb-1">{t("off.since")}</label>
            <input id="o-since" type="number" inputMode="numeric" min={1950} max={thisYear} value={form.since} onChange={set("since")} placeholder={t("off.sinceExample", { year: String(thisYear - 10) })} className={inputClass} />
          </div>
          <fieldset className="space-y-3 rounded-xl border border-slate-200 p-3">
            <legend className="px-1 text-sm font-medium text-slate-700">{t("off.account")}</legend>
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="o-username" className="block text-sm font-medium text-slate-700 mb-1">{t("off.username")}</label>
                <input id="o-username" value={form.username} onChange={set("username")} disabled={!isNew} className={`${inputClass} disabled:bg-slate-50 disabled:text-slate-500`} autoComplete="off" />
              </div>
              <div>
                <label htmlFor="o-email" className="block text-sm font-medium text-slate-700 mb-1">{t("off.email")}</label>
                <input id="o-email" type="email" value={form.email} onChange={set("email")} className={inputClass} autoComplete="off" />
              </div>
            </div>
            <div>
              <label htmlFor="o-password" className="block text-sm font-medium text-slate-700 mb-1">{t(isNew ? "off.password" : "off.newPassword")}</label>
              <input id="o-password" type="password" value={form.password} onChange={set("password")} className={inputClass} autoComplete="new-password" placeholder={t("off.passwordHint")} />
            </div>
          </fieldset>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <DialogFooter className="gap-2 sm:gap-2">
            <button type="button" onClick={onClose} className="h-11 px-5 rounded-xl border border-slate-300 text-sm font-medium text-slate-700 hover:bg-slate-50">{t("common.cancel")}</button>
            <button type="submit" disabled={busy} className="h-11 px-5 rounded-xl bg-primary hover:bg-[#083073] disabled:opacity-60 text-white text-sm font-semibold">{isNew ? t("off.add") : t("common.save")}</button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
