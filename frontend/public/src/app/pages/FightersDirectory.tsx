/**
 * Fighters (/fighters): every public Kun Khmer fighter, in the same light style as Matches &
 * Events. Sorted A–Z (no rankings — owner decision). ?gender=men|women when both are present.
 * Real data only: no stock photos, no "verified" badge (every public fighter is verified), a
 * champion badge only for a current title holder. See claude/updates/public-fighters-page.md.
 */
import { LoadError } from "../components/LoadError";
import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { Building2, CalendarDays, Crown, Search, Sparkles, Users, X } from "lucide-react";
import { DemoBanner, FormGuide } from "../components/fan/FanWidgets";
import { fightHistory, nextBout, useFanData, type FanData, retryFanData } from "../data/fanData";
import { getFighterSlug } from "../data/masterData";
import { weightClassFor, type WeightClass } from "../data/weightClasses";
import { textLang } from "../utils/publicDisplay";
import { useI18n } from "../i18n/LanguageContext";

type Gender = "all" | "men" | "women";

const PAGE = 24;
const isRealImage = (url?: string | null): url is string => Boolean(url) && !url!.includes("images.unsplash.com");
const genderOf = (f: any): Gender | null => {
  const g = String(f.gender || "").toLowerCase();
  return g === "male" ? "men" : g === "female" ? "women" : null;
};
const clubOf = (f: any): string | null => f.clubName || f.club_name || null;
const weightOf = (f: any) => Number(f.currentWeight ?? f.current_weight) || null;

function ageOf(dob?: string | null): number | null {
  if (!dob) return null;
  const birth = new Date(dob);
  if (isNaN(birth.getTime())) return null;
  const now = new Date();
  return now.getFullYear() - birth.getFullYear() - (now < new Date(now.getFullYear(), birth.getMonth(), birth.getDate()) ? 1 : 0);
}

/** Current title holders (fan data keeps approved titles only; vacant ones are skipped): fighter id → title names. */
export function currentTitles(data: FanData | null): Map<string, string[]> {
  const map = new Map<string, string[]>();
  for (const c of data?.champions ?? []) {
    if (!c.current_holder_id || String(c.status || "").toLowerCase() === "vacant") continue;
    map.set(c.current_holder_id, [...(map.get(c.current_holder_id) ?? []), c.title_name].filter(Boolean));
  }
  return map;
}

function recordOf(f: any) {
  const [w, l, d] = String(f.record || "").split("-").map((x) => parseInt(x, 10) || 0);
  return { w: w ?? 0, l: l ?? 0, d: d ?? 0 };
}

export function FightersDirectory() {
  const data = useFanData();
  const { t, tn, lang, formatNumber } = useI18n();
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState("");
  const [weight, setWeight] = useState("all");
  const [club, setClub] = useState("all");
  const [shown, setShown] = useState(PAGE);

  const fighters = useMemo(() => [...(data?.fighters ?? [])].filter((f) => f.name).sort((a, b) => a.name.localeCompare(b.name)), [data]);
  const genders = useMemo(() => new Set(fighters.map(genderOf).filter(Boolean)), [fighters]);
  const showGenderTabs = genders.has("men") && genders.has("women");
  const requested = params.get("gender");
  const gender: Gender = showGenderTabs && (requested === "men" || requested === "women") ? requested : "all";

  const titles = useMemo(() => currentTitles(data), [data]);

  const classes = data?.weightClasses ?? [];
  const classOf = (f: any) => weightClassFor(weightOf(f), classes);
  const weightOptions = useMemo(() => {
    const used = new Set(fighters.map((f) => classOf(f)?.id).filter(Boolean));
    return classes.filter((c) => used.has(c.id));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fighters, classes]);
  const clubOptions = useMemo(() => [...new Set(fighters.map(clubOf).filter((c): c is string => Boolean(c)))].sort((a, b) => a.localeCompare(b)), [fighters]);

  if (!data) {
    return (
      <div className="space-y-6" aria-busy="true">
        <div className="h-40 rounded-3xl bg-gradient-to-b from-[#eef3fb] to-white animate-pulse" />
        <div className="h-64 rounded-3xl bg-gray-50 animate-pulse" />
      </div>
    );
  }

  const setGender = (next: Gender) => {
    const p = new URLSearchParams(params);
    if (next === "all") p.delete("gender");
    else p.set("gender", next);
    setParams(p, { replace: true });
    setShown(PAGE);
  };
  const clearFilters = () => {
    setQuery("");
    setWeight("all");
    setClub("all");
    setShown(PAGE);
  };

  const q = query.trim().toLowerCase();
  const filtering = q !== "" || weight !== "all" || club !== "all";
  const inGender = fighters.filter((f) => gender === "all" || genderOf(f) === gender);
  const list = inGender.filter((f) => {
    if (weight !== "all" && classOf(f)?.id !== weight) return false;
    if (club !== "all" && clubOf(f) !== club) return false;
    return !q || [f.name, f.nameKhmer, f.name_khmer, f.alias, clubOf(f)].some((s) => s?.toLowerCase().includes(q));
  });

  const stats = [
    { icon: <Users className="w-4 h-4" />, value: fighters.length, label: tn("fightersPage.statFighters", fighters.length) },
    { icon: <Building2 className="w-4 h-4" />, value: clubOptions.length, label: tn("fightersPage.statClubs", clubOptions.length) },
    { icon: <Crown className="w-4 h-4" />, value: titles.size, label: tn("fightersPage.statChampions", titles.size) },
  ].filter((s) => s.value > 0);

  const genderTabs: { id: Gender; label: string; count: number }[] = [
    { id: "all", label: t("fightersPage.all"), count: fighters.length },
    { id: "men", label: t("fightersPage.men"), count: fighters.filter((f) => genderOf(f) === "men").length },
    { id: "women", label: t("fightersPage.women"), count: fighters.filter((f) => genderOf(f) === "women").length },
  ];

  const className = (w: WeightClass) => (lang === "km" && w.name_khmer ? w.name_khmer : w.name);

  return (
    <div className="space-y-8">
      {/* Header */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#eef3fb] via-white to-[#fdf1f3] border border-[#d5e0f3] px-6 py-8 md:px-10 md:py-10">
        <p className="kk-label text-[var(--kk-red)]">{t("fightersPage.eyebrow")}</p>
        <h1 className="kk-heading text-3xl md:text-5xl text-[var(--kk-navy)] mt-1">{t("nav.fighters")}</h1>
        <p className="mt-2 text-base md:text-lg text-gray-600 max-w-2xl">{t("fightersPage.lead")}</p>
        {stats.length > 0 && (
          <div className="mt-6 grid grid-cols-3 gap-2 sm:flex sm:flex-wrap sm:gap-3">
            {stats.map((s) => (
              <div key={s.label} className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-2.5 rounded-2xl bg-white/80 border border-[#d5e0f3] px-3 py-2.5 sm:px-4 min-w-0">
                <span className="hidden sm:flex w-8 h-8 rounded-lg bg-[#eef3fb] text-[var(--kk-blue)] items-center justify-center" aria-hidden>{s.icon}</span>
                <span className="kk-stat text-xl text-[var(--kk-navy)]">{formatNumber(s.value)}</span>
                <span className="text-xs sm:text-sm text-gray-600 leading-snug">{s.label}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      <DemoBanner show={data.demo} />
      {data.failed && <LoadError onRetry={retryFanData} />}

      {/* Tabs + filters */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {showGenderTabs ? (
          <div role="tablist" aria-label={t("nav.fighters")} className="inline-flex w-full sm:w-auto p-1 rounded-2xl bg-gray-100 overflow-x-auto">
            {genderTabs.map((x) => (
              <button
                key={x.id}
                type="button"
                role="tab"
                aria-selected={gender === x.id}
                onClick={() => setGender(x.id)}
                className={`kk-focus flex-1 sm:flex-none whitespace-nowrap px-4 md:px-5 h-11 rounded-xl text-sm font-semibold transition ${
                  gender === x.id ? "bg-white text-[var(--kk-navy)] shadow-sm" : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {x.label}
                {x.count > 0 && <span className={`ml-1.5 text-xs ${gender === x.id ? "text-[var(--kk-blue)]" : "text-gray-400"}`}>{x.count}</span>}
              </button>
            ))}
          </div>
        ) : (
          <p className="text-sm font-semibold text-gray-600">{tn("common.fighters", fighters.length)}</p>
        )}
        <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
          <label className="relative flex-1 lg:w-72">
            <span className="sr-only">{t("fighters.searchLabel")}</span>
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" aria-hidden />
            <input
              type="search"
              value={query}
              onChange={(e) => { setQuery(e.target.value); setShown(PAGE); }}
              placeholder={t("fighters.searchPlaceholder")}
              className="kk-focus w-full h-11 pl-9 pr-3 rounded-xl border border-gray-200 bg-white text-sm"
            />
          </label>
          {weightOptions.length > 1 && (
            <label>
              <span className="sr-only">{t("fights.weight")}</span>
              <select value={weight} onChange={(e) => { setWeight(e.target.value); setShown(PAGE); }} className="kk-focus w-full sm:w-auto h-11 px-3 rounded-xl border border-gray-200 bg-white text-sm">
                <option value="all">{t("fights.allWeights")}</option>
                {weightOptions.map((w) => <option key={w.id} value={w.id}>{className(w)}</option>)}
              </select>
            </label>
          )}
          {clubOptions.length > 1 && (
            <label>
              <span className="sr-only">{t("fighters.club")}</span>
              <select value={club} onChange={(e) => { setClub(e.target.value); setShown(PAGE); }} className="kk-focus w-full sm:w-auto sm:max-w-56 h-11 px-3 rounded-xl border border-gray-200 bg-white text-sm">
                <option value="all">{t("fightersPage.allClubs")}</option>
                {clubOptions.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </label>
          )}
          {filtering && (
            <button type="button" onClick={clearFilters} className="kk-focus h-11 px-3 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-100 inline-flex items-center justify-center gap-1">
              <X className="w-4 h-4" aria-hidden /> {t("common.clearFilters")}
            </button>
          )}
        </div>
      </div>

      {fighters.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-gray-300 bg-white px-6 py-12 text-center">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-[#eef3fb] text-[var(--kk-blue)] flex items-center justify-center mb-4"><Users className="w-7 h-7" aria-hidden /></div>
          <h2 className="kk-heading text-xl text-gray-900">{t("fightersPage.noneTitle")}</h2>
          <div className="mt-6 flex justify-center">
            <Link to="/hub" className="kk-focus inline-flex items-center gap-2 h-11 px-5 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-700 hover:border-gray-300">
              <Sparkles className="w-4 h-4 text-[var(--kk-blue)]" aria-hidden /> {t("fights.askHub")}
            </Link>
          </div>
        </div>
      ) : list.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-gray-300 bg-white px-6 py-10 text-center">
          <h2 className="kk-heading text-lg text-gray-900">{t("fights.noMatch")}</h2>
          <p className="text-gray-600 mt-1">{t("fights.noMatchText")}</p>
        </div>
      ) : (
        <div className="space-y-8">
          {filtering && <p className="text-sm text-gray-600">{t("common.showingFighters", { shown: list.length, total: tn("common.fighters", inGender.length) })}</p>}
          <ul className="grid gap-4 grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
            {list.slice(0, shown).map((f) => (
              <li key={f.id}>
                <FighterCard f={f} data={data} titles={titles.get(f.id) ?? []} />
              </li>
            ))}
          </ul>
          {list.length > shown && (
            <div className="flex justify-center">
              <button type="button" onClick={() => setShown((n) => n + PAGE)} className="kk-focus h-11 px-6 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-700 hover:border-gray-300">
                {t("news.showMore")}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/** A fighter's card (raw /fighters row + fan data); also used for the home page's featured fighters. */
export function FighterCard({ f, data, titles }: { f: any; data: FanData; titles: string[] }) {
  const { t, lang, localName, formatDate, formatNumber, formatWeight } = useI18n();
  const weightClass: WeightClass | null = weightClassFor(weightOf(f), data.weightClasses);
  const form = fightHistory(data, f.id).slice(0, 5).map((h) => h.outcome);
  const khmer = f.nameKhmer || f.name_khmer || "";
  const name = localName(f.name, khmer);
  const other = khmer && khmer !== f.name ? (lang === "km" ? f.name : khmer) : null;
  const club = clubOf(f);
  const age = ageOf(f.dateOfBirth || f.date_of_birth);
  const kg = weightOf(f);
  const { w, l, d } = recordOf(f);
  const next = nextBout(data, f.id);
  const initials = f.name.split(/\s+/).filter(Boolean).slice(0, 2).map((x: string) => x[0]).join("").toUpperCase();
  const facts = [
    weightClass ? (lang === "km" && weightClass.name_khmer ? weightClass.name_khmer : weightClass.name) : kg ? formatWeight(kg) : null,
    age != null ? t("common.years", { n: age }) : null,
  ].filter(Boolean);

  return (
    <Link to={`/fighters/${getFighterSlug(f)}`} className="kk-focus group flex flex-col h-full rounded-2xl border border-gray-200 bg-white overflow-hidden hover:border-[var(--kk-blue)]/40 hover:shadow-md transition">
      <div className="relative aspect-[4/5] overflow-hidden bg-gradient-to-br from-[#eef3fb] to-[#fdf1f3]">
        {isRealImage(f.image) ? (
          <img src={f.image} alt="" loading="lazy" className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105 kk-motion" />
        ) : (
          <span aria-hidden className="w-full h-full flex items-center justify-center kk-display text-5xl text-[var(--kk-navy)]/25">{initials}</span>
        )}
        {titles.length > 0 && (
          <span title={titles.join(", ")} className="absolute top-2.5 left-2.5 inline-flex items-center gap-1 rounded-full bg-[var(--kk-gold)] text-[#3d2e00] px-2.5 py-1 text-xs font-bold shadow-sm">
            <Crown className="w-3.5 h-3.5" aria-hidden /> {t("fightersPage.champion")}
          </span>
        )}
      </div>
      <div className="p-3 sm:p-4 flex flex-col gap-1.5 flex-1">
        <h3 lang={textLang(name)} className="font-bold text-base sm:text-lg text-gray-900 leading-snug break-words group-hover:text-[var(--kk-blue)]">{name}</h3>
        {other && <p lang={textLang(other)} className="text-xs sm:text-sm text-gray-500 -mt-1 break-words">{other}</p>}
        {club && <p lang={textLang(club)} className="text-xs sm:text-sm text-gray-600 flex items-start gap-1.5"><Building2 className="w-3.5 h-3.5 mt-0.5 text-[var(--kk-red)] shrink-0" aria-hidden /><span className="line-clamp-2">{club}</span></p>}
        {facts.length > 0 && <p className="text-xs sm:text-sm text-gray-600">{facts.join(" · ")}</p>}
        <div className="mt-auto pt-2 flex items-end justify-between gap-2">
          <div aria-label={`${t("common.wins")} ${w}, ${t("common.losses")} ${l}, ${t("common.draws")} ${d}`}>
            <p aria-hidden className="text-[11px] font-semibold text-gray-400 leading-none">{t("common.wld")}</p>
            <p aria-hidden className="flex items-baseline gap-2 mt-1">
              <span className="kk-stat text-lg text-emerald-600">{formatNumber(w)}</span>
              <span className="kk-stat text-lg text-[var(--kk-red)]">{formatNumber(l)}</span>
              <span className="kk-stat text-lg text-amber-600">{formatNumber(d)}</span>
            </p>
          </div>
          {form.length > 0 && <FormGuide form={form} label={false} />}
        </div>
        {next && (
          <p className="mt-1 rounded-lg bg-[#eef3fb] px-2.5 py-1.5 text-xs font-semibold text-[var(--kk-navy)] flex items-center gap-1.5">
            <CalendarDays className="w-3.5 h-3.5 shrink-0 text-[var(--kk-blue)]" aria-hidden />
            <span className="truncate">{t("fightersPage.nextFight", { date: formatDate(next.bout.date) })}</span>
          </p>
        )}
      </div>
    </Link>
  );
}
