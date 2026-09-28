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

const BASE = "/home/strategic-partners/organizations";
const TYPES = ["Promotion", "Sanctioning body", "Federation", "Other"];

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
      toast.error("Failed to load international partners");
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
        toast.success("International partner updated.");
      } else {
        await api.settings.createPartnerOrganization(body);
        toast.success("International partner added.");
      }
      await load();
      navigate(BASE);
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Failed to save the international partner");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (o: Org) => {
    if (!confirm(`Delete ${o.name}? This cannot be undone.`)) return;
    try {
      await api.settings.deletePartnerOrganization(o.id);
      toast.success("International partner deleted.");
      load();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete the international partner");
    }
  };

  if (isForm) {
    return (
      <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6 animate-fadeIn">
        <header className="flex items-center gap-4">
          <Link to={BASE} className="p-2.5 bg-white hover:bg-muted text-primary border border-border/80 rounded-xl shadow-sm" aria-label="Back">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">{orgId ? "Edit International Partner" : "Add International Partner"}</h1>
            <p className="text-sm text-muted-foreground mt-1">Promotions and sanctioning bodies KKF works with, e.g. K-1, WKN, Kombat.</p>
          </div>
        </header>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="card-premium space-y-4">
              <h2 className="text-base font-bold text-foreground">Organisation</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Field label="Name" required className="md:col-span-2">
                  <input required value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. World Kickboxing Network" className="input-premium font-semibold text-slate-800" />
                </Field>
                <Field label="Short name">
                  <input value={form.shortName} onChange={(e) => set("shortName", e.target.value)} placeholder="e.g. WKN" maxLength={50} className="input-premium font-semibold text-slate-800" />
                </Field>
                <Field label="Type">
                  <select value={form.orgType} onChange={(e) => set("orgType", e.target.value)} className="input-premium font-semibold text-slate-800 cursor-pointer">
                    {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </Field>
                <Field label="Country">
                  <input value={form.country} onChange={(e) => set("country", e.target.value)} placeholder="e.g. Japan" maxLength={100} className="input-premium font-semibold text-slate-800" />
                </Field>
                <Field label="Partner since (year)">
                  <input type="number" min={1900} max={2100} value={form.partnerSince} onChange={(e) => set("partnerSince", e.target.value)} placeholder="e.g. 2024" className="input-premium font-semibold text-slate-800" />
                </Field>
                <Field label="Website" className="md:col-span-3">
                  <input type="url" value={form.websiteUrl} onChange={(e) => set("websiteUrl", e.target.value)} placeholder="https://" className="input-premium font-semibold text-slate-800" />
                </Field>
              </div>
            </div>

            <div className="card-premium space-y-4">
              <h2 className="text-base font-bold text-foreground">About the partnership</h2>
              <Field label="Description (English)">
                <textarea rows={4} value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Who they are and how they work with KKF" className="input-premium text-slate-800" />
              </Field>
              <Field label="Description (Khmer)">
                <textarea rows={4} lang="km" value={form.descriptionKm} onChange={(e) => set("descriptionKm", e.target.value)} className="input-premium text-slate-800" />
              </Field>
            </div>

            <div className="card-premium">
              <h2 className="text-base font-bold text-foreground mb-4 flex items-center gap-2"><Upload className="w-5 h-5 text-primary" /> Logo and banner</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ImageInput label="Logo" hint="PNG, JPG (max. 1 MB)" value={form.logoUrl} onChange={(v) => set("logoUrl", v)} contain />
                <ImageInput label="Banner / cover image" hint="PNG, JPG (max. 2 MB), wide" value={form.image} onChange={(v) => set("image", v)} />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="card-premium space-y-4">
              <h3 className="text-sm font-bold text-foreground">Public listing</h3>
              <Field label="Status">
                <select value={form.active ? "active" : "inactive"} onChange={(e) => set("active", e.target.value === "active")} className="input-premium font-semibold text-slate-800 cursor-pointer">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
                <span className="block text-[11px] text-muted-foreground mt-1.5">Only active partners appear on the website.</span>
              </Field>
              <Field label="Order (lower first)">
                <input type="number" step={1} value={form.sortOrder} onChange={(e) => set("sortOrder", e.target.value)} className="input-premium font-semibold text-slate-800" />
              </Field>
            </div>
            <div className="bg-white rounded-xl border border-border p-4 shadow-sm flex flex-col gap-3">
              <button type="submit" disabled={saving} className="btn-primary w-full py-3 flex items-center justify-center gap-1.5 disabled:opacity-60">
                <Save className="w-4 h-4" /> {orgId ? "Update Partner" : "Save Partner"}
              </button>
              <Link to={BASE} className="btn-outline w-full py-3 text-center">Cancel</Link>
            </div>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fadeIn">
      <div className="bg-gradient-to-r from-[#0A3D91] to-[#082E6E] text-white p-6 rounded-2xl border-b-4 border-b-[#F2C94C] shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black uppercase tracking-wider flex items-center gap-2.5 text-[#F2C94C]">
              <Flag className="w-6 h-6" /> International Partners
            </h2>
            <p className="text-xs text-white/80 mt-2 max-w-2xl leading-relaxed font-semibold">
              Promotions and sanctioning bodies KKF works with (K-1, WKN, Kombat …). Active partners appear on the website's Partners page and in the home page partner strip.
            </p>
          </div>
          <Link to={`${BASE}/new`} className="px-4 py-2 bg-[#F2C94C] hover:bg-[#d8b340] text-slate-900 rounded-xl font-extrabold text-xs uppercase tracking-widest shadow-md flex items-center gap-1.5 shrink-0">
            <Plus className="w-4 h-4" /> Add Partner
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
          <p className="text-slate-600 font-bold text-sm">No international partners yet</p>
          <p className="text-xs text-muted-foreground mt-1">Add K-1, WKN, Kombat and others with their official logo, banner and description.</p>
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
                  {o.active ? "Active" : "Inactive"}
                </span>
              </div>
              <div className="p-5 flex-1 flex flex-col gap-2">
                <h3 className="text-base font-bold text-foreground leading-tight">
                  {o.name}
                  {o.short_name && <span className="ml-2 text-xs font-bold text-primary">{o.short_name}</span>}
                </h3>
                <p className="text-xs text-slate-600">{[o.org_type, o.country, o.partner_since ? `since ${o.partner_since}` : null].filter(Boolean).join(" · ")}</p>
                {o.website_url && (
                  <a href={o.website_url} target="_blank" rel="noopener noreferrer" className="text-xs text-slate-500 hover:text-[#0A3D91] hover:underline inline-flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5" /> {o.website_url.replace(/^https?:\/\/(www\.)?/, "")}
                  </a>
                )}
                <p className="text-[11px] text-muted-foreground">
                  Order {o.sort_order} · {o.description ? "English text" : "No English text"} · {o.description_km ? "Khmer text" : "No Khmer text"}
                </p>
                <div className="mt-auto pt-3 flex gap-2">
                  <button type="button" onClick={() => navigate(`${BASE}/${o.id}/edit`)} className="btn-outline flex-1 py-2 flex items-center justify-center gap-1.5 text-xs font-bold uppercase tracking-wider">
                    <Edit className="w-3.5 h-3.5" /> Edit
                  </button>
                  {canDelete && (
                    <button type="button" onClick={() => handleDelete(o)} className="px-3 py-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50" aria-label={`Delete ${o.name}`}>
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

function ImageInput({ label, hint, value, onChange, contain = false }: { label: string; hint: string; value: string; onChange: (v: string) => void; contain?: boolean }) {
  return (
    <div className="space-y-3">
      <span className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">{label}</span>
      <label className="flex flex-col items-center justify-center w-full h-28 border border-border/80 border-dashed rounded-xl cursor-pointer bg-muted/10 hover:bg-muted/20">
        <Upload className="w-6 h-6 text-muted-foreground mb-1" />
        <span className="text-xs font-semibold text-primary">Upload {label.toLowerCase()}</span>
        <span className="text-[9px] text-muted-foreground mt-0.5">{hint}</span>
        <input type="file" className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && readFile(e.target.files[0], onChange)} />
      </label>
      {value && (
        <div className={`relative ${contain ? "w-20 h-20" : "w-full h-20"} rounded-xl overflow-hidden border border-border bg-slate-50`}>
          <img src={value} alt="" className={`w-full h-full ${contain ? "object-contain" : "object-cover"}`} />
          <button type="button" onClick={() => onChange("")} className="absolute top-1 right-1 p-1 bg-red-500 hover:bg-red-600 text-white rounded-full" aria-label={`Remove ${label.toLowerCase()}`}>
            <X className="w-2.5 h-2.5" />
          </button>
        </div>
      )}
    </div>
  );
}
