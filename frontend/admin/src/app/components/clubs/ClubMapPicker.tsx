/**
 * Map pin for Add / Edit club (claude/updates/club-map-picker.md).
 * Leaflet ships with the admin (no CDN). The pin is the club's `latitude` / `longitude`.
 * - Edit starts on the saved pin; New starts with no pin until the user picks a place.
 * - Search lists up to 5 places in Cambodia; click the map, drag the marker or use "my location".
 * - The address for a pin is looked up (one at a time, stale answers ignored) and only put into the
 *   Location field when it is empty; otherwise it is offered as a button. Typed text is never overwritten.
 */
import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import { Crosshair, Loader2, MapPin, Search, Trash2 } from "lucide-react";

export interface Pin { lat: number; lng: number }

interface Props {
  value: Pin | null;
  onChange: (pin: Pin | null) => void;
  /** Current Location text; the address of a new pin fills it only while it is empty. */
  location: string;
  onAddress: (address: string) => void;
}

interface Place { label: string; lat: number; lng: number }

const PHNOM_PENH: [number, number] = [11.5564, 104.9282];
const icon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

/** A short address from a Nominatim result. */
function shortAddress(r: any): string {
  const a = r?.address ?? {};
  const street = a.road || a.pedestrian || a.suburb || a.neighbourhood || a.quarter || a.village || "";
  const area = a.city || a.town || a.county || a.state || "";
  const parts = [street, area, a.country].filter(Boolean);
  return parts.length ? parts.join(", ") : String(r?.display_name ?? "").split(",").slice(0, 3).join(",").trim();
}

export function ClubMapPicker({ value, onChange, location, onAddress }: Props) {
  const box = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const marker = useRef<L.Marker | null>(null);
  const latest = useRef({ onChange, onAddress, location });
  latest.current = { onChange, onAddress, location };
  const ticket = useRef(0);

  const [query, setQuery] = useState("");
  const [places, setPlaces] = useState<Place[] | null>(null);
  const [searching, setSearching] = useState(false);
  const [message, setMessage] = useState("");
  const [address, setAddress] = useState<string | null>(null);
  const [looking, setLooking] = useState(false);
  const [tilesFailed, setTilesFailed] = useState(false);

  /** Look up the address of a pin; only the newest request may answer. */
  const lookUp = async (pin: Pin) => {
    const mine = ++ticket.current;
    setLooking(true);
    setAddress(null);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&addressdetails=1&zoom=18&lat=${pin.lat}&lon=${pin.lng}`, { headers: { Accept: "application/json" } });
      if (!res.ok) throw new Error(String(res.status));
      const found = shortAddress(await res.json());
      if (mine !== ticket.current) return;
      setMessage("");
      if (found) {
        setAddress(found);
        if (!latest.current.location.trim()) latest.current.onAddress(found);
      }
    } catch {
      if (mine === ticket.current) setMessage("We couldn't look up the address for this pin. Type the address yourself, or move the pin to try again.");
    } finally {
      if (mine === ticket.current) setLooking(false);
    }
  };

  const place = (pin: Pin, lookup = true) => {
    latest.current.onChange(pin);
    if (lookup) void lookUp(pin);
  };

  // Create the map once.
  useEffect(() => {
    if (!box.current || map.current) return;
    const m = L.map(box.current).setView(value ? [value.lat, value.lng] : PHNOM_PENH, value ? 15 : 11);
    const tiles = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(m);
    tiles.on("tileerror", () => setTilesFailed(true));
    tiles.on("tileload", () => setTilesFailed(false));
    m.on("click", (e: L.LeafletMouseEvent) => place({ lat: e.latlng.lat, lng: e.latlng.lng }));
    map.current = m;
    setTimeout(() => m.invalidateSize(), 200);
    return () => { m.remove(); map.current = null; marker.current = null; };
  }, []);

  // Keep the marker on the current value (also when an edited club loads after the map).
  useEffect(() => {
    const m = map.current;
    if (!m) return;
    if (!value) {
      marker.current?.remove();
      marker.current = null;
      return;
    }
    if (!marker.current) {
      marker.current = L.marker([value.lat, value.lng], { draggable: true, icon }).addTo(m);
      marker.current.on("dragend", () => {
        const p = marker.current!.getLatLng();
        place({ lat: p.lat, lng: p.lng });
      });
      m.setView([value.lat, value.lng], Math.max(m.getZoom(), 15));
    } else {
      const p = marker.current.getLatLng();
      if (p.lat !== value.lat || p.lng !== value.lng) {
        marker.current.setLatLng([value.lat, value.lng]);
        m.setView([value.lat, value.lng], Math.max(m.getZoom(), 15));
      }
    }
  }, [value?.lat, value?.lng]);

  const search = async () => {
    const q = query.trim();
    if (!q) return;
    setSearching(true);
    setMessage("");
    setPlaces(null);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=5&countrycodes=kh&accept-language=km,en&q=${encodeURIComponent(q)}`, { headers: { Accept: "application/json" } });
      if (!res.ok) throw new Error(String(res.status));
      const rows: any[] = await res.json();
      const found = rows.map((r) => ({ label: String(r.display_name).split(",").slice(0, 4).join(",").trim(), lat: parseFloat(r.lat), lng: parseFloat(r.lon) }));
      setPlaces(found);
      if (found.length === 0) setMessage("No place found in Cambodia. Try a wider area (a town or district), or click the map.");
    } catch {
      setMessage("Search isn't available right now. Click the map to place the pin, or try again in a moment.");
    } finally {
      setSearching(false);
    }
  };

  const choose = (p: Place) => {
    setPlaces(null);
    place({ lat: p.lat, lng: p.lng }, false);
    setAddress(p.label);
    if (!latest.current.location.trim()) latest.current.onAddress(p.label);
  };

  const myLocation = () => {
    if (!navigator.geolocation) return setMessage("This browser can't share your location. Click the map instead.");
    setMessage("");
    navigator.geolocation.getCurrentPosition(
      (pos) => place({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setMessage("We couldn't get your location. Allow location access, or click the map instead."),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const removePin = () => {
    ticket.current++;
    setAddress(null);
    setLooking(false);
    onChange(null);
  };

  return (
    <div className="card-premium">
      <h2 className="text-base font-bold text-foreground mb-1 flex items-center gap-2">
        <MapPin className="w-5 h-5 text-secondary" aria-hidden />
        <span>Pin the club on the map</span>
      </h2>
      <p className="text-xs text-muted-foreground mb-4">Search for a place, click the map, or drag the marker. The pin is saved with the club; the address above stays what you type.</p>

      {/* Not a <form>: this card sits inside the club form, and Enter here must search, not save the club. */}
      <div className="flex gap-2 mb-2">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); void search(); } }}
            placeholder="Search a place in Cambodia (e.g. Wat Phnom, Phnom Penh)"
            className="input-premium"
            style={{ paddingLeft: "2.75rem" }}
            aria-label="Search a place"
          />
        </div>
        <button type="button" onClick={() => void search()} disabled={searching || !query.trim()} className="btn-primary px-5 shrink-0 inline-flex items-center gap-2 disabled:opacity-60">
          {searching && <Loader2 className="w-4 h-4 animate-spin" aria-hidden />} Search
        </button>
      </div>

      {places && places.length > 0 && (
        <ul className="mb-2 rounded-xl border border-border/60 bg-white divide-y divide-border/40 overflow-hidden">
          {places.map((p, i) => (
            <li key={i}>
              <button type="button" onClick={() => choose(p)} lang="km" className="w-full text-left px-3 py-2.5 text-sm hover:bg-muted/30 flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5 text-secondary shrink-0" aria-hidden /> <span>{p.label}</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {message && <p role="status" className="mb-2 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">{message}</p>}

      <div className="relative rounded-xl overflow-hidden border border-border/60">
        <div ref={box} className="w-full h-[320px] md:h-[380px] z-10" />
        {tilesFailed && (
          <p className="absolute inset-x-0 bottom-0 z-[500] bg-amber-50/95 text-amber-800 text-xs font-medium px-3 py-2">The map pictures couldn't load. Check the internet connection, or just type the address.</p>
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button type="button" onClick={myLocation} className="h-10 px-4 rounded-lg border border-border/80 text-sm font-semibold text-slate-700 hover:border-primary hover:text-primary inline-flex items-center gap-2">
          <Crosshair className="w-4 h-4" aria-hidden /> Use my location
        </button>
        {value && (
          <button type="button" onClick={removePin} className="h-10 px-4 rounded-lg border border-border/80 text-sm font-semibold text-slate-600 hover:border-red-300 hover:text-red-700 inline-flex items-center gap-2">
            <Trash2 className="w-4 h-4" aria-hidden /> Remove pin
          </button>
        )}
        <span className="text-xs font-mono text-slate-600 ml-auto">
          {value ? `${value.lat.toFixed(6)}, ${value.lng.toFixed(6)}` : "No pin yet"}
        </span>
      </div>

      {(looking || (address && address !== location)) && (
        <div className="mt-2 text-xs text-slate-600 flex flex-wrap items-center gap-2">
          {looking ? (
            <span className="inline-flex items-center gap-1.5"><Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden /> Looking up the address…</span>
          ) : (
            <>
              <span lang="km">Address for this pin: <strong className="text-slate-800">{address}</strong></span>
              <button type="button" onClick={() => onAddress(address!)} className="font-semibold text-primary hover:underline">Use as the location</button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
