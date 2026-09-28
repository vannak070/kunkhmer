import { useSearchParams } from "react-router";
import { ArrowLeftRight, Swords } from "lucide-react";
import { SiteHeader } from "../components/layout/SiteHeader";
import { SiteFooter } from "../components/layout/SiteFooter";
import { MatchupView } from "../components/fan/Matchup";
import { DemoBanner } from "../components/fan/FanWidgets";
import { useFanData } from "../data/fanData";
import { getFighterSlug } from "../data/masterData";
import { usePageMeta } from "../hooks/usePageTitle";
import { useI18n } from "../i18n/LanguageContext";

/** Matchup page: /compare?red=<slug>&blue=<slug> (fighter ids also work). */
export function Compare() {
  const { t, localName } = useI18n();
  const data = useFanData();
  const [params, setParams] = useSearchParams();

  const find = (key: string) => {
    const v = params.get(key);
    if (!v || !data) return undefined;
    return data.fighters.find((f) => f.id === v || getFighterSlug(f) === v);
  };
  const red = find("red");
  const blue = find("blue");

  usePageMeta({
    title: red && blue ? `${red.name} vs ${blue.name}` : t("matchup.compareFighters"),
    description: red && blue
      ? `${red.name} (${red.record}) vs ${blue.name} (${blue.record}) — ${t("matchup.subtitle")}`
      : t("matchup.pickTwo"),
    image: red?.image,
  });

  const set = (key: "red" | "blue", fighterId: string) => {
    const next = new URLSearchParams(params);
    const f = data?.fighters.find((x) => x.id === fighterId);
    if (f) next.set(key, getFighterSlug(f));
    else next.delete(key);
    setParams(next, { replace: true });
  };

  const swap = () => {
    const next = new URLSearchParams(params);
    const r = params.get("red");
    const b = params.get("blue");
    if (b) next.set("red", b); else next.delete("red");
    if (r) next.set("blue", r); else next.delete("blue");
    setParams(next, { replace: true });
  };

  const sorted = [...(data?.fighters ?? [])].sort((a, b) => a.name.localeCompare(b.name));
  const picker = (key: "red" | "blue", value?: any) => (
    <label className="flex-1 min-w-0">
      <span className={`block text-xs font-bold uppercase tracking-wider mb-1 ${key === "red" ? "text-red-600" : "text-blue-600"}`}>
        {t(key === "red" ? "matchup.red" : "matchup.blue")}
      </span>
      <select
        value={value?.id ?? ""}
        onChange={(e) => set(key, e.target.value)}
        className={`w-full px-3 py-2.5 bg-white border-2 rounded-xl text-sm font-semibold text-gray-800 focus:outline-none ${
          key === "red" ? "border-red-200 focus:border-red-500" : "border-blue-200 focus:border-blue-500"
        }`}
      >
        <option value="">{t("matchup.pick")}</option>
        {sorted.map((f) => (
          <option key={f.id} value={f.id}>
            {localName(f.name, f.nameKhmer)} · {f.record}
          </option>
        ))}
      </select>
    </label>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <SiteHeader activeSection="fighters" />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 md:px-6 py-8 md:py-12 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-blue-700 rounded-xl flex items-center justify-center shadow-md">
            <Swords className="w-6 h-6 text-white" aria-hidden />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-gray-900 leading-tight">{t("matchup.title")}</h1>
            <p className="text-sm text-gray-600 font-medium">{t("matchup.subtitle")}</p>
          </div>
        </div>

        <DemoBanner show={Boolean(data?.demo)} />

        <div className="flex flex-col sm:flex-row sm:items-end gap-3 bg-white border border-gray-200 rounded-2xl p-4">
          {picker("red", red)}
          <button
            type="button"
            onClick={swap}
            aria-label={t("matchup.swap")}
            title={t("matchup.swap")}
            className="self-center sm:self-end p-3 rounded-xl border border-gray-200 text-gray-600 hover:border-[#0A3D91] hover:text-[#0A3D91] transition-colors"
          >
            <ArrowLeftRight className="w-4 h-4" />
          </button>
          {picker("blue", blue)}
        </div>

        {!data ? (
          <div className="py-24 flex justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#0A3D91]" />
          </div>
        ) : red && blue && red.id === blue.id ? (
          <p className="py-12 text-center text-gray-500">{t("matchup.sameFighter")}</p>
        ) : red && blue ? (
          <MatchupView data={data} redId={red.id} blueId={blue.id} />
        ) : (
          <p className="py-12 text-center text-gray-500">{t("matchup.pickTwo")}</p>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}
