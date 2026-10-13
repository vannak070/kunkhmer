/**
 * Add / edit a club (/home/clubs/new, /home/clubs/:id/edit): one short form — logo and banner, English and Khmer
 * name, head coach, association (from System Settings), year founded, place with the map pin, phone, email, about.
 * Name and head coach are required. No banner = no picture and no stock photo; the old form's fixed "rating 5.0"
 * is gone. English + Khmer. See claude/updates/admin-step3-simple-pages.md.
 */
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import { ArrowLeft, Building2, ImagePlus } from "lucide-react";
import { api } from "../utils/api";
import { type Association, listName, useSettingsList } from "../hooks/useSettingsLists";
import { useT } from "../i18n/program";
import { LangSwitch } from "../components/program/shared";
import { fieldCls } from "../components/program/FightNightFields";
import { ClubMapPicker, type Pin } from "../components/clubs/ClubMapPicker";
import { isRealPhoto } from "../components/fighters/fighterUtils";

interface Form {
  name: string; nameKhmer: string; headCoach: string; association: string; associationKhmer: string; established: string;
  location: string; phone: string; email: string; description: string; status: string; image: string; logoUrl: string;
}

const empty: Form = {
  name: "", nameKhmer: "", headCoach: "", association: "", associationKhmer: "", established: "", location: "", phone: "",
  email: "", description: "", status: "active", image: "", logoUrl: "",
};

export function AddClub() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, lang } = useT();
  const editing = Boolean(id);
  const [form, setForm] = useState<Form>(empty);
  const [pin, setPin] = useState<Pin | null>(null);
  const [loaded, setLoaded] = useState(!editing);
  const [loadFailed, setLoadFailed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const logoInput = useRef<HTMLInputElement>(null);
  const bannerInput = useRef<HTMLInputElement>(null);

  // The association list comes from System Settings; a club saved with a name no longer in the list keeps it as an extra option.
  const { rows: associationList } = useSettingsList<Association>("associations");
  const associationOptions: Association[] = [
    ...associationList,
    ...(form.association && !associationList.some((x) => x.name === form.association)
      ? [{ id: "saved", name: form.association, name_khmer: form.associationKhmer || null } as Association]
      : []),
  ];

  const load = () => {
    setLoadFailed(false);
    api.clubs.get(id!).then((c: any) => {
      setForm({
        name: c.name ?? "", nameKhmer: c.name_khmer ?? "", headCoach: c.head_coach ?? "", association: c.association ?? "",
        associationKhmer: c.association_khmer ?? "", established: c.established ?? "", location: c.location ?? "", phone: c.phone ?? "",
        email: c.email ?? "", description: c.description ?? "", status: c.status ?? "active", image: c.image ?? "", logoUrl: c.logo_url ?? "",
      });
      setPin(c.latitude != null && c.longitude != null ? { lat: Number(c.latitude), lng: Number(c.longitude) } : null);
      setLoaded(true);
    }).catch(() => setLoadFailed(true));
  };
  useEffect(() => { if (editing) load(); }, [id]);

  const set = (patch: Partial<Form>) => setForm((f) => ({ ...f, ...patch }));
  const pickAssociation = (name: string) => {
    const entry = associationOptions.find((x) => x.name === name);
    set({ association: name, associationKhmer: entry?.name_khmer ?? "" });
  };
  const pickImage = (key: "image" | "logoUrl", file?: File) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error(t("ff.photoTooBig")); return; }
    const reader = new FileReader();
    reader.onloadend = () => set({ [key]: reader.result as string } as Partial<Form>);
    reader.readAsDataURL(file);
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = t("ff.required");
    if (!form.headCoach.trim()) e.headCoach = t("ff.required");
    if (form.established.trim() && !/^(19|20)\d{2}$/.test(form.established.trim())) e.established = t("cf.yearInvalid");
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const save = async () => {
    if (!validate()) { toast.error(t("ff.fix")); return; }
    setBusy(true);
    const body = {
      name: form.name.trim(),
      nameKhmer: form.nameKhmer.trim(),
      headCoach: form.headCoach.trim(),
      // Optional; "" clears it.
      association: form.association.trim(),
      associationKhmer: form.association ? form.associationKhmer.trim() : "",
      location: form.location.trim(),
      // The map pin; null for both clears it.
      latitude: pin ? Number(pin.lat.toFixed(6)) : null,
      longitude: pin ? Number(pin.lng.toFixed(6)) : null,
      status: form.status || "active",
      // No banner = no picture ("" clears it on edit); never a stock photo.
      image: form.image,
      phone: form.phone.trim() || null,
      email: form.email.trim() || null,
      established: form.established.trim() || null,
      description: form.description.trim() || null,
      // "" removes the logo; a new upload is a data URI the API stores as a file.
      logoUrl: form.logoUrl,
    };
    try {
      const saved = editing ? await api.clubs.update(id!, body) : await api.clubs.create(body);
      toast.success(editing ? t("cf.saved") : t("cf.created", { name: body.name }));
      navigate(`/home/clubs/${saved?.id ?? id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("common.error"));
      setBusy(false);
    }
  };

  if (loadFailed)
    return (
      <div className="max-w-3xl mx-auto p-8 text-center space-y-4">
        <p className="text-slate-700">{t("club.loadFailed")}</p>
        <div className="flex justify-center gap-3">
          <button type="button" onClick={load} className="h-11 px-5 rounded-xl bg-primary text-white text-sm font-semibold hover:opacity-90">{t("common.tryAgain")}</button>
          <Link to="/home/clubs" className="h-11 px-5 rounded-xl border border-slate-300 text-sm font-semibold text-slate-700 inline-flex items-center">{t("club.back")}</Link>
        </div>
      </div>
    );
  if (!loaded) return <div className="p-10 flex justify-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" aria-label={t("common.loading")} /></div>;

  const back = editing ? `/home/clubs/${id}` : "/home/clubs";
  const label = (text: string, required = false) => <span className="text-sm font-semibold text-slate-800">{text}{required && " *"}</span>;
  const err = (k: string) => errors[k] ? <span className="block text-sm text-red-700 mt-1">{errors[k]}</span> : null;
  const picture = (key: "image" | "logoUrl", input: React.RefObject<HTMLInputElement | null>, title: string, hint: string, wide: boolean) => {
    const value = form[key];
    return (
      <div className="flex items-start gap-4">
        {isRealPhoto(value) ? (
          <img src={value} alt="" className={`${wide ? "w-40 h-24 object-cover" : "w-24 h-24 object-contain bg-white border border-slate-200"} rounded-xl shrink-0`} />
        ) : (
          <span className={`${wide ? "w-40 h-24" : "w-24 h-24"} rounded-xl bg-slate-100 inline-flex items-center justify-center text-slate-400 shrink-0`}><ImagePlus className="w-7 h-7" aria-hidden /></span>
        )}
        <div className="space-y-2 min-w-0">
          {label(title)}
          <p className="text-xs text-slate-500">{hint}</p>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => input.current?.click()} className="h-10 px-4 rounded-lg border border-slate-300 text-sm font-semibold text-slate-700 hover:border-primary">{value ? t("common.change") : t("cf.addPicture")}</button>
            {value && <button type="button" onClick={() => set({ [key]: "" } as Partial<Form>)} className="h-10 px-3 text-sm text-slate-500 hover:text-red-700">{t("form.removePoster")}</button>}
          </div>
          <input ref={input} type="file" accept="image/*" className="hidden" onChange={(e) => pickImage(key, e.target.files?.[0])} />
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-8 space-y-6">
      <div className="flex items-center justify-between gap-3">
        <Link to={back} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-primary">
          <ArrowLeft className="w-4 h-4" aria-hidden /> {t("common.back")}
        </Link>
        <LangSwitch />
      </div>

      <header className="flex items-start gap-3">
        <span className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0" aria-hidden><Building2 className="w-6 h-6" /></span>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">{editing ? t("cf.editTitle") : t("cl.add")}</h1>
          <p className="text-base text-slate-600 mt-1">{editing ? t("ff.editLead") : t("cf.lead")}</p>
        </div>
      </header>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 md:p-7 space-y-6 shadow-sm">
        <div className="grid sm:grid-cols-2 gap-5">
          <label className="block">{label(t("cf.name"), true)}<input className={`${fieldCls} mt-1`} value={form.name} onChange={(e) => set({ name: e.target.value })} placeholder="Phnom Penh Elite Gym" />{err("name")}</label>
          <label className="block">{label(t("cf.nameKhmer"))}<input lang="km" className={`${fieldCls} mt-1`} value={form.nameKhmer} onChange={(e) => set({ nameKhmer: e.target.value })} placeholder="ក្លឹបប្រដាល់…" /></label>
        </div>

        <div className="grid sm:grid-cols-2 gap-5">
          <label className="block">{label(t("cf.coach"), true)}<input className={`${fieldCls} mt-1`} value={form.headCoach} onChange={(e) => set({ headCoach: e.target.value })} />{err("headCoach")}</label>
          <label className="block">{label(t("cf.established"))}<input inputMode="numeric" maxLength={4} className={`${fieldCls} mt-1`} value={form.established} onChange={(e) => set({ established: e.target.value.replace(/\D/g, "") })} placeholder="2015" />{err("established")}</label>
        </div>

        <label className="block">{label(t("cf.association"))}
          <select className={`${fieldCls} mt-1`} value={form.association} onChange={(e) => pickAssociation(e.target.value)}>
            <option value="">{t("cf.noAssociation")}</option>
            {associationOptions.map((x) => <option key={x.id} value={x.name}>{listName(x, lang)}</option>)}
          </select>
        </label>

        {editing && (
          <label className="block max-w-xs">{label(t("f.col.status"))}
            <select className={`${fieldCls} mt-1`} value={form.status} onChange={(e) => set({ status: e.target.value })}>
              <option value="active">{t("cl.active")}</option>
              <option value="inactive">{t("cl.inactive")}</option>
            </select>
            <span className="block text-xs text-slate-500 mt-1">{t("cf.statusHint")}</span>
          </label>
        )}

        <div className="grid sm:grid-cols-2 gap-6 pt-1">
          {picture("logoUrl", logoInput, t("cf.logo"), t("cf.logoHint"), false)}
          {picture("image", bannerInput, t("cf.banner"), t("cf.bannerHint"), true)}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 md:p-7 space-y-4 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-slate-900">{t("cf.place")}</h2>
          <p className="text-sm text-slate-600">{t("cf.placeHint")}</p>
        </div>
        <label className="block">{label(t("cf.address"))}<input className={`${fieldCls} mt-1`} value={form.location} onChange={(e) => set({ location: e.target.value })} /></label>
        <ClubMapPicker value={pin} onChange={setPin} location={form.location} onAddress={(address) => set({ location: address })} />
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 md:p-7 space-y-5 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900">{t("club.contact")}</h2>
        <div className="grid sm:grid-cols-2 gap-5">
          <label className="block">{label(t("cf.phone"))}<input type="tel" inputMode="tel" className={`${fieldCls} mt-1`} value={form.phone} onChange={(e) => set({ phone: e.target.value })} /></label>
          <label className="block">{label(t("cf.email"))}<input type="email" inputMode="email" autoCapitalize="none" className={`${fieldCls} mt-1`} value={form.email} onChange={(e) => set({ email: e.target.value })} /></label>
        </div>
        <label className="block">{label(t("club.about"))}<textarea rows={4} className={`${fieldCls} mt-1`} value={form.description} onChange={(e) => set({ description: e.target.value })} /><span className="block text-xs text-slate-500 mt-1">{t("cf.aboutHint")}</span></label>
      </section>

      <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
        <Link to={back} className="h-12 px-6 rounded-xl border border-slate-300 bg-white text-base font-semibold text-slate-700 hover:bg-slate-50 inline-flex items-center justify-center">{t("common.cancel")}</Link>
        <button type="button" disabled={busy} onClick={save} className="h-12 px-6 rounded-xl bg-primary text-white text-base font-semibold hover:opacity-90 disabled:opacity-60">
          {busy ? t("common.saving") : editing ? t("common.save") : t("cl.add")}
        </button>
      </div>
    </div>
  );
}
