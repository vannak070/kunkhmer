import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Save, Upload, Building2, MapPin, X, ChevronDown, Search } from "lucide-react";
import { Link, useNavigate } from "react-router";
import { MOCK_CLUBS } from "../data/mock";
import mapPickerImg from "../../assets/phnom_penh_map_picker.png";

const QUICK_HUBS = [
  {
    name: "Phnom Penh City Center Club",
    region: "Phnom Penh",
    coach: "Chan Reach",
    x: 68,
    y: 62,
    lat: 11.5564,
    lng: 104.9282,
    description: "Elite training camp in the capital city center"
  },
  {
    name: "Morodok Techo Stadium Gym",
    region: "Phnom Penh (National)",
    coach: "Eh Phoutong",
    x: 52,
    y: 58,
    lat: 11.6970,
    lng: 104.9125,
    description: "National stadium multi-discipline combat center"
  },
  {
    name: "Siem Reap Angkor Camp",
    region: "Siem Reap",
    coach: "Pich Sophon",
    x: 42,
    y: 28,
    lat: 13.3671,
    lng: 103.8566,
    description: "Traditional training grounds near Angkor Wat"
  },
  {
    name: "Battambang Training Camp",
    region: "Battambang",
    coach: "Kru Vorn",
    x: 25,
    y: 35,
    lat: 13.0957,
    lng: 103.2022,
    description: "Historic provincial gym producing legendary fighters"
  },
  {
    name: "Samkai Camp, Kampot",
    region: "Kampot",
    coach: "Sen Bunthen",
    x: 35,
    y: 65,
    lat: 10.5929,
    lng: 104.1802,
    description: "Coastal camp famous for heavy endurance training"
  },
  {
    name: "Kandal Training Center",
    region: "Kandal Province",
    coach: "Meas Chanta",
    x: 60,
    y: 68,
    lat: 11.4567,
    lng: 104.9876,
    description: "Provincial base serving central region scouts"
  }
];

export function AddClub() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    headCoach: "",
    phone: "",
    email: "",
    established: "",
    description: "",
    status: "active",
    image: ""
  });

  const [pin, setPin] = useState<{ x: number; y: number } | null>(null);
  
  // Interactive Map States
  const [mapLoaded, setMapLoaded] = useState(false);
  const [leafletError, setLeafletError] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lng: number }>({ lat: 11.5564, lng: 104.9282 });
  const [geocoding, setGeocoding] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchingMap, setSearchingMap] = useState(false);

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
    if (!mapLoaded || !(window as any).L) return;

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
  }, [mapLoaded]);

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
        setFormData(prev => ({
          ...prev,
          location: cleanAddress || `Custom Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`
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
        setFormData(prev => ({
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const clubData = {
      id: `c${Date.now()}`,
      name: formData.name,
      location: formData.location,
      headCoach: formData.headCoach,
      activeFighters: 0,
      rating: 5.0,
      status: formData.status,
      image: formData.image || "https://images.unsplash.com/photo-1540206351-d6465b3ac5c1?q=80&w=2940&auto=format&fit=crop"
    };

    MOCK_CLUBS.push(clubData);
    console.log("Club saved successfully:", clubData);
    navigate("/home/clubs");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Fallback map click for static Cambodia vector view
  const handleStaticMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setPin({ x, y });

    let derivedLocation = "";
    if (x > 67 && y > 58) {
      derivedLocation = "Phnom Penh City Center Club";
    } else if (x > 43 && x < 57 && y > 53 && y < 65) {
      derivedLocation = "Morodok Techo Stadium Gym, Phnom Penh";
    } else if (x < 35 && y < 45) {
      derivedLocation = "Battambang Training Camp";
    } else if (x > 35 && x < 50 && y < 35) {
      derivedLocation = "Siem Reap Angkor Camp";
    } else if (x < 45 && y > 55) {
      derivedLocation = "Samkai Camp, Kampot";
    } else if (x > 50 && y > 62) {
      derivedLocation = "Kandal Training Center, Kandal Province";
    } else {
      derivedLocation = `Custom Gym Location (${Math.round(100 - y)}°N, ${Math.round(x)}°E)`;
    }

    setFormData(prev => ({
      ...prev,
      location: derivedLocation
    }));
  };

  const handleHubSelect = (hub: typeof QUICK_HUBS[0]) => {
    setPin({ x: hub.x, y: hub.y });
    
    setFormData(prev => ({
      ...prev,
      location: hub.name,
      headCoach: prev.headCoach ? prev.headCoach : hub.coach
    }));

    // If Leaflet Map is loaded, pan and set marker
    if (mapRef.current && markerRef.current && (window as any).L) {
      mapRef.current.setView([hub.lat, hub.lng], 13);
      markerRef.current.setLatLng([hub.lat, hub.lng]);
      setCoords({ lat: hub.lat, lng: hub.lng });
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6 flex flex-col min-h-full animate-fadeIn">
      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Link 
            to="/home/clubs" 
            className="p-2.5 bg-white hover:bg-muted text-primary border border-border/80 rounded-xl transition-all active:scale-95 shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">Add New Club</h1>
            <p className="text-sm text-muted-foreground mt-1 font-medium">Register a new Kun Khmer training facility and location</p>
          </div>
        </div>
      </header>

      {/* Form Content */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Columns: Form Inputs */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Basic Information */}
          <div className="card-premium">
            <h2 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary" />
              <span>Basic Information</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                  Club Name <span className="text-secondary">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="e.g., Phnom Penh Elite Gym"
                  className="input-premium font-semibold text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                  Head Coach <span className="text-secondary">*</span>
                </label>
                <input
                  type="text"
                  name="headCoach"
                  value={formData.headCoach}
                  onChange={handleChange}
                  required
                  placeholder="e.g., Chan Reach"
                  className="input-premium font-semibold text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                  Established Year <span className="text-secondary">*</span>
                </label>
                <input
                  type="text"
                  name="established"
                  value={formData.established}
                  onChange={handleChange}
                  required
                  placeholder="e.g., 2010"
                  className="input-premium font-semibold text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                  Status <span className="text-secondary">*</span>
                </label>
                <div className="relative">
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    required
                    className="input-premium font-semibold text-slate-800 cursor-pointer appearance-none animate-fadeIn"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-muted-foreground">
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                  Location / Area <span className="text-secondary">*</span>
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  required
                  placeholder="Click the map or type address..."
                  className="input-premium font-semibold text-slate-800"
                />
              </div>
            </div>
          </div>

          {/* Location Map Picker */}
          <div className="card-premium">
            <h2 className="text-base font-bold text-foreground mb-1 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-secondary" />
              <span>Geographic Location Pinpoint</span>
            </h2>
            <p className="text-xs text-muted-foreground mb-4">
              {mapLoaded && !leafletError
                ? "Search an address below, drag the red marker, or click anywhere on the real-world map to drop the pinpoint."
                : "Click anywhere on the Cambodia geographic dashboard map to drop a pin, or select a quick-select training hub."}
            </p>
            
            {/* Address Search bar for Real-world Map */}
            {mapLoaded && !leafletError && (
              <div className="flex gap-2 mb-4 animate-fadeIn">
                <div className="relative flex-1 group">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <input
                    type="text"
                    placeholder="Search city, town, or street in Cambodia (e.g. Wat Phnom, Phnom Penh)..."
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

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              
              {/* Map Canvas Frame */}
              <div className="xl:col-span-2 relative h-[380px] rounded-xl overflow-hidden border border-border bg-slate-900 shadow-inner group">
                
                {mapLoaded && !leafletError ? (
                  /* Live Real-world Interactive Map Picker */
                  <div id="leaflet-map-picker" className="w-full h-full z-10" />
                ) : (
                  /* Static Map Vector Fallback */
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
                            Pinned Gym
                          </div>
                          <MapPin className="w-7 h-7 text-secondary fill-secondary drop-shadow-lg animate-bounce" />
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Quick Hubs Panel */}
              <div className="xl:col-span-1 flex flex-col space-y-2 max-h-[380px] overflow-y-auto pr-1 no-scrollbar">
                <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1 px-1">Quick Select Hubs</div>
                
                {QUICK_HUBS.map((hub, idx) => {
                  const isSelected = formData.location.includes(hub.name) || formData.location === hub.name;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleHubSelect(hub)}
                      className={`text-left p-3 rounded-xl border transition-all duration-200 flex flex-col justify-between hover:bg-muted/30 hover:border-slate-300 ${
                        isSelected 
                          ? 'border-primary bg-primary/5 hover:bg-primary/5 hover:border-primary' 
                          : 'border-border/60 bg-white shadow-sm'
                      }`}
                    >
                      <div className="flex justify-between items-start w-full">
                        <div className="font-bold text-xs text-foreground line-clamp-1">{hub.name}</div>
                        {isSelected && (
                          <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-1" />
                        )}
                      </div>
                      <div className="text-[10px] text-muted-foreground font-medium mt-0.5 line-clamp-1">{hub.region} • Coach: {hub.coach}</div>
                      <div className="text-[10px] text-slate-500 mt-1.5 line-clamp-2 leading-tight">{hub.description}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Latitude/Longitude Display overlay for Live Map */}
            {mapLoaded && !leafletError && (
              <div className="mt-3 flex flex-wrap items-center gap-3 bg-muted/20 p-2.5 rounded-lg border border-border/60 text-xs font-semibold text-slate-600 animate-fadeIn">
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

          {/* Contact Information */}
          <div className="card-premium">
            <h2 className="text-base font-bold text-foreground mb-4">Contact Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+855 12 345 678"
                  className="input-premium font-semibold text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="contact@club.com"
                  className="input-premium font-semibold text-slate-800"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Upload Banner & Description */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Card: Upload Banner */}
          <div className="card-premium">
            <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
              <Upload className="w-4 h-4 text-primary" />
              <span>Club Banner Photo</span>
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-40 border border-border/80 border-dashed rounded-xl cursor-pointer bg-muted/10 hover:bg-muted/20 transition-all duration-200">
                  <div className="flex flex-col items-center justify-center pt-4 pb-4 px-2 text-center">
                    <Upload className="w-7 h-7 text-muted-foreground mb-2" />
                    <p className="text-xs font-semibold text-slate-700">
                      <span className="text-primary hover:underline">Click to upload</span> or drag
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">PNG, JPG (MAX. 2MB)</p>
                  </div>
                  <input 
                    type="file" 
                    className="hidden" 
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setFormData(prev => ({ ...prev, image: reader.result as string }));
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </label>
              </div>

              {formData.image ? (
                <div className="relative w-full h-40 rounded-xl overflow-hidden border border-border/60 shadow-sm animate-fadeIn">
                  <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, image: "" }))}
                    className="absolute top-2 right-2 p-1.5 bg-red-500/90 hover:bg-red-600 text-white rounded-lg transition-colors shadow-md"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="h-40 rounded-xl bg-muted/10 border border-border/40 flex items-center justify-center text-muted-foreground text-xs font-medium">
                  No image selected
                </div>
              )}
            </div>
          </div>

          {/* Card: Description */}
          <div className="card-premium">
            <h3 className="text-sm font-bold text-foreground mb-3">About the Club</h3>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              placeholder="Describe the club's facilities, training schedule, or background..."
              className="input-premium font-semibold text-slate-800 resize-none h-32"
            />
          </div>

          {/* Form Actions */}
          <div className="bg-white rounded-xl border border-border p-4 shadow-sm flex flex-col gap-3">
            <button
              type="submit"
              className="btn-primary w-full py-3"
            >
              <Save className="w-4 h-4 animate-pulse" />
              Save Club
            </button>
            <Link
              to="/home/clubs"
              className="btn-outline w-full py-3"
            >
              Cancel
            </Link>
          </div>
        </div>

      </form>
    </div>
  );
}