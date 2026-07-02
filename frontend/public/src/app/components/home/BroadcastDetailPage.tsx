import { useState } from "react";
import { 
  ArrowLeft, MapPin, Users, Check, User, Mail, Trophy, 
  Calendar, Building2, Eye, Crown, Tv 
} from "lucide-react";

interface BroadcastStation {
  id: string;
  name: string;
  logo: string;
  image: string;
  description: string;
  eventsCount: number;
  contactPerson?: string;
  contactEmail?: string;
  type?: string;
  reach?: string;
}

interface BroadcastEvent {
  id: string;
  name: string;
  date: string;
  venue: string;
  image: string;
  matchesCount: number;
  status: string;
}

interface BroadcastDetailPageProps {
  station: BroadcastStation;
  events: BroadcastEvent[];
  onBack: () => void;
  onEventClick: (eventId: string) => void;
}

type TabType = 'overview' | 'events';

export default function BroadcastDetailPage({ station, events, onBack, onEventClick }: BroadcastDetailPageProps) {
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  return (
    <div className="bg-white rounded-3xl border border-gray-200 shadow-xl overflow-hidden">
      {/* Hero Cover Image Section - Full bleed banner */}
      <div className="relative h-[480px] md:h-[580px] w-full overflow-hidden">
        <img src={station.image} alt={station.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/50 to-transparent" />
        
        {/* Floating Back Button */}
        <div className="absolute top-6 left-6 z-20">
          <button 
            onClick={onBack}
            className="p-2.5 bg-black/25 hover:bg-black/35 backdrop-blur-md text-white rounded-xl transition-all active:scale-95 border border-white/20 shadow-lg flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4 text-white" />
            <span className="text-xs font-black uppercase tracking-wider">Back</span>
          </button>
        </div>

        {/* Content overlaid at bottom of full hero image */}
        <div className="absolute bottom-6 left-6 right-6 z-10 flex flex-col justify-end">
          <div className="flex items-center gap-2 mb-3">
            <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-purple-600/90 text-white border border-purple-500/20 shadow-md flex items-center gap-1.5">
              <Tv className="w-3.5 h-3.5 fill-white text-white" />
              Broadcast Partner
            </span>
            <div className="flex items-center gap-1.5 bg-blue-600/90 text-white border border-blue-500/30 px-2.5 py-1 rounded-full text-[10px] font-black shadow-md uppercase">
              <span>{station.type || "National TV"}</span>
            </div>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight drop-shadow-md mb-4 leading-tight flex items-center gap-4">
            <div className="w-16 h-16 rounded-full border-2 border-white bg-white overflow-hidden shadow-md shrink-0">
              <img src={station.logo} alt={station.name} className="w-full h-full object-cover rounded-full" />
            </div>
            <span>{station.name}</span>
          </h1>
          
          {/* Cover Stats Subgrid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-2.5 text-center shadow-sm">
              <div className="text-[9px] font-black text-white/70 uppercase tracking-wider mb-0.5">Reach Area</div>
              <div className="text-xs font-bold text-white truncate">{station.reach || "National"}</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-2.5 text-center shadow-sm">
              <div className="text-[9px] font-black text-white/70 uppercase tracking-wider mb-0.5">Platform Type</div>
              <div className="text-xs font-bold text-white uppercase">{station.type || "National TV"}</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-2.5 text-center shadow-sm">
              <div className="text-[9px] font-black text-white/70 uppercase tracking-wider mb-0.5">Broadcasted Events</div>
              <div className="text-xs font-bold text-white">{station.eventsCount}</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-2.5 text-center shadow-sm">
              <div className="text-[9px] font-black text-white/70 uppercase tracking-wider mb-0.5">Status</div>
              <div className="text-xs font-bold text-emerald-400">Live & Active</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 bg-gray-50/50 px-6 py-4 flex gap-1 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex-1 min-w-[100px] flex items-center justify-center gap-2 py-3 text-xs font-black uppercase tracking-wider transition-all rounded-xl ${
            activeTab === 'overview'
              ? 'text-[#0A3D91] bg-white font-black shadow-sm border border-gray-200/50'
              : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100/50'
          }`}
        >
          <User className="w-3.5 h-3.5 shrink-0" />
          <span>Overview</span>
        </button>

        <button
          onClick={() => setActiveTab('events')}
          className={`flex-1 min-w-[100px] flex items-center justify-center gap-2 py-3 text-xs font-black uppercase tracking-wider transition-all rounded-xl ${
            activeTab === 'events'
              ? 'text-[#0A3D91] bg-white font-black shadow-sm border border-gray-200/50'
              : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100/50'
          }`}
        >
          <Tv className="w-3.5 h-3.5 shrink-0" />
          <span>Events Broadcasted</span>
          <span className="px-2 py-0.5 ml-1 bg-[#0A3D91]/10 text-[#0A3D91] text-[9px] font-black rounded-full">
            {events.length}
          </span>
        </button>
      </div>

      {/* Tab Contents */}
      <div className="w-full p-6 md:p-8">
        {/* Overview Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* About description */}
              <div className="md:col-span-2">
                <div className="bg-white rounded-2xl p-6 border-2 border-gray-200 shadow-sm h-full flex flex-col justify-between">
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-wider text-gray-500 mb-4 flex items-center gap-2">
                      <Tv className="w-4 h-4 text-[#0A3D91]" />
                      <span>About the Station</span>
                    </h3>
                    <p className="text-gray-800 leading-relaxed font-semibold text-sm">
                      {station.name} is a leading media and broadcasting network delivering high-definition coverage of premier Kun Khmer matches across Cambodia and international platforms, providing fans with real-time access to actions in the ring.
                    </p>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <div className="bg-white rounded-2xl p-6 border-2 border-gray-200 shadow-sm h-full flex flex-col justify-between">
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-wider text-gray-500 mb-4 flex items-center gap-2">
                      <Mail className="w-4 h-4 text-[#0A3D91]" />
                      <span>Station Details</span>
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-blue-50 border border-blue-100 rounded-lg shrink-0 mt-0.5">
                          <User className="w-4 h-4 text-[#0A3D91]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="block text-[9px] font-black text-gray-400 uppercase tracking-wider mb-0.5">Contact Person</span>
                          <span className="text-xs font-bold text-gray-800 break-all block">{station.contactPerson || "Mr. Srey Vicheka"}</span>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-blue-50 border border-blue-100 rounded-lg shrink-0 mt-0.5">
                          <Mail className="w-4 h-4 text-[#0A3D91]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="block text-[9px] font-black text-gray-400 uppercase tracking-wider mb-0.5">Contact Email</span>
                          <a href={`mailto:${station.contactEmail}`} className="text-xs font-bold text-gray-800 hover:text-[#0A3D91] transition-colors break-all block">{station.contactEmail || "contact@townfull.tv"}</a>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-blue-50 border border-blue-100 rounded-lg shrink-0 mt-0.5">
                          <Eye className="w-4 h-4 text-[#0A3D91]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="block text-[9px] font-black text-gray-400 uppercase tracking-wider mb-0.5">Coverage reach</span>
                          <span className="text-xs font-bold text-gray-800 block truncate">{station.reach || "National"}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-2xl p-5 border-2 border-gray-200 text-center hover:bg-gray-50/50 hover:border-gray-300 transition-all flex flex-col justify-center shadow-sm">
                <div className="text-3xl font-black text-[#0A3D91] mb-1">{station.eventsCount}</div>
                <div className="text-[9px] font-black text-gray-400 uppercase tracking-wider">Events Broadcasted</div>
              </div>
              <div className="bg-white rounded-2xl p-5 border-2 border-gray-200 text-center hover:bg-gray-50/50 hover:border-gray-300 transition-all flex flex-col justify-center shadow-sm">
                <div className="text-3xl font-black text-emerald-600 mb-1">Active</div>
                <div className="text-[9px] font-black text-gray-400 uppercase tracking-wider">Partner Status</div>
              </div>
              <div className="bg-white rounded-2xl p-5 border-2 border-gray-200 text-center hover:bg-gray-50/50 hover:border-gray-300 transition-all flex flex-col justify-center shadow-sm">
                <div className="text-3xl font-black text-purple-600 mb-1 uppercase">{station.type || "National TV"}</div>
                <div className="text-[9px] font-black text-gray-400 uppercase tracking-wider">Broadcaster Level</div>
              </div>
            </div>
          </div>
        )}

        {/* Sponsored Events Tab Content */}
        {activeTab === 'events' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {events.map((event) => (
              <div
                key={event.id}
                onClick={() => onEventClick(event.id)}
                className="group relative bg-white rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-500 border-2 border-gray-200 hover:border-[#0A3D91]/50 cursor-pointer flex flex-col"
              >
                {/* Banner */}
                <div className="relative w-full aspect-[16/9] bg-gray-100 overflow-hidden flex-shrink-0">
                  <img
                    src={event.image}
                    alt={event.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                  
                  {/* Status Badge */}
                  <div className="absolute top-3 left-3">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase border shadow-md flex items-center gap-1.5 ${
                      event.status === 'Completed' || event.status === 'completed'
                        ? 'bg-emerald-500/90 text-white border-white/20'
                        : 'bg-blue-500/90 text-white border-white/20'
                    }`}>
                      {event.status}
                    </span>
                  </div>
                </div>

                {/* Info */}
                <div className="flex flex-col gap-3 p-5 flex-1">
                  <div>
                    <h3 className="text-base font-black text-gray-900 group-hover:text-[#0A3D91] transition-colors leading-tight line-clamp-2 mb-1">
                      {event.name}
                    </h3>
                    <div className="flex items-center gap-1.5 text-gray-400 text-xs">
                      <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="font-semibold truncate">{event.venue}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between px-3 py-2 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-1.5 text-gray-500">
                      <Calendar className="w-3.5 h-3.5" />
                      <span className="text-xs font-bold">Event Date</span>
                    </div>
                    <span className="text-xs font-black text-gray-900">
                      {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>

                  <div className="mt-auto pt-2">
                    <button className="w-full py-2.5 bg-gradient-to-r from-[#0A3D91] to-blue-600 text-white rounded-xl font-black text-xs uppercase tracking-wider text-center group-hover:shadow-lg transition-all relative overflow-hidden">
                      <span className="relative z-10">View Event Details</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {events.length === 0 && (
              <div className="col-span-full text-center py-16 bg-white border-2 border-gray-200 rounded-2xl">
                <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-semibold">No broadcasted events registered</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
