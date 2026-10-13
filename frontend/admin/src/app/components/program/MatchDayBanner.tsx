/**
 * "It's match day" (or "results still to record") with a big button into Match day mode — shown to KKF staff on the
 * match page and on the "Your next job" card on those days (claude/updates/match-day-mode.md).
 */
import { Link } from "react-router";
import { ChevronRight, Swords } from "lucide-react";
import { useT } from "../../i18n/program";
import { dayOf, hasResult, todayUtc } from "./shared";

/** Today, or earlier with results still open (and there are bouts). */
export function matchDayDue(event: any, bouts: any[]) {
  if (!bouts.length || event.status === "Cancelled" || event.signed_off_at) return null;
  const day = dayOf(event.date);
  const today = todayUtc();
  if (day === today) return "today" as const;
  if (day < today && bouts.some((b) => !hasResult(b))) return "open" as const;
  return null;
}

export function MatchDayBanner({ event, bouts }: { event: any; bouts: any[] }) {
  const { t } = useT();
  const due = matchDayDue(event, bouts);
  if (!due) return null;
  return (
    <section aria-label={t("md.title")} className="rounded-2xl border border-amber-200 bg-amber-50 p-4 md:p-5 flex flex-col sm:flex-row sm:items-center gap-3">
      <span className="w-11 h-11 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0" aria-hidden><Swords className="w-6 h-6" /></span>
      <p className="flex-1 text-base font-medium text-amber-950">{t(due === "today" ? "md.bannerToday" : "md.bannerOpen")}</p>
      <Link to={`/home/events/${event.id}/match-day`} className="inline-flex items-center justify-center gap-1.5 h-12 px-6 rounded-xl bg-primary text-white text-base font-semibold hover:opacity-90">
        {t(due === "today" ? "md.start" : "md.open")} <ChevronRight className="w-5 h-5" aria-hidden />
      </Link>
    </section>
  );
}
