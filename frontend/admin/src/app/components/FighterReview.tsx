/**
 * KKF fighter verification controls: Verify (→ Active) and Send back with a reason (→ Rejected).
 * Shown to KKF Officers and Super Admins for fighters that are waiting for verification.
 */
import { useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, Undo2 } from "lucide-react";
import { api } from "../utils/api";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";

export const WAITING_STATUSES = ["Draft", "Pending KKF Verification", "Pending"];
export const isWaiting = (status?: string | null) => WAITING_STATUSES.includes(status ?? "");
export const canReviewFighters = () => {
  const role = api.auth.getCurrentUser()?.role;
  return role === "Super Admin" || role === "KKF Officer";
};

export function FighterReviewActions({ fighter, onDone, compact = false }: {
  fighter: { id: string; name: string; status?: string };
  onDone: (updated: any) => void;
  compact?: boolean;
}) {
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  const verify = async () => {
    setBusy(true);
    try {
      const updated = await api.fighters.verify(fighter.id);
      toast.success(`${fighter.name} is verified and can now be matched`);
      onDone(updated);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not verify this fighter.");
    } finally {
      setBusy(false);
    }
  };

  const sendBack = async () => {
    if (!reason.trim()) return setError("Tell the club what to fix.");
    setBusy(true);
    try {
      const updated = await api.fighters.reject(fighter.id, reason.trim());
      toast.success(`${fighter.name} was sent back to the club`);
      setOpen(false);
      setReason("");
      onDone(updated);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not send this fighter back.");
    } finally {
      setBusy(false);
    }
  };

  const h = compact ? "h-9 px-3 text-sm" : "h-10 px-4 text-sm";
  return (
    <>
      <div className="flex flex-wrap gap-2">
        <button type="button" disabled={busy} onClick={verify} className={`inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-semibold ${h}`}>
          <CheckCircle2 className="w-4 h-4" aria-hidden /> Verify
        </button>
        <button type="button" disabled={busy} onClick={() => { setError(null); setOpen(true); }} className={`inline-flex items-center gap-1.5 rounded-lg border border-slate-300 hover:border-red-300 hover:text-red-700 text-slate-700 font-semibold ${h}`}>
          <Undo2 className="w-4 h-4" aria-hidden /> Send back
        </button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>Send {fighter.name} back?</DialogTitle>
            <DialogDescription>The club sees your reason, fixes the details and saves — it then comes back to KKF automatically.</DialogDescription>
          </DialogHeader>
          <label htmlFor={`reason-${fighter.id}`} className="block text-sm font-medium text-slate-700">What needs fixing?</label>
          <textarea
            id={`reason-${fighter.id}`}
            rows={3}
            value={reason}
            onChange={(e) => { setReason(e.target.value); setError(null); }}
            placeholder="e.g. The photo is missing, or the date of birth doesn't match the ID."
            className="w-full rounded-xl border border-slate-300 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none p-3 text-sm"
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <DialogFooter className="gap-2 sm:gap-2">
            <button type="button" onClick={() => setOpen(false)} className="h-11 px-5 rounded-xl border border-slate-300 text-sm font-medium text-slate-700 hover:bg-slate-50">Cancel</button>
            <button type="button" disabled={busy} onClick={sendBack} className="h-11 px-5 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white text-sm font-semibold">Send back</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
