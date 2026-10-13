/**
 * System Settings › Matching rules: KKF staff switch each matching rule on or off, choose Block or Warn,
 * and set its limit (claude/updates/matching-rules.md). The API refuses everyone else.
 */
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { api } from "../../utils/api";
import { type TextKey, useT } from "../../i18n/program";

interface Rule {
  key: string;
  enabled: boolean;
  action: "block" | "warn";
  value: number | null;
  unit: string | null;
}

const inputClass = "h-10 w-24 rounded-lg border border-slate-300 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none px-3 text-sm bg-white";

export function MatchingRulesPanel({ canEdit }: { canEdit: boolean }) {
  const { t } = useT();
  const [rules, setRules] = useState<Rule[] | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState(false);

  const load = () => api.matchingRules.list().then(setRules).catch(() => setError(true));
  useEffect(() => { load(); }, []);

  const save = async (rule: Rule, changes: { enabled?: boolean; action?: "block" | "warn"; value?: number }) => {
    setBusy(rule.key);
    try {
      const saved: Rule = await api.matchingRules.update(rule.key, changes);
      setRules((list) => list && list.map((r) => (r.key === saved.key ? saved : r)));
      toast.success(t("mr.saved"));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("common.error"));
    } finally {
      setBusy(null);
    }
  };

  if (error) return <p className="text-sm text-red-600">{t("common.error")}</p>;
  if (!rules) return <div className="flex items-center gap-2 text-sm text-slate-500"><Loader2 className="w-4 h-4 animate-spin" aria-hidden /> {t("common.loading")}</div>;

  return (
    <div className="space-y-3">
      <p className="text-sm text-slate-600">{t("mr.hint")}</p>
      {!canEdit && <div className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-3 text-sm text-slate-700">{t("mr.readOnly")}</div>}
      <ul className="space-y-2">
        {rules.map((r) => (
          <li key={r.key} className="rounded-2xl border border-slate-200 bg-white p-4 flex flex-wrap items-center gap-x-6 gap-y-3">
            <div className="min-w-[14rem] flex-1">
              <p className={`font-semibold ${r.enabled ? "text-slate-900" : "text-slate-500"}`}>{t(`mr.name.${r.key}` as TextKey)}</p>
              <p className="text-sm text-slate-500">{t(`mr.desc.${r.key}` as TextKey)}</p>
            </div>
            <label className="inline-flex items-center gap-2 text-sm font-medium text-slate-700">
              <input type="checkbox" className="w-5 h-5" checked={r.enabled} disabled={!canEdit || busy === r.key} onChange={(e) => save(r, { enabled: e.target.checked })} />
              {t("mr.on")}
            </label>
            <label className="inline-flex items-center gap-2 text-sm text-slate-700">
              {t("mr.action")}
              <select className="h-10 rounded-lg border border-slate-300 bg-white px-2 text-sm" value={r.action} disabled={!canEdit || busy === r.key} onChange={(e) => save(r, { action: e.target.value as "block" | "warn" })}>
                <option value="block">{t("mr.block")}</option>
                <option value="warn">{t("mr.warn")}</option>
              </select>
            </label>
            {r.unit && (
              <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                {t("mr.limit")}
                <input
                  type="number"
                  min={0}
                  step="any"
                  className={inputClass}
                  defaultValue={r.value ?? ""}
                  disabled={!canEdit || busy === r.key}
                  onBlur={(e) => { const v = Number(e.target.value); if (e.target.value !== "" && v !== r.value) save(r, { value: v }); }}
                />
                {t(`mr.unit.${r.unit}` as TextKey)}
              </label>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
