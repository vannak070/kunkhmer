/**
 * KKF approval steps in the admin: event approval (submit / approve / send back), club answers on bouts
 * (Match Proposals) and fighter verification (Verify / Send back). Off for now: KKF Officers and Super Admins
 * run the whole Program flow and Organizer / Club/Gym accounts are read-only
 * (claude/updates/officer-run-program.md). To bring approvals back, set this to true AND start the backend
 * with APPROVALS_ENABLED=true.
 */
export const APPROVALS_ENABLED = false;
