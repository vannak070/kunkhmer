import { useState, useRef } from "react";
import { Link } from "react-router";
import { Plus, Search, Newspaper, Calendar, Eye, Edit2, Trash2, Image as ImageIcon, FileText, CheckCircle, Clock, XCircle, Upload, X } from "lucide-react";
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
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingNews, setEditingNews] = useState<NewsArticle | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    setEditingNews(null);
    setImagePreview(null);
    setShowAddModal(true);
  };

  const handleEditNews = (article: NewsArticle) => {
    setEditingNews(article);
    setImagePreview(article.featuredImage || null);
    setShowAddModal(true);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F4F5F8] via-white to-[#F9FAFB]">
      <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-[#1A1A24] uppercase mb-3 leading-none">
              News Management
            </h1>
            <p className="text-[#707070] font-medium text-lg">
              Create and manage news articles • {filteredNews.length} {filteredNews.length === 1 ? 'article' : 'articles'} found
            </p>
          </div>

          <button
            onClick={handleAddNews}
            className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#C8102E] to-[#A00D24] hover:from-[#A00D24] hover:to-[#8A0B20] text-white px-8 py-4 rounded-2xl font-black uppercase tracking-wider transition-all shadow-xl hover:shadow-2xl hover:scale-[1.02]"
          >
            <Plus className="w-5 h-5" />
            Add News
          </button>
        </header>

        {/* Filters */}
        <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgba(0,0,0,0.08)] border border-[#E0E0E0]/50">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#707070]" />
              <input
                type="text"
                placeholder="Search articles, authors, tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#F4F5F8] border-2 border-[#E0E0E0] rounded-xl pl-12 pr-4 py-3.5 text-[#1A1A24] font-semibold focus:ring-2 focus:ring-[#0A3D91] focus:border-[#0A3D91] transition-all placeholder:text-[#B0B0B0]"
              />
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full bg-[#F4F5F8] border-2 border-[#E0E0E0] rounded-xl px-4 py-3.5 text-[#1A1A24] font-bold focus:ring-2 focus:ring-[#0A3D91] focus:border-[#0A3D91] transition-all"
              >
                <option value="all">All Status</option>
                <option value="Draft">Draft</option>
                <option value="Published">Published</option>
                <option value="Archived">Archived</option>
              </select>
            </div>

            {/* Category Filter */}
            <div>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full bg-[#F4F5F8] border-2 border-[#E0E0E0] rounded-xl px-4 py-3.5 text-[#1A1A24] font-bold focus:ring-2 focus:ring-[#0A3D91] focus:border-[#0A3D91] transition-all"
              >
                <option value="all">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* News List */}
        <div className="space-y-4">
          {filteredNews.length === 0 && (
            <div className="bg-white rounded-3xl p-16 text-center shadow-[0_8px_30px_rgba(0,0,0,0.08)] border border-[#E0E0E0]/50">
              <Newspaper className="w-20 h-20 text-[#E0E0E0] mx-auto mb-6" />
              <h3 className="text-2xl font-black text-[#1A1A24] mb-3">No News Articles Found</h3>
              <p className="text-[#707070] font-medium text-lg mb-8">
                No articles match your current filters. Try adjusting your search or create a new article.
              </p>
              <button
                onClick={handleAddNews}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-[#0A3D91] to-[#051C42] text-white px-6 py-3 rounded-xl font-bold"
              >
                <Plus className="w-5 h-5" />
                Create First Article
              </button>
            </div>
          )}

          {filteredNews.map((article) => {
            const statusBadge = getStatusBadge(article.status);

            return (
              <div
                key={article.id}
                onClick={() => handleEditNews(article)}
                className="bg-white rounded-2xl shadow-sm border border-[#E5E7EB] overflow-hidden transition-all hover:shadow-md hover:border-[#0A3D91]/20 cursor-pointer"
              >
                <div className="flex flex-col md:flex-row gap-4 p-6">
                  {/* Featured Image */}
                  {article.featuredImage && (
                    <div className="w-full md:w-48 h-32 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100">
                      <img
                        src={article.featuredImage}
                        alt={article.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xl font-bold text-[#111827] mb-1 line-clamp-2">
                          {article.title}
                        </h3>
                        <p className="text-sm text-[#6B7280] line-clamp-1 mb-2">
                          {article.subtitle}
                        </p>
                      </div>

                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold border flex-shrink-0 ${statusBadge.bg}`}>
                        {statusBadge.icon}
                        {article.status}
                      </span>
                    </div>

                    {/* Metadata */}
                    <div className="flex flex-wrap items-center gap-4 text-sm text-[#6B7280] mb-3">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4" />
                        <span>{article.publishDate}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <FileText className="w-4 h-4" />
                        <span>{article.author}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Eye className="w-4 h-4" />
                        <span>{article.views.toLocaleString()} views</span>
                      </div>
                      <div className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs font-semibold">
                        {article.category}
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {article.tags.map(tag => (
                        <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium">
                          #{tag}
                        </span>
                      ))}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditNews(article);
                        }}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0A3D91] hover:bg-[#051C42] text-white rounded-lg text-sm font-semibold transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                        Edit
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(article.id);
                        }}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm font-semibold transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-8 py-6 rounded-t-3xl z-10">
              <h2 className="text-3xl font-black text-[#1A1A24]">
                {editingNews ? "Edit News Article" : "Add New News Article"}
              </h2>
            </div>

            <div className="p-8 space-y-6">
              <div>
                <label className="block text-sm font-bold text-[#1A1A24] mb-2">Article Title</label>
                <input
                  type="text"
                  placeholder="Enter article title"
                  defaultValue={editingNews?.title}
                  className="w-full bg-[#F4F5F8] border-2 border-[#E0E0E0] rounded-xl px-4 py-3 text-[#1A1A24] font-semibold focus:ring-2 focus:ring-[#0A3D91] focus:border-[#0A3D91] transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-[#1A1A24] mb-2">Subtitle</label>
                <input
                  type="text"
                  placeholder="Enter article subtitle"
                  defaultValue={editingNews?.subtitle}
                  className="w-full bg-[#F4F5F8] border-2 border-[#E0E0E0] rounded-xl px-4 py-3 text-[#1A1A24] font-semibold focus:ring-2 focus:ring-[#0A3D91] focus:border-[#0A3D91] transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-[#1A1A24] mb-2">Content</label>
                <textarea
                  rows={8}
                  placeholder="Enter article content"
                  defaultValue={editingNews?.content}
                  className="w-full bg-[#F4F5F8] border-2 border-[#E0E0E0] rounded-xl px-4 py-3 text-[#1A1A24] font-semibold focus:ring-2 focus:ring-[#0A3D91] focus:border-[#0A3D91] transition-all resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-[#1A1A24] mb-2">Category</label>
                  <select
                    defaultValue={editingNews?.category}
                    className="w-full bg-[#F4F5F8] border-2 border-[#E0E0E0] rounded-xl px-4 py-3 text-[#1A1A24] font-bold focus:ring-2 focus:ring-[#0A3D91] focus:border-[#0A3D91] transition-all"
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
                </div>

                <div>
                  <label className="block text-sm font-bold text-[#1A1A24] mb-2">Status</label>
                  <select
                    defaultValue={editingNews?.status || "Draft"}
                    className="w-full bg-[#F4F5F8] border-2 border-[#E0E0E0] rounded-xl px-4 py-3 text-[#1A1A24] font-bold focus:ring-2 focus:ring-[#0A3D91] focus:border-[#0A3D91] transition-all"
                  >
                    <option value="Draft">Draft</option>
                    <option value="Published">Published</option>
                    <option value="Archived">Archived</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-[#1A1A24] mb-2">Featured Image</label>

                {/* Image Preview */}
                {imagePreview ? (
                  <div className="relative rounded-xl overflow-hidden border-2 border-[#E0E0E0] bg-gray-50 mb-3">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-64 object-cover"
                    />
                    <button
                      onClick={removeImage}
                      className="absolute top-3 right-3 w-8 h-8 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center transition-colors shadow-lg"
                      type="button"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full h-64 border-2 border-dashed border-[#E0E0E0] rounded-xl bg-[#F4F5F8] hover:bg-gray-100 transition-colors cursor-pointer flex flex-col items-center justify-center gap-3"
                  >
                    <div className="w-16 h-16 bg-[#0A3D91]/10 rounded-full flex items-center justify-center">
                      <Upload className="w-8 h-8 text-[#0A3D91]" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-bold text-[#1A1A24] mb-1">Click to upload image</p>
                      <p className="text-xs text-[#707070]">PNG, JPG, GIF up to 10MB</p>
                    </div>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-[#1A1A24] mb-2">Tags (comma-separated)</label>
                <input
                  type="text"
                  placeholder="Championship, National, Tournament"
                  defaultValue={editingNews?.tags.join(", ")}
                  className="w-full bg-[#F4F5F8] border-2 border-[#E0E0E0] rounded-xl px-4 py-3 text-[#1A1A24] font-semibold focus:ring-2 focus:ring-[#0A3D91] focus:border-[#0A3D91] transition-all"
                />
              </div>
            </div>

            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-8 py-6 flex items-center justify-end gap-4 rounded-b-3xl">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // Here you would handle the save logic
                  setShowAddModal(false);
                }}
                className="px-6 py-3 bg-gradient-to-r from-[#0A3D91] to-[#051C42] text-white rounded-xl font-bold hover:from-[#051C42] hover:to-[#0A3D91] transition-all shadow-lg"
              >
                {editingNews ? "Save Changes" : "Add Article"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
