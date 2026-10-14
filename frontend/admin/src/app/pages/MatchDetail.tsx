/**
 * One bout (/home/match/:id), reached from a fight night's bout list: who fights (red / blue corner with photo, club,
 * record), the facts (title, rounds, weight), the fight night, the result, and the referee and judges.
 * KKF staff record or change the result here (Red / Blue / Draw / No contest, how it ended, the round); changing a title
 * fight's winner asks first because the belt moves. Others see the result read-only. English + Khmer.
 * The old "highlight video" field is gone: the server never stored it. See claude/updates/admin-step3-simple-pages.md.
 */
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { toast } from "sonner";
import { ArrowLeft, CalendarDays, CheckCircle2, MapPin, Shield, Trophy, Users } from "lucide-react";
import { api } from "../utils/api";
import { useOfficials } from "../hooks/useOfficials";
import { formatDay, useT } from "../i18n/program";
import { ConfirmDialog, FighterAvatar, LangSwitch, boutNumbers, cornerName, dayOf, hasBothCorners, hasResult, resultText, todayUtc } from "../components/program/shared";
import { CancelBoutDialog, ReplacementPanel, WithdrawDialog, canChangeMatch } from "../components/program/MatchChanges";
import { DisputeDialog, ReasonPrompt } from "../components/program/AfterMatch";
import { fieldCls } from "../components/program/FightNightFields";
import { METHODS, type ResultDraft, type Winner, draftOf, emptyDraft, needsTitleConfirm, resultBody, withMethod, withWinner } from "../components/program/resultForm";

export function MatchDetail() {
  const { id } = useParams();
  const { t, lang } = useT();
  const { byId } = useOfficials();
  const me = api.auth.getCurrentUser();
  const isStaff = me?.role === "Super Admin" || me?.role === "KKF Officer";

  const [match, setMatch] = useState<any | null | undefined>(undefined);
  const [card, setCard] = useState<any | null>(null);
  // The other bouts of the fight card, for "winner of bout N".
  const [siblings, setSiblings] = useState<any[]>([]);
  const [failed, setFailed] = useState(false);
  const [draft, setDraft] = useState<ResultDraft>({ ...emptyDraft });
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirmTitle, setConfirmTitle] = useState(false);
  const [dialog, setDialog] = useState<null | "withdraw" | "cancel" | "dispute">(null);
  // A signed-off match is locked: only a Super Admin corrects a result, with a reason (claude/updates/match-signoff-settlement.md).
  const [signedOff, setSignedOff] = useState(false);
  const [askReason, setAskReason] = useState(false);
  const [correction, setCorrection] = useState<string | null>(null);
  const isSuper = me?.role === "Super Admin";

  const load = async () => {
    setFailed(false);
    try {
      const m = await api.matches.get(id!);
      setMatch(m ?? null);
      if (m) setDraft(draftOf(m));
      if (m?.sub_event_id) api.batches.get(m.sub_event_id).then(setCard).catch(() => setCard(null));
      if (m?.sub_event_id) api.matches.list(m.sub_event_id).then((l: any[]) => setSiblings(l || [])).catch(() => setSiblings([]));
      if (m?.event_id) api.events.get(m.event_id).then((e: any) => setSignedOff(Boolean(e.signed_off_at))).catch(() => {});
    } catch {
      setFailed(true);
    }
  };
  useEffect(() => { load(); }, [id]);

  const spinner = <div className="p-10 flex justify-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" aria-label={t("common.loading")} /></div>;
  if (failed)
    return (
      <div className="max-w-3xl mx-auto p-8 text-center space-y-4">
        <p className="text-slate-700">{t("bo.loadFailed")}</p>
        <button type="button" onClick={load} className="h-11 px-5 rounded-xl bg-primary text-white text-sm font-semibold hover:opacity-90">{t("common.tryAgain")}</button>
      </div>
    );
  if (match === undefined) return spinner;
  if (match === null)
    return (
      <div className="max-w-3xl mx-auto p-8 text-center space-y-4">
        <p className="text-slate-700">{t("bo.notFound")}</p>
        <Link to="/home/matches" className="inline-flex items-center h-11 px-5 rounded-xl bg-primary text-white text-sm font-semibold hover:opacity-90">{t("bo.toNights")}</Link>
      </div>
    );

  const m = match;
  const isTitle = Boolean(m.is_title_match ?? m.isTitleMatch);
  const titleName = m.championshipTitleName ?? m.championship_title_name ?? null;
  const done = hasResult(m);
  const winnerSide: Winner = done ? draftOf(m).winner : "";
  const corner = draft.winner === "a" || draft.winner === "b";
  const backTo = m.event_id ? `/home/events/${m.event_id}` : "/home/matches";
  const beforeNight = card?.date ? dayOf(card.date) > todayUtc() : false;
  const cancelled = m.status === "Cancelled";
  const needsReplacement = Boolean(m.replacement_side) && !cancelled;
  const canChange = canChangeMatch(card?.date) && !done && !cancelled;
  const numbers = boutNumbers(siblings);
  const both = hasBothCorners(m);
  const emptySide: "a" | "b" | null = !m.fighter_a_id ? "a" : !m.fighter_b_id ? "b" : null;

  const save = async (confirmed = false) => {
    const r = resultBody(m, draft);
    if ("error" in r) return toast.error(t(r.error));
    // A title fight's winner changing moves the belt: ask first.
    if (!confirmed && needsTitleConfirm(m, r.winnerId)) {
      setConfirmTitle(true);
      return;
    }
    setConfirmTitle(false);
    setSaving(true);
    try {
      const updated = await api.matches.saveResult(m.id, { ...r.body, ...(correction ? { correctionReason: correction } : {}) });
      setCorrection(null);
      const next = { ...m, ...updated };
      setMatch(next);
      setDraft(draftOf(next));
      setEditing(false);
      toast.success(t("res.saved", { text: resultText(next, t) ?? "" }));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("common.error"));
    } finally {
      setSaving(false);
    }
  };

  const fighter = (side: "a" | "b") => {
    const name = cornerName(m, side, t, numbers);
    const fid = m[`fighter_${side}_id`];
    const won = winnerSide === side;
    // An empty corner has no club or record to show.
    const facts = fid ? [m[`club_${side}_name`] || t("bo.independent"), m[`fighter_${side}_record`] ? t("bo.recordLine", { r: m[`fighter_${side}_record`] }) : null].filter(Boolean) : [];
    return (
      <div className={`rounded-2xl border-2 bg-white p-5 text-center space-y-2 ${won ? "border-emerald-400" : "border-slate-200"}`}>
        <p className={`text-sm font-semibold ${side === "a" ? "text-red-700" : "text-blue-700"}`}>{t(side === "a" ? "common.red" : "common.blue")}</p>
        <div className="flex justify-center">{fid ? <FighterAvatar name={name} image={m[`fighter_${side}_image`]} tone={side === "a" ? "bg-red-50 text-red-700" : "bg-blue-50 text-blue-700"} /> : <span className="w-9 h-9 rounded-full border-2 border-dashed border-slate-300" aria-hidden />}</div>
        {fid ? <Link to={`/home/fighters/${fid}`} className="block text-lg font-bold text-slate-900 break-words hover:text-primary">{name}</Link> : <p className="text-lg font-bold text-slate-900">{name}</p>}
        <p className="text-sm text-slate-600 break-words">{facts.join(" · ")}</p>
        {won && <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-800 px-3 py-1 text-sm font-semibold"><Trophy className="w-4 h-4" aria-hidden /> {t("bo.winner")}</span>}
      </div>
    );
  };

  const official = (oid: string | null | undefined, fallback: string) => byId(oid)?.fullName ?? fallback;
  const referee = m.referee_id ? official(m.referee_id, m.referee_name || t("bo.referee")) : null;
  const judges: string[] = Array.isArray(m.judge_ids) ? m.judge_ids.map((jid: string, i: number) => official(jid, `${t("bo.judge")} ${i + 1}`)) : [];

  const choice = (value: Winner, label: string, tone: string) => (
    <button
      type="button"
      aria-pressed={draft.winner === value}
      onClick={() => setDraft((d) => withWinner(d, value))}
      className={`h-12 px-4 rounded-xl border-2 text-sm font-semibold transition ${draft.winner === value ? tone : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"}`}
    >
      {label}
    </button>
  );

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-6">
      <div className="flex items-center justify-between gap-3">
        <Link to={backTo} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-primary">
          <ArrowLeft className="w-4 h-4" aria-hidden /> {card?.event_name ?? t("bout.back")}
        </Link>
        <LangSwitch />
      </div>

      <header className="space-y-2">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 break-words">{cornerName(m, "a", t, numbers)} {t("common.vs")} {cornerName(m, "b", t, numbers)}</h1>
        <div className="flex flex-wrap items-center gap-2 text-sm">
          {isTitle && <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 px-3 py-1 font-semibold"><Trophy className="w-4 h-4" aria-hidden /> {titleName ? `${t("common.titleFight")} · ${titleName}` : t("common.titleFight")}</span>}
          {m.agreed_weight > 0 && <span className="rounded-full bg-slate-100 text-slate-700 px-3 py-1 font-semibold">{t("common.kg", { n: m.agreed_weight })}</span>}
          {m.rounds > 0 && <span className="rounded-full bg-slate-100 text-slate-700 px-3 py-1 font-semibold">{t("common.rounds", { n: m.rounds })}</span>}
        </div>
        {card && (
          <p className="text-sm text-slate-600 flex flex-wrap items-center gap-x-4 gap-y-1">
            <span className="inline-flex items-center gap-1"><CalendarDays className="w-4 h-4 shrink-0" aria-hidden /> {card.name} · {formatDay(card.date, lang)}</span>
            {card.location && <span className="inline-flex items-center gap-1"><MapPin className="w-4 h-4 shrink-0" aria-hidden /> {card.location}</span>}
          </p>
        )}
      </header>

      <div className="grid sm:grid-cols-2 gap-4">{fighter("a")}{fighter("b")}</div>

      {isStaff && !cancelled && (
        <div className="flex flex-wrap items-center gap-3">
          <button type="button" onClick={() => setDialog("dispute")} className="h-11 px-4 rounded-xl border border-slate-300 bg-white text-sm font-semibold text-slate-800 hover:border-primary hover:text-primary">{t("so.b.record")}</button>
          {signedOff && <span className="text-sm font-semibold text-emerald-800">{t("so.lockedNote")}</span>}
        </div>
      )}
      {cancelled && <p role="status" className="rounded-2xl border border-slate-300 bg-slate-100 p-4 font-semibold text-slate-700">{t("ch.cancelledBanner")}</p>}
      {needsReplacement && canChange && <ReplacementPanel match={m} onDone={(updated) => { const next = { ...m, ...updated }; setMatch(next); setDraft(draftOf(next)); }} onCancelBout={() => setDialog("cancel")} />}
      {needsReplacement && !canChange && <p role="status" className="rounded-2xl border border-red-200 bg-red-50 p-4 font-semibold text-red-900">{t("ch.needTitle")}</p>}
      {emptySide && canChange && !needsReplacement && <ReplacementPanel match={m} side={emptySide} numbers={numbers} onDone={(updated) => { const next = { ...m, ...updated }; setMatch(next); setDraft(draftOf(next)); }} />}
      {!both && !cancelled && <p role="status" className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">{t("corner.waiting")}</p>}
      {canChange && !needsReplacement && both && (
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => setDialog("withdraw")} className="h-11 px-4 rounded-xl border border-slate-300 bg-white text-sm font-semibold text-slate-800 hover:border-red-300 hover:text-red-700">{t("ch.menu.withdraw")}</button>
          <button type="button" onClick={() => setDialog("cancel")} className="h-11 px-4 rounded-xl border border-slate-300 bg-white text-sm font-semibold text-slate-800 hover:border-red-300 hover:text-red-700">{t("ch.menu.cancelBout")}</button>
        </div>
      )}
      {dialog === "dispute" && <DisputeDialog bouts={[m]} matchId={m.id} onClose={() => setDialog(null)} onDone={() => setDialog(null)} />}
      {askReason && <ReasonPrompt title={t("so.correctTitle")} text={t("so.correctText")} confirm={t("so.correctBtn")} label={t("so.reason")} onClose={() => setAskReason(false)} run={(reason) => { setCorrection(reason); setDraft(draftOf(m)); setEditing(true); setAskReason(false); }} />}
      {dialog === "withdraw" && <WithdrawDialog match={m} onClose={() => setDialog(null)} onDone={(updated) => { setMatch({ ...m, ...updated }); setDialog(null); }} />}
      {dialog === "cancel" && <CancelBoutDialog match={m} onClose={() => setDialog(null)} onDone={(updated) => { setMatch({ ...m, ...updated }); setDialog(null); }} />}

      {!cancelled && !needsReplacement && both && <section className="rounded-2xl border border-slate-200 bg-white p-5 md:p-6 space-y-4">
        <h2 className="text-lg font-bold text-slate-900">{t("bo.result")}</h2>
        {done && !editing ? (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-emerald-50 px-4 py-3">
            <p className="font-semibold text-emerald-800 flex items-center gap-2"><CheckCircle2 className="w-5 h-5 shrink-0" aria-hidden /> {resultText(m, t)}</p>
            {isStaff && (!signedOff || isSuper) && <button type="button" onClick={() => { if (signedOff) { setAskReason(true); return; } setDraft(draftOf(m)); setEditing(true); }} className="h-10 px-4 rounded-lg border border-emerald-300 bg-white text-sm font-semibold text-emerald-800 hover:bg-emerald-100">{t("common.change")}</button>}
          </div>
        ) : isStaff ? (
          <div className="space-y-4">
            {beforeNight && <p className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-sm text-amber-900">{t("res.beforeNight", { date: formatDay(card.date, lang) })}</p>}
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
                  <select value={draft.method} onChange={(e) => setDraft((d) => withMethod(d, m, e.target.value))} className={`${fieldCls} mt-1`}>
                    <option value="">—</option>
                    {METHODS.map((k) => <option key={k} value={k}>{t(`res.method.${k}`)}</option>)}
                  </select>
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-slate-700">{t("res.round")}</span>
                  <select value={draft.round} onChange={(e) => setDraft((d) => ({ ...d, round: e.target.value }))} className={`${fieldCls} mt-1`}>
                    <option value="">—</option>
                    {Array.from({ length: m.rounds || 5 }, (_, r) => <option key={r + 1} value={r + 1}>{t("common.round", { n: r + 1 })}</option>)}
                  </select>
                </label>
              </div>
            )}
            <div className="flex justify-end gap-2">
              {done && <button type="button" onClick={() => { setEditing(false); setDraft(draftOf(m)); }} className="h-11 px-4 rounded-xl border border-slate-300 text-sm font-medium text-slate-700 hover:bg-slate-50">{t("common.cancel")}</button>}
              <button type="button" disabled={!draft.winner || saving} onClick={() => save()} className="h-11 px-5 rounded-xl bg-primary text-white text-sm font-semibold hover:opacity-90 disabled:opacity-40">{saving ? t("common.saving") : t("res.save")}</button>
            </div>
          </div>
        ) : (
          <p className="text-slate-600">{t("bo.noResult")}</p>
        )}
      </section>}

      <section className="rounded-2xl border border-slate-200 bg-white p-5 md:p-6 space-y-4">
        <h2 className="text-lg font-bold text-slate-900">{t("bo.officials")}</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="flex items-start gap-3">
            <span className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0" aria-hidden><Shield className="w-5 h-5" /></span>
            <div className="min-w-0"><p className="text-sm font-semibold text-slate-600">{t("bo.referee")}</p><p className="text-base text-slate-900 break-words">{referee ?? t("bo.noReferee")}</p></div>
          </div>
          <div className="flex items-start gap-3">
            <span className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center shrink-0" aria-hidden><Users className="w-5 h-5" /></span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-600">{t("bo.judges")}</p>
              {judges.length ? <ul className="text-base text-slate-900">{judges.map((j, i) => <li key={i} className="break-words">{j}</li>)}</ul> : <p className="text-base text-slate-900">{t("bo.noJudges")}</p>}
            </div>
          </div>
        </div>
      </section>

      <ConfirmDialog
        open={confirmTitle}
        title={t("res.titleConfirmTitle")}
        text={t("res.titleConfirmText")}
        confirmLabel={t("res.titleConfirm")}
        danger
        busy={saving}
        onClose={() => setConfirmTitle(false)}
        onConfirm={() => save(true)}
      />
    </div>
  );
}
