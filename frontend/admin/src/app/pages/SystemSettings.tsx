/**
 * System Settings (Phase 5): the shared lists every form uses — weight classes, venues,
 * bout rule presets and glove brands — stored in the database (`/api/settings/<list>`).
 * The Super Admin adds, edits, reorders, deactivates and deletes; KKF Officers can look.
 * Events and bouts copy the value when saved, so edits never change past records.
 */
import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { toast } from "sonner";
import { ArrowDown, ArrowUp, Box, Gavel, Loader2, MapPin, Pencil, Plus, Scale, Settings, Trash2 } from "lucide-react";
import { api } from "../utils/api";
import { usePermissions } from "../hooks/usePermissions";
import { GLOVE_SIZES } from "../data/masterData";
import { type SettingsListName, refreshSettingsList } from "../hooks/useSettingsLists";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../components/ui/dialog";

type Row = Record<string, any>;

interface Field {
  key: string;
  column: string;
  label: string;
  type?: "text" | "number" | "textarea" | "glove";
  required?: boolean;
  placeholder?: string;
}

interface ListTab {
  key: SettingsListName;
  label: string;
  singular: string;
  icon: typeof Scale;
  hint: string;
  title: (r: Row) => string;
  detail: (r: Row) => string;
  fields: Field[];
}

const kg = (n: number | null) => (n == null ? null : `${n} kg`);

const TABS: ListTab[] = [
  {
    key: "weight-classes",
    label: "Weight classes",
    singular: "weight class",
    icon: Scale,
    hint: "A fighter belongs to the class with the lowest maximum at or above their weight. Used for fighter lists, tournaments and the fan site's rankings.",
    title: (r) => r.name,
    detail: (r) => [r.name_khmer, r.min_kg != null && r.max_kg != null ? `${r.min_kg}–${r.max_kg} kg` : r.max_kg != null ? `up to ${kg(r.max_kg)}` : `from ${kg(r.min_kg)}`].filter(Boolean).join(" · "),
    fields: [
      { key: "name", column: "name", label: "Name (English)", required: true, placeholder: "e.g. 59 kg - 61 kg" },
      { key: "nameKhmer", column: "name_khmer", label: "Name (Khmer)" },
      { key: "minKg", column: "min_kg", label: "Minimum kg", type: "number", placeholder: "Leave empty for “Under …”" },
      { key: "maxKg", column: "max_kg", label: "Maximum kg", type: "number", placeholder: "Leave empty for “Over …”" },
    ],
  },
  {
    key: "venues",
    label: "Venues",
    singular: "venue",
    icon: MapPin,
    hint: "Offered when creating an event or fight card (a different place can still be typed). Coordinates place the venue on the maps.",
    title: (r) => r.name,
    detail: (r) => [r.region, r.description].filter(Boolean).join(" · "),
    fields: [
      { key: "name", column: "name", label: "Name", required: true },
      { key: "region", column: "region", label: "Region", placeholder: "e.g. Phnom Penh" },
      { key: "description", column: "description", label: "Notes", type: "textarea" },
      { key: "latitude", column: "latitude", label: "Latitude", type: "number", placeholder: "e.g. 11.5564" },
      { key: "longitude", column: "longitude", label: "Longitude", type: "number", placeholder: "e.g. 104.9282" },
    ],
  },
  {
    key: "bout-rules",
    label: "Bout rules",
    singular: "rule preset",
    icon: Gavel,
    hint: "Presets for “Create match”: choosing one fills rounds, round time, knockdown limit and glove size.",
    title: (r) => r.name,
    detail: (r) => [r.name_khmer, `${r.rounds} × ${r.round_time} min`, `${r.knockdown_limit} knockdowns`, r.glove_size].filter(Boolean).join(" · "),
    fields: [
      { key: "name", column: "name", label: "Name (English)", required: true, placeholder: "e.g. Standard (5 rounds × 3 min)" },
      { key: "nameKhmer", column: "name_khmer", label: "Name (Khmer)" },
      { key: "rounds", column: "rounds", label: "Rounds", type: "number", required: true },
      { key: "roundTime", column: "round_time", label: "Round time (minutes)", type: "number", required: true },
      { key: "knockdownLimit", column: "knockdown_limit", label: "Knockdown limit", type: "number", required: true },
      { key: "gloveSize", column: "glove_size", label: "Glove size", type: "glove" },
    ],
  },
  {
    key: "glove-brands",
    label: "Glove brands",
    singular: "glove brand",
    icon: Box,
    hint: "KKF-approved gloves offered when creating a match.",
    title: (r) => [r.brand, r.model].filter(Boolean).join(" "),
    detail: () => "",
    fields: [
      { key: "brand", column: "brand", label: "Brand", required: true },
      { key: "model", column: "model", label: "Model" },
    ],
  },
];

const inputClass = "w-full h-11 rounded-xl border border-slate-300 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none px-3 text-sm bg-white";

export function SystemSettings() {
  const permissions = usePermissions();
  const canManage = permissions.hasPermission("settings.manage");
  const [params, setParams] = useSearchParams();
  const tab = TABS.find((t) => t.key === params.get("tab")) ?? TABS[0];
  const [rows, setRows] = useState<Row[] | null>(null);
  const [editing, setEditing] = useState<Row | "new" | null>(null);
  const [deleting, setDeleting] = useState<Row | null>(null);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    try {
      setRows(await api.settingsLists.list(tab.key, true));
    } catch (e) {
      setRows([]);
      toast.error(e instanceof Error ? e.message : "Could not load this list.");
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
      toast.error(e instanceof Error ? e.message : "Could not save.");
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
    run(() => Promise.all(updates.map(({ r, i }) => api.settingsLists.update(tab.key, r.id, { sortOrder: i }))), "Order saved");
  };

  const activeCount = useMemo(() => (rows ?? []).filter((r) => r.active).length, [rows]);

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground flex items-center gap-2">
            <Settings className="w-6 h-6 text-primary" aria-hidden /> System Settings
          </h1>
          <p className="text-sm text-muted-foreground mt-1 font-medium">
            Lists every form uses. Changes apply to everyone straight away; events and bouts already saved keep their values.
          </p>
        </div>
        {canManage && (
          <button type="button" onClick={() => setEditing("new")} className="btn-primary py-2.5 px-5 whitespace-nowrap shrink-0">
            <Plus className="w-4 h-4" aria-hidden /> Add {tab.singular}
          </button>
        )}
      </header>

      {!canManage && (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-3 text-sm text-slate-700">
          You can view these lists. Only the Super Admin can change them.
        </div>
      )}

      <div role="tablist" aria-label="Lists" className="flex gap-1 rounded-xl bg-slate-100 p-1 overflow-x-auto no-scrollbar">
        {TABS.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              role="tab"
              type="button"
              aria-selected={tab.key === t.key}
              onClick={() => setParams(t.key === TABS[0].key ? {} : { tab: t.key }, { replace: true })}
              className={`flex-1 inline-flex items-center justify-center gap-1.5 h-9 px-3 whitespace-nowrap rounded-lg text-sm font-semibold transition-colors ${tab.key === t.key ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"}`}
            >
              <Icon className="w-4 h-4" aria-hidden /> {t.label}
            </button>
          );
        })}
      </div>

      <p className="text-sm text-slate-600">{tab.hint}</p>

      {!rows && <div className="flex items-center gap-2 text-sm text-slate-500"><Loader2 className="w-4 h-4 animate-spin" aria-hidden /> Loading…</div>}
      {rows && rows.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">Nothing in this list yet.</div>
      )}
      {rows && rows.length > 0 && (
        <>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{activeCount} in use{rows.length > activeCount ? ` · ${rows.length - activeCount} deactivated` : ""}</p>
          <ol className="rounded-2xl border border-slate-200 bg-white divide-y divide-slate-100">
            {rows.map((r, i) => (
              <li key={r.id} className={`flex flex-wrap items-center gap-3 px-4 py-3 ${r.active ? "" : "bg-slate-50"}`}>
                <span className="w-6 text-right text-xs font-semibold text-slate-400">{i + 1}</span>
                <div className="min-w-0 flex-1">
                  <p className={`font-semibold truncate ${r.active ? "text-slate-900" : "text-slate-500"}`}>{tab.title(r)}</p>
                  {tab.detail(r) && <p className="text-sm text-slate-500 truncate">{tab.detail(r)}</p>}
                </div>
                {!r.active && <span className="text-[11px] font-semibold rounded-lg border border-slate-200 bg-white px-2 py-0.5 text-slate-500">Deactivated</span>}
                {canManage && (
                  <div className="flex items-center gap-1">
                    <button type="button" disabled={busy || i === 0} onClick={() => move(i, -1)} aria-label={`Move ${tab.title(r)} up`} className="w-9 h-9 rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-30 flex items-center justify-center"><ArrowUp className="w-4 h-4" /></button>
                    <button type="button" disabled={busy || i === rows.length - 1} onClick={() => move(i, 1)} aria-label={`Move ${tab.title(r)} down`} className="w-9 h-9 rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-30 flex items-center justify-center"><ArrowDown className="w-4 h-4" /></button>
                    <button type="button" onClick={() => setEditing(r)} aria-label={`Edit ${tab.title(r)}`} className="w-9 h-9 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-primary flex items-center justify-center"><Pencil className="w-4 h-4" /></button>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => run(() => api.settingsLists.update(tab.key, r.id, { active: !r.active }), r.active ? `${tab.title(r)} deactivated — no longer offered in forms` : `${tab.title(r)} is offered again`)}
                      className="h-9 px-3 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-100"
                    >
                      {r.active ? "Deactivate" : "Activate"}
                    </button>
                    <button type="button" onClick={() => setDeleting(r)} aria-label={`Delete ${tab.title(r)}`} className="w-9 h-9 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 flex items-center justify-center"><Trash2 className="w-4 h-4" /></button>
                  </div>
                )}
              </li>
            ))}
          </ol>
        </>
      )}

      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="font-semibold text-slate-900 mb-2">Managed on other pages</h2>
        <ul className="text-sm text-slate-600 space-y-1">
          <li><Link to="/home/strategic-partners/sponsors" className="text-primary font-semibold hover:underline">Partners</Link> — sponsors and broadcasters</li>
          <li><Link to="/home/officials" className="text-primary font-semibold hover:underline">Officials</Link> — referees and judges</li>
          {permissions.hasPermission("users.view") && (
            <li><Link to="/home/user-management" className="text-primary font-semibold hover:underline">Users</Link> — staff, organizer and club accounts</li>
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
            <DialogTitle>Delete {deleting ? tab.title(deleting) : ""}?</DialogTitle>
            <DialogDescription>
              It disappears from the list and from forms. Events and bouts that already use it keep their value. To hide it for now, deactivate it instead.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-2">
            <button type="button" onClick={() => setDeleting(null)} className="h-11 px-5 rounded-xl border border-slate-300 text-sm font-medium text-slate-700 hover:bg-slate-50">Cancel</button>
            <button
              type="button"
              disabled={busy}
              onClick={() => { const r = deleting!; setDeleting(null); run(() => api.settingsLists.delete(tab.key, r.id), `${tab.title(r)} deleted`); }}
              className="h-11 px-5 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white text-sm font-semibold"
            >
              Delete
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function EntryDialog({ tab, row, onClose, onSaved }: { tab: ListTab; row: Row | null; onClose: () => void; onSaved: () => void }) {
  const [values, setValues] = useState<Record<string, string>>(
    Object.fromEntries(tab.fields.map((f) => [f.key, row?.[f.column] == null ? "" : String(row[f.column])])),
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const missing = tab.fields.find((f) => f.required && !values[f.key].trim());
    if (missing) return setError(`Enter the ${missing.label.toLowerCase()}.`);
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
      toast.success(row ? "Saved" : `${tab.singular[0].toUpperCase()}${tab.singular.slice(1)} added`);
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-lg rounded-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{row ? `Edit ${tab.title(row)}` : `Add ${tab.singular}`}</DialogTitle>
          <DialogDescription>{tab.hint}</DialogDescription>
        </DialogHeader>
        <form onSubmit={save} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-3">
            {tab.fields.map((f) => (
              <div key={f.key} className={f.type === "textarea" || f.key === "name" || f.key === "brand" ? "sm:col-span-2" : ""}>
                <label htmlFor={`f-${f.key}`} className="block text-sm font-medium text-slate-700 mb-1">
                  {f.label}{f.required ? "" : <span className="text-slate-400 font-normal"> (optional)</span>}
                </label>
                {f.type === "textarea" ? (
                  <textarea id={`f-${f.key}`} rows={3} value={values[f.key]} onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))} placeholder={f.placeholder} className="w-full rounded-xl border border-slate-300 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none p-3 text-sm" />
                ) : f.type === "glove" ? (
                  <select id={`f-${f.key}`} value={values[f.key]} onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))} className={inputClass}>
                    <option value="">Don't set</option>
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
                    placeholder={f.placeholder}
                    className={inputClass}
                  />
                )}
              </div>
            ))}
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <DialogFooter className="gap-2 sm:gap-2">
            <button type="button" onClick={onClose} className="h-11 px-5 rounded-xl border border-slate-300 text-sm font-medium text-slate-700 hover:bg-slate-50">Cancel</button>
            <button type="submit" disabled={busy} className="h-11 px-5 rounded-xl bg-primary hover:bg-[#083073] disabled:opacity-60 text-white text-sm font-semibold">{row ? "Save" : "Add"}</button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
