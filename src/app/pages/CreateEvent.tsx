import { useState } from "react";
import { useNavigate } from "react-router";
import {
  ArrowLeft, Save, MapPin, Tv, DollarSign, Calendar, Building2,
  CalendarRange, Trophy, Users, Target, Flame, Shield
} from "lucide-react";
import { MOCK_EVENTS } from "../data/mock";
import { BROADCAST_STATIONS, SPONSORS, getActiveBroadcastStations, getActiveSponsors } from "../data/masterData";
import {
  EVENT_TYPE_CONFIG, type EventType,
  TOURNAMENT_FORMAT_CONFIG, type TournamentFormat,
  TOURNAMENT_WEIGHT_CLASSES
} from "../data/event-types";
import { toast } from "sonner";
import { clsx } from "clsx";

export function CreateEvent() {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [newEvent, setNewEvent] = useState({
    name: "",
    eventCategory: "" as EventType | "",
    eventType: "single-day" as "single-day" | "multi-week",
    startDate: "",
    endDate: "",
    broadcastStationId: "",
    mainSponsorId: "",
    location: "",
    organizer: "",
    description: "",
    image: "",
    // Tournament-specific fields
    isTournament: false,
    tournamentFormat: "" as TournamentFormat | "",
    tournamentWeightClass: "",
    expectedParticipants: 8,
  });

  const activeBroadcastStations = getActiveBroadcastStations();
  const activeSponsors = getActiveSponsors();

  const isTournamentEvent = newEvent.eventCategory === "National Tournament" ||
                           newEvent.eventCategory === "Club Tournament" ||
                           newEvent.eventCategory === "Regional";

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
      eventCategory: newEvent.eventCategory,
      // Use startDate as main date for compatibility
      date: newEvent.startDate,
      // Add endDate if multi-week
      endDate: newEvent.eventType === "multi-week" ? newEvent.endDate : undefined,
      location: newEvent.location,
      organizer: newEvent.organizer,
      broadcastStationId: newEvent.broadcastStationId,
      mainSponsorId: newEvent.mainSponsorId,
      status: "Published",
      image: finalImage,
      description: newEvent.description,
      // Keep backward compatibility with old field names
      station: selectedStation?.name || "",
      sponsor: selectedSponsor?.name || "",
      hasSubEvents: false,
      matchesCount: 0,
      // Tournament fields
      isTournament: isTournamentEvent,
      tournamentFormat: isTournamentEvent ? newEvent.tournamentFormat : undefined,
      tournamentWeightClass: isTournamentEvent ? newEvent.tournamentWeightClass : undefined,
      expectedParticipants: isTournamentEvent ? newEvent.expectedParticipants : undefined,
    };

    MOCK_EVENTS.push(eventWithId);

    // Show success message
    if (isTournamentEvent) {
      toast.success(`✅ ${newEvent.tournamentFormat} tournament created successfully!`);
    } else {
      toast.success(`✅ Event created successfully!`);
    }

    navigate(`/home/events/${eventId}`);
  };

  const eventCategories: EventType[] = [
    "National Event",
    "National Tournament",
    "International",
    "Championship",
    "Regional",
    "Club Tournament",
    "Ranking Fight",
    "Friendly Match"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F4F5F8] via-white to-[#F9FAFB]">
      <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-8">
        {/* Back Button */}
        <button
          onClick={() => navigate("/home/events")}
          className="inline-flex items-center gap-2 text-[#707070] hover:text-[#0A3D91] font-bold transition-colors group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          Back to Events
        </button>

        {/* Header */}
        <div className="bg-white rounded-3xl shadow-lg border-2 border-[#E0E0E0] p-8">
          <h1 className="text-5xl md:text-6xl font-black tracking-tighter uppercase text-[#0A3D91] mb-3 leading-none">
            Create New Event
          </h1>
          <p className="text-[#707070] font-bold text-lg">
            {step === 1 && "Select event category and format"}
            {step === 2 && "Configure event details and schedule"}
            {step === 3 && "Set up tournament structure"}
          </p>

          {/* Step Indicator */}
          <div className="flex items-center gap-4 mt-6">
            <div className={clsx(
              "flex items-center gap-2 px-4 py-2 rounded-xl font-black text-sm transition-all",
              step === 1 ? "bg-[#0A3D91] text-white" : "bg-gray-100 text-gray-500"
            )}>
              <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center font-black text-xs">1</div>
              Category
            </div>
            <div className="h-1 flex-1 bg-gray-200 rounded"></div>
            <div className={clsx(
              "flex items-center gap-2 px-4 py-2 rounded-xl font-black text-sm transition-all",
              step === 2 ? "bg-[#0A3D91] text-white" : step > 2 ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
            )}>
              <div className={clsx(
                "w-6 h-6 rounded-full flex items-center justify-center font-black text-xs",
                step === 2 ? "bg-white/20" : "bg-white/30"
              )}>2</div>
              Details
            </div>
            {isTournamentEvent && (
              <>
                <div className="h-1 flex-1 bg-gray-200 rounded"></div>
                <div className={clsx(
                  "flex items-center gap-2 px-4 py-2 rounded-xl font-black text-sm transition-all",
                  step === 3 ? "bg-[#0A3D91] text-white" : "bg-gray-100 text-gray-500"
                )}>
                  <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center font-black text-xs">3</div>
                  Tournament
                </div>
              </>
            )}
          </div>
        </div>

        {/* Event Form */}
        <form id="create-event-form" onSubmit={handleCreateEvent} className="space-y-8">

          {/* STEP 1: Event Category Selection */}
          {step === 1 && (
            <div className="bg-white rounded-3xl shadow-lg border-2 border-[#E0E0E0] overflow-hidden">
              <div className="bg-gradient-to-r from-[#0A3D91] to-[#051C42] px-8 py-6">
                <h2 className="text-2xl font-black text-white uppercase tracking-tight">Select Event Category</h2>
                <p className="text-white/80 font-medium mt-1">Choose the type of event you want to create</p>
              </div>

              <div className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {eventCategories.map((category) => {
                    const config = EVENT_TYPE_CONFIG[category];
                    const isSelected = newEvent.eventCategory === category;

                    return (
                      <button
                        key={category}
                        type="button"
                        onClick={() => setNewEvent({...newEvent, eventCategory: category})}
                        className={clsx(
                          "p-6 rounded-2xl border-2 transition-all text-left group",
                          isSelected
                            ? "border-[#0A3D91] bg-blue-50 shadow-lg scale-105"
                            : "border-[#E0E0E0] bg-white hover:border-[#0A3D91]/50 hover:shadow-md"
                        )}
                      >
                        <div className="text-4xl mb-3">{config.icon}</div>
                        <div className={clsx(
                          "font-black text-base mb-2 transition-colors",
                          isSelected ? "text-[#0A3D91]" : "text-[#1A1A24]"
                        )}>
                          {config.label}
                        </div>
                        <div className="text-xs text-[#707070] font-medium leading-relaxed">
                          {config.description}
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="flex justify-end mt-8">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    disabled={!newEvent.eventCategory}
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-[#0A3D91] to-[#051C42] text-white px-8 py-4 rounded-xl font-black uppercase tracking-wide hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Continue to Details
                    <ArrowLeft className="w-5 h-5 rotate-180" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Event Details */}
          {step === 2 && (
            <div className="space-y-8">
              <div className="bg-white rounded-3xl shadow-lg border-2 border-[#E0E0E0] overflow-hidden">
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
                      placeholder="e.g., Kun Khmer National Championship 2026"
                    />
                  </div>

                  {/* Event Duration Type */}
                  <div>
                    <label className="block text-sm font-black text-[#1A1A24] uppercase tracking-wider mb-3">
                      Event Duration <span className="text-[#C8102E]">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => setNewEvent({...newEvent, eventType: "single-day", endDate: ""})}
                        className={clsx(
                          "p-6 rounded-2xl border-2 transition-all",
                          newEvent.eventType === "single-day"
                            ? "border-[#0A3D91] bg-blue-50"
                            : "border-[#E0E0E0] bg-white hover:border-[#B0B0B0]"
                        )}
                      >
                        <Calendar className={clsx(
                          "w-8 h-8 mx-auto mb-3",
                          newEvent.eventType === "single-day" ? "text-[#0A3D91]" : "text-[#707070]"
                        )} />
                        <div className={clsx(
                          "font-black text-sm uppercase",
                          newEvent.eventType === "single-day" ? "text-[#0A3D91]" : "text-[#707070]"
                        )}>
                          Single-Day Event
                        </div>
                        <div className="text-xs text-[#707070] font-medium mt-1">
                          One day event
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setNewEvent({...newEvent, eventType: "multi-week"})}
                        className={clsx(
                          "p-6 rounded-2xl border-2 transition-all",
                          newEvent.eventType === "multi-week"
                            ? "border-[#0A3D91] bg-blue-50"
                            : "border-[#E0E0E0] bg-white hover:border-[#B0B0B0]"
                        )}
                      >
                        <CalendarRange className={clsx(
                          "w-8 h-8 mx-auto mb-3",
                          newEvent.eventType === "multi-week" ? "text-[#0A3D91]" : "text-[#707070]"
                        )} />
                        <div className={clsx(
                          "font-black text-sm uppercase",
                          newEvent.eventType === "multi-week" ? "text-[#0A3D91]" : "text-[#707070]"
                        )}>
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
                    {/* Broadcast Station */}
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
                    </div>

                    {/* Main Sponsor */}
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

              {/* Navigation Buttons */}
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-8 py-4 bg-white border-2 border-[#E0E0E0] text-[#707070] rounded-xl font-black uppercase hover:bg-gray-50 transition-all"
                >
                  Back
                </button>

                {isTournamentEvent ? (
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="flex-1 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#0A3D91] to-[#051C42] text-white px-8 py-4 rounded-xl font-black uppercase tracking-wide hover:shadow-lg transition-all"
                  >
                    Continue to Tournament Setup
                    <ArrowLeft className="w-5 h-5 rotate-180" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="flex-1 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#C8102E] to-[#A00D24] text-white px-8 py-4 rounded-xl font-black uppercase tracking-wide hover:shadow-lg transition-all"
                  >
                    <Save className="w-5 h-5" />
                    Create Event
                  </button>
                )}
              </div>
            </div>
          )}

          {/* STEP 3: Tournament Setup (only for tournament events) */}
          {step === 3 && isTournamentEvent && (
            <div className="space-y-8">
              <div className="bg-white rounded-3xl shadow-lg border-2 border-[#E0E0E0] overflow-hidden">
                <div className="bg-gradient-to-r from-[#F2C94C] to-[#E6B800] px-8 py-6">
                  <h2 className="text-2xl font-black text-[#1A1A24] uppercase tracking-tight flex items-center gap-3">
                    <Trophy className="w-7 h-7" />
                    Tournament Configuration
                  </h2>
                  <p className="text-[#1A1A24]/80 font-bold mt-1">Set up bracket format and structure</p>
                </div>

                <div className="p-8 space-y-6">
                  {/* Tournament Format */}
                  <div>
                    <label className="block text-sm font-black text-[#1A1A24] uppercase tracking-wider mb-4">
                      Tournament Format <span className="text-[#C8102E]">*</span>
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {(Object.entries(TOURNAMENT_FORMAT_CONFIG) as [TournamentFormat, typeof TOURNAMENT_FORMAT_CONFIG[TournamentFormat]][]).map(([format, config]) => {
                        const isSelected = newEvent.tournamentFormat === format;

                        return (
                          <button
                            key={format}
                            type="button"
                            onClick={() => setNewEvent({...newEvent, tournamentFormat: format})}
                            className={clsx(
                              "p-6 rounded-2xl border-2 transition-all text-left",
                              isSelected
                                ? "border-[#F2C94C] bg-yellow-50 shadow-lg"
                                : "border-[#E0E0E0] bg-white hover:border-[#F2C94C]/50"
                            )}
                          >
                            <div className="flex items-start gap-3">
                              <div className="text-3xl">{config.icon}</div>
                              <div className="flex-1">
                                <div className={clsx(
                                  "font-black text-base mb-2",
                                  isSelected ? "text-[#1A1A24]" : "text-[#1A1A24]"
                                )}>
                                  {config.label}
                                </div>
                                <div className="text-xs text-[#707070] font-medium leading-relaxed mb-3">
                                  {config.description}
                                </div>
                                <div className="text-xs font-bold text-[#0A3D91]">
                                  Min: {config.minParticipants} • Ideal: {config.idealParticipants.slice(0, 3).join(", ")}
                                </div>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Weight Class */}
                  <div>
                    <label className="block text-sm font-black text-[#1A1A24] uppercase tracking-wider mb-3">
                      Weight Class <span className="text-[#C8102E]">*</span>
                    </label>
                    <div className="relative">
                      <Target className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#707070] pointer-events-none z-10" />
                      <select
                        required
                        value={newEvent.tournamentWeightClass}
                        onChange={(e) => setNewEvent({...newEvent, tournamentWeightClass: e.target.value})}
                        className="w-full bg-[#F4F5F8] border-2 border-[#E0E0E0] rounded-xl pl-12 pr-4 py-4 text-[#1A1A24] font-bold focus:outline-none focus:ring-2 focus:ring-[#F2C94C] focus:border-[#F2C94C] transition-all appearance-none cursor-pointer"
                      >
                        <option value="">Select Weight Class</option>
                        {TOURNAMENT_WEIGHT_CLASSES.map((wc) => (
                          <option key={wc.value} value={wc.value}>
                            {wc.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Expected Participants */}
                  <div>
                    <label className="block text-sm font-black text-[#1A1A24] uppercase tracking-wider mb-3">
                      Expected Participants <span className="text-[#C8102E]">*</span>
                    </label>
                    <div className="relative">
                      <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#707070] pointer-events-none" />
                      <input
                        required
                        type="number"
                        min={newEvent.tournamentFormat ? TOURNAMENT_FORMAT_CONFIG[newEvent.tournamentFormat]?.minParticipants : 4}
                        value={newEvent.expectedParticipants}
                        onChange={(e) => setNewEvent({...newEvent, expectedParticipants: parseInt(e.target.value) || 8})}
                        className="w-full bg-[#F4F5F8] border-2 border-[#E0E0E0] rounded-xl pl-12 pr-4 py-4 text-[#1A1A24] font-bold focus:outline-none focus:ring-2 focus:ring-[#F2C94C] focus:border-[#F2C94C] transition-all"
                        placeholder="8"
                      />
                    </div>
                    {newEvent.tournamentFormat && (
                      <p className="mt-2 text-xs text-[#707070] font-bold">
                        💡 Ideal numbers for {TOURNAMENT_FORMAT_CONFIG[newEvent.tournamentFormat].label}: {TOURNAMENT_FORMAT_CONFIG[newEvent.tournamentFormat].idealParticipants.join(", ")}
                      </p>
                    )}
                  </div>

                  {/* Tournament Info Box */}
                  <div className="bg-gradient-to-r from-blue-50 to-white rounded-xl p-5 border-2 border-blue-200">
                    <div className="flex items-start gap-3">
                      <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-black text-blue-900 text-sm mb-2">
                          What Happens Next?
                        </h4>
                        <ol className="space-y-2 text-sm text-blue-700">
                          <li className="flex items-start gap-2">
                            <span className="font-black">1.</span>
                            <span>Tournament created with bracket structure</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="font-black">2.</span>
                            <span>Assign fighters to tournament slots</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="font-black">3.</span>
                            <span>Bracket auto-generates based on format</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="font-black">4.</span>
                            <span>Schedule matches for each round</span>
                          </li>
                        </ol>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Navigation Buttons */}
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-8 py-4 bg-white border-2 border-[#E0E0E0] text-[#707070] rounded-xl font-black uppercase hover:bg-gray-50 transition-all"
                >
                  Back
                </button>

                <button
                  type="submit"
                  className="flex-1 inline-flex items-center justify-center gap-3 bg-gradient-to-r from-[#C8102E] to-[#A00D24] hover:from-[#A00D24] hover:to-[#8A0B20] text-white px-8 py-5 rounded-2xl font-black uppercase tracking-wider transition-all shadow-xl hover:shadow-2xl hover:scale-[1.02]"
                >
                  <Save className="w-6 h-6" />
                  Create Tournament
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
