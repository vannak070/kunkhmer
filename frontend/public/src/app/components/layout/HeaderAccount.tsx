import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router";
import { Bell, CheckCheck, Trophy, Swords, UserRound } from "lucide-react";
import { useFan } from "../../contexts/FanContext";
import { useI18n } from "../../i18n/LanguageContext";
import type { FanNotification } from "../../utils/fanApi";

/** Turns a notification's stored facts into a localized title, body and link. */
export function useNotificationText() {
  const { t, localName, formatDate } = useI18n();
  return (n: FanNotification) => {
    const d = n.data;
    const fighter = localName(d.fighterName, d.fighterNameKhmer);
    const opponent = localName(d.opponentName, d.opponentNameKhmer);
    const href = d.eventId ? `/matches?tab=events&event=${d.eventId}` : `/fighters/${d.fighterId}`;
    if (n.type === "bout_scheduled") {
      return {
        title: t("notify.scheduledTitle", { fighter }),
        body:
          t("notify.scheduledBody", {
            opponent,
            event: d.eventName ? ` · ${d.eventName}` : "",
            date: d.date ? ` · ${formatDate(d.date)}` : "",
          }) + ((d.status || "").toLowerCase() === "draft" ? t("notify.pendingSuffix") : ""),
        href,
      };
    }
    const method = d.method && !["draw", "no contest"].includes(d.method.toLowerCase())
      ? t("notify.byMethod", { method: d.method }) + (d.round ? t("notify.inRound", { n: d.round }) : "")
      : "";
    const key = d.outcome === "loss" ? "notify.loss" : d.outcome === "draw" ? "notify.draw" : d.outcome === "nc" ? "notify.nc" : "notify.win";
    return { title: t("notify.resultTitle", { fighter }), body: t(key, { fighter, opponent, method }), href };
  };
}

function timeAgo(iso: string, locale: string) {
  const diff = (new Date(iso).getTime() - Date.now()) / 1000;
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
  const steps: [Intl.RelativeTimeFormatUnit, number][] = [["day", 86400], ["hour", 3600], ["minute", 60]];
  for (const [unit, secs] of steps) if (Math.abs(diff) >= secs) return rtf.format(Math.round(diff / secs), unit);
  return rtf.format(0, "minute");
}

export function NotificationBell() {
  const { t, locale } = useI18n();
  const { notifications, unreadCount, markRead } = useFan();
  const text = useNotificationText();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const openItem = (n: FanNotification) => {
    setOpen(false);
    if (!n.read) markRead([n.id]).catch(() => {});
    navigate(text(n).href);
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={t("notify.open", { n: unreadCount })}
        aria-expanded={open}
        className="relative p-2.5 rounded-xl hover:bg-gray-100 transition-colors"
      >
        <Bell className="w-5 h-5 text-gray-700" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-5 h-5 px-1 rounded-full bg-[#C8102E] text-white text-[11px] font-bold flex items-center justify-center ring-2 ring-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-[min(22rem,calc(100vw-2rem))] bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <p className="font-black text-gray-900">{t("notify.title")}</p>
            {unreadCount > 0 && (
              <button type="button" onClick={() => markRead().catch(() => {})} className="inline-flex items-center gap-1 text-xs font-bold text-[#0A3D91] hover:underline">
                <CheckCheck className="w-3.5 h-3.5" aria-hidden />
                {t("notify.markAll")}
              </button>
            )}
          </div>
          {notifications.length === 0 ? (
            <p className="px-4 py-8 text-sm text-gray-500 text-center">{t("notify.empty")}</p>
          ) : (
            <ul className="max-h-[60vh] overflow-y-auto divide-y divide-gray-100">
              {notifications.map((n) => {
                const { title, body } = text(n);
                const Icon = n.type === "bout_result" ? Trophy : Swords;
                return (
                  <li key={n.id}>
                    <button
                      type="button"
                      onClick={() => openItem(n)}
                      className={`w-full flex gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors ${n.read ? "" : "bg-blue-50/60"}`}
                    >
                      <span className={`mt-0.5 w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${n.type === "bout_result" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}`}>
                        <Icon className="w-4 h-4" aria-hidden />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-start justify-between gap-2">
                          <span className="text-sm font-bold text-gray-900">{title}</span>
                          {!n.read && <span className="mt-1.5 w-2 h-2 rounded-full bg-[#0A3D91] shrink-0" aria-hidden />}
                        </span>
                        <span className="block text-sm text-gray-600">{body}</span>
                        <span className="block text-xs text-gray-400 mt-0.5">{timeAgo(n.createdAt, locale)}</span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

/** Account entry in the header: "Sign in" when signed out, the fan's initial when signed in. */
export function HeaderAccount() {
  const { t } = useI18n();
  const { fan, loading } = useFan();
  // While a saved session is being restored, don't flash "Sign in" at a signed-in fan.
  if (loading) return <span className="w-10 h-10 rounded-full bg-gray-100 animate-pulse" aria-hidden />;
  return (
    <div className="flex items-center gap-1">
      {fan && <NotificationBell />}
      <Link
        to="/account"
        aria-label={fan ? t("account.account") : t("account.signIn")}
        className={fan
          ? "w-10 h-10 rounded-full bg-[#0A3D91] text-white font-black flex items-center justify-center hover:bg-blue-800 transition-colors"
          : "inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-100 transition-colors whitespace-nowrap"}
      >
        {fan ? (
          fan.displayName.trim().charAt(0).toUpperCase()
        ) : (
          <>
            <UserRound className="w-4 h-4" aria-hidden />
            <span className="hidden sm:inline">{t("account.signIn")}</span>
          </>
        )}
      </Link>
    </div>
  );
}
