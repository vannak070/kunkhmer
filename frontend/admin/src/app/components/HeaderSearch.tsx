/**
 * Header quick-find: fighters, clubs and events by name (English or Khmer). Data is loaded on
 * first focus and filtered in the browser. Enter opens the first result; Esc closes.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { Building2, CalendarDays, Dumbbell, Search } from "lucide-react";
import { api } from "../utils/api";

interface Hit {
  type: "Fighter" | "Club" | "Event";
  id: string;
  label: string;
  sub: string;
  href: string;
  haystack: string;
}

const ICON = { Fighter: Dumbbell, Club: Building2, Event: CalendarDays };

export function HeaderSearch() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState<Hit[] | null>(null);
  const [active, setActive] = useState(0);
  const box = useRef<HTMLDivElement>(null);

  const loadIndex = () => {
    if (index) return;
    Promise.all([api.fighters.list().catch(() => []), api.clubs.list().catch(() => []), api.events.list().catch(() => [])]).then(
      ([fighters, clubs, events]: any[]) => {
        setIndex([
          ...fighters.map((f: any) => ({
            type: "Fighter" as const, id: f.id, label: f.name, sub: [f.nameKhmer, f.clubName, f.status].filter(Boolean).join(" · "),
            href: `/home/fighters/${f.id}`, haystack: [f.name, f.nameKhmer, f.alias, f.clubName].join(" ").toLowerCase(),
          })),
          ...clubs.map((c: any) => ({
            type: "Club" as const, id: c.id, label: c.name, sub: [c.name_khmer, c.location].filter(Boolean).join(" · "),
            href: `/home/clubs/${c.id}`, haystack: [c.name, c.name_khmer, c.location].join(" ").toLowerCase(),
          })),
          ...events.map((e: any) => ({
            type: "Event" as const, id: e.id, label: e.name, sub: [String(e.date ?? "").slice(0, 10), e.location, e.status].filter(Boolean).join(" · "),
            href: `/home/events/${e.id}`, haystack: [e.name, e.location].join(" ").toLowerCase(),
          })),
        ]);
      },
    );
  };

  const hits = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term || !index) return [];
    return index.filter((h) => h.haystack.includes(term)).slice(0, 8);
  }, [q, index]);

  useEffect(() => setActive(0), [q]);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (box.current && !box.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const go = (h: Hit) => {
    navigate(h.href);
    setOpen(false);
    setQ("");
  };

  return (
    <div ref={box} className="flex items-center w-full max-w-md relative group">
      <Search className="w-4 h-4 text-muted-foreground absolute left-3 group-focus-within:text-primary transition-colors" aria-hidden />
      <input
        type="search"
        value={q}
        onChange={(e) => { setQ(e.target.value); setOpen(true); }}
        onFocus={() => { loadIndex(); setOpen(true); }}
        onKeyDown={(e) => {
          if (e.key === "Escape") setOpen(false);
          if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => Math.min(a + 1, hits.length - 1)); }
          if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
          if (e.key === "Enter" && hits[active]) go(hits[active]);
        }}
        placeholder="Search fighters, clubs, events…"
        aria-label="Search fighters, clubs and events"
        className="w-full pl-9 pr-4 py-2 bg-muted/15 border border-border/60 hover:border-slate-300 focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/5 rounded-xl text-sm transition-all outline-none"
      />
      {open && q.trim() && (
        <div role="listbox" className="absolute left-0 right-0 top-full mt-2 bg-white border border-slate-200 rounded-xl shadow-lg py-1 z-50 max-h-96 overflow-y-auto">
          {!index ? (
            <p className="px-4 py-3 text-sm text-slate-500">Searching…</p>
          ) : hits.length === 0 ? (
            <p className="px-4 py-3 text-sm text-slate-500">No fighters, clubs or events match “{q.trim()}”.</p>
          ) : (
            hits.map((h, i) => {
              const Icon = ICON[h.type];
              return (
                <button
                  key={`${h.type}-${h.id}`}
                  type="button"
                  role="option"
                  aria-selected={i === active}
                  onMouseEnter={() => setActive(i)}
                  onClick={() => go(h)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-left ${i === active ? "bg-[#eef3fb]" : ""}`}
                >
                  <Icon className="w-4 h-4 text-slate-400 shrink-0" aria-hidden />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium text-slate-900 truncate">{h.label}</span>
                    {h.sub && <span className="block text-xs text-slate-500 truncate">{h.sub}</span>}
                  </span>
                  <span className="text-[11px] font-semibold uppercase text-slate-400">{h.type}</span>
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
