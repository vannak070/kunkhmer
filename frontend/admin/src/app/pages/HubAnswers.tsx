/**
 * "Hub answers" (KKF staff): what fans ask KUNKHMER HUB and how it answered, this month's spend
 * against the cap (fans vs staff assistant), and 👍/👎 feedback. Fan answers are anonymous — no IP
 * address or fan account; staff assistant answers show which staff member asked.
 * API: GET /api/ai/usage, GET /api/ai/logs.
 */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { BookOpen, ChevronDown, ChevronLeft, ChevronRight, MessageSquareText, Sparkles, ThumbsDown, ThumbsUp, Wallet } from "lucide-react";
import { api } from "../utils/api";
import { type Lang, type TextKey, formatDay, khmerDigits, useT } from "../i18n/program";

interface Usage {
  month: string;
  spendUsd: number;
  publicSpendUsd: number;
  staffSpendUsd: number;
  capUsd: number;
  capped: boolean;
  questions: number;
  outcomes: Record<string, number>;
  helpful: number;
  notHelpful: number;
  /** Phase D3: answers asked by a signed-in fan this month (never which fan). */
  signedInQuestions?: number;
  enabled: boolean;
}

interface LogItem {
  id: string;
  createdAt: string;
  conversationId: string | null;
  lang: string;
  question: string;
  answer: string;
  outcome: string;
  tools: string[];
  model: string;
  costUsd: number;
  durationMs: number;
  feedback: 1 | -1 | null;
  source: "public" | "staff";
  askedBy: { id: string; name: string } | null;
  signedIn?: boolean;
}

const OUTCOME: Record<string, { label: TextKey; tone: string }> = {
  answered: { label: "hub.o.answered", tone: "bg-emerald-50 text-emerald-700" },
  refused: { label: "hub.o.refused", tone: "bg-amber-50 text-amber-800" },
  too_long: { label: "hub.o.too_long", tone: "bg-amber-50 text-amber-800" },
  error: { label: "hub.o.error", tone: "bg-red-50 text-red-700" },
  capped: { label: "hub.o.capped", tone: "bg-slate-100 text-slate-700" },
};

const TOOL_LABEL: Record<string, TextKey> = {
  search_fighters: "hub.t.search_fighters",
  get_fighter: "hub.t.get_fighter",
  list_events: "hub.t.list_events",
  get_event: "hub.t.get_event",
  latest_results: "hub.t.latest_results",
  list_champions: "hub.t.list_champions",
  fighter_stats: "hub.t.fighter_stats",
  head_to_head: "hub.t.head_to_head",
  search_clubs: "hub.t.search_clubs",
  get_club: "hub.t.get_club",
  list_news: "hub.t.list_news",
  get_news: "hub.t.get_news",
  list_videos: "hub.t.list_videos",
  federation_settings: "hub.t.federation_settings",
  about_federation: "hub.t.about_federation",
  search_knowledge: "hub.t.search_knowledge",
  pending_approvals: "hub.t.pending_approvals",
  data_quality: "hub.t.data_quality",
  drafts: "hub.t.drafts",
  find_records: "hub.t.find_records",
};

const usd = (n: number) => (n < 0.01 && n > 0 ? `$${n.toFixed(4)}` : `$${n.toFixed(2)}`);
const pad = (n: number) => String(n).padStart(2, "0");
const when = (iso: string, ui: Lang) => {
  const d = new Date(iso);
  if (ui !== "km" || isNaN(d.getTime())) return d.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
  return `${formatDay(`${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`, ui)} ${khmerDigits(`${pad(d.getHours())}:${pad(d.getMinutes())}`)}`;
};

type Filter = "all" | "down" | "up" | "problems";
type Source = "all" | "public" | "staff";

export function HubAnswers() {
  // `ui` is the language of the screen; each answer keeps the language the fan asked in.
  const { t, lang: ui } = useT();
  const num = (n: number) => (ui === "km" ? khmerDigits(n) : n);
  const [usage, setUsage] = useState<Usage | null>(null);
  const [items, setItems] = useState<LogItem[] | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<Filter>("all");
  const [source, setSource] = useState<Source>("all");
  const [open, setOpen] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    api.ai.usage().then(setUsage).catch((e) => setError(e instanceof Error ? e.message : t("hub.usageError")));
  }, []);

  useEffect(() => {
    setItems(null);
    const params: Record<string, string> = { page: String(page) };
    if (filter === "down") params.feedback = "down";
    if (filter === "up") params.feedback = "up";
    if (filter === "problems") params.outcome = "error";
    if (source !== "all") params.source = source;
    api.ai
      .logs(params)
      .then((d: any) => {
        setItems(d.items);
        setTotal(d.total);
      })
      .catch((e) => setError(e instanceof Error ? e.message : t("hub.logsError")));
  }, [page, filter, source]);

  const pages = Math.max(1, Math.ceil(total / 50));
  const pct = usage ? Math.min(100, (usage.spendUsd / Math.max(usage.capUsd, 0.01)) * 100) : 0;

  const tab = (key: Filter, label: string, count?: number) => (
    <button
      type="button"
      onClick={() => { setFilter(key); setPage(1); }}
      aria-pressed={filter === key}
      className={`h-10 px-4 rounded-xl text-sm font-medium border transition ${filter === key ? "bg-primary text-white border-primary" : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"}`}
    >
      {label}{count !== undefined && <span className={filter === key ? "text-white/70" : "text-slate-400"}> {num(count)}</span>}
    </button>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <header>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 flex items-center gap-2">
          <Sparkles className="w-7 h-7 text-primary" aria-hidden /> {t("menu.hubAnswers")}
        </h1>
        <p className="text-slate-600 mt-1">{t("hub.intro")}</p>
      </header>

      {error && <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}

      {usage && (
        <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:col-span-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-600 flex items-center gap-2"><Wallet className="w-4 h-4" aria-hidden /> {t("hub.spendIn", { month: usage.month })}</p>
              {usage.capped && <span className="text-xs font-semibold px-2 py-0.5 rounded bg-red-50 text-red-700">{t("hub.paused")}</span>}
            </div>
            <p className="mt-1 text-3xl font-bold text-slate-900 tabular-nums">{usd(usage.spendUsd)} <span className="text-base font-medium text-slate-500">{t("hub.of", { cap: usd(usage.capUsd) })}</span></p>
            <div className="mt-3 h-2 rounded-full bg-slate-100 overflow-hidden">
              <div className={`h-full ${pct >= 90 ? "bg-red-500" : pct >= 70 ? "bg-amber-500" : "bg-emerald-500"}`} style={{ width: `${pct}%` }} />
            </div>
            <p className="mt-2 text-sm text-slate-600 tabular-nums">{t("hub.split", { fans: usd(usage.publicSpendUsd ?? 0), staff: usd(usage.staffSpendUsd ?? 0) })}{usage.signedInQuestions ? t("hub.signedIn", { n: usage.signedInQuestions }) : ""}</p>
            <p className="mt-2 text-xs text-slate-500">{t("hub.estimate")}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <MessageSquareText className="w-5 h-5 text-slate-400" aria-hidden />
            <p className="mt-2 text-3xl font-bold text-slate-900 tabular-nums">{num(usage.questions)}</p>
            <p className="text-sm text-slate-600">{t("hub.questions")}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="flex gap-4">
              <div><ThumbsUp className="w-5 h-5 text-emerald-600" aria-hidden /><p className="mt-2 text-3xl font-bold text-slate-900 tabular-nums">{num(usage.helpful)}</p></div>
              <div><ThumbsDown className="w-5 h-5 text-red-600" aria-hidden /><p className="mt-2 text-3xl font-bold text-slate-900 tabular-nums">{num(usage.notHelpful)}</p></div>
            </div>
            <p className="text-sm text-slate-600">{t("hub.feedback")}</p>
          </div>
        </section>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <label htmlFor="hub-source" className="sr-only">{t("hub.askedBy")}</label>
        <select
          id="hub-source"
          value={source}
          onChange={(e) => { setSource(e.target.value as Source); setPage(1); }}
          className="h-10 px-3 rounded-xl text-sm font-medium border border-slate-200 bg-white text-slate-700"
        >
          <option value="all">{t("hub.src.all")}</option>
          <option value="public">{t("hub.src.public")}</option>
          <option value="staff">{t("hub.src.staff")}</option>
        </select>
        {tab("all", t("hub.f.all"))}
        {tab("down", t("hub.f.down"), usage?.notHelpful)}
        {tab("up", t("hub.f.up"), usage?.helpful)}
        {tab("problems", t("hub.f.errors"), usage?.outcomes?.error ?? 0)}
      </div>

      {!items ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 flex justify-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-600">{t("hub.empty")}</div>
      ) : (
        <ul className="space-y-3">
          {items.map((it) => {
            const o = OUTCOME[it.outcome];
            const outcomeLabel = o ? t(o.label) : it.outcome;
            const outcomeTone = o?.tone ?? "bg-slate-100 text-slate-700";
            const expanded = open === it.id;
            return (
              <li key={it.id} className="rounded-2xl border border-slate-200 bg-white">
                <button type="button" onClick={() => setOpen(expanded ? null : it.id)} aria-expanded={expanded} className="w-full text-left px-5 py-4 flex items-start gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-slate-900 break-words" lang={it.lang}>{it.question}</p>
                    <p className="mt-1 text-xs text-slate-500 flex flex-wrap items-center gap-x-2 gap-y-1">
                      <span>{when(it.createdAt, ui)}</span>
                      <span>· {t(it.lang === "km" ? "hub.langKm" : "hub.langEn")}</span>
                      {it.signedIn && <span className="px-1.5 py-0.5 rounded font-semibold bg-[#fdf1f3] text-[#b92034]" title={t("hub.signedInTitle")}>{t("hub.signedInBadge")}</span>}
                      {it.source === "staff" && (
                        <span className="px-1.5 py-0.5 rounded font-semibold bg-[#eef3fb] text-primary">{t("hub.staff")}{it.askedBy ? ` · ${it.askedBy.name}` : ""}</span>
                      )}
                      <span className={`px-1.5 py-0.5 rounded font-semibold ${outcomeTone}`}>{outcomeLabel}</span>
                      {it.feedback === 1 && <span className="text-emerald-700">{t("hub.helpful")}</span>}
                      {it.feedback === -1 && <span className="text-red-700">{t("hub.notHelpful")}</span>}
                      <span>· {usd(it.costUsd)} · {t("hub.seconds", { n: (it.durationMs / 1000).toFixed(1) })}</span>
                    </p>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-slate-400 mt-1 shrink-0 transition-transform ${expanded ? "rotate-180" : ""}`} aria-hidden />
                </button>
                {expanded && (
                  <div className="px-5 pb-5 space-y-3 border-t border-slate-100 pt-4">
                    <div>
                      <p className={`text-xs font-semibold text-slate-500 mb-1 ${ui === "km" ? "" : "uppercase tracking-wide"}`}>{t("hub.answer")}</p>
                      <p className="text-sm text-slate-800 whitespace-pre-wrap break-words" lang={it.lang}>{it.answer}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {it.tools.length === 0 ? (
                        <span className="text-xs text-slate-500">{t("hub.noTools")}</span>
                      ) : (
                        it.tools.map((tool, i) => <span key={i} className="text-xs px-2 py-1 rounded-lg bg-[#eef3fb] text-primary">{TOOL_LABEL[tool] ? t(TOOL_LABEL[tool]) : tool}</span>)
                      )}
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-xs text-slate-400">{t("hub.model", { model: it.model })}{it.conversationId ? t("hub.conversation", { id: it.conversationId.slice(0, 8) }) : ""}</p>
                      <button
                        type="button"
                        onClick={() => navigate("/home/knowledge", { state: { faq: { question: it.question, answer: it.outcome === "answered" ? it.answer : "" } } })}
                        className="h-9 px-3 rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-700 inline-flex items-center gap-2 hover:border-slate-300"
                        title={t("hub.faqTitle")}
                      >
                        <BookOpen className="w-4 h-4" aria-hidden /> {t("hub.saveFaq")}
                      </button>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {pages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="h-10 w-10 rounded-xl border border-slate-200 bg-white disabled:opacity-40 flex items-center justify-center" aria-label={t("hub.prev")}><ChevronLeft className="w-4 h-4" /></button>
          <span className="text-sm text-slate-600">{t("hub.page", { page, pages })}</span>
          <button type="button" disabled={page >= pages} onClick={() => setPage((p) => p + 1)} className="h-10 w-10 rounded-xl border border-slate-200 bg-white disabled:opacity-40 flex items-center justify-center" aria-label={t("hub.next")}><ChevronRight className="w-4 h-4" /></button>
        </div>
      )}
    </div>
  );
}
