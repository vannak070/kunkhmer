/**
 * Fight-night page (/home/events/:id) — the one place an officer runs a fight night: the step-by-step
 * checklist, each fight card with its bouts (officials, weigh-in and result per bout) and four clear actions
 * per card: Add bout, Assign officials, Weigh-in, Results. English / Khmer. Replaces the old event page and
 * fight card page. See claude/updates/program-officer-friendly.md.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import {
  ArrowLeft, CalendarDays, ChevronRight, ClipboardCheck, Gavel, ImagePlus, MapPin, MoreHorizontal, Pencil, Plus, Scale, Share2, ShieldCheck, Trash2, Trophy, Tv, Ban,
} from "lucide-react";
import { api } from "../utils/api";
import { usePermissions } from "../hooks/usePermissions";
import { APPROVALS_ENABLED } from "../config/features";
import { formatDay, useT } from "../i18n/program";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { EventNextSteps } from "../components/EventNextSteps";
import { FightNightSteps } from "../components/program/FightNightSteps";
import { FightNightFields, fightNightForm, fightNightPayload, fightNightReady } from "../components/program/FightNightFields";
import {
  ConfirmDialog, FighterAvatar, LangSwitch, StatusChip, byCardOrder, displayStatus, hasResult, officialsComplete, resultText, weighState,
} from "../components/program/shared";

const field = "w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary";

export function FightNight() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { t, lang } = useT();
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
  const [editing, setEditing] = useState(false);
  const [addingCard, setAddingCard] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [confirm, setConfirm] = useState<null | "cancel" | "delete" | { card: any }>(null);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    try {
      // Only this fight night's cards and bouts, not the whole database.
      const [ev, nightCards, nightBouts] = await Promise.all([api.events.get(id!), api.batches.list(id!), api.matches.listForEvent(id!)]);
      setEvent(ev);
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
        <Link to="/home/program?tab=events" className="text-primary font-semibold hover:underline">{t("night.back")}</Link>
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
      <Link to="/home/program?tab=events" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-primary">
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
                <span className="inline-flex items-center gap-1.5"><CalendarDays className="w-4 h-4 text-slate-400" aria-hidden /> {formatDay(event.date, lang)}</span>
                <span className="inline-flex items-center gap-1.5"><MapPin className="w-4 h-4 text-slate-400" aria-hidden /> {event.location || t("common.notSet")}</span>
                <StatusChip status={status} />
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <LangSwitch />
              {canEdit && (
                <button type="button" onClick={() => setEditing(true)} className="inline-flex items-center gap-2 h-10 px-4 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 hover:border-primary hover:text-primary">
                  <Pencil className="w-4 h-4" aria-hidden /> {t("night.editDetails")}
                </button>
              )}
              {canEdit && (
                <div className="relative">
                  <button type="button" onClick={() => setMoreOpen((o) => !o)} aria-expanded={moreOpen} aria-label={t("common.more")} className="inline-flex items-center justify-center w-10 h-10 rounded-xl border border-slate-200 bg-white text-slate-600 hover:border-primary">
                    <MoreHorizontal className="w-5 h-5" aria-hidden />
                  </button>
                  {moreOpen && (
                    <div className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-200 bg-white shadow-lg z-20 py-1" onMouseLeave={() => setMoreOpen(false)}>
                      {event.status !== "Cancelled" && (
                        <button type="button" onClick={() => { setMoreOpen(false); setConfirm("cancel"); }} className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 inline-flex items-center gap-2">
                          <Ban className="w-4 h-4" aria-hidden /> {t("night.cancel")}
                        </button>
                      )}
                      {isSuper && (
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

      {APPROVALS_ENABLED ? (
        <EventNextSteps event={{ ...event, kkfStatus: event.status }} cards={legacyCards} canEdit={canEdit} onEditDetails={() => setEditing(true)} onAddFightCard={() => setAddingCard(true)} onChanged={load} />
      ) : (
        <FightNightSteps event={event} cards={cards} bouts={bouts} canEdit={canEdit} isStaff={isStaff} onEditDetails={() => setEditing(true)} onAddFightCard={() => setAddingCard(true)} onChanged={load} />
      )}

      {/* Fight cards */}
      {cards.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center space-y-3">
          <p className="text-slate-600">{t("night.noCards")}</p>
          {canEdit && (
            <button type="button" onClick={() => setAddingCard(true)} className="inline-flex items-center gap-2 h-11 px-5 rounded-xl bg-primary text-white text-sm font-semibold hover:opacity-90">
              <Plus className="w-4 h-4" aria-hidden /> {t("night.addCard")}
            </button>
          )}
        </div>
      ) : (
        cards.map((card) => (
          <FightCardSection
            key={card.id}
            card={card}
            bouts={bouts.filter((b) => b.sub_event_id === card.id)}
            showDate={cards.length > 1}
            canEdit={canEdit}
            isStaff={isStaff}
            isSuper={isSuper}
            onDelete={() => setConfirm({ card })}
          />
        ))
      )}

      {cards.length > 0 && canEdit && event.status !== "Cancelled" && (
        <div className="flex flex-wrap items-center gap-3">
          <button type="button" onClick={() => setAddingCard(true)} className="inline-flex items-center gap-2 h-10 px-4 rounded-xl border border-dashed border-slate-300 text-sm font-semibold text-primary hover:border-primary">
            <Plus className="w-4 h-4" aria-hidden /> {t("night.addCard")}
          </button>
          <span className="text-sm text-slate-500">{t("night.addCardHint")}</span>
        </div>
      )}

      {editing && <EditDetailsDialog event={event} onClose={() => setEditing(false)} onSaved={() => { setEditing(false); load(); }} />}
      {addingCard && <AddCardDialog event={event} count={cards.length} onClose={() => setAddingCard(false)} onSaved={() => { setAddingCard(false); load(); }} />}

      <ConfirmDialog
        open={confirm === "cancel"}
        title={t("night.cancelTitle")}
        text={t("night.cancelText")}
        confirmLabel={t("night.cancel")}
        danger
        busy={busy}
        onClose={() => setConfirm(null)}
        onConfirm={() => run(() => api.events.update(event.id, { status: "Cancelled" }), t("night.cancelled"))}
      />
      <ConfirmDialog
        open={confirm === "delete"}
        title={t("night.deleteTitle")}
        text={t("night.deleteText")}
        confirmLabel={t("night.delete")}
        danger
        busy={busy}
        onClose={() => setConfirm(null)}
        onConfirm={() => run(() => api.events.delete(event.id), t("night.deleted"), () => navigate("/home/program?tab=events"))}
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

function FightCardSection({ card, bouts, showDate, canEdit, isStaff, isSuper, onDelete }: {
  card: any; bouts: any[]; showDate: boolean; canEdit: boolean; isStaff: boolean; isSuper: boolean; onDelete: () => void;
}) {
  const { t, lang } = useT();
  const navigate = useNavigate();
  const action = "inline-flex items-center gap-2 h-11 px-4 rounded-xl text-sm font-semibold border transition";
  return (
    <section id={`card-${card.id}`} aria-labelledby={`card-title-${card.id}`} className="rounded-2xl border border-slate-200 bg-white scroll-mt-24">
      <div className="p-5 md:p-6 border-b border-slate-100 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 id={`card-title-${card.id}`} className="text-lg font-bold text-slate-900">{card.name}</h2>
            {showDate && <p className="text-sm text-slate-500">{formatDay(card.date, lang)}{card.location ? ` · ${card.location}` : ""}</p>}
          </div>
          {isSuper && (
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
          <div className="hidden md:grid grid-cols-[minmax(0,1fr)_120px_130px_minmax(0,200px)] gap-4 px-6 py-2.5 text-xs font-semibold uppercase tracking-wide text-slate-400 border-b border-slate-100">
            <span>{t("card.col.bout")}</span>
            <span>{t("card.col.officials")}</span>
            <span>{t("card.col.weighin")}</span>
            <span>{t("card.col.result")}</span>
          </div>
          <ol className="divide-y divide-slate-100">
            {bouts.map((b, i) => (
              <li key={b.id}>
                <Link to={`/home/match/${b.id}`} className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_120px_130px_minmax(0,200px)] gap-3 md:gap-4 px-5 md:px-6 py-4 hover:bg-slate-50 items-center">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-sm font-bold text-slate-400 w-5 shrink-0">{i + 1}</span>
                    <div className="min-w-0 flex-1 grid gap-1.5">
                      <Corner name={b.fighter_a_name} club={b.club_a_name} image={b.fighter_a_image} tone="bg-red-50 text-red-700" winner={b.winner_id && b.winner_id === b.fighter_a_id} />
                      <Corner name={b.fighter_b_name} club={b.club_b_name} image={b.fighter_b_image} tone="bg-blue-50 text-blue-700" winner={b.winner_id && b.winner_id === b.fighter_b_id} />
                    </div>
                    <div className="text-right text-xs text-slate-500 shrink-0 space-y-1">
                      <p className="font-semibold text-slate-700">{t("common.kg", { n: Number(b.agreed_weight) })}</p>
                      <p>{t("common.rounds", { n: b.rounds })}</p>
                      {(b.is_title_match || b.isTitleMatch) && <p className="inline-flex items-center gap-1 text-amber-700 font-semibold"><Trophy className="w-3 h-3" aria-hidden />{t("common.titleFight")}</p>}
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
    </section>
  );
}

function Corner({ name, club, image, tone, winner }: { name?: string; club?: string | null; image?: string | null; tone: string; winner?: boolean | "" | null }) {
  return (
    <div className="flex items-center gap-2 min-w-0">
      <FighterAvatar name={name} image={image} tone={tone} />
      <div className="min-w-0">
        <p className={`text-sm truncate inline-flex items-center gap-1 ${winner ? "font-bold text-slate-900" : "font-semibold text-slate-800"}`}>
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

function EditDetailsDialog({ event, onClose, onSaved }: { event: any; onClose: () => void; onSaved: () => void }) {
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
      await api.events.update(event.id, fightNightPayload(form));
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
        <FightNightFields form={form} setForm={setForm} />
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
