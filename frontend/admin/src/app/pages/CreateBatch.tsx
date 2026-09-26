import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft, Calendar, MapPin, Award, Sparkles, Info, Box } from "lucide-react";
import { toast } from "sonner";
import { clsx } from "clsx";
import { api } from "../utils/api";
import mapPickerImg from "../../assets/phnom_penh_map_picker.png";
import { VENUES } from "../data/masterData";

export function CreateBatch() {
  const navigate = useNavigate();
  const { batchId } = useParams();
  const isEditMode = !!batchId;
  const [events, setEvents] = useState<any[]>([]);
  const [batches, setBatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    eventId: "",
    name: "",
    batchType: "", // Main / Prelim / Weekly
    date: "",
    location: "",
  });
  const [pin, setPin] = useState<{ x: number; y: number } | null>(null);

  // Sync map pinpoint when location changes
  useEffect(() => {
    if (formData.location) {
      const matchedVenue = VENUES.find(v => 
        v.name.toLowerCase().includes(formData.location.toLowerCase()) || 
        formData.location.toLowerCase().includes(v.name.toLowerCase())
      );
      if (matchedVenue) {
        setPin({ x: matchedVenue.x, y: matchedVenue.y });
      } else {
        setPin(null);
      }
    } else {
      setPin(null);
    }
  }, [formData.location]);

  const handleVenueSelect = (venue: any) => {
    setPin({ x: venue.x, y: venue.y });
    setFormData(prev => ({
      ...prev,
      location: venue.name
    }));
  };

  const handleStaticMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setPin({ x, y });

    let derivedLocation = "";
    if (x > 67 && y > 58) {
      derivedLocation = "Olympic Stadium Arena, Phnom Penh";
    } else if (x > 43 && x < 57 && y > 53 && y < 65) {
      derivedLocation = "Morodok Techo National Stadium";
    } else if (x < 35 && y < 45) {
      derivedLocation = "Battambang Indoor Stadium";
    } else if (x > 35 && x < 50 && y < 35) {
      derivedLocation = "Siem Reap Boxing Stadium";
    } else if (x > 60 && x < 65 && y > 48 && y < 52) {
      derivedLocation = "Town Full HDTV Arena, Phnom Penh";
    } else if (x > 70 && y > 65) {
      derivedLocation = "Bayon TV Arena (Steung Meanchey), Phnom Penh";
    } else {
      derivedLocation = `Custom Venue Location (${Math.round(100 - y)}°N, ${Math.round(x)}°E)`;
    }

    setFormData(prev => ({
      ...prev,
      location: derivedLocation
    }));
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const eventsData = await api.events.list();
        const batchesData = await api.batches.list();
        setEvents(eventsData || []);
        setBatches(batchesData || []);

        if (batchId) {
          const batch = await api.batches.get(batchId);
          if (batch) {
            setFormData({
              eventId: batch.event_id,
              name: batch.name,
              batchType: batch.phase === "Final" ? "Main" : batch.phase === "Qualifier" ? "Prelim" : "Weekly",
              date: batch.date ? batch.date.split("T")[0] : "",
              location: batch.location || "",
            });
          }
        }
      } catch (err: any) {
        console.error(err);
        toast.error("Failed to load data from database");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [batchId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.eventId) {
      toast.error("Please select an event");
      return;
    }

    if (!formData.name.trim()) {
      toast.error("Please enter a fight card name");
      return;
    }

    if (!formData.batchType) {
      toast.error("Please select a fight card type");
      return;
    }

    if (!formData.date) {
      toast.error("Please select a date");
      return;
    }

    try {
      const selectedEvent = events.find(ev => ev.id === formData.eventId);
      
      if (isEditMode) {
        await api.batches.update(batchId!, {
          eventId: formData.eventId,
          name: formData.name,
          date: formData.date,
          location: formData.location || selectedEvent?.location || "",
          phase: formData.batchType === "Main" ? "Final" : "Qualifier",
        });
        toast.success("✅ Fight card updated successfully!");
        navigate(`/home/batches/${batchId}`);
      } else {
        // Calculate how many batches already exist for this event to assign a week_number
        const eventBatches = batches.filter(b => b.event_id === formData.eventId);
        const weekNumber = eventBatches.length + 1;

        const newBatch = await api.batches.create({
          eventId: formData.eventId,
          name: formData.name,
          weekNumber: weekNumber,
          date: formData.date,
          location: formData.location || selectedEvent?.location || "",
          phase: formData.batchType === "Main" ? "Final" : "Qualifier",
          status: "Draft",
          batchNumber: `BATCH-${Date.now().toString().slice(-6)}`,
        });

        toast.success("✅ Fight card created successfully!");
        navigate(`/home/batches/${newBatch.id}`);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to save fight card in database");
    }
  };

  const selectedEvent = formData.eventId 
    ? events.find(e => e.id === formData.eventId)
    : null;

  // Get existing batches for the selected event from database list
  const existingBatches = formData.eventId
    ? batches.filter(b => b.event_id === formData.eventId)
    : [];

  // Helper to format date nicely
  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    } catch (e) {
      return dateStr;
    }
  };

  if (loading) {
    return (
      <div className="text-center py-16">
        <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-muted-foreground font-semibold">Loading events from database...</p>
      </div>
    );
  }

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
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {isEditMode ? "Edit Fight card" : "Create New Fight card"}
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5 font-medium">
              {isEditMode ? "Update fight card details for this event" : "Set up a new fight card for an event"}
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
              <p className="text-xs text-muted-foreground">Select the host event for this fight card</p>
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
                  const event = events.find(ev => ev.id === e.target.value);
                  setFormData({
                    ...formData,
                    eventId: e.target.value,
                    location: event?.location || "",
                    date: event?.date ? new Date(event.date).toISOString().split('T')[0] : "",
                  });
                }}
                className="input-premium cursor-pointer py-2.5"
                required
              >
                <option value="">Choose an event...</option>
                {events.map(event => (
                  <option key={event.id} value={event.id}>
                    {event.name} - {formatDate(event.date)}
                  </option>
                ))}
              </select>
              {events.length === 0 && (
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
                      <p className="text-foreground font-semibold text-sm">{formatDate(selectedEvent.date)}</p>
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
                          selectedEvent.status === "Published" && "badge-blue",
                          selectedEvent.status === "Completed" && "badge-emerald",
                        )}>
                          {selectedEvent.status}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Organizer</span>
                      <p className="text-foreground font-semibold text-sm truncate">{selectedEvent.organizer_name || "KKF Federation"}</p>
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
                                  {batch.status}
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
                <option value="">Choose a fight card type...</option>
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

            {/* Geographic Location Pinpoint */}
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-primary" />
                Geographic Location Pinpoint
              </label>

              {/* Quick-select venue chips */}
              <div className="flex flex-wrap gap-2">
                {VENUES.map((venue) => (
                  <button
                    key={venue.name}
                    type="button"
                    onClick={() => handleVenueSelect(venue)}
                    className={clsx(
                      "px-3 py-1.5 rounded-full text-[11px] font-semibold border transition-all duration-150 active:scale-95",
                      formData.location === venue.name
                        ? "bg-primary text-white border-primary shadow-sm shadow-primary/30"
                        : "bg-white text-slate-600 border-border/70 hover:border-primary/50 hover:text-primary hover:bg-primary/5"
                    )}
                  >
                    📍 {venue.name.split(" (")[0]}
                  </button>
                ))}
              </div>

              {/* Interactive static map */}
              <div
                className="relative w-full rounded-2xl overflow-hidden cursor-crosshair border border-border/60 shadow-sm select-none"
                style={{ aspectRatio: "16/9" }}
                onClick={handleStaticMapClick}
                title="Click to drop a pin on the map"
              >
                <img
                  src={mapPickerImg}
                  alt="Cambodia map – click to pin a location"
                  className="w-full h-full object-cover pointer-events-none"
                  draggable={false}
                />

                {/* Dark overlay tint */}
                <div className="absolute inset-0 bg-primary/10 pointer-events-none" />

                {/* Pin marker */}
                {pin && (
                  <div
                    className="absolute pointer-events-none"
                    style={{
                      left: `${pin.x}%`,
                      top: `${pin.y}%`,
                      transform: "translate(-50%, -100%)",
                    }}
                  >
                    {/* Pulse ring */}
                    <span className="absolute -inset-3 rounded-full bg-primary/25 animate-ping" style={{ animationDuration: "1.4s" }} />
                    {/* Pin head */}
                    <div className="relative w-7 h-7 bg-primary rounded-full border-3 border-white shadow-lg flex items-center justify-center">
                      <MapPin className="w-4 h-4 text-white fill-white" />
                    </div>
                    {/* Stem */}
                    <div className="w-0.5 h-3 bg-primary mx-auto" />
                  </div>
                )}

                {/* Instruction overlay when no pin */}
                {!pin && (
                  <div className="absolute inset-0 flex items-end justify-center pointer-events-none pb-4">
                    <div className="bg-black/50 backdrop-blur-sm text-white text-[11px] font-semibold px-3 py-1.5 rounded-full">
                      Click on the map to drop a pin
                    </div>
                  </div>
                )}
              </div>

              {/* Selected location display */}
              {formData.location ? (
                <div className="flex items-start gap-2.5 bg-primary/5 border border-primary/20 rounded-xl px-4 py-3">
                  <MapPin className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-foreground truncate">{formData.location}</p>
                    {(() => {
                      const matched = VENUES.find(v =>
                        v.name.toLowerCase().includes(formData.location.toLowerCase()) ||
                        formData.location.toLowerCase().includes(v.name.toLowerCase())
                      );
                      return matched ? (
                        <p className="text-[11px] text-muted-foreground font-medium mt-0.5">{matched.region} · {matched.description}</p>
                      ) : (
                        <p className="text-[11px] text-muted-foreground font-medium mt-0.5">Custom pinned location</p>
                      );
                    })()}
                  </div>
                  <button
                    type="button"
                    onClick={() => { setFormData(prev => ({ ...prev, location: "" })); setPin(null); }}
                    className="text-muted-foreground hover:text-destructive transition-colors text-xs font-bold shrink-0"
                    title="Clear location"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium px-1">
                  <MapPin className="w-3.5 h-3.5" />
                  No location selected — choose a venue chip or click the map
                </div>
              )}

              {/* Hidden input to persist typed location */}
              <input type="hidden" value={formData.location} />
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
            {isEditMode ? "Save Changes" : "Create Fight card"}
          </button>
        </div>
      </form>
    </div>
  );
}