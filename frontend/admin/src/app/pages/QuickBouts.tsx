/**
 * Fast bout entry (/home/matches/:batchId/quick-bouts, claude/updates/fast-bout-entry.md): a whole show's bouts on one
 * screen — one row per bout (red, blue or "to be announced", weight, rules preset, bout type, Kun Khmer / MAS Fight).
 * A new row copies the weight and rules of the row above. Each row is checked against the KKF matching rules as it is
 * filled (and against the other rows: a fighter twice), then "Save all" adds every filled row in order. Rows that fail
 * stay on screen with the reason; saved rows leave the list.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import { AlertTriangle, ArrowLeft, CheckCircle2, Loader2, Plus, Search, ShieldAlert, Trash2, X } from "lucide-react";
import { api } from "../utils/api";
import { type TextKey, formatDay, khmerDigits, useT } from "../i18n/program";
import { BOUT_LABELS, FighterAvatar, LangSwitch, RULE_SETS } from "../components/program/shared";
import { type RuleHit, ruleSentence } from "../components/program/ruleSentence";
import { weightOf } from "../components/fighters/fighterUtils";

const cell = "w-full h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none";
const WEIGHTS = [28, 31, 35, 38, 41, 44, 45, 48, 51, 54, 57, 60, 63.5, 65, 67, 70, 71, 73, 75, 77, 80];

interface Row {
  key: number;
  red: any | null;
  blue: any | null;
  blueLater: boolean;
  weight: number;
  ruleId: string;
  label: string;
  ruleSet: string;
  /** The weight was typed by hand (otherwise it follows the red corner's weight). */
  weightSet?: boolean;
  /** undefined = not checked yet, null = couldn't check */
  check?: { blocked: RuleHit[]; warnings: RuleHit[] } | null;
  error?: string;
}

let nextKey = 1;
const emptyRow = (from?: Row): Row => ({
  key: nextKey++, red: null, blue: null, blueLater: false,
  weight: from?.weight ?? 60, ruleId: from?.ruleId ?? "", label: "", ruleSet: from?.ruleSet ?? "kun_khmer",
});

/** A small search box that picks one fighter (Khmer or English name, club). */
function Picker({ value, fighters, exclude, tone, placeholder, onChange, nearKg }: {
  value: any | null; fighters: any[]; exclude: Set<string>; tone: "red" | "blue"; placeholder: string; onChange: (f: any | null) => void;
  /** Agreed weight: an empty search lists fighters within ±2 kg; a search lists everyone, closest weight first. */
  nearKg?: number | null;
}) {
  const { t, lang } = useT();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const name = (f: any) => (lang === "km" && f.nameKhmer ? f.nameKhmer : f.name);
  const gap = (f: any) => { const kg = weightOf(f); return kg === null || !nearKg ? Infinity : Math.abs(kg - nearKg); };
  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s && !nearKg) return [];
    const found = fighters
      .filter((f) => !exclude.has(f.id))
      .filter((f) => (s ? [f.name, f.nameKhmer, f.alias, f.clubName].some((x) => x?.toLowerCase().includes(s)) : gap(f) <= 2));
    return (nearKg ? found.sort((a, b) => gap(a) - gap(b)) : found).slice(0, s ? 8 : 15);
  }, [q, fighters, exclude, nearKg]);
  useEffect(() => {
    const close = (e: MouseEvent) => { if (box.current && !box.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);
  const border = tone === "red" ? "border-l-red-500" : "border-l-blue-500";

  if (value)
    return (
      <div className={`flex items-center gap-2 rounded-xl border border-slate-200 border-l-4 ${border} bg-white px-2 h-11 min-w-0`}>
        <FighterAvatar name={value.name} image={value.image} />
        <span className="min-w-0 flex-1 text-sm leading-tight">
          <span className="block font-semibold text-slate-900 truncate">{name(value)}</span>
          <span className="block text-xs text-slate-500 truncate">{[weightOf(value) ? t("common.kg", { n: weightOf(value) }) : null, value.clubName ?? value.nationality].filter(Boolean).join(" · ")}</span>
        </span>
        <button type="button" onClick={() => onChange(null)} aria-label={t("common.change")} className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-800 inline-flex items-center justify-center shrink-0"><X className="w-4 h-4" aria-hidden /></button>
      </div>
    );
  return (
    <div ref={box} className="relative">
      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" aria-hidden />
      <input value={q} onChange={(e) => { setQ(e.target.value); setOpen(true); }} onFocus={() => setOpen(true)} placeholder={placeholder}
        onKeyDown={(e) => { if (e.key === "Enter" && list[0]) { e.preventDefault(); onChange(list[0]); setQ(""); setOpen(false); } }}
        className={`${cell} pl-9 border-l-4 ${border}`} />
      {open && list.length > 0 && (
        <ul className="absolute z-30 mt-1 w-full min-w-[16rem] max-h-72 overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-lg divide-y divide-slate-100">
          {list.map((f) => (
            <li key={f.id}>
              <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => { onChange(f); setQ(""); setOpen(false); }} className="w-full text-left flex items-center gap-2 p-2 hover:bg-slate-50">
                <FighterAvatar name={f.name} image={f.image} />
                <span className="min-w-0 text-sm">
                  <span className="block font-semibold text-slate-900">{name(f)}</span>
                  <span className="block text-xs text-slate-500">{[weightOf(f) ? t("common.kg", { n: weightOf(f) }) : null, f.clubName ?? f.nationality].filter(Boolean).join(" · ")}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function QuickBouts() {
  const { batchId } = useParams();
  const { t, lang } = useT();
  const navigate = useNavigate();
  const [card, setCard] = useState<any | null | undefined>(undefined);
  const [fighters, setFighters] = useState<any[]>([]);
  const [existing, setExisting] = useState<any[]>([]);
  const [rules, setRules] = useState<any[]>([]);
  const [gloves, setGloves] = useState<any[]>([]);
  const [glove, setGlove] = useState("");
  const [rows, setRows] = useState<Row[]>(() => [emptyRow(), emptyRow(), emptyRow()]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const c = await api.batches.get(batchId!);
        const [fs, bs, rs, gs] = await Promise.all([
          api.fighters.list(),
          api.matches.list(batchId),
          api.settingsLists.list("bout-rules").catch(() => []),
          api.settingsLists.list("glove-brands").catch(() => []),
        ]);
        setCard(c);
        setFighters((fs as any[]).filter((f) => f.status === "Active"));
        setExisting(bs);
        setRules(rs);
        setGloves(gs);
        if (gs[0]) setGlove(`${gs[0].brand}${gs[0].model ? ` ${gs[0].model}` : ""}`);
        if (rs[0]) setRows((list) => list.map((r) => ({ ...r, ruleId: r.ruleId || rs[0].id })));
      } catch {
        setCard(null);
      }
    })();
  }, [batchId]);

  const n = (v: number) => (lang === "km" ? khmerDigits(v) : String(v));
  const filled = rows.filter((r) => r.red || r.blue);
  // Fighters already used: on the card, or in another row (a fighter can't be in two bouts of one card).
  const usedOnCard = useMemo(() => new Set(existing.flatMap((b) => [b.fighter_a_id, b.fighter_b_id]).filter(Boolean)), [existing]);
  const usedInRows = (except: number) => new Set(rows.filter((r) => r.key !== except).flatMap((r) => [r.red?.id, r.blue?.id]).filter(Boolean) as string[]);

  const update = (key: number, patch: Partial<Row>) => setRows((list) => list.map((r) => (r.key === key ? { ...r, ...patch, check: patch.check !== undefined ? patch.check : ("red" in patch || "blue" in patch || "weight" in patch || "blueLater" in patch ? undefined : r.check), error: undefined } : r)));
  const addRow = () => setRows((list) => [...list, emptyRow(list[list.length - 1])]);
  const removeRow = (key: number) => setRows((list) => (list.length > 1 ? list.filter((r) => r.key !== key) : [emptyRow(list[0])]));

  // Live rule check for each filled row (debounced; one request per row that changed).
  const checkKey = rows.map((r) => `${r.key}:${r.red?.id ?? ""}:${r.blueLater ? "tba" : r.blue?.id ?? ""}:${r.weight}`).join("|");
  useEffect(() => {
    if (!card) return;
    const timer = setTimeout(() => {
      for (const r of rows) {
        if (r.check !== undefined || !r.red || (!r.blue && !r.blueLater)) continue;
        api.matches
          .check({ subEventId: card.id, fighterAId: r.red.id, fighterBId: r.blueLater ? null : r.blue.id, agreedWeight: r.weight })
          .then((res) => setRows((list) => list.map((x) => (x.key === r.key ? { ...x, check: { blocked: res.blocked, warnings: res.warnings } } : x))))
          .catch(() => setRows((list) => list.map((x) => (x.key === r.key ? { ...x, check: null } : x))));
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [checkKey, card?.id]);

  const nameOf = (id: string | null | undefined, fallback: string) => {
    const f = id ? fighters.find((x) => x.id === id) : null;
    return f ? (lang === "km" && f.nameKhmer ? f.nameKhmer : f.name) : fallback;
  };
  const rowProblem = (r: Row): string | null => {
    if (!r.red) return t("qb.needRed");
    if (!r.blue && !r.blueLater) return t("qb.needBlue");
    if (!(r.weight >= 20 && r.weight <= 200)) return t("ff.weightRange");
    if (r.check?.blocked?.length) return r.check.blocked.map((h) => ruleSentence(t, lang, h, nameOf)).join(" ");
    return null;
  };

  const saveAll = async () => {
    const todo = rows.filter((r) => r.red || r.blue);
    if (todo.length === 0) return toast.error(t("qb.nothing"));
    const bad = todo.find((r) => rowProblem(r));
    if (bad) { setRows((list) => list.map((r) => (r.key === bad.key ? { ...r, error: rowProblem(r)! } : r))); return toast.error(t("qb.fixRows")); }
    setSaving(true);
    let order = existing.reduce((m, b) => Math.max(m, b.sort_order ?? 0), 0) + 1;
    let saved = 0;
    const left: Row[] = [];
    for (const r of rows) {
      if (!r.red && !r.blue) { left.push(r); continue; }
      const rule = rules.find((x) => x.id === r.ruleId) ?? rules[0];
      try {
        await api.matches.create({
          eventId: card.event_id, subEventId: card.id, fighterAId: r.red.id, fighterBId: r.blueLater ? null : r.blue.id,
          rounds: rule?.rounds ?? 5, roundTime: rule?.round_time ?? 3, knockdownLimit: rule?.knockdown_limit ?? 3,
          agreedWeight: r.weight, gloveSize: rule?.glove_size ?? "8oz", gloveBrand: glove || "—",
          sortOrder: order++, boutLabel: r.label || null, ruleSet: r.ruleSet,
        });
        saved++;
      } catch (e) {
        left.push({ ...r, error: e instanceof Error ? e.message : t("common.error") });
      }
    }
    setSaving(false);
    const kept = left.filter((r) => r.error);
    if (saved) toast.success(t("qb.saved", { n: n(saved) }));
    if (kept.length) {
      toast.error(t("qb.someFailed", { n: n(kept.length) }));
      setRows(left.length ? left : [emptyRow()]);
      setExisting(await api.matches.list(batchId));
    } else {
      navigate(`/home/events/${card.event_id}#card-${card.id}`);
    }
  };

  if (card === undefined) return <div className="p-10 flex justify-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  if (card === null) return <p className="p-8 text-center text-slate-700">{t("bo.loadFailed")}</p>;

  const back = `/home/events/${card.event_id}#card-${card.id}`;
  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-5">
      <div className="flex items-center justify-between gap-3">
        <Link to={back} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-primary"><ArrowLeft className="w-4 h-4" aria-hidden /> {card.event_name ?? t("bout.back")}</Link>
        <LangSwitch />
      </div>
      <header>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">{t("qb.title")}</h1>
        <p className="text-slate-600 mt-1">{t("qb.lead", { card: card.name, date: formatDay(card.date, lang) })}{existing.length ? ` ${t("qb.already", { n: n(existing.length) })}` : ""}</p>
      </header>

      <div className="flex flex-wrap items-end gap-4 rounded-2xl border border-slate-200 bg-white p-4">
        <label className="block min-w-[14rem]"><span className="text-sm font-semibold text-slate-800">{t("qb.gloves")}</span>
          <select value={glove} onChange={(e) => setGlove(e.target.value)} className={`${cell} mt-1`}>
            {gloves.length === 0 && <option value="">—</option>}
            {gloves.map((g) => { const label = `${g.brand}${g.model ? ` ${g.model}` : ""}`; return <option key={g.id} value={label}>{label}</option>; })}
          </select>
        </label>
        <p className="text-sm text-slate-500 flex-1 min-w-[14rem]">{t("qb.hint")}</p>
      </div>

      <ol className="space-y-3">
        {rows.map((r, i) => {
          const taken = new Set<string>([...usedOnCard, ...usedInRows(r.key)]);
          const problem = r.error ?? (r.check?.blocked?.length ? r.check.blocked.map((h) => ruleSentence(t, lang, h, nameOf)).join(" ") : null);
          const warnings = r.check?.warnings ?? [];
          const ready = r.red && (r.blue || r.blueLater);
          return (
            <li key={r.key} className={`rounded-2xl border bg-white p-3 md:p-4 ${problem ? "border-red-300" : "border-slate-200"}`}>
              <div className="grid gap-3 2xl:grid-cols-[minmax(0,3fr)_minmax(0,2.4fr)] 2xl:items-start">
              {/* Corners: number, red, blue */}
              <div className="grid gap-3 grid-cols-[1.75rem_minmax(0,1fr)] sm:grid-cols-[1.75rem_minmax(0,1fr)_minmax(0,1fr)] items-start">
                <span className="text-sm font-bold text-slate-400 pt-3">{n(existing.length + i + 1)}</span>
                <Picker value={r.red} fighters={fighters} exclude={new Set([...taken, ...(r.blue ? [r.blue.id] : [])])} tone="red" nearKg={r.weightSet ? r.weight : null} placeholder={t("qb.red")} onChange={(f) => update(r.key, { red: f, ...(f && !r.weightSet && weightOf(f) ? { weight: weightOf(f)! } : {}), ...(f && !r.label && f.nationality && f.nationality !== "Cambodian" ? { label: "international" } : {}) })} />
                <div className="col-start-2 sm:col-start-auto">
                {r.blueLater ? (
                  <div className="flex items-center justify-between gap-2 rounded-xl border border-dashed border-blue-300 h-11 px-3 text-sm text-slate-600">
                    {t("corner.tba")}
                    <button type="button" onClick={() => update(r.key, { blueLater: false })} className="text-xs font-semibold text-primary">{t("common.change")}</button>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <Picker value={r.blue} fighters={fighters} exclude={new Set([...taken, ...(r.red ? [r.red.id] : [])])} tone="blue" nearKg={r.weight || null} placeholder={t("qb.blue")} onChange={(f) => update(r.key, { blue: f, ...(f && !r.label && f.nationality && f.nationality !== "Cambodian" ? { label: "international" } : {}) })} />
                    {!r.blue && <button type="button" onClick={() => update(r.key, { blueLater: true, blue: null })} className="text-xs font-semibold text-slate-500 hover:text-primary">{t("qb.blueLater")}</button>}
                  </div>
                )}
                </div>
              </div>
              {/* Weight, rules, type, rule set, remove */}
              <div className="grid gap-3 grid-cols-2 sm:grid-cols-[6rem_minmax(0,1fr)_minmax(0,1fr)_8rem_2.5rem] items-center">
                <label className="block"><span className="sr-only">{t("bout.weight")}</span>
                  <input type="number" inputMode="decimal" step="0.5" min={20} max={200} list="qb-weights" value={r.weight || ""} onChange={(e) => update(r.key, { weight: Number(e.target.value), weightSet: true })} className={cell} aria-label={t("bout.weight")} />
                </label>
                <select value={r.ruleId} onChange={(e) => update(r.key, { ruleId: e.target.value })} className={cell} aria-label={t("bout.rules")}>
                  {rules.length === 0 && <option value="">{t("bout.rulesDefault")}</option>}
                  {rules.map((x) => <option key={x.id} value={x.id}>{lang === "km" && x.name_khmer ? x.name_khmer : x.name}</option>)}
                </select>
                <select value={r.label} onChange={(e) => update(r.key, { label: e.target.value })} className={cell} aria-label={t("bout.label")}>
                  <option value="">{t("bout.label")}…</option>
                  {BOUT_LABELS.map((k) => <option key={k} value={k}>{t(`boutLabel.${k}` as TextKey)}</option>)}
                </select>
                <select value={r.ruleSet} onChange={(e) => update(r.key, { ruleSet: e.target.value })} className={cell} aria-label={t("bout.ruleSet")}>
                  {RULE_SETS.map((k) => <option key={k} value={k}>{t(`ruleSet.${k}` as TextKey)}</option>)}
                </select>
                <button type="button" onClick={() => removeRow(r.key)} aria-label={t("common.remove")} className="w-10 h-10 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 inline-flex items-center justify-center justify-self-end"><Trash2 className="w-4 h-4" aria-hidden /></button>
              </div>
              </div>
              {ready && (
                <div className="mt-2 text-sm pl-8">
                  {problem ? (
                    <p role="alert" className="flex items-start gap-1.5 text-red-800"><ShieldAlert className="w-4 h-4 mt-0.5 shrink-0" aria-hidden /> {problem}</p>
                  ) : r.check === undefined ? (
                    <p className="flex items-center gap-1.5 text-slate-500"><Loader2 className="w-4 h-4 animate-spin" aria-hidden /> {t("ch.checking")}</p>
                  ) : r.check === null ? (
                    <p className="text-slate-500">{t("qb.noCheck")}</p>
                  ) : warnings.length ? (
                    <p className="flex items-start gap-1.5 text-amber-800"><AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" aria-hidden /> {warnings.map((h) => ruleSentence(t, lang, h, nameOf)).join(" ")}</p>
                  ) : (
                    <p className="flex items-center gap-1.5 text-emerald-700"><CheckCircle2 className="w-4 h-4" aria-hidden /> {t("qb.ok")}</p>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ol>
      <datalist id="qb-weights">{WEIGHTS.map((w) => <option key={w} value={w} />)}</datalist>

      <div className="flex flex-wrap items-center justify-between gap-3 sticky bottom-0 bg-slate-50/95 backdrop-blur py-3">
        <button type="button" onClick={addRow} className="inline-flex items-center gap-2 h-11 px-4 rounded-xl border border-slate-300 bg-white text-sm font-semibold text-slate-700 hover:border-primary hover:text-primary"><Plus className="w-4 h-4" aria-hidden /> {t("qb.addRow")}</button>
        <div className="flex items-center gap-3">
          <Link to={back} className="h-11 px-5 rounded-xl border border-slate-300 bg-white text-sm font-semibold text-slate-700 inline-flex items-center">{t("common.cancel")}</Link>
          <button type="button" disabled={saving || filled.length === 0} onClick={saveAll} className="h-11 px-6 rounded-xl bg-primary text-white text-sm font-semibold hover:opacity-90 disabled:opacity-40 inline-flex items-center gap-2">
            {saving && <Loader2 className="w-4 h-4 animate-spin" aria-hidden />} {t("qb.saveAll", { n: n(filled.length) })}
          </button>
        </div>
      </div>
    </div>
  );
}
