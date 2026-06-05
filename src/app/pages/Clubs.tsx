import { useState } from "react";
import { Plus, Search, MapPin, Dumbbell, Star, MoreVertical, Edit2, Trash2 } from "lucide-react";
import { Link } from "react-router";
import { MOCK_CLUBS } from "../data/mock";

export function Clubs() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredClubs = MOCK_CLUBS.filter(club => 
    club.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    club.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 flex flex-col h-full">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight uppercase text-[#0A3D91]">Clubs Directory</h1>
          <p className="text-[#707070] mt-2 font-medium text-lg">Manage Kun Khmer training camps and gyms</p>
        </div>
        <Link 
          to="/home/clubs/new" 
          className="inline-flex items-center gap-2 bg-gradient-to-r from-[#C8102E] to-[#A00D24] hover:from-[#A00D24] hover:to-[#8A0B20] text-white px-6 py-3.5 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl hover:scale-[1.02]"
        >
          <Plus className="w-5 h-5" />
          Add Club
        </Link>
      </header>

      {/* Search & Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#B0B0B0] group-focus-within:text-[#0A3D91] transition-colors" />
          <input
            type="text"
            placeholder="Search clubs by name or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border-2 border-[#E0E0E0] rounded-xl pl-12 pr-4 py-4 text-[#1A1A24] font-semibold placeholder:text-[#B0B0B0] focus:outline-none focus:ring-2 focus:ring-[#0A3D91] focus:border-[#0A3D91] shadow-sm transition-all"
          />
        </div>
        <div className="flex gap-3">
          <select className="px-4 py-3 bg-white border-2 border-[#E0E0E0] rounded-xl font-semibold text-[#1A1A24] focus:outline-none focus:ring-2 focus:ring-[#0A3D91] focus:border-[#0A3D91] shadow-sm appearance-none min-w-[140px]">
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClubs.map((club) => (
          <div key={club.id} className="bg-[#FFFFFF] rounded-2xl border border-[#B0B0B0]/20 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group">
            <div className="h-40 relative overflow-hidden bg-[#E8E8ED]">
              <img 
                src={club.image} 
                alt={club.name} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A3D91]/80 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                <div className="flex items-center gap-1.5 bg-[#FFFFFF]/20 backdrop-blur-md px-2.5 py-1 rounded-lg border border-[#FFFFFF]/30">
                  <Star className="w-3.5 h-3.5 text-[#F2C94C] fill-[#F2C94C]" />
                  <span className="text-sm font-bold text-[#FFFFFF]">{club.rating}</span>
                </div>
                <div className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider backdrop-blur-md ${
                  club.status === 'active' 
                    ? 'bg-[#0A3D91]/80 text-[#FFFFFF] border border-[#FFFFFF]/30' 
                    : 'bg-[#C8102E]/80 text-[#FFFFFF] border border-[#FFFFFF]/30'
                }`}>
                  {club.status}
                </div>
              </div>
              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                <button className="p-2 bg-[#FFFFFF]/90 hover:bg-[#FFFFFF] text-[#0A3D91] rounded-lg shadow-sm backdrop-blur-md transition-colors">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button className="p-2 bg-[#C8102E]/90 hover:bg-[#C8102E] text-[#FFFFFF] rounded-lg shadow-sm backdrop-blur-md transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="p-5">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-black text-[#0A3D91] uppercase tracking-tight leading-tight mb-1 line-clamp-1">{club.name}</h3>
                  <div className="flex items-center gap-1.5 text-[#B0B0B0]">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm font-medium">{club.location}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-5">
                <div className="bg-[#F5F5F7] p-3 rounded-xl border border-[#B0B0B0]/10">
                  <div className="text-xs font-bold text-[#B0B0B0] uppercase tracking-wider mb-1">Head Coach</div>
                  <div className="text-sm font-bold text-[#333333] line-clamp-1">{club.headCoach}</div>
                </div>
                <div className="bg-[#F5F5F7] p-3 rounded-xl border border-[#B0B0B0]/10">
                  <div className="text-xs font-bold text-[#B0B0B0] uppercase tracking-wider mb-1">Fighters</div>
                  <div className="flex items-center gap-1.5 text-[#0A3D91]">
                    <Dumbbell className="w-4 h-4" />
                    <span className="text-sm font-black">{club.activeFighters} Active</span>
                  </div>
                </div>
              </div>

              <Link to={`/home/clubs/${club.id}`} className="block w-full text-center bg-[#FFFFFF] border-2 border-[#0A3D91] text-[#0A3D91] hover:bg-[#0A3D91] hover:text-[#FFFFFF] py-2.5 rounded-xl font-bold transition-colors">
                View Details
              </Link>
            </div>
          </div>
        ))}
      </div>

      {filteredClubs.length === 0 && (
        <div className="text-center py-16 bg-[#FFFFFF] rounded-2xl border border-[#B0B0B0]/20 shadow-sm">
          <div className="w-16 h-16 bg-[#F5F5F7] rounded-full flex items-center justify-center mx-auto mb-4">
            <Dumbbell className="w-8 h-8 text-[#B0B0B0]" />
          </div>
          <h3 className="text-xl font-black text-[#0A3D91] uppercase tracking-tight mb-2">No Clubs Found</h3>
          <p className="text-[#B0B0B0] font-medium max-w-md mx-auto">
            We couldn't find any clubs matching your search. Try adjusting your filters or add a new club.
          </p>
        </div>
      )}
    </div>
  );
}