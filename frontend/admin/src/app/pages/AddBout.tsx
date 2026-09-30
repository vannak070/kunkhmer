/**
 * Add bout (/home/matches/:batchId/create-match — same address as before, so every button still works):
 * one screen instead of the old 3-step "Create Match" wizard.
 *   Red corner / Blue corner — search a registered fighter (weight, club, record shown)
 *   Agreed weight (the agreed-weight list, preset from the red fighter), Rules (Settings › Bout rules),
 *   Gloves (Settings › Glove brands), Title fight (optional, ?championId= presets it)
 *   "Add bout" (back to the fight night) or "Add and add another" (keeps weight / rules / gloves).
 * Warns (doesn't block) when a fighter is far from the agreed weight or already on this card.
 * English + Khmer. See claude/updates/program-simple-forms.md.
 */
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router";
import { toast } from "sonner";
import { AlertTriangle, ArrowLeft, Search, Swords, Trophy, X } from "lucide-react";
import { api } from "../utils/api";
import { useT } from "../i18n/program";
import { WEIGHT_CLASSES } from "../data/champion";
import { FighterAvatar, LangSwitch } from "../components/program/shared";
import { issueTexts } from "../components/fighters/PrivateDetails";
import { fieldCls } from "../components/program/FightNightFields";

const weightOf = (f: any) => Number(f?.currentWeight ?? f?.current_weight) || null;
const nearestWeight = (kg: number | null) => (kg ? WEIGHT_CLASSES.reduce((best, w) => (Math.abs(w - kg) < Math.abs(best - kg) ? w : best), WEIGHT_CLASSES[0]) : WEIGHT_CLASSES[3]);
/** More than this away from the agreed weight → a warning. */
const WEIGHT_WARN_KG = 3;

export function AddBout() {
  const { batchId } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { t, lang } = useT();

  const [card, setCard] = useState<any | null | undefined>(undefined);
  const [fighters, setFighters] = useState<any[]>([]);
  const [titles, setTitles] = useState<any[]>([]);
  const [cardBouts, setCardBouts] = useState<any[]>([]);
  const [rules, setRules] = useState<any[]>([]);
  const [gloves, setGloves] = useState<any[]>([]);

  const [red, setRed] = useState<any | null>(null);
  const [blue, setBlue] = useState<any | null>(null);
  const [weight, setWeight] = useState<number>(WEIGHT_CLASSES[3]);
  const [weightTouched, setWeightTouched] = useState(false);
  const [ruleId, setRuleId] = useState("");
  const [glove, setGlove] = useState("");
  const [titleId, setTitleId] = useState(params.get("championId") ?? "");
  const [isTitle, setIsTitle] = useState(Boolean(params.get("championId")));
  const [busy, setBusy] = useState(false);
  // Fighters with missing / expired private details (staff only) — a warning, never a block.
  const [gapById, setGapById] = useState<Map<string, any>>(new Map());

  const load = async () => {
    try {
      const c = await api.batches.get(batchId!);
      const [fs, cs, bs, rs, gs] = await Promise.all([
        api.fighters.list(),
        api.champions.list().catch(() => []),
        api.matches.list(batchId),
        api.settingsLists.list("bout-rules").catch(() => []),
        api.settingsLists.list("glove-brands").catch(() => []),
      ]);
      setCard(c);
      api.fighters.privateSummary().then((rows) => setGapById(new Map(rows.map((r: any) => [r.fighterId, r])))).catch(() => {});
      // Only registered (verified) fighters can be matched.
      setFighters((fs as any[]).filter((f) => f.status === "Active"));
      setTitles(cs);
      setCardBouts(bs);
      setRules(rs);
      setGloves(gs);
      if (rs[0]) setRuleId((id) => id || rs[0].id);
      if (gs[0]) setGlove((g) => g || `${gs[0].brand}${gs[0].model ? ` ${gs[0].model}` : ""}`);
      const preset = (cs as any[]).find((x) => x.id === params.get("championId"));
      if (preset) { setWeight(Number(preset.weight_class) || WEIGHT_CLASSES[3]); setWeightTouched(true); }
    } catch {
      setCard(null);
    }
  };
  useEffect(() => { load(); }, [batchId]);

  const rule = rules.find((r) => r.id === ruleId) ?? null;
  const back = card ? `/home/events/${card.event_id}#card-${card.id}` : "/home/program?tab=events";
  const onCard = (f: any) => cardBouts.some((b) => b.fighter_a_id === f.id || b.fighter_b_id === f.id);
  const offWeight = (f: any) => { const kg = weightOf(f); return kg !== null && Math.abs(kg - weight) > WEIGHT_WARN_KG; };
  const titleOptions = useMemo(
    () => [...titles].sort((a, b) => Math.abs(Number(a.weight_class) - weight) - Math.abs(Number(b.weight_class) - weight)),
    [titles, weight],
  );

  const pickRed = (f: any | null) => {
    setRed(f);
    if (f && !weightTouched) setWeight(nearestWeight(weightOf(f)));
  };

  const save = async (another: boolean) => {
    if (!red || !blue) { toast.error(t("bout.pickBoth")); return; }
    if (red.id === blue.id) { toast.error(t("bout.sameFighter")); return; }
    if (isTitle && !titleId) { toast.error(t("bout.pickTitle")); return; }
    setBusy(true);
    try {
      await api.matches.create({
        eventId: card.event_id,
        subEventId: card.id,
        fighterAId: red.id,
        fighterBId: blue.id,
        rounds: rule?.rounds ?? 5,
        roundTime: rule?.round_time ?? 3,
        knockdownLimit: rule?.knockdown_limit ?? 3,
        agreedWeight: weight,
        gloveSize: rule?.glove_size ?? "8oz",
        gloveBrand: glove || "—",
        sortOrder: cardBouts.length + 1,
        isTitleMatch: isTitle,
        championshipId: isTitle ? titleId : null,
      });
      toast.success(t("bout.added", { red: red.name, blue: blue.name }));
      if (another) {
        setRed(null);
        setBlue(null);
        setIsTitle(false);
        setTitleId("");
        setBusy(false);
        setCardBouts(await api.matches.list(batchId));
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        navigate(back);
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("common.error"));
      setBusy(false);
    }
  };

  if (card === undefined) return <div className="p-10 flex justify-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" aria-label={t("common.loading")} /></div>;
  if (card === null)
    return (
      <div className="max-w-3xl mx-auto p-8 text-center space-y-4">
        <p className="text-slate-700">{t("common.error")}</p>
        <button type="button" onClick={() => { setCard(undefined); load(); }} className="h-11 px-5 rounded-xl bg-primary text-white text-sm font-semibold hover:opacity-90">{t("common.tryAgain")}</button>
      </div>
    );

  const warnings = [red, blue].filter(Boolean).flatMap((f: any) => [
    ...(onCard(f) ? [t("bout.warnOnCard", { name: f.name })] : []),
    ...(offWeight(f) ? [t("bout.warnWeight", { name: f.name, kg: weightOf(f), agreed: weight })] : []),
    ...(gapById.has(f.id) ? [t("pv.warnLine", { name: f.name, issues: issueTexts(gapById.get(f.id), t).join(", ") })] : []),
  ]);

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-6">
      <div className="flex items-center justify-between gap-3">
        <Link to={back} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-primary">
          <ArrowLeft className="w-4 h-4" aria-hidden /> {t("bout.back")}
        </Link>
        <LangSwitch />
      </div>

      <header className="flex items-start gap-3">
        <span className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0" aria-hidden><Swords className="w-6 h-6" /></span>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">{t("card.addBout")}</h1>
          <p className="text-base text-slate-600 mt-1">{card.name} · {t("bout.onCard", { n: cardBouts.length })}</p>
        </div>
      </header>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 md:p-7 space-y-6 shadow-sm">
        <div className="grid md:grid-cols-2 gap-5">
          <FighterPicker corner="red" label={t("common.red")} fighters={fighters} value={red} other={blue} onChange={pickRed} lang={lang} />
          <FighterPicker corner="blue" label={t("common.blue")} fighters={fighters} value={blue} other={red} onChange={setBlue} lang={lang} />
        </div>

        <div className="grid sm:grid-cols-3 gap-5">
          <label className="block">
            <span className="text-sm font-semibold text-slate-800">{t("bout.weight")}</span>
            <select className={`${fieldCls} mt-1`} value={weight} onChange={(e) => { setWeight(Number(e.target.value)); setWeightTouched(true); }}>
              {WEIGHT_CLASSES.map((w) => <option key={w} value={w}>{t("common.kg", { n: w })}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-slate-800">{t("bout.rules")}</span>
            <select className={`${fieldCls} mt-1`} value={ruleId} onChange={(e) => setRuleId(e.target.value)}>
              {rules.length === 0 && <option value="">{t("bout.rulesDefault")}</option>}
              {rules.map((r) => <option key={r.id} value={r.id}>{lang === "km" && r.name_khmer ? r.name_khmer : r.name}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-slate-800">{t("bout.gloves")}</span>
            <select className={`${fieldCls} mt-1`} value={glove} onChange={(e) => setGlove(e.target.value)}>
              {gloves.length === 0 && <option value="">—</option>}
              {gloves.map((g) => { const label = `${g.brand}${g.model ? ` ${g.model}` : ""}`; return <option key={g.id} value={label}>{label}</option>; })}
            </select>
          </label>
        </div>
        {rule && <p className="text-sm text-slate-600 -mt-3">{t("bout.ruleLine", { rounds: rule.rounds, min: rule.round_time, glove: rule.glove_size })}</p>}

        <div className="rounded-xl border border-slate-200 p-4 space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" className="w-5 h-5" checked={isTitle} onChange={(e) => setIsTitle(e.target.checked)} />
            <span className="inline-flex items-center gap-2 text-base font-semibold text-slate-900"><Trophy className="w-5 h-5 text-amber-600" aria-hidden /> {t("bout.isTitle")}</span>
          </label>
          {isTitle && (
            titles.length === 0 ? (
              <p className="text-sm text-slate-600">{t("bout.noTitles")} <Link to="/home/champion/new" className="font-semibold text-primary hover:underline">{t("ov.newTitle")}</Link></p>
            ) : (
              <select className={fieldCls} value={titleId} onChange={(e) => setTitleId(e.target.value)} aria-label={t("bout.whichTitle")}>
                <option value="">{t("bout.whichTitle")}</option>
                {titleOptions.map((c) => <option key={c.id} value={c.id}>{c.title_name}{c.current_holder_name_db ? ` — ${c.current_holder_name_db}` : ` — ${t("bout.vacant")}`}</option>)}
              </select>
            )
          )}
        </div>

        {warnings.length > 0 && (
          <ul role="status" className="rounded-xl border border-amber-200 bg-amber-50 p-4 space-y-1 text-sm text-amber-900">
            {warnings.map((w) => <li key={w} className="flex items-start gap-2"><AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" aria-hidden /> {w}</li>)}
          </ul>
        )}
      </section>

      <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
        <Link to={back} className="h-12 px-6 rounded-xl border border-slate-300 bg-white text-base font-semibold text-slate-700 hover:bg-slate-50 inline-flex items-center justify-center">{t("common.cancel")}</Link>
        <button type="button" disabled={busy} onClick={() => save(true)} className="h-12 px-6 rounded-xl border border-primary text-primary bg-white text-base font-semibold hover:bg-primary/5 disabled:opacity-60">{t("bout.addAnother")}</button>
        <button type="button" disabled={busy} onClick={() => save(false)} className="h-12 px-6 rounded-xl bg-primary text-white text-base font-semibold hover:opacity-90 disabled:opacity-60">{busy ? t("common.saving") : t("card.addBout")}</button>
      </div>
    </div>
  );
}

function FighterPicker({ corner, label, fighters, value, other, onChange, lang }: {
  corner: "red" | "blue";
  label: string;
  fighters: any[];
  value: any | null;
  other: any | null;
  onChange: (f: any | null) => void;
  lang: string;
}) {
  const { t } = useT();
  const [q, setQ] = useState("");
  const tone = corner === "red" ? "border-red-200 bg-red-50/40" : "border-blue-200 bg-blue-50/40";
  const dot = corner === "red" ? "bg-red-600" : "bg-blue-600";
  const name = (f: any) => (lang === "km" && f.nameKhmer ? f.nameKhmer : f.name);
  const facts = (f: any) => [weightOf(f) ? t("common.kg", { n: weightOf(f) }) : null, f.clubName, f.record ? `${f.record} W-L-D` : null].filter(Boolean).join(" · ");

  const matches = useMemo(() => {
    const s = q.trim().toLowerCase();
    return fighters
      .filter((f) => f.id !== other?.id)
      .filter((f) => !s || [f.name, f.nameKhmer, f.alias, f.clubName].some((x) => x?.toLowerCase().includes(s)))
      .slice(0, 8);
  }, [fighters, q, other]);

  return (
    <div className={`rounded-xl border p-4 space-y-3 ${tone}`}>
      <p className="flex items-center gap-2 text-sm font-bold text-slate-800"><span className={`w-2.5 h-2.5 rounded-full ${dot}`} aria-hidden /> {label}</p>
      {value ? (
        <div className="flex items-center gap-3 rounded-xl bg-white border border-slate-200 p-3">
          <FighterAvatar name={value.name} image={value.image} />
          <div className="min-w-0 flex-1">
            <p className="text-base font-bold text-slate-900 break-words">{name(value)}</p>
            <p className="text-sm text-slate-600 break-words">{facts(value)}</p>
          </div>
          <button type="button" onClick={() => onChange(null)} aria-label={t("common.change")} className="w-9 h-9 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-900 inline-flex items-center justify-center shrink-0"><X className="w-4 h-4" aria-hidden /></button>
        </div>
      ) : (
        <>
          <label className="relative block">
            <span className="sr-only">{t("bout.searchFighter")}</span>
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" aria-hidden />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("bout.searchFighter")} className={`${fieldCls} pl-9`} />
          </label>
          <ul className="max-h-72 overflow-y-auto rounded-xl bg-white border border-slate-200 divide-y divide-slate-100">
            {matches.length === 0 && <li className="p-3 text-sm text-slate-500">{t("bout.noFighter")}</li>}
            {matches.map((f) => (
              <li key={f.id}>
                <button type="button" onClick={() => { onChange(f); setQ(""); }} className="w-full text-left flex items-center gap-3 p-3 hover:bg-slate-50">
                  <FighterAvatar name={f.name} image={f.image} />
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-slate-900 break-words">{name(f)}</span>
                    <span className="block text-xs text-slate-600 break-words">{facts(f)}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
