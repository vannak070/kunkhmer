/**
 * International partners (K-1, WKN, Kombat …): promotions and sanctioning bodies KKF works with.
 * List at /home/strategic-partners/organizations, form at …/new and …/:orgId/edit.
 * KKF staff create and edit; only a Super Admin deletes. See claude/features/international-partners.md.
 */
import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams, useLocation } from "react-router";
import { ArrowLeft, Edit, Globe, Plus, Save, Trash2, Upload, X, Flag } from "lucide-react";
import { toast } from "sonner";
import { api } from "../utils/api";
import { usePermissions } from "../hooks/usePermissions";
import { type TextKey, useT } from "../i18n/program";

const BASE = "/home/strategic-partners/organizations";
const TYPES = ["Promotion", "Sanctioning body", "Federation", "Other"];
/** Type names as shown; the stored value stays the English one. */
const TYPE_TEXT: Record<string, TextKey> = {
  Promotion: "org.type.Promotion",
  "Sanctioning body": "org.type.Sanctioning body",
  Federation: "org.type.Federation",
  Other: "org.type.Other",
};

interface Org {
  id: string;
  name: string;
  short_name: string | null;
  org_type: string;
  country: string | null;
  logo_url: string | null;
  image: string | null;
  description: string | null;
  description_km: string | null;
  partner_since: number | null;
  website_url: string | null;
  active: boolean;
  sort_order: number;
}

const EMPTY = {
  name: "",
  shortName: "",
  orgType: "Promotion",
  country: "",
  logoUrl: "",
  image: "",
  description: "",
  descriptionKm: "",
  partnerSince: "",
  websiteUrl: "",
  active: true,
  sortOrder: "0",
};

type Form = typeof EMPTY;

function readFile(file: File, done: (url: string) => void) {
  const reader = new FileReader();
  reader.onloadend = () => done(reader.result as string);
  reader.readAsDataURL(file);
}

export function PartnerOrganizations() {
  const { t, lang } = useT();
  // Khmer script: `km-text` (styles/theme.css) removes letter spacing and enlarges the tiny labels.
  const km = lang === "km" ? " km-text" : "";
  const typeLabel = (v: string) => (TYPE_TEXT[v] ? t(TYPE_TEXT[v]) : v);
  const { orgId } = useParams<{ orgId?: string }>();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const permissions = usePermissions();
  const isForm = pathname.endsWith("/new") || pathname.endsWith("/edit");
  const canDelete = permissions.isSuperAdmin();

  const [orgs, setOrgs] = useState<Org[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<Form>(EMPTY);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      setOrgs((await api.settings.listPartnerOrganizations()) || []);
    } catch (err) {
      console.error(err);
      toast.error(t("org.loadError"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    const o = orgId ? orgs.find((x) => x.id === orgId) : null;
    setForm(
      o
        ? {
            name: o.name,
            shortName: o.short_name ?? "",
            orgType: o.org_type || "Promotion",
            country: o.country ?? "",
            logoUrl: o.logo_url ?? "",
            image: o.image ?? "",
            description: o.description ?? "",
            descriptionKm: o.description_km ?? "",
            partnerSince: o.partner_since != null ? String(o.partner_since) : "",
            websiteUrl: o.website_url ?? "",
            active: o.active !== false,
            sortOrder: String(o.sort_order ?? 0),
          }
        : EMPTY,
    );
  }, [orgId, orgs]);

  const set = <K extends keyof Form>(key: K, value: Form[K]) => setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    // Empty strings clear a field on the API.
    const body = { ...form, sortOrder: form.sortOrder.trim() || "0" };
    setSaving(true);
    try {
      if (orgId) {
        await api.settings.updatePartnerOrganization(orgId, body);
        toast.success(t("org.updated"));
      } else {
        await api.settings.createPartnerOrganization(body);
        toast.success(t("org.added"));
      }
      await load();
      navigate(BASE);
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || t("org.saveError"));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (o: Org) => {
    if (!confirm(t("org.deleteConfirm", { name: o.name }))) return;
    try {
      await api.settings.deletePartnerOrganization(o.id);
      toast.success(t("org.deleted"));
      load();
    } catch (err) {
      console.error(err);
      toast.error(t("org.deleteError"));
    }
  };

  if (isForm) {
    return (
      <div className={`p-4 md:p-8 max-w-4xl mx-auto space-y-6 animate-fadeIn${km}`}>
        <header className="flex items-center gap-4">
          <Link to={BASE} className="p-2.5 bg-white hover:bg-muted text-primary border border-border/80 rounded-xl shadow-sm" aria-label={t("common.back")}>
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">{t(orgId ? "org.editTitle" : "org.addTitle")}</h1>
            <p className="text-sm text-muted-foreground mt-1">{t("org.formHint")}</p>
          </div>
        </header>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="card-premium space-y-4">
              <h2 className="text-base font-bold text-foreground">{t("org.section")}</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Field label={t("org.name")} required className="md:col-span-2">
                  <input required value={form.name} onChange={(e) => set("name", e.target.value)} placeholder={t("org.ph.name")} className="input-premium font-semibold text-slate-800" />
                </Field>
                <Field label={t("org.shortName")}>
                  <input value={form.shortName} onChange={(e) => set("shortName", e.target.value)} placeholder={t("org.ph.shortName")} maxLength={50} className="input-premium font-semibold text-slate-800" />
                </Field>
                <Field label={t("org.type")}>
                  <select value={form.orgType} onChange={(e) => set("orgType", e.target.value)} className="input-premium font-semibold text-slate-800 cursor-pointer">
                    {TYPES.map((x) => <option key={x} value={x}>{typeLabel(x)}</option>)}
                  </select>
                </Field>
                <Field label={t("org.country")}>
                  <input value={form.country} onChange={(e) => set("country", e.target.value)} placeholder={t("org.ph.country")} maxLength={100} className="input-premium font-semibold text-slate-800" />
                </Field>
                <Field label={t("org.since")}>
                  <input type="number" min={1900} max={2100} value={form.partnerSince} onChange={(e) => set("partnerSince", e.target.value)} placeholder={t("org.ph.since")} className="input-premium font-semibold text-slate-800" />
                </Field>
                <Field label={t("org.website")} className="md:col-span-3">
                  <input type="url" value={form.websiteUrl} onChange={(e) => set("websiteUrl", e.target.value)} placeholder="https://" className="input-premium font-semibold text-slate-800" />
                </Field>
              </div>
            </div>

            <div className="card-premium space-y-4">
              <h2 className="text-base font-bold text-foreground">{t("org.about")}</h2>
              <Field label={t("org.descEn")}>
                <textarea rows={4} value={form.description} onChange={(e) => set("description", e.target.value)} placeholder={t("org.ph.desc")} className="input-premium text-slate-800" />
              </Field>
              <Field label={t("org.descKm")}>
                <textarea rows={4} lang="km" value={form.descriptionKm} onChange={(e) => set("descriptionKm", e.target.value)} className="input-premium text-slate-800" />
              </Field>
            </div>

            <div className="card-premium">
              <h2 className="text-base font-bold text-foreground mb-4 flex items-center gap-2"><Upload className="w-5 h-5 text-primary" /> {t("org.images")}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ImageInput label={t("org.logo")} upload={t("org.uploadLogo")} remove={t("org.removeLogo")} hint={t("org.logoHint")} value={form.logoUrl} onChange={(v) => set("logoUrl", v)} contain />
                <ImageInput label={t("org.banner")} upload={t("org.uploadBanner")} remove={t("org.removeBanner")} hint={t("org.bannerHint")} value={form.image} onChange={(v) => set("image", v)} />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="card-premium space-y-4">
              <h3 className="text-sm font-bold text-foreground">{t("org.listing")}</h3>
              <Field label={t("org.status")}>
                <select value={form.active ? "active" : "inactive"} onChange={(e) => set("active", e.target.value === "active")} className="input-premium font-semibold text-slate-800 cursor-pointer">
                  <option value="active">{t("par.active")}</option>
                  <option value="inactive">{t("par.inactive")}</option>
                </select>
                <span className="block text-[11px] text-muted-foreground mt-1.5">{t("org.statusHint")}</span>
              </Field>
              <Field label={t("org.order")}>
                <input type="number" step={1} value={form.sortOrder} onChange={(e) => set("sortOrder", e.target.value)} className="input-premium font-semibold text-slate-800" />
              </Field>
            </div>
            <div className="bg-white rounded-xl border border-border p-4 shadow-sm flex flex-col gap-3">
              <button type="submit" disabled={saving} className="btn-primary w-full py-3 flex items-center justify-center gap-1.5 disabled:opacity-60">
                <Save className="w-4 h-4" /> {t(orgId ? "par.update" : "par.save")}
              </button>
              <Link to={BASE} className="btn-outline w-full py-3 text-center">{t("common.cancel")}</Link>
            </div>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className={`max-w-7xl mx-auto space-y-6 animate-fadeIn${km}`}>
      <div className="bg-gradient-to-r from-[#0A3D91] to-[#082E6E] text-white p-6 rounded-2xl border-b-4 border-b-[#F2C94C] shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black uppercase tracking-wider flex items-center gap-2.5 text-[#F2C94C]">
              <Flag className="w-6 h-6" /> {t("org.heading")}
            </h2>
            <p className="text-xs text-white/80 mt-2 max-w-2xl leading-relaxed font-semibold">
              {t("org.intro")}
            </p>
          </div>
          <Link to={`${BASE}/new`} className="px-4 py-2 bg-[#F2C94C] hover:bg-[#d8b340] text-slate-900 rounded-xl font-extrabold text-xs uppercase tracking-widest shadow-md flex items-center gap-1.5 shrink-0">
            <Plus className="w-4 h-4" /> {t("org.add")}
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-16 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : orgs.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center">
          <Flag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-600 font-bold text-sm">{t("org.emptyTitle")}</p>
          <p className="text-xs text-muted-foreground mt-1">{t("org.emptyText")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {orgs.map((o) => (
            <div key={o.id} className="bg-white rounded-2xl border border-border/75 overflow-hidden shadow-sm flex flex-col">
              <div className="relative h-36 bg-gradient-to-br from-[#eef3fb] to-[#fdf1f3] flex items-center justify-center">
                {o.image ? (
                  <img src={o.image} alt="" className="absolute inset-0 w-full h-full object-cover" />
                ) : o.logo_url ? (
                  <img src={o.logo_url} alt="" className="w-20 h-20 object-contain bg-white rounded-2xl p-1" />
                ) : (
                  <span className="text-3xl font-black text-[#0A3D91]/30">{(o.short_name || o.name).slice(0, 4)}</span>
                )}
                {o.image && o.logo_url && <img src={o.logo_url} alt="" className="absolute bottom-3 left-3 w-12 h-12 object-contain bg-white rounded-xl p-0.5 shadow" />}
                <span className={`absolute top-3 right-3 badge-premium ${o.active ? "badge-emerald" : "badge-red"}`}>
                  <span className={`badge-dot ${o.active ? "bg-emerald-500" : "bg-red-500"}`} />
                  {t(o.active ? "par.active" : "par.inactive")}
                </span>
              </div>
              <div className="p-5 flex-1 flex flex-col gap-2">
                <h3 className="text-base font-bold text-foreground leading-tight">
                  {o.name}
                  {o.short_name && <span className="ml-2 text-xs font-bold text-primary">{o.short_name}</span>}
                </h3>
                <p className="text-xs text-slate-600">{[typeLabel(o.org_type), o.country, o.partner_since ? t("org.sinceYear", { year: o.partner_since }) : null].filter(Boolean).join(" · ")}</p>
                {o.website_url && (
                  <a href={o.website_url} target="_blank" rel="noopener noreferrer" className="text-xs text-slate-500 hover:text-[#0A3D91] hover:underline inline-flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5" /> {o.website_url.replace(/^https?:\/\/(www\.)?/, "")}
                  </a>
                )}
                <p className="text-[11px] text-muted-foreground">
                  {t("org.orderN", { n: o.sort_order })} · {t(o.description ? "org.hasEn" : "org.noEn")} · {t(o.description_km ? "org.hasKm" : "org.noKm")}
                </p>
                <div className="mt-auto pt-3 flex gap-2">
                  <button type="button" onClick={() => navigate(`${BASE}/${o.id}/edit`)} className="btn-outline flex-1 py-2 flex items-center justify-center gap-1.5 text-xs font-bold uppercase tracking-wider">
                    <Edit className="w-3.5 h-3.5" /> {t("common.edit")}
                  </button>
                  {canDelete && (
                    <button type="button" onClick={() => handleDelete(o)} className="px-3 py-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50" aria-label={t("org.deleteName", { name: o.name })}>
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Field({ label, required, className = "", children }: { label: string; required?: boolean; className?: string; children: React.ReactNode }) {
  return (
    <label className={`block ${className}`}>
      <span className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
        {label} {required && <span className="text-[#C8102E]">*</span>}
      </span>
      {children}
    </label>
  );
}

function ImageInput({ label, upload, remove, hint, value, onChange, contain = false }: { label: string; upload: string; remove: string; hint: string; value: string; onChange: (v: string) => void; contain?: boolean }) {
  return (
    <div className="space-y-3">
      <span className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">{label}</span>
      <label className="flex flex-col items-center justify-center w-full h-28 border border-border/80 border-dashed rounded-xl cursor-pointer bg-muted/10 hover:bg-muted/20">
        <Upload className="w-6 h-6 text-muted-foreground mb-1" />
        <span className="text-xs font-semibold text-primary">{upload}</span>
        <span className="text-[9px] text-muted-foreground mt-0.5">{hint}</span>
        <input type="file" className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && readFile(e.target.files[0], onChange)} />
      </label>
      {value && (
        <div className={`relative ${contain ? "w-20 h-20" : "w-full h-20"} rounded-xl overflow-hidden border border-border bg-slate-50`}>
          <img src={value} alt="" className={`w-full h-full ${contain ? "object-contain" : "object-cover"}`} />
          <button type="button" onClick={() => onChange("")} className="absolute top-1 right-1 p-1 bg-red-500 hover:bg-red-600 text-white rounded-full" aria-label={remove}>
            <X className="w-2.5 h-2.5" />
          </button>
        </div>
      )}
    </div>
  );
}
