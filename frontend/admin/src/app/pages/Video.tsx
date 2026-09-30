import { useState, useRef, useEffect } from "react";
import { Link } from "react-router";
import { Plus, Search, Video as VideoIcon, Calendar, Eye, Edit2, Trash2, FileText, CheckCircle, Clock, XCircle, Upload, X, Play, User, Building2, ArrowLeft, Save, ChevronDown, Swords, Heading, Bold, Italic, List, Quote, Link2 } from "lucide-react";
import { usePermissions } from "../hooks/usePermissions";
import { api } from "../utils/api";
import { type TextKey, khmerDigits, useT } from "../i18n/program";

interface VideoItem {
  id: string;
  title: string;
  description: string;
  youtubeUrl?: string;
  duration: string;
  category: string;
  status: "Draft" | "Published" | "Archived";
  tags: string[];
  uploadDate: string;
  thumbnail?: string;
  views: number;
  fighterId?: string;
  clubId?: string;
  matchId?: string;
}

const CATEGORIES = [
  "Highlights",
  "Full Fights",
  "Interviews",
  "Behind the Scenes",
  "Training & Workouts",
  "Documentary",
  "General"
];

const STATUS_TEXT: Record<string, TextKey> = {
  Draft: "media.status.Draft",
  Published: "media.status.Published",
  Archived: "media.status.Archived",
};
/** Category names as shown; the stored value stays the English one. */
const CATEGORY_TEXT: Record<string, TextKey> = {
  Highlights: "vid.cat.Highlights",
  "Full Fights": "vid.cat.Full Fights",
  Interviews: "vid.cat.Interviews",
  "Behind the Scenes": "vid.cat.Behind the Scenes",
  "Training & Workouts": "vid.cat.Training & Workouts",
  Documentary: "vid.cat.Documentary",
  General: "vid.cat.General",
};

export function Video() {
  const { t, lang } = useT();
  // Khmer script: `km-text` (styles/theme.css) removes letter spacing and enlarges the tiny labels.
  const km = lang === "km" ? " km-text" : "";
  const categoryLabel = (c: string) => (CATEGORY_TEXT[c] ? t(CATEGORY_TEXT[c]) : c);
  const statusLabel = (v: string) => (STATUS_TEXT[v] ? t(STATUS_TEXT[v]) : v);
  const permissions = usePermissions();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Relations state lists
  const [fightersList, setFightersList] = useState<any[]>([]);
  const [clubsList, setClubsList] = useState<any[]>([]);
  const [matchesList, setMatchesList] = useState<any[]>([]);

  const [viewMode, setViewMode] = useState<'list' | 'add' | 'edit'>('list');
  const [editingVideo, setEditingVideo] = useState<VideoItem | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Editor configuration
  const [editorTab, setEditorTab] = useState<'write' | 'preview'>('write');

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    youtubeUrl: "",
    duration: "",
    category: "Highlights",
    status: "Draft" as "Draft" | "Published" | "Archived",
    fighterId: "",
    clubId: "",
    matchId: ""
  });

  const loadRelationsAndVideos = async () => {
    setLoading(true);
    try {
      const [vData, fData, cData, mData] = await Promise.all([
        api.videos.list(),
        api.fighters.list(),
        api.clubs.list(),
        api.matches.list()
      ]);

      // Mapped videos
      const mappedVideos = (vData || []).map((vid: any) => ({
        id: vid.id,
        title: vid.title,
        description: vid.description || "",
        youtubeUrl: vid.youtube_url || vid.youtubeUrl || "",
        duration: vid.duration || "00:00",
        category: vid.category || "General",
        status: vid.status || "Draft",
        tags: Array.isArray(vid.tags) ? vid.tags : (vid.tags ? (typeof vid.tags === 'string' ? JSON.parse(vid.tags) : vid.tags) : []),
        uploadDate: vid.created_at ? vid.created_at.split("T")[0] : new Date().toISOString().split("T")[0],
        thumbnail: vid.thumbnail || undefined,
        views: vid.views || 0,
        fighterId: vid.fighter_id || vid.fighterId || "",
        clubId: vid.club_id || vid.clubId || "",
        matchId: vid.match_id || vid.matchId || ""
      }));
      setVideos(mappedVideos);

      // Mapped relations
      setFightersList(fData || []);
      setClubsList(cData || []);
      setMatchesList(mData || []);
    } catch (err) {
      console.error("Failed to load video dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRelationsAndVideos();
  }, []);

  // Filter videos
  const filteredVideos = videos.filter(video => {
    const matchesSearch = video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          video.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || video.status === statusFilter;
    const matchesCategory = categoryFilter === "all" || video.category === categoryFilter;

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
    if (confirm(t("vid.deleteConfirm"))) {
      try {
        await api.videos.delete(id);
        setVideos(prev => prev.filter(video => video.id !== id));
      } catch (err) {
        alert(t("vid.deleteError", { msg: (err as Error).message }));
      }
    }
  };

  const handleAddVideo = () => {
    setFormData({
      title: "",
      description: "",
      youtubeUrl: "",
      duration: "",
      category: "Highlights",
      status: "Draft",
      fighterId: "",
      clubId: "",
      matchId: ""
    });
    setEditingVideo(null);
    setThumbnailPreview(null);
    setEditorTab("write");
    setViewMode("add");
  };

  const handleEditVideo = (video: VideoItem) => {
    setFormData({
      title: video.title,
      description: video.description,
      youtubeUrl: video.youtubeUrl || "",
      duration: video.duration,
      category: video.category,
      status: video.status,
      fighterId: video.fighterId || "",
      clubId: video.clubId || "",
      matchId: video.matchId || ""
    });
    setEditingVideo(video);
    setThumbnailPreview(video.thumbnail || null);
    setEditorTab("write");
    setViewMode("edit");
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeThumbnail = () => {
    setThumbnailPreview(null);
    if (thumbnailInputRef.current) {
      thumbnailInputRef.current.value = '';
    }
  };

  const handleMatchChange = (matchId: string) => {
    if (!matchId) {
      setFormData(prev => ({
        ...prev,
        matchId: "",
      }));
      return;
    }

    const match = matchesList.find(m => m.id === matchId);
    if (match) {
      // Auto-populate fighter and club involved
      setFormData(prev => ({
        ...prev,
        matchId,
        fighterId: match.fighter_a_id || match.fighterA?.id || prev.fighterId,
        clubId: match.fighterA?.club_id || match.fighterA?.clubId || prev.clubId
      }));
    }
  };

  // Helper to insert format syntax inside description editor
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

    const newDescription = text.substring(0, start) + replacement + text.substring(end);
    
    setFormData({ ...formData, description: newDescription });

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + replacement.length, start + replacement.length);
    }, 50);
  };

  // Simple Markdown-like formatter for preview display
  const renderPreviewHTML = (text: string) => {
    if (!text) return `<p class="text-slate-400 italic">${t("vid.noDescription")}</p>`;
    
    let html = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    // Headings
    html = html.replace(/^### (.*?)$/gm, '<h3 class="text-base font-black text-slate-800 mt-3 mb-1.5">$1</h3>');
    html = html.replace(/^## (.*?)$/gm, '<h2 class="text-lg font-black text-slate-900 mt-4 mb-2">$1</h2>');
    html = html.replace(/^# (.*?)$/gm, '<h1 class="text-xl font-black text-slate-900 mt-5 mb-2">$1</h1>');
    
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
      return para.trim() ? `<p class="text-slate-700 leading-relaxed mb-3">${para}</p>` : '';
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
      const payload = {
        title: formData.title,
        description: formData.description,
        youtubeUrl: formData.youtubeUrl || undefined,
        duration: formData.duration || "00:00",
        category: formData.category,
        status: formData.status,
        tags: [], // removed tags input, defaults to empty array
        thumbnail: thumbnailPreview || undefined,
        fighterId: formData.fighterId || undefined,
        clubId: formData.clubId || undefined,
        matchId: formData.matchId || undefined
      };

      if (viewMode === "add") {
        await api.videos.create(payload);
      } else if (viewMode === "edit" && editingVideo) {
        await api.videos.update(editingVideo.id, payload);
      }

      await loadRelationsAndVideos();
      setViewMode("list");
    } catch (err) {
      alert(t("vid.saveError", { msg: (err as Error).message }));
    }
  };

  const getFighterById = (id?: string) => {
    if (!id) return null;
    return fightersList.find(f => f.id === id);
  };

  const getClubById = (id?: string) => {
    if (!id) return null;
    return clubsList.find(c => c.id === id);
  };

  const getMatchById = (id?: string) => {
    if (!id) return null;
    return matchesList.find(m => m.id === id);
  };

  if (loading && viewMode === 'list') {
    return (
      <div className={`p-8 flex flex-col items-center justify-center min-h-[400px]${km}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0A3D91] mb-4" />
        <p className="text-sm text-slate-500 font-bold uppercase tracking-wider animate-pulse">{t("vid.loading")}</p>
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
                {t(viewMode === "edit" ? "vid.editTitle" : "vid.createTitle")}
              </h1>
              <p className="text-sm text-muted-foreground mt-1 font-medium">
                {t(viewMode === "edit" ? "vid.editHint" : "vid.createHint")}
              </p>
            </div>
          </div>
        </header>

        {/* Form Content */}
        <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Columns: Form Inputs */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* General Video Details */}
            <div className="card-premium">
              <h2 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
                <VideoIcon className="w-5 h-5 text-primary" />
                <span>{t("vid.info")}</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                    {t("vid.f.title")} <span className="text-secondary">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    placeholder={t("vid.ph.title")}
                    className="input-premium font-semibold text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                    {t("vid.f.url")}
                  </label>
                  <input
                    type="url"
                    value={formData.youtubeUrl}
                    onChange={(e) => setFormData({ ...formData, youtubeUrl: e.target.value })}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="input-premium font-semibold text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                    {t("vid.f.duration")}
                  </label>
                  <input
                    type="text"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    required
                    placeholder={t("vid.ph.duration")}
                    className="input-premium font-semibold text-slate-800"
                  />
                </div>
              </div>
            </div>

            {/* DESCRIPTION RICH EDITOR TOOL */}
            <div className="card-premium flex flex-col">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 border-b border-slate-100 pb-3">
                <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  <span>{t("vid.editor")}</span>
                </h2>
                
                {/* Editor Tabs */}
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
                    {t("vid.write")}
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
                    {t("media.preview")}
                  </button>
                </div>
              </div>

              {/* Formatting Toolbar */}
              {editorTab === "write" && (
                <div className="flex flex-wrap gap-1 mb-3 p-1.5 bg-slate-50 border border-slate-200/80 rounded-xl">
                  <button
                    type="button"
                    onClick={() => insertFormat("# ")}
                    title={t("media.tb.heading")}
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

              {/* Editor Area */}
              <div className="flex-1 min-h-[220px]">
                {editorTab === "write" ? (
                  <textarea
                    ref={textareaRef}
                    rows={8}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder={t("vid.ph.description")}
                    className="w-full bg-white border border-border/80 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 shadow-inner transition-all resize-y min-h-[200px] font-mono leading-relaxed"
                  />
                ) : (
                  <div 
                    className="w-full border border-border/60 bg-slate-50/50 rounded-xl px-5 py-4 min-h-[200px] overflow-y-auto text-left prose max-w-none"
                    dangerouslySetInnerHTML={{ __html: renderPreviewHTML(formData.description) }}
                  />
                )}
              </div>
            </div>

            {/* Competitor & Match Associations (New separate section) */}
            <div className="card-premium">
              <h2 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
                <Swords className="w-5 h-5 text-primary" />
                <span>{t("vid.links")}</span>
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                    {t("vid.f.match")}
                  </label>
                  <select
                    value={formData.matchId}
                    onChange={(e) => handleMatchChange(e.target.value)}
                    className="w-full bg-white border border-border/80 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-800 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 shadow-sm transition-all cursor-pointer"
                  >
                    <option value="">{t("vid.noMatch")}</option>
                    {matchesList.map(match => {
                      const fA = getFighterById(match.fighter_a_id || match.fighterA?.id);
                      const fB = getFighterById(match.fighter_b_id || match.fighterB?.id);
                      return (
                        <option key={match.id} value={match.id}>
                          {t("vid.matchOption", { a: fA?.name || t("vid.fighterA"), b: fB?.name || t("vid.fighterB"), date: match.date || t("vid.tbd") })}
                        </option>
                      );
                    })}
                  </select>
                  <p className="text-[10px] text-muted-foreground mt-1">{t("vid.matchHint")}</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                    {t("vid.f.fighter")}
                  </label>
                  <select
                    value={formData.fighterId}
                    onChange={(e) => setFormData({ ...formData, fighterId: e.target.value })}
                    className="w-full bg-white border border-border/80 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-800 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 shadow-sm transition-all cursor-pointer"
                  >
                    <option value="">{t("vid.noFighter")}</option>
                    {fightersList.map(fighter => (
                      <option key={fighter.id} value={fighter.id}>
                        {fighter.name}
                      </option>
                    ))}
                  </select>
                  <p className="text-[10px] text-muted-foreground mt-1">{t("vid.fighterHint")}</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                    {t("vid.f.club")}
                  </label>
                  <select
                    value={formData.clubId}
                    onChange={(e) => setFormData({ ...formData, clubId: e.target.value })}
                    className="w-full bg-white border border-border/80 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-800 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 shadow-sm transition-all cursor-pointer"
                  >
                    <option value="">{t("vid.noClub")}</option>
                    {clubsList.map(club => (
                      <option key={club.id} value={club.id}>
                        {club.name}
                      </option>
                    ))}
                  </select>
                  <p className="text-[10px] text-muted-foreground mt-1">{t("vid.clubHint")}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Settings & Actions */}
          <div className="space-y-6">
            {/* Metadata Settings */}
            <div className="card-premium">
              <h2 className="text-base font-bold text-foreground mb-4">{t("vid.publishing")}</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                    {t("vid.f.category")}
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



                {editingVideo && (
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">
                      {t("media.f.views")}
                    </label>
                    <div className="flex items-center gap-1 text-slate-600 text-xs font-bold bg-slate-100 px-3 py-2 rounded-lg border border-slate-200 w-fit">
                      <Eye className="w-3.5 h-3.5 text-primary" />
                      <span>{t("vid.viewsRecorded", { n: editingVideo.views })}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Thumbnail upload */}
            <div className="card-premium">
              <h2 className="text-base font-bold text-foreground mb-4">{t("vid.thumbnail")}</h2>
              
              {thumbnailPreview ? (
                <div className="relative rounded-xl overflow-hidden border border-border bg-slate-900 aspect-video group">
                  <img
                    src={thumbnailPreview}
                    alt={t("vid.thumbnailAlt")}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      type="button"
                      onClick={removeThumbnail}
                      className="p-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-lg transition-transform active:scale-95"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ) : (
                <div 
                  onClick={() => thumbnailInputRef.current?.click()}
                  className="border-2 border-dashed border-border hover:border-primary/50 hover:bg-muted/10 rounded-xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center aspect-video group"
                >
                  <Upload className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors mb-2" />
                  <span className="text-xs font-bold text-foreground">{t("vid.uploadThumbnail")}</span>
                  <span className="text-[10px] text-muted-foreground mt-1">{t("media.imageHint")}</span>
                  <input
                    type="file"
                    ref={thumbnailInputRef}
                    onChange={handleThumbnailChange}
                    accept="image/*"
                    className="hidden"
                  />
                </div>
              )}
            </div>

            {/* Actions: Save & Cancel */}
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
                <span>{t("vid.save")}</span>
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
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">{t("vid.heading")}</h1>
          <p className="text-sm text-muted-foreground mt-1 font-medium">{t(filteredVideos.length === 1 ? "vid.introOne" : "vid.introMany", { n: filteredVideos.length })}</p>
        </div>
        <button
          onClick={handleAddVideo}
          className="btn-secondary py-2.5 px-5"
        >
          <Plus className="w-4 h-4" />
          {t("vid.add")}
        </button>
      </header>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            placeholder={t("vid.search")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-border/80 rounded-xl pl-11 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 shadow-sm transition-all"
          />
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2.5 bg-white border border-border/80 rounded-xl text-sm font-medium text-foreground focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 shadow-sm hover:border-slate-300 transition-all cursor-pointer min-w-[140px] appearance-none pr-10"
            >
              <option value="all">{t("media.allStatus")}</option>
              <option value="Draft">{t("media.status.Draft")}</option>
              <option value="Published">{t("media.status.Published")}</option>
              <option value="Archived">{t("media.status.Archived")}</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-muted-foreground">
              <ChevronDown className="w-4 h-4" />
            </div>
          </div>

          <div className="relative">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2.5 bg-white border border-border/80 rounded-xl text-sm font-medium text-foreground focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 shadow-sm hover:border-slate-300 transition-all cursor-pointer min-w-[140px] appearance-none pr-10"
            >
              <option value="all">{t("media.allCategories")}</option>
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{categoryLabel(cat)}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-muted-foreground">
              <ChevronDown className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVideos.map((video) => {
          const fighter = getFighterById(video.fighterId);
          const club = getClubById(video.clubId);
          const match = getMatchById(video.matchId);

          return (
            <div
              key={video.id}
              onClick={() => handleEditVideo(video)}
              className="bg-white rounded-2xl border border-border/75 overflow-hidden shadow-sm hover:shadow-xl hover:border-primary/20 hover:-translate-y-1.5 transition-all duration-300 group flex flex-col cursor-pointer"
            >
              {/* Thumbnail Section */}
              <div className="h-44 relative overflow-hidden bg-muted flex-shrink-0">
                {video.thumbnail ? (
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                ) : (
                  <div className="w-full h-full bg-slate-900 flex items-center justify-center">
                    <VideoIcon className="w-12 h-12 text-slate-700" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent" />
                
                {/* Play Button Overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 bg-white/95 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-md">
                    <Play className="w-5 h-5 text-primary ml-0.5 fill-current" />
                  </div>
                </div>

                {/* Badge Overlays */}
                <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                  <div className="px-2.5 py-0.5 bg-white/10 border border-white/20 text-white rounded-full text-[10px] font-bold shadow-sm backdrop-blur-md uppercase">
                    {categoryLabel(video.category)}
                  </div>
                  
                  <div className={`badge-premium ${
                    video.status === 'Published' ? 'badge-emerald' : 
                    video.status === 'Draft' ? 'badge-amber' : 'badge-red'
                  }`}>
                    <span className={`badge-dot ${
                      video.status === 'Published' ? 'bg-emerald-500' : 
                      video.status === 'Draft' ? 'bg-amber-500' : 'bg-red-500'
                    }`} />
                    <span className="text-[10px] font-bold uppercase">{statusLabel(video.status)}</span>
                  </div>
                </div>

                <div className="absolute bottom-4 right-4 translate-y-[-28px] px-1.5 py-0.5 bg-black/70 text-white text-[10px] font-bold rounded">
                  {video.duration}
                </div>
                
                {/* Action Overlays on Hover */}
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-200 flex gap-2 translate-y-[-5px] group-hover:translate-y-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditVideo(video);
                    }}
                    className="p-2 bg-white/95 hover:bg-white text-primary border border-border/40 rounded-xl shadow-md backdrop-blur-md transition-all duration-150 hover:scale-105 active:scale-95"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(video.id);
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
                  <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors duration-200 tracking-tight leading-tight line-clamp-2 mb-1.5">
                    {video.title}
                  </h3>
                  <p className="text-xs text-muted-foreground font-medium line-clamp-2 mb-4">
                    {video.description}
                  </p>

                  {/* Fighter / Club / Match metadata box */}
                  {(fighter || club || match) && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {match && (
                        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-red-50 text-[#C8102E] border border-red-100 rounded-lg text-[10px] font-bold">
                          <Swords className="w-3 h-3" />
                          <span>{t("vid.matchBadge", { a: getFighterById(match.fighter_a_id || match.fighterA?.id)?.name ?? "", b: getFighterById(match.fighter_b_id || match.fighterB?.id)?.name ?? "" })}</span>
                        </div>
                      )}
                      {fighter && (
                        <div className="flex items-center gap-1 px-2.5 py-1 bg-purple-50 text-purple-700 border border-purple-100 rounded-lg text-[10px] font-bold">
                          <User className="w-3 h-3" />
                          <span>{fighter.name}</span>
                        </div>
                      )}
                      {club && (
                        <div className="flex items-center gap-1 px-2.5 py-1 bg-orange-50 text-orange-700 border border-orange-100 rounded-lg text-[10px] font-bold">
                          <Building2 className="w-3 h-3" />
                          <span>{club.name}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Metadatas */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-muted/15 p-3 rounded-xl border border-border/40 hover:bg-muted/20 hover:border-border/60 transition-all duration-200 flex flex-col justify-between h-[65px]">
                      <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{t("media.views")}</div>
                      <div className="flex items-center gap-1 text-primary">
                        <Eye className="w-3.5 h-3.5 shrink-0" />
                        <span className="text-xs font-bold">{lang === "km" ? khmerDigits(video.views.toLocaleString()) : video.views.toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="bg-muted/15 p-3 rounded-xl border border-border/40 hover:bg-muted/20 hover:border-border/60 transition-all duration-200 flex flex-col justify-between h-[65px]">
                      <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{t("vid.uploaded")}</div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Calendar className="w-3.5 h-3.5 shrink-0" />
                        <span className="text-xs font-semibold">{video.uploadDate}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  {/* Play Action Row */}
                  <div className="flex items-center justify-between text-xs text-muted-foreground font-medium pt-3 border-t border-border/50">
                    <span className="text-primary group-hover:text-secondary font-semibold flex items-center gap-1 transition-colors">
                      {t("vid.watch")}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredVideos.length === 0 && (
        <div className="text-center py-16 bg-white rounded-2xl border border-border/60 shadow-sm col-span-full">
          <div className="w-16 h-16 bg-muted/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <VideoIcon className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-bold text-foreground tracking-tight mb-1">{t("vid.emptyTitle")}</h3>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            {t("vid.emptyText")}
          </p>
        </div>
      )}
    </div>
  );
}
