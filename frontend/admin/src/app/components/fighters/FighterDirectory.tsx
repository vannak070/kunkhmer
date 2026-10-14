/**
 * The admin Fighters list, one page at a time (claude/updates/admin-fighters-paging.md): search, filters and sort are
 * done by the server over every fighter (GET /fighters/page), 30 rows are shown and "Show more fighters" adds the
 * next 30. Same rows and wording as the club page's table (FighterTable).
 */
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Search } from "lucide-react";
import { api } from "../../utils/api";
import { useT } from "../../i18n/program";
import { FighterRow } from "./FighterTable";
import { className, type WeightClass } from "./fighterUtils";

type Origin = "all" | "local" | "foreign";
const PAGE = 30;
const STATUSES = ["Draft", "Active", "Injured", "Suspended", "Retired", "Inactive"];

interface Facets { clubs: { id: string; name: string }[]; noClub: boolean; statuses: string[] }

export function FighterDirectory({ bouts, classes, origin: initialOrigin = "all", canEdit = false, gaps, empty }: {
  bouts: any[];
  classes: WeightClass[];
  origin?: Origin;
  canEdit?: boolean;
  gaps?: Map<string, unknown>;
  empty?: ReactNode;
}) {
  const { t, lang } = useT();
  const [q, setQ] = useState("");
  const [typed, setTyped] = useState("");
  const [origin, setOrigin] = useState<Origin>(initialOrigin);
  const [club, setClub] = useState("all");
  const [cls, setCls] = useState("all");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState<"name" | "weight">("name");

  const [items, setItems] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [facets, setFacets] = useState<Facets>({ clubs: [], noClub: false, statuses: [] });
  const [busy, setBusy] = useState(true);
  const [failed, setFailed] = useState(false);
  const [firstDone, setFirstDone] = useState(false);
  const latest = useRef(0);

  // Search waits for a pause in typing.
  useEffect(() => {
    const id = setTimeout(() => setQ(typed), 300);
    return () => clearTimeout(id);
  }, [typed]);

  const fetchPage = (offset: number) => {
    const ticket = ++latest.current;
    setBusy(true);
    setFailed(false);
    return api.fighters
      .page({ q, origin: origin === "all" ? "" : origin, clubId: club === "all" ? "" : club, classId: cls === "all" ? "" : cls, status: status === "all" ? "" : status, sort, limit: PAGE, offset })
      .then((p) => {
        if (ticket !== latest.current) return; // a newer search is already on its way
        setItems((prev) => (offset === 0 ? p.items : [...prev, ...p.items]));
        setTotal(p.total);
        setFacets({ clubs: p.clubs, noClub: p.noClub, statuses: p.statuses });
        setFirstDone(true);
      })
      .catch(() => ticket === latest.current && setFailed(true))
      .finally(() => ticket === latest.current && setBusy(false));
  };
  useEffect(() => { fetchPage(0); }, [q, origin, club, cls, status, sort]);

  const filtered = Boolean(q.trim()) || origin !== initialOrigin || club !== "all" || cls !== "all" || status !== "all";
  const select = "h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/30";
  const originTab = (o: Origin, label: string) => (
    <button key={o} type="button" aria-pressed={origin === o} onClick={() => setOrigin(o)} className={`h-10 px-4 rounded-xl text-sm font-semibold border ${origin === o ? "bg-primary text-white border-primary" : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"}`}>
      {label}
    </button>
  );

  if (firstDone && !filtered && total === 0 && !failed) {
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
          <input value={typed} onChange={(e) => setTyped(e.target.value)} placeholder={t("f.search")} className={`${select} w-full pl-9`} />
        </label>
        <select aria-label={t("f.col.club")} className={select} value={club} onChange={(e) => setClub(e.target.value)}>
          <option value="all">{t("f.allClubs")}</option>
          {facets.clubs.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          {facets.noClub && <option value="none">{t("f.noClub")}</option>}
        </select>
        <select aria-label={t("f.col.weight")} className={select} value={cls} onChange={(e) => setCls(e.target.value)}>
          <option value="all">{t("f.allClasses")}</option>
          {classes.map((c) => <option key={c.id} value={c.id}>{className(c, lang)}</option>)}
        </select>
        <select aria-label={t("f.col.status")} className={select} value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="all">{t("f.allStatuses")}</option>
          {facets.statuses.map((s) => <option key={s} value={s}>{STATUSES.includes(s) ? t(`fs.${s}` as any) : s}</option>)}
        </select>
        <select aria-label={t("f.sort")} className={select} value={sort} onChange={(e) => setSort(e.target.value as "name" | "weight")}>
          <option value="name">{t("f.sort.name")}</option>
          <option value="weight">{t("f.sort.weight")}</option>
        </select>
      </div>

      {failed ? (
        <div role="alert" className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center space-y-3">
          <p className="text-amber-900">{t("f.loadFailed")}</p>
          <button type="button" onClick={() => fetchPage(0)} className="h-11 px-5 rounded-xl bg-primary text-white text-sm font-semibold hover:opacity-90">{t("common.tryAgain")}</button>
        </div>
      ) : (
        <>
          <p className="text-sm text-slate-600" aria-live="polite">{firstDone ? t("f.count", { n: total }) : ""}</p>
          {!firstDone ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-10 flex justify-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" aria-label={t("common.loading")} /></div>
          ) : items.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center text-slate-600">{t("f.noResults")}</p>
          ) : (
            <ul className={`rounded-2xl border border-slate-200 bg-white divide-y divide-slate-100 overflow-hidden transition-opacity ${busy ? "opacity-60" : ""}`}>
              {items.map((f) => <FighterRow key={f.id} f={f} bouts={bouts} classes={classes} canEdit={canEdit} gaps={gaps} />)}
            </ul>
          )}
          {firstDone && items.length < total && (
            <div className="flex justify-center">
              <button type="button" disabled={busy} onClick={() => fetchPage(items.length)} className="h-11 px-6 rounded-xl border border-slate-300 bg-white text-sm font-semibold text-slate-700 hover:border-primary hover:text-primary disabled:opacity-60">
                {t("f.more", { n: total - items.length })}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
