/**
 * Match proposals (Phase 3b): every new bout goes to both fighters' clubs to accept or decline.
 * Clubs answer for their own fighters; KKF staff can answer for a club (e.g. after a phone call);
 * organizers and staff see declines with the reason and can change the fighter, which sends
 * that side back to the (new) club. Fans only see a bout once both clubs accepted it.
 */
import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { toast } from "sonner";
import { ArrowLeftRight, Calendar, ChevronRight, ClipboardCheck, Loader2, Trophy } from "lucide-react";
import { api } from "../utils/api";
import { type Answer, type SideInfo, BoutAnswerActions, ProposalBadge, answerableSides, proposalOf, waitingOnMe } from "../components/BoutAnswer";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { useAdminOverview } from "../hooks/useAdminOverview";

const STAFF_ROLES = ["Super Admin", "KKF Officer"];
const TABS: { key: Answer; label: string }[] = [
  { key: "pending", label: "Waiting" },
  { key: "declined", label: "Declined" },
  { key: "accepted", label: "Accepted" },
];

const fmtDate = (d?: string | null) =>
  d ? new Date(d).toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }) : "No date";

export function MatchProposals() {
  const me = api.auth.getCurrentUser();
  const role: string = me?.role ?? "";
  const isStaff = STAFF_ROLES.includes(role);
  const isClub = role === "Club/Gym";
  const canChangeFighter = isStaff || role === "Organizer";
  const allowed = isStaff || isClub || role === "Organizer";

  const [bouts, setBouts] = useState<any[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  // The tab is in the URL (?tab=declined) so dashboard links and shared links open the right list.
  const [params, setParams] = useSearchParams();
  const tab: Answer = TABS.some((t) => t.key === params.get("tab")) ? (params.get("tab") as Answer) : "pending";
  const setTab = (key: Answer) => setParams(key === "pending" ? {} : { tab: key }, { replace: true });
  const [changing, setChanging] = useState<{ match: any; side: SideInfo } | null>(null);
  // Keeps the dashboard to-dos and the header bell in step with answers given here.
  const { refresh: refreshOverview } = useAdminOverview();

  const load = () =>
    api.matches
      .proposals()
      .then((rows: any[]) => setBouts(rows.filter((m) => !m.result && m.event_status !== "Cancelled")))
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "Could not load match proposals."));

  useEffect(() => {
    if (allowed) load();
  }, []);

  const replace = (updated: any) => {
    setBouts((prev) => (prev ?? []).map((m) => (m.id === updated.id ? { ...m, ...updated } : m)));
    refreshOverview().catch(() => undefined);
  };

  const counts = useMemo(() => {
    const c: Record<Answer, number> = { pending: 0, declined: 0, accepted: 0 };
    for (const m of bouts ?? []) c[proposalOf(m).status]++;
    return c;
  }, [bouts]);

  // Waiting-for-you first, then soonest fight night.
  const shown = (bouts ?? [])
    .filter((m) => proposalOf(m).status === tab)
    .sort((x, y) => Number(waitingOnMe(proposalOf(y))) - Number(waitingOnMe(proposalOf(x))) || String(x.date).localeCompare(String(y.date)));
  const mineWaiting = (bouts ?? []).filter((m) => waitingOnMe(proposalOf(m))).length;

  if (!allowed) {
    return (
      <div className="p-4 md:p-8 max-w-3xl mx-auto">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
          <h1 className="text-lg font-semibold text-slate-900 mb-1">Match proposals</h1>
          <p className="text-sm text-slate-600">Only clubs, organizers and KKF staff use this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground flex items-center gap-2">
          <ClipboardCheck className="w-6 h-6 text-primary" aria-hidden /> Match proposals
        </h1>
        <p className="text-sm text-muted-foreground mt-1 font-medium">
          {isClub
            ? "Bouts proposed for your fighters. Accept them, or decline with a reason. Fans only see a bout once both clubs accept."
            : "Every new bout goes to both fighters' clubs. Fans only see it once both clubs accept."}
        </p>
      </header>

      {isClub && mineWaiting > 0 && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-3 text-sm font-medium text-amber-900">
          {mineWaiting} {mineWaiting === 1 ? "bout is" : "bouts are"} waiting for your answer.
        </div>
      )}

      <div role="tablist" aria-label="Proposal status" className="flex gap-1 rounded-xl bg-slate-100 p-1 w-full sm:w-auto sm:inline-flex">
        {TABS.map((t) => (
          <button
            key={t.key}
            role="tab"
            type="button"
            aria-selected={tab === t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 sm:flex-none h-9 px-2 sm:px-4 whitespace-nowrap rounded-lg text-sm font-semibold transition-colors ${tab === t.key ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"}`}
          >
            {t.label} <span className="ml-1 text-xs font-bold text-slate-400">{counts[t.key]}</span>
          </button>
        ))}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {!bouts && !error && (
        <div className="flex items-center gap-2 text-sm text-slate-500"><Loader2 className="w-4 h-4 animate-spin" aria-hidden /> Loading bouts…</div>
      )}
      {bouts && shown.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">
          {tab === "pending" ? "No bouts are waiting for a club's answer." : tab === "declined" ? "No declined bouts." : "No accepted bouts coming up."}
        </div>
      )}

      <ul className="space-y-4">
        {shown.map((m) => (
          <BoutCard
            key={m.id}
            match={m}
            isStaff={isStaff}
            canChangeFighter={canChangeFighter}
            onAnswered={replace}
            onChangeFighter={(side) => setChanging({ match: m, side })}
          />
        ))}
      </ul>

      {changing && (
        <ChangeFighterDialog
          match={changing.match}
          side={changing.side}
          onClose={() => setChanging(null)}
          onChanged={(updated) => { setChanging(null); replace(updated); }}
        />
      )}
    </div>
  );
}

function BoutCard({ match: m, isStaff, canChangeFighter, onAnswered, onChangeFighter }: {
  match: any;
  isStaff: boolean;
  canChangeFighter: boolean;
  onAnswered: (updated: any) => void;
  onChangeFighter: (side: SideInfo) => void;
}) {
  const p = proposalOf(m);
  const mine = answerableSides(p);
  const [changeAnswer, setChangeAnswer] = useState(false);
  const clubCanAnswer = !isStaff && mine.length > 0;
  const clubHasOpen = p.sides.some((s) => mine.includes(s.side) && s.response === "pending");

  return (
    <li className="rounded-2xl border border-slate-200 bg-white p-4 md:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <p className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5" aria-hidden />
          {fmtDate(m.date)} · {m.event_name} · {m.sub_event_name}
        </p>
        <ProposalBadge match={m} />
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        {p.sides.map((s) => (
          <div key={s.side} className={`rounded-xl border p-3 ${s.side === "a" ? "border-red-100 bg-red-50/30" : "border-blue-100 bg-blue-50/30"}`}>
            <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">{s.side === "a" ? "Red corner" : "Blue corner"}</p>
            <p className="font-semibold text-slate-900">{s.fighter}</p>
            <p className="text-sm text-slate-600">{s.club ?? "No club"}</p>
            <SideAnswer side={s} />
            <div className="mt-2 flex flex-wrap gap-2">
              {isStaff && s.response !== "accepted" && s.clubId && (
                <BoutAnswerActions match={m} side={s.side} label={s.club ?? undefined} onDone={onAnswered} />
              )}
              {canChangeFighter && s.response === "declined" && (
                <button type="button" onClick={() => onChangeFighter(s)} className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg border border-slate-300 hover:border-primary hover:text-primary text-sm font-semibold text-slate-700">
                  <ArrowLeftRight className="w-4 h-4" aria-hidden /> Change fighter
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-600">
          {m.rounds} rounds × {m.round_time} min · {m.agreed_weight} kg · {m.glove_size} {m.glove_brand}
          {m.isTitleMatch && (
            <span className="ml-2 inline-flex items-center gap-1 text-amber-700 font-semibold"><Trophy className="w-3.5 h-3.5" aria-hidden /> {m.championshipTitleName ?? "Title bout"}</span>
          )}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          {clubCanAnswer && (clubHasOpen || changeAnswer) && (
            <BoutAnswerActions match={m} onDone={(u) => { setChangeAnswer(false); onAnswered(u); }} />
          )}
          {clubCanAnswer && !clubHasOpen && !changeAnswer && (
            <button type="button" onClick={() => setChangeAnswer(true)} className="h-9 px-3 rounded-lg text-sm font-semibold text-slate-600 hover:text-primary">
              Change your answer
            </button>
          )}
          {!clubCanAnswer && (
            <Link to={`/home/matches/${m.sub_event_id}`} className="inline-flex items-center gap-1 h-9 px-3 rounded-lg text-sm font-semibold text-primary hover:bg-primary/5">
              Open fight card <ChevronRight className="w-4 h-4" aria-hidden />
            </Link>
          )}
        </div>
      </div>
    </li>
  );
}

function SideAnswer({ side: s }: { side: SideInfo }) {
  if (!s.clubId && s.response === "accepted") return <p className="mt-1 text-xs text-slate-500">No club to confirm.</p>;
  const by = s.by ? ` by ${s.by}${s.byRole && s.byRole !== "Club/Gym" ? ` (${s.byRole}, for the club)` : ""}` : "";
  if (s.response === "accepted") return <p className="mt-1 text-xs font-semibold text-emerald-700">Accepted{by}</p>;
  if (s.response === "declined") {
    return (
      <p className="mt-1 text-xs text-red-700">
        <span className="font-semibold">Declined{by}</span>{s.note ? `: ${s.note}` : ""}
      </p>
    );
  }
  return <p className="mt-1 text-xs font-semibold text-amber-700">Waiting for the club</p>;
}

/** Swap the declined side's fighter for another verified one; that side goes back to its club. */
function ChangeFighterDialog({ match: m, side, onClose, onChanged }: {
  match: any;
  side: SideInfo;
  onClose: () => void;
  onChanged: (updated: any) => void;
}) {
  const [fighters, setFighters] = useState<any[] | null>(null);
  const [picked, setPicked] = useState("");
  const [busy, setBusy] = useState(false);
  const other = side.side === "a" ? m.fighter_b_id : m.fighter_a_id;
  const current = side.side === "a" ? m.fighter_a_id : m.fighter_b_id;
  const weight = Number(m.agreed_weight);

  useEffect(() => {
    api.fighters
      .list()
      .then((rows: any[]) =>
        setFighters(
          rows
            .filter((f) => f.status === "Active" && f.id !== other && f.id !== current)
            .sort((x, y) => Math.abs(Number(x.currentWeight) - weight) - Math.abs(Number(y.currentWeight) - weight)),
        ),
      )
      .catch(() => setFighters([]));
  }, []);

  const save = async () => {
    if (!picked) return;
    setBusy(true);
    try {
      const updated = await api.matches.update(m.id, side.side === "a" ? { fighterAId: picked } : { fighterBId: picked });
      toast.success("Fighter changed — the bout was sent to the new fighter's club");
      onChanged(updated);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not change the fighter.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle>Replace {side.fighter}</DialogTitle>
          <DialogDescription>
            {side.club ?? "The club"} declined{side.note ? `: “${side.note.replace(/[.\s]+$/, "")}”.` : "."} Pick another verified fighter near {weight} kg; their club will be asked to accept.
          </DialogDescription>
        </DialogHeader>
        <label htmlFor="replacement" className="block text-sm font-medium text-slate-700">New fighter</label>
        <select
          id="replacement"
          value={picked}
          onChange={(e) => setPicked(e.target.value)}
          className="w-full h-11 rounded-xl border border-slate-300 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none px-3 text-sm bg-white"
        >
          <option value="">{fighters ? "Choose a fighter…" : "Loading fighters…"}</option>
          {(fighters ?? []).map((f) => (
            <option key={f.id} value={f.id}>
              {f.name} · {Number(f.currentWeight)} kg{f.clubName ? ` · ${f.clubName}` : ""}
            </option>
          ))}
        </select>
        <DialogFooter className="gap-2 sm:gap-2">
          <button type="button" onClick={onClose} className="h-11 px-5 rounded-xl border border-slate-300 text-sm font-medium text-slate-700 hover:bg-slate-50">Cancel</button>
          <button type="button" disabled={busy || !picked} onClick={save} className="h-11 px-5 rounded-xl bg-primary hover:bg-[#083073] disabled:opacity-60 text-white text-sm font-semibold">Change fighter</button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
