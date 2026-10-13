/**
 * Titles list (Program › Champions): every championship belt in a compact list — belt picture or crown, title name,
 * type · weight, the champion (photo / initials, name, since when, defenses) or "Vacant" — with a filter (All / Has a
 * champion / Vacant), search, and the whole row opens the title. Real data only: no invented reigns or ratings.
 * English + Khmer. See claude/updates/admin-step3-simple-pages.md.
 */
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { ChevronRight, Crown, Plus, Search } from "lucide-react";
import { api } from "../utils/api";
import { usePermissions } from "../hooks/usePermissions";
import { formatDay, useT } from "../i18n/program";
import { FighterAvatar } from "../components/program/shared";
import { holderName, titleHeld, typeLabel } from "../components/titles/titleUtils";
import { isRealPhoto } from "../components/fighters/fighterUtils";

type Filter = "all" | "held" | "vacant";

export function Champion() {
  const { t, lang } = useT();
  const permissions = usePermissions();
  const canAdd = permissions.hasPermission("events.create");
  const [titles, setTitles] = useState<any[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [filter, setFilter] = useState<Filter>("all");
  const [q, setQ] = useState("");

  const load = () => {
    setFailed(false);
    api.champions.list().then(setTitles).catch(() => setFailed(true));
  };
  useEffect(load, []);

  const counts = useMemo(() => {
    const held = (titles ?? []).filter(titleHeld).length;
    return { all: titles?.length ?? 0, held, vacant: (titles?.length ?? 0) - held };
  }, [titles]);

  const rows = useMemo(() => {
    const s = q.trim().toLowerCase();
    return (titles ?? [])
      .filter((c) => filter === "all" || (filter === "held" ? titleHeld(c) : !titleHeld(c)))
      .filter((c) => !s || [c.title_name, holderName(c), c.champion_type, c.organization].some((x) => x && String(x).toLowerCase().includes(s)))
      .sort((a, b) => (Number(a.weight_class) || 0) - (Number(b.weight_class) || 0) || String(a.title_name).localeCompare(String(b.title_name)));
  }, [titles, filter, q]);

  if (failed)
    return (
      <div role="alert" className="rounded-2xl border border-amber-200 bg-amber-50 p-8 text-center space-y-4">
        <p className="text-amber-900">{t("ti.loadFailed")}</p>
        <button type="button" onClick={load} className="h-11 px-5 rounded-xl bg-primary text-white text-sm font-semibold hover:opacity-90">{t("common.tryAgain")}</button>
      </div>
    );
  if (!titles) return <div className="rounded-2xl border border-slate-200 bg-white p-10 flex justify-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" aria-label={t("common.loading")} /></div>;

  if (titles.length === 0)
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center space-y-3">
        <p className="text-base text-slate-700">{t("ti.none")}</p>
        <p className="text-sm text-slate-500">{t("ti.noneHint")}</p>
        {canAdd && <Link to="/home/champion/new" className="inline-flex items-center gap-2 h-11 px-5 rounded-xl bg-primary text-white text-sm font-semibold"><Plus className="w-4 h-4" aria-hidden /> {t("ov.newTitle")}</Link>}
      </div>
    );

  const tab = (key: Filter, label: string) => (
    <button key={key} type="button" aria-pressed={filter === key} onClick={() => setFilter(key)} className={`h-10 px-4 rounded-xl text-sm font-semibold border ${filter === key ? "bg-primary text-white border-primary" : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"}`}>
      {label} <span className={`ml-1 ${filter === key ? "text-white/80" : "text-slate-500"}`}>{counts[key]}</span>
    </button>
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col lg:flex-row gap-3 lg:items-center">
        <div className="flex flex-wrap gap-2">{[tab("all", t("f.origin.all")), tab("held", t("ti.held")), tab("vacant", t("ti.vacant"))]}</div>
        <label className="relative block flex-1">
          <span className="sr-only">{t("ti.search")}</span>
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" aria-hidden />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("ti.search")} className="w-full h-11 rounded-xl border border-slate-300 bg-white pl-9 pr-3 text-base text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/30" />
        </label>
      </div>

      {rows.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center text-slate-600">{t("ti.noResults")}</p>
      ) : (
        <ul className="rounded-2xl border border-slate-200 bg-white divide-y divide-slate-100">
          {rows.map((c) => {
            const held = titleHeld(c);
            const belt = isRealPhoto(c.belt_image_url) ? c.belt_image_url : null;
            const kg = Number(c.weight_class);
            const facts = [typeLabel(t, c.champion_type), kg > 0 ? t("common.kg", { n: kg }) : null, c.organization && c.organization !== "KKF" ? c.organization : null].filter(Boolean);
            const extra = [c.date_awarded ? t("ti.since", { date: formatDay(c.date_awarded, lang, false) }) : null, Number(c.defense_count) > 0 ? t("club.defenses", { n: c.defense_count }) : null].filter(Boolean);
            return (
              <li key={c.id}>
                <Link to={`/home/champion/${c.id}`} className="flex items-center gap-4 p-4 hover:bg-slate-50">
                  {belt ? <img src={belt} alt="" className="w-14 h-14 rounded-xl object-contain bg-white border border-slate-200 shrink-0" /> : <span className="w-14 h-14 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0" aria-hidden><Crown className="w-6 h-6" /></span>}
                  <span className="min-w-0 flex-1 grid gap-x-6 gap-y-1 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:items-center">
                    <span className="min-w-0">
                      <span className="block text-base font-semibold text-slate-900 break-words">{c.title_name}</span>
                      <span className="block text-sm text-slate-600">{facts.join(" · ")}</span>
                    </span>
                    {held ? (
                      <span className="flex items-center gap-3 min-w-0">
                        <FighterAvatar name={holderName(c)} image={c.current_holder_photo_db} />
                        <span className="min-w-0">
                          <span className="block text-base font-semibold text-slate-900 break-words">{holderName(c)}</span>
                          {extra.length > 0 && <span className="block text-sm text-slate-600">{extra.join(" · ")}</span>}
                        </span>
                      </span>
                    ) : (
                      <span><span className="inline-flex rounded-full bg-slate-100 text-slate-700 px-3 py-1 text-sm font-semibold">{t("ti.vacantChip")}</span></span>
                    )}
                  </span>
                  <ChevronRight className="w-5 h-5 text-slate-400 shrink-0" aria-hidden />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
