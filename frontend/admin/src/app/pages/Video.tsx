import { useState, useRef } from "react";
import { Link } from "react-router";
import { Plus, Search, Video as VideoIcon, Calendar, Eye, Edit2, Trash2, FileText, CheckCircle, Clock, XCircle, Upload, X, Play, User, Building2, ArrowLeft, Save, ChevronDown, Swords } from "lucide-react";
import { usePermissions } from "../hooks/usePermissions";
import { MOCK_FIGHTERS, MOCK_CLUBS, MOCK_MATCHES, MOCK_VIDEOS, VideoItem } from "../data/mock";

export function Video() {
  const permissions = usePermissions();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [videos, setVideos] = useState<VideoItem[]>(MOCK_VIDEOS);
  const [viewMode, setViewMode] = useState<'list' | 'add' | 'edit'>('list');
  const [editingVideo, setEditingVideo] = useState<VideoItem | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    youtubeUrl: "",
    duration: "",
    category: "",
    status: "Draft" as "Draft" | "Published" | "Archived",
    tags: "",
    fighterId: "",
    clubId: "",
    matchId: ""
  });

  // Filter videos
  const filteredVideos = videos.filter(video => {
    const matchesSearch = video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          video.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          video.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === "all" || video.status === statusFilter;
    const matchesCategory = categoryFilter === "all" || video.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Get unique categories
  const categories = Array.from(new Set(videos.map(video => video.category)));

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
    if (confirm("Are you sure you want to delete this video?")) {
      setVideos(videos.filter(video => video.id !== id));
    }
  };

  const handleAddVideo = () => {
    setFormData({
      title: "",
      description: "",
      youtubeUrl: "",
      duration: "",
      category: "",
      status: "Draft",
      tags: "",
      fighterId: "",
      clubId: "",
      matchId: ""
    });
    setEditingVideo(null);
    setThumbnailPreview(null);
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
      tags: video.tags.join(", "),
      fighterId: video.fighterId || "",
      clubId: video.clubId || "",
      matchId: video.matchId || ""
    });
    setEditingVideo(video);
    setThumbnailPreview(video.thumbnail || null);
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

    const match = MOCK_MATCHES.find(m => m.id === matchId);
    if (match) {
      // Auto-populate fighter and club involved
      setFormData(prev => ({
        ...prev,
        matchId,
        fighterId: match.fighterA?.id || prev.fighterId,
        clubId: match.fighterA?.clubId || prev.clubId
      }));
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
      const newVideo: VideoItem = {
        id: `v${Date.now()}`,
        title: formData.title,
        description: formData.description,
        youtubeUrl: formData.youtubeUrl || undefined,
        duration: formData.duration || "00:00",
        category: formData.category || "General",
        status: formData.status,
        tags: tagsArray,
        uploadDate: new Date().toISOString().split("T")[0],
        thumbnail: thumbnailPreview || undefined,
        views: 0,
        fighterId: formData.fighterId || undefined,
        clubId: formData.clubId || undefined,
        matchId: formData.matchId || undefined
      };
      setVideos([newVideo, ...videos]);
    } else if (viewMode === "edit" && editingVideo) {
      setVideos(videos.map(vid => {
        if (vid.id === editingVideo.id) {
          return {
            ...vid,
            title: formData.title,
            description: formData.description,
            youtubeUrl: formData.youtubeUrl || undefined,
            duration: formData.duration || "00:00",
            category: formData.category || "General",
            status: formData.status,
            tags: tagsArray,
            thumbnail: thumbnailPreview || undefined,
            fighterId: formData.fighterId || undefined,
            clubId: formData.clubId || undefined,
            matchId: formData.matchId || undefined
          };
        }
        return vid;
      }));
    }

    setViewMode("list");
  };

  const getFighterById = (id?: string) => {
    if (!id) return null;
    return MOCK_FIGHTERS.find(f => f.id === id);
  };

  const getClubById = (id?: string) => {
    if (!id) return null;
    return MOCK_CLUBS.find(c => c.id === id);
  };

  const getMatchById = (id?: string) => {
    if (!id) return null;
    return MOCK_MATCHES.find(m => m.id === id);
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
                {viewMode === "edit" ? "Edit Video" : "Add New Video"}
              </h1>
              <p className="text-sm text-muted-foreground mt-1 font-medium">
                {viewMode === "edit" ? "Edit details of the published video" : "Publish a new Kun Khmer video"}
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
                <VideoIcon className="w-5 h-5 text-primary" />
                <span>Video Information</span>
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                    Video Title <span className="text-secondary">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    placeholder="Enter video title"
                    className="input-premium font-semibold text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                    Description
                  </label>
                  <textarea
                    rows={6}
                    name="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Enter video description..."
                    className="input-premium font-medium text-slate-700 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                    YouTube URL <span className="text-secondary">*</span>
                  </label>
                  <input
                    type="url"
                    name="youtubeUrl"
                    value={formData.youtubeUrl}
                    onChange={(e) => setFormData({ ...formData, youtubeUrl: e.target.value })}
                    required
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="input-premium font-medium text-slate-700"
                  />
                </div>
              </div>
            </div>

            {/* Categorization & Metadata */}
            <div className="card-premium">
              <h2 className="text-base font-bold text-foreground mb-4">Metadata & Relations</h2>
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
                      <option value="Training">Training</option>
                      <option value="Match Recording">Match Recording</option>
                      <option value="Documentary">Documentary</option>
                      <option value="Interview">Interview</option>
                      <option value="Event Recap">Event Recap</option>
                      <option value="Highlights">Highlights</option>
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

                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                    Duration <span className="text-secondary">*</span>
                  </label>
                  <input
                    type="text"
                    name="duration"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    required
                    placeholder="12:45"
                    className="input-premium font-semibold text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                    Tags (comma-separated)
                  </label>
                  <input
                    type="text"
                    name="tags"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    placeholder="Championship, Highlights, Training"
                    className="input-premium font-semibold text-slate-800"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                    Related Match (Optional)
                  </label>
                  <div className="relative">
                    <select
                      name="matchId"
                      value={formData.matchId}
                      onChange={(e) => handleMatchChange(e.target.value)}
                      className="input-premium font-semibold text-slate-800 cursor-pointer appearance-none animate-fadeIn"
                    >
                      <option value="">No match assigned</option>
                      {MOCK_MATCHES.map(match => (
                        <option key={match.id} value={match.id}>
                          {match.fighterA?.name} vs {match.fighterB?.name} ({match.date || 'TBD'})
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-muted-foreground">
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                    Fighter (Optional)
                  </label>
                  <div className="relative">
                    <select
                      name="fighterId"
                      value={formData.fighterId}
                      onChange={(e) => setFormData({ ...formData, fighterId: e.target.value })}
                      className="input-premium font-semibold text-slate-800 cursor-pointer appearance-none animate-fadeIn"
                    >
                      <option value="">No fighter assigned</option>
                      {MOCK_FIGHTERS.slice(0, 20).map(fighter => (
                        <option key={fighter.id} value={fighter.id}>
                          {fighter.name} ({fighter.alias})
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-muted-foreground">
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                    Club (Optional)
                  </label>
                  <div className="relative">
                    <select
                      name="clubId"
                      value={formData.clubId}
                      onChange={(e) => setFormData({ ...formData, clubId: e.target.value })}
                      className="input-premium font-semibold text-slate-800 cursor-pointer appearance-none animate-fadeIn"
                    >
                      <option value="">No club assigned</option>
                      {MOCK_CLUBS.map(club => (
                        <option key={club.id} value={club.id}>
                          {club.name}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-muted-foreground">
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Upload Thumbnail & Actions */}
          <div className="lg:col-span-1 space-y-6">
            {/* Thumbnail upload */}
            <div className="card-premium">
              <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                <Upload className="w-4 h-4 text-primary" />
                <span>Thumbnail Image</span>
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
                      ref={thumbnailInputRef}
                      onChange={handleThumbnailChange}
                    />
                  </label>
                </div>

                {thumbnailPreview ? (
                  <div className="relative w-full h-40 rounded-xl overflow-hidden border border-border/60 shadow-sm animate-fadeIn">
                    <img src={thumbnailPreview} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={removeThumbnail}
                      className="absolute top-2 right-2 p-1.5 bg-red-500/90 hover:bg-red-600 text-white rounded-lg transition-colors shadow-md"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="h-40 rounded-xl bg-muted/10 border border-border/40 flex items-center justify-center text-muted-foreground text-xs font-medium">
                    No thumbnail selected
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
                {viewMode === "edit" ? "Save Changes" : "Publish Video"}
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
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Video Management</h1>
          <p className="text-sm text-muted-foreground mt-1 font-medium">Upload and manage video content • {filteredVideos.length} {filteredVideos.length === 1 ? 'video' : 'videos'} found</p>
        </div>
        <button
          onClick={handleAddVideo}
          className="btn-secondary py-2.5 px-5"
        >
          <Plus className="w-4 h-4" />
          Add Video
        </button>
      </header>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            placeholder="Search videos, tags..."
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
              <option value="all">All Status</option>
              <option value="Draft">Draft</option>
              <option value="Published">Published</option>
              <option value="Archived">Archived</option>
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
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
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
          const statusBadge = getStatusBadge(video.status);
          const fighter = getFighterById(video.fighterId);
          const club = getClubById(video.clubId);

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
                    {video.category}
                  </div>
                  
                  <div className={`badge-premium ${
                    video.status === 'Published' ? 'badge-emerald' : 
                    video.status === 'Draft' ? 'badge-amber' : 'badge-red'
                  }`}>
                    <span className={`badge-dot ${
                      video.status === 'Published' ? 'bg-emerald-500' : 
                      video.status === 'Draft' ? 'bg-amber-500' : 'bg-red-500'
                    }`} />
                    <span className="text-[10px] font-bold uppercase">{video.status}</span>
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
                  {(fighter || club || getMatchById(video.matchId)) && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {getMatchById(video.matchId) && (
                        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-red-50 text-[#C8102E] border border-red-100 rounded-lg text-[10px] font-bold">
                          <Swords className="w-3 h-3" />
                          <span>Match: {getMatchById(video.matchId)?.fighterA?.name} vs {getMatchById(video.matchId)?.fighterB?.name}</span>
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
                      <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Views</div>
                      <div className="flex items-center gap-1 text-primary">
                        <Eye className="w-3.5 h-3.5 shrink-0" />
                        <span className="text-xs font-bold">{video.views.toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="bg-muted/15 p-3 rounded-xl border border-border/40 hover:bg-muted/20 hover:border-border/60 transition-all duration-200 flex flex-col justify-between h-[65px]">
                      <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Uploaded</div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Calendar className="w-3.5 h-3.5 shrink-0" />
                        <span className="text-xs font-semibold">{video.uploadDate}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {video.tags.slice(0, 3).map(tag => (
                      <span key={tag} className="px-2 py-0.5 bg-muted text-muted-foreground rounded-full text-[10px] font-medium border border-border/40">
                        #{tag}
                      </span>
                    ))}
                  </div>

                  {/* Play Action Row */}
                  <div className="flex items-center justify-between text-xs text-muted-foreground font-medium pt-3 border-t border-border/50">
                    <span className="text-primary group-hover:text-secondary font-semibold flex items-center gap-1 transition-colors">
                      Watch Video
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
          <h3 className="text-lg font-bold text-foreground tracking-tight mb-1">No Videos Found</h3>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            We couldn't find any videos matching your search. Try adjusting your filters or search term.
          </p>
        </div>
      )}
    </div>
  );
}
