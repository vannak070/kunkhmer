import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { Crown, Info, Medal } from "lucide-react";
import { SiteHeader } from "../components/layout/SiteHeader";
import { SiteFooter } from "../components/layout/SiteFooter";
import { DemoBanner, FormGuide } from "../components/fan/FanWidgets";
import { divisions, useFanData, type Standing } from "../data/fanData";
import { getFighterSlug } from "../data/masterData";
import { usePageMeta } from "../hooks/usePageTitle";
import { useI18n } from "../i18n/LanguageContext";

const slugify = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export function Rankings() {
  const { t, tn, localName, formatWeight } = useI18n();
  const data = useFanData();
  const [params, setParams] = useSearchParams();
  const divs = useMemo(() => (data ? divisions(data) : []), [data]);
  const selected = divs.find((d) => slugify(d.name) === params.get("division")) ?? divs[0];

  usePageMeta({ title: t("nav.rankings"), description: t("rankings.subtitle") });

  // Keep the selected chip in view on phones.
  useEffect(() => {
    if (selected) document.getElementById(`div-${slugify(selected.name)}`)?.scrollIntoView({ block: "nearest", inline: "center" });
  }, [selected?.name]);

  const record = (s: Standing) => `${s.fighter.wins}-${s.fighter.losses}-${s.fighter.draws}`;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <SiteHeader activeSection="rankings" />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-6 py-8 md:py-12 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-[#F2C94C] to-amber-500 rounded-xl flex items-center justify-center shadow-md">
            <Medal className="w-6 h-6 text-[#051C42]" aria-hidden />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-gray-900 leading-tight">{t("rankings.title")}</h1>
            <p className="text-sm text-gray-600 font-medium">{t("rankings.subtitle")}</p>
          </div>
        </div>

        <DemoBanner show={Boolean(data?.demo)} />

        <p className="flex items-start gap-2 text-sm text-gray-600 bg-white border border-gray-200 rounded-xl px-4 py-3">
          <Info className="w-4 h-4 mt-0.5 text-[#0A3D91] shrink-0" aria-hidden />
          {t("rankings.unofficial")}
        </p>

        {!data ? (
          <div className="py-24 flex justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#0A3D91]" />
          </div>
        ) : divs.length === 0 ? (
          <p className="py-16 text-center text-gray-500">{t("rankings.empty")}</p>
        ) : (
          <>
            <nav aria-label={t("rankings.divisions")} className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 md:mx-0 md:px-0">
              {divs.map((d) => {
                const active = d.name === selected?.name;
                return (
                  <button
                    key={d.name}
                    id={`div-${slugify(d.name)}`}
                    type="button"
                    onClick={() => setParams({ division: slugify(d.name) }, { replace: true })}
                    aria-pressed={active}
                    className={`shrink-0 px-4 py-2.5 rounded-xl border text-sm font-bold transition-colors ${
                      active ? "bg-[#0A3D91] border-[#0A3D91] text-white" : "bg-white border-gray-200 text-gray-700 hover:border-[#0A3D91]"
                    }`}
                  >
                    {d.name}
                    <span className={`ml-2 text-xs font-semibold ${active ? "text-white/70" : "text-gray-400"}`}>{d.standings.length}</span>
                  </button>
                );
              })}
            </nav>

            {selected && (
              <section className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-5 md:px-8 py-5 bg-gradient-to-r from-[#051C42] to-[#0A3D91] text-white">
                  <div>
                    <h2 className="text-2xl font-black">{selected.name}</h2>
                    <p className="text-sm text-white/70">{tn("rankings.fightersCount", selected.standings.length)}</p>
                  </div>
                  {selected.champion ? (
                    <Link
                      to={`/fighters/${getFighterSlug(selected.champion)}`}
                      className="flex items-center gap-3 bg-white/10 hover:bg-white/15 border border-white/20 rounded-2xl pl-2 pr-4 py-2 transition-colors"
                    >
                      <img src={selected.champion.image} alt="" className="w-11 h-11 rounded-full object-cover border-2 border-[#F2C94C]" />
                      <div>
                        <p className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-[#F2C94C]">
                          <Crown className="w-3.5 h-3.5" aria-hidden />
                          {t("rankings.champion")}
                        </p>
                        <p className="font-black leading-tight">{localName(selected.champion.name, selected.champion.nameKhmer)}</p>
                        {selected.titleName && <p className="text-[11px] text-white/60">{selected.titleName}</p>}
                      </div>
                    </Link>
                  ) : (
                    <span className="text-sm font-semibold text-white/60">{t("rankings.vacant")}</span>
                  )}
                </header>

                {/* Desktop table */}
                <table className="hidden md:table w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs font-bold uppercase tracking-wider text-gray-400 border-b border-gray-100">
                      <th className="px-8 py-3 w-16">{t("rankings.rank")}</th>
                      <th className="py-3">{t("rankings.fighter")}</th>
                      <th className="py-3">{t("fighters.weight")}</th>
                      <th className="py-3">{t("rankings.record")}</th>
                      <th className="py-3">{t("rankings.winPct")}</th>
                      <th className="py-3 pr-8">{t("rankings.form")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selected.standings.map((s) => (
                      <tr key={s.fighter.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/80">
                        <td className="px-8 py-3">
                          {s.isChampion ? (
                            <Crown className="w-5 h-5 text-amber-500" aria-label={t("rankings.champion")} />
                          ) : (
                            <span className="text-lg font-black text-gray-300">{s.rank}</span>
                          )}
                        </td>
                        <td className="py-3">
                          <Link to={`/fighters/${getFighterSlug(s.fighter)}`} className="flex items-center gap-3 group">
                            <img src={s.fighter.image} alt="" className="w-10 h-10 rounded-full object-cover border border-gray-200" />
                            <div className="min-w-0">
                              <p className="font-bold text-gray-900 group-hover:text-[#0A3D91] truncate">{localName(s.fighter.name, s.fighter.nameKhmer)}</p>
                              <p className="text-xs text-gray-500 truncate">{s.fighter.club}</p>
                            </div>
                          </Link>
                        </td>
                        <td className="py-3 text-gray-600 whitespace-nowrap">{formatWeight(s.fighter.weightKg)}</td>
                        <td className="py-3 font-bold text-gray-900 whitespace-nowrap">
                          {record(s)} <span className="text-xs font-semibold text-gray-400">{t("common.wld")}</span>
                        </td>
                        <td className="py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                              <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${s.winPct}%` }} />
                            </div>
                            <span className="font-semibold text-gray-700">{s.winPct}%</span>
                          </div>
                        </td>
                        <td className="py-3 pr-8"><FormGuide form={s.form} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Mobile list */}
                <ol className="md:hidden divide-y divide-gray-100">
                  {selected.standings.map((s) => (
                    <li key={s.fighter.id}>
                      <Link to={`/fighters/${getFighterSlug(s.fighter)}`} className="flex items-center gap-3 px-4 py-3">
                        <span className="w-6 text-center shrink-0">
                          {s.isChampion ? <Crown className="w-5 h-5 text-amber-500 mx-auto" aria-label={t("rankings.champion")} /> : <span className="font-black text-gray-300">{s.rank}</span>}
                        </span>
                        <img src={s.fighter.image} alt="" className="w-11 h-11 rounded-full object-cover border border-gray-200 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-gray-900 truncate">{localName(s.fighter.name, s.fighter.nameKhmer)}</p>
                          <p className="text-xs text-gray-500 truncate">{s.fighter.club}</p>
                          <div className="mt-1"><FormGuide form={s.form} /></div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="font-black text-gray-900">{record(s)}</p>
                          <p className="text-xs text-gray-500">{s.winPct}%</p>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ol>
              </section>
            )}
          </>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}
