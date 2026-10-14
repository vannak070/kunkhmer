/**
 * Duplicate fighters list (claude/features/duplicate-fighters-list.md), KKF staff: pairs of fighters who may be the same
 * person, strongest first. Compare the two records side by side, then merge them (the existing Merge dialog, with the
 * record to keep already chosen) or mark them "not the same person" (remembered, and can be brought back).
 */
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router";
import { toast } from "sonner";
import { CopyCheck, ExternalLink, Loader2 } from "lucide-react";
import { api } from "../utils/api";
import { type TextKey, khmerDigits, useT } from "../i18n/program";
import { FighterAvatar } from "../components/program/shared";
import { MergeFighterDialog } from "../components/fighters/MergeFighterDialog";

type Show = "open" | "dismissed";
type Tier = "all" | "very_likely" | "possible";
type Counts = { open: number; veryLikely: number; possible: number; dismissed: number };

const btn = "inline-flex items-center justify-center gap-2 min-h-10 px-4 rounded-xl text-sm font-semibold disabled:opacity-40";

export function Duplicates() {
  const { t, lang } = useT();
  const n = (v: number) => (lang === "km" ? khmerDigits(v) : String(v));
  const [show, setShow] = useState<Show>("open");
  const [tier, setTier] = useState<Tier>("all");
  const [items, setItems] = useState<any[] | null>(null);
  const [counts, setCounts] = useState<Counts>({ open: 0, veryLikely: 0, possible: 0, dismissed: 0 });
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState("");
  // The merge dialog: `remove` is merged into `keep`.
  const [merge, setMerge] = useState<{ remove: any; keep: any } | null>(null);

  const load = useCallback(async (which: Show) => {
    try {
      const data = await api.fighters.duplicates(which);
      setItems(data.items);
      setCounts(data.counts);
      setError(false);
    } catch {
      setItems([]);
      setError(true);
    }
  }, []);

  useEffect(() => {
    setItems(null);
    load(show);
  }, [show, load]);

  const act = async (pair: any, what: "dismiss" | "restore") => {
    setBusy(pair.key);
    try {
      const [a, b] = pair.fighters;
      if (what === "dismiss") await api.fighters.dismissDuplicate(a.id, b.id);
      else await api.fighters.restoreDuplicate(a.id, b.id);
      toast.success(t(what === "dismiss" ? "dups.markedDifferent" : "dups.restored"));
      await load(show);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("common.error"));
    } finally {
      setBusy("");
    }
  };

  const shown = (items ?? []).filter((p) => show === "dismissed" || tier === "all" || p.tier === tier);
  const name = (f: any) => (lang === "km" && f.nameKhmer ? f.nameKhmer : f.name);
  const other = (f: any) => (lang === "km" && f.nameKhmer ? f.name : f.nameKhmer);

  const tab = (key: Show, label: string) => (
    <button
      key={key}
      role="tab"
      type="button"
      aria-selected={show === key}
      onClick={() => setShow(key)}
      className={`flex-1 sm:flex-none h-10 px-4 rounded-lg text-sm font-semibold ${show === key ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"}`}
    >
      {label}
    </button>
  );
  const chip = (key: Tier, label: string) => (
    <button
      key={key}
      type="button"
      aria-pressed={tier === key}
      onClick={() => setTier(key)}
      className={`h-9 px-3 rounded-full border text-sm font-semibold ${tier === key ? "border-primary bg-primary text-white" : "border-slate-300 bg-white text-slate-700 hover:border-primary"}`}
    >
      {label}
    </button>
  );

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 flex items-center gap-2">
          <CopyCheck className="w-6 h-6 text-primary" aria-hidden /> {t("dups.title")}
        </h1>
        <p className="text-sm text-slate-600 mt-1">{t("dups.intro")}</p>
      </header>

      <div role="tablist" className="flex gap-1 rounded-xl bg-slate-100 p-1 w-full sm:w-fit">
        {tab("open", t("dups.tab.open", { n: n(counts.open) }))}
        {tab("dismissed", t("dups.tab.dismissed", { n: n(counts.dismissed) }))}
      </div>

      {show === "open" && (
        <div className="flex flex-wrap gap-2" role="group">
          {chip("all", t("dups.filter.all", { n: n(counts.open) }))}
          {chip("very_likely", t("dups.filter.very_likely", { n: n(counts.veryLikely) }))}
          {chip("possible", t("dups.filter.possible", { n: n(counts.possible) }))}
        </div>
      )}

      {items === null && <div className="flex items-center gap-2 text-sm text-slate-500"><Loader2 className="w-4 h-4 animate-spin" aria-hidden /> {t("common.loading")}</div>}
      {error && <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">{t("dups.loadFailed")}</p>}
      {items && !error && shown.length === 0 && (
        <p className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-600">
          {show === "dismissed" ? t("dups.empty.dismissed") : items.length === 0 ? t("dups.empty.open") : t("dups.empty.filter")}
        </p>
      )}

      <ul className="space-y-4">
        {shown.map((p) => (
          <li key={p.key} className="rounded-2xl border border-slate-200 bg-white p-4 md:p-5 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`rounded-full px-3 py-1 text-xs font-bold ${p.tier === "very_likely" ? "bg-red-50 text-red-800 border border-red-200" : "bg-amber-50 text-amber-900 border border-amber-200"}`}>
                {t(`dups.tier.${p.tier}` as TextKey)}
              </span>
              {p.reasons.map((r: string) => (
                <span key={r} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">{t(`dups.r.${r}` as TextKey)}</span>
              ))}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {p.fighters.map((f: any, i: number) => (
                <div key={f.id} className="rounded-xl border border-slate-200 p-4 flex flex-col gap-3">
                  <div className="flex items-start gap-3">
                    <FighterAvatar name={f.name} image={f.image} />
                    <div className="min-w-0 flex-1">
                      <p className="text-base font-semibold text-slate-900 break-words">{name(f)}</p>
                      {other(f) && <p lang={lang === "km" ? "en" : "km"} className="text-sm text-slate-600 break-words">{other(f)}</p>}
                      <p className="text-xs font-semibold tracking-wide text-primary">{f.kkfId}</p>
                    </div>
                    <Link to={`/home/fighters/${f.id}`} target="_blank" aria-label={`${t("dups.openProfile")} — ${f.name}`} className="shrink-0 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
                      <ExternalLink className="w-4 h-4" aria-hidden /> <span className="hidden sm:inline">{t("dups.openProfile")}</span>
                    </Link>
                  </div>
                  <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-sm text-slate-700">
                    <p className="col-span-2">{f.dateOfBirth ? t("dup.born", { date: f.dateOfBirth }) : t("dups.noBirth")}</p>
                    <p>{f.clubName ?? (f.nationality !== "Cambodian" ? f.nationality : t("f.noClub"))}</p>
                    <p>{t("common.kg", { n: n(f.currentWeight) })}</p>
                    <p>{f.record ?? "—"}</p>
                    <p>{t("dups.bouts", { n: n(f.bouts) })}</p>
                    <p className="col-span-2 text-xs text-slate-500">{t("dups.registered", { date: f.registered ?? "—" })}</p>
                  </div>
                  {show === "open" && (
                    <button
                      type="button"
                      disabled={Boolean(busy)}
                      onClick={() => setMerge({ remove: p.fighters[1 - i], keep: f })}
                      className={`${btn} mt-auto border border-primary text-primary hover:bg-primary/5`}
                    >
                      {t("dups.keepThis")}
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-end">
              <button type="button" disabled={busy === p.key} onClick={() => act(p, show === "open" ? "dismiss" : "restore")} className={`${btn} border border-slate-300 text-slate-700 hover:border-slate-400`}>
                {show === "open" ? t("dups.notSame") : t("dups.restore")}
              </button>
            </div>
          </li>
        ))}
      </ul>

      {merge && (
        <MergeFighterDialog
          fighter={merge.remove}
          initialKeep={merge.keep}
          onClose={() => setMerge(null)}
          onDone={() => { setMerge(null); load(show); }}
        />
      )}
    </div>
  );
}

export default Duplicates;
