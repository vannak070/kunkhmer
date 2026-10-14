/**
 * Add / edit a title (/home/champion/new, /home/champion/:id/edit): one short form — title name, type, weight, who
 * sanctions it, the current champion (optional: for belts that already have a holder before this system), a belt
 * picture and an internal note. No fight-card step any more (a belt doesn't belong to one). The status follows the
 * champion: a holder = active, none = vacant. English + Khmer. See claude/updates/admin-step3-simple-pages.md.
 */
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import { ArrowLeft, Crown, ImagePlus } from "lucide-react";
import { api } from "../utils/api";
import { useT } from "../i18n/program";
import { WEIGHT_CLASSES } from "../data/champion";
import { LangSwitch } from "../components/program/shared";
import { fieldCls } from "../components/program/FightNightFields";
import { ORGANIZATIONS, TITLE_TYPES, typeLabel } from "../components/titles/titleUtils";
import { isRealPhoto } from "../components/fighters/fighterUtils";
import { FighterSearchSelect } from "../components/fighters/FighterSearchSelect";

interface Form { titleName: string; championType: string; weightClass: string; organization: string; holderId: string; beltImageUrl: string; notes: string }
const empty: Form = { titleName: "", championType: "KKF National", weightClass: "60", organization: "KKF", holderId: "", beltImageUrl: "", notes: "" };

export function CreateChampion() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useT();
  const editing = Boolean(id);
  const [form, setForm] = useState<Form>(empty);
  // The chosen champion (an object, found by search or loaded for an existing title).
  const [holder, setHolder] = useState<any | null>(null);
  const [loaded, setLoaded] = useState(!editing);
  const [loadFailed, setLoadFailed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const file = useRef<HTMLInputElement>(null);

  const load = () => {
    setLoadFailed(false);
    api.champions.get(id!).then((c: any) => {
      setForm({
        titleName: c.title_name ?? "", championType: c.champion_type ?? "KKF National", weightClass: String(Number(c.weight_class) || 0),
        organization: c.organization ?? "KKF", holderId: c.status !== "Vacant" ? c.current_holder_id ?? "" : "", beltImageUrl: c.belt_image_url ?? "", notes: c.notes ?? "",
      });
      setLoaded(true);
    }).catch(() => setLoadFailed(true));
  };
  useEffect(() => { if (editing) load(); }, [id]);
  // The current champion shows even if he or she is not active any more; new ones are found among Active fighters.
  useEffect(() => {
    if (!form.holderId) { setHolder(null); return; }
    if (holder?.id === form.holderId) return;
    api.fighters.get(form.holderId).then(setHolder).catch(() => setHolder(null));
  }, [form.holderId]);

  const set = (patch: Partial<Form>) => setForm((f) => ({ ...f, ...patch }));
  const weights = [...new Set([...WEIGHT_CLASSES, Number(form.weightClass) || 0])].filter((w) => w > 0).sort((a, b) => a - b);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.titleName.trim()) e.titleName = t("ff.required");
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const save = async () => {
    if (!validate()) { toast.error(t("ff.fix")); return; }
    setBusy(true);
    const body: Record<string, unknown> = {
      titleName: form.titleName.trim(),
      championType: form.championType,
      weightClass: Number(form.weightClass),
      organization: form.organization,
      beltImageUrl: form.beltImageUrl || null,
      notes: form.notes.trim() || null,
      // The status follows the champion: a holder = active, none = vacant.
      currentHolderId: holder ? holder.id : null,
      currentHolderName: holder ? holder.name : null,
      nationality: holder ? holder.nationality ?? null : null,
      status: holder ? "Active" : "Vacant",
    };
    try {
      const saved = editing ? await api.champions.update(id!, body) : await api.champions.create(body);
      toast.success(editing ? t("tf.saved") : t("tf.created", { name: form.titleName.trim() }));
      navigate(`/home/champion/${saved?.id ?? id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("common.error"));
      setBusy(false);
    }
  };

  const pickImage = (f?: File) => {
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) { toast.error(t("ff.photoTooBig")); return; }
    const reader = new FileReader();
    reader.onloadend = () => set({ beltImageUrl: reader.result as string });
    reader.readAsDataURL(f);
  };

  if (loadFailed)
    return (
      <div className="max-w-3xl mx-auto p-8 text-center space-y-4">
        <p className="text-slate-700">{t("td.loadFailed")}</p>
        <div className="flex justify-center gap-3">
          <button type="button" onClick={load} className="h-11 px-5 rounded-xl bg-primary text-white text-sm font-semibold hover:opacity-90">{t("common.tryAgain")}</button>
          <Link to="/home/titles" className="h-11 px-5 rounded-xl border border-slate-300 text-sm font-semibold text-slate-700 inline-flex items-center">{t("td.back")}</Link>
        </div>
      </div>
    );
  if (!loaded) return <div className="p-10 flex justify-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" aria-label={t("common.loading")} /></div>;

  const back = editing ? `/home/champion/${id}` : "/home/titles";
  const label = (text: string, required = false) => <span className="text-sm font-semibold text-slate-800">{text}{required && " *"}</span>;

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-8 space-y-6">
      <div className="flex items-center justify-between gap-3">
        <Link to={back} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-primary">
          <ArrowLeft className="w-4 h-4" aria-hidden /> {t("common.back")}
        </Link>
        <LangSwitch />
      </div>

      <header className="flex items-start gap-3">
        <span className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0" aria-hidden><Crown className="w-6 h-6" /></span>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">{editing ? t("tf.editTitle") : t("ov.newTitle")}</h1>
          <p className="text-base text-slate-600 mt-1">{editing ? t("ff.editLead") : t("tf.lead")}</p>
        </div>
      </header>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 md:p-7 space-y-6 shadow-sm">
        <label className="block">{label(t("tf.name"), true)}<input className={`${fieldCls} mt-1`} value={form.titleName} onChange={(e) => set({ titleName: e.target.value })} placeholder="KKF National Championship 60 kg" />{errors.titleName && <span className="block text-sm text-red-700 mt-1">{errors.titleName}</span>}</label>

        <div className="grid sm:grid-cols-3 gap-5">
          <label className="block">{label(t("tf.type"))}
            <select className={`${fieldCls} mt-1`} value={form.championType} onChange={(e) => set({ championType: e.target.value })}>
              {[...new Set([...TITLE_TYPES, form.championType])].map((x) => <option key={x} value={x}>{typeLabel(t, x)}</option>)}
            </select>
          </label>
          <label className="block">{label(t("tf.weight"))}
            <select className={`${fieldCls} mt-1`} value={form.weightClass} onChange={(e) => set({ weightClass: e.target.value })}>
              <option value="0">{t("tf.noWeight")}</option>
              {weights.map((w) => <option key={w} value={w}>{t("common.kg", { n: w })}</option>)}
            </select>
          </label>
          <label className="block">{label(t("tf.organization"))}
            <select className={`${fieldCls} mt-1`} value={form.organization} onChange={(e) => set({ organization: e.target.value })}>
              {[...new Set([...ORGANIZATIONS, form.organization])].map((x) => <option key={x} value={x}>{x === "Other" ? t("tf.other") : x}</option>)}
            </select>
          </label>
        </div>

        <label className="block">{label(t("tf.champion"))}
          <FighterSearchSelect activeOnly selected={form.holderId ? holder : null} inputClassName={fieldCls} placeholder={t("tf.noChampion")}
            onChange={(f) => { setHolder(f); set({ holderId: f?.id ?? "" }); }} />
          <span className="block text-xs text-slate-500 mt-1">{t("tf.championHint")}</span>
        </label>

        <div className="flex items-start gap-4">
          {isRealPhoto(form.beltImageUrl) ? <img src={form.beltImageUrl} alt="" className="w-24 h-24 rounded-xl object-contain bg-white border border-slate-200 shrink-0" /> : <span className="w-24 h-24 rounded-xl bg-slate-100 inline-flex items-center justify-center text-slate-400 shrink-0"><ImagePlus className="w-7 h-7" aria-hidden /></span>}
          <div className="space-y-2">
            {label(t("tf.belt"))}
            <p className="text-xs text-slate-500">{t("tf.beltHint")}</p>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => file.current?.click()} className="h-10 px-4 rounded-lg border border-slate-300 text-sm font-semibold text-slate-700 hover:border-primary">{form.beltImageUrl ? t("common.change") : t("cf.addPicture")}</button>
              {form.beltImageUrl && <button type="button" onClick={() => set({ beltImageUrl: "" })} className="h-10 px-3 text-sm text-slate-500 hover:text-red-700">{t("form.removePoster")}</button>}
            </div>
            <input ref={file} type="file" accept="image/*" className="hidden" onChange={(e) => pickImage(e.target.files?.[0])} />
          </div>
        </div>

        <label className="block">{label(t("td.notes"))}<textarea rows={3} className={`${fieldCls} mt-1`} value={form.notes} onChange={(e) => set({ notes: e.target.value })} /><span className="block text-xs text-slate-500 mt-1">{t("tf.notesHint")}</span></label>
      </section>

      <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
        <Link to={back} className="h-12 px-6 rounded-xl border border-slate-300 bg-white text-base font-semibold text-slate-700 hover:bg-slate-50 inline-flex items-center justify-center">{t("common.cancel")}</Link>
        <button type="button" disabled={busy} onClick={save} className="h-12 px-6 rounded-xl bg-primary text-white text-base font-semibold hover:opacity-90 disabled:opacity-60">
          {busy ? t("common.saving") : editing ? t("common.save") : t("tf.create")}
        </button>
      </div>
    </div>
  );
}
