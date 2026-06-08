import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import {
  ArrowLeft, Save, MapPin, Tv, DollarSign, Calendar, Building2,
  CalendarRange, Trophy, Users, Target, Flame, Shield, ArrowRight,
  Search, X, ChevronDown
} from "lucide-react";
import { MOCK_EVENTS, MOCK_CLUBS } from "../data/mock";
import { BROADCAST_STATIONS, SPONSORS, getActiveBroadcastStations, getActiveSponsors } from "../data/masterData";
import {
  EVENT_TYPE_CONFIG, type EventType,
  TOURNAMENT_FORMAT_CONFIG, type TournamentFormat,
  TOURNAMENT_WEIGHT_CLASSES
} from "../data/event-types";
import { toast } from "sonner";
import { clsx } from "clsx";
import mapPickerImg from "../../assets/phnom_penh_map_picker.png";

const QUICK_VENUES = [
  {
    name: "Morodok Techo National Stadium",
    region: "Phnom Penh (National)",
    x: 52,
    y: 58,
    lat: 11.6970,
    lng: 104.9125,
    description: "Main national stadium with 75,000 capacity"
  },
  {
    name: "Olympic Stadium Arena",
    region: "Phnom Penh",
    x: 68,
    y: 62,
    lat: 11.5564,
    lng: 104.9282,
    description: "Historic indoor and outdoor national sports complex"
  },
  {
    name: "Town Full HDTV Arena",
    region: "Phnom Penh",
    x: 63,
    y: 50,
    lat: 11.5725,
    lng: 104.8988,
    description: "State-of-the-art modern Kun Khmer broadcast arena"
  },
  {
    name: "Bayon TV Arena (Steung Meanchey)",
    region: "Phnom Penh",
    x: 72,
    y: 69,
    lat: 11.5301,
    lng: 104.8950,
    description: "Famous arena hosting weekend championship tournaments"
  },
  {
    name: "PNN Arena (Prek Pnov)",
    region: "Phnom Penh Outskirts",
    x: 48,
    y: 40,
    lat: 11.6611,
    lng: 104.8814,
    description: "Premium television broadcast stadium"
  },
  {
    name: "Siem Reap Boxing Stadium",
    region: "Siem Reap",
    x: 42,
    y: 28,
    lat: 13.3671,
    lng: 103.8566,
    description: "Popular stadium hosting fights for domestic and international fans"
  },
  {
    name: "Battambang Indoor Stadium",
    region: "Battambang",
    x: 25,
    y: 35,
    lat: 13.0957,
    lng: 103.2022,
    description: "Provincial stadium hosting major regional galas"
  }
];

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

  const standardOrganizers = [
    "Kun Khmer Federation (KKF)",
    "Bayon Entertainment Group",
    "PNN Media Group",
    "Town HDTV Arena Promotions",
    "Royal Khmer Promotions",
    "Cambodia Fight Sports Association",
    "Kun Khmer Legends Association"
  ];

  const organizerList = [
    ...standardOrganizers,
    ...MOCK_CLUBS.filter(club => club.status === "active").map(club => club.name)
  ];

  // Interactive Map States
  const [mapLoaded, setMapLoaded] = useState(false);
  const [leafletError, setLeafletError] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lng: number }>({ lat: 11.5564, lng: 104.9282 });
  const [geocoding, setGeocoding] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchingMap, setSearchingMap] = useState(false);
  const [pin, setPin] = useState<{ x: number; y: number } | null>(null);

  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  // Dynamic CDN Loader for Leaflet
  useEffect(() => {
    const linkId = "leaflet-css";
    if (!document.getElementById(linkId)) {
      const link = document.createElement("link");
      link.id = linkId;
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    const scriptId = "leaflet-js";
    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.async = true;
      script.onload = () => {
        setMapLoaded(true);
      };
      script.onerror = () => {
        setLeafletError(true);
      };
      document.body.appendChild(script);
    } else {
      if ((window as any).L) {
        setMapLoaded(true);
      } else {
        const interval = setInterval(() => {
          if ((window as any).L) {
            setMapLoaded(true);
            clearInterval(interval);
          }
        }, 100);
        return () => clearInterval(interval);
      }
    }
  }, []);

  // Initialize Map
  useEffect(() => {
    if (!mapLoaded || !(window as any).L || step !== 2) return;

    const container = document.getElementById("leaflet-map-picker");
    if (!container || mapRef.current) return;

    const L = (window as any).L;
    const defaultLat = 11.5564;
    const defaultLng = 104.9282;

    const map = L.map("leaflet-map-picker").setView([defaultLat, defaultLng], 12);
    mapRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Custom high-contrast red marker
    const redMarkerIcon = L.icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });

    const marker = L.marker([defaultLat, defaultLng], {
      draggable: true,
      icon: redMarkerIcon
    }).addTo(map);
    markerRef.current = marker;

    // Default reverse geocode
    reverseGeocode(defaultLat, defaultLng);

    // Drag events
    marker.on("dragend", (e: any) => {
      const latLng = e.target.getLatLng();
      reverseGeocode(latLng.lat, latLng.lng);
    });

    // Map click events
    map.on("click", (e: any) => {
      const latLng = e.latlng;
      marker.setLatLng(latLng);
      reverseGeocode(latLng.lat, latLng.lng);
    });

    // Handle initial sizing layout refresh
    setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markerRef.current = null;
      }
    };
  }, [mapLoaded, step]);

  // Reverse Geocoding via Nominatim
  const reverseGeocode = async (lat: number, lng: number) => {
    setCoords({ lat, lng });
    setGeocoding(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`
      );
      const data = await response.json();
      if (data) {
        const address = data.address;
        let cleanAddress = "";
        if (address) {
          const road = address.road || address.suburb || address.pedestrian || "";
          const neighbourhood = address.neighbourhood || address.quarter || address.village || "";
          const city = address.city || address.town || address.county || "";
          const state = address.state || "";
          const country = address.country || "";
          
          const parts = [road || neighbourhood, city || state, country].filter(Boolean);
          cleanAddress = parts.join(", ");
        }
        if (!cleanAddress && data.display_name) {
          cleanAddress = data.display_name.split(",").slice(0, 3).join(",").trim();
        }
        setNewEvent(prev => ({
          ...prev,
          location: cleanAddress || `Custom Venue (${lat.toFixed(4)}, ${lng.toFixed(4)})`
        }));
      }
    } catch (error) {
      console.error("Error in reverse geocoding:", error);
    } finally {
      setGeocoding(false);
    }
  };

  // Search Address Geocoding
  const handleMapSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim() || !mapRef.current || !markerRef.current) return;

    setSearchingMap(true);
    try {
      const query = encodeURIComponent(searchQuery + ", Cambodia");
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1`
      );
      const data = await response.json();
      if (data && data.length > 0) {
        const result = data[0];
        const lat = parseFloat(result.lat);
        const lon = parseFloat(result.lon);
        
        mapRef.current.setView([lat, lon], 14);
        markerRef.current.setLatLng([lat, lon]);
        
        setCoords({ lat, lon });
        
        // Truncate search query display output
        const cleanAddress = result.display_name.split(",").slice(0, 3).join(",").trim();
        setNewEvent(prev => ({
          ...prev,
          location: cleanAddress
        }));
      } else {
        alert("Location not found in Cambodia. Try typing a broader area or city name.");
      }
    } catch (error) {
      console.error("Error searching location:", error);
    } finally {
      setSearchingMap(false);
    }
  };

  // Fallback map click for static Cambodia vector view
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

    setNewEvent(prev => ({
      ...prev,
      location: derivedLocation
    }));
  };

  const handleVenueSelect = (venue: typeof QUICK_VENUES[0]) => {
    setPin({ x: venue.x, y: venue.y });
    
    setNewEvent(prev => ({
      ...prev,
      location: venue.name
    }));

    // If Leaflet Map is loaded, pan and set marker
    if (mapRef.current && markerRef.current && (window as any).L) {
      mapRef.current.setView([venue.lat, venue.lng], 13);
      markerRef.current.setLatLng([venue.lat, venue.lng]);
      setCoords({ lat: venue.lat, lng: venue.lng });
    }
  };

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
      status: "Draft",
      kkfStatus: "Draft",
      image: finalImage,
      description: newEvent.description,
      // Keep backward compatibility with old field names
      station: selectedStation?.name || "",
      sponsor: selectedSponsor?.name || "",
      hasSubEvents: newEvent.eventType === "multi-week",
      matchesCount: 0,
      // Tournament fields
      isTournament: isTournamentEvent,
      tournamentFormat: isTournamentEvent ? newEvent.tournamentFormat : undefined,
      tournamentWeightClass: isTournamentEvent ? newEvent.tournamentWeightClass : undefined,
      expectedParticipants: isTournamentEvent ? newEvent.expectedParticipants : undefined,
    };

    MOCK_EVENTS.unshift(eventWithId as any);

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
    <div className="p-4 md:p-8 max-w-5xl mx-auto flex flex-col min-h-full animate-fadeIn">
      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/home/events")}
            className="p-2.5 bg-white hover:bg-muted text-primary border border-border/80 rounded-xl transition-all active:scale-95 shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">Create New Event</h1>
            <p className="text-sm text-muted-foreground mt-0.5 font-medium">
              {step === 1 && "Select event category and format"}
              {step === 2 && "Configure event details and schedule"}
              {step === 3 && "Set up tournament structure"}
            </p>
          </div>
        </div>
      </header>

      {/* Step Indicators */}
      <div className="bg-white rounded-2xl border border-border/80 p-5 shadow-sm mb-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className={clsx(
            "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all",
            step === 1 
              ? "bg-[#0A3D91] text-white shadow-md shadow-blue-100" 
              : "bg-emerald-50 text-emerald-700 border border-emerald-200"
          )}>
            {step > 1 ? "✓" : "1"}
          </div>
          <span className={clsx("text-sm font-semibold", step === 1 ? "text-[#0A3D91] font-bold" : "text-muted-foreground")}>Category</span>
        </div>

        <div className="h-px flex-1 bg-border" />

        <div className="flex items-center gap-2.5">
          <div className={clsx(
            "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all",
            step === 2 
              ? "bg-[#0A3D91] text-white shadow-md shadow-blue-100" 
              : step > 2 
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : "bg-muted text-muted-foreground"
          )}>
            {step > 2 ? "✓" : "2"}
          </div>
          <span className={clsx("text-sm font-semibold", step === 2 ? "text-[#0A3D91] font-bold" : "text-muted-foreground")}>Details</span>
        </div>

        {isTournamentEvent && (
          <>
            <div className="h-px flex-1 bg-border" />
            <div className="flex items-center gap-2.5">
              <div className={clsx(
                "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all",
                step === 3 
                  ? "bg-[#0A3D91] text-white shadow-md shadow-blue-100" 
                  : "bg-muted text-muted-foreground"
              )}>
                3
              </div>
              <span className={clsx("text-sm font-semibold", step === 3 ? "text-[#0A3D91] font-bold" : "text-muted-foreground")}>Tournament</span>
            </div>
          </>
        )}
      </div>

      {/* Form Content */}
      <form onSubmit={handleCreateEvent} className="space-y-6">
        {/* STEP 1: Category Selection */}
        {step === 1 && (
          <div className="card-premium p-6 sm:p-8 space-y-6">
            <div>
              <h2 className="text-xl font-bold text-foreground uppercase tracking-tight">Select Event Category</h2>
              <p className="text-sm text-muted-foreground mt-1">Choose the type of fight event or tournament format</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {eventCategories.map((category) => {
                const config = EVENT_TYPE_CONFIG[category];
                const isSelected = newEvent.eventCategory === category;

                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setNewEvent({...newEvent, eventCategory: category})}
                    className={clsx(
                      "p-5 rounded-2xl border transition-all text-left flex flex-col justify-between min-h-[140px] group",
                      isSelected
                        ? "border-[#0A3D91] bg-blue-50/50 shadow-md scale-[1.02]"
                        : "border-border/80 bg-white hover:border-slate-350 hover:shadow-sm"
                    )}
                  >
                    <div>
                      <div className="text-3xl mb-2.5">{config.icon}</div>
                      <div className={clsx(
                        "font-bold text-sm transition-colors",
                        isSelected ? "text-[#0A3D91]" : "text-foreground"
                      )}>
                        {config.label}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground font-medium leading-relaxed mt-2 line-clamp-2">
                      {config.description}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex justify-end pt-4 border-t border-border/60">
              <button
                type="button"
                onClick={() => setStep(2)}
                disabled={!newEvent.eventCategory}
                className="btn-primary py-2.5 px-6 inline-flex items-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Event Details */}
        {step === 2 && (
          <div className="card-premium p-6 sm:p-8 space-y-6">
            <div>
              <h2 className="text-xl font-bold text-foreground uppercase tracking-tight">Event Configuration</h2>
              <p className="text-sm text-muted-foreground mt-1">Enter main dates, arena, and broadcast sponsors</p>
            </div>

            <div className="space-y-6">
              {/* Event Name */}
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2">
                  Event Name *
                </label>
                <input
                  required
                  type="text"
                  value={newEvent.name}
                  onChange={(e) => setNewEvent({...newEvent, name: e.target.value})}
                  className="w-full px-4 py-3 bg-white border border-border/80 rounded-2xl focus:border-primary focus:ring-4 focus:ring-primary/5 focus:outline-none transition-all font-medium text-foreground"
                  placeholder="e.g., Kun Khmer National Championship 2026"
                />
              </div>

              {/* Event Duration Selector */}
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wide mb-3">
                  Event Duration *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setNewEvent({...newEvent, eventType: "single-day", endDate: ""})}
                    className={clsx(
                      "p-4 rounded-2xl border transition-all text-left flex items-center gap-4",
                      newEvent.eventType === "single-day"
                        ? "border-[#0A3D91] bg-blue-50/50"
                        : "border-border/80 bg-white hover:border-slate-300"
                    )}
                  >
                    <Calendar className={clsx(
                      "w-6 h-6 shrink-0",
                      newEvent.eventType === "single-day" ? "text-[#0A3D91]" : "text-muted-foreground"
                    )} />
                    <div>
                      <div className={clsx(
                        "font-bold text-sm",
                        newEvent.eventType === "single-day" ? "text-[#0A3D91]" : "text-foreground"
                      )}>
                        Single-Day Event
                      </div>
                      <div className="text-xs text-muted-foreground font-medium">One evening fight night</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setNewEvent({...newEvent, eventType: "multi-week"})}
                    className={clsx(
                      "p-4 rounded-2xl border transition-all text-left flex items-center gap-4",
                      newEvent.eventType === "multi-week"
                        ? "border-[#0A3D91] bg-blue-50/50"
                        : "border-border/80 bg-white hover:border-slate-300"
                    )}
                  >
                    <CalendarRange className={clsx(
                      "w-6 h-6 shrink-0",
                      newEvent.eventType === "multi-week" ? "text-[#0A3D91]" : "text-muted-foreground"
                    )} />
                    <div>
                      <div className={clsx(
                        "font-bold text-sm",
                        newEvent.eventType === "multi-week" ? "text-[#0A3D91]" : "text-foreground"
                      )}>
                        Multi-Week Event
                      </div>
                      <div className="text-xs text-muted-foreground font-medium">Tournament spanning weeks</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2">
                    Start Date *
                  </label>
                  <input
                    required
                    type="date"
                    value={newEvent.startDate}
                    onChange={(e) => setNewEvent({...newEvent, startDate: e.target.value})}
                    className="w-full px-4 py-3 bg-white border border-border/80 rounded-2xl focus:border-primary focus:ring-4 focus:ring-primary/5 focus:outline-none transition-all font-medium text-foreground"
                  />
                </div>

                {newEvent.eventType === "multi-week" && (
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2">
                      End Date *
                    </label>
                    <input
                      required={newEvent.eventType === "multi-week"}
                      type="date"
                      value={newEvent.endDate}
                      onChange={(e) => setNewEvent({...newEvent, endDate: e.target.value})}
                      min={newEvent.startDate}
                      className="w-full px-4 py-3 bg-white border border-border/80 rounded-2xl focus:border-primary focus:ring-4 focus:ring-primary/5 focus:outline-none transition-all font-medium text-foreground"
                    />
                  </div>
                )}
              </div>

              {/* Organizer & Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2">
                    Organizer *
                  </label>
                  <div className="relative">
                    <select
                      required
                      value={newEvent.organizer}
                      onChange={(e) => setNewEvent({...newEvent, organizer: e.target.value})}
                      className="w-full px-4 py-3 bg-white border border-border/80 rounded-2xl focus:border-primary focus:ring-4 focus:ring-primary/5 focus:outline-none transition-all font-medium text-foreground appearance-none cursor-pointer"
                    >
                      <option value="">Select Organizer...</option>
                      {organizerList.map((org) => (
                        <option key={org} value={org}>
                          {org}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-muted-foreground">
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2">
                    Location *
                  </label>
                  <input
                    required
                    type="text"
                    value={newEvent.location}
                    onChange={(e) => setNewEvent({...newEvent, location: e.target.value})}
                    className="w-full px-4 py-3 bg-white border border-border/80 rounded-2xl focus:border-primary focus:ring-4 focus:ring-primary/5 focus:outline-none transition-all font-medium text-foreground"
                    placeholder="Click the map or type address..."
                  />
                </div>
              </div>

              {/* Broadcast Station & Sponsor */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2">
                    Broadcast Station *
                  </label>
                  <select
                    required
                    value={newEvent.broadcastStationId}
                    onChange={(e) => setNewEvent({...newEvent, broadcastStationId: e.target.value})}
                    className="w-full px-4 py-3 bg-white border border-border/80 rounded-2xl focus:border-primary focus:ring-4 focus:ring-primary/5 focus:outline-none transition-all font-medium text-foreground"
                  >
                    <option value="">Select Broadcast Station...</option>
                    {activeBroadcastStations.map((station) => (
                      <option key={station.id} value={station.id}>
                        {station.logo} {station.name} ({station.type})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2">
                    Main Sponsor *
                  </label>
                  <select
                    required
                    value={newEvent.mainSponsorId}
                    onChange={(e) => setNewEvent({...newEvent, mainSponsorId: e.target.value})}
                    className="w-full px-4 py-3 bg-white border border-border/80 rounded-2xl focus:border-primary focus:ring-4 focus:ring-primary/5 focus:outline-none transition-all font-medium text-foreground"
                  >
                    <option value="">Select Main Sponsor...</option>
                    {activeSponsors.map((sponsor) => (
                      <option key={sponsor.id} value={sponsor.id}>
                        {sponsor.logo} {sponsor.name} ({sponsor.tier})
                      </option>
                    ))}
                  </select>
                </div>
              </div>


              {/* Location Map Picker */}
              <div className="card-premium border border-border/60 bg-muted/5 p-5 rounded-2xl space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-foreground mb-1 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-secondary" />
                    <span>Venue Location Map Pinpoint</span>
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {mapLoaded && !leafletError
                      ? "Search an address below, drag the red marker, or click anywhere on the map to place the venue pinpoint."
                      : "Click on the Cambodia map to drop a pin, or select a quick-select boxing arena below."}
                  </p>
                </div>

                {/* Address Search Bar for Real-world Map */}
                {mapLoaded && !leafletError && (
                  <div className="flex gap-2 animate-fadeIn">
                    <div className="relative flex-1 group">
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      <input
                        type="text"
                        placeholder="Search arena or area in Cambodia (e.g. Olympic Stadium, Phnom Penh)..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleMapSearch(e);
                          }
                        }}
                        className="w-full bg-white border border-border/80 rounded-xl pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 shadow-sm transition-all"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleMapSearch}
                      disabled={searchingMap}
                      className="btn-primary py-2 px-5 text-xs h-[42px] shrink-0"
                    >
                      {searchingMap ? "Searching..." : "Search"}
                    </button>
                  </div>
                )}

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
                  {/* Map Canvas Frame */}
                  <div className="xl:col-span-2 relative h-[300px] rounded-xl overflow-hidden border border-border bg-slate-900 shadow-inner group">
                    {mapLoaded && !leafletError ? (
                      <div id="leaflet-map-picker" className="w-full h-full z-10" />
                    ) : (
                      <>
                        <img
                          src={mapPickerImg}
                          alt="Cambodia Geographic Dashboard"
                          className="w-full h-full object-cover select-none pointer-events-none opacity-85 transition-opacity group-hover:opacity-90 duration-300"
                        />
                        <div className="absolute inset-0" onClick={handleStaticMapClick} />
                        {pin && (
                          <div
                            className="absolute -translate-x-1/2 -translate-y-full transition-all duration-300 pointer-events-none"
                            style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
                          >
                            <div className="relative flex flex-col items-center">
                              <div className="bg-[#C8102E] text-white text-[9px] font-bold px-2 py-0.5 rounded shadow-lg whitespace-nowrap mb-1 border border-white/20 animate-fadeIn">
                                Pinned Venue
                              </div>
                              <MapPin className="w-7 h-7 text-secondary fill-secondary drop-shadow-lg animate-bounce" />
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {/* Quick Venues Panel */}
                  <div className="xl:col-span-1 flex flex-col space-y-2 max-h-[300px] overflow-y-auto pr-1 no-scrollbar">
                    <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1 px-1">Quick Select Arenas</div>
                    {QUICK_VENUES.map((venue, idx) => {
                      const isSelected = newEvent.location.includes(venue.name) || newEvent.location === venue.name;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleVenueSelect(venue)}
                          className={`text-left p-3 rounded-xl border transition-all duration-200 flex flex-col justify-between hover:bg-muted/30 hover:border-slate-350 ${
                            isSelected
                              ? 'border-primary bg-primary/5 hover:bg-primary/5 hover:border-primary'
                              : 'border-border/60 bg-white shadow-sm'
                          }`}
                        >
                          <div className="flex justify-between items-start w-full">
                            <div className="font-bold text-xs text-foreground line-clamp-1">{venue.name}</div>
                            {isSelected && (
                              <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-1" />
                            )}
                          </div>
                          <div className="text-[10px] text-muted-foreground font-medium mt-0.5">{venue.region}</div>
                          <div className="text-[10px] text-slate-500 mt-1.5 line-clamp-2 leading-tight">{venue.description}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Latitude/Longitude Display overlay for Live Map */}
                {mapLoaded && !leafletError && (
                  <div className="flex flex-wrap items-center gap-3 bg-muted/20 p-2.5 rounded-lg border border-border/60 text-xs font-semibold text-slate-600 animate-fadeIn">
                    <div className="flex items-center gap-1">
                      <span className="text-muted-foreground uppercase text-[10px] tracking-wider">Latitude:</span>
                      <span className="font-mono text-slate-800">{coords.lat.toFixed(6)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-muted-foreground uppercase text-[10px] tracking-wider">Longitude:</span>
                      <span className="font-mono text-slate-800">{coords.lng.toFixed(6)}</span>
                    </div>
                    {geocoding && (
                      <span className="text-primary text-[10px] font-bold animate-pulse ml-auto">Reverse geocoding address...</span>
                    )}
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2">
                  Event Description
                </label>
                <textarea
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                  rows={3}
                  className="w-full px-4 py-3 bg-white border border-border/80 rounded-2xl focus:border-primary focus:ring-4 focus:ring-primary/5 focus:outline-none transition-all font-medium text-foreground resize-none"
                  placeholder="Provide brief details about the event matches or schedule..."
                />
              </div>
            </div>

            <div className="flex gap-4 pt-4 border-t border-border/60">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="btn-outline py-2.5 px-6"
              >
                Back
              </button>

              {isTournamentEvent ? (
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="btn-primary py-2.5 px-6 inline-flex items-center gap-2 ml-auto"
                >
                  <span>Tournament Setup</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  className="btn-primary py-2.5 px-6 inline-flex items-center gap-2 ml-auto"
                >
                  <Save className="w-4 h-4" />
                  <span>Create Event</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* STEP 3: Tournament Configuration */}
        {step === 3 && isTournamentEvent && (
          <div className="card-premium p-6 sm:p-8 space-y-6">
            <div>
              <h2 className="text-xl font-bold text-foreground uppercase tracking-tight flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-500" />
                <span>Tournament Configuration</span>
              </h2>
              <p className="text-sm text-muted-foreground mt-1">Configure weights, formats, and participants count</p>
            </div>

            <div className="space-y-6">
              {/* Tournament Format */}
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wide mb-3">
                  Bracket Format *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {(Object.entries(TOURNAMENT_FORMAT_CONFIG) as [TournamentFormat, typeof TOURNAMENT_FORMAT_CONFIG[TournamentFormat]][]).map(([format, config]) => {
                    const isSelected = newEvent.tournamentFormat === format;

                    return (
                      <button
                        key={format}
                        type="button"
                        onClick={() => setNewEvent({...newEvent, tournamentFormat: format})}
                        className={clsx(
                          "p-4 rounded-2xl border transition-all text-left flex items-start gap-4",
                          isSelected
                            ? "border-amber-400 bg-amber-50/45 shadow-sm"
                            : "border-border/80 bg-white hover:border-slate-300"
                        )}
                      >
                        <div className="text-3xl shrink-0">{config.icon}</div>
                        <div>
                          <div className="font-bold text-sm text-foreground">{config.label}</div>
                          <div className="text-xs text-muted-foreground font-medium mt-1 leading-relaxed">
                            {config.description}
                          </div>
                          <div className="text-[10px] font-bold text-[#0A3D91] uppercase mt-2.5">
                            Min: {config.minParticipants} • Ideal: {config.idealParticipants.slice(0, 3).join(", ")}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Weight Class */}
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2">
                  Weight Class *
                </label>
                <select
                  required
                  value={newEvent.tournamentWeightClass}
                  onChange={(e) => setNewEvent({...newEvent, tournamentWeightClass: e.target.value})}
                  className="w-full px-4 py-3 bg-white border border-border/80 rounded-2xl focus:border-primary focus:ring-4 focus:ring-primary/5 focus:outline-none transition-all font-medium text-foreground"
                >
                  <option value="">Select Weight Class</option>
                  {TOURNAMENT_WEIGHT_CLASSES.map((wc) => (
                    <option key={wc.value} value={wc.value}>
                      {wc.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Expected Participants */}
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2">
                  Expected Participants *
                </label>
                <input
                  required
                  type="number"
                  min={newEvent.tournamentFormat ? TOURNAMENT_FORMAT_CONFIG[newEvent.tournamentFormat]?.minParticipants : 4}
                  value={newEvent.expectedParticipants}
                  onChange={(e) => setNewEvent({...newEvent, expectedParticipants: parseInt(e.target.value) || 8})}
                  className="w-full px-4 py-3 bg-white border border-border/80 rounded-2xl focus:border-primary focus:ring-4 focus:ring-primary/5 focus:outline-none transition-all font-medium text-foreground"
                />
                {newEvent.tournamentFormat && (
                  <p className="mt-2 text-[11px] text-muted-foreground font-semibold">
                    💡 Ideal numbers for {TOURNAMENT_FORMAT_CONFIG[newEvent.tournamentFormat].label}: {TOURNAMENT_FORMAT_CONFIG[newEvent.tournamentFormat].idealParticipants.join(", ")}
                  </p>
                )}
              </div>

              {/* Info Banner */}
              <div className="bg-blue-50/40 border border-blue-100/60 rounded-2xl p-5 text-blue-900">
                <div className="flex gap-3 items-start">
                  <Shield className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-sm text-blue-950 mb-1">What Happens Next?</h4>
                    <ul className="space-y-1.5 text-xs text-blue-800 font-medium">
                      <li>• A tournament bracket structure will be auto-generated.</li>
                      <li>• You will be redirected to the details page to assign fighters.</li>
                      <li>• Matches will lock in automatically based on weight checks.</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-4 border-t border-border/60">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="btn-outline py-2.5 px-6"
              >
                Back
              </button>

              <button
                type="submit"
                className="btn-primary py-2.5 px-6 inline-flex items-center gap-2 ml-auto"
              >
                <Save className="w-4 h-4 animate-pulse" />
                <span>Create Tournament</span>
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
