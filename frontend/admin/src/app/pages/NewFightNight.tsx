/**
 * New fight night (/home/events/new): one short form — name, date, venue, then optional TV station, sponsor,
 * about text and poster. Saved as a draft; the main fight card can be created at the same time (on by default,
 * most fight nights have one). Then the fight-night page opens at its next step.
 * Replaces the old 2-step "Create New Event" form (categories, tournament options).
 * See claude/updates/program-simple-forms.md.
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
  const [form, setForm] = useState(() => fightNightForm());
  const [withCard, setWithCard] = useState(true);
  const [busy, setBusy] = useState(false);

  const save = async () => {
    if (!fightNightReady(form)) {
      toast.error(t("steps.detailsTodo"));
      return;
    }
    setBusy(true);
    try {
      const created = await api.events.create(newFightNightPayload(form));
      if (withCard) {
        try {
          await api.batches.create({ eventId: created.id, name: t("form.mainCard"), weekNumber: 1, date: form.date, location: form.location.trim() });
        } catch {
          // The fight night exists; the officer can still add the card from its page.
        }
      }
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
        <Link to="/home/program?tab=events" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-primary">
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
        <FightNightFields form={form} setForm={setForm} autoFocus />
        <label className="flex items-start gap-3 rounded-xl bg-slate-50 border border-slate-200 p-4 cursor-pointer">
          <input type="checkbox" className="mt-1 w-5 h-5 accent-[var(--color-primary,#0A3D91)]" checked={withCard} onChange={(e) => setWithCard(e.target.checked)} />
          <span>
            <span className="block text-base font-semibold text-slate-900">{t("form.withCard")}</span>
            <span className="block text-sm text-slate-600">{t("form.withCardHint")}</span>
          </span>
        </label>
      </section>

      <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
        <Link to="/home/program?tab=events" className="h-12 px-6 rounded-xl border border-slate-300 bg-white text-base font-semibold text-slate-700 hover:bg-slate-50 inline-flex items-center justify-center">{t("common.cancel")}</Link>
        <button type="button" disabled={busy} onClick={save} className="h-12 px-6 rounded-xl bg-primary text-white text-base font-semibold hover:opacity-90 disabled:opacity-60">
          {busy ? t("common.saving") : t("form.create")}
        </button>
      </div>
    </div>
  );
}
