/**
 * Building blocks shared by the fan site's detail pages (fighter, club, sponsor, broadcaster):
 * key-number tiles, the "next fight" spotlight with a red-vs-blue face-off, sections, sidebar
 * cards and action buttons. Light style; every value comes from the federation's records.
 */
import type { ReactNode } from "react";
import { Link } from "react-router";
import { ArrowRight, Crown, ExternalLink } from "lucide-react";
import { FighterAvatar } from "../event/EventParts";
import { CountdownChip, daysUntil } from "../fan/FanWidgets";
import type { Bout, FighterRef } from "../../data/fanData";
import { isRealImage } from "../../data/partners";
import { getFighterSlug } from "../../data/masterData";
import { textLang } from "../../utils/publicDisplay";
import { KM_MONTHS, useI18n } from "../../i18n/LanguageContext";

export const iconCls = "w-4 h-4 shrink-0";
export const time = (d?: string) => new Date(d || 0).getTime();
export const isUpcoming = (d?: string) => (daysUntil(d) ?? -1) >= 0;

export function ActionLink({ href, icon, children, primary = false }: { href: string; icon: ReactNode; children: ReactNode; primary?: boolean }) {
  const external = /^https?:/.test(href);
  return (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className={`kk-focus inline-flex items-center gap-2 h-11 px-4 rounded-xl text-sm font-semibold transition ${
        primary ? "bg-[var(--kk-blue)] text-white hover:bg-[var(--kk-navy)]" : "bg-white border border-gray-200 text-gray-800 hover:border-gray-300"
      }`}
    >
      {icon}
      {children}
      {external && <ExternalLink className="w-3.5 h-3.5 opacity-60" aria-hidden />}
    </a>
  );
}

/** Key numbers; each only when it's above zero. */
export function Stats({ items, compact = false }: { items: { icon: ReactNode; value: number; label: string }[]; compact?: boolean }) {
  const { formatNumber } = useI18n();
  const shown = items.filter((i) => i.value > 0);
  if (shown.length === 0) return null;
  return (
    <ul className={`grid grid-cols-2 gap-3 ${compact ? "" : "lg:grid-cols-4"}`}>
      {shown.map((i) => (
        <li key={i.label} className="rounded-2xl border border-gray-200 bg-white p-4 flex items-center gap-3">
          <span className="w-10 h-10 rounded-xl bg-[#eef3fb] text-[var(--kk-blue)] flex items-center justify-center shrink-0" aria-hidden>{i.icon}</span>
          <span className="min-w-0">
            <span className="block kk-stat text-2xl text-[var(--kk-navy)] leading-none">{formatNumber(i.value)}</span>
            <span className="block text-sm text-gray-600 leading-snug mt-0.5">{i.label}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}

export function Section({ title, children, action, icon }: { title: string; children: ReactNode; action?: ReactNode; icon?: ReactNode }) {
  return (
    <section className="space-y-4">
      <div className="flex items-end justify-between gap-3">
        <h2 className="kk-heading text-xl md:text-2xl text-gray-900 flex items-center gap-2">{icon}{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

export function SideCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5 space-y-3">
      <h2 className="kk-heading text-lg text-gray-900">{title}</h2>
      {children}
    </section>
  );
}

export function DetailRow({ icon, label, children }: { icon: ReactNode; label: string; children: ReactNode }) {
  return (
    <div className="flex items-start gap-3 text-sm">
      <span className="mt-0.5 text-[var(--kk-blue)]" aria-hidden>{icon}</span>
      <div className="min-w-0">
        <p className="text-xs font-semibold text-gray-500">{label}</p>
        <div className="text-gray-900 break-words">{children}</div>
      </div>
    </div>
  );
}

export function DateBadge({ date, size = "sm" }: { date?: string; size?: "sm" | "lg" }) {
  const { lang, formatNumber } = useI18n();
  const d = new Date(date || "");
  if (isNaN(d.getTime())) return null;
  const month = lang === "km" ? KM_MONTHS[d.getUTCMonth()] : d.toLocaleDateString("en", { month: "short", timeZone: "UTC" });
  return (
    <div className={`shrink-0 rounded-xl border border-[#d5e0f3] bg-[#eef3fb] text-center ${size === "lg" ? "w-16 py-2" : "w-14 py-1.5"}`} aria-hidden>
      <p lang={lang} className="kk-label text-[var(--kk-red)]">{month}</p>
      <p className={`kk-stat text-[var(--kk-navy)] leading-none ${size === "lg" ? "text-3xl" : "text-2xl"}`}>{formatNumber(d.getUTCDate())}</p>
    </div>
  );
}

/** Red vs blue with photos (or initials), linking to both fighters. */
export function FaceOff({ bout }: { bout: Bout }) {
  const { t, localName, formatWeight, tn } = useI18n();
  const side = (f: FighterRef, corner: "red" | "blue") => {
    const known = f.id && f.name && f.name !== "TBD";
    const name = known ? localName(f.name, f.nameKhmer) : t("event.tba");
    const inner = (
      <>
        <FighterAvatar f={{ ...f, image: isRealImage(f.image) ? f.image : undefined }} corner={corner} size="lg" className="!w-20 !h-20 md:!w-24 md:!h-24 bg-white" />
        <span className={`kk-label ${corner === "red" ? "text-[var(--kk-red)]" : "text-[var(--kk-blue)]"}`}>{t(corner === "red" ? "matchup.red" : "matchup.blue")}</span>
        <span lang={textLang(name)} className="kk-heading text-base md:text-lg text-gray-900 leading-tight break-words">{name}</span>
        {f.record && <span className="kk-stat text-sm text-gray-500">{f.record}</span>}
      </>
    );
    return known ? (
      <Link to={`/fighters/${getFighterSlug(f)}`} className="kk-focus flex flex-col items-center text-center gap-1.5 min-w-0 hover:opacity-90">{inner}</Link>
    ) : (
      <div className="flex flex-col items-center text-center gap-1.5 min-w-0">{inner}</div>
    );
  };
  const facts = [bout.weightKg ? formatWeight(bout.weightKg) : null, bout.rounds ? tn("common.rounds", bout.rounds) : null].filter(Boolean);
  return (
    <div className="w-full">
      <div className="grid grid-cols-[1fr_auto_1fr] items-start gap-2">
        {side(bout.fighterA, "red")}
        <span className="kk-display text-3xl md:text-4xl text-gray-300 self-center pb-6" aria-hidden>VS</span>
        {side(bout.fighterB, "blue")}
      </div>
      {(bout.isTitle || facts.length > 0) && (
        <p className="text-center text-sm font-semibold text-gray-600 mt-3 flex flex-wrap items-center justify-center gap-2">
          {bout.isTitle && <span className="inline-flex items-center gap-1 text-[#7A5B00]"><Crown className="w-4 h-4" aria-hidden />{t("matches.titleBout")}</span>}
          {facts.join(" · ")}
        </p>
      )}
    </div>
  );
}

/** The next fight (night) as a highlighted card: date, countdown, event, face-off, link. */
export function Spotlight({ label, date, title, subtitle, eventHref, bout, extra }: {
  label: string;
  date?: string;
  title: string;
  subtitle?: ReactNode;
  /** Link to the event page (eventPath / eventPathById). */
  eventHref?: string;
  bout?: Bout | null;
  extra?: ReactNode;
}) {
  const { t, formatDate } = useI18n();
  return (
    <section aria-label={label} className="rounded-3xl border border-[#d5e0f3] bg-white overflow-hidden shadow-[0_10px_40px_rgba(26,71,151,0.06)]">
      <div className={`grid ${bout ? "md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]" : ""}`}>
        <div className="p-5 md:p-7 flex flex-col gap-3">
          <p className="flex flex-wrap items-center gap-2"><span className="kk-label text-[var(--kk-red)]">{label}</span><CountdownChip date={date} /></p>
          <div className="flex items-start gap-3">
            <DateBadge date={date} size="lg" />
            <div className="min-w-0">
              <h2 lang={textLang(title)} className="kk-heading text-xl md:text-2xl text-gray-900 break-words">{title}</h2>
              <p className="text-sm text-gray-600">{formatDate(date, "long")}</p>
            </div>
          </div>
          {subtitle && <div className="text-sm text-gray-700 space-y-1.5">{subtitle}</div>}
          {extra}
          {eventHref && (
            <Link to={eventHref} className="kk-focus mt-auto self-start inline-flex items-center gap-2 h-11 px-5 rounded-xl bg-[var(--kk-blue)] text-white text-sm font-semibold hover:bg-[var(--kk-navy)]">
              {t("fights.viewCard")} <ArrowRight className="w-4 h-4" aria-hidden />
            </Link>
          )}
        </div>
        {bout && (
          <div className="bg-gradient-to-br from-[#eef3fb] to-[#fdf1f3] p-5 md:p-7 flex items-center">
            <FaceOff bout={bout} />
          </div>
        )}
      </div>
    </section>
  );
}

