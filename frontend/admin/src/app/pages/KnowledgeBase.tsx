/**
 * "Knowledge base" (KKF staff): the approved articles KUNKHMER HUB answers sport questions from.
 * Officers write and edit drafts; only a Super Admin publishes, edits published articles and
 * marks the Khmer text reviewed. The Hub reads Published articles only.
 * API: /api/knowledge (see claude/features/knowledge-base.md).
 */
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { toast } from "sonner";
import { ArrowLeft, BookOpen, CheckCircle2, Eye, EyeOff, Languages, Plus, Save, Trash2 } from "lucide-react";
import { api } from "../utils/api";

interface Article {
  id: string;
  slug: string;
  category: string;
  titleEn: string;
  titleKm: string | null;
  bodyEn: string;
  bodyKm: string | null;
  kmReviewed: boolean;
  status: "Draft" | "Published";
  source: string | null;
  sortOrder: number;
  createdBy: string | null;
  updatedBy: string | null;
  publishedBy: string | null;
  publishedAt: string | null;
  updatedAt: string;
}

const CATEGORIES: { key: string; label: string }[] = [
  { key: "history", label: "History" },
  { key: "organisations", label: "Organisations & events" },
  { key: "people", label: "Legends & famous fighters" },
  { key: "rules", label: "Rules & scoring" },
  { key: "techniques", label: "Techniques" },
  { key: "culture", label: "Kun Kru & music" },
  { key: "glossary", label: "Glossary" },
  { key: "regulations", label: "Regulations" },
  { key: "faq", label: "FAQ" },
];
const categoryLabel = (k: string) => CATEGORIES.find((c) => c.key === k)?.label ?? k;

type Form = Pick<Article, "category" | "titleEn" | "titleKm" | "bodyEn" | "bodyKm" | "source" | "sortOrder">;
const EMPTY: Form = { category: "history", titleEn: "", titleKm: "", bodyEn: "", bodyKm: "", source: "", sortOrder: 0 };

const when = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString(undefined, { dateStyle: "medium" }) : "");
const field = "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary disabled:bg-slate-50 disabled:text-slate-500";

export function KnowledgeBase() {
  const me = api.auth.getCurrentUser();
  const isSuper = me?.role === "Super Admin";

  const [items, setItems] = useState<Article[] | null>(null);
  const [status, setStatus] = useState<"all" | "Draft" | "Published">("all");
  const [editing, setEditing] = useState<Article | "new" | null>(null);
  const [form, setForm] = useState<Form>(EMPTY);
  const [lang, setLang] = useState<"en" | "km">("en");
  const [busy, setBusy] = useState(false);

  const load = () =>
    api.knowledge
      .list()
      .then(setItems)
      .catch((e) => toast.error(e instanceof Error ? e.message : "Could not load the knowledge base."));

  useEffect(() => {
    load();
  }, []);

  // "Save as FAQ" on the Hub answers page opens a new FAQ draft with the fan's question.
  const location = useLocation();
  const navigate = useNavigate();
  useEffect(() => {
    const faq = (location.state as { faq?: { question: string; answer: string } } | null)?.faq;
    if (!faq) return;
    setEditing("new");
    setLang("en");
    setForm({ ...EMPTY, category: "faq", titleEn: faq.question, bodyEn: faq.answer, source: "From a KUNKHMER HUB question — check and correct the answer before publishing." });
    navigate(location.pathname, { replace: true, state: null });
  }, [location.state]);

  const shown = useMemo(() => (items ?? []).filter((a) => status === "all" || a.status === status), [items, status]);
  const counts = useMemo(
    () => ({
      all: items?.length ?? 0,
      Draft: items?.filter((a) => a.status === "Draft").length ?? 0,
      Published: items?.filter((a) => a.status === "Published").length ?? 0,
    }),
    [items],
  );

  const open = (a: Article | "new") => {
    setEditing(a);
    setLang("en");
    setForm(
      a === "new"
        ? EMPTY
        : { category: a.category, titleEn: a.titleEn, titleKm: a.titleKm ?? "", bodyEn: a.bodyEn, bodyKm: a.bodyKm ?? "", source: a.source ?? "", sortOrder: a.sortOrder },
    );
  };

  const current = editing && editing !== "new" ? editing : null;
  // Published text feeds the Hub, so only the Super Admin changes it.
  const locked = !!current && current.status === "Published" && !isSuper;

  const run = async (action: () => Promise<Article | void>, message: string, close = false) => {
    setBusy(true);
    try {
      const updated = await action();
      toast.success(message);
      await load();
      if (close || !updated) setEditing(null);
      else setEditing(updated);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  };

  const save = () => {
    if (!form.titleEn.trim() || !form.bodyEn.trim()) {
      toast.error("The English title and text are required.");
      setLang("en");
      return;
    }
    const body = { ...form, sortOrder: Number(form.sortOrder) || 0 };
    run(() => (current ? api.knowledge.update(current.id, body) : api.knowledge.create(body)), current ? "Saved." : "Draft created.");
  };

  if (editing) {
    return (
      <div className="max-w-4xl mx-auto space-y-5">
        <button type="button" onClick={() => setEditing(null)} className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900">
          <ArrowLeft className="w-4 h-4" aria-hidden /> Back to knowledge base
        </button>

        <header className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{current ? current.titleEn : "New article"}</h1>
            {current && (
              <p className="mt-1 text-sm text-slate-500 flex flex-wrap items-center gap-2">
                <StatusChip status={current.status} />
                <KmChip article={current} />
                {current.publishedAt && current.status === "Published" && <span>Published {when(current.publishedAt)}{current.publishedBy ? ` by ${current.publishedBy}` : ""}</span>}
              </p>
            )}
          </div>
          {current && isSuper && (
            <div className="flex flex-wrap gap-2">
              {current.status === "Draft" ? (
                <button type="button" disabled={busy} onClick={() => run(() => api.knowledge.publish(current.id), "Published — KUNKHMER HUB now uses this article.")} className="h-10 px-4 rounded-xl bg-emerald-600 text-white text-sm font-semibold inline-flex items-center gap-2 hover:bg-emerald-700 disabled:opacity-50">
                  <Eye className="w-4 h-4" aria-hidden /> Publish
                </button>
              ) : (
                <button type="button" disabled={busy} onClick={() => run(() => api.knowledge.unpublish(current.id), "Unpublished — the Hub no longer uses it.")} className="h-10 px-4 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm font-semibold inline-flex items-center gap-2 hover:border-slate-300 disabled:opacity-50">
                  <EyeOff className="w-4 h-4" aria-hidden /> Unpublish
                </button>
              )}
            </div>
          )}
        </header>

        {locked && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            This article is published, so only a Super Admin can change it. Ask a Super Admin to edit it or unpublish it for you.
          </div>
        )}
        {current?.status === "Draft" && !isSuper && (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
            Drafts aren't used by KUNKHMER HUB. When it's ready, ask a Super Admin to review and publish it.
          </div>
        )}

        <section className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
          <div className="grid sm:grid-cols-3 gap-4">
            <label className="block sm:col-span-2">
              <span className="text-sm font-medium text-slate-700">Topic</span>
              <select className={`${field} mt-1`} value={form.category} disabled={locked} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                {CATEGORIES.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Order in topic</span>
              <input type="number" className={`${field} mt-1`} value={form.sortOrder} disabled={locked} onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })} />
            </label>
          </div>

          <div className="flex gap-2" role="tablist" aria-label="Language">
            {(["en", "km"] as const).map((l) => (
              <button key={l} type="button" role="tab" aria-selected={lang === l} onClick={() => setLang(l)} className={`h-10 px-4 rounded-xl text-sm font-medium border transition ${lang === l ? "bg-primary text-white border-primary" : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"}`}>
                {l === "en" ? "English" : "ខ្មែរ Khmer"}
              </button>
            ))}
          </div>

          {lang === "en" ? (
            <>
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Title (English) *</span>
                <input className={`${field} mt-1`} value={form.titleEn} disabled={locked} onChange={(e) => setForm({ ...form, titleEn: e.target.value })} />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Text (English) *</span>
                <textarea rows={14} className={`${field} mt-1 leading-relaxed`} value={form.bodyEn} disabled={locked} onChange={(e) => setForm({ ...form, bodyEn: e.target.value })} />
              </label>
            </>
          ) : (
            <>
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Title (Khmer)</span>
                <input lang="km" className={`${field} mt-1`} value={form.titleKm ?? ""} disabled={locked} onChange={(e) => setForm({ ...form, titleKm: e.target.value })} />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Text (Khmer)</span>
                <textarea lang="km" rows={14} className={`${field} mt-1 leading-relaxed`} value={form.bodyKm ?? ""} disabled={locked} onChange={(e) => setForm({ ...form, bodyKm: e.target.value })} />
              </label>
              <div className="rounded-xl bg-slate-50 border border-slate-200 p-3 text-sm text-slate-700 flex flex-wrap items-center justify-between gap-3">
                <span className="flex items-center gap-2">
                  <Languages className="w-4 h-4 text-slate-500" aria-hidden />
                  {current?.kmReviewed ? "Khmer text reviewed by KKF." : "Khmer text needs a native-speaker review. Until then the Hub answers in Khmer from the English text."}
                </span>
                {current && isSuper && (
                  <button type="button" disabled={busy} onClick={() => run(() => api.knowledge.update(current.id, { kmReviewed: !current.kmReviewed }), current.kmReviewed ? "Marked as needing review." : "Khmer marked reviewed.")} className="h-9 px-3 rounded-lg border border-slate-200 bg-white text-sm font-medium hover:border-slate-300 disabled:opacity-50">
                    {current.kmReviewed ? "Mark as needing review" : "Mark Khmer reviewed"}
                  </button>
                )}
              </div>
            </>
          )}

          <label className="block">
            <span className="text-sm font-medium text-slate-700">Source (for reviewers, not shown to fans)</span>
            <textarea rows={2} className={`${field} mt-1`} value={form.source ?? ""} disabled={locked} onChange={(e) => setForm({ ...form, source: e.target.value })} placeholder="e.g. KKF rulebook 2026, section 3" />
          </label>
        </section>

        <div className="flex flex-wrap items-center justify-between gap-3">
          {current && (!locked) ? (
            <button type="button" disabled={busy} onClick={() => { if (confirm(`Delete "${current.titleEn}"? This can't be undone.`)) run(() => api.knowledge.remove(current.id), "Article deleted.", true); }} className="h-11 px-4 rounded-xl text-red-700 text-sm font-semibold inline-flex items-center gap-2 hover:bg-red-50 disabled:opacity-50">
              <Trash2 className="w-4 h-4" aria-hidden /> Delete
            </button>
          ) : <span />}
          {!locked && (
            <button type="button" disabled={busy} onClick={save} className="h-11 px-5 rounded-xl bg-primary text-white text-sm font-semibold inline-flex items-center gap-2 hover:opacity-90 disabled:opacity-50">
              <Save className="w-4 h-4" aria-hidden /> {current ? "Save changes" : "Save draft"}
            </button>
          )}
        </div>
      </div>
    );
  }

  const tab = (key: typeof status, label: string) => (
    <button type="button" onClick={() => setStatus(key)} aria-pressed={status === key} className={`h-10 px-4 rounded-xl text-sm font-medium border transition ${status === key ? "bg-primary text-white border-primary" : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"}`}>
      {label} <span className={status === key ? "text-white/70" : "text-slate-400"}>{counts[key]}</span>
    </button>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-7 h-7 text-primary" aria-hidden /> Knowledge base
          </h1>
          <p className="text-slate-600 mt-1 max-w-2xl">
            Articles about the sport that KUNKHMER HUB answers from. Only <strong>published</strong> articles are used.
            {isSuper ? " You review and publish them." : " A Super Admin reviews and publishes them."}
          </p>
        </div>
        <button type="button" onClick={() => open("new")} className="h-11 px-4 rounded-xl bg-primary text-white text-sm font-semibold inline-flex items-center gap-2 hover:opacity-90">
          <Plus className="w-4 h-4" aria-hidden /> New article
        </button>
      </header>

      <div className="flex flex-wrap gap-2">
        {tab("all", "All")}
        {tab("Draft", "Drafts")}
        {tab("Published", "Published")}
      </div>

      {!items ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 flex justify-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
      ) : shown.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-600">No articles here yet.</div>
      ) : (
        <ul className="grid md:grid-cols-2 gap-3">
          {shown.map((a) => (
            <li key={a.id}>
              <button type="button" onClick={() => open(a)} className="w-full h-full text-left rounded-2xl border border-slate-200 bg-white p-5 hover:border-slate-300 hover:shadow-sm transition">
                <p className="text-xs font-semibold uppercase tracking-wide text-primary">{categoryLabel(a.category)}</p>
                <p className="mt-1 font-semibold text-slate-900">{a.titleEn}</p>
                {a.titleKm && <p className="text-sm text-slate-600" lang="km">{a.titleKm}</p>}
                <p className="mt-2 text-sm text-slate-600 line-clamp-2">{a.bodyEn}</p>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                  <StatusChip status={a.status} />
                  <KmChip article={a} />
                  <span className="text-slate-400">Updated {when(a.updatedAt)}</span>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function StatusChip({ status }: { status: string }) {
  return status === "Published" ? (
    <span className="px-1.5 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-700 inline-flex items-center gap-1"><CheckCircle2 className="w-3 h-3" aria-hidden /> Published</span>
  ) : (
    <span className="px-1.5 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-700">Draft</span>
  );
}

function KmChip({ article }: { article: Article }) {
  if (!article.bodyKm) return <span className="px-1.5 py-0.5 rounded text-xs font-semibold bg-slate-50 text-slate-500">No Khmer</span>;
  return article.kmReviewed ? (
    <span className="px-1.5 py-0.5 rounded text-xs font-semibold bg-[#eef3fb] text-primary">Khmer reviewed</span>
  ) : (
    <span className="px-1.5 py-0.5 rounded text-xs font-semibold bg-amber-50 text-amber-800">Khmer needs review</span>
  );
}
