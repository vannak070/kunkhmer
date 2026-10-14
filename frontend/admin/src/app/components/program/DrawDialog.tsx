/**
 * Tournament draw on a fight card (claude/updates/empty-corners-draws.md): pick 4 or 8 fighters in the order of the
 * draw (the lots are drawn offline; "Shuffle" helps when KKF draws on the spot), the agreed weight, the rules and the
 * last bout's label. The qualifiers are created at once; later rounds wait for the winners ("winner of bout N").
 */
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Search, Shuffle, X } from "lucide-react";
import { api } from "../../utils/api";
import { type TextKey, khmerDigits, useT } from "../../i18n/program";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { fieldCls } from "./FightNightFields";
import { FighterAvatar, RULE_SETS } from "./shared";
import { weightOf } from "../fighters/fighterUtils";

const btn = "inline-flex items-center justify-center gap-2 h-11 px-5 rounded-xl text-sm font-semibold disabled:opacity-40";

export function DrawDialog({ card, onClose, onDone }: { card: any; onClose: () => void; onDone: () => void }) {
  const { t, lang } = useT();
  const [size, setSize] = useState<4 | 8>(4);
  const [picked, setPicked] = useState<any[]>([]);
  const [fighters, setFighters] = useState<any[]>([]);
  const [rules, setRules] = useState<any[]>([]);
  const [gloves, setGloves] = useState<any[]>([]);
  const [ruleId, setRuleId] = useState("");
  const [glove, setGlove] = useState("");
  const [weight, setWeight] = useState(60);
  const [ruleSet, setRuleSet] = useState("kun_khmer");
  const [finalLabel, setFinalLabel] = useState<"final" | "prize">("final");
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.fighters.list().then((f: any[]) => setFighters((f || []).filter((x) => x.status === "Active"))).catch(() => {});
    api.settingsLists.list("bout-rules").then((r: any[]) => { setRules(r || []); if (r?.[0]) setRuleId(r[0].id); }).catch(() => {});
    api.settingsLists.list("glove-brands").then((g: any[]) => { setGloves(g || []); if (g?.[0]) setGlove(`${g[0].brand}${g[0].model ? ` ${g[0].model}` : ""}`); }).catch(() => {});
  }, []);

  const name = (f: any) => (lang === "km" && f.nameKhmer ? f.nameKhmer : f.name);
  const num = (n: number) => (lang === "km" ? khmerDigits(n) : String(n));
  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    const taken = new Set(picked.map((p) => p.id));
    return fighters.filter((f) => !taken.has(f.id)).filter((f) => !s || [f.name, f.nameKhmer, f.clubName].some((x) => x?.toLowerCase().includes(s))).slice(0, 8);
  }, [fighters, picked, q]);
  const rule = rules.find((r) => r.id === ruleId);

  const shuffle = () => setPicked((p) => { const a = [...p]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; });
  const save = async () => {
    if (picked.length !== size) return toast.error(t("draw.needAll", { n: num(size) }));
    setBusy(true);
    try {
      const res = await api.matches.draw(card.id, {
        fighterIds: picked.map((p) => p.id),
        agreedWeight: weight,
        rounds: rule?.rounds ?? 3,
        roundTime: rule?.round_time ?? 3,
        knockdownLimit: rule?.knockdown_limit ?? 3,
        gloveSize: rule?.glove_size ?? "10oz",
        gloveBrand: glove || "—",
        ruleSet,
        finalLabel,
      });
      toast.success(t("draw.created", { n: num(res.bouts.length) }));
      onDone();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("common.error"));
      setBusy(false);
    }
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-2xl rounded-2xl max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("draw.title")}</DialogTitle>
          <DialogDescription>{t("draw.text")}</DialogDescription>
        </DialogHeader>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold text-slate-800">{t("draw.size")}</span>
          {([4, 8] as const).map((n) => (
            <button key={n} type="button" aria-pressed={size === n} onClick={() => { setSize(n); setPicked((p) => p.slice(0, n)); }} className={`h-10 px-4 rounded-xl border-2 text-sm font-semibold ${size === n ? "border-primary bg-primary/10 text-primary" : "border-slate-200 text-slate-700"}`}>{num(n)}</button>
          ))}
          <button type="button" onClick={shuffle} disabled={picked.length < 2} className="ml-auto inline-flex items-center gap-2 h-10 px-4 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 disabled:opacity-40"><Shuffle className="w-4 h-4" aria-hidden /> {t("draw.shuffle")}</button>
        </div>

        <ol className="grid sm:grid-cols-2 gap-2">
          {Array.from({ length: size }, (_, i) => {
            const f = picked[i];
            return (
              <li key={i} className={`flex items-center gap-2 rounded-xl border p-2 ${i % 2 === 0 ? "border-red-200 bg-red-50/40" : "border-blue-200 bg-blue-50/40"}`}>
                <span className="w-6 text-center text-sm font-bold text-slate-500">{num(i + 1)}</span>
                {f ? (
                  <>
                    <FighterAvatar name={f.name} image={f.image} />
                    <span className="min-w-0 flex-1 text-sm font-semibold text-slate-900 break-words">{name(f)}<span className="block text-xs font-normal text-slate-600">{[weightOf(f) ? t("common.kg", { n: weightOf(f) }) : null, f.clubName].filter(Boolean).join(" · ")}</span></span>
                    <button type="button" onClick={() => setPicked((p) => p.filter((x) => x.id !== f.id))} aria-label={t("common.remove")} className="w-8 h-8 rounded-lg text-slate-500 hover:bg-white inline-flex items-center justify-center"><X className="w-4 h-4" aria-hidden /></button>
                  </>
                ) : (
                  <span className="text-sm text-slate-500">{t("draw.fighter", { n: num(i + 1) })}</span>
                )}
              </li>
            );
          })}
        </ol>

        {picked.length < size && (
          <div className="space-y-2">
            <label className="relative block">
              <span className="sr-only">{t("draw.pick")}</span>
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" aria-hidden />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("draw.pick")} className={`${fieldCls} pl-9`} />
            </label>
            <ul className="max-h-56 overflow-y-auto rounded-xl border border-slate-200 divide-y divide-slate-100">
              {list.length === 0 && <li className="p-3 text-sm text-slate-500">{t("bout.noFighter")}</li>}
              {list.map((f) => (
                <li key={f.id}>
                  <button type="button" onClick={() => { setPicked((p) => [...p, f]); setQ(""); }} className="w-full text-left flex items-center gap-3 p-2.5 hover:bg-slate-50">
                    <FighterAvatar name={f.name} image={f.image} />
                    <span className="min-w-0 text-sm"><span className="block font-semibold text-slate-900">{name(f)}</span><span className="block text-xs text-slate-600">{[weightOf(f) ? t("common.kg", { n: weightOf(f) }) : null, f.clubName].filter(Boolean).join(" · ")}</span></span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="grid sm:grid-cols-2 gap-4">
          <label className="block"><span className="text-sm font-semibold text-slate-800">{t("bout.weight")}</span>
            <input type="number" inputMode="decimal" step="0.5" min={20} max={200} className={`${fieldCls} mt-1`} value={weight || ""} onChange={(e) => setWeight(Number(e.target.value))} />
          </label>
          <label className="block"><span className="text-sm font-semibold text-slate-800">{t("bout.rules")}</span>
            <select className={`${fieldCls} mt-1`} value={ruleId} onChange={(e) => setRuleId(e.target.value)}>
              {rules.length === 0 && <option value="">{t("bout.rulesDefault")}</option>}
              {rules.map((r) => <option key={r.id} value={r.id}>{lang === "km" && r.name_khmer ? r.name_khmer : r.name}</option>)}
            </select>
          </label>
          <label className="block"><span className="text-sm font-semibold text-slate-800">{t("bout.gloves")}</span>
            <select className={`${fieldCls} mt-1`} value={glove} onChange={(e) => setGlove(e.target.value)}>
              {gloves.length === 0 && <option value="">—</option>}
              {gloves.map((g) => { const label = `${g.brand}${g.model ? ` ${g.model}` : ""}`; return <option key={g.id} value={label}>{label}</option>; })}
            </select>
          </label>
          <label className="block"><span className="text-sm font-semibold text-slate-800">{t("bout.ruleSet")}</span>
            <select className={`${fieldCls} mt-1`} value={ruleSet} onChange={(e) => setRuleSet(e.target.value)}>
              {RULE_SETS.map((k) => <option key={k} value={k}>{t(`ruleSet.${k}` as TextKey)}</option>)}
            </select>
          </label>
          <label className="block sm:col-span-2"><span className="text-sm font-semibold text-slate-800">{t("draw.finalLabel")}</span>
            <select className={`${fieldCls} mt-1`} value={finalLabel} onChange={(e) => setFinalLabel(e.target.value as "final" | "prize")}>
              <option value="final">{t("boutLabel.final")}</option>
              <option value="prize">{t("boutLabel.prize")}</option>
            </select>
          </label>
        </div>

        <DialogFooter className="gap-2">
          <button type="button" onClick={onClose} className={`${btn} border border-slate-300 bg-white text-slate-700`}>{t("common.cancel")}</button>
          <button type="button" disabled={busy || picked.length !== size} onClick={save} className={`${btn} bg-primary text-white hover:opacity-90`}>{busy ? t("common.saving") : t("draw.create")}</button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
