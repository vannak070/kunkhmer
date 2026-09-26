/**
 * Club confirmation of bouts (Phase 3b): each side's club accepts or declines a proposed bout.
 * `proposalOf` reads the API's match fields, `ProposalBadge` shows where a bout stands, and
 * `BoutAnswerActions` lets a club (its own side) or KKF staff (either side) answer.
 */
import { useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, Clock, XCircle } from "lucide-react";
import { api } from "../utils/api";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";

export type Side = "a" | "b";
export type Answer = "pending" | "accepted" | "declined";

export interface SideInfo {
  side: Side;
  fighter: string;
  club: string | null;
  clubId: string | null;
  response: Answer;
  note: string | null;
  by: string | null;
  byRole: string | null;
}

export interface ProposalInfo {
  status: Answer;
  sides: [SideInfo, SideInfo];
}

const STAFF_ROLES = ["Super Admin", "KKF Officer"];

/** Reads a raw API match (snake_case) into both sides' answers. */
export function proposalOf(m: any): ProposalInfo {
  const side = (s: Side): SideInfo => {
    const fighter = m[`fighter_${s}`];
    return {
      side: s,
      fighter: m[`fighter_${s}_name`] ?? "TBD",
      club: fighter?.club?.name ?? m[`club_${s}_name`] ?? null,
      clubId: fighter?.club?.id ?? fighter?.clubId ?? null,
      response: (m[`club_${s}_response`] ?? "pending") as Answer,
      note: m[`club_${s}_note`] ?? null,
      by: m[`club_${s}_responder_name`] ?? null,
      byRole: m[`club_${s}_responder_role`] ?? null,
    };
  };
  const status = m.proposal_status === "accepted" || m.proposal_status === "declined" ? m.proposal_status : "pending";
  return { status, sides: [side("a"), side("b")] };
}

/** The sides the signed-in user may answer: their club's sides, or both for KKF staff. */
export function answerableSides(p: ProposalInfo): Side[] {
  const me = api.auth.getCurrentUser();
  if (STAFF_ROLES.includes(me?.role)) return ["a", "b"];
  if (me?.role !== "Club/Gym" || !me?.clubId) return [];
  return p.sides.filter((s) => s.clubId === me.clubId).map((s) => s.side);
}

/** "Waiting for you": a club with at least one of its sides unanswered. */
export function waitingOnMe(p: ProposalInfo): boolean {
  const me = api.auth.getCurrentUser();
  if (me?.role !== "Club/Gym") return false;
  const mine = answerableSides(p);
  return p.sides.some((s) => mine.includes(s.side) && s.response === "pending");
}

const TONE: Record<Answer, string> = {
  accepted: "bg-emerald-50 text-emerald-700 border-emerald-200",
  pending: "bg-amber-50 text-amber-800 border-amber-200",
  declined: "bg-red-50 text-red-700 border-red-200",
};

/** One-line status for a bout: accepted, waiting for which club(s), or declined by whom. */
export function ProposalBadge({ match, className = "" }: { match: any; className?: string }) {
  const p = proposalOf(match);
  const waiting = p.sides.filter((s) => s.response === "pending").map((s) => s.club ?? s.fighter);
  const declined = p.sides.find((s) => s.response === "declined");
  const Icon = p.status === "accepted" ? CheckCircle2 : p.status === "declined" ? XCircle : Clock;
  const label =
    p.status === "accepted"
      ? "Both clubs accepted"
      : p.status === "declined"
        ? `Declined by ${declined?.club ?? "a club"}${declined?.note ? `: ${declined.note}` : ""}`
        : `Waiting for ${[...new Set(waiting)].join(" and ") || "the clubs"}`;
  return (
    <span className={`inline-flex items-center gap-1 max-w-full rounded-lg border px-2 py-0.5 text-[11px] font-semibold ${TONE[p.status]} ${className}`} title={label}>
      <Icon className="w-3.5 h-3.5 shrink-0" aria-hidden />
      <span className="truncate">{label}</span>
    </span>
  );
}

/**
 * Accept / Decline for one side (staff) or for all of the club's sides (club users).
 * `side` is only passed for staff answering on a club's behalf.
 */
export function BoutAnswerActions({ match, side, label, onDone }: {
  match: any;
  side?: Side;
  /** Who the answer is for, shown in the decline dialog (e.g. the club name). */
  label?: string;
  onDone: (updated: any) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const vs = `${match.fighter_a_name ?? "TBD"} vs ${match.fighter_b_name ?? "TBD"}`;

  const answer = async (response: Answer, reason?: string) => {
    setBusy(true);
    try {
      const updated = await api.matches.respond(match.id, { response: response as "accepted" | "declined", note: reason, side });
      toast.success(response === "accepted" ? `Accepted: ${vs}` : `Declined: ${vs} — the organizer has been told why`);
      setOpen(false);
      setNote("");
      onDone(updated);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not save your answer.");
    } finally {
      setBusy(false);
    }
  };

  const decline = () => {
    if (!note.trim()) return setError("Tell the organizer why.");
    answer("declined", note.trim());
  };

  return (
    <>
      <div className="flex flex-wrap gap-2">
        <button type="button" disabled={busy} onClick={() => answer("accepted")} className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-sm font-semibold">
          <CheckCircle2 className="w-4 h-4" aria-hidden /> Accept
        </button>
        <button type="button" disabled={busy} onClick={() => { setError(null); setOpen(true); }} className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg border border-slate-300 hover:border-red-300 hover:text-red-700 text-slate-700 text-sm font-semibold">
          <XCircle className="w-4 h-4" aria-hidden /> Decline
        </button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>Decline {vs}?</DialogTitle>
            <DialogDescription>
              {label ? `Answering for ${label}. ` : ""}The organizer sees your reason and can change the opponent or remove the bout.
            </DialogDescription>
          </DialogHeader>
          <label htmlFor={`decline-${match.id}-${side ?? "own"}`} className="block text-sm font-medium text-slate-700">Why?</label>
          <textarea
            id={`decline-${match.id}-${side ?? "own"}`}
            rows={3}
            value={note}
            onChange={(e) => { setNote(e.target.value); setError(null); }}
            placeholder="e.g. Our fighter is injured, or the weight is too far from his current weight."
            className="w-full rounded-xl border border-slate-300 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none p-3 text-sm"
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <DialogFooter className="gap-2 sm:gap-2">
            <button type="button" onClick={() => setOpen(false)} className="h-11 px-5 rounded-xl border border-slate-300 text-sm font-medium text-slate-700 hover:bg-slate-50">Cancel</button>
            <button type="button" disabled={busy} onClick={decline} className="h-11 px-5 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white text-sm font-semibold">Decline bout</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
