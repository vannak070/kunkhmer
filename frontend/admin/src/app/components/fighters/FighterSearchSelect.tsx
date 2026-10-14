/**
 * Pick one fighter by searching (replaces a drop-down of every fighter): shows the chosen fighter with a button to
 * clear it, or a search box that asks the server a moment after typing stops (GET /fighters/page).
 * Used where a fighter is linked to something: a video's fighter, a title's champion
 * (claude/updates/admin-bout-picker.md).
 */
import { useEffect, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { api } from "../../utils/api";
import { useT } from "../../i18n/program";
import { FighterAvatar } from "../program/shared";
import { weightOf } from "./fighterUtils";

export function FighterSearchSelect({ selected, onChange, placeholder, inputClassName, activeOnly = false }: {
  /** The chosen fighter (an object with at least id and name), or null. */
  selected: { id: string; name: string; nameKhmer?: string | null; clubName?: string | null; image?: string | null } | null;
  onChange: (fighter: any | null) => void;
  placeholder: string;
  inputClassName: string;
  /** Only registered (Active) fighters can be found (a title's champion); otherwise every fighter. */
  activeOnly?: boolean;
}) {
  const { t, lang } = useT();
  const [typed, setTyped] = useState("");
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [list, setList] = useState<any[] | null>(null);
  const box = useRef<HTMLDivElement>(null);
  const kgOf = (f: any) => weightOf(f);
  const name = (f: any) => (lang === "km" && f.nameKhmer ? f.nameKhmer : f.name);

  useEffect(() => {
    const id = setTimeout(() => setQ(typed.trim()), 250);
    return () => clearTimeout(id);
  }, [typed]);
  useEffect(() => {
    if (selected || !open) return;
    let stale = false;
    setList(null);
    api.fighters
      .page({ q, facets: 0, limit: 8, ...(activeOnly ? { status: "Active" } : {}) })
      .then((p) => { if (!stale) setList(p.items); })
      .catch(() => { if (!stale) setList([]); });
    return () => { stale = true; };
  }, [selected?.id, open, q, activeOnly]);
  useEffect(() => {
    const close = (e: MouseEvent) => { if (box.current && !box.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  if (selected)
    return (
      <div className="mt-1 flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-2.5 min-w-0">
        <FighterAvatar name={selected.name} image={selected.image ?? null} />
        <span className="min-w-0 flex-1 text-sm font-semibold text-slate-900 break-words">
          {name(selected)}
          {selected.clubName && <span className="block text-xs font-normal text-slate-600">{selected.clubName}</span>}
        </span>
        <button type="button" onClick={() => onChange(null)} aria-label={t("common.change")} className="w-9 h-9 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-900 inline-flex items-center justify-center shrink-0"><X className="w-4 h-4" aria-hidden /></button>
      </div>
    );
  return (
    <div ref={box} className="relative mt-1">
      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" aria-hidden />
      <input value={typed} onChange={(e) => { setTyped(e.target.value); setOpen(true); }} onFocus={() => setOpen(true)} placeholder={placeholder} className={`${inputClassName} pl-9`} />
      {open && (
        <ul className="absolute z-30 mt-1 w-full max-h-64 overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-lg divide-y divide-slate-100">
          {list === null && <li className="p-3 text-sm text-slate-500">{t("common.loading")}</li>}
          {list?.length === 0 && <li className="p-3 text-sm text-slate-500">{t("bout.noFighter")}</li>}
          {list?.map((f) => (
            <li key={f.id}>
              <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => { onChange(f); setTyped(""); setQ(""); setOpen(false); }} className="w-full text-left flex items-center gap-3 p-2.5 hover:bg-slate-50">
                <FighterAvatar name={f.name} image={f.image} />
                <span className="min-w-0 text-sm">
                  <span className="block font-semibold text-slate-900 break-words">{name(f)}</span>
                  <span className="block text-xs text-slate-600">{[kgOf(f) ? t("common.kg", { n: kgOf(f)! }) : null, f.clubName].filter(Boolean).join(" · ")}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
