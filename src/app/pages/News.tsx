import { useState, useRef } from "react";
import { Link } from "react-router";
import { Plus, Search, Newspaper, Calendar, Eye, Edit2, Trash2, Image as ImageIcon, FileText, CheckCircle, Clock, XCircle, Upload, X, ArrowLeft, Save, ChevronDown } from "lucide-react";
import { usePermissions } from "../hooks/usePermissions";

interface NewsArticle {
  id: string;
  title: string;
  subtitle: string;
  content: string;
  author: string;
  publishDate: string;
  status: "Draft" | "Published" | "Archived";
  category: string;
  featuredImage?: string;
  views: number;
  tags: string[];
}

const MOCK_NEWS: NewsArticle[] = [
  {
    id: "1",
    title: "Kun Khmer National Championship 2026 Kicks Off This Weekend",
    subtitle: "The premier championship featuring top fighters across eight weight divisions",
    content: "The highly anticipated Kun Khmer National Championship 2026 begins this Saturday at the National Olympic Stadium. Featuring 32 matches across multiple weeks...",
    author: "Sok Pheakdey",
    publishDate: "2026-04-25",
    status: "Published",
    category: "Championship",
    featuredImage: "https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?ixlib=rb-4.0.3&w=800&q=80",
    views: 1245,
    tags: ["Championship", "National", "Tournament"]
  },
  {
    id: "2",
    title: "New Weight Division Rules Announced for 2026 Season",
    subtitle: "Official guidelines and regulations for all competitive divisions",
    content: "The Kun Khmer Federation has announced updated weight division rules for the 2026 competitive season. These changes aim to ensure fair competition...",
    author: "Chea Sopheap",
    publishDate: "2026-04-20",
    status: "Published",
    category: "Regulations",
    featuredImage: "https://images.unsplash.com/photo-1555597673-b21d5c935865?ixlib=rb-4.0.3&w=800&q=80",
    views: 892,
    tags: ["Rules", "Weight Division", "Regulations"]
  },
  {
    id: "3",
    title: "Rising Star: Interview with Champion Kem Sitha",
    subtitle: "Exclusive conversation with the lightweight division champion",
    content: "We sat down with reigning lightweight champion Kem Sitha to discuss his journey, training regimen, and upcoming title defense...",
    author: "Lim Dara",
    publishDate: "2026-04-18",
    status: "Published",
    category: "Interview",
    featuredImage: "https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?ixlib=rb-4.0.3&w=800&q=80",
    views: 2103,
    tags: ["Interview", "Champion", "Fighter Profile"]
  },
  {
    id: "4",
    title: "Youth Development Program Expands to 5 New Provinces",
    subtitle: "Bringing traditional Kun Khmer training to communities nationwide",
    content: "The Kun Khmer Federation's youth development initiative is expanding its reach with new training centers opening in five additional provinces...",
    author: "Sok Pheakdey",
    publishDate: "2026-04-15",
    status: "Published",
    category: "Youth Development",
    featuredImage: "https://images.unsplash.com/photo-1555597673-b21d5c935865?ixlib=rb-4.0.3&w=800&q=80",
    views: 645,
    tags: ["Youth", "Training", "Development"]
  },
  {
    id: "6",
    title: "Charity Fight Night Raises $50,000 for Local Communities",
    subtitle: "Successful fundraising event supports education and healthcare",
    content: "Last weekend's charity fight night exceeded expectations, raising over $50,000 for local community development projects focused on education...",
    author: "Lim Dara",
    publishDate: "2026-04-10",
    status: "Published",
    category: "Charity",
    featuredImage: "https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?ixlib=rb-4.0.3&w=800&q=80",
    views: 1876,
    tags: ["Charity", "Fundraising", "Community"]
  }
];

export function News() {
  const permissions = usePermissions();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [news, setNews] = useState<NewsArticle[]>(MOCK_NEWS);
  const [viewMode, setViewMode] = useState<'list' | 'add' | 'edit'>('list');
  const [editingNews, setEditingNews] = useState<NewsArticle | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    content: "",
    category: "",
    status: "Draft" as "Draft" | "Published" | "Archived",
    tags: ""
  });

  // Filter news
  const filteredNews = news.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          article.subtitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          article.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          article.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === "all" || article.status === statusFilter;
    const matchesCategory = categoryFilter === "all" || article.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Get unique categories
  const categories = Array.from(new Set(news.map(article => article.category)));

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

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this news article?")) {
      setNews(news.filter(article => article.id !== id));
    }
  };

  const handleAddNews = () => {
    setFormData({
      title: "",
      subtitle: "",
      content: "",
      category: "",
      status: "Draft",
      tags: ""
    });
    setEditingNews(null);
    setImagePreview(null);
    setViewMode("add");
  };

  const handleEditNews = (article: NewsArticle) => {
    setFormData({
      title: article.title,
      subtitle: article.subtitle,
      content: article.content,
      category: article.category,
      status: article.status,
      tags: article.tags.join(", ")
    });
    setEditingNews(article);
    setImagePreview(article.featuredImage || null);
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

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert("Title is required");
      return;
    }

    const tagsArray = formData.tags
      .split(",")
      .map(tag => tag.trim())
      .filter(Boolean);

    if (viewMode === "add") {
      const newArticle: NewsArticle = {
        id: `n${Date.now()}`,
        title: formData.title,
        subtitle: formData.subtitle,
        content: formData.content,
        category: formData.category || "General",
        status: formData.status,
        tags: tagsArray,
        author: "Sok Pheakdey",
        publishDate: new Date().toISOString().split("T")[0],
        featuredImage: imagePreview || undefined,
        views: 0
      };
      setNews([newArticle, ...news]);
    } else if (viewMode === "edit" && editingNews) {
      setNews(news.map(art => {
        if (art.id === editingNews.id) {
          return {
            ...art,
            title: formData.title,
            subtitle: formData.subtitle,
            content: formData.content,
            category: formData.category || "General",
            status: formData.status,
            tags: tagsArray,
            featuredImage: imagePreview || undefined
          };
        }
        return art;
      }));
    }

    setViewMode("list");
  };

  if (viewMode === "add" || viewMode === "edit") {
    return (
      <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6 flex flex-col min-h-full animate-fadeIn">
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
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                {viewMode === "edit" ? "Edit Article" : "Add New Article"}
              </h1>
              <p className="text-sm text-muted-foreground mt-1 font-medium">
                {viewMode === "edit" ? "Edit details of the published news article" : "Publish a new Kun Khmer federation news article"}
              </p>
            </div>
          </div>
        </header>

        {/* Form Content */}
        <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Columns: Form Inputs */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <div className="card-premium">
              <h2 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                <span>Article Content</span>
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                    Article Title <span className="text-secondary">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    placeholder="Enter article title"
                    className="input-premium font-semibold text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                    Subtitle
                  </label>
                  <input
                    type="text"
                    name="subtitle"
                    value={formData.subtitle}
                    onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                    placeholder="Enter short description or subtitle"
                    className="input-premium font-medium text-slate-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                    Content Body <span className="text-secondary">*</span>
                  </label>
                  <textarea
                    rows={12}
                    name="content"
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    required
                    placeholder="Write the full content of the news article here..."
                    className="input-premium font-medium text-slate-700 resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Categorization & Metadata */}
            <div className="card-premium">
              <h2 className="text-base font-bold text-foreground mb-4">Metadata & Classification</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                    Category <span className="text-secondary">*</span>
                  </label>
                  <div className="relative">
                    <select
                      name="category"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      required
                      className="input-premium font-semibold text-slate-800 cursor-pointer appearance-none animate-fadeIn"
                    >
                      <option value="">Select category</option>
                      <option value="Championship">Championship</option>
                      <option value="Regulations">Regulations</option>
                      <option value="Interview">Interview</option>
                      <option value="Youth Development">Youth Development</option>
                      <option value="International">International</option>
                      <option value="Charity">Charity</option>
                      <option value="General">General</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-muted-foreground">
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                    Publication Status <span className="text-secondary">*</span>
                  </label>
                  <div className="relative">
                    <select
                      name="status"
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                      required
                      className="input-premium font-semibold text-slate-800 cursor-pointer appearance-none animate-fadeIn"
                    >
                      <option value="Draft">Draft</option>
                      <option value="Published">Published</option>
                      <option value="Archived">Archived</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-muted-foreground">
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                    Tags (comma-separated)
                  </label>
                  <input
                    type="text"
                    name="tags"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    placeholder="Championship, National, Tournament"
                    className="input-premium font-semibold text-slate-800"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Upload Image & Actions */}
          <div className="lg:col-span-1 space-y-6">
            {/* Featured Image upload */}
            <div className="card-premium">
              <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                <Upload className="w-4 h-4 text-primary" />
                <span>Featured Image</span>
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-40 border border-border/80 border-dashed rounded-xl cursor-pointer bg-muted/10 hover:bg-muted/20 transition-all duration-200">
                    <div className="flex flex-col items-center justify-center pt-4 pb-4 px-2 text-center">
                      <Upload className="w-7 h-7 text-muted-foreground mb-2" />
                      <p className="text-xs font-semibold text-slate-700">
                        <span className="text-primary hover:underline">Click to upload</span> or drag
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">PNG, JPG (MAX. 10MB)</p>
                    </div>
                    <input 
                      type="file" 
                      className="hidden" 
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                  </label>
                </div>

                {imagePreview ? (
                  <div className="relative w-full h-40 rounded-xl overflow-hidden border border-border/60 shadow-sm animate-fadeIn">
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-2 right-2 p-1.5 bg-red-500/90 hover:bg-red-600 text-white rounded-lg transition-colors shadow-md"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="h-40 rounded-xl bg-muted/10 border border-border/40 flex items-center justify-center text-muted-foreground text-xs font-medium">
                    No image selected
                  </div>
                )}
              </div>
            </div>

            {/* Actions Card */}
            <div className="bg-white rounded-xl border border-border p-4 shadow-sm flex flex-col gap-3">
              <button
                type="submit"
                className="btn-primary w-full py-3"
              >
                <Save className="w-4 h-4" />
                {viewMode === "edit" ? "Save Changes" : "Publish Article"}
              </button>
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className="btn-outline w-full py-3"
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 flex flex-col min-h-full animate-fadeIn">
      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">News Management</h1>
          <p className="text-sm text-muted-foreground mt-1 font-medium">Create and publish Kun Khmer articles and federation news</p>
        </div>
        <button
          onClick={handleAddNews}
          className="btn-secondary py-2.5 px-5"
        >
          <Plus className="w-4 h-4" />
          Add Article
        </button>
      </header>

      {/* Search & Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            placeholder="Search articles by title, subtitle, author, or tag..."
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
            <option value="all">All Status</option>
            <option value="Draft">Draft</option>
            <option value="Published">Published</option>
            <option value="Archived">Archived</option>
          </select>

          <select 
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2.5 bg-white border border-border/80 rounded-xl text-sm font-medium text-foreground focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 shadow-sm hover:border-slate-300 transition-all cursor-pointer min-w-[140px]"
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
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
                    {article.category}
                  </div>
                  
                  <div className={`badge-premium ${
                    article.status === 'Published' ? 'badge-emerald' : 
                    article.status === 'Draft' ? 'badge-amber' : 'badge-red'
                  }`}>
                    <span className={`badge-dot ${
                      article.status === 'Published' ? 'bg-emerald-500' : 
                      article.status === 'Draft' ? 'bg-amber-500' : 'bg-red-500'
                    }`} />
                    <span className="text-[10px] font-bold uppercase">{article.status}</span>
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
                  <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors duration-200 tracking-tight leading-tight line-clamp-2 mb-1.5">
                    {article.title}
                  </h3>
                  <p className="text-xs text-muted-foreground font-medium line-clamp-2 mb-4">
                    {article.subtitle}
                  </p>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-muted/15 p-3 rounded-xl border border-border/40 hover:bg-muted/20 hover:border-border/60 transition-all duration-200 flex flex-col justify-between h-[65px]">
                      <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Author</div>
                      <div className="text-xs font-semibold text-foreground line-clamp-1">{article.author}</div>
                    </div>
                    <div className="bg-muted/15 p-3 rounded-xl border border-border/40 hover:bg-muted/20 hover:border-border/60 transition-all duration-200 flex flex-col justify-between h-[65px]">
                      <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Views</div>
                      <div className="flex items-center gap-1 text-primary">
                        <Eye className="w-3.5 h-3.5 shrink-0" />
                        <span className="text-xs font-bold">{article.views.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {article.tags.slice(0, 3).map(tag => (
                      <span key={tag} className="px-2 py-0.5 bg-muted text-muted-foreground rounded-full text-[10px] font-medium border border-border/40">
                        #{tag}
                      </span>
                    ))}
                  </div>

                  {/* Date Row */}
                  <div className="flex items-center justify-between text-xs text-muted-foreground font-medium pt-3 border-t border-border/50">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 shrink-0" />
                      {article.publishDate}
                    </span>
                    <span className="text-primary group-hover:text-secondary font-semibold flex items-center gap-1 transition-colors">
                      Read Article
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
          <h3 className="text-lg font-bold text-foreground tracking-tight mb-1">No Articles Found</h3>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            We couldn't find any news articles matching your search. Try adjusting your filters or search term.
          </p>
        </div>
      )}
    </div>
  );
}
