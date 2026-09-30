/**
 * Register / edit a fighter (/home/fighters/kunkhmer/new, /home/fighters/foreigner/new, /home/fighters/:id/edit,
 * ?clubId= presets the club). One short form with only the fields the system saves (owner, 2026-09-30:
 * "remove them all" — no ID, contact, medical or declaration fields): photo, names, nationality, gender,
 * date of birth, club, weight, height, record, grade, fighting styles, province, nickname; status when editing.
 * The Khmer name is required for Cambodian fighters, optional for foreign fighters. A fighter KKF staff register
 * is active at once (approvals off). English + Khmer. See claude/updates/admin-fighters-clubs.md.
 */
import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate, useParams, useSearchParams } from "react-router";
import { toast } from "sonner";
import { ArrowLeft, ImagePlus, UserPlus } from "lucide-react";
import { api } from "../utils/api";
import { useT } from "../i18n/program";
import { LangSwitch } from "../components/program/shared";
import { fieldCls } from "../components/program/FightNightFields";
import { FIGHTER_STATUSES, FIGHTING_STYLES, NATIONALITIES, isRealPhoto, isUnverified, nationalityLabel, recordParts } from "../components/fighters/fighterUtils";

const PROVINCES = [
  "Phnom Penh", "Banteay Meanchey", "Battambang", "Kampong Cham", "Kampong Chhnang", "Kampong Speu", "Kampong Thom", "Kampot",
  "Kandal", "Kep", "Koh Kong", "Kratie", "Mondulkiri", "Oddar Meanchey", "Pailin", "Preah Sihanouk", "Preah Vihear", "Prey Veng",
  "Pursat", "Ratanakiri", "Siem Reap", "Stung Treng", "Svay Rieng", "Takeo", "Tbong Khmum",
];

interface Form {
  name: string; nameKhmer: string; alias: string; nationality: string; gender: string; dateOfBirth: string;
  clubId: string; currentWeight: string; height: string; wins: string; losses: string; draws: string;
  grade: string; styles: string[]; province: string; image: string; status: string;
}

const empty = (foreign: boolean, clubId: string): Form => ({
  name: "", nameKhmer: "", alias: "", nationality: foreign ? "" : "Cambodian", gender: "Male", dateOfBirth: "",
  clubId, currentWeight: "", height: "", wins: "0", losses: "0", draws: "0", grade: "C", styles: [], province: "", image: "", status: "Active",
});

export function AddFighter() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { t, lang } = useT();
  const editing = Boolean(id);
  const foreignRoute = location.pathname.includes("/foreigner/");
  const [form, setForm] = useState<Form>(() => empty(foreignRoute, params.get("clubId") ?? ""));
  const [clubs, setClubs] = useState<any[]>([]);
  const [loaded, setLoaded] = useState(!editing);
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const file = useRef<HTMLInputElement>(null);
  const me = api.auth.getCurrentUser();
  const isStaff = me?.role === "Super Admin" || me?.role === "KKF Officer";

  useEffect(() => {
    api.clubs.list().then((c: any[]) => setClubs((c || []).filter((x) => x.status !== "inactive").sort((a, b) => a.name.localeCompare(b.name)))).catch(() => {});
    if (!editing) return;
    api.fighters.get(id!).then((f: any) => {
      const r = recordParts(f.record) ?? [0, 0, 0];
      setForm({
        name: f.name ?? "", nameKhmer: f.nameKhmer ?? "", alias: f.alias ?? "", nationality: f.nationality ?? "Cambodian", gender: f.gender ?? "Male",
        dateOfBirth: String(f.dateOfBirth ?? "").slice(0, 10), clubId: f.clubId ?? "", currentWeight: f.currentWeight ? String(f.currentWeight) : "",
        height: Number(f.height) > 0 ? String(f.height) : "", wins: String(r[0]), losses: String(r[1]), draws: String(r[2]), grade: f.grade ?? "C",
        styles: String(f.style ?? "").split(",").map((s: string) => s.trim().toLowerCase()).filter(Boolean), province: f.province ?? "",
        image: f.image ?? "", status: isUnverified(f.status) ? "Draft" : f.status ?? "Active",
      });
      setLoaded(true);
    }).catch(() => { toast.error(t("fp.loadFailed")); setLoaded(true); });
  }, [id]);

  const set = (patch: Partial<Form>) => setForm((f) => ({ ...f, ...patch }));
  const foreign = form.nationality !== "Cambodian";
  const back = editing ? `/home/fighters/${id}` : params.get("clubId") ? `/home/clubs/${params.get("clubId")}` : "/home/fighters";

  const pickImage = (f?: File) => {
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) { toast.error(t("ff.photoTooBig")); return; }
    const reader = new FileReader();
    reader.onloadend = () => set({ image: reader.result as string });
    reader.readAsDataURL(f);
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = t("ff.required");
    if (!foreign && !form.nameKhmer.trim()) e.nameKhmer = t("ff.khmerRequired");
    if (!form.nationality) e.nationality = t("ff.required");
    if (!form.dateOfBirth) e.dateOfBirth = t("ff.required");
    const kg = Number(form.currentWeight);
    if (!(kg >= 20 && kg <= 200)) e.currentWeight = t("ff.weightRange");
    const cm = Number(form.height);
    if (!(cm >= 100 && cm <= 250)) e.height = t("ff.heightRange");
    for (const k of ["wins", "losses", "draws"] as const) if (!/^\d+$/.test(form[k].trim())) e.record = t("ff.recordNumbers");
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const save = async () => {
    if (!validate()) { toast.error(t("ff.fix")); return; }
    setBusy(true);
    const body: Record<string, unknown> = {
      name: form.name.trim(),
      nameKhmer: form.nameKhmer.trim(),
      alias: form.alias.trim(),
      nationality: form.nationality,
      gender: form.gender,
      dateOfBirth: form.dateOfBirth,
      clubId: form.clubId || null,
      currentWeight: Number(form.currentWeight),
      height: Number(form.height),
      record: `${Number(form.wins)}-${Number(form.losses)}-${Number(form.draws)}`,
      grade: form.grade,
      style: form.styles.join(", "),
      province: form.province.trim(),
      image: form.image || null,
      // A new fighter's status is set by the server (active at once for KKF staff); staff change it when editing.
      ...(editing && isStaff ? { status: form.status } : {}),
    };
    try {
      const saved = editing ? await api.fighters.update(id!, body) : await api.fighters.create(body);
      toast.success(editing ? t("ff.saved") : isUnverified(saved?.status) ? t("ff.createdDraft") : t("ff.created", { name: saved?.name ?? form.name }));
      navigate(`/home/fighters/${saved?.id ?? id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("common.error"));
      setBusy(false);
    }
  };

  if (!loaded) return <div className="p-10 flex justify-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" aria-label={t("common.loading")} /></div>;

  const label = (text: string, required = false) => <span className="text-sm font-semibold text-slate-800">{text}{required && " *"}</span>;
  const err = (k: string) => errors[k] ? <span className="block text-sm text-red-700 mt-1">{errors[k]}</span> : null;

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-8 space-y-6">
      <div className="flex items-center justify-between gap-3">
        <Link to={back} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-primary">
          <ArrowLeft className="w-4 h-4" aria-hidden /> {t("common.back")}
        </Link>
        <LangSwitch />
      </div>

      <header className="flex items-start gap-3">
        <span className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0" aria-hidden><UserPlus className="w-6 h-6" /></span>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">{editing ? t("ff.editTitle") : t("f.register")}</h1>
          <p className="text-base text-slate-600 mt-1">{editing ? t("ff.editLead") : t("ff.lead")}</p>
        </div>
      </header>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 md:p-7 space-y-6 shadow-sm">
        {/* Photo */}
        <div className="flex items-center gap-4">
          {isRealPhoto(form.image) ? <img src={form.image} alt="" className="w-24 h-24 rounded-2xl object-cover object-top bg-slate-100" /> : <span className="w-24 h-24 rounded-2xl bg-slate-100 inline-flex items-center justify-center text-slate-400"><ImagePlus className="w-7 h-7" aria-hidden /></span>}
          <div className="space-y-2">
            {label(t("ff.photo"))}
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => file.current?.click()} className="h-10 px-4 rounded-lg border border-slate-300 text-sm font-semibold text-slate-700 hover:border-primary">{form.image ? t("common.change") : t("ff.addPhoto")}</button>
              {form.image && <button type="button" onClick={() => set({ image: "" })} className="h-10 px-3 text-sm text-slate-500 hover:text-red-700">{t("form.removePoster")}</button>}
            </div>
            <p className="text-xs text-slate-500">{t("ff.photoHint")}</p>
            <input ref={file} type="file" accept="image/*" className="hidden" onChange={(e) => pickImage(e.target.files?.[0])} />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-5">
          <label className="block">{label(t("ff.name"), true)}<input className={`${fieldCls} mt-1`} value={form.name} onChange={(e) => set({ name: e.target.value })} placeholder="Sok Dara" />{err("name")}</label>
          <label className="block">{label(t("ff.nameKhmer"), !foreign)}<input lang="km" className={`${fieldCls} mt-1`} value={form.nameKhmer} onChange={(e) => set({ nameKhmer: e.target.value })} placeholder="សុខ ដារ៉ា" />{err("nameKhmer")}{foreign && !errors.nameKhmer && <span className="block text-xs text-slate-500 mt-1">{t("ff.khmerOptional")}</span>}</label>
        </div>

        <div className="grid sm:grid-cols-3 gap-5">
          <label className="block">{label(t("ff.nationality"), true)}
            <select className={`${fieldCls} mt-1`} value={form.nationality} onChange={(e) => set({ nationality: e.target.value })}>
              <option value="">{t("ff.choose")}</option>
              {NATIONALITIES.map((n) => <option key={n} value={n}>{nationalityLabel(n, lang)}</option>)}
            </select>{err("nationality")}
          </label>
          <label className="block">{label(t("fp.gender"), true)}
            <select className={`${fieldCls} mt-1`} value={form.gender} onChange={(e) => set({ gender: e.target.value })}>
              <option value="Male">{t("gender.Male")}</option>
              <option value="Female">{t("gender.Female")}</option>
            </select>
          </label>
          <label className="block">{label(t("fp.born"), true)}<input type="date" className={`${fieldCls} mt-1`} value={form.dateOfBirth} onChange={(e) => set({ dateOfBirth: e.target.value })} />{err("dateOfBirth")}</label>
        </div>

        <div className="grid sm:grid-cols-3 gap-5">
          <label className="block sm:col-span-1">{label(t("f.col.club"))}
            <select className={`${fieldCls} mt-1`} value={form.clubId} onChange={(e) => set({ clubId: e.target.value })}>
              <option value="">{t("f.noClub")}</option>
              {clubs.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </label>
          <label className="block">{label(t("ff.weight"), true)}<input type="number" inputMode="decimal" step="0.1" className={`${fieldCls} mt-1`} value={form.currentWeight} onChange={(e) => set({ currentWeight: e.target.value })} placeholder="60" />{err("currentWeight")}</label>
          <label className="block">{label(t("ff.height"), true)}<input type="number" inputMode="numeric" className={`${fieldCls} mt-1`} value={form.height} onChange={(e) => set({ height: e.target.value })} placeholder="170" />{err("height")}</label>
        </div>

        {/* Record */}
        <fieldset className="rounded-xl border border-slate-200 p-4 space-y-3">
          <legend className="px-1 text-sm font-semibold text-slate-800">{editing ? t("ff.recordTotal") : t("ff.recordCareer")}</legend>
          <p className="text-sm text-slate-600">{editing ? t("ff.recordTotalHint") : t("ff.recordCareerHint")}</p>
          <div className="grid grid-cols-3 gap-3 max-w-md">
            {([["wins", "ff.wins"], ["losses", "ff.losses"], ["draws", "ff.draws"]] as const).map(([k, key]) => (
              <label key={k} className="block"><span className="text-sm text-slate-700">{t(key)}</span><input type="number" min={0} inputMode="numeric" className={`${fieldCls} mt-1`} value={form[k]} onChange={(e) => set({ [k]: e.target.value } as Partial<Form>)} /></label>
            ))}
          </div>
          {err("record")}
        </fieldset>

        <div className="grid sm:grid-cols-3 gap-5">
          <label className="block">{label(t("fp.grade"))}
            <select className={`${fieldCls} mt-1`} value={form.grade} onChange={(e) => set({ grade: e.target.value })}>
              {["A", "B", "C", "D"].map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
          </label>
          <label className="block">{label(t("fp.province"))}
            <input list="provinces" className={`${fieldCls} mt-1`} value={form.province} onChange={(e) => set({ province: e.target.value })} />
            <datalist id="provinces">{PROVINCES.map((p) => <option key={p} value={p} />)}</datalist>
          </label>
          <label className="block">{label(t("ff.alias"))}<input className={`${fieldCls} mt-1`} value={form.alias} onChange={(e) => set({ alias: e.target.value })} /></label>
        </div>

        <fieldset>
          <legend className="text-sm font-semibold text-slate-800">{t("fp.styles")}</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {FIGHTING_STYLES.map((s) => {
              const on = form.styles.includes(s);
              return (
                <button key={s} type="button" aria-pressed={on} onClick={() => set({ styles: on ? form.styles.filter((x) => x !== s) : [...form.styles, s] })} className={`h-10 px-4 rounded-full text-sm font-semibold border ${on ? "bg-primary text-white border-primary" : "bg-white text-slate-700 border-slate-300 hover:border-primary"}`}>
                  {t(`style.${s}` as any)}
                </button>
              );
            })}
          </div>
        </fieldset>

        {editing && isStaff && (
          <label className="block max-w-xs">{label(t("f.col.status"))}
            <select className={`${fieldCls} mt-1`} value={form.status} onChange={(e) => set({ status: e.target.value })}>
              {[...new Set([...(form.status === "Draft" ? ["Draft"] : []), ...FIGHTER_STATUSES])].map((s) => <option key={s} value={s}>{t(`fs.${s}` as any)}</option>)}
            </select>
            <span className="block text-xs text-slate-500 mt-1">{t("ff.statusHint")}</span>
          </label>
        )}
      </section>

      <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
        <Link to={back} className="h-12 px-6 rounded-xl border border-slate-300 bg-white text-base font-semibold text-slate-700 hover:bg-slate-50 inline-flex items-center justify-center">{t("common.cancel")}</Link>
        <button type="button" disabled={busy} onClick={save} className="h-12 px-6 rounded-xl bg-primary text-white text-base font-semibold hover:opacity-90 disabled:opacity-60">
          {busy ? t("common.saving") : editing ? t("common.save") : t("f.register")}
        </button>
      </div>
    </div>
  );
}
