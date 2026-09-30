/**
 * Weigh-in for one fight card (/home/fight-cards/:cardId/weigh-in): type each fighter's weight, see Pass or
 * Over (at most 1 kg over the agreed weight), save per bout. Saved on the bout — the fighter's profile weight
 * isn't changed. English / Khmer. See claude/updates/program-officer-friendly.md.
 */
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { toast } from "sonner";
import { ArrowLeft, Scale, Trophy } from "lucide-react";
import { api } from "../utils/api";
import { formatDay, useT } from "../i18n/program";
import { FighterAvatar, LangSwitch, byCardOrder, hasResult, overBy } from "../components/program/shared";

type Draft = { a: string; b: string };

export function FightCardWeighIn() {
  const { cardId } = useParams();
  const { t, lang } = useT();
  const me = api.auth.getCurrentUser();
  const isStaff = me?.role === "Super Admin" || me?.role === "KKF Officer";

  const [card, setCard] = useState<any | null | undefined>(undefined);
  const [event, setEvent] = useState<any | null>(null);
  const [bouts, setBouts] = useState<any[]>([]);
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});
  const [saving, setSaving] = useState<string | null>(null);

  const load = async () => {
    try {
      const c = await api.batches.get(cardId!);
      const [ev, list] = await Promise.all([api.events.get(c.event_id), api.matches.list(cardId)]);
      setCard(c);
      setEvent(ev);
      const sorted = (list as any[]).sort(byCardOrder);
      setBouts(sorted);
      setDrafts(Object.fromEntries(sorted.map((m) => [m.id, { a: m.weigh_in_a_kg == null ? "" : String(m.weigh_in_a_kg), b: m.weigh_in_b_kg == null ? "" : String(m.weigh_in_b_kg) }])));
    } catch {
      setCard(null);
    }
  };
  useEffect(() => {
    load();
  }, [cardId]);

  if (card === undefined) return <div className="p-10 flex justify-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" aria-label={t("common.loading")} /></div>;
  if (card === null) return <div className="p-8 text-center text-slate-600">{t("common.error")}</div>;

  const parse = (v: string) => (v.trim() === "" ? null : Number(v.replace(",", ".")));
  const save = async (m: any) => {
    const d = drafts[m.id];
    const a = parse(d.a), b = parse(d.b);
    for (const w of [a, b]) {
      if (w !== null && (!Number.isFinite(w) || w < 20 || w > 200)) {
        toast.error(t("weigh.invalid"));
        return;
      }
    }
    setSaving(m.id);
    try {
      const updated = await api.matches.weighIn(m.id, { a, b });
      setBouts((list) => list.map((x) => (x.id === m.id ? { ...x, ...updated } : x)));
      toast.success(t("weigh.saved"));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("common.error"));
    } finally {
      setSaving(null);
    }
  };

  const open = bouts.filter((m) => !hasResult(m));
  const weighed = open.filter((m) => m.weigh_in_a_kg != null && m.weigh_in_b_kg != null).length;

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-6">
      <Link to={`/home/events/${card.event_id}`} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-primary">
        <ArrowLeft className="w-4 h-4" aria-hidden /> {event?.name ?? t("common.back")}
      </Link>

      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 flex items-center gap-2">
            <Scale className="w-7 h-7 text-primary" aria-hidden /> {t("weigh.title")} — {card.name}
          </h1>
          <p className="text-sm text-slate-500 mt-1">{formatDay(card.date, lang)} · {t("weigh.progress", { done: weighed, total: open.length })}</p>
        </div>
        <LangSwitch />
      </header>

      <p className="rounded-xl bg-[#eef3fb] border border-[#d5e0f3] p-4 text-sm text-slate-700">{t("weigh.intro")}</p>

      <ol className="space-y-4">
        {bouts.map((m, i) => {
          const d = drafts[m.id] ?? { a: "", b: "" };
          const done = hasResult(m);
          const changed = d.a !== (m.weigh_in_a_kg == null ? "" : String(m.weigh_in_a_kg)) || d.b !== (m.weigh_in_b_kg == null ? "" : String(m.weigh_in_b_kg));
          return (
            <li key={m.id} className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                <p className="font-bold text-slate-900">
                  <span className="text-slate-400 mr-2">{i + 1}</span>
                  {m.fighter_a_name} <span className="text-slate-400 font-normal">{t("common.vs")}</span> {m.fighter_b_name}
                </p>
                <p className="text-sm text-slate-600 flex items-center gap-2">
                  {(m.is_title_match || m.isTitleMatch) && <span className="inline-flex items-center gap-1 text-amber-700 font-semibold"><Trophy className="w-3.5 h-3.5" aria-hidden /> {t("common.titleFight")}</span>}
                  {t("weigh.agreed", { kg: t("common.kg", { n: Number(m.agreed_weight) }) })}
                </p>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <CornerWeight label={t("common.red")} tone="bg-red-50 text-red-700" border="border-l-red-500" name={m.fighter_a_name} club={m.club_a_name} image={m.fighter_a_image} value={d.a} agreed={Number(m.agreed_weight)} disabled={!isStaff || done} onChange={(v) => setDrafts({ ...drafts, [m.id]: { ...d, a: v } })} />
                <CornerWeight label={t("common.blue")} tone="bg-blue-50 text-blue-700" border="border-l-blue-500" name={m.fighter_b_name} club={m.club_b_name} image={m.fighter_b_image} value={d.b} agreed={Number(m.agreed_weight)} disabled={!isStaff || done} onChange={(v) => setDrafts({ ...drafts, [m.id]: { ...d, b: v } })} />
              </div>
              {isStaff && !done && (
                <div className="mt-4 flex justify-end">
                  <button type="button" disabled={!changed || saving === m.id} onClick={() => save(m)} className="h-11 px-5 rounded-xl bg-primary text-white text-sm font-semibold hover:opacity-90 disabled:opacity-40">
                    {saving === m.id ? t("common.saving") : t("weigh.saveBout")}
                  </button>
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function CornerWeight({ label, tone, border, name, club, image, value, agreed, disabled, onChange }: {
  label: string; tone: string; border: string; name?: string; club?: string | null; image?: string | null; value: string; agreed: number; disabled: boolean; onChange: (v: string) => void;
}) {
  const { t } = useT();
  const kg = value.trim() === "" ? null : Number(value.replace(",", "."));
  const over = kg !== null && Number.isFinite(kg) ? overBy(kg, agreed) : 0;
  const status =
    kg === null || !Number.isFinite(kg)
      ? <span className="text-xs font-semibold text-slate-500">{t("weigh.none")}</span>
      : over > 0
        ? <span className="rounded-full bg-red-50 text-red-700 px-2.5 py-1 text-xs font-bold">{t("weigh.over", { kg: t("common.kg", { n: over }) })}</span>
        : <span className="rounded-full bg-emerald-50 text-emerald-700 px-2.5 py-1 text-xs font-bold">{t("weigh.pass")}</span>;
  const id = `w-${label}-${name}`.replace(/\s+/g, "-");
  return (
    <div className={`rounded-xl border border-slate-200 border-l-4 ${border} p-4 space-y-3`}>
      <div className="flex items-center gap-3">
        <FighterAvatar name={name} image={image} tone={tone} />
        <div className="min-w-0">
          <p className="text-xs font-semibold text-slate-500">{label}</p>
          <p className="font-semibold text-slate-900 truncate">{name}</p>
          {club && <p className="text-xs text-slate-500 truncate">{club}</p>}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <label htmlFor={id} className="sr-only">{name}</label>
        <div className="relative">
          <input
            id={id}
            type="number"
            inputMode="decimal"
            step="0.1"
            min={20}
            max={200}
            value={value}
            disabled={disabled}
            onChange={(e) => onChange(e.target.value)}
            className="w-32 h-12 rounded-xl border border-slate-300 pl-3 pr-10 text-lg font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary disabled:bg-slate-50"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">kg</span>
        </div>
        {status}
      </div>
    </div>
  );
}
