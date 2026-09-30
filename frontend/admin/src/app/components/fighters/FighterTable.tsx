/**
 * Compact fighter list used by the Fighters page and the club page: photo (or initials), English + Khmer
 * name, club, weight + official weight class, record, status and next bout. Search, filters (origin, club,
 * weight class, status) and sort (A–Z / weight — no rankings, owner decision). The whole row opens the
 * fighter; "Edit" is a visible button. English + Khmer. See claude/updates/admin-fighters-clubs.md.
 */
import { useMemo, useState, type ReactNode } from "react";
import { Link } from "react-router";
import { AlertTriangle, Pencil, Search } from "lucide-react";
import { formatDay, useT } from "../../i18n/program";
import { FighterAvatar } from "../program/shared";
import { STATUS_TONE, classFor, className, isForeign, isUnverified, nextBout, opponentOf, recordParts, weightOf, type WeightClass } from "./fighterUtils";

type Origin = "all" | "local" | "foreign";

export function FighterStatusChip({ status }: { status?: string | null }) {
  const { t } = useT();
  const key = isUnverified(status) ? "Draft" : String(status || "Active");
  const known = ["Draft", "Active", "Injured", "Suspended", "Retired", "Inactive"].includes(key);
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap ${STATUS_TONE[key] ?? "bg-slate-100 text-slate-600"}`}>
      {known ? t(`fs.${key}` as any) : key}
    </span>
  );
}

export function RecordText({ record }: { record?: string | null }) {
  const { t } = useT();
  const r = recordParts(record);
  if (!r) return <span className="text-slate-400">—</span>;
  return (
    <span className="whitespace-nowrap" title={t("f.recordLabel")}>
      <span className="font-bold text-emerald-700">{r[0]}</span>
      <span className="text-slate-400">-</span>
      <span className="font-bold text-red-600">{r[1]}</span>
      <span className="text-slate-400">-</span>
      <span className="font-bold text-amber-600">{r[2]}</span>
    </span>
  );
}

export function FighterTable({ fighters, bouts, classes, showClub = true, origin: initialOrigin = "all", canEdit = false, gaps, empty }: {
  fighters: any[];
  bouts: any[];
  classes: WeightClass[];
  showClub?: boolean;
  origin?: Origin;
  canEdit?: boolean;
  /** Staff only: fighter id → what's missing / expired in the private details (claude/features/fighter-personal-records.md). */
  gaps?: Map<string, unknown>;
  /** Shown when there are no fighters at all (e.g. a "Register fighter" button). */
  empty?: ReactNode;
}) {
  const { t, lang } = useT();
  const [q, setQ] = useState("");
  const [origin, setOrigin] = useState<Origin>(initialOrigin);
  const [club, setClub] = useState("all");
  const [cls, setCls] = useState("all");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState<"name" | "weight">("name");

  const clubs = useMemo(() => [...new Map(fighters.filter((f) => f.clubId).map((f) => [f.clubId, f.clubName || "—"])).entries()].sort((a, b) => a[1].localeCompare(b[1])), [fighters]);
  const statuses = useMemo(() => [...new Set(fighters.map((f) => (isUnverified(f.status) ? "Draft" : f.status || "Active")))], [fighters]);

  const rows = useMemo(() => {
    const s = q.trim().toLowerCase();
    return fighters
      .filter((f) => origin === "all" || (origin === "foreign" ? isForeign(f) : !isForeign(f)))
      .filter((f) => club === "all" || (club === "none" ? !f.clubId : f.clubId === club))
      .filter((f) => cls === "all" || classFor(weightOf(f), classes)?.id === cls)
      .filter((f) => status === "all" || (isUnverified(f.status) ? "Draft" : f.status || "Active") === status)
      .filter((f) => !s || [f.name, f.nameKhmer, f.alias, f.clubName].some((x) => x && String(x).toLowerCase().includes(s)))
      .sort((a, b) => (sort === "weight" ? (weightOf(a) ?? 999) - (weightOf(b) ?? 999) || a.name.localeCompare(b.name) : a.name.localeCompare(b.name)));
  }, [fighters, q, origin, club, cls, status, sort, classes]);

  const select = "h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/30";
  const originTab = (o: Origin, label: string) => (
    <button key={o} type="button" aria-pressed={origin === o} onClick={() => setOrigin(o)} className={`h-10 px-4 rounded-xl text-sm font-semibold border ${origin === o ? "bg-primary text-white border-primary" : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"}`}>
      {label}
    </button>
  );

  if (fighters.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center space-y-3">
        <p className="text-base text-slate-700">{t("f.none")}</p>
        {empty}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">{[originTab("all", t("f.origin.all")), originTab("local", t("f.origin.local")), originTab("foreign", t("f.origin.foreign"))]}</div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(0,2fr)_repeat(4,minmax(0,1fr))]">
        <label className="relative block sm:col-span-2 lg:col-span-1">
          <span className="sr-only">{t("f.search")}</span>
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" aria-hidden />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("f.search")} className={`${select} w-full pl-9`} />
        </label>
        {showClub && (
          <select aria-label={t("f.col.club")} className={select} value={club} onChange={(e) => setClub(e.target.value)}>
            <option value="all">{t("f.allClubs")}</option>
            {clubs.map(([id, name]) => <option key={id} value={id}>{name}</option>)}
            {fighters.some((f) => !f.clubId) && <option value="none">{t("f.noClub")}</option>}
          </select>
        )}
        <select aria-label={t("f.col.weight")} className={select} value={cls} onChange={(e) => setCls(e.target.value)}>
          <option value="all">{t("f.allClasses")}</option>
          {classes.map((c) => <option key={c.id} value={c.id}>{className(c, lang)}</option>)}
        </select>
        <select aria-label={t("f.col.status")} className={select} value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="all">{t("f.allStatuses")}</option>
          {statuses.map((s) => <option key={s} value={s}>{["Draft", "Active", "Injured", "Suspended", "Retired", "Inactive"].includes(s) ? t(`fs.${s}` as any) : s}</option>)}
        </select>
        <select aria-label={t("f.sort")} className={select} value={sort} onChange={(e) => setSort(e.target.value as "name" | "weight")}>
          <option value="name">{t("f.sort.name")}</option>
          <option value="weight">{t("f.sort.weight")}</option>
        </select>
      </div>

      <p className="text-sm text-slate-600">{t("f.count", { n: rows.length })}</p>

      {rows.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center text-slate-600">{t("f.noResults")}</p>
      ) : (
        <ul className="rounded-2xl border border-slate-200 bg-white divide-y divide-slate-100 overflow-hidden">
          {rows.map((f) => {
            const kg = weightOf(f);
            const c = classFor(kg, classes);
            const next = nextBout(f.id, bouts);
            return (
              <li key={f.id} className="flex items-stretch hover:bg-slate-50">
                <Link to={`/home/fighters/${f.id}`} className="flex-1 min-w-0 grid gap-x-4 gap-y-1 p-4 grid-cols-[auto_minmax(0,1fr)] md:grid-cols-[auto_minmax(0,2fr)_minmax(0,1.2fr)_minmax(0,1fr)_auto_minmax(0,1.3fr)] items-center">
                  <span className="row-span-2 md:row-span-1"><FighterAvatar name={f.name} image={f.image} /></span>
                  <span className="min-w-0">
                    <span className="block text-base font-semibold text-slate-900 break-words">{f.name}</span>
                    {f.nameKhmer && <span lang="km" className="block text-sm text-slate-600 break-words">{f.nameKhmer}</span>}
                    {gaps?.has(f.id) && <span title={t("pv.badge")} className="mt-1 inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2 py-0.5 text-xs font-semibold text-amber-800"><AlertTriangle className="w-3 h-3" aria-hidden /> {t("pv.badge")}</span>}
                    {showClub && <span className="md:hidden block text-sm text-slate-600 break-words">{f.clubName || t("f.noClub")}</span>}
                  </span>
                  {showClub && <span className="hidden md:block text-sm text-slate-700 break-words">{f.clubName || <span className="text-slate-400">{t("f.noClub")}</span>}</span>}
                  {!showClub && <span className="hidden md:block" />}
                  <span className="col-start-2 md:col-start-auto flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-700">
                    <span>{kg ? t("common.kg", { n: kg }) : "—"}</span>
                    {c && <span className="text-slate-500">{className(c, lang)}</span>}
                    <span className="md:hidden"><RecordText record={f.record} /></span>
                    <span className="md:hidden"><FighterStatusChip status={f.status} /></span>
                  </span>
                  <span className="hidden md:flex flex-col items-start gap-1 text-sm">
                    <RecordText record={f.record} />
                    <FighterStatusChip status={f.status} />
                  </span>
                  <span className="col-start-2 md:col-start-auto text-sm text-slate-600 break-words">
                    {next ? t("f.nextBout", { date: formatDay(next.date, lang, false), name: opponentOf(next, f.id) }) : <span className="hidden md:inline text-slate-400">{t("f.noNext")}</span>}
                  </span>
                </Link>
                {canEdit && (
                  <Link to={`/home/fighters/${f.id}/edit`} aria-label={`${t("common.edit")} — ${f.name}`} className="shrink-0 self-center mr-3 inline-flex items-center gap-1.5 h-10 px-3 rounded-lg border border-slate-200 text-sm font-semibold text-slate-700 hover:border-primary hover:text-primary">
                    <Pencil className="w-4 h-4" aria-hidden /> <span className="hidden sm:inline">{t("common.edit")}</span>
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
