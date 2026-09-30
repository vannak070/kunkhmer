import { useState, useEffect } from "react";
import { Plus, Search, MapPin, Dumbbell, Star, Edit2, Trash2 } from "lucide-react";
import { Link } from "react-router";
import { api } from "../utils/api";
import { toast } from "sonner";
import { usePermissions } from "../hooks/usePermissions";

export function Clubs() {
  // Only KKF staff add, edit or remove clubs (the API refuses other roles).
  const permissions = usePermissions();
  const [clubs, setClubs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetchClubs();
  }, []);

  const fetchClubs = async () => {
    setLoading(true);
    try {
      const data = await api.clubs.list();
      setClubs(data);
    } catch (err: any) {
      toast.error(err.message || "Failed to load clubs");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClub = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this club?")) return;

    try {
      await api.clubs.delete(id);
      toast.success("Club deleted successfully");
      setClubs(prev => prev.filter(c => c.id !== id));
    } catch (err: any) {
      toast.error(err.message || "Failed to delete club");
    }
  };

  const filteredClubs = clubs.filter(club => {
    const matchesSearch = 
      (club.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (club.location || "").toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = 
      statusFilter === "all" || 
      (club.status || "").toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 flex flex-col min-h-full animate-fadeIn">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Clubs Directory</h1>
          <p className="text-sm text-muted-foreground mt-1 font-medium">Manage Kun Khmer training camps and gyms</p>
        </div>
        {permissions.hasPermission("clubs.manage") && (
          <Link 
            to="/home/clubs/new" 
            className="btn-secondary py-2.5 px-5"
          >
            <Plus className="w-4 h-4" />
            Add Club
          </Link>
        )}
      </header>

      {/* Search & Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            placeholder="Search clubs by name or location..."
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
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16">
          <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-muted-foreground font-semibold">Loading clubs from database...</p>
        </div>
      ) : (
        <>
          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClubs.map((club) => (
              <div 
                key={club.id} 
                className="bg-white rounded-2xl border border-border/75 overflow-hidden shadow-sm hover:shadow-xl hover:border-primary/20 hover:-translate-y-1.5 transition-all duration-300 group flex flex-col"
              >
                {/* Image Banner Section */}
                <div className="h-44 relative overflow-hidden bg-muted">
                  <img 
                    src={club.image || "https://images.unsplash.com/photo-1540206351-d6465b3ac5c1?q=80&w=2940&auto=format&fit=crop"} 
                    alt={club.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
                  
                  {/* Badge Overlays */}
                  <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                    {/* Gold Rating badge */}
                    <div className="flex items-center gap-1 bg-[#FFFDF5] border border-amber-200/80 text-amber-700 px-2.5 py-0.5 rounded-full text-xs font-semibold shadow-sm">
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                      <span>{parseFloat(club.rating || "4.0").toFixed(1)}</span>
                    </div>
                    
                    {/* Active/Inactive Badge */}
                    <div className={`badge-premium ${
                      (club.status || "").toLowerCase() === 'active' 
                        ? 'badge-emerald' 
                        : 'badge-red'
                    }`}>
                      <span className={`badge-dot ${(club.status || "").toLowerCase() === 'active' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                      {club.status}
                    </div>
                  </div>
                  
                  {/* Action Overlays on Hover */}
                  {permissions.hasPermission("clubs.manage") && <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-200 flex gap-2 translate-y-[-5px] group-hover:translate-y-0">
                    <Link 
                      to={`/home/clubs/${club.id}/edit`}
                      className="p-2 bg-white/95 hover:bg-white text-primary border border-border/40 rounded-xl shadow-md backdrop-blur-md transition-all duration-150 hover:scale-105 active:scale-95"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Link>
                    <button 
                      onClick={() => handleDeleteClub(club.id)}
                      className="p-2 bg-red-50/95 hover:bg-red-500 hover:text-white text-secondary border border-red-100 rounded-xl shadow-md backdrop-blur-md transition-all duration-150 hover:scale-105 active:scale-95"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>}
                </div>
                
                {/* Card Content Section */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors duration-200 tracking-tight leading-tight line-clamp-1 mb-1 flex items-center gap-2">
                      {club.logo_url && <img src={club.logo_url} alt="" className="w-7 h-7 rounded-lg object-contain bg-white ring-1 ring-black/5 shrink-0" />}
                      <span className="truncate">{club.name}</span>
                    </h3>
                    <div className="flex items-center gap-1.5 text-muted-foreground mb-4">
                      <MapPin className="w-3.5 h-3.5 text-secondary shrink-0" />
                      <span className="text-xs font-medium">{club.location}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-5">
                      <div className="bg-muted/15 p-3 rounded-xl border border-border/40 hover:bg-muted/20 hover:border-border/60 transition-all duration-200 flex flex-col justify-between h-[65px]">
                        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Head Coach</div>
                        <div className="text-sm font-semibold text-slate-800 line-clamp-1">{club.head_coach || "N/A"}</div>
                      </div>
                      <div className="bg-muted/15 p-3 rounded-xl border border-border/40 hover:bg-muted/20 hover:border-border/60 transition-all duration-200 flex flex-col justify-between h-[65px]">
                        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Status</div>
                        <div className="flex items-center gap-1 text-primary">
                          <Dumbbell className="w-3.5 h-3.5 shrink-0" />
                          <span className="text-sm font-bold capitalize">{club.status}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Link 
                    to={`/home/clubs/${club.id}`} 
                    className="btn-outline w-full py-2"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {filteredClubs.length === 0 && (
            <div className="text-center py-16 bg-white rounded-2xl border border-border/60 shadow-sm">
              <div className="w-16 h-16 bg-muted/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Dumbbell className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-bold text-foreground tracking-tight mb-1">No Clubs Found</h3>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                We couldn't find any clubs matching your search. Try adjusting your filters or search term.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}