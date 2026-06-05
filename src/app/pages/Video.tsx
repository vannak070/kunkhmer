import { useState, useRef } from "react";
import { Link } from "react-router";
import { Plus, Search, Video as VideoIcon, Calendar, Eye, Edit2, Trash2, FileText, CheckCircle, Clock, XCircle, Upload, X, Play, User, Building2 } from "lucide-react";
import { usePermissions } from "../hooks/usePermissions";
import { MOCK_FIGHTERS, MOCK_CLUBS } from "../data/mock";

interface VideoItem {
  id: string;
  title: string;
  description: string;
  duration: string;
  uploadDate: string;
  status: "Draft" | "Published" | "Archived";
  category: string;
  thumbnail?: string;
  youtubeUrl?: string;
  views: number;
  tags: string[];
  fighterId?: string;
  clubId?: string;
}

const MOCK_VIDEOS: VideoItem[] = [
  {
    id: "1",
    title: "Kun Khmer National Championship 2026 - Opening Ceremony Highlights",
    description: "Watch the spectacular opening ceremony of the National Championship featuring traditional performances and fighter introductions",
    duration: "12:45",
    uploadDate: "2026-04-25",
    status: "Published",
    category: "Championship",
    thumbnail: "https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?ixlib=rb-4.0.3&w=800&q=80",
    youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    views: 5420,
    tags: ["Championship", "Opening Ceremony", "Highlights"],
    clubId: "c1"
  },
  {
    id: "2",
    title: "Training Tutorial: Advanced Elbow Techniques with Prak Sophea",
    description: "Master the art of elbow strikes with this comprehensive training tutorial from the Elbow King",
    duration: "18:30",
    uploadDate: "2026-04-22",
    status: "Published",
    category: "Training",
    thumbnail: "https://images.unsplash.com/photo-1555597673-b21d5c935865?ixlib=rb-4.0.3&w=800&q=80",
    youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    views: 3210,
    tags: ["Training", "Tutorial", "Techniques"],
    fighterId: "f5",
    clubId: "c1"
  },
  {
    id: "3",
    title: "Full Match: Kem Sitha vs Chan Rothana - Lightweight Title Fight",
    description: "Complete recording of the intense lightweight championship bout between two top contenders",
    duration: "45:20",
    uploadDate: "2026-04-20",
    status: "Published",
    category: "Match Recording",
    thumbnail: "https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?ixlib=rb-4.0.3&w=800&q=80",
    youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    views: 8765,
    tags: ["Match", "Championship", "Full Fight"],
    fighterId: "f6"
  },
  {
    id: "4",
    title: "Youth Development Program - Documentary",
    description: "Behind-the-scenes look at the expanding youth development program across Cambodia",
    duration: "25:15",
    uploadDate: "2026-04-18",
    status: "Published",
    category: "Documentary",
    thumbnail: "https://images.unsplash.com/photo-1555597673-b21d5c935865?ixlib=rb-4.0.3&w=800&q=80",
    youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    views: 2340,
    tags: ["Youth", "Documentary", "Development"],
    clubId: "c2"
  },
  {
    id: "5",
    title: "Fighter Profile: Interview with Sorn Seavmey",
    description: "Exclusive in-depth interview with The Tiger discussing training, motivation, and future goals",
    duration: "15:45",
    uploadDate: "2026-04-15",
    status: "Published",
    category: "Interview",
    thumbnail: "https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?ixlib=rb-4.0.3&w=800&q=80",
    youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    views: 4520,
    tags: ["Interview", "Champion", "Profile"],
    fighterId: "f1",
    clubId: "c1"
  },
  {
    id: "6",
    title: "Charity Fight Night 2026 - Event Recap",
    description: "Highlights from the successful charity event that raised $50,000 for local communities",
    duration: "8:30",
    uploadDate: "2026-04-12",
    status: "Draft",
    category: "Event Recap",
    thumbnail: "https://images.unsplash.com/photo-1555597673-b21d5c935865?ixlib=rb-4.0.3&w=800&q=80",
    youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    views: 0,
    tags: ["Charity", "Event", "Recap"]
  }
];

export function Video() {
  const permissions = usePermissions();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [videos, setVideos] = useState<VideoItem[]>(MOCK_VIDEOS);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingVideo, setEditingVideo] = useState<VideoItem | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);

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
    setEditingVideo(null);
    setThumbnailPreview(null);
    setShowAddModal(true);
  };

  const handleEditVideo = (video: VideoItem) => {
    setEditingVideo(video);
    setThumbnailPreview(video.thumbnail || null);
    setShowAddModal(true);
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

  const getFighterById = (id?: string) => {
    if (!id) return null;
    return MOCK_FIGHTERS.find(f => f.id === id);
  };

  const getClubById = (id?: string) => {
    if (!id) return null;
    return MOCK_CLUBS.find(c => c.id === id);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F4F5F8] via-white to-[#F9FAFB]">
      <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-[#1A1A24] uppercase mb-3 leading-none">
              Video Management
            </h1>
            <p className="text-[#707070] font-medium text-lg">
              Upload and manage video content • {filteredVideos.length} {filteredVideos.length === 1 ? 'video' : 'videos'} found
            </p>
          </div>

          <button
            onClick={handleAddVideo}
            className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#C8102E] to-[#A00D24] hover:from-[#A00D24] hover:to-[#8A0B20] text-white px-8 py-4 rounded-2xl font-black uppercase tracking-wider transition-all shadow-xl hover:shadow-2xl hover:scale-[1.02]"
          >
            <Plus className="w-5 h-5" />
            Add Video
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
                placeholder="Search videos, tags..."
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

        {/* Video Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVideos.length === 0 && (
            <div className="col-span-full bg-white rounded-3xl p-16 text-center shadow-[0_8px_30px_rgba(0,0,0,0.08)] border border-[#E0E0E0]/50">
              <VideoIcon className="w-20 h-20 text-[#E0E0E0] mx-auto mb-6" />
              <h3 className="text-2xl font-black text-[#1A1A24] mb-3">No Videos Found</h3>
              <p className="text-[#707070] font-medium text-lg mb-8">
                No videos match your current filters. Try adjusting your search or upload a new video.
              </p>
              <button
                onClick={handleAddVideo}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-[#0A3D91] to-[#051C42] text-white px-6 py-3 rounded-xl font-bold"
              >
                <Plus className="w-5 h-5" />
                Upload First Video
              </button>
            </div>
          )}

          {filteredVideos.map((video) => {
            const statusBadge = getStatusBadge(video.status);
            const fighter = getFighterById(video.fighterId);
            const club = getClubById(video.clubId);

            return (
              <div
                key={video.id}
                onClick={() => handleEditVideo(video)}
                className="bg-white rounded-2xl shadow-sm border border-[#E5E7EB] overflow-hidden transition-all hover:shadow-md hover:border-[#0A3D91]/20 cursor-pointer group"
              >
                {/* Thumbnail */}
                <div className="relative aspect-video bg-gray-900 overflow-hidden">
                  {video.thumbnail && (
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  )}
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                    <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Play className="w-8 h-8 text-[#C8102E] ml-1" />
                    </div>
                  </div>
                  <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/80 text-white text-xs font-bold rounded">
                    {video.duration}
                  </div>
                  <div className="absolute top-2 left-2">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border backdrop-blur-xl ${statusBadge.bg}`}>
                      {statusBadge.icon}
                      {video.status}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 space-y-3">
                  <div>
                    <h3 className="text-base font-bold text-[#111827] mb-1 line-clamp-2 group-hover:text-[#0A3D91] transition-colors">
                      {video.title}
                    </h3>
                    <p className="text-sm text-[#6B7280] line-clamp-2">
                      {video.description}
                    </p>
                  </div>

                  {/* Fighter and Club */}
                  {(fighter || club) && (
                    <div className="flex flex-wrap gap-2 text-xs">
                      {fighter && (
                        <div className="flex items-center gap-1.5 px-2 py-1 bg-purple-50 text-purple-700 rounded font-semibold">
                          <User className="w-3 h-3" />
                          <span>{fighter.name}</span>
                        </div>
                      )}
                      {club && (
                        <div className="flex items-center gap-1.5 px-2 py-1 bg-orange-50 text-orange-700 rounded font-semibold">
                          <Building2 className="w-3 h-3" />
                          <span>{club.name}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Metadata */}
                  <div className="flex items-center gap-3 text-xs text-[#6B7280]">
                    <div className="flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5" />
                      <span>{video.views.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{video.uploadDate}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-semibold">
                      {video.category}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditVideo(video);
                      }}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-[#0A3D91] hover:bg-[#051C42] text-white rounded-lg text-sm font-semibold transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      Edit
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(video.id);
                      }}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-white hover:bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm font-semibold transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete
                    </button>
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
                {editingVideo ? "Edit Video" : "Add New Video"}
              </h2>
            </div>

            <div className="p-8 space-y-6">
              <div>
                <label className="block text-sm font-bold text-[#1A1A24] mb-2">Video Title</label>
                <input
                  type="text"
                  placeholder="Enter video title"
                  defaultValue={editingVideo?.title}
                  className="w-full bg-[#F4F5F8] border-2 border-[#E0E0E0] rounded-xl px-4 py-3 text-[#1A1A24] font-semibold focus:ring-2 focus:ring-[#0A3D91] focus:border-[#0A3D91] transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-[#1A1A24] mb-2">Description</label>
                <textarea
                  rows={4}
                  placeholder="Enter video description"
                  defaultValue={editingVideo?.description}
                  className="w-full bg-[#F4F5F8] border-2 border-[#E0E0E0] rounded-xl px-4 py-3 text-[#1A1A24] font-semibold focus:ring-2 focus:ring-[#0A3D91] focus:border-[#0A3D91] transition-all resize-none"
                />
              </div>

              {/* YouTube URL */}
              <div>
                <label className="block text-sm font-bold text-[#1A1A24] mb-2">YouTube URL</label>
                <input
                  type="url"
                  placeholder="https://www.youtube.com/watch?v=..."
                  defaultValue={editingVideo?.youtubeUrl}
                  className="w-full bg-[#F4F5F8] border-2 border-[#E0E0E0] rounded-xl px-4 py-3 text-[#1A1A24] font-semibold focus:ring-2 focus:ring-[#0A3D91] focus:border-[#0A3D91] transition-all"
                />
                <p className="text-xs text-[#707070] mt-2">Paste the YouTube video URL here</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Fighter Selection */}
                <div>
                  <label className="block text-sm font-bold text-[#1A1A24] mb-2">Fighter (Optional)</label>
                  <select
                    defaultValue={editingVideo?.fighterId || ""}
                    className="w-full bg-[#F4F5F8] border-2 border-[#E0E0E0] rounded-xl px-4 py-3 text-[#1A1A24] font-bold focus:ring-2 focus:ring-[#0A3D91] focus:border-[#0A3D91] transition-all"
                  >
                    <option value="">No fighter assigned</option>
                    {MOCK_FIGHTERS.slice(0, 20).map(fighter => (
                      <option key={fighter.id} value={fighter.id}>
                        {fighter.name} ({fighter.alias})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Club Selection */}
                <div>
                  <label className="block text-sm font-bold text-[#1A1A24] mb-2">Club (Optional)</label>
                  <select
                    defaultValue={editingVideo?.clubId || ""}
                    className="w-full bg-[#F4F5F8] border-2 border-[#E0E0E0] rounded-xl px-4 py-3 text-[#1A1A24] font-bold focus:ring-2 focus:ring-[#0A3D91] focus:border-[#0A3D91] transition-all"
                  >
                    <option value="">No club assigned</option>
                    {MOCK_CLUBS.map(club => (
                      <option key={club.id} value={club.id}>
                        {club.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Thumbnail Upload */}
              <div>
                <label className="block text-sm font-bold text-[#1A1A24] mb-2">Thumbnail Image</label>

                {thumbnailPreview ? (
                  <div className="relative rounded-xl overflow-hidden border-2 border-[#E0E0E0] bg-gray-50 mb-3">
                    <img
                      src={thumbnailPreview}
                      alt="Thumbnail preview"
                      className="w-full h-48 object-cover"
                    />
                    <button
                      onClick={removeThumbnail}
                      className="absolute top-3 right-3 w-8 h-8 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center transition-colors shadow-lg"
                      type="button"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => thumbnailInputRef.current?.click()}
                    className="w-full h-48 border-2 border-dashed border-[#E0E0E0] rounded-xl bg-[#F4F5F8] hover:bg-gray-100 transition-colors cursor-pointer flex flex-col items-center justify-center gap-3"
                  >
                    <div className="w-16 h-16 bg-[#0A3D91]/10 rounded-full flex items-center justify-center">
                      <Upload className="w-8 h-8 text-[#0A3D91]" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-bold text-[#1A1A24] mb-1">Click to upload thumbnail</p>
                      <p className="text-xs text-[#707070]">PNG, JPG up to 10MB</p>
                    </div>
                  </div>
                )}

                <input
                  ref={thumbnailInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleThumbnailChange}
                  className="hidden"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-bold text-[#1A1A24] mb-2">Category</label>
                  <select
                    defaultValue={editingVideo?.category}
                    className="w-full bg-[#F4F5F8] border-2 border-[#E0E0E0] rounded-xl px-4 py-3 text-[#1A1A24] font-bold focus:ring-2 focus:ring-[#0A3D91] focus:border-[#0A3D91] transition-all"
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
                </div>

                <div>
                  <label className="block text-sm font-bold text-[#1A1A24] mb-2">Duration</label>
                  <input
                    type="text"
                    placeholder="12:45"
                    defaultValue={editingVideo?.duration}
                    className="w-full bg-[#F4F5F8] border-2 border-[#E0E0E0] rounded-xl px-4 py-3 text-[#1A1A24] font-semibold focus:ring-2 focus:ring-[#0A3D91] focus:border-[#0A3D91] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-[#1A1A24] mb-2">Status</label>
                  <select
                    defaultValue={editingVideo?.status || "Draft"}
                    className="w-full bg-[#F4F5F8] border-2 border-[#E0E0E0] rounded-xl px-4 py-3 text-[#1A1A24] font-bold focus:ring-2 focus:ring-[#0A3D91] focus:border-[#0A3D91] transition-all"
                  >
                    <option value="Draft">Draft</option>
                    <option value="Published">Published</option>
                    <option value="Archived">Archived</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-[#1A1A24] mb-2">Tags (comma-separated)</label>
                <input
                  type="text"
                  placeholder="Championship, Highlights, Training"
                  defaultValue={editingVideo?.tags.join(", ")}
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
                {editingVideo ? "Save Changes" : "Add Video"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
