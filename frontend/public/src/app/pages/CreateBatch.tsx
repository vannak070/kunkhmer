import { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Calendar, MapPin, Building2, Radio, Award, Sparkles, Info, AlertCircle } from "lucide-react";
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

  // STRICT RULE: ❌ Cannot create Batch if Event ≠ Approved
  // Only allow batch creation for KKF Approved or Approved events
  const approvedEvents = MOCK_EVENTS.filter(
    event => 
      event.status === "KKF Approved" || 
      event.status === "Approved"
  );

  // Get events in other statuses for informational display
  const pendingEvents = MOCK_EVENTS.filter(
    event => event.status === "Pending KKF Approval"
  );

  const draftEvents = MOCK_EVENTS.filter(
    event => event.status === "Draft"
  );

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
      createdDate: new Date().toISOString(), // Changed from createdAt to createdDate
      updatedAt: new Date().toISOString(),
    };

    sessionStorage.setItem(`batch-${newBatchId}`, JSON.stringify(newBatch));

    // Debug: Verify storage
    console.log("🔍 CreateBatch Debug:");
    console.log("  New Batch ID:", newBatchId);
    console.log("  Storage Key:", `batch-${newBatchId}`);
    console.log("  Stored Batch:", newBatch);
    console.log("  Navigate to:", `/matches/${newBatchId}`);

    toast.success("✅ Batch created successfully! Add matches to your batch.");
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
    <div className="min-h-screen bg-gradient-to-br from-[#F4F5F8] via-white to-[#F4F5F8] py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/home/matches")}
            className="inline-flex items-center gap-2 text-[#0A3D91] hover:text-[#082F6D] font-bold mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Matches
          </button>
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#C8102E] to-[#A00D24] flex items-center justify-center shadow-lg">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-[#1A1A24] uppercase tracking-tight">
                Create New Batch
              </h1>
              <p className="text-[#707070] font-semibold mt-1">
                Set up a new match batch for your event
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Workflow Information */}
          {(pendingEvents.length > 0 || draftEvents.length > 0) && (
            <div className="bg-gradient-to-r from-[#FFD700]/10 to-[#FFD700]/5 border-2 border-[#FFD700]/30 rounded-2xl p-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-6 h-6 text-[#FFD700] flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-black text-[#1A1A24] uppercase mb-3">KKF Approval Workflow</h3>
                  <p className="text-sm text-[#1A1A24] font-semibold mb-4">
                    ❌ <strong>Rule:</strong> Batches can only be created for KKF Approved events
                  </p>
                  
                  {pendingEvents.length > 0 && (
                    <div className="mb-3">
                      <p className="text-sm font-bold text-[#1A1A24] mb-2">
                        ⏳ Events Pending KKF Approval ({pendingEvents.length}):
                      </p>
                      <div className="space-y-1">
                        {pendingEvents.map(event => (
                          <div key={event.id} className="text-sm text-[#707070] font-semibold ml-4">
                            • {event.name} - {event.date}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {draftEvents.length > 0 && (
                    <div>
                      <p className="text-sm font-bold text-[#1A1A24] mb-2">
                        📝 Draft Events ({draftEvents.length}):
                      </p>
                      <div className="space-y-1">
                        {draftEvents.map(event => (
                          <div key={event.id} className="text-sm text-[#707070] font-semibold ml-4">
                            • {event.name} - {event.date}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <p className="text-xs text-[#707070] font-semibold mt-4">
                    💡 These events must be approved by KKF before you can create batches for them.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Event Selection */}
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-[#E0E0E0]">
            <h2 className="text-xl font-black text-[#1A1A24] uppercase mb-6 flex items-center gap-2">
              <Calendar className="w-6 h-6 text-[#0A3D91]" />
              Event Details
            </h2>

            <div className="space-y-6">
              {/* Event Dropdown */}
              <div>
                <label className="block text-sm font-bold text-[#1A1A24] uppercase mb-2">
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
                  className="w-full bg-[#F4F5F8] border-2 border-[#E0E0E0] rounded-xl px-4 py-3.5 text-[#1A1A24] font-semibold focus:outline-none focus:border-[#0A3D91]"
                  required
                >
                  <option value="">Choose an event...</option>
                  {approvedEvents.map(event => (
                    <option key={event.id} value={event.id}>
                      {event.name} - {event.date}
                    </option>
                  ))}
                </select>
                {approvedEvents.length === 0 && (
                  <p className="text-[#C8102E] text-sm mt-2 font-semibold">
                    No approved events available. Please create an event first.
                  </p>
                )}
              </div>

              {/* Event Preview */}
              {selectedEvent && (
                <>
                  <div className="bg-gradient-to-r from-[#0A3D91]/5 to-[#C8102E]/5 border-2 border-[#E0E0E0] rounded-xl p-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-[#707070] font-semibold">Date:</span>
                        <p className="text-[#1A1A24] font-bold">{selectedEvent.date}</p>
                      </div>
                      <div>
                        <span className="text-[#707070] font-semibold">Location:</span>
                        <p className="text-[#1A1A24] font-bold">{selectedEvent.location}</p>
                      </div>
                      <div>
                        <span className="text-[#707070] font-semibold">Status:</span>
                        <p className="text-[#1A1A24] font-bold">{selectedEvent.status}</p>
                      </div>
                      <div>
                        <span className="text-[#707070] font-semibold">Organizer:</span>
                        <p className="text-[#1A1A24] font-bold">{selectedEvent.organizer}</p>
                      </div>
                    </div>
                  </div>

                  {/* Existing Batches Info */}
                  {existingBatches.length > 0 && (
                    <div className="bg-[#0A3D91]/5 border-2 border-[#0A3D91]/20 rounded-xl p-4">
                      <div className="flex items-start gap-3">
                        <Info className="w-5 h-5 text-[#0A3D91] flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm font-bold text-[#1A1A24] mb-2">
                            This event already has {existingBatches.length} batch{existingBatches.length > 1 ? 'es' : ''}:
                          </p>
                          <div className="space-y-2">
                            {existingBatches.map(batch => (
                              <div key={batch.id} className="flex items-center justify-between bg-white/50 rounded-lg px-3 py-2">
                                <div>
                                  <p className="font-bold text-[#1A1A24] text-sm">{batch.name}</p>
                                  <p className="text-xs text-[#707070] font-semibold">
                                    {batch.totalMatches} matches • {batch.status}
                                  </p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => navigate(`/matches/${batch.id}`)}
                                  className="text-[#0A3D91] hover:text-[#082F6D] font-bold text-sm"
                                >
                                  View →
                                </button>
                              </div>
                            ))}
                          </div>
                          <p className="text-xs text-[#707070] font-semibold mt-3">
                            💡 You can create multiple batches for the same event (e.g., Main Card, Preliminary Fights, etc.)
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Batch Information */}
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-[#E0E0E0]">
            <h2 className="text-xl font-black text-[#1A1A24] uppercase mb-6 flex items-center gap-2">
              <Award className="w-6 h-6 text-[#FFD700]" />
              Batch Information
            </h2>

            <div className="space-y-6">
              {/* Batch Name */}
              <div>
                <label className="block text-sm font-bold text-[#1A1A24] uppercase mb-2">
                  Batch Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Main Card, Preliminary Fights, Championship Bout"
                  className="w-full bg-[#F4F5F8] border-2 border-[#E0E0E0] rounded-xl px-4 py-3.5 text-[#1A1A24] font-semibold focus:outline-none focus:border-[#0A3D91]"
                  required
                />
              </div>

              {/* Batch Type */}
              <div>
                <label className="block text-sm font-bold text-[#1A1A24] uppercase mb-2">
                  Batch Type *
                </label>
                <select
                  value={formData.batchType}
                  onChange={(e) => setFormData({ ...formData, batchType: e.target.value })}
                  className="w-full bg-[#F4F5F8] border-2 border-[#E0E0E0] rounded-xl px-4 py-3.5 text-[#1A1A24] font-semibold focus:outline-none focus:border-[#0A3D91]"
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
                <label className="block text-sm font-bold text-[#1A1A24] uppercase mb-2">
                  Batch Date *
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full bg-[#F4F5F8] border-2 border-[#E0E0E0] rounded-xl px-4 py-3.5 text-[#1A1A24] font-semibold focus:outline-none focus:border-[#0A3D91]"
                  required
                />
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-bold text-[#1A1A24] uppercase mb-2">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  Location
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Venue location (auto-filled from event)"
                  className="w-full bg-[#F4F5F8] border-2 border-[#E0E0E0] rounded-xl px-4 py-3.5 text-[#1A1A24] font-semibold focus:outline-none focus:border-[#0A3D91]"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between gap-4 bg-white rounded-2xl p-6 shadow-sm border border-[#E0E0E0]">
            <button
              type="button"
              onClick={() => navigate("/home/matches")}
              className="px-8 py-3.5 rounded-xl font-bold uppercase tracking-wide transition-all bg-[#E0E0E0] text-[#1A1A24] hover:bg-[#D0D0D0]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!formData.eventId || !formData.name || !formData.batchType || !formData.date}
              className="px-8 py-3.5 rounded-xl font-bold uppercase tracking-wide transition-all shadow-lg hover:shadow-xl bg-gradient-to-r from-[#C8102E] to-[#A00D24] text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Create Batch & Add Matches
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}