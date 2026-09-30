/**
 * Private fighter details (ID / KYC, emergency contact, medical) — KKF staff only, never on the public site.
 * The form fields (Add / Edit Fighter), the read-only view (Fighter page "Personal details" tab) and the
 * warning helpers (Fighters list, Add bout). API: /fighters/:id/private; scans are downloaded with the staff
 * token (never a public link). claude/features/fighter-personal-records.md
 */
import { useRef, useState } from "react";
import { toast } from "sonner";
import { AlertTriangle, CheckCircle2, FileText, Lock, Pencil } from "lucide-react";
import { Link } from "react-router";
import { api } from "../../utils/api";
import { formatDay, useT, type TextKey } from "../../i18n/program";
import { fieldCls } from "../program/FightNightFields";

/** A scan in the form: "" none · "existing" already stored (left alone unless changed) · a data URI to upload. */
export interface PrivateForm {
  idType: string; idNumber: string; idExpiry: string; idDocument: string;
  emergencyName: string; emergencyRelation: string; emergencyPhone: string;
  phone: string; email: string; address: string;
  bloodType: string; lastMedicalCheck: string; medicalExpiry: string; medicalNotes: string; medicalDocument: string;
  guardianName: string; guardianPhone: string; consentGiven: boolean;
}

export const emptyPrivate = (): PrivateForm => ({
  idType: "National ID", idNumber: "", idExpiry: "", idDocument: "",
  emergencyName: "", emergencyRelation: "", emergencyPhone: "",
  phone: "", email: "", address: "",
  bloodType: "", lastMedicalCheck: "", medicalExpiry: "", medicalNotes: "", medicalDocument: "",
  guardianName: "", guardianPhone: "", consentGiven: false,
});

/** The API's private record → form values. */
export const privateFromApi = (p: any): PrivateForm => ({
  idType: p.idType ?? "National ID", idNumber: p.idNumber ?? "", idExpiry: p.idExpiry ?? "", idDocument: p.hasIdDocument ? "existing" : "",
  emergencyName: p.emergencyName ?? "", emergencyRelation: p.emergencyRelation ?? "", emergencyPhone: p.emergencyPhone ?? "",
  phone: p.phone ?? "", email: p.email ?? "", address: p.address ?? "",
  bloodType: p.bloodType ?? "", lastMedicalCheck: p.lastMedicalCheck ?? "", medicalExpiry: p.medicalExpiry ?? "", medicalNotes: p.medicalNotes ?? "", medicalDocument: p.hasMedicalDocument ? "existing" : "",
  guardianName: p.guardianName ?? "", guardianPhone: p.guardianPhone ?? "", consentGiven: Boolean(p.consentGiven),
});

/** Form values → PUT body. Empty text clears a field; an untouched stored scan is left out. */
export function privateBody(f: PrivateForm): Record<string, unknown> {
  const body: Record<string, unknown> = {
    idType: f.idType, idNumber: f.idNumber.trim(), idExpiry: f.idExpiry,
    emergencyName: f.emergencyName.trim(), emergencyRelation: f.emergencyRelation.trim(), emergencyPhone: f.emergencyPhone.trim(),
    phone: f.phone.trim(), email: f.email.trim(), address: f.address.trim(),
    bloodType: f.bloodType, lastMedicalCheck: f.lastMedicalCheck, medicalExpiry: f.medicalExpiry, medicalNotes: f.medicalNotes.trim(),
    guardianName: f.guardianName.trim(), guardianPhone: f.guardianPhone.trim(), consentGiven: f.consentGiven,
  };
  if (f.idDocument !== "existing") body.idDocument = f.idDocument || null;
  if (f.medicalDocument !== "existing") body.medicalDocument = f.medicalDocument || null;
  return body;
}

/** Required when registering a fighter: ID number and an emergency contact (owner, 2026-09-30). */
export function validatePrivate(f: PrivateForm, t: (k: TextKey, v?: any) => string): Record<string, string> {
  const e: Record<string, string> = {};
  if (!f.idNumber.trim()) e.idNumber = t("pv.needId");
  if (!f.emergencyName.trim()) e.emergencyName = t("pv.needEmName");
  if (!f.emergencyPhone.trim()) e.emergencyPhone = t("pv.needEmPhone");
  if (f.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim())) e.email = t("pv.badEmail");
  return e;
}

/** Wording of what is missing / expired for a fighter (`gaps` from the API) — warnings only. */
export function issueTexts(g: { missing?: string[]; idExpired?: boolean; medicalExpired?: boolean; needsGuardian?: boolean } | null | undefined, t: (k: TextKey, v?: any) => string): string[] {
  if (!g) return [];
  return [
    ...(g.missing ?? []).map((m) => t(`pv.missing.${m}` as TextKey)),
    ...(g.idExpired ? [t("pv.idExpired")] : []),
    ...(g.medicalExpired ? [t("pv.medExpired")] : []),
    ...(g.needsGuardian ? [t("pv.needGuardian")] : []),
  ];
}

const MAX_SCAN = 6 * 1024 * 1024;
const SCAN_TYPES = ["application/pdf", "image/png", "image/jpeg", "image/webp"];

/** Pick a scan (PDF or picture) and hand back its data URI. */
function ScanField({ label, value, onChange, hint }: { label: string; value: string; onChange: (v: string) => void; hint?: string }) {
  const { t } = useT();
  const input = useRef<HTMLInputElement>(null);
  const pick = (f?: File) => {
    if (!f) return;
    if (!SCAN_TYPES.includes(f.type)) { toast.error(t("pv.scanType")); return; }
    if (f.size > MAX_SCAN) { toast.error(t("pv.scanTooBig")); return; }
    const reader = new FileReader();
    reader.onloadend = () => onChange(reader.result as string);
    reader.readAsDataURL(f);
  };
  const has = Boolean(value);
  return (
    <div className="space-y-1">
      <span className="text-sm font-semibold text-slate-800">{label}</span>
      <div className="flex flex-wrap items-center gap-2">
        <span className={`inline-flex items-center gap-1.5 text-sm ${has ? "text-emerald-700" : "text-slate-500"}`}>
          <FileText className="w-4 h-4" aria-hidden /> {has ? t("pv.onFile") : t("pv.noScan")}
        </span>
        <button type="button" onClick={() => input.current?.click()} className="h-10 px-3 rounded-lg border border-slate-300 text-sm font-semibold text-slate-700 hover:border-primary">{has ? t("pv.changeScan") : t("pv.addScan")}</button>
        {has && <button type="button" onClick={() => onChange("")} className="h-10 px-3 text-sm text-slate-500 hover:text-red-700">{t("pv.removeScan")}</button>}
        <input ref={input} type="file" accept="application/pdf,image/png,image/jpeg,image/webp" className="hidden" onChange={(e) => { pick(e.target.files?.[0]); e.target.value = ""; }} />
      </div>
      {hint && <p className="text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

/** The form part: required ID + emergency contact first, everything else under "More details". */
export function PrivateFields({ form, set, errors, minor }: { form: PrivateForm; set: (patch: Partial<PrivateForm>) => void; errors: Record<string, string>; minor: boolean }) {
  const { t } = useT();
  const label = (text: string, required = false) => <span className="text-sm font-semibold text-slate-800">{text}{required && " *"}</span>;
  const err = (k: string) => (errors[k] ? <span className="block text-sm text-red-700 mt-1">{errors[k]}</span> : null);
  const [more, setMore] = useState(false);
  return (
    <section id="private" className="rounded-2xl border border-slate-200 bg-white p-5 md:p-7 space-y-6 shadow-sm">
      <div>
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2"><Lock className="w-5 h-5 text-primary" aria-hidden /> {t("pv.title")}</h2>
        <p className="text-sm text-slate-600 mt-1">{t("pv.staffOnly")}</p>
      </div>

      <fieldset className="space-y-4">
        <legend className="text-sm font-bold text-slate-900">{t("pv.id")}</legend>
        <div className="grid sm:grid-cols-2 gap-5">
          <label className="block">{label(t("pv.idType"), true)}
            <select className={`${fieldCls} mt-1`} value={form.idType} onChange={(e) => set({ idType: e.target.value })}>
              <option value="National ID">{t("pv.idt.national")}</option>
              <option value="Passport">{t("pv.idt.passport")}</option>
              <option value="Other">{t("pv.idt.other")}</option>
            </select>
          </label>
          <label className="block">{label(t("pv.idNumber"), true)}<input className={`${fieldCls} mt-1`} value={form.idNumber} onChange={(e) => set({ idNumber: e.target.value })} />{err("idNumber")}</label>
        </div>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="text-sm font-bold text-slate-900">{t("pv.emergency")}</legend>
        <div className="grid sm:grid-cols-3 gap-5">
          <label className="block">{label(t("pv.emName"), true)}<input className={`${fieldCls} mt-1`} value={form.emergencyName} onChange={(e) => set({ emergencyName: e.target.value })} />{err("emergencyName")}</label>
          <label className="block">{label(t("pv.emPhone"), true)}<input type="tel" inputMode="tel" className={`${fieldCls} mt-1`} value={form.emergencyPhone} onChange={(e) => set({ emergencyPhone: e.target.value })} />{err("emergencyPhone")}</label>
          <label className="block">{label(t("pv.emRelation"))}<input className={`${fieldCls} mt-1`} value={form.emergencyRelation} onChange={(e) => set({ emergencyRelation: e.target.value })} /></label>
        </div>
      </fieldset>

      {minor && (
        <fieldset className="space-y-4 rounded-xl bg-amber-50 border border-amber-200 p-4">
          <legend className="px-1 text-sm font-bold text-amber-900">{t("pv.guardian")}</legend>
          <div className="grid sm:grid-cols-2 gap-5">
            <label className="block">{label(t("pv.guardianName"))}<input className={`${fieldCls} mt-1`} value={form.guardianName} onChange={(e) => set({ guardianName: e.target.value })} /></label>
            <label className="block">{label(t("pv.guardianPhone"))}<input type="tel" inputMode="tel" className={`${fieldCls} mt-1`} value={form.guardianPhone} onChange={(e) => set({ guardianPhone: e.target.value })} /></label>
          </div>
        </fieldset>
      )}

      <button type="button" aria-expanded={more} onClick={() => setMore(!more)} className="text-sm font-semibold text-primary hover:underline">
        {t("pv.more")} {more ? "▲" : "▼"}
      </button>

      {more && (
        <div className="space-y-6 pt-1">
          <div className="grid sm:grid-cols-2 gap-5">
            <label className="block">{label(t("pv.idExpiry"))}<input type="date" className={`${fieldCls} mt-1`} value={form.idExpiry} onChange={(e) => set({ idExpiry: e.target.value })} /></label>
            <ScanField label={t("pv.idScan")} value={form.idDocument} onChange={(v) => set({ idDocument: v })} />
          </div>

          <fieldset className="space-y-4">
            <legend className="text-sm font-bold text-slate-900">{t("pv.contact")}</legend>
            <div className="grid sm:grid-cols-3 gap-5">
              <label className="block">{label(t("pv.phone"))}<input type="tel" inputMode="tel" className={`${fieldCls} mt-1`} value={form.phone} onChange={(e) => set({ phone: e.target.value })} /></label>
              <label className="block">{label(t("pv.email"))}<input type="email" className={`${fieldCls} mt-1`} value={form.email} onChange={(e) => set({ email: e.target.value })} />{err("email")}</label>
              <label className="block">{label(t("pv.address"))}<input className={`${fieldCls} mt-1`} value={form.address} onChange={(e) => set({ address: e.target.value })} /></label>
            </div>
          </fieldset>

          <fieldset className="space-y-4">
            <legend className="text-sm font-bold text-slate-900">{t("pv.medical")}</legend>
            <div className="grid sm:grid-cols-3 gap-5">
              <label className="block">{label(t("pv.blood"))}
                <select className={`${fieldCls} mt-1`} value={form.bloodType} onChange={(e) => set({ bloodType: e.target.value })}>
                  <option value="">—</option>
                  {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((b) => <option key={b} value={b}>{b}</option>)}
                </select>
              </label>
              <label className="block">{label(t("pv.lastCheck"))}<input type="date" className={`${fieldCls} mt-1`} value={form.lastMedicalCheck} onChange={(e) => set({ lastMedicalCheck: e.target.value })} /></label>
              <label className="block">{label(t("pv.medExpiry"))}<input type="date" className={`${fieldCls} mt-1`} value={form.medicalExpiry} onChange={(e) => set({ medicalExpiry: e.target.value })} /></label>
            </div>
            <label className="block">{label(t("pv.medNotes"))}<textarea rows={2} className={`${fieldCls} mt-1 h-auto py-2`} value={form.medicalNotes} onChange={(e) => set({ medicalNotes: e.target.value })} /></label>
            <ScanField label={t("pv.medScan")} value={form.medicalDocument} onChange={(v) => set({ medicalDocument: v })} />
          </fieldset>

          <label className="flex items-start gap-3 text-sm text-slate-800">
            <input type="checkbox" className="mt-1 w-5 h-5" checked={form.consentGiven} onChange={(e) => set({ consentGiven: e.target.checked })} />
            <span>{t("pv.consent")}</span>
          </label>
        </div>
      )}
    </section>
  );
}

/** Read-only view for the fighter page: what's missing, the details, and the scans (opened with the staff token). */
export function PrivateDetailsView({ fighterId, data, error }: { fighterId: string; data: any | null; error: boolean }) {
  const { t, lang } = useT();
  const open = async (kind: "id" | "medical") => {
    try {
      const url = URL.createObjectURL(await api.fighters.privateDocument(fighterId, kind));
      window.open(url, "_blank", "noopener");
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch {
      toast.error(t("pv.loadFailed"));
    }
  };
  if (error) return <p role="alert" className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-900">{t("pv.loadFailed")}</p>;
  if (!data) return <div className="rounded-2xl border border-slate-200 bg-white p-8 flex justify-center"><div className="w-7 h-7 border-2 border-primary border-t-transparent rounded-full animate-spin" aria-label={t("common.loading")} /></div>;

  const issues = issueTexts(data, t);
  const day = (d?: string | null) => (d ? formatDay(d, lang, false) : null);
  const rows: [string, ReactNodeLike][] = [
    [t("pv.idType"), data.idType ? t(`pv.idt.${data.idType === "National ID" ? "national" : data.idType === "Passport" ? "passport" : "other"}` as TextKey) : null],
    [t("pv.idNumber"), data.idNumber],
    [t("pv.idExpiry"), day(data.idExpiry)],
    [t("pv.idScan"), data.hasIdDocument ? <button type="button" onClick={() => open("id")} className="font-semibold text-primary hover:underline">{t("pv.openScan")}</button> : t("pv.noScan")],
    [t("pv.emName"), data.emergencyName],
    [t("pv.emPhone"), data.emergencyPhone],
    [t("pv.emRelation"), data.emergencyRelation],
    [t("pv.phone"), data.phone],
    [t("pv.email"), data.email],
    [t("pv.address"), data.address],
    [t("pv.guardianName"), data.guardianName],
    [t("pv.guardianPhone"), data.guardianPhone],
    [t("pv.blood"), data.bloodType],
    [t("pv.lastCheck"), day(data.lastMedicalCheck)],
    [t("pv.medExpiry"), day(data.medicalExpiry)],
    [t("pv.medNotes"), data.medicalNotes],
    [t("pv.medScan"), data.hasMedicalDocument ? <button type="button" onClick={() => open("medical")} className="font-semibold text-primary hover:underline">{t("pv.openScan")}</button> : t("pv.noScan")],
    [data.consentGiven ? t("pv.consentYes") : t("pv.consentNo"), data.consentGiven ? day(data.consentAt) : null],
  ];
  return (
    <div className="space-y-4">
      {issues.length === 0 ? (
        <p className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-emerald-800 flex items-center gap-2"><CheckCircle2 className="w-5 h-5 shrink-0" aria-hidden /> {t("pv.complete")}</p>
      ) : (
        <div role="status" className="rounded-xl bg-amber-50 border border-amber-200 p-4 text-amber-900">
          <p className="font-semibold flex items-center gap-2"><AlertTriangle className="w-5 h-5 shrink-0" aria-hidden /> {t("pv.badge")}</p>
          <ul className="mt-1 list-disc ml-7 text-sm">{issues.map((i) => <li key={i}>{i}</li>)}</ul>
        </div>
      )}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2"><Lock className="w-5 h-5 text-primary" aria-hidden /> {t("pv.title")}</h2>
            <p className="text-sm text-slate-600 mt-1">{t("pv.staffOnly")}</p>
          </div>
          <Link to={`/home/fighters/${fighterId}/edit#private`} className="inline-flex items-center gap-1.5 h-10 px-3 rounded-lg border border-slate-200 text-sm font-semibold text-slate-700 hover:border-primary hover:text-primary">
            <Pencil className="w-4 h-4" aria-hidden /> {t("pv.edit")}
          </Link>
        </div>
        <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-2 text-base">
          {rows.map(([k, v]) => (
            <div key={k} className="contents"><dt className="text-slate-500">{k}</dt><dd className="text-slate-900 break-words">{v || <span className="text-slate-400">{t("pv.notRecorded")}</span>}</dd></div>
          ))}
        </dl>
      </section>
    </div>
  );
}

type ReactNodeLike = string | null | undefined | JSX.Element;
