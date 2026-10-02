/**
 * System Settings (Phase 5): the shared lists every form uses — weight classes, venues,
 * bout rule presets and glove brands — stored in the database (`/api/settings/<list>`).
 * The Super Admin adds, edits, reorders, deactivates and deletes; KKF Officers can look.
 * Events and bouts copy the value when saved, so edits never change past records.
 */
import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { toast } from "sonner";
import { ArrowDown, ArrowUp, Box, Gavel, Landmark, Loader2, MapPin, Pencil, Plus, Scale, Settings, Trash2 } from "lucide-react";
import { api } from "../utils/api";
import { usePermissions } from "../hooks/usePermissions";
import { GLOVE_SIZES } from "../data/masterData";
import { type SettingsListName, refreshSettingsList } from "../hooks/useSettingsLists";
import { type TextKey, khmerDigits, useT } from "../i18n/program";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../components/ui/dialog";

type Row = Record<string, any>;

interface Field {
  key: string;
  column: string;
  label: TextKey;
  type?: "text" | "number" | "textarea" | "glove";
  required?: boolean;
  placeholder?: TextKey;
}

type T = ReturnType<typeof useT>["t"];

interface ListTab {
  key: SettingsListName;
  /** Dictionary keys: tab name, "Add …" button, "… added" message, explanation. */
  label: TextKey;
  add: TextKey;
  added: TextKey;
  icon: typeof Scale;
  hint: TextKey;
  title: (r: Row) => string;
  detail: (r: Row, t: T) => string;
  fields: Field[];
}

const TABS: ListTab[] = [
  {
    key: "weight-classes",
    label: "set.tab.weight-classes",
    add: "set.add.weight-classes",
    added: "set.added.weight-classes",
    icon: Scale,
    hint: "set.hint.weight-classes",
    title: (r) => r.name,
    detail: (r, t) => [r.name_khmer, r.min_kg != null && r.max_kg != null ? t("set.range", { min: r.min_kg, max: r.max_kg }) : r.max_kg != null ? t("set.upTo", { n: r.max_kg }) : t("set.from", { n: r.min_kg ?? "" })].filter(Boolean).join(" · "),
    fields: [
      { key: "name", column: "name", label: "set.f.nameEn", required: true, placeholder: "set.ph.className" },
      { key: "nameKhmer", column: "name_khmer", label: "set.f.nameKm" },
      { key: "minKg", column: "min_kg", label: "set.f.minKg", type: "number", placeholder: "set.ph.under" },
      { key: "maxKg", column: "max_kg", label: "set.f.maxKg", type: "number", placeholder: "set.ph.over" },
    ],
  },
  {
    key: "venues",
    label: "set.tab.venues",
    add: "set.add.venues",
    added: "set.added.venues",
    icon: MapPin,
    hint: "set.hint.venues",
    title: (r) => r.name,
    detail: (r) => [r.name_khmer, r.region, r.region_khmer, r.description].filter(Boolean).join(" · "),
    fields: [
      { key: "name", column: "name", label: "set.f.nameEn", required: true },
      { key: "nameKhmer", column: "name_khmer", label: "set.f.nameKm" },
      { key: "region", column: "region", label: "set.f.region", placeholder: "set.ph.region" },
      { key: "regionKhmer", column: "region_khmer", label: "set.f.regionKm" },
      { key: "description", column: "description", label: "set.f.notes", type: "textarea" },
      { key: "latitude", column: "latitude", label: "set.f.latitude", type: "number", placeholder: "set.ph.lat" },
      { key: "longitude", column: "longitude", label: "set.f.longitude", type: "number", placeholder: "set.ph.lng" },
    ],
  },
  {
    key: "bout-rules",
    label: "set.tab.bout-rules",
    add: "set.add.bout-rules",
    added: "set.added.bout-rules",
    icon: Gavel,
    hint: "set.hint.bout-rules",
    title: (r) => r.name,
    detail: (r, t) => [r.name_khmer, t("set.roundsBy", { rounds: r.rounds, time: r.round_time }), t("set.knockdowns", { n: r.knockdown_limit }), r.glove_size].filter(Boolean).join(" · "),
    fields: [
      { key: "name", column: "name", label: "set.f.nameEn", required: true, placeholder: "set.ph.rule" },
      { key: "nameKhmer", column: "name_khmer", label: "set.f.nameKm" },
      { key: "rounds", column: "rounds", label: "set.f.rounds", type: "number", required: true },
      { key: "roundTime", column: "round_time", label: "set.f.roundTime", type: "number", required: true },
      { key: "knockdownLimit", column: "knockdown_limit", label: "set.f.knockdownLimit", type: "number", required: true },
      { key: "gloveSize", column: "glove_size", label: "set.f.gloveSize", type: "glove" },
    ],
  },
  {
    key: "glove-brands",
    label: "set.tab.glove-brands",
    add: "set.add.glove-brands",
    added: "set.added.glove-brands",
    icon: Box,
    hint: "set.hint.glove-brands",
    title: (r) => [r.brand, r.model].filter(Boolean).join(" "),
    detail: () => "",
    fields: [
      { key: "brand", column: "brand", label: "set.f.brand", required: true },
      { key: "model", column: "model", label: "set.f.model" },
    ],
  },
  {
    key: "associations",
    label: "set.tab.associations",
    add: "set.add.associations",
    added: "set.added.associations",
    icon: Landmark,
    hint: "set.hint.associations",
    title: (r) => r.name,
    detail: (r) => r.name_khmer ?? "",
    fields: [
      { key: "name", column: "name", label: "set.f.nameEn", required: true, placeholder: "set.ph.associationEn" },
      { key: "nameKhmer", column: "name_khmer", label: "set.f.nameKm", placeholder: "set.ph.association" },
    ],
  },
];

const inputClass = "w-full h-11 rounded-xl border border-slate-300 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none px-3 text-sm bg-white";

export function SystemSettings() {
  const { t, lang } = useT();
  const permissions = usePermissions();
  const canManage = permissions.hasPermission("settings.manage");
  const [params, setParams] = useSearchParams();
  const tab = TABS.find((x) => x.key === params.get("tab")) ?? TABS[0];
  const [rows, setRows] = useState<Row[] | null>(null);
  const [editing, setEditing] = useState<Row | "new" | null>(null);
  const [deleting, setDeleting] = useState<Row | null>(null);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    try {
      setRows(await api.settingsLists.list(tab.key, true));
    } catch (e) {
      setRows([]);
      toast.error(e instanceof Error ? e.message : t("set.loadError"));
    }
  };

  useEffect(() => {
    setRows(null);
    load();
  }, [tab.key]);

  // After any change: this page and every form using the list.
  const changed = async () => {
    await load();
    refreshSettingsList(tab.key);
  };

  const run = async (action: () => Promise<unknown>, done: string) => {
    setBusy(true);
    try {
      await action();
      toast.success(done);
      await changed();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("set.saveError"));
    } finally {
      setBusy(false);
    }
  };

  /** Move an entry up or down; renumbers the list so the order is explicit. */
  const move = (index: number, delta: -1 | 1) => {
    if (!rows) return;
    const next = [...rows];
    const [item] = next.splice(index, 1);
    next.splice(index + delta, 0, item);
    const updates = next.map((r, i) => ({ r, i })).filter(({ r, i }) => r.sort_order !== i);
    run(() => Promise.all(updates.map(({ r, i }) => api.settingsLists.update(tab.key, r.id, { sortOrder: i }))), t("set.orderSaved"));
  };

  const activeCount = useMemo(() => (rows ?? []).filter((r) => r.active).length, [rows]);

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground flex items-center gap-2">
            <Settings className="w-6 h-6 text-primary" aria-hidden /> {t("menu.settings")}
          </h1>
          <p className="text-sm text-muted-foreground mt-1 font-medium">
            {t("set.intro")}
          </p>
        </div>
        {canManage && (
          <button type="button" onClick={() => setEditing("new")} className="btn-primary py-2.5 px-5 whitespace-nowrap shrink-0">
            <Plus className="w-4 h-4" aria-hidden /> {t(tab.add)}
          </button>
        )}
      </header>

      {!canManage && (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-3 text-sm text-slate-700">
          {t("set.readOnly")}
        </div>
      )}

      <div role="tablist" aria-label={t("set.lists")} className="flex gap-1 rounded-xl bg-slate-100 p-1 overflow-x-auto no-scrollbar">
        {TABS.map((x) => {
          const Icon = x.icon;
          return (
            <button
              key={x.key}
              role="tab"
              type="button"
              aria-selected={tab.key === x.key}
              onClick={() => setParams(x.key === TABS[0].key ? {} : { tab: x.key }, { replace: true })}
              className={`flex-1 inline-flex items-center justify-center gap-1.5 h-9 px-3 whitespace-nowrap rounded-lg text-sm font-semibold transition-colors ${tab.key === x.key ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"}`}
            >
              <Icon className="w-4 h-4" aria-hidden /> {t(x.label)}
            </button>
          );
        })}
      </div>

      <p className="text-sm text-slate-600">{t(tab.hint)}</p>

      {!rows && <div className="flex items-center gap-2 text-sm text-slate-500"><Loader2 className="w-4 h-4 animate-spin" aria-hidden /> {t("common.loading")}</div>}
      {rows && rows.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">{t("set.empty")}</div>
      )}
      {rows && rows.length > 0 && (
        <>
          <p className={`text-xs font-semibold text-slate-400 ${lang === "km" ? "" : "uppercase tracking-wider"}`}>{rows.length > activeCount ? t("set.inUseAnd", { n: activeCount, off: rows.length - activeCount }) : t("set.inUse", { n: activeCount })}</p>
          <ol className="rounded-2xl border border-slate-200 bg-white divide-y divide-slate-100">
            {rows.map((r, i) => (
              <li key={r.id} className={`flex flex-wrap items-center gap-3 px-4 py-3 ${r.active ? "" : "bg-slate-50"}`}>
                <span className="w-6 text-right text-xs font-semibold text-slate-400">{lang === "km" ? khmerDigits(i + 1) : i + 1}</span>
                <div className="min-w-0 flex-1">
                  <p className={`font-semibold truncate ${r.active ? "text-slate-900" : "text-slate-500"}`}>{tab.title(r)}</p>
                  {tab.detail(r, t) && <p className="text-sm text-slate-500 truncate">{tab.detail(r, t)}</p>}
                </div>
                {!r.active && <span className="text-[11px] font-semibold rounded-lg border border-slate-200 bg-white px-2 py-0.5 text-slate-500">{t("set.deactivated")}</span>}
                {canManage && (
                  <div className="flex items-center gap-1">
                    <button type="button" disabled={busy || i === 0} onClick={() => move(i, -1)} aria-label={t("set.moveUp", { name: tab.title(r) })} className="w-9 h-9 rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-30 flex items-center justify-center"><ArrowUp className="w-4 h-4" /></button>
                    <button type="button" disabled={busy || i === rows.length - 1} onClick={() => move(i, 1)} aria-label={t("set.moveDown", { name: tab.title(r) })} className="w-9 h-9 rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-30 flex items-center justify-center"><ArrowDown className="w-4 h-4" /></button>
                    <button type="button" onClick={() => setEditing(r)} aria-label={t("set.editName", { name: tab.title(r) })} className="w-9 h-9 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-primary flex items-center justify-center"><Pencil className="w-4 h-4" /></button>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => run(() => api.settingsLists.update(tab.key, r.id, { active: !r.active }), t(r.active ? "set.nowInactive" : "set.activeAgain", { name: tab.title(r) }))}
                      className="h-9 px-3 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-100"
                    >
                      {t(r.active ? "set.deactivate" : "set.activate")}
                    </button>
                    <button type="button" onClick={() => setDeleting(r)} aria-label={t("set.deleteName", { name: tab.title(r) })} className="w-9 h-9 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 flex items-center justify-center"><Trash2 className="w-4 h-4" /></button>
                  </div>
                )}
              </li>
            ))}
          </ol>
        </>
      )}

      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="font-semibold text-slate-900 mb-2">{t("set.other")}</h2>
        <ul className="text-sm text-slate-600 space-y-1">
          <li><Link to="/home/strategic-partners/sponsors" className="text-primary font-semibold hover:underline">{t("set.other.partners")}</Link>{t("set.other.partnersText")}</li>
          <li><Link to="/home/officials" className="text-primary font-semibold hover:underline">{t("menu.officials")}</Link>{t("set.other.officialsText")}</li>
          {permissions.hasPermission("users.view") && (
            <li><Link to="/home/user-management" className="text-primary font-semibold hover:underline">{t("menu.users")}</Link>{t("set.other.usersText")}</li>
          )}
        </ul>
      </section>

      {editing && (
        <EntryDialog
          tab={tab}
          row={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={async () => { setEditing(null); await changed(); }}
        />
      )}

      <Dialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>{t("set.deleteTitle", { name: deleting ? tab.title(deleting) : "" })}</DialogTitle>
            <DialogDescription>
              {t("set.deleteText")}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-2">
            <button type="button" onClick={() => setDeleting(null)} className="h-11 px-5 rounded-xl border border-slate-300 text-sm font-medium text-slate-700 hover:bg-slate-50">{t("common.cancel")}</button>
            <button
              type="button"
              disabled={busy}
              onClick={() => { const r = deleting!; setDeleting(null); run(() => api.settingsLists.delete(tab.key, r.id), t("set.deleted", { name: tab.title(r) })); }}
              className="h-11 px-5 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white text-sm font-semibold"
            >
              {t("set.delete")}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function EntryDialog({ tab, row, onClose, onSaved }: { tab: ListTab; row: Row | null; onClose: () => void; onSaved: () => void }) {
  const { t, lang } = useT();
  const [values, setValues] = useState<Record<string, string>>(
    Object.fromEntries(tab.fields.map((f) => [f.key, row?.[f.column] == null ? "" : String(row[f.column])])),
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const missing = tab.fields.find((f) => f.required && !values[f.key].trim());
    if (missing) return setError(t("set.enter", { label: lang === "km" ? t(missing.label) : t(missing.label).toLowerCase() }));
    const body = Object.fromEntries(
      tab.fields.map((f) => {
        const v = values[f.key].trim();
        return [f.key, v === "" ? null : f.type === "number" ? Number(v) : v];
      }),
    );
    setBusy(true);
    setError(null);
    try {
      if (row) await api.settingsLists.update(tab.key, row.id, body);
      else await api.settingsLists.create(tab.key, body);
      toast.success(row ? t("set.savedShort") : t(tab.added));
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("set.saveError"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-lg rounded-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{row ? t("set.editName", { name: tab.title(row) }) : t(tab.add)}</DialogTitle>
          <DialogDescription>{t(tab.hint)}</DialogDescription>
        </DialogHeader>
        <form onSubmit={save} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-3">
            {tab.fields.map((f) => (
              <div key={f.key} className={f.type === "textarea" || f.key === "name" || f.key === "brand" ? "sm:col-span-2" : ""}>
                <label htmlFor={`f-${f.key}`} className="block text-sm font-medium text-slate-700 mb-1">
                  {t(f.label)}{f.required ? "" : <span className="text-slate-400 font-normal">{t("set.optional")}</span>}
                </label>
                {f.type === "textarea" ? (
                  <textarea id={`f-${f.key}`} rows={3} value={values[f.key]} onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))} placeholder={f.placeholder ? t(f.placeholder) : undefined} className="w-full rounded-xl border border-slate-300 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none p-3 text-sm" />
                ) : f.type === "glove" ? (
                  <select id={`f-${f.key}`} value={values[f.key]} onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))} className={inputClass}>
                    <option value="">{t("set.dontSet")}</option>
                    {GLOVE_SIZES.map((g) => <option key={g.id} value={g.size}>{g.size} — {g.weightRange}</option>)}
                  </select>
                ) : (
                  <input
                    id={`f-${f.key}`}
                    type={f.type === "number" ? "number" : "text"}
                    step="any"
                    inputMode={f.type === "number" ? "decimal" : undefined}
                    value={values[f.key]}
                    onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
                    placeholder={f.placeholder ? t(f.placeholder) : undefined}
                    className={inputClass}
                  />
                )}
              </div>
            ))}
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <DialogFooter className="gap-2 sm:gap-2">
            <button type="button" onClick={onClose} className="h-11 px-5 rounded-xl border border-slate-300 text-sm font-medium text-slate-700 hover:bg-slate-50">{t("common.cancel")}</button>
            <button type="submit" disabled={busy} className="h-11 px-5 rounded-xl bg-primary hover:bg-[#083073] disabled:opacity-60 text-white text-sm font-semibold">{row ? t("common.save") : t("set.add")}</button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
