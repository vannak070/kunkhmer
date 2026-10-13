/**
 * New match (/home/events/new): one short form — name, date, venue and TV station; sponsors, about text and poster sit
 * under "More details (optional)". Saved as a draft, then the match page opens at its next step (the "Main card" is
 * created by the first "Add bouts"). Replaces the old 2-step "Create New Event" form (categories, tournament options).
 * See claude/updates/program-simple-forms.md and claude/updates/matches-menu.md. An Organizer creates its own
 * broadcaster's match — claude/updates/offline-agreements-log.md.
 */
import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";
import { ArrowLeft, CalendarPlus } from "lucide-react";
import { api } from "../utils/api";
import { useT } from "../i18n/program";
import { LangSwitch } from "../components/program/shared";
import { FightNightFields, fightNightForm, fightNightReady, newFightNightPayload } from "../components/program/FightNightFields";

export function NewFightNight() {
  const { t } = useT();
  const navigate = useNavigate();
  const me = api.auth.getCurrentUser();
  const isOrganizer = me?.role === "Organizer";
  const [form, setForm] = useState(() => ({ ...fightNightForm(), broadcastStationId: isOrganizer ? me?.broadcastStationId ?? "" : "" }));
  const [busy, setBusy] = useState(false);

  const save = async () => {
    if (!fightNightReady(form)) {
      toast.error(t("steps.detailsTodo"));
      return;
    }
    setBusy(true);
    try {
      const created = await api.events.create(newFightNightPayload(form, !isOrganizer));
      toast.success(t("form.created"));
      navigate(`/home/events/${created.id}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("common.error"));
      setBusy(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-8 space-y-6">
      <div className="flex items-center justify-between gap-3">
        <Link to="/home/matches" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-primary">
          <ArrowLeft className="w-4 h-4" aria-hidden /> {t("night.back")}
        </Link>
        <LangSwitch />
      </div>

      <header className="flex items-start gap-3">
        <span className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0" aria-hidden><CalendarPlus className="w-6 h-6" /></span>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">{t("list.new")}</h1>
          <p className="text-base text-slate-600 mt-1">{t("form.newLead")}</p>
        </div>
      </header>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 md:p-7 space-y-6 shadow-sm">
        <FightNightFields form={form} setForm={setForm} autoFocus lockStation={isOrganizer} short />
      </section>

      <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
        <Link to="/home/matches" className="h-12 px-6 rounded-xl border border-slate-300 bg-white text-base font-semibold text-slate-700 hover:bg-slate-50 inline-flex items-center justify-center">{t("common.cancel")}</Link>
        <button type="button" disabled={busy} onClick={save} className="h-12 px-6 rounded-xl bg-primary text-white text-base font-semibold hover:opacity-90 disabled:opacity-60">
          {busy ? t("common.saving") : t("form.create")}
        </button>
      </div>
    </div>
  );
}
