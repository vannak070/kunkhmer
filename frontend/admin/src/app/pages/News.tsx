import { useState, useRef, useEffect } from "react";
import { Link } from "react-router";
import { Plus, Search, Newspaper, Calendar, Eye, Edit2, Trash2, Image as ImageIcon, FileText, CheckCircle, Clock, XCircle, Upload, X, ArrowLeft, Save, ChevronDown, Heading, Bold, Italic, List, Quote, Link2, Globe } from "lucide-react";
import { usePermissions } from "../hooks/usePermissions";
import { api } from "../utils/api";
import { type TextKey, khmerDigits, useT } from "../i18n/program";

interface NewsArticle {
  id: string;
  title: string;
  subtitle: string;
  content: string;
  titleEn: string;
  subtitleEn: string;
  contentEn: string;
  author: string;
  publishDate: string;
  status: "Draft" | "Published" | "Archived";
  category: string;
  featuredImage?: string;
  views: number;
  featured: boolean;
}

const CATEGORIES = [
  "News",
  "Events",
  "Fighter Spotlight",
  "Regulations",
  "Training",
  "Community"
];

const STATUS_TEXT: Record<string, TextKey> = {
  Draft: "media.status.Draft",
  Published: "media.status.Published",
  Archived: "media.status.Archived",
};
/** Category names as shown; the stored value stays the English one. */
const CATEGORY_TEXT: Record<string, TextKey> = {
  News: "news.cat.News",
  Events: "news.cat.Events",
  "Fighter Spotlight": "news.cat.Fighter Spotlight",
  Regulations: "news.cat.Regulations",
  Training: "news.cat.Training",
  Community: "news.cat.Community",
};

export function News() {
  const { t, lang } = useT();
  // Khmer script: `km-text` (styles/theme.css) removes letter spacing and enlarges the tiny labels.
  const km = lang === "km" ? " km-text" : "";
  const categoryLabel = (c: string) => (CATEGORY_TEXT[c] ? t(CATEGORY_TEXT[c]) : c);
  const statusLabel = (v: string) => (STATUS_TEXT[v] ? t(STATUS_TEXT[v]) : v);
  const permissions = usePermissions();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [viewMode, setViewMode] = useState<'list' | 'add' | 'edit'>('list');
  const [editingNews, setEditingNews] = useState<NewsArticle | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Editor configuration
  const [editorTab, setEditorTab] = useState<'write' | 'preview'>('write');

  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    content: "",
    titleEn: "",
    subtitleEn: "",
    contentEn: "",
    category: "News",
    status: "Draft" as "Draft" | "Published" | "Archived",
    author: "",
    publishDate: "",
    featured: false
  });

  const fetchNews = async () => {
    setLoading(true);
    try {
      const data = await api.news.list();
      const mapped = (data || []).map((art: any) => ({
        id: art.id,
        title: art.title,
        subtitle: art.subtitle || "",
        content: art.content || "",
        titleEn: art.title_en || "",
        subtitleEn: art.subtitle_en || "",
        contentEn: art.content_en || "",
        author: art.author || "Admin",
        publishDate: art.publish_date || art.publishDate || "",
        status: art.status || "Draft",
        category: art.category || "News",
        featuredImage: art.featured_image || art.featuredImage || undefined,
        views: art.views || 0,
        featured: Boolean(art.featured)
      }));
      setNews(mapped);
    } catch (err) {
      console.error("Failed to load news articles from database:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  // Filter news
  const filteredNews = news.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          article.subtitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          article.author.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || article.status === statusFilter;
    const matchesCategory = categoryFilter === "all" || article.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Draft":
        return { bg: "bg-gray-100 text-gray-700 border-gray-200", icon: <Clock className="w-3.5 h-3.5" /> };
      case "Published":
        return { bg: "bg-emerald-100 text-emerald-700 border-emerald-200", icon: <CheckCircle className="w-3.5 h-3.5" /> };
      case "Archived":
        return { bg: "bg-red-100 text-red-700 border-red-200", icon: <XCircle className="w-3.5 h-3.5" /> };
      default:
        return { bg: "bg-gray-100 text-gray-700 border-gray-200", icon: <FileText className="w-3.5 h-3.5" /> };
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm(t("news.deleteConfirm"))) {
      try {
        await api.news.delete(id);
        setNews(prev => prev.filter(article => article.id !== id));
      } catch (err) {
        alert(t("news.deleteError", { msg: (err as Error).message }));
      }
    }
  };

  const handleAddNews = () => {
    const currentUser = api.auth.getCurrentUser();
    setFormData({
      title: "",
      subtitle: "",
      content: "",
      titleEn: "",
      subtitleEn: "",
      contentEn: "",
      category: "News",
      status: "Draft",
      author: currentUser ? currentUser.full_name : "KKF Official",
      publishDate: new Date().toISOString().split("T")[0],
      featured: false
    });
    setEditingNews(null);
    setImagePreview(null);
    setEditorTab("write");
    setViewMode("add");
  };

  const handleEditNews = (article: NewsArticle) => {
    setFormData({
      title: article.title,
      subtitle: article.subtitle,
      content: article.content,
      titleEn: article.titleEn,
      subtitleEn: article.subtitleEn,
      contentEn: article.contentEn,
      category: article.category,
      status: article.status,
      author: article.author,
      publishDate: article.publishDate,
      featured: article.featured
    });
    setEditingNews(article);
    setImagePreview(article.featuredImage || null);
    setEditorTab("write");
    setViewMode("edit");
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Helper to insert format tags into the content editor
  const insertFormat = (syntax: string, placeholder = "") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;

    const selectedText = text.substring(start, end);
    const replacement = syntax.includes('%s') 
      ? syntax.replace('%s', selectedText || placeholder)
      : syntax + (selectedText || placeholder);

    const newContent = text.substring(0, start) + replacement + text.substring(end);
    
    setFormData({ ...formData, content: newContent });

    // Focus and select range back
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + replacement.length, start + replacement.length);
    }, 50);
  };

  // Simple parser to display markdown format in Preview tab
  const renderPreviewHTML = (text: string) => {
    if (!text) return `<p class="text-slate-400 italic">${t("news.noContent")}</p>`;
    
    let html = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    // Headings
    html = html.replace(/^### (.*?)$/gm, '<h3 class="text-lg font-black text-slate-800 mt-4 mb-2">$1</h3>');
    html = html.replace(/^## (.*?)$/gm, '<h2 class="text-xl font-black text-slate-900 mt-5 mb-2">$1</h2>');
    html = html.replace(/^# (.*?)$/gm, '<h1 class="text-2xl font-black text-slate-900 mt-6 mb-3">$1</h1>');
    
    // Bold & Italic
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // Quotes
    html = html.replace(/^&gt; (.*?)$/gm, '<blockquote class="border-l-4 border-slate-300 pl-4 py-1 my-3 bg-slate-50 text-slate-600 italic rounded-r">$1</blockquote>');
    
    // Lists
    html = html.replace(/^- (.*?)$/gm, '<li class="ml-4 list-disc text-slate-700 my-1">$1</li>');
    
    // Links
    html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-600 underline font-semibold hover:text-blue-800">$1</a>');

    // Paragraphs / Newlines
    html = html.split('\n').map(para => {
      if (para.trim().startsWith('<h') || para.trim().startsWith('<blockquote') || para.trim().startsWith('<li')) {
        return para;
      }
      return para.trim() ? `<p class="text-slate-700 leading-relaxed mb-4">${para}</p>` : '';
    }).join('\n');

    return html;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert(t("media.titleRequired"));
      return;
    }

    try {
      if (viewMode === "add") {
        const payload = {
          title: formData.title,
          subtitle: formData.subtitle,
          content: formData.content,
          titleEn: formData.titleEn,
          subtitleEn: formData.subtitleEn,
          contentEn: formData.contentEn,
          category: formData.category,
          status: formData.status,
          author: formData.author,
          publishDate: formData.publishDate,
          featured: formData.featured,
          featuredImage: imagePreview || undefined,
          tags: [] // removed tags block, defaults to empty array
        };
        await api.news.create(payload);
      } else if (viewMode === "edit" && editingNews) {
        const payload = {
          title: formData.title,
          subtitle: formData.subtitle,
          content: formData.content,
          titleEn: formData.titleEn,
          subtitleEn: formData.subtitleEn,
          contentEn: formData.contentEn,
          category: formData.category,
          status: formData.status,
          author: formData.author,
          publishDate: formData.publishDate,
          featured: formData.featured,
          featuredImage: imagePreview || undefined,
          tags: []
        };
        await api.news.update(editingNews.id, payload);
      }
      
      await fetchNews();
      setViewMode("list");
    } catch (err) {
      alert(t("news.saveError", { msg: (err as Error).message }));
    }
  };

  if (loading && viewMode === 'list') {
    return (
      <div className={`p-8 flex flex-col items-center justify-center min-h-[400px]${km}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0A3D91] mb-4" />
        <p className="text-sm text-slate-500 font-bold uppercase tracking-wider animate-pulse">{t("news.loading")}</p>
      </div>
    );
  }

  if (viewMode === "add" || viewMode === "edit") {
    return (
      <div className={`p-4 md:p-8 max-w-6xl mx-auto space-y-6 flex flex-col min-h-full animate-fadeIn${km}`}>
        {/* Header */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className="p-2.5 bg-white hover:bg-muted text-primary border border-border/80 rounded-xl transition-all active:scale-95 shadow-sm"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-foreground uppercase">
                {t(viewMode === "edit" ? "news.editTitle" : "news.createTitle")}
              </h1>
              <p className="text-sm text-muted-foreground mt-1 font-medium">
                {t(viewMode === "edit" ? "news.editHint" : "news.createHint")}
              </p>
            </div>
          </div>
        </header>

        {/* Form Content */}
        <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Columns: Form Inputs */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Article Content Info Card */}
            <div className="card-premium">
              <h2 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                <span>{t("news.general")}</span>
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                    {t("news.f.title")} <span className="text-secondary">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    placeholder={t("news.ph.title")}
                    className="input-premium font-semibold text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                    {t("news.f.subtitle")}
                  </label>
                  <input
                    type="text"
                    value={formData.subtitle}
                    onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                    placeholder={t("news.ph.subtitle")}
                    className="input-premium font-medium text-slate-700"
                  />
                </div>
              </div>
            </div>

            {/* FULL CONTENT RICH EDITOR */}
            <div className="card-premium flex flex-col">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 border-b border-slate-100 pb-3">
                <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  <span>{t("news.editor")}</span>
                </h2>
                
                {/* Editor Mode Tabs */}
                <div className="flex bg-slate-100 rounded-lg p-0.5 border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setEditorTab("write")}
                    className={`px-4 py-1.5 rounded-md text-xs font-black uppercase tracking-wider transition-all ${
                      editorTab === "write" 
                        ? "bg-white text-slate-800 shadow" 
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    {t("news.write")}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditorTab("preview")}
                    className={`px-4 py-1.5 rounded-md text-xs font-black uppercase tracking-wider transition-all ${
                      editorTab === "preview" 
                        ? "bg-white text-slate-800 shadow" 
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    {t("news.preview")}
                  </button>
                </div>
              </div>

              {/* Formatting Toolbar - only visible in Write mode */}
              {editorTab === "write" && (
                <div className="flex flex-wrap gap-1 mb-3 p-1.5 bg-slate-50 border border-slate-200/80 rounded-xl">
                  <button
                    type="button"
                    onClick={() => insertFormat("# ")}
                    title={t("media.tb.h1")}
                    className="p-2 hover:bg-slate-200 rounded-lg text-slate-600 transition-colors"
                  >
                    <Heading className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertFormat("**%s**", t("media.boldText"))}
                    title={t("media.tb.bold")}
                    className="p-2 hover:bg-slate-200 rounded-lg text-slate-600 transition-colors"
                  >
                    <Bold className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertFormat("*%s*", t("media.italicText"))}
                    title={t("media.tb.italic")}
                    className="p-2 hover:bg-slate-200 rounded-lg text-slate-600 transition-colors"
                  >
                    <Italic className="w-4 h-4" />
                  </button>
                  <div className="w-px h-6 bg-slate-200 mx-1 align-middle self-center" />
                  <button
                    type="button"
                    onClick={() => insertFormat("- ")}
                    title={t("media.tb.list")}
                    className="p-2 hover:bg-slate-200 rounded-lg text-slate-600 transition-colors"
                  >
                    <List className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertFormat("> ")}
                    title={t("media.tb.quote")}
                    className="p-2 hover:bg-slate-200 rounded-lg text-slate-600 transition-colors"
                  >
                    <Quote className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertFormat(`[${t("media.linkText")}](https://)`)}
                    title={t("media.tb.link")}
                    className="p-2 hover:bg-slate-200 rounded-lg text-slate-600 transition-colors"
                  >
                    <Link2 className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Editor Workspace */}
              <div className="flex-1 min-h-[300px]">
                {editorTab === "write" ? (
                  <textarea
                    ref={textareaRef}
                    rows={15}
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    required
                    placeholder={t("news.ph.content")}
                    className="w-full bg-white border border-border/80 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 shadow-inner transition-all resize-y min-h-[320px] font-mono leading-relaxed"
                  />
                ) : (
                  <div 
                    className="w-full border border-border/60 bg-slate-50/50 rounded-xl px-5 py-4 min-h-[320px] overflow-y-auto text-left prose max-w-none"
                    dangerouslySetInnerHTML={{ __html: renderPreviewHTML(formData.content) }}
                  />
                )}
              </div>
            </div>
            {/* English version for international fans (optional) */}
            <div className="card-premium">
              <h2 className="text-base font-bold text-foreground mb-1 flex items-center gap-2">
                <Globe className="w-5 h-5 text-primary" />
                <span>{t("news.en.title")}</span>
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                {t("news.en.hint")}
              </p>
              <div className="space-y-4">
                <div>
                  <label htmlFor="news-title-en" className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">{t("news.en.f.title")}</label>
                  <input
                    id="news-title-en"
                    type="text"
                    value={formData.titleEn}
                    onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })}
                    placeholder={t("news.en.ph.title")}
                    className="input-premium font-semibold text-slate-800"
                  />
                </div>
                <div>
                  <label htmlFor="news-subtitle-en" className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">{t("news.en.f.summary")}</label>
                  <input
                    id="news-subtitle-en"
                    type="text"
                    value={formData.subtitleEn}
                    onChange={(e) => setFormData({ ...formData, subtitleEn: e.target.value })}
                    placeholder={t("news.en.ph.summary")}
                    className="input-premium font-medium text-slate-700"
                  />
                </div>
                <div>
                  <label htmlFor="news-content-en" className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">{t("news.en.f.text")}</label>
                  <textarea
                    id="news-content-en"
                    rows={10}
                    value={formData.contentEn}
                    onChange={(e) => setFormData({ ...formData, contentEn: e.target.value })}
                    placeholder={t("news.en.ph.text")}
                    className="w-full bg-white border border-border/80 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all resize-y min-h-[200px] leading-relaxed"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Settings & Publish Options */}
          <div className="space-y-6">
            {/* Publishing Settings */}
            <div className="card-premium">
              <h2 className="text-base font-bold text-foreground mb-4">{t("news.publishing")}</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                    {t("news.f.category")}
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-white border border-border/80 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-800 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 shadow-sm transition-all cursor-pointer"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{categoryLabel(cat)}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                    {t("media.f.status")}
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full bg-white border border-border/80 rounded-xl px-4 py-2.5 text-sm font-semibold text-foreground focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 shadow-sm transition-all cursor-pointer"
                  >
                    <option value="Draft">{t("media.status.Draft")}</option>
                    <option value="Published">{t("media.status.Published")}</option>
                    <option value="Archived">{t("media.status.Archived")}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                    {t("news.f.date")}
                  </label>
                  <input
                    type="date"
                    value={formData.publishDate}
                    onChange={(e) => setFormData({ ...formData, publishDate: e.target.value })}
                    required
                    className="w-full bg-white border border-border/80 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-800 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 shadow-sm transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                    {t("news.f.author")}
                  </label>
                  <input
                    type="text"
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    required
                    placeholder={t("news.ph.author")}
                    className="input-premium font-semibold text-slate-800"
                  />
                </div>

                {editingNews && (
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">
                      {t("media.f.views")}
                    </label>
                    <div className="flex items-center gap-1 text-slate-600 text-xs font-bold bg-slate-100 px-3 py-2 rounded-lg border border-slate-200 w-fit">
                      <Eye className="w-3.5 h-3.5 text-primary" />
                      <span>{t("news.totalViews", { n: editingNews.views })}</span>
                    </div>
                  </div>
                )}

                {/* Featured Switch */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <div>
                    <p className="text-xs font-black text-slate-700 uppercase tracking-wide">{t("news.featured")}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{t("news.featuredHint")}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.featured}
                      onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* Featured Image upload */}
            <div className="card-premium">
              <h2 className="text-base font-bold text-foreground mb-4">{t("news.banner")}</h2>
              
              {imagePreview ? (
                <div className="relative rounded-xl overflow-hidden border border-border bg-slate-900 aspect-video group">
                  <img
                    src={imagePreview}
                    alt={t("media.preview")}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      type="button"
                      onClick={removeImage}
                      className="p-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-lg transition-transform active:scale-95"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ) : (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-border hover:border-primary/50 hover:bg-muted/10 rounded-xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center aspect-video group"
                >
                  <ImageIcon className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors mb-2" />
                  <span className="text-xs font-bold text-foreground">{t("news.uploadBanner")}</span>
                  <span className="text-[10px] text-muted-foreground mt-1">{t("media.imageHint")}</span>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                    accept="image/*"
                    className="hidden"
                  />
                </div>
              )}
            </div>

            {/* Save & Cancel Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className="flex-1 px-4 py-3 bg-white hover:bg-red-50 text-red-600 border border-red-200 hover:border-red-300 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 active:scale-95 shadow-sm"
              >
                <X className="w-4 h-4" />
                <span>{t("common.cancel")}</span>
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-3 bg-[#0A3D91] hover:bg-blue-800 text-white rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 active:scale-95 shadow-lg shadow-blue-900/10 hover:shadow-xl hover:shadow-blue-900/20 border border-transparent"
              >
                <CheckCircle className="w-4 h-4" />
                <span>{t("news.save")}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className={`p-4 md:p-8 space-y-6 animate-fadeIn${km}`}>
      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">{t("news.heading")}</h1>
          <p className="text-sm text-muted-foreground mt-1 font-medium">{t("news.intro")}</p>
        </div>
        <button
          onClick={handleAddNews}
          className="btn-secondary py-2.5 px-5"
        >
          <Plus className="w-4 h-4" />
          {t("news.add")}
        </button>
      </header>

      {/* Search & Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            placeholder={t("news.search")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-border/80 rounded-xl pl-11 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 shadow-sm transition-all"
          />
        </div>
        <div className="flex gap-3">
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 bg-white border border-border/80 rounded-xl text-sm font-medium text-foreground focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 shadow-sm hover:border-slate-300 transition-all cursor-pointer min-w-[140px]"
          >
            <option value="all">{t("media.allStatus")}</option>
            <option value="Draft">{t("media.status.Draft")}</option>
            <option value="Published">{t("media.status.Published")}</option>
            <option value="Archived">{t("media.status.Archived")}</option>
          </select>

          <select 
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2.5 bg-white border border-border/80 rounded-xl text-sm font-medium text-foreground focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 shadow-sm hover:border-slate-300 transition-all cursor-pointer min-w-[140px]"
          >
            <option value="all">{t("media.allCategories")}</option>
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{categoryLabel(cat)}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredNews.map((article) => {
          return (
            <div 
              key={article.id} 
              className="bg-white rounded-2xl border border-border/75 overflow-hidden shadow-sm hover:shadow-xl hover:border-primary/20 hover:-translate-y-1.5 transition-all duration-300 group flex flex-col cursor-pointer"
              onClick={() => handleEditNews(article)}
            >
              {/* Image Banner Section */}
              <div className="h-44 relative overflow-hidden bg-muted flex-shrink-0">
                <img 
                  src={article.featuredImage || "https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?ixlib=rb-4.0.3&w=800&q=80"} 
                  alt={article.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
                
                {/* Badge Overlays */}
                <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                  <div className="px-2.5 py-0.5 bg-white/10 border border-white/20 text-white rounded-full text-[10px] font-bold shadow-sm backdrop-blur-md uppercase">
                    {categoryLabel(article.category)}
                  </div>
                  
                  <div className={`badge-premium ${
                    article.status === 'Published' ? 'badge-emerald' : 
                    article.status === 'Draft' ? 'badge-amber' : 'badge-red'
                  }`}>
                    <span className={`badge-dot ${
                      article.status === 'Published' ? 'bg-emerald-500' : 
                      article.status === 'Draft' ? 'bg-amber-500' : 'bg-red-500'
                    }`} />
                    <span className="text-[10px] font-bold uppercase">{statusLabel(article.status)}</span>
                  </div>
                </div>
                
                {/* Action Overlays on Hover */}
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-200 flex gap-2 translate-y-[-5px] group-hover:translate-y-0">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditNews(article);
                    }}
                    className="p-2 bg-white/95 hover:bg-white text-primary border border-border/40 rounded-xl shadow-md backdrop-blur-md transition-all duration-150 hover:scale-105 active:scale-95"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(article.id);
                    }}
                    className="p-2 bg-red-50/95 hover:bg-red-500 hover:text-white text-secondary border border-red-100 rounded-xl shadow-md backdrop-blur-md transition-all duration-150 hover:scale-105 active:scale-95"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              {/* Card Content Section */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors duration-200 tracking-tight leading-tight line-clamp-2 pr-2">
                      {article.title}
                    </h3>
                    {article.featured && (
                      <span className="px-2 py-0.5 bg-amber-100 border border-amber-200 text-amber-700 rounded-md text-[9px] font-black uppercase flex-shrink-0">
                        {t("news.featuredBadge")}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground font-medium line-clamp-2 mb-4">
                    {article.subtitle}
                  </p>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-muted/15 p-3 rounded-xl border border-border/40 hover:bg-muted/20 hover:border-border/60 transition-all duration-200 flex flex-col justify-between h-[65px]">
                      <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{t("news.author")}</div>
                      <div className="text-xs font-semibold text-foreground line-clamp-1">{article.author}</div>
                    </div>
                    <div className="bg-muted/15 p-3 rounded-xl border border-border/40 hover:bg-muted/20 hover:border-border/60 transition-all duration-200 flex flex-col justify-between h-[65px]">
                      <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{t("media.views")}</div>
                      <div className="flex items-center gap-1 text-primary">
                        <Eye className="w-3.5 h-3.5 shrink-0" />
                        <span className="text-xs font-bold">{lang === "km" ? khmerDigits(article.views.toLocaleString()) : article.views.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  {/* Date Row */}
                  <div className="flex items-center justify-between text-xs text-muted-foreground font-medium pt-3 border-t border-border/50">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 shrink-0" />
                      {article.publishDate}
                    </span>
                    <span className="text-primary group-hover:text-secondary font-semibold flex items-center gap-1 transition-colors">
                      {t("news.read")}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredNews.length === 0 && (
        <div className="text-center py-16 bg-white rounded-2xl border border-border/60 shadow-sm">
          <div className="w-16 h-16 bg-muted/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <Newspaper className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-bold text-foreground tracking-tight mb-1">{t("news.emptyTitle")}</h3>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            {t("news.emptyText")}
          </p>
        </div>
      )}
    </div>
  );
}
