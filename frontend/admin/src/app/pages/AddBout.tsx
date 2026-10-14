/**
 * Add bout (/home/matches/:batchId/create-match — same address as before, so every button still works):
 * one screen instead of the old 3-step "Create Match" wizard.
 *   Red corner / Blue corner — search a registered fighter (weight, club, record shown)
 *   Agreed weight (the agreed-weight list, preset from the red fighter), Rules (Settings › Bout rules),
 *   Gloves (Settings › Glove brands), Title fight (optional, ?championId= presets it)
 *   "Add bout" (back to the fight night) or "Add and add another" (keeps weight / rules / gloves).
 * The KKF matching rules are checked live once both fighters are chosen: what breaks a rule is said in plain words with
 * a fix button (choose another fighter, open the fighter's page), and "Add bout" waits until nothing blocks. Warnings
 * never block. English + Khmer. See claude/updates/program-simple-forms.md and claude/updates/rule-messages.md.
 */
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router";
import { toast } from "sonner";
import { AlertTriangle, ArrowLeft, CheckCircle2, Search, ShieldAlert, Swords, Trophy, X } from "lucide-react";
import { api } from "../utils/api";
import { type TextKey, useT } from "../i18n/program";
import { WEIGHT_CLASSES } from "../data/champion";
import { BOUT_LABELS, FighterAvatar, LangSwitch, RULE_SETS } from "../components/program/shared";
import { issueTexts } from "../components/fighters/PrivateDetails";
import { FIGHTER_PAGE_RULES, PAIR_RULES, type RuleHit, ruleSentence } from "../components/program/ruleSentence";
import { fieldCls } from "../components/program/FightNightFields";

const weightOf = (f: any) => Number(f?.currentWeight ?? f?.current_weight) || null;
/** Agreed weights offered on Add bout: the usual ones plus the youth weights seen on KKF programs. */
const BOUT_WEIGHTS = [...new Set([28, 31, 35, 38, 41, 44, 45, 48, ...WEIGHT_CLASSES, 65, 71, 73, 77])].sort((a, b) => a - b);

const nearestWeight = (kg: number | null) => (kg ? WEIGHT_CLASSES.reduce((best, w) => (Math.abs(w - kg) < Math.abs(best - kg) ? w : best), WEIGHT_CLASSES[0]) : WEIGHT_CLASSES[3]);
/** More than this away from the agreed weight → a warning. */
const WEIGHT_WARN_KG = 3;
/** "Similar weight" in the fighter lists: within this many kg of the agreed weight. */
const NEAR_KG = 2;

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
  // What the program sheet prints for the bout, and the rule set (claude/features/weekly-program.md).
  const [boutLabel, setBoutLabel] = useState("");
  // Blue corner "to be announced": the bout is saved with an empty corner, filled later (claude/updates/empty-corners-draws.md).
  const [blueLater, setBlueLater] = useState(false);
  const [ruleSet, setRuleSet] = useState("kun_khmer");
  const [glove, setGlove] = useState("");
  const [titleId, setTitleId] = useState(params.get("championId") ?? "");
  const [isTitle, setIsTitle] = useState(Boolean(params.get("championId")));
  const [busy, setBusy] = useState(false);
  // Fighters with missing / expired private details (staff only) — a warning, never a block.
  const [gapById, setGapById] = useState<Map<string, any>>(new Map());
  // The fight night's title list and whether KKF confirmed it (claude/updates/fight-night-titles.md); null = unknown.
  const [nightTitles, setNightTitles] = useState<{ ids: string[]; confirmed: boolean } | null>(null);
  // Live check of the KKF matching rules for the chosen pair: undefined = not asked yet / asking, null = couldn't check.
  const [check, setCheck] = useState<{ allowed: boolean; blocked: RuleHit[]; warnings: RuleHit[] } | null | undefined>(undefined);

  // A bout with a foreign fighter is an international bout unless the officer chose another type.
  useEffect(() => {
    const foreign = [red, blue].some((f) => f && f.nationality && f.nationality !== "Cambodian");
    if (foreign && !boutLabel) setBoutLabel("international");
  }, [red?.id, blue?.id]);

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
      api.events.agreements(c.event_id)
        .then((a: any) => setNightTitles({ ids: a.titles.map((x: any) => x.id), confirmed: a.items.titles.state === "confirmed" }))
        .catch(() => setNightTitles(null));
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
  const nameOf = (id: string | null | undefined, fallback: string) => {
    const f = id ? [...fighters, red, blue].find((x) => x?.id === id) : null;
    return f ? (lang === "km" && f.nameKhmer ? f.nameKhmer : f.name) : fallback;
  };
  const back = card ? `/home/events/${card.event_id}#card-${card.id}` : "/home/matches";
  const onCard = (f: any) => cardBouts.some((b) => b.fighter_a_id === f.id || b.fighter_b_id === f.id);
  const offWeight = (f: any) => { const kg = weightOf(f); return kg !== null && Math.abs(kg - weight) > WEIGHT_WARN_KG; };
  // This fight night's titles first, then the closest weight.
  const onNight = (id: string) => Boolean(nightTitles?.ids.includes(id));
  const titleOptions = useMemo(
    () => [...titles].sort((a, b) => Number(onNight(b.id)) - Number(onNight(a.id)) || Math.abs(Number(a.weight_class) - weight) - Math.abs(Number(b.weight_class) - weight)),
    [titles, weight, nightTitles],
  );

  useEffect(() => {
    setCheck(undefined);
    if (!card || !red || (!blue && !blueLater)) return;
    let live = true;
    const timer = setTimeout(() => {
      api.matches
        .check({ subEventId: card.id, fighterAId: red.id, fighterBId: blueLater ? null : blue.id, agreedWeight: weight, championshipId: isTitle && titleId ? titleId : null })
        .then((r) => live && setCheck(r))
        .catch(() => live && setCheck(null));
    }, 300);
    return () => { live = false; clearTimeout(timer); };
  }, [card?.id, red?.id, blue?.id, blueLater, weight, isTitle, titleId]);

  const pickRed = (f: any | null) => {
    setRed(f);
    if (f && !weightTouched) setWeight(nearestWeight(weightOf(f)));
  };

  const save = async (another: boolean) => {
    if (!red || (!blue && !blueLater)) { toast.error(t("bout.pickBoth")); return; }
    if (!blueLater && red.id === blue.id) { toast.error(t("bout.sameFighter")); return; }
    if (isTitle && !titleId) { toast.error(t("bout.pickTitle")); return; }
    setBusy(true);
    try {
      const created = await api.matches.create({
        eventId: card.event_id,
        subEventId: card.id,
        fighterAId: red.id,
        fighterBId: blueLater ? null : blue.id,
        rounds: rule?.rounds ?? 5,
        roundTime: rule?.round_time ?? 3,
        knockdownLimit: rule?.knockdown_limit ?? 3,
        agreedWeight: weight,
        gloveSize: rule?.glove_size ?? "8oz",
        gloveBrand: glove || "—",
        sortOrder: cardBouts.length + 1,
        isTitleMatch: isTitle,
        championshipId: isTitle ? titleId : null,
        boutLabel: boutLabel || null,
        ruleSet,
      });
      toast.success(t("bout.added", { red: red.name, blue: blueLater ? t("corner.tba") : blue.name }));
      // Warn rules from the KKF matching rules: the bout is created, the officer is told why to look twice.
      if (created?.warnings?.length) toast.warning(t("mr.warnings", { list: created.warnings.map((w: RuleHit) => ruleSentence(t, lang, w, nameOf)).join(" ") }), { duration: 15000 });
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

  // Once the server's check answered, it covers weight, double booking and the title list; the local notes are the
  // fallback while it is loading or unavailable. Missing private details are always shown.
  const served = Boolean(check);
  const warnings = [red, blue].filter(Boolean).flatMap((f: any) => [
    ...(!served && onCard(f) ? [t("bout.warnOnCard", { name: f.name })] : []),
    ...(!served && offWeight(f) ? [t("bout.warnWeight", { name: f.name, kg: weightOf(f), agreed: weight })] : []),
    ...(gapById.has(f.id) ? [t("pv.warnLine", { name: f.name, issues: issueTexts(gapById.get(f.id), t).join(", ") })] : []),
  ]);
  if (!served && isTitle && titleId && nightTitles) {
    if (!onNight(titleId)) warnings.push(t("bout.warnTitleOff"));
    else if (!nightTitles.confirmed) warnings.push(t("bout.warnTitleUnconfirmed"));
  }
  const blocked = check?.blocked ?? [];
  const served_warnings = check?.warnings ?? [];

  // The fix for one broken rule: choose another fighter (the one named, or either of a pair), or open their page.
  const fixes = (hit: RuleHit) => {
    const out: { label: string; run?: () => void; to?: string }[] = [];
    const corner = hit.fighter_id === red?.id ? "red" : hit.fighter_id === blue?.id ? "blue" : null;
    if (corner) out.push({ label: t("rl.fixPick"), run: () => (corner === "red" ? pickRed(null) : setBlue(null)) });
    else if (PAIR_RULES.includes(hit.key)) out.push({ label: t("rl.fixRed"), run: () => pickRed(null) }, { label: t("rl.fixBlue"), run: () => setBlue(null) });
    if (hit.fighter_id && FIGHTER_PAGE_RULES.includes(hit.key)) out.push({ label: t("rl.fixOpen"), to: `/home/fighters/${hit.fighter_id}` });
    return out;
  };
  const fixButtons = (hit: RuleHit) => {
    const list = fixes(hit);
    return list.length ? (
      <span className="mt-2 flex flex-wrap gap-2">
        {list.map((f) => f.to
          ? <Link key={f.label} to={f.to} className="inline-flex items-center h-10 px-3 rounded-lg border border-red-300 bg-white text-sm font-semibold text-red-800 hover:bg-red-100">{f.label}</Link>
          : <button key={f.label} type="button" onClick={f.run} className="inline-flex items-center h-10 px-3 rounded-lg border border-red-300 bg-white text-sm font-semibold text-red-800 hover:bg-red-100">{f.label}</button>)}
      </span>
    ) : null;
  };

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
          <FighterPicker corner="red" label={t("common.red")} fighters={fighters} value={red} other={blue} onChange={pickRed} lang={lang} nearKg={weightTouched ? weight : null} />
          <div className="space-y-2">
            {blueLater ? (
              <div className="rounded-xl border border-dashed border-blue-300 bg-blue-50/30 p-4 text-sm font-semibold text-slate-700">{t("common.blue")}: {t("corner.tba")}</div>
            ) : (
              <FighterPicker corner="blue" label={t("common.blue")} fighters={fighters} value={blue} other={red} onChange={setBlue} lang={lang} nearKg={weightTouched || red ? weight : null} />
            )}
            <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
              <input type="checkbox" className="w-4 h-4" checked={blueLater} onChange={(e) => { setBlueLater(e.target.checked); if (e.target.checked) setBlue(null); }} />
              {t("corner.emptyOption")}
            </label>
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-5">
          <label className="block">
            <span className="text-sm font-semibold text-slate-800">{t("bout.weight")}</span>
            {/* Any agreed weight (youth bouts go down to 28 kg); the usual ones are offered as suggestions. */}
            <input type="number" inputMode="decimal" step="0.5" min={20} max={200} list="bout-weights" className={`${fieldCls} mt-1`} value={weight || ""} onChange={(e) => { setWeight(Number(e.target.value)); setWeightTouched(true); }} />
            <datalist id="bout-weights">{BOUT_WEIGHTS.map((w) => <option key={w} value={w} />)}</datalist>
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

        <div className="grid sm:grid-cols-2 gap-5">
          <label className="block">
            <span className="text-sm font-semibold text-slate-800">{t("bout.label")}</span>
            <select className={`${fieldCls} mt-1`} value={boutLabel} onChange={(e) => setBoutLabel(e.target.value)}>
              <option value="">{t("common.notSet")}</option>
              {BOUT_LABELS.map((k) => <option key={k} value={k}>{t(`boutLabel.${k}` as TextKey)}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-slate-800">{t("bout.ruleSet")}</span>
            <select className={`${fieldCls} mt-1`} value={ruleSet} onChange={(e) => setRuleSet(e.target.value)}>
              {RULE_SETS.map((k) => <option key={k} value={k}>{t(`ruleSet.${k}` as TextKey)}</option>)}
            </select>
          </label>
        </div>

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
                {titleOptions.map((c) => <option key={c.id} value={c.id}>{onNight(c.id) ? "★ " : ""}{c.title_name}{c.current_holder_name_db ? ` — ${c.current_holder_name_db}` : ` — ${t("bout.vacant")}`}</option>)}
              </select>
            )
          )}
        </div>

        {red && blue && check === undefined && <p role="status" className="text-sm text-slate-500">{t("rl.checking")}</p>}
        {red && blue && check === null && <p role="status" className="text-sm text-slate-500">{t("rl.failed")}</p>}

        {blocked.length > 0 && (
          <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 space-y-3">
            <p className="flex items-center gap-2 font-bold text-red-900"><ShieldAlert className="w-5 h-5 shrink-0" aria-hidden /> {t("rl.blockedTitle")}</p>
            <p className="text-sm text-red-900">{t("rl.blockedHint")}</p>
            <ul className="space-y-3">
              {blocked.map((h, i) => <li key={`${h.key}-${i}`} className="text-sm text-red-900"><span className="block font-medium">{ruleSentence(t, lang, h, nameOf)}</span>{fixButtons(h)}</li>)}
            </ul>
          </div>
        )}

        {(served_warnings.length > 0 || warnings.length > 0) && (
          <div role="status" className="rounded-xl border border-amber-200 bg-amber-50 p-4 space-y-2 text-sm text-amber-900">
            <p className="font-bold">{t("rl.warnTitle")} <span className="font-normal">— {t("rl.warnHint")}</span></p>
            <ul className="space-y-1">
              {served_warnings.map((h, i) => <li key={`${h.key}-${i}`} className="flex items-start gap-2"><AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" aria-hidden /> {ruleSentence(t, lang, h, nameOf)}</li>)}
              {warnings.map((w) => <li key={w} className="flex items-start gap-2"><AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" aria-hidden /> {w}</li>)}
            </ul>
          </div>
        )}

        {check && check.allowed && served_warnings.length === 0 && warnings.length === 0 && (
          <p role="status" className="flex items-center gap-2 text-sm font-medium text-emerald-800"><CheckCircle2 className="w-4 h-4" aria-hidden /> {t("rl.ok")}</p>
        )}
      </section>

      <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
        <Link to={back} className="h-12 px-6 rounded-xl border border-slate-300 bg-white text-base font-semibold text-slate-700 hover:bg-slate-50 inline-flex items-center justify-center">{t("common.cancel")}</Link>
        <button type="button" disabled={busy || blocked.length > 0} onClick={() => save(true)} className="h-12 px-6 rounded-xl border border-primary text-primary bg-white text-base font-semibold hover:bg-primary/5 disabled:opacity-40">{t("bout.addAnother")}</button>
        <button type="button" disabled={busy || blocked.length > 0} onClick={() => save(false)} className="h-12 px-6 rounded-xl bg-primary text-white text-base font-semibold hover:opacity-90 disabled:opacity-60">{busy ? t("common.saving") : t("card.addBout")}</button>
      </div>
    </div>
  );
}

export function FighterPicker({ corner, label, fighters, value, other, onChange, lang, nearKg }: {
  corner: "red" | "blue";
  label: string;
  fighters: any[];
  value: any | null;
  other: any | null;
  onChange: (f: any | null) => void;
  lang: string;
  /** The agreed weight: the list shows fighters within ±2 kg first (all weights on request or when searching). */
  nearKg?: number | null;
}) {
  const { t } = useT();
  const [q, setQ] = useState("");
  const [allWeights, setAllWeights] = useState(false);
  const tone = corner === "red" ? "border-red-200 bg-red-50/40" : "border-blue-200 bg-blue-50/40";
  const dot = corner === "red" ? "bg-red-600" : "bg-blue-600";
  const name = (f: any) => (lang === "km" && f.nameKhmer ? f.nameKhmer : f.name);
  const facts = (f: any) => [weightOf(f) ? t("common.kg", { n: weightOf(f) }) : null, f.clubName, f.record ? `${f.record} W-L-D` : null].filter(Boolean).join(" · ");

  const near = nearKg && nearKg > 0 ? nearKg : null;
  const gap = (f: any) => { const kg = weightOf(f); return kg === null || !near ? Infinity : Math.abs(kg - near); };
  const matches = useMemo(() => {
    const s = q.trim().toLowerCase();
    let list = fighters
      .filter((f) => f.id !== other?.id)
      .filter((f) => !s || [f.name, f.nameKhmer, f.alias, f.clubName].some((x) => x?.toLowerCase().includes(s)));
    // Similar weight: within ±2 kg of the agreed weight, closest first (a search or "all weights" shows everyone, closest first).
    if (near) {
      if (!s && !allWeights) list = list.filter((f) => gap(f) <= NEAR_KG);
      list = [...list].sort((a, b) => gap(a) - gap(b));
    }
    return list.slice(0, near && !s ? 30 : 8);
  }, [fighters, q, other, near, allWeights]);

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
          {near && !q.trim() && (
            <p className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
              <span>{allWeights ? t("bout.allWeights") : t("bout.nearWeights", { kg: near, n: NEAR_KG })}</span>
              <button type="button" onClick={() => setAllWeights((a) => !a)} className="font-semibold text-primary hover:underline">{allWeights ? t("bout.onlyNear", { n: NEAR_KG }) : t("bout.showAllWeights")}</button>
            </p>
          )}
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
