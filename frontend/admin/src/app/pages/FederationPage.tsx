/**
 * "About the Federation" (KKF staff): the content of the fan site's /federation page — mission &
 * history, leadership, contact, how to register, rules & documents — in English and Khmer.
 * Officers edit the draft; only a Super Admin publishes it. Empty sections are hidden on the site.
 * API: /api/federation (see claude/features/about-federation.md).
 */
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { ArrowDown, ArrowUp, ExternalLink, Eye, FileText, Landmark, Plus, RotateCcw, Save, Trash2, Upload, User as UserIcon } from "lucide-react";
import { api } from "../utils/api";
import { type Lang, formatDay, khmerDigits, useT } from "../i18n/program";

type Leader = { nameEn: string; nameKm: string; roleEn: string; roleKm: string; photoUrl: string };
type Doc = { titleEn: string; titleKm: string; fileUrl: string; fileName?: string };
type Form = {
  missionEn: string; missionKm: string; historyEn: string; historyKm: string; foundedYear: string;
  leaders: Leader[];
  addressEn: string; addressKm: string; phone: string; email: string; officeHoursEn: string; officeHoursKm: string; mapUrl: string;
  registerEn: string; registerKm: string;
  documents: Doc[];
};
type View = {
  draft: Record<string, any>;
  published: Record<string, any> | null;
  changed: boolean;
  draftUpdatedAt: string | null;
  draftUpdatedBy: string | null;
  publishedAt: string | null;
  publishedBy: string | null;
};

const TEXT_KEYS = ["missionEn", "missionKm", "historyEn", "historyKm", "addressEn", "addressKm", "phone", "email", "officeHoursEn", "officeHoursKm", "mapUrl", "registerEn", "registerKm"] as const;
const MAX_PDF = 10 * 1024 * 1024;
const MAX_PHOTO = 2 * 1024 * 1024;

const s = (v: unknown) => (typeof v === "string" ? v : "");
function formOf(c: Record<string, any>): Form {
  const f = Object.fromEntries(TEXT_KEYS.map((k) => [k, s(c[k])])) as Record<(typeof TEXT_KEYS)[number], string>;
  return {
    ...f,
    foundedYear: c.foundedYear ? String(c.foundedYear) : "",
    leaders: (c.leaders ?? []).map((l: any) => ({ nameEn: s(l.nameEn), nameKm: s(l.nameKm), roleEn: s(l.roleEn), roleKm: s(l.roleKm), photoUrl: s(l.photoUrl) })),
    documents: (c.documents ?? []).map((d: any) => ({ titleEn: s(d.titleEn), titleKm: s(d.titleKm), fileUrl: s(d.fileUrl) })),
  };
}
/** What the API gets: file names are for display only. */
const bodyOf = (f: Form) => ({ ...f, documents: f.documents.map(({ fileName: _n, ...d }) => d) });

/** The fan site's address, worked out from the admin's (dev :5175 → :5176, admin.<domain> → <domain>). */
function publicSite(): string {
  const { protocol, hostname, port } = window.location;
  if (port === "5175") return `${protocol}//${hostname}:5176`;
  return `${protocol}//${hostname.replace(/^admin\./, "")}`;
}

const pad = (n: number) => String(n).padStart(2, "0");
/** Date and time of a save or publish; in Khmer the Khmer date plus the time in Khmer digits. */
const when = (iso: string | null, ui: Lang) => {
  if (!iso) return "";
  const d = new Date(iso);
  if (ui !== "km" || isNaN(d.getTime())) return d.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
  return `${formatDay(`${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`, ui)} ${khmerDigits(`${pad(d.getHours())}:${pad(d.getMinutes())}`)}`;
};
const field = "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary";
const iconBtn = "w-9 h-9 rounded-lg border border-slate-200 bg-white text-slate-600 flex items-center justify-center hover:border-slate-300 disabled:opacity-40";

function readFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function move<T>(items: T[], i: number, by: -1 | 1): T[] {
  const j = i + by;
  if (j < 0 || j >= items.length) return items;
  const next = [...items];
  [next[i], next[j]] = [next[j], next[i]];
  return next;
}

export function FederationPage() {
  // `ui` is the language of the screen; `lang` below is which language's content is being edited.
  const { t, lang: ui } = useT();
  const me = api.auth.getCurrentUser();
  const isSuper = me?.role === "Super Admin";

  const [view, setView] = useState<View | null>(null);
  const [form, setForm] = useState<Form | null>(null);
  const [lang, setLang] = useState<"en" | "km">("en");
  const [busy, setBusy] = useState(false);

  const apply = (v: View) => {
    setView(v);
    setForm(formOf(v.draft));
  };

  useEffect(() => {
    api.federation
      .draft()
      .then(apply)
      .catch((e: unknown) => toast.error(e instanceof Error ? e.message : t("fed.loadError")));
  }, []);

  const dirty = useMemo(() => !!view && !!form && JSON.stringify(bodyOf(form)) !== JSON.stringify(bodyOf(formOf(view.draft))), [view, form]);

  if (!view || !form) {
    return (
      <div className="max-w-5xl mx-auto rounded-2xl border border-slate-200 bg-white p-10 flex justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const set = <K extends keyof Form>(key: K, value: Form[K]) => setForm({ ...form, [key]: value });
  const km = lang === "km";
  const L = (en: keyof Form, kmKey: keyof Form) => (km ? kmKey : en);

  const run = async (action: () => Promise<View>, message: string) => {
    setBusy(true);
    try {
      apply(await action());
      toast.success(message);
      return true;
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("fed.error"));
      return false;
    } finally {
      setBusy(false);
    }
  };

  const save = () => run(() => api.federation.save(bodyOf(form)), t("fed.saved"));
  const publish = async () => {
    // Publish exactly what's on screen: save first when there are unsaved edits.
    if (dirty && !(await save())) return;
    if (!confirm(t("fed.publishConfirm"))) return;
    run(() => api.federation.publish(), t("fed.published"));
  };
  const discard = () => {
    if (!confirm(t("fed.discardConfirm"))) return;
    run(() => api.federation.discard(), t("fed.discarded"));
  };

  const langTabs = (
    <div className="flex gap-2" role="tablist" aria-label={t("fed.language")}>
      {(["en", "km"] as const).map((l) => (
        <button key={l} type="button" role="tab" aria-selected={lang === l} onClick={() => setLang(l)} className={`h-10 px-4 rounded-xl text-sm font-medium border transition ${lang === l ? "bg-primary text-white border-primary" : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"}`}>
          {t(l === "en" ? "fed.tabEn" : "fed.tabKm")}
        </button>
      ))}
    </div>
  );

  const text = (label: string, key: keyof Form, opts: { rows?: number; max?: number; placeholder?: string; khmer?: boolean; type?: string } = {}) => (
    <label className="block">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      {opts.rows ? (
        <textarea rows={opts.rows} maxLength={opts.max} lang={opts.khmer ? "km" : undefined} className={`${field} mt-1 leading-relaxed`} value={form[key] as string} placeholder={opts.placeholder} onChange={(e) => set(key, e.target.value as never)} />
      ) : (
        <input type={opts.type ?? "text"} maxLength={opts.max ?? 300} lang={opts.khmer ? "km" : undefined} className={`${field} mt-1`} value={form[key] as string} placeholder={opts.placeholder} onChange={(e) => set(key, e.target.value as never)} />
      )}
    </label>
  );

  const setLeader = (i: number, patch: Partial<Leader>) => set("leaders", form.leaders.map((l, j) => (j === i ? { ...l, ...patch } : l)));
  const setDoc = (i: number, patch: Partial<Doc>) => set("documents", form.documents.map((d, j) => (j === i ? { ...d, ...patch } : d)));

  const pickPhoto = async (i: number, file?: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) return toast.error(t("fed.needPicture"));
    if (file.size > MAX_PHOTO) return toast.error(t("fed.photoTooBig"));
    setLeader(i, { photoUrl: await readFile(file) });
  };
  const pickPdf = async (i: number, file?: File) => {
    if (!file) return;
    if (file.type !== "application/pdf") return toast.error(t("fed.needPdf"));
    if (file.size > MAX_PDF) return toast.error(t("fed.pdfTooBig"));
    const dataUrl = await readFile(file);
    setDoc(i, { fileUrl: dataUrl, fileName: file.name, titleEn: form.documents[i].titleEn || file.name.replace(/\.pdf$/i, "") });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 flex items-center gap-2">
            <Landmark className="w-7 h-7 text-primary" aria-hidden /> {t("menu.federation")}
          </h1>
          <p className="text-slate-600 mt-1 max-w-2xl">
            {t("fed.intro1")}<strong>{t("fed.intro2")}</strong>{t("fed.intro3")}
            {t(isSuper ? "fed.introSuper" : "fed.introOfficer")}
          </p>
          <p className="mt-2 text-sm text-slate-500 flex flex-wrap items-center gap-2">
            {view.publishedAt ? <span>{view.publishedBy ? t("fed.publishedAtBy", { when: when(view.publishedAt, ui), who: view.publishedBy }) : t("fed.publishedAt", { when: when(view.publishedAt, ui) })}</span> : <span>{t("fed.notPublished")}</span>}
            {(view.changed || dirty) && <span className="px-1.5 py-0.5 rounded text-xs font-semibold bg-amber-50 text-amber-800">{t(dirty ? "fed.unsaved" : "fed.draftPending")}</span>}
            {view.draftUpdatedAt && view.changed && !dirty && <span>{view.draftUpdatedBy ? t("fed.draftSavedBy", { when: when(view.draftUpdatedAt, ui), who: view.draftUpdatedBy }) : t("fed.draftSaved", { when: when(view.draftUpdatedAt, ui) })}</span>}
          </p>
        </div>
        {view.publishedAt && view.published && (
          <a href={`${publicSite()}/federation`} target="_blank" rel="noreferrer" className="h-10 px-4 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm font-semibold inline-flex items-center gap-2 hover:border-slate-300">
            <ExternalLink className="w-4 h-4" aria-hidden /> {t("fed.viewOnSite")}
          </a>
        )}
      </header>

      <div className="flex flex-wrap items-center justify-between gap-3">
        {langTabs}
        <p className="text-sm text-slate-500">{t(km ? "fed.noteKm" : "fed.noteEn")}</p>
      </div>

      <Card title={t("fed.s.mission")}>
        {text(t(km ? "fed.missionKm" : "fed.missionEn"), L("missionEn", "missionKm"), { rows: 3, max: 600, khmer: km, placeholder: km ? "" : t("fed.ph.mission") })}
        {text(t(km ? "fed.historyKm" : "fed.historyEn"), L("historyEn", "historyKm"), { rows: 10, max: 8000, khmer: km, placeholder: km ? "" : t("fed.ph.history") })}
        <label className="block max-w-[12rem]">
          <span className="text-sm font-medium text-slate-700">{t("fed.founded")}</span>
          <input type="number" min={1900} max={new Date().getFullYear()} className={`${field} mt-1`} value={form.foundedYear} onChange={(e) => set("foundedYear", e.target.value)} />
        </label>
      </Card>

      <Card title={t("fed.s.leadership")} hint={t("fed.leadershipHint")}>
        {form.leaders.length === 0 && <p className="text-sm text-slate-500">{t("fed.noLeaders")}</p>}
        <ul className="space-y-3">
          {form.leaders.map((l, i) => (
            <li key={i} className="rounded-xl border border-slate-200 p-3 flex flex-wrap items-start gap-3">
              <div className="flex flex-col items-center gap-1.5">
                <span className="w-16 h-16 rounded-full bg-slate-100 overflow-hidden flex items-center justify-center">
                  {l.photoUrl ? <img src={l.photoUrl} alt="" className="w-full h-full object-cover" /> : <UserIcon className="w-7 h-7 text-slate-400" aria-hidden />}
                </span>
                <label className="text-xs font-semibold text-primary cursor-pointer hover:underline">
                  {t(l.photoUrl ? "fed.changePhoto" : "fed.addPhoto")}
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => pickPhoto(i, e.target.files?.[0])} />
                </label>
                {l.photoUrl && <button type="button" onClick={() => setLeader(i, { photoUrl: "" })} className="text-xs text-slate-500 hover:text-red-700">{t("fed.remove")}</button>}
              </div>
              <div className="flex-1 min-w-[14rem] grid sm:grid-cols-2 gap-3">
                <label className="block">
                  <span className="text-sm font-medium text-slate-700">{t(km ? "fed.nameKm" : "fed.nameEn")}</span>
                  <input lang={km ? "km" : undefined} maxLength={300} className={`${field} mt-1`} value={km ? l.nameKm : l.nameEn} onChange={(e) => setLeader(i, km ? { nameKm: e.target.value } : { nameEn: e.target.value })} />
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-slate-700">{t(km ? "fed.roleKm" : "fed.roleEn")}</span>
                  <input lang={km ? "km" : undefined} maxLength={300} placeholder={km ? "" : t("fed.ph.role")} className={`${field} mt-1`} value={km ? l.roleKm : l.roleEn} onChange={(e) => setLeader(i, km ? { roleKm: e.target.value } : { roleEn: e.target.value })} />
                </label>
              </div>
              <ItemButtons i={i} count={form.leaders.length} onMove={(by) => set("leaders", move(form.leaders, i, by))} onRemove={() => set("leaders", form.leaders.filter((_, j) => j !== i))} />
            </li>
          ))}
        </ul>
        <AddButton onClick={() => set("leaders", [...form.leaders, { nameEn: "", nameKm: "", roleEn: "", roleKm: "", photoUrl: "" }])} label={t("fed.addPerson")} disabled={form.leaders.length >= 30} />
      </Card>

      <Card title={t("fed.s.contact")}>
        <div className="grid sm:grid-cols-2 gap-4">
          {text(t(km ? "fed.addressKm" : "fed.addressEn"), L("addressEn", "addressKm"), { khmer: km })}
          {text(t(km ? "fed.hoursKm" : "fed.hoursEn"), L("officeHoursEn", "officeHoursKm"), { khmer: km, placeholder: km ? "" : t("fed.ph.hours") })}
          {text(t("fed.phone"), "phone", { type: "tel" })}
          {text(t("fed.email"), "email", { type: "email", placeholder: "info@…" })}
        </div>
        {text(t("fed.map"), "mapUrl", { type: "url", max: 300 })}
      </Card>

      <Card title={t("fed.s.register")} hint={t("fed.registerHint")}>
        {text(t(km ? "fed.registerKm" : "fed.registerEn"), L("registerEn", "registerKm"), { rows: 8, max: 4000, khmer: km })}
      </Card>

      <Card title={t("fed.s.documents")} hint={t("fed.documentsHint")}>
        {form.documents.length === 0 && <p className="text-sm text-slate-500">{t("fed.noDocuments")}</p>}
        <ul className="space-y-3">
          {form.documents.map((d, i) => (
            <li key={i} className="rounded-xl border border-slate-200 p-3 flex flex-wrap items-start gap-3">
              <span className="w-10 h-10 rounded-lg bg-red-50 text-red-700 flex items-center justify-center shrink-0"><FileText className="w-5 h-5" aria-hidden /></span>
              <div className="flex-1 min-w-[14rem] space-y-2">
                <label className="block">
                  <span className="text-sm font-medium text-slate-700">{t(km ? "fed.titleKm" : "fed.titleEn")}</span>
                  <input lang={km ? "km" : undefined} maxLength={300} className={`${field} mt-1`} value={km ? d.titleKm : d.titleEn} onChange={(e) => setDoc(i, km ? { titleKm: e.target.value } : { titleEn: e.target.value })} />
                </label>
                <div className="flex flex-wrap items-center gap-3 text-sm">
                  {d.fileUrl ? (
                    d.fileUrl.startsWith("data:") ? (
                      <span className="text-slate-600">{t("fed.pdfPending", { name: d.fileName ?? t("fed.newPdf") })}</span>
                    ) : (
                      <a href={d.fileUrl} target="_blank" rel="noreferrer" className="text-primary font-semibold hover:underline inline-flex items-center gap-1">
                        <Eye className="w-4 h-4" aria-hidden /> {t("fed.openPdf")}
                      </a>
                    )
                  ) : (
                    <span className="text-amber-800">{t("fed.noFile")}</span>
                  )}
                  <label className="inline-flex items-center gap-1.5 text-primary font-semibold cursor-pointer hover:underline">
                    <Upload className="w-4 h-4" aria-hidden /> {t(d.fileUrl ? "fed.replacePdf" : "fed.choosePdf")}
                    <input type="file" accept="application/pdf" className="hidden" onChange={(e) => pickPdf(i, e.target.files?.[0])} />
                  </label>
                </div>
              </div>
              <ItemButtons i={i} count={form.documents.length} onMove={(by) => set("documents", move(form.documents, i, by))} onRemove={() => set("documents", form.documents.filter((_, j) => j !== i))} />
            </li>
          ))}
        </ul>
        <AddButton onClick={() => set("documents", [...form.documents, { titleEn: "", titleKm: "", fileUrl: "" }])} label={t("fed.addDocument")} disabled={form.documents.length >= 30} />
      </Card>

      {/* Actions stay in reach while scrolling a long form. */}
      <div className="sticky bottom-3 z-20 rounded-2xl border border-slate-200 bg-white/95 backdrop-blur shadow-lg">
        <div className="px-4 py-3 flex flex-wrap items-center justify-end gap-2">
          {view.changed && !dirty && (
            <button type="button" disabled={busy} onClick={discard} className="h-11 px-4 rounded-xl text-slate-700 text-sm font-semibold inline-flex items-center gap-2 hover:bg-slate-100 disabled:opacity-50 mr-auto">
              <RotateCcw className="w-4 h-4" aria-hidden /> {t("fed.discard")}
            </button>
          )}
          <button type="button" disabled={busy || !dirty} onClick={save} className="h-11 px-5 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm font-semibold inline-flex items-center gap-2 hover:border-slate-300 disabled:opacity-50">
            <Save className="w-4 h-4" aria-hidden /> {t("fed.saveDraft")}
          </button>
          {isSuper && (
            <button type="button" disabled={busy || (!dirty && !view.changed)} onClick={publish} className="h-11 px-5 rounded-xl bg-emerald-600 text-white text-sm font-semibold inline-flex items-center gap-2 hover:bg-emerald-700 disabled:opacity-50">
              <Eye className="w-4 h-4" aria-hidden /> {t(dirty ? "fed.savePublish" : "fed.publish")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Card({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
      <div>
        <h2 className="text-lg font-bold text-slate-900">{title}</h2>
        {hint && <p className="text-sm text-slate-500 mt-0.5">{hint}</p>}
      </div>
      {children}
    </section>
  );
}

function ItemButtons({ i, count, onMove, onRemove }: { i: number; count: number; onMove: (by: -1 | 1) => void; onRemove: () => void }) {
  const { t } = useT();
  return (
    <div className="flex gap-1.5">
      <button type="button" className={iconBtn} disabled={i === 0} onClick={() => onMove(-1)} aria-label={t("fed.moveUp")}><ArrowUp className="w-4 h-4" aria-hidden /></button>
      <button type="button" className={iconBtn} disabled={i === count - 1} onClick={() => onMove(1)} aria-label={t("fed.moveDown")}><ArrowDown className="w-4 h-4" aria-hidden /></button>
      <button type="button" className={`${iconBtn} hover:text-red-700`} onClick={onRemove} aria-label={t("fed.remove")}><Trash2 className="w-4 h-4" aria-hidden /></button>
    </div>
  );
}

function AddButton({ onClick, label, disabled }: { onClick: () => void; label: string; disabled?: boolean }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled} className="h-10 px-4 rounded-xl border border-dashed border-slate-300 text-sm font-semibold text-primary inline-flex items-center gap-2 hover:border-primary disabled:opacity-50">
      <Plus className="w-4 h-4" aria-hidden /> {label}
    </button>
  );
}
