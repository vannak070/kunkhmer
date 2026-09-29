/**
 * Champions (/champions) and a title's own page (/champions/<title words>-<code>): every approved
 * KKF title with its current holder — vacant ones included — and each title's history (crowned,
 * defended, lost) from the federation's records. Official titles, not a ranking: grouped by type,
 * then by weight. No internal fields (approval, notes, "Inactive", defense deadlines).
 * See claude/features/public-champions.md.
 */
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router";
import { ArrowLeft, Building2, CalendarDays, Crown, History, Scale, Shield, Trophy } from "lucide-react";
import { SiteHeader } from "../components/layout/SiteHeader";
import { SiteFooter } from "../components/layout/SiteFooter";
import { LoadError, Loading } from "../components/LoadError";
import { DemoBanner } from "../components/fan/FanWidgets";
import { HubAskAbout } from "../components/hub/HubAskAbout";
import { DateBadge, DetailRow, Section, SideCard, iconCls } from "../components/detail/DetailParts";
import { retryFanData, useFanData, type FanData } from "../data/fanData";
import { getFighterSlug } from "../data/masterData";
import { championPath, eventPathById, findByLink } from "../data/links";
import { isRealImage } from "../data/partners";
import { MESSAGES, type MessageKey } from "../i18n/messages";
import { useI18n } from "../i18n/LanguageContext";
import { usePageMeta } from "../hooks/usePageTitle";
import { textLang } from "../utils/publicDisplay";
import { api } from "../utils/api";

type Group = "kkf" | "international" | "special" | "awards" | "other";

// Title types from the admin's champion form (frontend/admin/src/app/data/champion.ts).
const GROUP_OF: Record<string, Group> = {
  "KKF National": "kkf",
  National: "kkf",
  "ISKA Cambodia": "international",
  "IPCC International": "international",
  "International Belt": "international",
  "Interim Belt": "special",
  "Super Fight Belt": "special",
  "Sponsor Belt": "special",
  Trophy: "awards",
  "Tournament Winner": "awards",
  "Honorary Award": "awards",
};
const GROUPS: Group[] = ["kkf", "international", "special", "awards", "other"];
const groupOf = (c: any): Group => GROUP_OF[c.champion_type] ?? "other";

function useTitleText() {
  const { t, formatWeight } = useI18n();
  return {
    type: (c: any) => {
      const key = `titleType.${c.champion_type}`;
      return key in MESSAGES.en ? t(key as MessageKey) : c.champion_type || "";
    },
    // Weight is a number of kg; sample data may hold a class name instead.
    weight: (c: any) => {
      const kg = Number(c.weight_class);
      return Number.isFinite(kg) ? (kg > 0 ? formatWeight(kg) : "") : String(c.weight_class || "");
    },
    vacant: (c: any) => t(groupOf(c) === "awards" ? "champions.notAwarded" : "champions.vacant"),
  };
}

/** The holder fans may see: the public fighter, or just the stored name when the fighter isn't public. */
function holderOf(c: any, data: FanData | null): { fighter: any | null; name: string | null } {
  if (!c.current_holder_id) return { fighter: null, name: null };
  const fighter = c.current_holder ?? data?.fighters.find((f: any) => f.id === c.current_holder_id) ?? null;
  return { fighter, name: fighter?.name ?? c.current_holder_name ?? null };
}

function HolderPhoto({ fighter, name, size = "md" }: { fighter: any | null; name: string; size?: "md" | "lg" }) {
  const dims = size === "lg" ? "w-24 h-24 md:w-28 md:h-28 text-2xl" : "w-14 h-14 text-base";
  const photo = fighter && isRealImage(fighter.image) ? fighter.image : null;
  const initials = name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
  return photo ? (
    <img src={photo} alt="" className={`${dims} rounded-full object-cover object-top border-2 border-[#f2c94c] bg-gray-100 shrink-0`} />
  ) : (
    <span aria-hidden className={`${dims} rounded-full border-2 border-[#f2c94c] bg-[#fffaf0] text-[#7A5B00] kk-heading inline-flex items-center justify-center shrink-0`}>{initials}</span>
  );
}

// ─── /champions ─────────────────────────────────────────────────────────────

export function ChampionsPage() {
  const { t, tn, formatNumber } = useI18n();
  const data = useFanData();
  usePageMeta({ title: t("champions.title"), description: t("champions.lead") });

  const titles = [...(data?.champions ?? [])].sort(
    (a: any, b: any) => (Number(a.weight_class) || 0) - (Number(b.weight_class) || 0) || String(a.title_name).localeCompare(String(b.title_name)),
  );
  const held = titles.filter((c) => holderOf(c, data).name).length;
  const stats = [
    { icon: <Trophy className="w-4 h-4" />, value: titles.length, label: tn("champions.statTitles", titles.length) },
    { icon: <Crown className="w-4 h-4" />, value: held, label: tn("champions.statHolders", held) },
    { icon: <Shield className="w-4 h-4" />, value: titles.length - held, label: tn("champions.statVacant", titles.length - held) },
  ].filter((s) => s.value > 0);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <SiteHeader activeSection="fighters" />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-6 py-8 md:py-12 space-y-10">
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#fffaf0] via-white to-[#eef3fb] border border-[#ecdcae] px-6 py-8 md:px-10 md:py-10">
          <p className="kk-label text-[var(--kk-red)]">{t("champions.eyebrow")}</p>
          <h1 className="kk-heading text-3xl md:text-5xl text-[var(--kk-navy)] mt-1">{t("champions.title")}</h1>
          <p className="mt-2 text-base md:text-lg text-gray-600 max-w-2xl">{t("champions.lead")}</p>
          {stats.length > 0 && (
            <div className="mt-6 grid grid-cols-3 gap-2 sm:flex sm:flex-wrap sm:gap-3">
              {stats.map((s) => (
                <div key={s.label} className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-2.5 rounded-2xl bg-white/80 border border-[#ecdcae] px-3 py-2.5 sm:px-4 min-w-0">
                  <span className="hidden sm:flex w-8 h-8 rounded-lg bg-[#fffaf0] text-[#7A5B00] items-center justify-center" aria-hidden>{s.icon}</span>
                  <span className="kk-stat text-xl text-[var(--kk-navy)]">{formatNumber(s.value)}</span>
                  <span className="text-xs sm:text-sm text-gray-600 leading-snug">{s.label}</span>
                </div>
              ))}
            </div>
          )}
        </section>

        {data && <DemoBanner show={data.demo} />}
        {data?.failed && <LoadError onRetry={retryFanData} />}

        {!data ? (
          <Loading />
        ) : titles.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center text-gray-600">{t("champions.none")}</p>
        ) : (
          GROUPS.map((g) => {
            const rows = titles.filter((c) => groupOf(c) === g);
            if (rows.length === 0) return null;
            return (
              <Section key={g} title={t(`champions.group.${g}` as MessageKey)} icon={<Crown className="w-5 h-5 text-[#7A5B00]" aria-hidden />}>
                <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {rows.map((c) => <TitleCard key={c.id} c={c} data={data} />)}
                </ul>
              </Section>
            );
          })
        )}
      </main>
      <SiteFooter />
    </div>
  );
}

function TitleCard({ c, data }: { c: any; data: FanData }) {
  const { t, tn, formatDate, localName } = useI18n();
  const text = useTitleText();
  const holder = holderOf(c, data);
  const f = holder.fighter;
  const name = holder.name ? localName(holder.name, f?.nameKhmer) : null;
  const facts = [c.date_awarded ? t("champions.since", { date: formatDate(c.date_awarded) }) : null, Number(c.defense_count) > 0 ? tn("club.defenses", Number(c.defense_count)) : null];
  const belt = isRealImage(c.belt_image_url) ? c.belt_image_url : null;

  return (
    <li>
      <Link to={championPath(c)} className="kk-focus group flex flex-col h-full rounded-2xl border border-gray-200 bg-white p-5 hover:border-[#f2c94c] hover:shadow-md transition">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold text-[#7A5B00]">{[text.type(c), text.weight(c)].filter(Boolean).join(" · ")}</p>
            <h3 lang={textLang(c.title_name)} className="kk-heading text-lg text-gray-900 group-hover:text-[var(--kk-blue)] break-words mt-0.5">{c.title_name}</h3>
          </div>
          {belt ? (
            <img src={belt} alt="" className="w-14 h-14 rounded-xl object-contain bg-white border border-gray-100 shrink-0" />
          ) : (
            <span className="w-10 h-10 rounded-xl bg-[#fffaf0] text-[#7A5B00] flex items-center justify-center shrink-0" aria-hidden><Crown className="w-5 h-5" /></span>
          )}
        </div>
        {name ? (
          <div className="mt-4 flex items-center gap-3 rounded-xl border border-[#f2c94c]/60 bg-gradient-to-br from-[#fffaf0] to-white p-3">
            <HolderPhoto fighter={f} name={holder.name!} />
            <div className="min-w-0">
              <p lang={textLang(name)} className="font-bold text-gray-900 break-words">{name}</p>
              {f?.clubName && <p lang={textLang(f.clubName)} className="text-xs text-gray-600 truncate">{f.clubName}</p>}
              {facts.some(Boolean) && <p className="text-xs text-gray-500">{facts.filter(Boolean).join(" · ")}</p>}
            </div>
          </div>
        ) : (
          <div className="mt-4 flex items-center gap-3 rounded-xl border border-dashed border-gray-300 p-3">
            <span className="w-14 h-14 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 shrink-0" aria-hidden><Crown className="w-5 h-5" /></span>
            <span className="inline-flex px-2.5 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-semibold">{text.vacant(c)}</span>
          </div>
        )}
      </Link>
    </li>
  );
}

// ─── /champions/<title> ────────────────────────────────────────────────────

export function ChampionPage() {
  const { id: key } = useParams();
  const { t, tn, formatDate, localName } = useI18n();
  const text = useTitleText();
  const data = useFanData();
  const location = useLocation();
  const navigate = useNavigate();

  const listed = findByLink(data?.champions, key);
  const [history, setHistory] = useState<any[] | null>(null);
  const [historyFailed, setHistoryFailed] = useState(false);

  useEffect(() => {
    if (!listed) return;
    if (location.pathname !== championPath(listed)) navigate(championPath(listed), { replace: true });
    let alive = true;
    setHistory(null);
    setHistoryFailed(false);
    api.champions
      .get(listed.id)
      .then((d: any) => alive && setHistory([...(d?.defenses ?? [])].reverse()))
      .catch(() => alive && setHistoryFailed(true));
    return () => {
      alive = false;
    };
  }, [listed?.id]);

  const holder = listed ? holderOf(listed, data) : { fighter: null, name: null };
  const f = holder.fighter;
  const holderName = holder.name ? localName(holder.name, f?.nameKhmer) : null;
  usePageMeta({
    title: listed?.title_name ?? (data ? t("champions.notFound") : null),
    description: listed ? [listed.title_name, holderName ? t("champions.currentChampion") + ": " + holderName : text.vacant(listed)].join(" — ") : null,
    image: isRealImage(listed?.belt_image_url) ? listed.belt_image_url : f && isRealImage(f.image) ? f.image : undefined,
  });

  const back = (
    <Link to="/champions" className="kk-focus inline-flex items-center gap-2 text-sm font-semibold text-[var(--kk-blue)] hover:underline underline-offset-4">
      <ArrowLeft className="w-4 h-4" aria-hidden /> {t("champions.allTitles")}
    </Link>
  );

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <SiteHeader activeSection="fighters" />
        <main className="flex-1"><Loading /></main>
        <SiteFooter />
      </div>
    );
  }

  if (!listed) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <SiteHeader activeSection="fighters" />
        <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-24 text-center space-y-4">
          {data.failed ? (
            <LoadError onRetry={retryFanData} />
          ) : (
            <>
              <h1 className="kk-heading text-2xl text-gray-900">{t("champions.notFound")}</h1>
              <p className="text-gray-600">{t("champions.notFoundText")}</p>
              <div>{back}</div>
            </>
          )}
        </main>
        <SiteFooter />
      </div>
    );
  }

  const belt = isRealImage(listed.belt_image_url) ? listed.belt_image_url : null;
  const facts = [text.type(listed), text.weight(listed), listed.organization && listed.organization !== "KKF" ? listed.organization : null].filter(Boolean);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <SiteHeader activeSection="fighters" />
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 md:px-6 py-8 md:py-12 space-y-8">
        {back}
        <DemoBanner show={data.demo} />

        <section className="rounded-3xl bg-gradient-to-br from-[#fffaf0] via-white to-[#eef3fb] border border-[#ecdcae] px-6 py-8 md:px-10 md:py-10 flex flex-col md:flex-row md:items-center gap-6">
          {belt ? (
            <img src={belt} alt="" className="w-32 h-32 md:w-40 md:h-40 rounded-2xl object-contain bg-white border border-[#ecdcae] shrink-0" />
          ) : (
            <span className="w-20 h-20 rounded-2xl bg-white border border-[#ecdcae] text-[#7A5B00] flex items-center justify-center shrink-0" aria-hidden><Crown className="w-10 h-10" /></span>
          )}
          <div className="min-w-0">
            <p className="kk-label text-[var(--kk-red)]">{t("champions.eyebrow")}</p>
            <h1 lang={textLang(listed.title_name)} className="kk-heading text-3xl md:text-4xl text-[var(--kk-navy)] mt-1 break-words">{listed.title_name}</h1>
            {facts.length > 0 && <p className="mt-2 text-gray-600">{facts.join(" · ")}</p>}
          </div>
        </section>

        <div className="grid lg:grid-cols-[minmax(0,1fr)_320px] gap-8 items-start">
          <div className="space-y-10 min-w-0">
            {/* Current champion */}
            {holderName ? (
              <section aria-label={t("champions.currentChampion")} className="rounded-3xl border border-[#f2c94c]/70 bg-gradient-to-br from-[#fffaf0] to-white p-5 md:p-7 flex flex-col sm:flex-row sm:items-center gap-5">
                <HolderPhoto fighter={f} name={holder.name!} size="lg" />
                <div className="min-w-0 space-y-1.5">
                  <p className="kk-label text-[#7A5B00] flex items-center gap-1.5"><Crown className="w-4 h-4" aria-hidden /> {t("champions.currentChampion")}</p>
                  {f ? (
                    <Link to={`/fighters/${getFighterSlug(f)}`} lang={textLang(holderName)} className="kk-focus kk-heading text-2xl md:text-3xl text-gray-900 hover:text-[var(--kk-blue)] break-words">{holderName}</Link>
                  ) : (
                    <p lang={textLang(holderName)} className="kk-heading text-2xl md:text-3xl text-gray-900 break-words">{holderName}</p>
                  )}
                  {f?.nameKhmer && holderName !== f.nameKhmer && <p lang="km" className="text-gray-600">{f.nameKhmer}</p>}
                  <p className="text-sm text-gray-600">
                    {[f?.clubName, f?.record ? `${f.record} ${t("search.recordSuffix")}` : null, Number(listed.defense_count) > 0 ? tn("club.defenses", Number(listed.defense_count)) : null].filter(Boolean).join(" · ")}
                  </p>
                </div>
              </section>
            ) : (
              <section className="rounded-3xl border border-dashed border-gray-300 bg-white p-6 md:p-7 flex items-center gap-4">
                <span className="w-16 h-16 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 shrink-0" aria-hidden><Crown className="w-7 h-7" /></span>
                <div>
                  <p className="inline-flex px-2.5 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-semibold">{text.vacant(listed)}</p>
                  {groupOf(listed) !== "awards" && <p className="mt-2 text-gray-600">{t("champions.vacantText")}</p>}
                </div>
              </section>
            )}

            {/* Title history, newest first */}
            <Section
              title={t("champions.history")}
              icon={<History className="w-5 h-5 text-[var(--kk-blue)]" aria-hidden />}
              action={history && history.length > 0 ? <span className="text-sm text-gray-500">{tn("champions.titleFights", history.length)}</span> : undefined}
            >
              {historyFailed ? (
                <LoadError onRetry={() => navigate(0)} />
              ) : !history ? (
                <Loading className="py-10" />
              ) : history.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-gray-300 bg-white p-6 text-sm text-gray-600">{t("champions.historyEmpty")}</p>
              ) : (
                <ol className="space-y-3">
                  {history.map((d) => <HistoryRow key={d.id} d={d} data={data} />)}
                </ol>
              )}
            </Section>

            <HubAskAbout questions={[holderName ? t("hub.askTitle", { title: listed.title_name }) : null, t("hub.askTitleHistory", { title: listed.title_name })].filter(Boolean) as string[]} />
          </div>

          <aside className="space-y-4">
            <SideCard title={t("champions.details")}>
              <div className="space-y-3">
                {text.type(listed) && <DetailRow icon={<Trophy className={iconCls} />} label={t("champions.type")}>{text.type(listed)}</DetailRow>}
                {text.weight(listed) && <DetailRow icon={<Scale className={iconCls} />} label={t("champions.weight")}>{text.weight(listed)}</DetailRow>}
                {holderName && listed.date_awarded && <DetailRow icon={<CalendarDays className={iconCls} />} label={t("champions.wonOn")}>{formatDate(listed.date_awarded, "long")}</DetailRow>}
                {holderName && listed.last_defense_date && <DetailRow icon={<Shield className={iconCls} />} label={t("champions.lastDefense")}>{formatDate(listed.last_defense_date, "long")}</DetailRow>}
                {f?.clubName && <DetailRow icon={<Building2 className={iconCls} />} label={t("champions.club")}>{f.clubName}</DetailRow>}
              </div>
            </SideCard>
          </aside>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

function HistoryRow({ d, data }: { d: any; data: FanData }) {
  const { t, localName } = useI18n();
  const name = (f: { name: string; nameKhmer?: string }) => localName(f.name, f.nameKhmer);
  // The bout names both fighters; the stored entry only has the opponent.
  const bout = d.match_id ? data.bouts.find((b) => b.id === d.match_id) : undefined;
  const winner = bout ? (bout.winnerId === bout.fighterA.id ? bout.fighterA : bout.winnerId === bout.fighterB.id ? bout.fighterB : null) : null;
  const loser = bout && winner ? (winner.id === bout.fighterA.id ? bout.fighterB : bout.fighterA) : null;
  const opponent = d.opponent || "";

  let text: string;
  if (d.result === "Crowned New Champion") text = winner && loser ? t("champions.crowned", { winner: name(winner), loser: name(loser) }) : t("champions.crownedPlain", { loser: opponent });
  else if (d.result === "Won") text = winner && loser ? t("champions.defended", { holder: name(winner), opponent: name(loser) }) : t("champions.defendedPlain", { opponent });
  else text = winner && loser ? t("champions.lost", { winner: name(winner), holder: name(loser) }) : t("champions.lostPlain", { opponent });

  const tone = d.result === "Lost" ? "bg-[#fdf1f3] text-[var(--kk-red)]" : d.result === "Won" ? "bg-emerald-50 text-emerald-700" : "bg-[#fffaf0] text-[#7A5B00]";
  const method = d.method && !/^(draw|no contest)$/i.test(d.method) ? (d.method.toLowerCase() === "decision" ? t("result.decision") : d.method) : null;
  const eventHref = d.event_id && data.events.some((e: any) => e.id === d.event_id) ? eventPathById(data.events, d.event_id) : null;

  return (
    <li className="flex items-start gap-4 rounded-2xl border border-gray-200 bg-white p-4">
      <DateBadge date={d.date} />
      <div className="min-w-0 space-y-1">
        <p className="flex items-start gap-2">
          <span className={`mt-0.5 w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${tone}`} aria-hidden><Crown className="w-3.5 h-3.5" /></span>
          <span lang={textLang(text)} className="font-semibold text-gray-900 break-words">{text}</span>
        </p>
        <p className="text-sm text-gray-600 pl-8">
          {[
            eventHref ? <Link key="e" to={eventHref} lang={textLang(d.event_name)} className="kk-focus font-semibold text-[var(--kk-blue)] hover:underline underline-offset-4">{d.event_name}</Link> : d.event_name ? <span key="e" lang={textLang(d.event_name)}>{d.event_name}</span> : null,
            method ? <span key="m">{method}</span> : null,
            d.round && method && d.method.toLowerCase() !== "decision" ? <span key="r">{t("champions.round", { n: d.round })}</span> : null,
          ]
            .filter(Boolean)
            .flatMap((node, i) => (i ? [<span key={`s${i}`} aria-hidden> · </span>, node] : [node]))}
        </p>
      </div>
    </li>
  );
}
