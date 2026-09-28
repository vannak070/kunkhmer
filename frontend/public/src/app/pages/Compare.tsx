import { useSearchParams } from "react-router";
import { LoadError } from "../components/LoadError";
import { ArrowLeftRight, Swords } from "lucide-react";
import { SiteHeader } from "../components/layout/SiteHeader";
import { SiteFooter } from "../components/layout/SiteFooter";
import { MatchupView } from "../components/fan/Matchup";
import { DemoBanner } from "../components/fan/FanWidgets";
import { HubAskAbout } from "../components/hub/HubAskAbout";
import { useFanData, retryFanData } from "../data/fanData";
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
  const optionLabel = (f: any) => `${localName(f.name, f.nameKhmer)} · ${f.record || ""}`.trim();
  /** Type to search: picking a suggestion (or typing a full name) chooses that fighter. */
  const picker = (key: "red" | "blue", value?: any) => (
    <label className="flex-1 min-w-0">
      <span className={`block kk-label mb-1 ${key === "red" ? "text-[var(--kk-red)]" : "text-[var(--kk-blue)]"}`}>
        {t(key === "red" ? "matchup.red" : "matchup.blue")}
      </span>
      <input
        key={`${key}-${value?.id ?? "none"}`}
        type="search"
        list="compare-fighters"
        defaultValue={value ? optionLabel(value) : ""}
        placeholder={t("matchup.searchFighter")}
        onChange={(e) => {
          const text = e.target.value.trim().toLowerCase();
          const hit = sorted.find((f) => optionLabel(f).toLowerCase() === text || f.name.toLowerCase() === text || (f.nameKhmer || "").toLowerCase() === text);
          if (hit) set(key, hit.id);
          else if (!text) set(key, "");
        }}
        className={`kk-focus w-full h-12 px-3 bg-white border-2 rounded-xl text-sm font-semibold text-gray-800 ${
          key === "red" ? "border-red-200 focus:border-[var(--kk-red)]" : "border-blue-200 focus:border-[var(--kk-blue)]"
        }`}
      />
    </label>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <SiteHeader activeSection="fighters" />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 md:px-6 py-8 md:py-12 space-y-6">
        <section className="rounded-3xl bg-gradient-to-br from-[#eef3fb] via-white to-[#fdf1f3] border border-[#d5e0f3] px-6 py-7 md:px-10 md:py-9">
          <p className="kk-label text-[var(--kk-red)] flex items-center gap-2"><Swords className="w-4 h-4" aria-hidden />{t("matchup.eyebrow")}</p>
          <h1 className="kk-heading text-3xl md:text-5xl text-[var(--kk-navy)] mt-1">{t("matchup.title")}</h1>
          <p className="mt-2 text-gray-600 max-w-2xl">{t("matchup.subtitle")}</p>
          <p className="mt-1 text-sm text-gray-500 max-w-2xl">{t("matchup.notPrediction")}</p>
        </section>
        <datalist id="compare-fighters">
          {sorted.map((f) => <option key={f.id} value={optionLabel(f)} />)}
        </datalist>

        <DemoBanner show={Boolean(data?.demo)} />
        {data?.failed && <LoadError onRetry={retryFanData} />}

        <div className="flex flex-col sm:flex-row sm:items-end gap-3 bg-white border border-gray-200 rounded-2xl p-4">
          {picker("red", red)}
          <button
            type="button"
            onClick={swap}
            aria-label={t("matchup.swap")}
            title={t("matchup.swap")}
            className="kk-focus self-center sm:self-end h-12 w-12 flex items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 hover:border-[var(--kk-blue)] hover:text-[var(--kk-blue)] transition-colors"
          >
            <ArrowLeftRight className="w-4 h-4" aria-hidden />
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
          <>
            <MatchupView data={data} redId={red.id} blueId={blue.id} />
            <HubAskAbout
              questions={[
                t("hub.askCompareH2H", { red: localName(red.name, red.nameKhmer), blue: localName(blue.name, blue.nameKhmer) }),
                t("hub.askCompareRecords", { red: localName(red.name, red.nameKhmer), blue: localName(blue.name, blue.nameKhmer) }),
              ]}
            />
          </>
        ) : (
          <p className="py-12 text-center text-gray-500">{t("matchup.pickTwo")}</p>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}
