import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { Calendar, FileText, Loader2, Search, User, X } from "lucide-react";
import { api } from "../../utils/api";
import { getFighterSlug } from "../../data/masterData";
import { formatPublicDate } from "../../utils/publicDisplay";

type ResultKind = "fighter" | "event" | "article";
type Scope = "all" | ResultKind;

interface SearchItem {
  kind: ResultKind;
  id: string;
  title: string;
  subtitle: string;
  image?: string;
  href: string;
  haystack: string;
}

const SCOPES: { id: Scope; label: string }[] = [
  { id: "all", label: "All" },
  { id: "fighter", label: "Fighters" },
  { id: "event", label: "Events" },
  { id: "article", label: "News" },
];

const KIND_LABEL: Record<ResultKind, string> = { fighter: "Fighters", event: "Events", article: "News" };
const KIND_ICON = { fighter: User, event: Calendar, article: FileText };
const MAX_PER_KIND = 4;

// Loaded once per page session and shared by every header instance.
let indexPromise: Promise<SearchItem[]> | null = null;

function loadIndex(): Promise<SearchItem[]> {
  if (!indexPromise) {
    indexPromise = Promise.allSettled([api.fighters.list(), api.events.list(), api.news.list()]).then(
      ([fighters, events, news]) => {
        const items: SearchItem[] = [];
        if (fighters.status === "fulfilled") {
          for (const f of fighters.value || []) {
            items.push({
              kind: "fighter",
              id: f.id,
              title: f.name,
              subtitle: [f.record && `${f.record} record`, f.clubName].filter(Boolean).join(" · "),
              image: f.image,
              href: `/fighters/${getFighterSlug(f)}`,
              haystack: [f.name, f.nameKhmer, f.alias, f.clubName].filter(Boolean).join(" ").toLowerCase(),
            });
          }
        }
        if (events.status === "fulfilled") {
          for (const e of events.value || []) {
            if (e.status === "Draft") continue;
            items.push({
              kind: "event",
              id: e.id,
              title: e.name,
              subtitle: [formatPublicDate(e.date), e.location].filter(Boolean).join(" · "),
              image: e.image,
              href: `/matches?tab=events&event=${e.id}`,
              haystack: [e.name, e.location, e.description].filter(Boolean).join(" ").toLowerCase(),
            });
          }
        }
        if (news.status === "fulfilled") {
          for (const a of news.value || []) {
            if (a.status && a.status !== "Published") continue;
            items.push({
              kind: "article",
              id: a.id,
              title: a.title,
              subtitle: [a.category, formatPublicDate(a.publish_date || a.publishDate)].filter(Boolean).join(" · "),
              image: a.featured_image || a.featuredImage,
              href: `/article/${a.id}`,
              haystack: [a.title, a.subtitle, a.category].filter(Boolean).join(" ").toLowerCase(),
            });
          }
        }
        return items;
      }
    );
  }
  return indexPromise;
}

interface GlobalSearchProps {
  /** Called after a result is chosen (e.g. to close the mobile menu). */
  onNavigate?: () => void;
  className?: string;
}

export function GlobalSearch({ onNavigate, className = "" }: GlobalSearchProps) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [scope, setScope] = useState<Scope>("all");
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState<SearchItem[] | null>(null);
  const [activeIdx, setActiveIdx] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const ensureIndex = () => {
    if (!index) loadIndex().then(setIndex);
  };

  const q = query.trim().toLowerCase();

  const results = useMemo(() => {
    if (!index || !q) return [];
    const terms = q.split(/\s+/);
    const matches = index.filter(
      (item) => (scope === "all" || item.kind === scope) && terms.every((t) => item.haystack.includes(t))
    );
    if (scope !== "all") return matches.slice(0, 8);
    // Keep the grouped order fighters → events → news, capped per group.
    return (["fighter", "event", "article"] as ResultKind[]).flatMap((k) =>
      matches.filter((m) => m.kind === k).slice(0, MAX_PER_KIND)
    );
  }, [index, q, scope]);

  useEffect(() => setActiveIdx(0), [q, scope]);

  // Close when clicking outside.
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const choose = (item: SearchItem) => {
    setOpen(false);
    setQuery("");
    inputRef.current?.blur();
    onNavigate?.();
    navigate(item.href);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      setOpen(false);
      inputRef.current?.blur();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setActiveIdx((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && results[activeIdx]) {
      e.preventDefault();
      choose(results[activeIdx]);
    }
  };

  const showPanel = open && q.length > 0;
  const listboxId = "global-search-results";

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 focus-within:ring-2 focus-within:ring-[#0A3D91]/30 focus-within:border-[#0A3D91]/50 focus-within:bg-white transition-all">
        <Search className="w-4 h-4 text-[#0A3D91] flex-shrink-0" aria-hidden />
        <input
          ref={inputRef}
          type="search"
          role="combobox"
          aria-expanded={showPanel}
          aria-controls={listboxId}
          aria-autocomplete="list"
          aria-label="Search fighters, events and news"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            ensureIndex();
          }}
          onFocus={() => {
            setOpen(true);
            ensureIndex();
          }}
          onKeyDown={onKeyDown}
          placeholder="Search fighters, events, news…"
          className="flex-1 min-w-0 bg-transparent outline-none text-sm font-medium placeholder:text-gray-400 [&::-webkit-search-cancel-button]:hidden"
        />
        {query && (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => {
              setQuery("");
              inputRef.current?.focus();
            }}
            className="p-1 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {showPanel && (
        <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 overflow-hidden">
          <div className="flex gap-1.5 px-3 pt-3 pb-2 border-b border-gray-100 overflow-x-auto">
            {SCOPES.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => {
                  setScope(s.id);
                  inputRef.current?.focus();
                }}
                aria-pressed={scope === s.id}
                className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
                  scope === s.id ? "bg-[#0A3D91] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          <ul id={listboxId} role="listbox" className="max-h-[60vh] overflow-y-auto py-1">
            {!index && (
              <li className="flex items-center gap-2 px-4 py-6 text-sm text-gray-500 justify-center">
                <Loader2 className="w-4 h-4 animate-spin" /> Searching…
              </li>
            )}
            {index && results.length === 0 && (
              <li className="px-4 py-6 text-sm text-gray-500 text-center">
                No results for “{query.trim()}”. Try a fighter name, club or event.
              </li>
            )}
            {results.map((item, i) => {
              const Icon = KIND_ICON[item.kind];
              const showGroup = scope === "all" && (i === 0 || results[i - 1].kind !== item.kind);
              return (
                <li key={`${item.kind}-${item.id}`} role="presentation">
                  {showGroup && (
                    <div className="px-4 pt-3 pb-1 text-[11px] font-bold uppercase tracking-wider text-gray-400">
                      {KIND_LABEL[item.kind]}
                    </div>
                  )}
                  <button
                    type="button"
                    role="option"
                    aria-selected={i === activeIdx}
                    onMouseEnter={() => setActiveIdx(i)}
                    onClick={() => choose(item)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                      i === activeIdx ? "bg-blue-50" : "hover:bg-gray-50"
                    }`}
                  >
                    <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden flex items-center justify-center flex-shrink-0">
                      {item.image ? (
                        <img src={item.image} alt="" className="w-full h-full object-cover" loading="lazy" />
                      ) : (
                        <Icon className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-gray-900 truncate">{item.title}</p>
                      {item.subtitle && <p className="text-xs text-gray-500 truncate">{item.subtitle}</p>}
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
