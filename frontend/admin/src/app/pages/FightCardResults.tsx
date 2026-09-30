/**
 * Results for one fight card (/home/fight-cards/:cardId/results): every bout on one page — tap the winner
 * (Red / Blue / Draw / No contest), how it ended and the round, then save. A saved result shows read-only with
 * "Change"; changing a title fight's winner asks first (the belt moves). Records and belts update on the server.
 * English / Khmer. See claude/updates/program-officer-friendly.md.
 */
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { toast } from "sonner";
import { ArrowLeft, CheckCircle2, Gavel, Trophy } from "lucide-react";
import { api } from "../utils/api";
import { formatDay, useT } from "../i18n/program";
import { ConfirmDialog, FighterAvatar, LangSwitch, byCardOrder, dayOf, hasResult, resultText, todayUtc } from "../components/program/shared";

const METHODS = ["KO", "TKO", "Decision", "Disqualification"] as const;
type Winner = "a" | "b" | "draw" | "nc" | "";
type Draft = { winner: Winner; method: string; round: string };

const draftOf = (m: any): Draft => {
  if (!hasResult(m)) return { winner: "", method: "", round: "" };
  const winner: Winner = m.winner_id === m.fighter_a_id ? "a" : m.winner_id === m.fighter_b_id ? "b" : m.winner_method === "No Contest" ? "nc" : "draw";
  return { winner, method: winner === "a" || winner === "b" ? m.winner_method ?? "" : "", round: m.winner_round ? String(m.winner_round) : "" };
};

export function FightCardResults() {
  const { cardId } = useParams();
  const { t, lang } = useT();
  const me = api.auth.getCurrentUser();
  const isStaff = me?.role === "Super Admin" || me?.role === "KKF Officer";

  const [card, setCard] = useState<any | null | undefined>(undefined);
  const [event, setEvent] = useState<any | null>(null);
  const [bouts, setBouts] = useState<any[]>([]);
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});
  const [editing, setEditing] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState<string | null>(null);
  const [confirmTitle, setConfirmTitle] = useState<any | null>(null);

  const load = async () => {
    try {
      const c = await api.batches.get(cardId!);
      const [ev, list] = await Promise.all([api.events.get(c.event_id), api.matches.list(cardId)]);
      setCard(c);
      setEvent(ev);
      const sorted = (list as any[]).sort(byCardOrder);
      setBouts(sorted);
      setDrafts(Object.fromEntries(sorted.map((m) => [m.id, draftOf(m)])));
    } catch {
      setCard(null);
    }
  };
  useEffect(() => {
    load();
  }, [cardId]);

  if (card === undefined) return <div className="p-10 flex justify-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" aria-label={t("common.loading")} /></div>;
  if (card === null) return <div className="p-8 text-center text-slate-600">{t("common.error")}</div>;

  const set = (id: string, patch: Partial<Draft>) => setDrafts((d) => ({ ...d, [id]: { ...d[id], ...patch } }));

  const save = async (m: any, confirmed = false) => {
    const d = drafts[m.id];
    if (!d.winner) return toast.error(t("res.pickWinner"));
    const corner = d.winner === "a" || d.winner === "b";
    if (corner && !d.method) return toast.error(t("res.pickMethod"));
    const round = d.round ? Number(d.round) : corner && d.method === "Decision" ? m.rounds : 0;
    if (corner && d.method !== "Decision" && !round) return toast.error(t("res.pickRound"));
    const winnerId = d.winner === "a" ? m.fighter_a_id : d.winner === "b" ? m.fighter_b_id : null;
    // A title fight's winner changing moves the belt: ask first.
    if (!confirmed && (m.is_title_match || m.isTitleMatch) && hasResult(m) && (m.winner_id ?? null) !== winnerId) {
      setConfirmTitle(m);
      return;
    }
    setConfirmTitle(null);
    setSaving(m.id);
    try {
      const updated = await api.matches.saveResult(m.id, {
        winnerId: winnerId ?? "",
        method: corner ? d.method : d.winner === "nc" ? "No Contest" : "Draw",
        round,
        duration: null,
      });
      const next = { ...m, ...updated };
      setBouts((list) => list.map((x) => (x.id === m.id ? next : x)));
      setEditing((e) => ({ ...e, [m.id]: false }));
      toast.success(t("res.saved", { text: resultText(next, t) ?? "" }));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("common.error"));
    } finally {
      setSaving(null);
    }
  };

  const recorded = bouts.filter(hasResult).length;
  const beforeNight = dayOf(card.date) > todayUtc();

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-6">
      <Link to={`/home/events/${card.event_id}`} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-primary">
        <ArrowLeft className="w-4 h-4" aria-hidden /> {event?.name ?? t("common.back")}
      </Link>

      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 flex items-center gap-2">
            <Gavel className="w-7 h-7 text-primary" aria-hidden /> {t("res.title")} — {card.name}
          </h1>
          <p className="text-sm text-slate-500 mt-1">{formatDay(card.date, lang)} · {t("res.progress", { done: recorded, total: bouts.length })}</p>
        </div>
        <LangSwitch />
      </header>

      <p className="rounded-xl bg-[#eef3fb] border border-[#d5e0f3] p-4 text-sm text-slate-700">{isStaff ? t("res.intro") : t("res.readOnly")}</p>
      {beforeNight && <p className="rounded-xl bg-amber-50 border border-amber-200 p-4 text-sm text-amber-900">{t("res.beforeNight", { date: formatDay(card.date, lang) })}</p>}

      <ol className="space-y-4">
        {bouts.map((m, i) => {
          const d = drafts[m.id] ?? { winner: "", method: "", round: "" };
          const saved = hasResult(m) && !editing[m.id];
          const corner = d.winner === "a" || d.winner === "b";
          const choice = (value: Winner, label: string, tone: string) => (
            <button
              type="button"
              aria-pressed={d.winner === value}
              onClick={() => set(m.id, { winner: value, ...(value === "a" || value === "b" ? {} : { method: "", round: "" }) })}
              className={`h-12 px-4 rounded-xl border-2 text-sm font-semibold transition ${d.winner === value ? tone : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"}`}
            >
              {label}
            </button>
          );
          return (
            <li key={m.id} className={`rounded-2xl border bg-white p-5 ${saved ? "border-emerald-200" : "border-slate-200"}`}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-slate-400 font-bold">{i + 1}</span>
                  <FighterAvatar name={m.fighter_a_name} image={m.fighter_a_image} tone="bg-red-50 text-red-700" />
                  <span className="font-semibold text-slate-900 truncate">{m.fighter_a_name}</span>
                  <span className="text-slate-400">{t("common.vs")}</span>
                  <FighterAvatar name={m.fighter_b_name} image={m.fighter_b_image} tone="bg-blue-50 text-blue-700" />
                  <span className="font-semibold text-slate-900 truncate">{m.fighter_b_name}</span>
                </div>
                {(m.is_title_match || m.isTitleMatch) && <span className="inline-flex items-center gap-1 text-sm text-amber-700 font-semibold"><Trophy className="w-4 h-4" aria-hidden /> {t("common.titleFight")}</span>}
              </div>

              {saved ? (
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-emerald-50 px-4 py-3">
                  <p className="font-semibold text-emerald-800 flex items-center gap-2"><CheckCircle2 className="w-5 h-5" aria-hidden /> {resultText(m, t)}</p>
                  {isStaff && (
                    <button type="button" onClick={() => { setDrafts((x) => ({ ...x, [m.id]: draftOf(m) })); setEditing((e) => ({ ...e, [m.id]: true })); }} className="h-10 px-4 rounded-lg border border-emerald-300 bg-white text-sm font-semibold text-emerald-800 hover:bg-emerald-100">
                      {t("common.change")}
                    </button>
                  )}
                </div>
              ) : isStaff ? (
                <div className="mt-4 space-y-4">
                  <div>
                    <p className="text-sm font-medium text-slate-700 mb-2">{t("res.winner")}</p>
                    <div className="flex flex-wrap gap-2">
                      {choice("a", `${t("common.red")}: ${m.fighter_a_name}`, "border-red-500 bg-red-50 text-red-800")}
                      {choice("b", `${t("common.blue")}: ${m.fighter_b_name}`, "border-blue-500 bg-blue-50 text-blue-800")}
                      {choice("draw", t("card.draw"), "border-slate-500 bg-slate-100 text-slate-900")}
                      {choice("nc", t("card.noContest"), "border-slate-500 bg-slate-100 text-slate-900")}
                    </div>
                  </div>
                  {corner && (
                    <div className="grid sm:grid-cols-[minmax(0,1fr)_180px] gap-4">
                      <label className="block">
                        <span className="text-sm font-medium text-slate-700">{t("res.method")}</span>
                        <select value={d.method} onChange={(e) => set(m.id, { method: e.target.value, round: e.target.value === "Decision" ? String(m.rounds) : d.round })} className="mt-1 w-full h-12 rounded-xl border border-slate-300 bg-white px-3 text-sm">
                          <option value="">—</option>
                          {METHODS.map((k) => <option key={k} value={k}>{t(`res.method.${k}`)}</option>)}
                        </select>
                      </label>
                      <label className="block">
                        <span className="text-sm font-medium text-slate-700">{t("res.round")}</span>
                        <select value={d.round} onChange={(e) => set(m.id, { round: e.target.value })} className="mt-1 w-full h-12 rounded-xl border border-slate-300 bg-white px-3 text-sm">
                          <option value="">—</option>
                          {Array.from({ length: m.rounds || 5 }, (_, r) => <option key={r + 1} value={r + 1}>{t("common.round", { n: r + 1 })}</option>)}
                        </select>
                      </label>
                    </div>
                  )}
                  <div className="flex justify-end gap-2">
                    {hasResult(m) && (
                      <button type="button" onClick={() => setEditing((e) => ({ ...e, [m.id]: false }))} className="h-11 px-4 rounded-xl border border-slate-300 text-sm font-medium text-slate-700 hover:bg-slate-50">{t("common.cancel")}</button>
                    )}
                    <button type="button" disabled={!d.winner || saving === m.id} onClick={() => save(m)} className="h-11 px-5 rounded-xl bg-primary text-white text-sm font-semibold hover:opacity-90 disabled:opacity-40">
                      {saving === m.id ? t("common.saving") : t("res.save")}
                    </button>
                  </div>
                </div>
              ) : (
                <p className="mt-3 text-sm text-slate-500">{t("card.noResult")}</p>
              )}
            </li>
          );
        })}
      </ol>

      <ConfirmDialog
        open={!!confirmTitle}
        title={t("res.titleConfirmTitle")}
        text={t("res.titleConfirmText")}
        confirmLabel={t("res.titleConfirm")}
        danger
        busy={!!saving}
        onClose={() => setConfirmTitle(null)}
        onConfirm={() => confirmTitle && save(confirmTitle, true)}
      />
    </div>
  );
}
