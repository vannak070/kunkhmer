import { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Calendar, MapPin, Award, Sparkles, Info, Box } from "lucide-react";
import { toast } from "sonner";
import { MOCK_EVENTS } from "../data/mock";
import { MOCK_BATCHES } from "../data/batches";

export function CreateBatch() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    eventId: "",
    name: "",
    batchType: "", // Main / Prelim / Weekly
    date: "",
    location: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.eventId) {
      toast.error("Please select an event");
      return;
    }

    if (!formData.name.trim()) {
      toast.error("Please enter a batch name");
      return;
    }

    if (!formData.batchType) {
      toast.error("Please select a batch type");
      return;
    }

    if (!formData.date) {
      toast.error("Please select a date");
      return;
    }

    const selectedEvent = MOCK_EVENTS.find(e => e.id === formData.eventId);

    // Create new batch ID
    const newBatchId = `batch-${Date.now()}`;

    // Store batch data in sessionStorage to be picked up by BatchDetail page
    const newBatch = {
      id: newBatchId,
      batchNumber: "NEW",
      name: formData.name,
      batchType: formData.batchType, // Main / Prelim / Weekly
      eventId: formData.eventId,
      eventName: selectedEvent?.name || "",
      eventDate: formData.date,
      status: "Draft" as const,
      totalMatches: 0,
      date: formData.date,
      location: formData.location || selectedEvent?.location || "",
      organizerClub: selectedEvent?.organizer || "",
      broadcastStation: selectedEvent?.station || "",
      mainSponsor: selectedEvent?.sponsor || "",
      matches: [],
      createdBy: "Current User",
      createdDate: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    sessionStorage.setItem(`batch-${newBatchId}`, JSON.stringify(newBatch));

    toast.success("✅ Batch created successfully!");
    navigate(`/matches/${newBatchId}`);
  };

  const selectedEvent = formData.eventId 
    ? MOCK_EVENTS.find(e => e.id === formData.eventId)
    : null;

  // Get existing batches for the selected event
  const existingBatches = formData.eventId
    ? MOCK_BATCHES.filter(b => b.eventId === formData.eventId)
    : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F4F5F8] via-white to-[#F9FAFB]">
      <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6">
        {/* Back Button */}
        <button
          onClick={() => navigate("/home/matches")}
          className="inline-flex items-center gap-2 text-[#707070] hover:text-[#0A3D91] font-bold transition-colors group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          Back to Matches
        </button>

        {/* Header */}
        <div className="bg-white rounded-3xl shadow-lg border-2 border-[#E0E0E0] p-8">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-[#C8102E] to-[#A00D24] rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
              <Box className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-4xl md:text-5xl font-black tracking-tight text-[#0A3D91] uppercase leading-none mb-2">
                Create New Batch
              </h1>
              <p className="text-[#707070] font-bold text-lg">
                Set up a new match batch for your event
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Event Selection */}
          <div className="bg-white rounded-3xl shadow-lg border-2 border-[#E0E0E0] p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-[#0A3D91] to-[#082F6E] rounded-xl flex items-center justify-center">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl font-black text-[#1A1A24] uppercase tracking-tight">
                Event Details
              </h2>
            </div>

            <div className="space-y-6">
              {/* Event Dropdown */}
              <div>
                <label className="block text-sm font-black text-[#1A1A24] uppercase mb-3 tracking-wide">
                  Select Event *
                </label>
                <select
                  value={formData.eventId}
                  onChange={(e) => {
                    const event = MOCK_EVENTS.find(ev => ev.id === e.target.value);
                    setFormData({
                      ...formData,
                      eventId: e.target.value,
                      location: event?.location || "",
                      date: event?.date || "",
                    });
                  }}
                  className="w-full bg-[#F4F5F8] border-2 border-[#E0E0E0] rounded-xl px-4 py-3.5 text-[#1A1A24] font-bold focus:outline-none focus:border-[#0A3D91] focus:ring-2 focus:ring-[#0A3D91]/20 transition-all hover:border-[#0A3D91]/50 cursor-pointer"
                  required
                >
                  <option value="">Choose an event...</option>
                  {MOCK_EVENTS.map(event => (
                    <option key={event.id} value={event.id}>
                      {event.name} - {event.date}
                    </option>
                  ))}
                </select>
                {MOCK_EVENTS.length === 0 && (
                  <p className="text-[#C8102E] text-sm mt-2 font-bold">
                    No events available. Please create an event first.
                  </p>
                )}
              </div>

              {/* Event Preview */}
              {selectedEvent && (
                <>
                  <div className="bg-gradient-to-r from-[#F4F5F8] to-white border-2 border-[#E0E0E0] rounded-2xl p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <span className="text-xs text-[#707070] font-bold uppercase tracking-wide">Date</span>
                        <p className="text-[#1A1A24] font-black text-lg">{selectedEvent.date}</p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-xs text-[#707070] font-bold uppercase tracking-wide">Location</span>
                        <p className="text-[#1A1A24] font-black text-lg">{selectedEvent.location}</p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-xs text-[#707070] font-bold uppercase tracking-wide">Status</span>
                        <p className="text-[#1A1A24] font-black text-lg">{selectedEvent.status}</p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-xs text-[#707070] font-bold uppercase tracking-wide">Organizer</span>
                        <p className="text-[#1A1A24] font-black text-lg">{selectedEvent.organizer}</p>
                      </div>
                    </div>
                  </div>

                  {/* Existing Batches Info */}
                  {existingBatches.length > 0 && (
                    <div className="bg-gradient-to-r from-blue-50 to-white border-2 border-blue-200 rounded-2xl p-6">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                          <Info className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-black text-blue-900 mb-3 uppercase tracking-tight">
                            This event has {existingBatches.length} existing batch{existingBatches.length > 1 ? 'es' : ''}
                          </p>
                          <div className="space-y-2">
                            {existingBatches.map(batch => (
                              <div key={batch.id} className="flex items-center justify-between bg-white rounded-xl px-4 py-3 border border-blue-100 hover:border-blue-300 transition-all">
                                <div>
                                  <p className="font-black text-[#1A1A24] text-sm">{batch.name}</p>
                                  <p className="text-xs text-[#707070] font-bold mt-0.5">
                                    {batch.totalMatches} matches • {batch.status}
                                  </p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => navigate(`/matches/${batch.id}`)}
                                  className="text-[#0A3D91] hover:text-[#082F6D] font-black text-sm hover:underline transition-all"
                                >
                                  View →
                                </button>
                              </div>
                            ))}
                          </div>
                          <div className="mt-4 flex items-start gap-2 bg-blue-100/50 rounded-lg px-3 py-2">
                            <Sparkles className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                            <p className="text-xs text-blue-700 font-bold">
                              You can create multiple batches for the same event (e.g., Main Card, Preliminary Fights, etc.)
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Batch Information */}
          <div className="bg-white rounded-3xl shadow-lg border-2 border-[#E0E0E0] p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-[#F2C94C] to-[#E6B800] rounded-xl flex items-center justify-center">
                <Award className="w-5 h-5 text-[#1A1A24]" />
              </div>
              <h2 className="text-2xl font-black text-[#1A1A24] uppercase tracking-tight">
                Batch Information
              </h2>
            </div>

            <div className="space-y-6">
              {/* Batch Name */}
              <div>
                <label className="block text-sm font-black text-[#1A1A24] uppercase mb-3 tracking-wide">
                  Batch Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Main Card, Preliminary Fights, Championship Bout"
                  className="w-full bg-[#F4F5F8] border-2 border-[#E0E0E0] rounded-xl px-4 py-3.5 text-[#1A1A24] font-bold focus:outline-none focus:border-[#0A3D91] focus:ring-2 focus:ring-[#0A3D91]/20 transition-all placeholder:text-[#B0B0B0]"
                  required
                />
              </div>

              {/* Batch Type */}
              <div>
                <label className="block text-sm font-black text-[#1A1A24] uppercase mb-3 tracking-wide">
                  Batch Type *
                </label>
                <select
                  value={formData.batchType}
                  onChange={(e) => setFormData({ ...formData, batchType: e.target.value })}
                  className="w-full bg-[#F4F5F8] border-2 border-[#E0E0E0] rounded-xl px-4 py-3.5 text-[#1A1A24] font-bold focus:outline-none focus:border-[#0A3D91] focus:ring-2 focus:ring-[#0A3D91]/20 transition-all hover:border-[#0A3D91]/50 cursor-pointer"
                  required
                >
                  <option value="">Choose a batch type...</option>
                  <option value="Main">Main Card</option>
                  <option value="Prelim">Preliminary Fights</option>
                  <option value="Weekly">Weekly Card</option>
                </select>
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-black text-[#1A1A24] uppercase mb-3 tracking-wide">
                  Batch Date *
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full bg-[#F4F5F8] border-2 border-[#E0E0E0] rounded-xl px-4 py-3.5 text-[#1A1A24] font-bold focus:outline-none focus:border-[#0A3D91] focus:ring-2 focus:ring-[#0A3D91]/20 transition-all cursor-pointer"
                  required
                />
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-black text-[#1A1A24] uppercase mb-3 tracking-wide flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Location
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Venue location (auto-filled from event)"
                  className="w-full bg-[#F4F5F8] border-2 border-[#E0E0E0] rounded-xl px-4 py-3.5 text-[#1A1A24] font-bold focus:outline-none focus:border-[#0A3D91] focus:ring-2 focus:ring-[#0A3D91]/20 transition-all placeholder:text-[#B0B0B0]"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <button
              type="button"
              onClick={() => navigate("/home/matches")}
              className="w-full sm:w-auto px-8 py-4 rounded-xl font-black uppercase tracking-wide transition-all bg-white border-2 border-[#E0E0E0] text-[#1A1A24] hover:bg-[#F4F5F8] hover:border-[#0A3D91]/30"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!formData.eventId || !formData.name || !formData.batchType || !formData.date}
              className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-black uppercase tracking-wide transition-all shadow-lg hover:shadow-xl bg-gradient-to-r from-[#C8102E] to-[#A00D24] text-white hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              <Box className="w-5 h-5" />
              Create Batch
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}