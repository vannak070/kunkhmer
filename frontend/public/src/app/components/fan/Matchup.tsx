import { Link } from "react-router";
import { ChevronLeft, ChevronRight, HelpCircle, Swords } from "lucide-react";
import { useI18n } from "../../i18n/LanguageContext";
import { fightHistory, type FanData } from "../../data/fanData";
import { getFighterSlug } from "../../data/masterData";
import {
  buildProfile, edge, EDGE_THRESHOLD, ratingOn, sharedMetrics,
  type FighterProfile, type MetricDef,
} from "../../data/matchup";
import { OutcomeBadge, useResultText } from "./FanWidgets";
import { nationalityLabel } from "../../data/fighterLabels";

const RED = "#DC2626";
const BLUE = "#2563EB";

type Corner = "red" | "blue";

function EdgeMark({ corner }: { corner: Corner | null }) {
  if (!corner) return <span className="w-4" aria-hidden />;
  const Icon = corner === "red" ? ChevronLeft : ChevronRight;
  return <Icon className="w-4 h-4 shrink-0" style={{ color: corner === "red" ? RED : BLUE }} strokeWidth={3} aria-hidden />;
}

/** One radar with both fighters overlaid, so the shapes can be compared directly. */
export function MatchupRadar({ metrics, red, blue }: { metrics: MetricDef[]; red: FighterProfile; blue: FighterProfile }) {
  const { t } = useI18n();
  const size = 320;
  const c = size / 2;
  const r = 110;
  const n = metrics.length;
  const angle = (i: number) => -Math.PI / 2 + (i * 2 * Math.PI) / n;
  const point = (i: number, v: number) => [c + Math.cos(angle(i)) * (r * v) / 100, c + Math.sin(angle(i)) * (r * v) / 100];
  const poly = (p: FighterProfile) => metrics.map((m, i) => point(i, p.metrics[m.id] ?? 0).join(",")).join(" ");

  return (
    <svg viewBox={`-70 -14 ${size + 140} ${size + 28}`} className="w-full max-w-[420px] mx-auto" role="img"
      aria-label={metrics.map((m) => `${t(m.label)}: ${red.metrics[m.id]} / ${blue.metrics[m.id]}`).join("; ")}>
      {[25, 50, 75, 100].map((lvl) => (
        <polygon key={lvl} points={metrics.map((_, i) => point(i, lvl).join(",")).join(" ")}
          fill={lvl === 100 ? "#F8FAFC" : "none"} stroke="#E2E8F0" strokeWidth={1} />
      ))}
      {metrics.map((_, i) => {
        const [x, y] = point(i, 100);
        return <line key={i} x1={c} y1={c} x2={x} y2={y} stroke="#E2E8F0" strokeWidth={1} />;
      })}
      <polygon points={poly(blue)} fill={BLUE} fillOpacity={0.18} stroke={BLUE} strokeWidth={2} strokeLinejoin="round" />
      <polygon points={poly(red)} fill={RED} fillOpacity={0.18} stroke={RED} strokeWidth={2} strokeLinejoin="round" />
      {metrics.map((m, i) => (
        <g key={m.id}>
          <circle cx={point(i, blue.metrics[m.id] ?? 0)[0]} cy={point(i, blue.metrics[m.id] ?? 0)[1]} r={3.5} fill={BLUE} />
          <circle cx={point(i, red.metrics[m.id] ?? 0)[0]} cy={point(i, red.metrics[m.id] ?? 0)[1]} r={3.5} fill={RED} />
        </g>
      ))}
      {metrics.map((m, i) => {
        const [x, y] = point(i, 124);
        const anchor = Math.abs(x - c) < 8 ? "middle" : x > c ? "start" : "end";
        return (
          <text key={m.id} x={x} y={y} textAnchor={anchor} dominantBaseline="middle"
            className="fill-slate-600" style={{ fontSize: 13, fontWeight: 700 }}>
            {t(m.label)}
          </text>
        );
      })}
    </svg>
  );
}

/** Diverging bar: red grows left from the centre, blue grows right. */
function CompareBar({ label, hint, red, blue }: { label: string; hint: string; red: number; blue: number }) {
  const lead = edge(red, blue, EDGE_THRESHOLD);
  return (
    <div className="py-2.5" title={hint}>
      <div className="flex items-center justify-between text-sm mb-1.5">
        <span className={`w-10 font-black tabular-nums ${lead === "red" ? "text-red-600" : "text-slate-500"}`}>{red}</span>
        <span className="flex items-center gap-1 text-xs font-bold uppercase tracking-wide text-slate-500">
          <EdgeMark corner={lead === "red" ? "red" : null} />
          {label}
          <EdgeMark corner={lead === "blue" ? "blue" : null} />
        </span>
        <span className={`w-10 text-right font-black tabular-nums ${lead === "blue" ? "text-blue-600" : "text-slate-500"}`}>{blue}</span>
      </div>
      <div className="grid grid-cols-2 gap-1">
        <div className="h-2 bg-slate-100 rounded-l-full overflow-hidden flex justify-end">
          <div className="h-full rounded-l-full" style={{ width: `${red}%`, background: RED, opacity: lead === "blue" ? 0.45 : 1 }} />
        </div>
        <div className="h-2 bg-slate-100 rounded-r-full overflow-hidden">
          <div className="h-full rounded-r-full" style={{ width: `${blue}%`, background: BLUE, opacity: lead === "red" ? 0.45 : 1 }} />
        </div>
      </div>
    </div>
  );
}

function TaleRow({ label, red, blue, lead }: { label: string; red: string; blue: string; lead?: Corner | null }) {
  if (!red && !blue) return null;
  return (
    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 py-2.5 border-b border-slate-100 last:border-0 text-sm">
      <span className={`text-right ${lead === "red" ? "font-black text-slate-900" : "font-semibold text-slate-600"}`}>{red || "—"}</span>
      <span className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wide text-slate-400 whitespace-nowrap">
        <EdgeMark corner={lead === "red" ? "red" : null} />
        {label}
        <EdgeMark corner={lead === "blue" ? "blue" : null} />
      </span>
      <span className={`${lead === "blue" ? "font-black text-slate-900" : "font-semibold text-slate-600"}`}>{blue || "—"}</span>
    </div>
  );
}

function CornerHeader({ p, corner, rating }: { p: FighterProfile; corner: Corner; rating: number | null }) {
  const { t, localName, lang } = useI18n();
  const color = corner === "red" ? RED : BLUE;
  const alt = p.nameKhmer && p.nameKhmer !== p.name;
  return (
    <Link
      to={`/fighters/${getFighterSlug(p)}`}
      className={`flex flex-col md:flex-row items-center gap-2 md:gap-4 min-w-0 group text-center ${
        corner === "blue" ? "md:flex-row-reverse md:text-right" : "md:text-left"
      }`}
    >
      {p.image && !p.image.includes("images.unsplash.com") ? (
        <img src={p.image} alt="" className="w-16 h-16 md:w-24 md:h-24 rounded-2xl object-cover object-top shrink-0 border-4 bg-white" style={{ borderColor: color }} />
      ) : (
        <span aria-hidden className="w-16 h-16 md:w-24 md:h-24 rounded-2xl shrink-0 border-4 bg-white flex items-center justify-center kk-heading text-2xl text-gray-500" style={{ borderColor: color }}>
          {p.name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase()}
        </span>
      )}
      <div className="min-w-0">
        <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color }}>
          {t(corner === "red" ? "matchup.red" : "matchup.blue")}
        </p>
        <p className="text-base md:text-2xl kk-heading text-gray-900 leading-tight line-clamp-2 md:truncate break-words group-hover:underline underline-offset-4">
          {localName(p.name, p.nameKhmer)}
        </p>
        {alt && <p className="text-xs md:text-sm text-gray-500 truncate">{lang === "km" ? p.name : p.nameKhmer}</p>}
        {rating != null && (
          <p className={`mt-1 flex flex-col md:flex-row items-center md:items-baseline gap-0 md:gap-1.5 ${corner === "blue" ? "md:justify-end" : ""}`}>
            <span className="kk-stat text-3xl md:text-4xl text-[var(--kk-navy)]">{rating}</span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 whitespace-nowrap">{t("matchup.rating")}</span>
          </p>
        )}
      </div>
    </Link>
  );
}

export function MatchupView({ data, redId, blueId }: { data: FanData; redId: string; blueId: string }) {
  const { t, formatWeight, formatDate, lang } = useI18n();
  const resultText = useResultText();
  const redRaw = data.fighters.find((f) => f.id === redId);
  const blueRaw = data.fighters.find((f) => f.id === blueId);
  if (!redRaw || !blueRaw) return null;

  const red = buildProfile(data, redRaw);
  const blue = buildProfile(data, blueRaw);
  const metrics = sharedMetrics(red, blue);
  const redRating = ratingOn(red, metrics);
  const blueRating = ratingOn(blue, metrics);
  const pct = (p: FighterProfile) => (p.record.total ? Math.round((p.record.wins / p.record.total) * 100) : null);
  const height = (cm: number | null) => (cm ? `${cm} cm${lang === "en" ? ` (${Math.floor(cm / 30.48)}′${Math.round((cm / 2.54) % 12)}″)` : ""}` : "");
  const meetings = fightHistory(data, red.id).filter((h) => h.opponent.id === blue.id);

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="rounded-3xl overflow-hidden border border-[#d5e0f3] bg-gradient-to-r from-[#fdf1f3] via-white to-[#eef3fb] shadow-[0_10px_40px_rgba(26,71,151,0.06)]">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 md:gap-6 px-4 md:px-10 py-6 md:py-8">
          <CornerHeader p={red} corner="red" rating={redRating} />
          <div className="flex flex-col items-center gap-1">
            <Swords className="w-7 h-7 md:w-9 md:h-9 text-[#b58a00]" aria-hidden />
            <span className="kk-display text-xl text-gray-300">VS</span>
          </div>
          <CornerHeader p={blue} corner="blue" rating={blueRating} />
        </div>
      </section>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Tale of the tape */}
        <section className="bg-white rounded-3xl border border-slate-200 p-5 md:p-8">
          <h2 className="text-lg font-black text-slate-900 mb-3 text-center">{t("matchup.tale")}</h2>
          <TaleRow label={t("matchup.record")} red={`${red.record.wins}-${red.record.losses}-${red.record.draws}`} blue={`${blue.record.wins}-${blue.record.losses}-${blue.record.draws}`} lead={edge(red.record.wins, blue.record.wins)} />
          <TaleRow label={t("matchup.winPct")} red={pct(red) != null ? `${pct(red)}%` : ""} blue={pct(blue) != null ? `${pct(blue)}%` : ""} lead={edge(pct(red), pct(blue), 1)} />
          <TaleRow label={t("matchup.bouts")} red={red.record.total ? String(red.record.total) : ""} blue={blue.record.total ? String(blue.record.total) : ""} lead={edge(red.record.total, blue.record.total)} />
          <TaleRow label={t("matchup.age")} red={red.age != null ? String(red.age) : ""} blue={blue.age != null ? String(blue.age) : ""} />
          <TaleRow label={t("matchup.height")} red={height(red.heightCm)} blue={height(blue.heightCm)} lead={edge(red.heightCm, blue.heightCm)} />
          <TaleRow label={t("matchup.weight")} red={formatWeight(red.weightKg)} blue={formatWeight(blue.weightKg)} />
          <TaleRow label={t("matchup.nationality")} red={red.nationality ? nationalityLabel(t, red.nationality) : ""} blue={blue.nationality ? nationalityLabel(t, blue.nationality) : ""} />
          <TaleRow label={t("matchup.club")} red={red.club || ""} blue={blue.club || ""} />
        </section>

        {/* Data profile */}
        <section className="bg-white rounded-3xl border border-slate-200 p-5 md:p-8">
          <h2 className="text-lg font-black text-slate-900 mb-3 text-center">{t("matchup.profile")}</h2>
          {metrics.length >= 3 && <MatchupRadar metrics={metrics} red={red} blue={blue} />}
          {metrics.length >= 1 ? (
            <div className="mt-2">
              {metrics.map((m) => (
                <CompareBar key={m.id} label={t(m.label)} hint={t(m.hint)} red={red.metrics[m.id]!} blue={blue.metrics[m.id]!} />
              ))}
            </div>
          ) : null}
          {metrics.length < 3 && (
            <p className="mt-3 text-sm text-slate-500 bg-slate-50 rounded-xl px-4 py-3">{t("matchup.notEnoughData")}</p>
          )}

          <details className="mt-4 group">
            <summary className="flex items-center gap-1.5 text-sm font-bold text-[#0A3D91] cursor-pointer list-none">
              <HelpCircle className="w-4 h-4" aria-hidden />
              {t("matchup.howCalculated")}
            </summary>
            <dl className="mt-3 space-y-2 text-sm">
              <div>
                <dt className="font-bold text-slate-800">{t("matchup.rating")}</dt>
                <dd className="text-slate-600">{t("matchup.ratingHint")}</dd>
              </div>
              {metrics.map((m) => (
                <div key={m.id}>
                  <dt className="font-bold text-slate-800">{t(m.label)}</dt>
                  <dd className="text-slate-600">{t(m.hint)}</dd>
                </div>
              ))}
            </dl>
          </details>
        </section>
      </div>

      {/* Head to head */}
      <section className="bg-white rounded-3xl border border-slate-200 p-5 md:p-8">
        <h2 className="text-lg font-black text-slate-900 mb-3">{t("matchup.headToHead")}</h2>
        {meetings.length === 0 ? (
          <p className="text-sm text-slate-500">{t("matchup.noHeadToHead")}</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {meetings.map(({ bout, outcome }) => (
              <li key={bout.id} className="flex items-center gap-3 py-3">
                <OutcomeBadge outcome={outcome} />
                <span className="flex-1 text-sm font-semibold text-slate-700 truncate">{bout.eventName || bout.cardName}</span>
                <span className="text-sm font-black text-slate-900">{resultText(bout)}</span>
                <span className="text-xs text-slate-400 w-24 text-right">{formatDate(bout.date)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
