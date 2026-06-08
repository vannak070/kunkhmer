import { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Calendar, MapPin, Award, Sparkles, Info, Box } from "lucide-react";
import { toast } from "sonner";
import { clsx } from "clsx";
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
    navigate(`/home/batches/${newBatchId}`);
  };

  const selectedEvent = formData.eventId 
    ? MOCK_EVENTS.find(e => e.id === formData.eventId)
    : null;

  // Get existing batches for the selected event
  const existingBatches = formData.eventId
    ? MOCK_BATCHES.filter(b => b.eventId === formData.eventId)
    : [];

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6 animate-fadeIn">
      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/home/matches")}
            className="p-2.5 bg-white hover:bg-muted text-primary border border-border/80 rounded-xl transition-all active:scale-95 shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Create New Batch</h1>
            <p className="text-sm text-muted-foreground mt-0.5 font-medium">
              Set up a new match batch for an event
            </p>
          </div>
        </div>
      </header>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Event Selection */}
        <div className="card-premium p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-border/60">
            <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground uppercase tracking-tight">
                Event Details
              </h2>
              <p className="text-xs text-muted-foreground">Select the host event for this match batch</p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Event Dropdown */}
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase mb-2 tracking-wide">
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
                className="input-premium cursor-pointer py-2.5"
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
                <p className="text-destructive text-xs mt-2 font-semibold">
                  No events available. Please create an event first.
                </p>
              )}
            </div>

            {/* Event Preview */}
            {selectedEvent && (
              <>
                <div className="bg-muted/30 border border-border/60 rounded-xl p-5">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Date</span>
                      <p className="text-foreground font-semibold text-sm">{selectedEvent.date}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Location</span>
                      <p className="text-foreground font-semibold text-sm truncate">{selectedEvent.location}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Status</span>
                      <div>
                        <span className={clsx(
                          "badge-premium text-[10px] font-bold",
                          selectedEvent.status === "Draft" && "badge-amber",
                          selectedEvent.status === "Active" && "badge-blue",
                          selectedEvent.status === "Completed" && "badge-emerald",
                        )}>
                          {selectedEvent.status}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Organizer</span>
                      <p className="text-foreground font-semibold text-sm truncate">{selectedEvent.organizer}</p>
                    </div>
                  </div>
                </div>

                {/* Existing Batches Info */}
                {existingBatches.length > 0 && (
                  <div className="bg-blue-50/40 border border-blue-100 rounded-xl p-5">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Info className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-bold text-blue-900 mb-2 uppercase tracking-wider">
                          This event has {existingBatches.length} existing batch{existingBatches.length > 1 ? 'es' : ''}
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {existingBatches.map(batch => (
                            <div key={batch.id} className="flex items-center justify-between bg-white/80 backdrop-blur-sm rounded-lg px-3.5 py-2 border border-blue-200/60 hover:border-blue-300 transition-all">
                              <div className="truncate pr-2">
                                <p className="font-semibold text-slate-800 text-xs truncate">{batch.name}</p>
                                <p className="text-[10px] text-muted-foreground font-medium mt-0.5">
                                  {batch.totalMatches} matches • {batch.status}
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={() => navigate(`/home/batches/${batch.id}`)}
                                className="text-primary hover:text-primary/80 font-bold text-xs shrink-0 transition-colors"
                              >
                                View →
                              </button>
                            </div>
                          ))}
                        </div>
                        <div className="mt-3 flex items-start gap-1.5 bg-blue-100/30 rounded-lg px-2.5 py-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-blue-600 flex-shrink-0 mt-0.5" />
                          <p className="text-[10px] text-blue-700 font-medium">
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
        <div className="card-premium p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-border/60">
            <div className="w-10 h-10 bg-accent/10 text-accent-foreground rounded-xl flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground uppercase tracking-tight">
                Batch Information
              </h2>
              <p className="text-xs text-muted-foreground">Configure the fight card details and format</p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Batch Name */}
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase mb-2 tracking-wide">
                Batch Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Main Card, Preliminary Fights, Championship Bout"
                className="input-premium py-2.5"
                required
              />
            </div>

            {/* Batch Type */}
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase mb-2 tracking-wide">
                Batch Type *
              </label>
              <select
                value={formData.batchType}
                onChange={(e) => setFormData({ ...formData, batchType: e.target.value })}
                className="input-premium cursor-pointer py-2.5"
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
              <label className="block text-xs font-semibold text-muted-foreground uppercase mb-2 tracking-wide">
                Batch Date *
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="input-premium cursor-pointer py-2.5"
                required
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase mb-2 tracking-wide flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" />
                Location
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Venue location (auto-filled from event)"
                className="input-premium py-2.5"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={() => navigate("/home/matches")}
            className="w-full sm:w-auto btn-outline py-2.5 px-6 uppercase text-xs tracking-wider"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!formData.eventId || !formData.name || !formData.batchType || !formData.date}
            className="w-full sm:w-auto btn-primary py-2.5 px-6 uppercase text-xs tracking-wider"
          >
            <Box className="w-4 h-4" />
            Create Batch
          </button>
        </div>
      </form>
    </div>
  );
}