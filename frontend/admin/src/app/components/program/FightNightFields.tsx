/**
 * The fight night's details, shared by "New fight night" (pages/NewFightNight.tsx) and the fight-night page's
 * "Edit details" dialog: name, date, venue (Settings › Venues as suggestions), TV station, main sponsor,
 * about text and poster. Name, date and venue are required. See claude/updates/program-simple-forms.md.
 */
import { useEffect, useRef, useState } from "react";
import { ImagePlus } from "lucide-react";
import { api } from "../../utils/api";
import { useT } from "../../i18n/program";

export const fieldCls =
  "w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-base text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary";

export interface FightNightForm {
  name: string;
  date: string;
  location: string;
  broadcastStationId: string;
  mainSponsorId: string;
  description: string;
  image: string;
}

export const fightNightForm = (event?: any): FightNightForm => ({
  name: event?.name ?? "",
  date: String(event?.date ?? "").slice(0, 10),
  location: event?.location ?? "",
  broadcastStationId: event?.broadcast_station_id ?? "",
  mainSponsorId: event?.main_sponsor_id ?? "",
  description: event?.description ?? "",
  image: event?.image ?? "",
});

export const fightNightReady = (f: FightNightForm) => Boolean(f.name.trim() && f.date && f.location.trim());

/** Body for PUT /events/:id (the sponsor list is left as it is: it may hold more sponsors than the main one). */
export const fightNightPayload = (f: FightNightForm) => ({
  name: f.name.trim(),
  date: f.date,
  location: f.location.trim(),
  broadcastStationId: f.broadcastStationId || null,
  mainSponsorId: f.mainSponsorId || null,
  description: f.description.trim() || null,
  image: f.image || null,
});

/** Body for POST /events: a new fight night starts as a draft, its main sponsor as its sponsor list. */
export const newFightNightPayload = (f: FightNightForm) => ({
  ...fightNightPayload(f),
  status: "Draft",
  sponsorIds: f.mainSponsorId ? [f.mainSponsorId] : [],
});

export function FightNightFields({ form, setForm, autoFocus = false }: { form: FightNightForm; setForm: (f: FightNightForm) => void; autoFocus?: boolean }) {
  const { t } = useT();
  const [stations, setStations] = useState<any[]>([]);
  const [sponsors, setSponsors] = useState<any[]>([]);
  const [venues, setVenues] = useState<any[]>([]);
  const file = useRef<HTMLInputElement>(null);

  useEffect(() => {
    api.settings.listBroadcastStations().then((r: any[]) => setStations((r || []).filter((s) => s.active !== false))).catch(() => {});
    api.settings.listSponsors().then((r: any[]) => setSponsors((r || []).filter((s) => s.active !== false))).catch(() => {});
    api.settingsLists.list("venues").then(setVenues).catch(() => {});
  }, []);

  const pickImage = (f?: File) => {
    if (!f) return;
    const reader = new FileReader();
    reader.onloadend = () => setForm({ ...form, image: reader.result as string });
    reader.readAsDataURL(f);
  };

  return (
    <div className="space-y-5">
      <label className="block">
        <span className="text-sm font-semibold text-slate-800">{t("night.name")} *</span>
        <input autoFocus={autoFocus} className={`${fieldCls} mt-1`} value={form.name} placeholder={t("form.namePlaceholder")} onChange={(e) => setForm({ ...form, name: e.target.value })} />
      </label>
      <div className="grid sm:grid-cols-2 gap-5">
        <label className="block">
          <span className="text-sm font-semibold text-slate-800">{t("night.date")} *</span>
          <input type="date" className={`${fieldCls} mt-1`} value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-slate-800">{t("night.venue")} *</span>
          <input list="fight-night-venues" className={`${fieldCls} mt-1`} value={form.location} placeholder={t("form.venuePlaceholder")} onChange={(e) => setForm({ ...form, location: e.target.value })} />
          <datalist id="fight-night-venues">{venues.map((v) => <option key={v.id} value={v.name} />)}</datalist>
        </label>
      </div>
      <div className="grid sm:grid-cols-2 gap-5">
        <label className="block">
          <span className="text-sm font-semibold text-slate-800">{t("night.broadcaster")}</span>
          <select className={`${fieldCls} mt-1`} value={form.broadcastStationId} onChange={(e) => setForm({ ...form, broadcastStationId: e.target.value })}>
            <option value="">{t("common.notSet")}</option>
            {stations.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-slate-800">{t("night.sponsor")}</span>
          <select className={`${fieldCls} mt-1`} value={form.mainSponsorId} onChange={(e) => setForm({ ...form, mainSponsorId: e.target.value })}>
            <option value="">{t("common.notSet")}</option>
            {sponsors.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </label>
      </div>
      <label className="block">
        <span className="text-sm font-semibold text-slate-800">{t("form.about")}</span>
        <textarea rows={3} className={`${fieldCls} mt-1`} value={form.description} placeholder={t("form.aboutPlaceholder")} onChange={(e) => setForm({ ...form, description: e.target.value })} />
      </label>
      <div>
        <span className="text-sm font-semibold text-slate-800">{t("night.poster")}</span>
        <div className="mt-1 flex items-center gap-3">
          {form.image ? <img src={form.image} alt="" className="w-20 h-20 rounded-lg object-cover bg-slate-100" /> : <span className="w-20 h-20 rounded-lg bg-slate-100 inline-flex items-center justify-center text-slate-400"><ImagePlus className="w-6 h-6" aria-hidden /></span>}
          <button type="button" onClick={() => file.current?.click()} className="h-10 px-4 rounded-lg border border-slate-300 text-sm font-semibold text-slate-700 hover:border-primary">{form.image ? t("common.change") : t("form.addPoster")}</button>
          {form.image && <button type="button" onClick={() => setForm({ ...form, image: "" })} className="h-10 px-3 text-sm text-slate-500 hover:text-red-700">{t("form.removePoster")}</button>}
          <input ref={file} type="file" accept="image/*" className="hidden" onChange={(e) => pickImage(e.target.files?.[0])} />
        </div>
      </div>
    </div>
  );
}
