/**
 * Fight-night page (/home/events/:id) — the one place an officer runs a fight night: the guided flow
 * (Agree → Build the card → Go public → Fight night, NightFlow.tsx), then the bouts with officials, weigh-in and
 * result per bout and four clear actions: Add bout, Assign officials, Weigh-in, Results. English / Khmer.
 * See claude/updates/program-officer-friendly.md and claude/updates/program-guided-fight-night.md (the fight card
 * level is hidden when there is one card; an Organizer gets a simpler "Your part / KKF's part" view).
 * Agreements (what was agreed with the broadcaster, KKF confirmation): claude/updates/offline-agreements-log.md.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import {
  ArrowLeft, CalendarClock, CalendarDays, ChevronRight, ClipboardCheck, Gavel, ImagePlus, MapPin, MoreHorizontal, Pencil, Plus, Printer, Shuffle, Copy, ListPlus, Scale, Share2, ShieldCheck, Swords, Trash2, Trophy, Tv, Ban,
} from "lucide-react";
import { api } from "../utils/api";
import { usePermissions } from "../hooks/usePermissions";
import { APPROVALS_ENABLED } from "../config/features";
import { type TextKey, formatDay, formatTime, useT } from "../i18n/program";
import { usePlaceName } from "../hooks/useSettingsLists";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { EventNextSteps } from "../components/EventNextSteps";
import { NightFlow } from "../components/program/NightFlow";
import { MatchDayBanner } from "../components/program/MatchDayBanner";
import { DisputeDialog, DisputesPanel, ReopenDialog, SettlementPanel, SignOffDialog } from "../components/program/AfterMatch";
import { CancelMatchDialog, ChangesHistory, PostponeDialog, canChangeMatch } from "../components/program/MatchChanges";
import { FightNightFields, fightNightForm, fightNightPayload, fightNightReady } from "../components/program/FightNightFields";
import { type Agreements, AgreementLog, LOCKED_FOR_ORGANIZER } from "../components/program/AgreementsPanel";
import {
  ConfirmDialog, FighterAvatar, LangSwitch, StatusChip, boutNumbers, byCardOrder, cornerName, dayOf, displayStatus, hasResult, officialsComplete, resultText, todayUtc, weighState,
} from "../components/program/shared";
import { DrawDialog } from "../components/program/DrawDialog";

const field = "w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary";

export function FightNight() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { t, lang } = useT();
  const placeName = usePlaceName();
  const permissions = usePermissions();
  const me = api.auth.getCurrentUser();
  const isStaff = me?.role === "Super Admin" || me?.role === "KKF Officer";
  const isSuper = me?.role === "Super Admin";
  const canEdit = permissions.hasPermission("events.edit");

  const [event, setEvent] = useState<any | null | undefined>(undefined);
  // A load that failed for another reason than "not found" (network, server) — offer Try again.
  const [loadFailed, setLoadFailed] = useState(false);
  const [cards, setCards] = useState<any[]>([]);
  const [bouts, setBouts] = useState<any[]>([]);
  // null = this account can't see the agreements (club, officials).
  const [agreements, setAgreements] = useState<Agreements | null>(null);
  // After the match (KKF staff): disputes, the settlement checklist and who signed off (claude/updates/match-signoff-settlement.md).
  const [disputes, setDisputes] = useState<any[]>([]);
  const [parties, setParties] = useState<any[]>([]);
  const [signedOffBy, setSignedOffBy] = useState<string | null>(null);
  const [afterDialog, setAfterDialog] = useState<null | "signoff" | "reopen" | "dispute">(null);
  const [editing, setEditing] = useState(false);
  const [addingCard, setAddingCard] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  // Copy this match to another date (claude/updates/show-templates-copy-week.md).
  const [copying, setCopying] = useState(false);
  const [confirm, setConfirm] = useState<null | "delete" | { card: any }>(null);
  // Postpone / cancel the match, with a reason (claude/updates/withdrawals-postponement.md).
  const [matchDialog, setMatchDialog] = useState<null | "postpone" | "cancel">(null);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    try {
      // Only this fight night's cards and bouts, not the whole database.
      const [ev, nightCards, nightBouts, agreed] = await Promise.all([
        api.events.get(id!),
        api.batches.list(id!),
        api.matches.listForEvent(id!),
        isStaff || me?.role === "Organizer" ? api.events.agreements(id!).catch(() => null) : Promise.resolve(null),
      ]);
      setEvent(ev);
      setAgreements(agreed);
      if (isStaff) {
        const [d, p, ch] = await Promise.all([api.events.disputes(id!).catch(() => []), api.events.settlement(id!).catch(() => []), api.events.changes(id!).catch(() => [])]);
        setDisputes(d);
        setParties(p);
        setSignedOffBy(ev.signed_off_at ? (ch as any[]).find((r) => r.kind === "sign_off")?.by_name ?? null : null);
      }
      setLoadFailed(false);
      setCards(
        (nightCards as any[])
          .filter((c) => c.event_id === id)
          .sort((a, b) => (a.week_number ?? 0) - (b.week_number ?? 0) || String(a.date).localeCompare(String(b.date))),
      );
      setBouts((nightBouts as any[]).filter((m) => m.event_id === id).sort(byCardOrder));
    } catch (e) {
      if ((e as { status?: number }).status === 404) setEvent(null);
      else setLoadFailed(true);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  // Old fight-card links arrive as #card-<id>.
  useEffect(() => {
    if (event && location.hash) document.getElementById(location.hash.slice(1))?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [event, location.hash]);

  const status = useMemo(() => (event ? displayStatus(event, bouts) : "Draft"), [event, bouts]);
  // Organizers edit their broadcaster's fight night details (and record them) until it is published.
  const canEditDetails = Boolean(event) && (canEdit || (permissions.hasPermission("events.record") && !LOCKED_FOR_ORGANIZER.includes(event.status)));

  const matchPassed = Boolean(event) && dayOf(event.date) <= todayUtc();
  const canChangeNow = Boolean(event) && (isStaff || me?.role === "Organizer") && canChangeMatch(event.date);

  const run = async (action: () => Promise<unknown>, message: string, after?: () => void) => {
    setBusy(true);
    try {
      await action();
      toast.success(message);
      setConfirm(null);
      after ? after() : await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("common.error"));
    } finally {
      setBusy(false);
    }
  };

  if (loadFailed && !event) {
    return (
      <div className="max-w-3xl mx-auto p-8 text-center space-y-4">
        <p className="text-lg font-semibold text-slate-900">{t("night.loadFailed")}</p>
        <button type="button" onClick={() => { setLoadFailed(false); setEvent(undefined); load(); }} className="h-11 px-5 rounded-xl bg-primary text-white text-sm font-semibold hover:opacity-90">{t("common.tryAgain")}</button>
      </div>
    );
  }
  if (event === undefined) {
    return <div className="p-10 flex justify-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" aria-label={t("common.loading")} /></div>;
  }
  if (event === null) {
    return (
      <div className="max-w-3xl mx-auto p-8 text-center space-y-3">
        <p className="text-lg font-semibold text-slate-900">{t("night.notFound")}</p>
        <Link to="/home/matches" className="text-primary font-semibold hover:underline">{t("night.back")}</Link>
      </div>
    );
  }

  // Legacy approval checklist, only if approvals are switched back on (config/features.ts).
  const legacyCards = cards.map((c) => ({
    id: c.id,
    name: c.name,
    status: c.status,
    matches: bouts.filter((b) => b.sub_event_id === c.id).map((b) => ({ id: b.id, winner: b.winner_id ? "x" : "", winnerMethod: b.winner_method, proposalStatus: b.proposal_status, apiMatch: b })),
  }));

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-6">
      <Link to="/home/matches" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-primary">
        <ArrowLeft className="w-4 h-4" aria-hidden /> {t("night.back")}
      </Link>
      {loadFailed && (
        <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <span>{t("night.loadFailed")}</span>
          <button type="button" onClick={() => load()} className="h-9 px-4 rounded-lg bg-white border border-amber-300 font-semibold hover:bg-amber-100">{t("common.tryAgain")}</button>
        </div>
      )}

      {/* Header */}
      <header className="rounded-2xl border border-slate-200 bg-white p-5 md:p-6 flex flex-col md:flex-row gap-5">
        {event.image && <img src={event.image} alt="" className="w-full md:w-40 h-40 md:h-40 object-cover rounded-xl bg-slate-100" />}
        <div className="flex-1 min-w-0 space-y-3">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900 break-words">{event.name}</h1>
              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-600">
                <span className="inline-flex items-center gap-1.5"><CalendarDays className="w-4 h-4 text-slate-400" aria-hidden /> {formatDay(event.date, lang)}{event.start_time ? ` · ${formatTime(event.start_time, lang)}` : ""}</span>
                <span className="inline-flex items-center gap-1.5"><MapPin className="w-4 h-4 text-slate-400" aria-hidden /> {event.location ? placeName(event.location) : t("common.notSet")}</span>
                <StatusChip status={status} />
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <LangSwitch />
              <Link to={`/events/${event.id}/sheet`} className="inline-flex items-center gap-2 h-10 px-4 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 hover:border-primary hover:text-primary">
                <Printer className="w-4 h-4" aria-hidden /> {t("sheet.print")}
              </Link>
              {canEditDetails && (
                <button type="button" onClick={() => setEditing(true)} className="inline-flex items-center gap-2 h-10 px-4 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 hover:border-primary hover:text-primary">
                  <Pencil className="w-4 h-4" aria-hidden /> {t("night.editDetails")}
                </button>
              )}
              {(canEdit || canChangeNow) && (
                <div className="relative">
                  <button type="button" onClick={() => setMoreOpen((o) => !o)} aria-expanded={moreOpen} aria-label={t("common.more")} className="inline-flex items-center justify-center w-10 h-10 rounded-xl border border-slate-200 bg-white text-slate-600 hover:border-primary">
                    <MoreHorizontal className="w-5 h-5" aria-hidden />
                  </button>
                  {moreOpen && (
                    <div className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-200 bg-white shadow-lg z-20 py-1" onMouseLeave={() => setMoreOpen(false)}>
                      {canChangeNow && event.status !== "Cancelled" && (
                        <button type="button" onClick={() => { setMoreOpen(false); setMatchDialog("postpone"); }} className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 inline-flex items-center gap-2">
                          <CalendarClock className="w-4 h-4" aria-hidden /> {t("ch.menu.postpone")}
                        </button>
                      )}
                      {canChangeNow && event.status !== "Cancelled" && (
                        <button type="button" onClick={() => { setMoreOpen(false); setMatchDialog("cancel"); }} className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 inline-flex items-center gap-2">
                          <Ban className="w-4 h-4" aria-hidden /> {t("night.cancel")}
                        </button>
                      )}
                      {isStaff && bouts.length > 0 && event.status !== "Cancelled" && (
                        <Link to={`/home/events/${event.id}/match-day`} onClick={() => setMoreOpen(false)} className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 inline-flex items-center gap-2">
                          <Swords className="w-4 h-4" aria-hidden /> {t("md.open")}
                        </Link>
                      )}
                      {canEdit && event.status !== "Cancelled" && (
                        <button type="button" onClick={() => { setMoreOpen(false); setAddingCard(true); }} className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 inline-flex items-center gap-2">
                          <Plus className="w-4 h-4" aria-hidden /> {t("night.addSecondCard")}
                        </button>
                      )}
                      {canEdit && (
                        <button type="button" onClick={() => { setMoreOpen(false); setCopying(true); }} className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 inline-flex items-center gap-2">
                          <Copy className="w-4 h-4" aria-hidden /> {t("copy.match")}
                        </button>
                      )}
                      {canEdit && isSuper && (
                        <button type="button" onClick={() => { setMoreOpen(false); setConfirm("delete"); }} className="w-full text-left px-4 py-2.5 text-sm text-red-700 hover:bg-red-50 inline-flex items-center gap-2">
                          <Trash2 className="w-4 h-4" aria-hidden /> {t("night.delete")}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2"><Tv className="w-4 h-4 text-slate-400" aria-hidden /><dt className="text-slate-500">{t("night.broadcaster")}:</dt><dd className="font-medium text-slate-800">{event.broadcast_station_name || t("common.notSet")}</dd></div>
            <div className="flex items-center gap-2"><Trophy className="w-4 h-4 text-slate-400" aria-hidden /><dt className="text-slate-500">{t("night.sponsor")}:</dt><dd className="font-medium text-slate-800">{event.main_sponsor_name || t("common.notSet")}</dd></div>
          </dl>
        </div>
      </header>

      {event.status === "Cancelled" && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-800 flex items-center gap-2">
          <Ban className="w-5 h-5" aria-hidden /> {t("night.cancelledBanner")}
        </div>
      )}

      {isStaff && <MatchDayBanner event={event} bouts={bouts} />}

      {event.signed_off_at && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-900 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5" aria-hidden /> {t("so.lockedNote")}
        </div>
      )}

      {event.postponed_from && event.status !== "Cancelled" && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-900 flex items-center gap-2">
          <CalendarClock className="w-5 h-5" aria-hidden /> {t("ch.postponedFrom", { date: formatDay(event.postponed_from, lang, false) })}
        </div>
      )}

      {APPROVALS_ENABLED ? (
        <EventNextSteps event={{ ...event, kkfStatus: event.status }} cards={legacyCards} canEdit={canEdit} onEditDetails={() => setEditing(true)} onAddFightCard={() => setAddingCard(true)} onChanged={load} />
      ) : (
        (isStaff || me?.role === "Organizer") && (
          <NightFlow event={event} cards={cards} bouts={bouts.filter((b) => b.status !== "Cancelled")} agreements={agreements} mode={isStaff ? "staff" : "organizer"} canEdit={canEdit} canEditDetails={canEditDetails} onEditDetails={() => setEditing(true)} onChanged={load}
            after={isStaff ? { disputes, parties, signedOffAt: event.signed_off_at ?? null, signedOffBy, isSuper, onSignOff: () => setAfterDialog("signoff"), onRecordDispute: () => setAfterDialog("dispute"), onReopen: () => setAfterDialog("reopen") } : undefined} />
        )
      )}

      {isStaff && matchPassed && (
        <>
          <DisputesPanel disputes={disputes} onRecord={() => setAfterDialog("dispute")} onChanged={load} />
          <SettlementPanel eventId={event.id} parties={parties} enabled={event.status !== "Cancelled"} onChanged={load} />
        </>
      )}

      {agreements && <AgreementLog log={agreements.log} />}
      {(isStaff || me?.role === "Organizer") && <ChangesHistory eventId={event.id} refreshKey={event.updated_at} />}

      {/* Bouts: the fight card level only shows when there is more than one card. */}
      {cards.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center text-slate-600">{t("night.noBoutsYet")}</p>
      ) : (
        cards.map((card) => (
          <FightCardSection
            key={card.id}
            card={card}
            bouts={bouts.filter((b) => b.sub_event_id === card.id)}
            single={cards.length === 1}
            canEdit={canEdit}
            isStaff={isStaff}
            isSuper={isSuper}
            onDelete={() => setConfirm({ card })}
            onChanged={load}
          />
        ))
      )}

      {copying && <CopyMatchDialog event={event} onClose={() => setCopying(false)} onDone={(id) => { setCopying(false); navigate(`/home/events/${id}`); }} />}
      {afterDialog === "signoff" && <SignOffDialog event={event} onClose={() => setAfterDialog(null)} onDone={() => { setAfterDialog(null); load(); }} />}
      {afterDialog === "reopen" && <ReopenDialog event={event} onClose={() => setAfterDialog(null)} onDone={() => { setAfterDialog(null); load(); }} />}
      {afterDialog === "dispute" && <DisputeDialog bouts={bouts.filter((b) => b.status !== "Cancelled")} onClose={() => setAfterDialog(null)} onDone={() => { setAfterDialog(null); load(); }} />}
      {matchDialog === "postpone" && <PostponeDialog event={event} onClose={() => setMatchDialog(null)} onDone={() => { setMatchDialog(null); load(); }} />}
      {matchDialog === "cancel" && <CancelMatchDialog event={event} onClose={() => setMatchDialog(null)} onDone={() => { setMatchDialog(null); load(); }} />}
      {editing && <EditDetailsDialog event={event} isStaff={isStaff} onClose={() => setEditing(false)} onSaved={() => { setEditing(false); load(); }} />}
      {addingCard && <AddCardDialog event={event} count={cards.length} onClose={() => setAddingCard(false)} onSaved={() => { setAddingCard(false); load(); }} />}

      <ConfirmDialog
        open={confirm === "delete"}
        title={t("night.deleteTitle")}
        text={t("night.deleteText")}
        confirmLabel={t("night.delete")}
        danger
        busy={busy}
        onClose={() => setConfirm(null)}
        onConfirm={() => run(() => api.events.delete(event.id), t("night.deleted"), () => navigate("/home/matches"))}
      />
      <ConfirmDialog
        open={typeof confirm === "object" && confirm !== null}
        title={t("card.deleteTitle")}
        text={t("card.deleteText")}
        confirmLabel={t("card.delete")}
        danger
        busy={busy}
        onClose={() => setConfirm(null)}
        onConfirm={() => typeof confirm === "object" && confirm && run(() => api.batches.delete(confirm.card.id), t("card.deleted"))}
      />
    </div>
  );
}

function FightCardSection({ card, bouts, single, canEdit, isStaff, isSuper, onDelete, onChanged }: {
  card: any; bouts: any[]; single: boolean; canEdit: boolean; isStaff: boolean; isSuper: boolean; onDelete: () => void; onChanged: () => void;
}) {
  const { t, lang } = useT();
  const [drawing, setDrawing] = useState(false);
  const numbers = boutNumbers(bouts);
  const placeName = usePlaceName();
  const navigate = useNavigate();
  const action = "inline-flex items-center gap-2 h-11 px-4 rounded-xl text-sm font-semibold border transition";
  return (
    <section id={`card-${card.id}`} aria-labelledby={`card-title-${card.id}`} className="rounded-2xl border border-slate-200 bg-white scroll-mt-24">
      <div className="p-5 md:p-6 border-b border-slate-100 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 id={`card-title-${card.id}`} className="text-lg font-bold text-slate-900">{single ? t("night.boutsTitle") : card.name}</h2>
            {!single && <p className="text-sm text-slate-500">{formatDay(card.date, lang)}{card.location ? ` · ${placeName(card.location)}` : ""}</p>}
          </div>
          {isSuper && !single && (
            <button type="button" onClick={onDelete} className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-red-700">
              <Trash2 className="w-4 h-4" aria-hidden /> {t("card.delete")}
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {canEdit && (
            <button type="button" onClick={() => navigate(`/home/matches/${card.id}/create-match`)} className={`${action} bg-primary text-white border-primary hover:opacity-90`}>
              <Plus className="w-4 h-4" aria-hidden /> {t("card.addBout")}
            </button>
          )}
          {canEdit && (
            <button type="button" onClick={() => navigate(`/home/matches/${card.id}/quick-bouts`)} className={`${action} bg-white text-slate-700 border-slate-200 hover:border-primary hover:text-primary`}>
              <ListPlus className="w-4 h-4" aria-hidden /> {t("qb.btn")}
            </button>
          )}
          {canEdit && (
            <button type="button" onClick={() => setDrawing(true)} className={`${action} bg-white text-slate-700 border-slate-200 hover:border-primary hover:text-primary`}>
              <Shuffle className="w-4 h-4" aria-hidden /> {t("draw.btn")}
            </button>
          )}
          {isStaff && bouts.length > 0 && (
            <>
              <button type="button" onClick={() => navigate(`/home/matches/${card.id}/assign-officials`)} className={`${action} bg-white text-slate-700 border-slate-200 hover:border-primary hover:text-primary`}>
                <ShieldCheck className="w-4 h-4" aria-hidden /> {t("card.officials")}
              </button>
              <button type="button" onClick={() => navigate(`/home/fight-cards/${card.id}/weigh-in`)} className={`${action} bg-white text-slate-700 border-slate-200 hover:border-primary hover:text-primary`}>
                <Scale className="w-4 h-4" aria-hidden /> {t("card.weighin")}
              </button>
              <button type="button" onClick={() => navigate(`/home/fight-cards/${card.id}/results`)} className={`${action} bg-white text-slate-700 border-slate-200 hover:border-primary hover:text-primary`}>
                <Gavel className="w-4 h-4" aria-hidden /> {t("card.results")}
              </button>
            </>
          )}
          {bouts.length > 0 && (
            <button type="button" onClick={() => navigate(`/home/batches/${card.id}/share`)} className={`${action} bg-white text-slate-700 border-slate-200 hover:border-primary hover:text-primary`}>
              <Share2 className="w-4 h-4" aria-hidden /> {t("card.share")}
            </button>
          )}
        </div>
      </div>

      {bouts.length === 0 ? (
        <p className="p-6 text-sm text-slate-500">{t("card.noBouts")}</p>
      ) : (
        <>
          <div className="hidden lg:grid grid-cols-[minmax(0,1fr)_120px_130px_minmax(0,200px)] gap-4 px-6 py-2.5 text-xs font-semibold uppercase tracking-wide text-slate-400 border-b border-slate-100">
            <span>{t("card.col.bout")}</span>
            <span>{t("card.col.officials")}</span>
            <span>{t("card.col.weighin")}</span>
            <span>{t("card.col.result")}</span>
          </div>
          <ol className="divide-y divide-slate-100">
            {bouts.map((b, i) => (
              <li key={b.id}>
                <Link to={`/home/match/${b.id}`} className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_120px_130px_minmax(0,200px)] gap-3 lg:gap-4 px-5 md:px-6 py-4 hover:bg-slate-50 items-center">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-sm font-bold text-slate-400 w-5 shrink-0">{i + 1}</span>
                    <div className="min-w-0 flex-1 grid gap-1.5">
                      <Corner name={cornerName(b, "a", t, numbers)} empty={!b.fighter_a_id} club={b.club_a_name} image={b.fighter_a_image} tone="bg-red-50 text-red-700" winner={b.winner_id && b.winner_id === b.fighter_a_id} />
                      <Corner name={cornerName(b, "b", t, numbers)} empty={!b.fighter_b_id} club={b.club_b_name} image={b.fighter_b_image} tone="bg-blue-50 text-blue-700" winner={b.winner_id && b.winner_id === b.fighter_b_id} />
                    </div>
                    <div className="text-right text-xs text-slate-500 shrink-0 space-y-1">
                      <p className="font-semibold text-slate-700">{t("common.kg", { n: Number(b.agreed_weight) })}</p>
                      <p>{t("common.rounds", { n: b.rounds })}</p>
                      {b.bout_label && <p className={`font-semibold ${b.bout_label === "international" ? "text-red-700" : "text-slate-700"}`}>{t(`boutLabel.${b.bout_label}` as TextKey)}</p>}
                      {b.rule_set === "mas_fight" && <p className="font-semibold text-red-700">{t("ruleSet.mas_fight")}</p>}
                      {(b.is_title_match || b.isTitleMatch) && <p className="inline-flex items-center gap-1 text-amber-700 font-semibold"><Trophy className="w-3 h-3" aria-hidden />{t("common.titleFight")}</p>}
                      {b.status === "Cancelled" && <p><span className="rounded-full bg-slate-200 text-slate-700 px-2 py-0.5 font-semibold">{t("ch.chip.cancelled")}</span></p>}
                      {b.replacement_side && b.status !== "Cancelled" && <p><span className="rounded-full bg-red-100 text-red-800 px-2 py-0.5 font-semibold">{t("ch.chip.replacement")}</span></p>}
                    </div>
                  </div>
                  <Pill ok={officialsComplete(b)} okText={t("card.officialsOk")} badText={t("card.officialsMissing")} icon={<ClipboardCheck className="w-3.5 h-3.5" aria-hidden />} hide={hasResult(b) && !officialsComplete(b)} />
                  <WeighPill m={b} />
                  <span className={`text-sm ${hasResult(b) ? "font-semibold text-slate-800" : "text-slate-400"}`}>{resultText(b, t) ?? t("card.noResult")}</span>
                </Link>
              </li>
            ))}
          </ol>
          <div className="px-6 py-3 text-xs text-slate-400 flex items-center gap-1">
            <ChevronRight className="w-3.5 h-3.5" aria-hidden /> {t("card.tapHint")}
          </div>
        </>
      )}
      {drawing && <DrawDialog card={card} onClose={() => setDrawing(false)} onDone={() => { setDrawing(false); onChanged(); }} />}
    </section>
  );
}

function Corner({ name, club, image, tone, winner, empty }: { name?: string; club?: string | null; image?: string | null; tone: string; winner?: boolean | "" | null; empty?: boolean }) {
  return (
    <div className="flex items-center gap-2 min-w-0">
      {empty ? <span className="w-9 h-9 rounded-full border-2 border-dashed border-slate-300 shrink-0" aria-hidden /> : <FighterAvatar name={name} image={image} tone={tone} />}
      <div className="min-w-0">
        <p className={`text-sm truncate inline-flex items-center gap-1 ${empty ? "italic text-slate-500" : winner ? "font-bold text-slate-900" : "font-semibold text-slate-800"}`}>
          {name ?? "—"}
          {winner ? <Trophy className="w-3.5 h-3.5 text-amber-500" aria-label="Winner" /> : null}
        </p>
        {club && <p className="text-xs text-slate-500 truncate">{club}</p>}
      </div>
    </div>
  );
}

function Pill({ ok, okText, badText, icon, hide }: { ok: boolean; okText: string; badText: string; icon: React.ReactNode; hide?: boolean }) {
  if (hide) return <span className="text-sm text-slate-300">—</span>;
  return (
    <span className={`inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${ok ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-800"}`}>
      {icon} {ok ? okText : badText}
    </span>
  );
}

function WeighPill({ m }: { m: any }) {
  const { t } = useT();
  const s = weighState(m);
  const map = {
    none: ["bg-slate-100 text-slate-600", t("card.notWeighed")],
    half: ["bg-amber-50 text-amber-800", t("card.weighedHalf")],
    ok: ["bg-emerald-50 text-emerald-700", t("card.weighedOk")],
    over: ["bg-red-50 text-red-700", t("card.weighedOver")],
  } as const;
  const [tone, text] = map[s];
  return (
    <span className={`inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${tone}`}>
      <Scale className="w-3.5 h-3.5" aria-hidden /> {text}
    </span>
  );
}

function EditDetailsDialog({ event, isStaff, onClose, onSaved }: { event: any; isStaff: boolean; onClose: () => void; onSaved: () => void }) {
  const { t } = useT();
  const [form, setForm] = useState(() => fightNightForm(event));
  const [busy, setBusy] = useState(false);

  const save = async () => {
    if (!fightNightReady(form)) {
      toast.error(t("steps.detailsTodo"));
      return;
    }
    setBusy(true);
    try {
      // Only KKF moves a fight night to another broadcaster.
      await api.events.update(event.id, fightNightPayload(form, isStaff));
      toast.success(t("night.saved"));
      onSaved();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("common.error"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-lg rounded-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("night.editDetails")}</DialogTitle>
        </DialogHeader>
        <FightNightFields form={form} setForm={setForm} lockStation={!isStaff} />
        <DialogFooter className="gap-2 sm:gap-2">
          <button type="button" onClick={onClose} className="h-11 px-5 rounded-xl border border-slate-300 text-sm font-medium text-slate-700 hover:bg-slate-50">{t("common.cancel")}</button>
          <button type="button" disabled={busy} onClick={save} className="h-11 px-5 rounded-xl bg-primary text-white text-sm font-semibold hover:opacity-90 disabled:opacity-60">{busy ? t("common.saving") : t("common.save")}</button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AddCardDialog({ event, count, onClose, onSaved }: { event: any; count: number; onClose: () => void; onSaved: () => void }) {
  const { t } = useT();
  const [name, setName] = useState(count === 0 ? "Main card" : `Card ${count + 1}`);
  const [date, setDate] = useState(String(event.date ?? "").slice(0, 10));
  const [busy, setBusy] = useState(false);
  const save = async () => {
    if (!name.trim() || !date) return;
    setBusy(true);
    try {
      await api.batches.create({ eventId: event.id, name: name.trim(), weekNumber: count + 1, date, location: event.location || "—" });
      toast.success(t("night.cardAdded"));
      onSaved();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("common.error"));
    } finally {
      setBusy(false);
    }
  };
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle>{t("night.addCard")}</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-slate-600">{t("night.addCardHint")}</p>
        <label className="block">
          <span className="text-sm font-medium text-slate-700">{t("night.cardName")}</span>
          <input className={`${field} mt-1`} value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-slate-700">{t("night.cardDate")}</span>
          <input type="date" className={`${field} mt-1`} value={date} onChange={(e) => setDate(e.target.value)} />
        </label>
        <DialogFooter className="gap-2 sm:gap-2">
          <button type="button" onClick={onClose} className="h-11 px-5 rounded-xl border border-slate-300 text-sm font-medium text-slate-700 hover:bg-slate-50">{t("common.cancel")}</button>
          <button type="button" disabled={busy || !name.trim() || !date} onClick={save} className="h-11 px-5 rounded-xl bg-primary text-white text-sm font-semibold hover:opacity-90 disabled:opacity-60">{t("night.addCard")}</button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/** Copy the match to another date: a new draft with the same details, without bouts or poster. */
function CopyMatchDialog({ event, onClose, onDone }: { event: any; onClose: () => void; onDone: (id: string) => void }) {
  const { t } = useT();
  const next = new Date(new Date(`${String(event.date).slice(0, 10)}T00:00:00Z`).getTime() + 7 * 86_400_000).toISOString().slice(0, 10);
  const [date, setDate] = useState(next);
  const [busy, setBusy] = useState(false);
  const save = async () => {
    if (!date) return;
    setBusy(true);
    try {
      const copy = await api.events.copy(event.id, date);
      toast.success(t("copy.done"));
      onDone(copy.id);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("common.error"));
      setBusy(false);
    }
  };
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle>{t("copy.matchTitle")}</DialogTitle>
          <DialogDescription>{t("copy.matchText")}</DialogDescription>
        </DialogHeader>
        <label className="block">
          <span className="text-sm font-semibold text-slate-800">{t("copy.date")}</span>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="mt-1 w-full h-12 rounded-xl border border-slate-300 px-3" />
        </label>
        <DialogFooter className="gap-2">
          <button type="button" onClick={onClose} className="h-11 px-5 rounded-xl border border-slate-300 text-sm font-semibold text-slate-700">{t("common.cancel")}</button>
          <button type="button" disabled={busy || !date} onClick={save} className="h-11 px-5 rounded-xl bg-primary text-white text-sm font-semibold disabled:opacity-50">{busy ? t("common.saving") : t("copy.btn")}</button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
