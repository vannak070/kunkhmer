/**
 * Venues from the API (`/settings/venues`, edited by KKF in the admin's System Settings). Events save the
 * English venue name as text; this finds the matching list entry so the page can show its Khmer name when
 * the visitor reads Khmer (claude/updates/settings-bilingual-entries.md).
 */
import { useEffect, useState } from "react";
import { api } from "../utils/api";
import { useI18n } from "../i18n/LanguageContext";

export interface Venue {
  id: string;
  name: string;
  name_khmer: string | null;
}

let cache: Promise<Venue[]> | null = null;

function loadVenues(): Promise<Venue[]> {
  if (!cache) {
    cache = api.settings.listVenues().catch(() => {
      cache = null; // retry on the next page load
      return [];
    });
  }
  return cache!;
}

/** `placeName(text)`: the saved place in the visitor's language (the Khmer name for a listed venue when Khmer is on). */
export function usePlaceName() {
  const { lang } = useI18n();
  const [venues, setVenues] = useState<Venue[]>([]);
  useEffect(() => {
    let alive = true;
    loadVenues().then((v) => alive && setVenues(v));
    return () => {
      alive = false;
    };
  }, []);
  return (place: string | null | undefined): string => {
    if (!place) return "";
    const venue = venues.find((v) => v.name === place);
    return venue && lang === "km" && venue.name_khmer ? venue.name_khmer : place;
  };
}
