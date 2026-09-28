/**
 * Building blocks of the public event page (pages/EventDetail.tsx): fighter avatars, bout rows for
 * the fight card and results, and the sponsor strip. (The face-off lives in components/detail.) Red corner left, blue right.
 */
import { Link } from "react-router";
import { Clock, Crown, Swords } from "lucide-react";
import { useI18n } from "../../i18n/LanguageContext";
import { getFighterSlug } from "../../data/masterData";
import type { Bout, FighterRef } from "../../data/fanData";
import { outcomeFor } from "../../data/fanData";
import { OutcomeBadge, useResultText } from "../fan/FanWidgets";
import { PublicStatusBadge } from "../PublicStatusBadge";
import { textLang } from "../../utils/publicDisplay";

type Corner = "red" | "blue";

const CORNER_BORDER: Record<Corner, string> = {
  red: "border-[var(--kk-red)]",
  blue: "border-[var(--kk-blue)]",
};

function hasFighter(f: FighterRef) {
  return Boolean(f.id && f.name && f.name !== "TBD");
}

function useFighterName() {
  const { t, localName } = useI18n();
  return (f: FighterRef) => (hasFighter(f) ? localName(f.name, f.nameKhmer) : t("event.tba"));
}

/** Fighter photo, or their initials when the federation has no photo (never a stock image). */
export function FighterAvatar({ f, corner, size = "md", className = "" }: { f: FighterRef; corner: Corner; size?: "sm" | "md" | "lg"; className?: string }) {
  const dims = size === "lg" ? "w-28 h-28 md:w-40 md:h-40 text-3xl border-4" : size === "md" ? "w-12 h-12 md:w-14 md:h-14 text-base border-2" : "w-10 h-10 text-sm border-2";
  const initials = hasFighter(f)
    ? f.name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase()
    : "?";
  return f.image ? (
    <img src={f.image} alt="" className={`${dims} ${CORNER_BORDER[corner]} rounded-full object-cover object-top shrink-0 bg-gray-100 ${className}`} />
  ) : (
    <span aria-hidden className={`${dims} ${CORNER_BORDER[corner]} rounded-full shrink-0 inline-flex items-center justify-center kk-heading bg-gray-100 text-gray-500 ${className}`}>
      {initials}
    </span>
  );
}

function FighterName({ f, className = "" }: { f: FighterRef; className?: string }) {
  const name = useFighterName()(f);
  if (!hasFighter(f)) return <span className={className}>{name}</span>;
  return (
    <Link to={`/fighters/${getFighterSlug(f)}`} lang={textLang(name)} className={`kk-focus hover:underline underline-offset-4 ${className}`}>
      {name}
    </Link>
  );
}

function compareUrl(b: Bout) {
  return `/compare?red=${getFighterSlug(b.fighterA)}&blue=${getFighterSlug(b.fighterB)}`;
}

/**
 * One bout on the fight card or results list. With `result`, the centre shows how it ended
 * and each side gets a W/L badge; otherwise weight, rounds and status.
 */
export function BoutRow({ bout, number, result = false, awaiting = false }: { bout: Bout; number: number; result?: boolean; awaiting?: boolean }) {
  const { t, tn, formatWeight } = useI18n();
  const resultText = useResultText();
  const decided = bout.completed;
  const side = (f: FighterRef, corner: Corner) => {
    const outcome = decided && hasFighter(f) ? outcomeFor(bout, f.id) : null;
    const lost = outcome === "loss";
    return (
      <div className={`flex flex-col items-center text-center gap-2 min-w-0 md:gap-3 ${corner === "blue" ? "md:flex-row-reverse md:text-right" : "md:flex-row md:text-left"} ${lost ? "opacity-60" : ""}`}>
        <FighterAvatar f={f} corner={corner} />
        <div className="min-w-0 w-full md:w-auto md:flex-1">
          <FighterName f={f} className={`block font-bold text-gray-900 leading-snug line-clamp-2 break-words ${outcome === "win" ? "font-black" : ""}`} />
          <p className="text-xs text-gray-500 truncate">
            {[f.club, f.record].filter(Boolean).join(" · ")}
          </p>
          {result && outcome && (
            <span className="mt-1 inline-block"><OutcomeBadge outcome={outcome} size="sm" /></span>
          )}
        </div>
      </div>
    );
  };
  const facts = [bout.weightKg ? formatWeight(bout.weightKg) : null, bout.rounds ? tn("common.rounds", bout.rounds) : null].filter(Boolean);
  return (
    <li className="bg-white rounded-2xl border border-gray-200 p-4 md:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <p className="kk-label text-gray-500 flex items-center gap-2">
          {t("matches.boutNumber", { n: number })}
          {bout.isTitle && (
            <span className="inline-flex items-center gap-1 text-[#7A5B00]">
              <Crown className="w-3.5 h-3.5" aria-hidden />
              {t("matches.titleBout")}
            </span>
          )}
        </p>
        {!result && !decided && (awaiting ? (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wide bg-gray-100 text-gray-700">
            <Clock className="w-3.5 h-3.5" aria-hidden />{t("fights.pendingResult")}
          </span>
        ) : <PublicStatusBadge status={bout.status} />)}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3 md:gap-4">
        {side(bout.fighterA, "red")}
        <div className="col-span-2 order-last md:col-span-1 md:order-none text-center px-1 pt-3 border-t border-gray-100 md:pt-0 md:border-0">
          {result || decided ? (
            <p className="kk-heading text-base md:text-lg text-gray-900">{resultText(bout)}</p>
          ) : (
            <p className="kk-display text-2xl text-gray-300" aria-hidden>VS</p>
          )}
          {!result && facts.length > 0 && <p className="text-[11px] text-gray-500 font-semibold mt-0.5">{facts.join(" · ")}</p>}
        </div>
        {side(bout.fighterB, "blue")}
      </div>
      {!decided && !awaiting && hasFighter(bout.fighterA) && hasFighter(bout.fighterB) && (
        <div className="mt-3 pt-3 border-t border-gray-100 text-center">
          <Link to={compareUrl(bout)} className="kk-focus inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--kk-blue)] hover:underline underline-offset-4">
            <Swords className="w-4 h-4" aria-hidden />
            {t("matchup.preview")}
          </Link>
        </div>
      )}
    </li>
  );
}

export interface EventSponsor {
  id: string;
  name: string;
  logo?: string | null;
  url?: string | null;
}

export function SponsorStrip({ sponsors }: { sponsors: EventSponsor[] }) {
  const { t } = useI18n();
  if (sponsors.length === 0) return null;
  return (
    <div>
      <h3 className="kk-label text-gray-500 mb-3">{t("event.presentedBy")}</h3>
      <ul className="flex flex-wrap gap-3">
        {sponsors.map((s) => {
          const body = (
            <>
              {s.logo && <img src={s.logo} alt="" className="w-10 h-10 rounded-lg object-contain bg-white" />}
              <span lang={textLang(s.name)} className="font-semibold text-gray-900">{s.name}</span>
            </>
          );
          const cls = "flex items-center gap-3 px-4 py-2 rounded-xl border border-gray-200 bg-white";
          return (
            <li key={s.id}>
              {s.url ? (
                <a href={s.url} target="_blank" rel="noopener noreferrer" className={`kk-focus ${cls} hover:border-[var(--kk-blue)] transition-colors`}>{body}</a>
              ) : (
                <div className={cls}>{body}</div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
