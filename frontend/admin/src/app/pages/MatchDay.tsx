/**
 * Match day (/home/events/:id/match-day, KKF staff): the whole match one bout at a time, built for a phone at the ring.
 * Step 1 weigh-in (both fighters, big kg fields, Pass / Over live), step 2 result (big buttons: who won, how, which
 * round). Saving moves on: weigh-in → result → the next bout without a result. A strip of numbered buttons jumps
 * anywhere. Uses the same endpoints and rules as the Weigh-in and Results pages (a title winner change asks first).
 * English + Khmer. See claude/updates/match-day-mode.md.
 */
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, CheckCircle2, Scale, Trophy, TriangleAlert } from "lucide-react";
import { api } from "../utils/api";
import { type TextKey, useT } from "../i18n/program";
import { ConfirmDialog, FighterAvatar, LangSwitch, hasResult, overBy, resultText, weighState } from "../components/program/shared";
import { CancelBoutDialog, ReplacementPanel, WithdrawDialog } from "../components/program/MatchChanges";
import { METHODS, type ResultDraft, draftOf, emptyDraft, needsTitleConfirm, resultBody, withMethod, withWinner } from "../components/program/resultForm";

type Step = "weigh" | "result";
type Weights = { a: string; b: string };

const kgText = (v: number | null | undefined) => (v == null ? "" : String(v));
const parseKg = (v: string) => (v.trim() === "" ? null : Number(v.replace(",", ".")));

export function MatchDay() {
  const { id } = useParams();
  const { t } = useT();
  const me = api.auth.getCurrentUser();
  const isStaff = me?.role === "Super Admin" || me?.role === "KKF Officer";

  const [event, setEvent] = useState<any | null | undefined>(undefined);
  const [bouts, setBouts] = useState<any[]>([]);
  const [idx, setIdx] = useState(0);
  const [tab, setTab] = useState<Step | null>(null);
  const [weights, setWeights] = useState<Record<string, Weights>>({});
  const [drafts, setDrafts] = useState<Record<string, ResultDraft>>({});
  const [changing, setChanging] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);
  const [confirmTitle, setConfirmTitle] = useState(false);
  const [dialog, setDialog] = useState<null | "withdraw" | "cancel">(null);

  const load = async () => {
    try {
      const [ev, cards, list] = await Promise.all([api.events.get(id!), api.batches.list(id!), api.matches.listForEvent(id!)]);
      // Cards in their own order, bouts in card order.
      const cardNo = new Map((cards as any[]).sort((a, b) => (a.week_number ?? 0) - (b.week_number ?? 0) || String(a.date).localeCompare(String(b.date))).map((c, i) => [c.id, i]));
      const sorted = (list as any[]).filter((m) => m.event_id === id && m.status !== "Cancelled").sort((a, b) => (cardNo.get(a.sub_event_id) ?? 0) - (cardNo.get(b.sub_event_id) ?? 0) || (a.sort_order ?? 0) - (b.sort_order ?? 0));
      setEvent(ev);
      setBouts(sorted);
      setWeights(Object.fromEntries(sorted.map((m) => [m.id, { a: kgText(m.weigh_in_a_kg), b: kgText(m.weigh_in_b_kg) }])));
      setDrafts(Object.fromEntries(sorted.map((m) => [m.id, draftOf(m)])));
      // Start at the first bout that still needs work.
      const first = sorted.findIndex((m) => !hasResult(m));
      setIdx(first >= 0 ? first : 0);
    } catch {
      setEvent(null);
    }
  };
  useEffect(() => { load(); }, [id]);
  useEffect(() => { setTab(null); }, [idx]);

  const doneCount = bouts.filter(hasResult).length;
  const allDone = bouts.length > 0 && doneCount === bouts.length;
  const m = bouts[idx];

  const stateOf = (b: any): "done" | "over" | "weighed" | "waiting" | "replacement" =>
    b.replacement_side ? "replacement" : hasResult(b) ? "done" : weighState(b) === "over" ? "over" : weighState(b) === "ok" ? "weighed" : "waiting";
  const STRIP: Record<ReturnType<typeof stateOf>, { tone: string; label: TextKey }> = {
    done: { tone: "bg-emerald-600 text-white border-emerald-600", label: "md.s.done" },
    over: { tone: "bg-red-100 text-red-800 border-red-300", label: "md.s.over" },
    weighed: { tone: "bg-[#eef3fb] text-primary border-primary/40", label: "md.s.weighed" },
    waiting: { tone: "bg-white text-slate-700 border-slate-300", label: "md.s.waiting" },
    replacement: { tone: "bg-red-50 text-red-800 border-red-400", label: "md.s.replacement" },
  };

  const patch = (updated: any) => setBouts((list) => list.map((x) => (x.id === updated.id ? { ...x, ...updated } : x)));
  const nextOpen = (from: number) => {
    const after = bouts.findIndex((b, i) => i > from && !hasResult(b));
    return after >= 0 ? after : bouts.findIndex((b) => !hasResult(b));
  };

  const saveWeigh = async (b: any) => {
    const w = weights[b.id] ?? { a: "", b: "" };
    const a = parseKg(w.a), c = parseKg(w.b);
    if ([a, c].some((x) => x !== null && (!Number.isFinite(x) || x < 20 || x > 200))) return toast.error(t("weigh.invalid"));
    if (a === null || c === null) return toast.error(t("md.weighBoth"));
    setSaving(true);
    try {
      const updated = await api.matches.weighIn(b.id, { a, b: c });
      patch(updated);
      toast.success(t("weigh.saved"));
      setTab("result");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("common.error"));
    } finally {
      setSaving(false);
    }
  };

  const saveResult = async (b: any, confirmed = false) => {
    const r = resultBody(b, drafts[b.id] ?? emptyDraft);
    if ("error" in r) return toast.error(t(r.error));
    if (!confirmed && needsTitleConfirm(b, r.winnerId)) return setConfirmTitle(true);
    setConfirmTitle(false);
    setSaving(true);
    try {
      const updated = await api.matches.saveResult(b.id, r.body);
      const next = { ...b, ...updated };
      patch(updated);
      setDrafts((d) => ({ ...d, [b.id]: draftOf(next) }));
      setChanging((c) => ({ ...c, [b.id]: false }));
      toast.success(t("res.saved", { text: resultText(next, t) ?? "" }));
      const after = bouts.map((x) => (x.id === b.id ? next : x));
      const to = after.findIndex((x, i) => i > idx && !hasResult(x));
      const any = after.findIndex((x) => !hasResult(x));
      if (to >= 0) setIdx(to);
      else if (any >= 0) setIdx(any);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("common.error"));
    } finally {
      setSaving(false);
    }
  };

  const spinner = <div className="p-10 flex justify-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" aria-label={t("common.loading")} /></div>;
  const back = (
    <Link to={`/home/events/${id}`} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-primary">
      <ArrowLeft className="w-4 h-4" aria-hidden /> {event?.name ?? t("common.back")}
    </Link>
  );
  if (event === undefined) return spinner;
  if (event === null)
    return (
      <div className="max-w-3xl mx-auto p-8 text-center space-y-4">
        <p className="text-slate-700">{t("night.notFound")}</p>
        <Link to="/home/matches" className="inline-flex items-center h-11 px-5 rounded-xl bg-primary text-white text-sm font-semibold">{t("night.back")}</Link>
      </div>
    );
  if (!isStaff) return <div className="max-w-3xl mx-auto p-8 space-y-4">{back}<p className="text-slate-700">{t("md.staffOnly")}</p></div>;
  if (event.signed_off_at) return <div className="max-w-3xl mx-auto p-8 space-y-4">{back}<p role="status" className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 font-semibold text-emerald-900">{t("so.lockedNote")}</p></div>;
  if (bouts.length === 0) return <div className="max-w-3xl mx-auto p-8 space-y-4">{back}<p className="text-slate-700">{t("md.noBouts")}</p></div>;

  const step: Step = tab ?? (hasResult(m) || weighState(m) === "ok" || weighState(m) === "over" ? "result" : "weigh");
  const saved = hasResult(m) && !changing[m.id];
  const w = weights[m.id] ?? { a: "", b: "" };
  const d = drafts[m.id] ?? emptyDraft;
  const corner = d.winner === "a" || d.winner === "b";
  const big = "min-h-14 px-2 rounded-2xl border-2 text-[15px] leading-snug font-semibold transition";
  const pick = (on: boolean, tone: string) => `${big} ${on ? tone : "border-slate-200 bg-white text-slate-800 hover:border-slate-300"}`;
  const overNames = [m.fighter_a_name && overBy(parseKg(w.a) ?? 0, Number(m.agreed_weight)) > 0 ? m.fighter_a_name : null, m.fighter_b_name && overBy(parseKg(w.b) ?? 0, Number(m.agreed_weight)) > 0 ? m.fighter_b_name : null].filter(Boolean) as string[];

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-8 space-y-5">
      <div className="flex items-center justify-between gap-3">{back}<LangSwitch /></div>

      <header className="space-y-3">
        <div className="flex items-baseline justify-between gap-3">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">{t("md.title")}</h1>
          <p className="text-base font-semibold text-slate-600">{t("md.boutOf", { n: idx + 1, total: bouts.length })}</p>
        </div>
        <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden" role="progressbar" aria-valuemin={0} aria-valuemax={bouts.length} aria-valuenow={doneCount}>
          <div className="h-full bg-emerald-500 transition-all" style={{ width: `${(doneCount / bouts.length) * 100}%` }} />
        </div>
        <p className="text-sm text-slate-600">{t("res.progress", { done: doneCount, total: bouts.length })}</p>
        <ol className="flex gap-2 overflow-x-auto pb-1" aria-label={t("md.strip")}>
          {bouts.map((b, i) => {
            const s = STRIP[stateOf(b)];
            return (
              <li key={b.id}>
                <button type="button" onClick={() => setIdx(i)} aria-current={i === idx} aria-label={`${t("md.boutN", { n: i + 1 })}: ${t(s.label)}`} className={`w-12 h-12 rounded-xl border-2 text-base font-bold ${s.tone} ${i === idx ? "ring-2 ring-offset-2 ring-primary" : ""}`}>{i + 1}</button>
              </li>
            );
          })}
        </ol>
      </header>

      {allDone && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 flex items-start gap-3">
          <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" aria-hidden />
          <div><p className="font-bold text-emerald-900">{t("md.allDone")}</p><p className="text-emerald-800 text-sm">{t("md.allDoneText")}</p></div>
        </div>
      )}

      {m.replacement_side ? (
        <ReplacementPanel match={m} onDone={(updated) => { patch(updated); setTab("weigh"); }} onCancelBout={() => setDialog("cancel")} />
      ) : (
      <section className="rounded-3xl border border-slate-200 bg-white p-5 md:p-6 space-y-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-lg font-bold text-slate-900 break-words">{m.fighter_a_name} <span className="text-slate-400 font-normal">{t("common.vs")}</span> {m.fighter_b_name}</p>
          <p className="text-sm text-slate-600 flex flex-wrap items-center gap-x-3">
            {(m.is_title_match || m.isTitleMatch) && <span className="inline-flex items-center gap-1 text-amber-700 font-semibold"><Trophy className="w-4 h-4" aria-hidden /> {t("common.titleFight")}</span>}
            <span>{t("weigh.agreed", { kg: t("common.kg", { n: Number(m.agreed_weight) }) })}</span>
            <span>{t("common.rounds", { n: m.rounds })}</span>
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2" role="tablist">
          {([["weigh", "md.stepWeigh"], ["result", "md.stepResult"]] as const).map(([key, label]) => (
            <button key={key} type="button" role="tab" aria-selected={step === key} onClick={() => setTab(key)} className={`h-12 rounded-xl border-2 text-base font-semibold ${step === key ? "border-primary bg-[#eef3fb] text-primary" : "border-slate-200 bg-white text-slate-600"}`}>{t(label)}</button>
          ))}
        </div>

        {step === "weigh" ? (
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              {(["a", "b"] as const).map((side) => (
                <WeighCorner
                  key={side}
                  red={side === "a"}
                  name={m[`fighter_${side}_name`]}
                  club={m[`club_${side}_name`]}
                  image={m[`fighter_${side}_image`]}
                  value={w[side]}
                  agreed={Number(m.agreed_weight)}
                  disabled={hasResult(m)}
                  onChange={(v) => setWeights((x) => ({ ...x, [m.id]: { ...w, [side]: v } }))}
                />
              ))}
            </div>
            {overNames.length > 0 && (
              <p role="alert" className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800"><TriangleAlert className="w-5 h-5 shrink-0" aria-hidden /> {t("md.overWarn", { name: overNames.join(", ") })}</p>
            )}
            {!hasResult(m) && (
              <button type="button" disabled={saving} onClick={() => saveWeigh(m)} className="w-full h-16 rounded-2xl bg-primary text-white text-lg font-bold hover:opacity-90 disabled:opacity-50 inline-flex items-center justify-center gap-2">
                <Scale className="w-5 h-5" aria-hidden /> {saving ? t("common.saving") : t("md.saveWeigh")}
              </button>
            )}
            {!hasResult(m) && (
              <button type="button" onClick={() => setDialog("withdraw")} className="w-full h-12 rounded-2xl border border-slate-300 bg-white text-base font-semibold text-slate-800 hover:border-red-300 hover:text-red-700">{t("ch.menu.withdraw")}</button>
            )}
          </div>
        ) : saved ? (
          <div className="space-y-3">
            <p className="flex items-center gap-2 rounded-2xl bg-emerald-50 px-4 py-4 text-lg font-bold text-emerald-800"><CheckCircle2 className="w-6 h-6 shrink-0" aria-hidden /> {resultText(m, t)}</p>
            <button type="button" onClick={() => { setDrafts((x) => ({ ...x, [m.id]: draftOf(m) })); setChanging((c) => ({ ...c, [m.id]: true })); }} className="h-12 px-5 rounded-xl border border-slate-300 text-base font-semibold text-slate-800 hover:border-primary">{t("common.change")}</button>
          </div>
        ) : (
          <div className="space-y-5">
            <div>
              <p className="text-base font-semibold text-slate-800 mb-2">{t("md.who")}</p>
              <div className="grid sm:grid-cols-2 gap-3">
                <button type="button" aria-pressed={d.winner === "a"} onClick={() => setDrafts((x) => ({ ...x, [m.id]: withWinner(d, "a") }))} className={pick(d.winner === "a", "border-red-500 bg-red-50 text-red-800")}>{t("md.wins", { name: m.fighter_a_name })}</button>
                <button type="button" aria-pressed={d.winner === "b"} onClick={() => setDrafts((x) => ({ ...x, [m.id]: withWinner(d, "b") }))} className={pick(d.winner === "b", "border-blue-500 bg-blue-50 text-blue-800")}>{t("md.wins", { name: m.fighter_b_name })}</button>
                <button type="button" aria-pressed={d.winner === "draw"} onClick={() => setDrafts((x) => ({ ...x, [m.id]: withWinner(d, "draw") }))} className={pick(d.winner === "draw", "border-slate-500 bg-slate-100 text-slate-900")}>{t("card.draw")}</button>
                <button type="button" aria-pressed={d.winner === "nc"} onClick={() => setDrafts((x) => ({ ...x, [m.id]: withWinner(d, "nc") }))} className={pick(d.winner === "nc", "border-slate-500 bg-slate-100 text-slate-900")}>{t("card.noContest")}</button>
              </div>
            </div>
            {corner && (
              <>
                <div>
                  <p className="text-base font-semibold text-slate-800 mb-2">{t("md.how")}</p>
                  <div className="grid grid-cols-2 gap-3">
                    {METHODS.map((k) => <button key={k} type="button" aria-pressed={d.method === k} onClick={() => setDrafts((x) => ({ ...x, [m.id]: withMethod(d, m, k) }))} className={pick(d.method === k, "border-primary bg-[#eef3fb] text-primary")}>{t(`res.method.${k}`)}</button>)}
                  </div>
                </div>
                {d.method && d.method !== "Decision" && (
                  <div>
                    <p className="text-base font-semibold text-slate-800 mb-2">{t("md.round")}</p>
                    <div className="grid grid-cols-5 gap-2">
                      {Array.from({ length: m.rounds || 5 }, (_, r) => (
                        <button key={r + 1} type="button" aria-pressed={d.round === String(r + 1)} onClick={() => setDrafts((x) => ({ ...x, [m.id]: { ...d, round: String(r + 1) } }))} className={`${pick(d.round === String(r + 1), "border-primary bg-[#eef3fb] text-primary")} text-xl`}>{r + 1}</button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
            <div className="flex gap-2">
              {changing[m.id] && <button type="button" onClick={() => setChanging((c) => ({ ...c, [m.id]: false }))} className="h-16 px-5 rounded-2xl border border-slate-300 text-base font-semibold text-slate-700">{t("common.cancel")}</button>}
              <button type="button" disabled={!d.winner || saving} onClick={() => saveResult(m)} className="flex-1 h-16 rounded-2xl bg-primary text-white text-lg font-bold hover:opacity-90 disabled:opacity-40">{saving ? t("common.saving") : t("res.save")}</button>
            </div>
          </div>
        )}
      </section>
      )}

      <nav className="grid grid-cols-2 gap-3" aria-label={t("md.strip")}>
        <button type="button" disabled={idx === 0} onClick={() => setIdx(idx - 1)} className="h-14 rounded-2xl border border-slate-300 bg-white text-base font-semibold text-slate-800 disabled:opacity-40 inline-flex items-center justify-center gap-2"><ArrowLeft className="w-5 h-5" aria-hidden /> {t("md.prev")}</button>
        <button type="button" disabled={idx === bouts.length - 1 && nextOpen(idx) < 0} onClick={() => setIdx(idx < bouts.length - 1 ? idx + 1 : nextOpen(idx))} className="h-14 rounded-2xl border border-slate-300 bg-white text-base font-semibold text-slate-800 disabled:opacity-40 inline-flex items-center justify-center gap-2">{t("md.next")} <ArrowRight className="w-5 h-5" aria-hidden /></button>
      </nav>

      {dialog === "withdraw" && <WithdrawDialog match={m} onClose={() => setDialog(null)} onDone={(updated) => { patch(updated); setDialog(null); }} />}
      {dialog === "cancel" && <CancelBoutDialog match={m} onClose={() => setDialog(null)} onDone={(updated) => { patch(updated); setDialog(null); load(); }} />}

      <ConfirmDialog
        open={confirmTitle}
        title={t("res.titleConfirmTitle")}
        text={t("res.titleConfirmText")}
        confirmLabel={t("res.titleConfirm")}
        danger
        busy={saving}
        onClose={() => setConfirmTitle(false)}
        onConfirm={() => saveResult(m, true)}
      />
    </div>
  );
}

function WeighCorner({ red, name, club, image, value, agreed, disabled, onChange }: {
  red: boolean; name?: string; club?: string | null; image?: string | null; value: string; agreed: number; disabled: boolean; onChange: (v: string) => void;
}) {
  const { t } = useT();
  const kg = parseKg(value);
  const over = kg !== null && Number.isFinite(kg) ? overBy(kg, agreed) : 0;
  const status = kg === null || !Number.isFinite(kg)
    ? <span className="text-sm font-semibold text-slate-500">{t("weigh.none")}</span>
    : over > 0
      ? <span className="rounded-full bg-red-100 text-red-800 px-3 py-1 text-sm font-bold">{t("weigh.over", { kg: t("common.kg", { n: over }) })}</span>
      : <span className="rounded-full bg-emerald-100 text-emerald-800 px-3 py-1 text-sm font-bold">{t("weigh.pass")}</span>;
  const id = `md-${red ? "red" : "blue"}`;
  return (
    <div className={`rounded-2xl border border-slate-200 border-l-4 ${red ? "border-l-red-500" : "border-l-blue-500"} p-4 space-y-3`}>
      <div className="flex items-center gap-3">
        <FighterAvatar name={name} image={image} tone={red ? "bg-red-50 text-red-700" : "bg-blue-50 text-blue-700"} />
        <div className="min-w-0">
          <p className="text-xs font-semibold text-slate-500">{t(red ? "common.red" : "common.blue")}</p>
          <p className="text-base font-bold text-slate-900 break-words">{name}</p>
          {club && <p className="text-xs text-slate-500 break-words">{club}</p>}
        </div>
      </div>
      <label htmlFor={id} className="sr-only">{name}</label>
      <div className="relative">
        <input id={id} type="number" inputMode="decimal" step="0.1" min={20} max={200} value={value} disabled={disabled} onChange={(e) => onChange(e.target.value)} className="w-full h-16 rounded-2xl border-2 border-slate-300 pl-4 pr-14 text-3xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary disabled:bg-slate-50" />
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-lg text-slate-400">kg</span>
      </div>
      <div>{status}</div>
    </div>
  );
}
