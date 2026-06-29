import { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Save, MapPin, Tv, DollarSign, Calendar, Shield, Building2, User, CalendarRange } from "lucide-react";
import { MOCK_EVENTS } from "../data/mock";
import { BROADCAST_STATIONS, SPONSORS, getActiveBroadcastStations, getActiveSponsors } from "../data/masterData";

export function CreateEvent() {
  const navigate = useNavigate();
  const [newEvent, setNewEvent] = useState({
    name: "",
    eventType: "single-day" as "single-day" | "multi-week",
    startDate: "",
    endDate: "",
    broadcastStationId: "",
    mainSponsorId: "",
    location: "",
    organizer: "",
    description: "",
    image: ""
  });

  const activeBroadcastStations = getActiveBroadcastStations();
  const activeSponsors = getActiveSponsors();

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Get selected broadcast station and sponsor for fallback names
    const selectedStation = BROADCAST_STATIONS.find(bs => bs.id === newEvent.broadcastStationId);
    const selectedSponsor = SPONSORS.find(sp => sp.id === newEvent.mainSponsorId);
    
    const finalImage = newEvent.image || "https://images.unsplash.com/photo-1574629810360-7efbc5eca0aa?auto=format&fit=crop&q=80&w=1200";
    
    const eventId = `e${Date.now()}`;
    const eventWithId = { 
      id: eventId,
      name: newEvent.name,
      // Use startDate as main date for compatibility
      date: newEvent.startDate,
      // Add endDate if multi-week
      endDate: newEvent.eventType === "multi-week" ? newEvent.endDate : undefined,
      location: newEvent.location,
      organizer: newEvent.organizer,
      broadcastStationId: newEvent.broadcastStationId,
      mainSponsorId: newEvent.mainSponsorId,
      // New events start as Draft and require KKF approval
      status: "Draft",
      kkfStatus: "Draft",
      image: finalImage,
      description: newEvent.description,
      // Keep backward compatibility with old field names
      station: selectedStation?.name || "",
      sponsor: selectedSponsor?.name || "",
      hasSubEvents: false,
      matchesCount: 0,
    };
    
    MOCK_EVENTS.push(eventWithId);
    
    // Show success message and redirect
    alert(`Event created successfully!\n\nEvent Type: ${newEvent.eventType === "multi-week" ? "Multi-Week Event" : "Single-Day Event"}\nStatus: Draft\n\nNext Step: Submit for KKF approval when ready.`);
    navigate(`/home/events/${eventId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F4F5F8] via-white to-[#F9FAFB]">
      <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8">
        {/* Back Button */}
        <button 
          onClick={() => navigate("/home/events")}
          className="inline-flex items-center gap-2 text-[#707070] hover:text-[#0A3D91] font-bold transition-colors group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          Back to Events
        </button>

        {/* Header */}
        <div>
          <h1 className="text-5xl md:text-6xl font-black tracking-tighter uppercase text-[#0A3D91] mb-3 leading-none">
            Create New Event
          </h1>
          <p className="text-[#707070] font-medium text-lg">
            Configure a new fight night event • Event will be saved as Draft
          </p>
        </div>

        {/* KKF Approval Info Banner */}
        <div className="bg-gradient-to-r from-amber-50 to-amber-100 border-2 border-amber-200 rounded-2xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-amber-200 rounded-xl flex items-center justify-center flex-shrink-0">
              <Shield className="w-6 h-6 text-amber-700" />
            </div>
            <div>
              <h3 className="text-lg font-black text-amber-900 mb-2 uppercase tracking-tight">
                KKF Approval Required
              </h3>
              <p className="text-amber-800 font-medium text-sm leading-relaxed">
                New events are created in <strong>Draft</strong> status. After creating the event, you'll need to submit it for <strong>KKF Federation approval</strong> before it can be published. The KKF will review the event details and either approve or reject the submission.
              </p>
            </div>
          </div>
        </div>

        {/* Event Form */}
        <form id="create-event-form" onSubmit={handleCreateEvent} className="space-y-8">
          {/* Event Information Card */}
          <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.08)] border border-[#E0E0E0]/50 overflow-hidden">
            <div className="bg-gradient-to-r from-[#0A3D91] to-[#051C42] px-8 py-6">
              <h2 className="text-2xl font-black text-white uppercase tracking-tight">Event Information</h2>
            </div>
            
            <div className="p-8 space-y-6">
              {/* Event Name */}
              <div>
                <label className="block text-sm font-black text-[#1A1A24] uppercase tracking-wider mb-3">
                  Event Name <span className="text-[#C8102E]">*</span>
                </label>
                <input 
                  required
                  type="text" 
                  value={newEvent.name}
                  onChange={(e) => setNewEvent({...newEvent, name: e.target.value})}
                  className="w-full bg-[#F4F5F8] border-2 border-[#E0E0E0] rounded-xl px-6 py-4 text-[#1A1A24] font-bold text-lg focus:outline-none focus:ring-2 focus:ring-[#0A3D91] focus:border-[#0A3D91] transition-all placeholder:text-[#B0B0B0]" 
                  placeholder="e.g., Kun Khmer Championship 2026"
                />
              </div>

              {/* Event Type */}
              <div>
                <label className="block text-sm font-black text-[#1A1A24] uppercase tracking-wider mb-3">
                  Event Type <span className="text-[#C8102E]">*</span>
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setNewEvent({...newEvent, eventType: "single-day", endDate: ""})}
                    className={`p-6 rounded-2xl border-2 transition-all ${
                      newEvent.eventType === "single-day"
                        ? "border-[#0A3D91] bg-blue-50"
                        : "border-[#E0E0E0] bg-white hover:border-[#B0B0B0]"
                    }`}
                  >
                    <Calendar className={`w-8 h-8 mx-auto mb-3 ${
                      newEvent.eventType === "single-day" ? "text-[#0A3D91]" : "text-[#707070]"
                    }`} />
                    <div className={`font-black text-sm uppercase ${
                      newEvent.eventType === "single-day" ? "text-[#0A3D91]" : "text-[#707070]"
                    }`}>
                      Single-Day Event
                    </div>
                    <div className="text-xs text-[#707070] font-medium mt-1">
                      One day event
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setNewEvent({...newEvent, eventType: "multi-week"})}
                    className={`p-6 rounded-2xl border-2 transition-all ${
                      newEvent.eventType === "multi-week"
                        ? "border-[#0A3D91] bg-blue-50"
                        : "border-[#E0E0E0] bg-white hover:border-[#B0B0B0]"
                    }`}
                  >
                    <CalendarRange className={`w-8 h-8 mx-auto mb-3 ${
                      newEvent.eventType === "multi-week" ? "text-[#0A3D91]" : "text-[#707070]"
                    }`} />
                    <div className={`font-black text-sm uppercase ${
                      newEvent.eventType === "multi-week" ? "text-[#0A3D91]" : "text-[#707070]"
                    }`}>
                      Multi-Week Event
                    </div>
                    <div className="text-xs text-[#707070] font-medium mt-1">
                      Spans multiple weeks
                    </div>
                  </button>
                </div>
              </div>

              {/* Dates Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-black text-[#1A1A24] uppercase tracking-wider mb-3">
                    Start Date <span className="text-[#C8102E]">*</span>
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#707070] pointer-events-none" />
                    <input 
                      required
                      type="date" 
                      value={newEvent.startDate}
                      onChange={(e) => setNewEvent({...newEvent, startDate: e.target.value})}
                      className="w-full bg-[#F4F5F8] border-2 border-[#E0E0E0] rounded-xl pl-12 pr-4 py-4 text-[#1A1A24] font-mono font-bold focus:outline-none focus:ring-2 focus:ring-[#0A3D91] focus:border-[#0A3D91] transition-all" 
                    />
                  </div>
                </div>

                {newEvent.eventType === "multi-week" && (
                  <div>
                    <label className="block text-sm font-black text-[#1A1A24] uppercase tracking-wider mb-3">
                      End Date <span className="text-[#C8102E]">*</span>
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#707070] pointer-events-none" />
                      <input 
                        required={newEvent.eventType === "multi-week"}
                        type="date" 
                        value={newEvent.endDate}
                        onChange={(e) => setNewEvent({...newEvent, endDate: e.target.value})}
                        min={newEvent.startDate}
                        className="w-full bg-[#F4F5F8] border-2 border-[#E0E0E0] rounded-xl pl-12 pr-4 py-4 text-[#1A1A24] font-mono font-bold focus:outline-none focus:ring-2 focus:ring-[#0A3D91] focus:border-[#0A3D91] transition-all" 
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Organizer & Location Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-black text-[#1A1A24] uppercase tracking-wider mb-3">
                    Organizer / Club <span className="text-[#C8102E]">*</span>
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#707070] pointer-events-none" />
                    <input 
                      required
                      type="text" 
                      value={newEvent.organizer}
                      onChange={(e) => setNewEvent({...newEvent, organizer: e.target.value})}
                      className="w-full bg-[#F4F5F8] border-2 border-[#E0E0E0] rounded-xl pl-12 pr-4 py-4 text-[#1A1A24] font-bold focus:outline-none focus:ring-2 focus:ring-[#0A3D91] focus:border-[#0A3D91] transition-all placeholder:text-[#B0B0B0]" 
                      placeholder="e.g., Cambodian Boxing Federation"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-black text-[#1A1A24] uppercase tracking-wider mb-3">
                    Location / Arena <span className="text-[#C8102E]">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#707070] pointer-events-none" />
                    <input 
                      required
                      type="text" 
                      value={newEvent.location}
                      onChange={(e) => setNewEvent({...newEvent, location: e.target.value})}
                      className="w-full bg-[#F4F5F8] border-2 border-[#E0E0E0] rounded-xl pl-12 pr-4 py-4 text-[#1A1A24] font-bold focus:outline-none focus:ring-2 focus:ring-[#0A3D91] focus:border-[#0A3D91] transition-all placeholder:text-[#B0B0B0]" 
                      placeholder="e.g., Morodok Techo National Stadium"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Broadcast Station - Dropdown */}
                <div>
                  <label className="block text-sm font-black text-[#1A1A24] uppercase tracking-wider mb-3">
                    Broadcast Station <span className="text-[#C8102E]">*</span>
                  </label>
                  <div className="relative">
                    <Tv className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#707070] pointer-events-none z-10" />
                    <select
                      required
                      value={newEvent.broadcastStationId}
                      onChange={(e) => setNewEvent({...newEvent, broadcastStationId: e.target.value})}
                      className="w-full bg-[#F4F5F8] border-2 border-[#E0E0E0] rounded-xl pl-12 pr-4 py-4 text-[#1A1A24] font-bold focus:outline-none focus:ring-2 focus:ring-[#0A3D91] focus:border-[#0A3D91] transition-all appearance-none cursor-pointer"
                    >
                      <option value="">Select Broadcast Station</option>
                      {activeBroadcastStations.map((station) => (
                        <option key={station.id} value={station.id}>
                          {station.logo} {station.name} ({station.type})
                        </option>
                      ))}
                    </select>
                  </div>
                  {newEvent.broadcastStationId && (
                    <p className="mt-2 text-xs text-[#707070] font-medium">
                      {BROADCAST_STATIONS.find(bs => bs.id === newEvent.broadcastStationId)?.reach} Reach
                    </p>
                  )}
                </div>

                {/* Main Sponsor - Dropdown */}
                <div>
                  <label className="block text-sm font-black text-[#1A1A24] uppercase tracking-wider mb-3">
                    Main Sponsor <span className="text-[#C8102E]">*</span>
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#707070] pointer-events-none z-10" />
                    <select
                      required
                      value={newEvent.mainSponsorId}
                      onChange={(e) => setNewEvent({...newEvent, mainSponsorId: e.target.value})}
                      className="w-full bg-[#F4F5F8] border-2 border-[#E0E0E0] rounded-xl pl-12 pr-4 py-4 text-[#1A1A24] font-bold focus:outline-none focus:ring-2 focus:ring-[#0A3D91] focus:border-[#0A3D91] transition-all appearance-none cursor-pointer"
                    >
                      <option value="">Select Main Sponsor</option>
                      {activeSponsors.map((sponsor) => (
                        <option key={sponsor.id} value={sponsor.id}>
                          {sponsor.logo} {sponsor.name} ({sponsor.tier})
                        </option>
                      ))}
                    </select>
                  </div>
                  {newEvent.mainSponsorId && (
                    <p className="mt-2 text-xs text-[#707070] font-medium">
                      {SPONSORS.find(sp => sp.id === newEvent.mainSponsorId)?.industry} Industry
                    </p>
                  )}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-black text-[#1A1A24] uppercase tracking-wider mb-3">
                  Event Description
                </label>
                <textarea
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                  rows={4}
                  className="w-full bg-[#F4F5F8] border-2 border-[#E0E0E0] rounded-xl px-6 py-4 text-[#1A1A24] font-medium focus:outline-none focus:ring-2 focus:ring-[#0A3D91] focus:border-[#0A3D91] transition-all placeholder:text-[#B0B0B0] resize-none"
                  placeholder="Provide a brief description of the event (optional)"
                />
              </div>
            </div>
          </div>

          {/* Status Information */}
          <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.08)] border border-[#E0E0E0]/50 overflow-hidden">
            <div className="bg-gradient-to-r from-gray-700 to-gray-900 px-8 py-6">
              <h2 className="text-2xl font-black text-white uppercase tracking-tight">Event Status Workflow</h2>
            </div>
            
            <div className="p-8">
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border-2 border-gray-200">
                  <div className="w-10 h-10 bg-gray-600 text-white rounded-xl flex items-center justify-center font-black">
                    1
                  </div>
                  <div className="flex-1">
                    <div className="font-black text-gray-900 text-sm uppercase tracking-wider">Draft</div>
                    <div className="text-xs text-gray-600 font-medium">Event is created and saved (current status)</div>
                  </div>
                  <div className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-xs font-black border-2 border-gray-200">
                    CURRENT
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-amber-50 rounded-xl border-2 border-amber-200 opacity-60">
                  <div className="w-10 h-10 bg-amber-600 text-white rounded-xl flex items-center justify-center font-black">
                    2
                  </div>
                  <div className="flex-1">
                    <div className="font-black text-amber-900 text-sm uppercase tracking-wider">Pending KKF Approval</div>
                    <div className="text-xs text-amber-700 font-medium">Event submitted and awaiting KKF review</div>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-emerald-50 rounded-xl border-2 border-emerald-200 opacity-60">
                  <div className="w-10 h-10 bg-emerald-600 text-white rounded-xl flex items-center justify-center font-black">
                    3
                  </div>
                  <div className="flex-1">
                    <div className="font-black text-emerald-900 text-sm uppercase tracking-wider">KKF Approved</div>
                    <div className="text-xs text-emerald-700 font-medium">Event approved by KKF Federation</div>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-xl border-2 border-blue-200 opacity-60">
                  <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center font-black">
                    4
                  </div>
                  <div className="flex-1">
                    <div className="font-black text-blue-900 text-sm uppercase tracking-wider">Published</div>
                    <div className="text-xs text-blue-700 font-medium">Event is live and visible to public</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col md:flex-row gap-4">
            <button
              type="submit"
              className="flex-1 inline-flex items-center justify-center gap-3 bg-gradient-to-r from-[#C8102E] to-[#A00D24] hover:from-[#A00D24] hover:to-[#8A0B20] text-white px-8 py-5 rounded-2xl font-black uppercase tracking-wider transition-all shadow-xl hover:shadow-2xl hover:scale-[1.02]"
            >
              <Save className="w-6 h-6" />
              Save Event as Draft
            </button>
            
            <button
              type="button"
              onClick={() => navigate("/home/events")}
              className="px-8 py-5 bg-white border-2 border-[#E0E0E0] text-[#707070] rounded-2xl font-black uppercase tracking-wider hover:bg-gray-50 transition-all"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}