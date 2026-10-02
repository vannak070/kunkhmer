/**
 * Settings lists from the API (Phase 5): weight classes, venues, bout rule presets and
 * glove brands and associations. Edited by the Super Admin on System Settings; every form reads them here.
 * Active entries are cached per list; call `refreshSettingsList` after an edit.
 */
import { useCallback, useEffect, useState } from "react";
import { api } from "../utils/api";
import { useLang } from "../i18n/program";

export type SettingsListName = "weight-classes" | "venues" | "bout-rules" | "glove-brands" | "associations";

interface Base { id: string; sort_order: number; active: boolean }
export interface WeightClass extends Base { name: string; name_khmer: string | null; min_kg: number | null; max_kg: number | null }
export interface Venue extends Base { name: string; name_khmer: string | null; region: string | null; region_khmer: string | null; description: string | null; latitude: number | null; longitude: number | null }
export interface BoutRule extends Base { name: string; name_khmer: string | null; rounds: number; round_time: number; knockdown_limit: number; glove_size: string | null }
export interface GloveBrand extends Base { brand: string; model: string | null }
export interface Association extends Base { name: string; name_khmer: string | null }

const cache = new Map<SettingsListName, Promise<any[]>>();
const listeners = new Map<SettingsListName, Set<(rows: any[]) => void>>();

function load(list: SettingsListName, force = false): Promise<any[]> {
  if (force || !cache.has(list)) {
    const p = api.settingsLists.list(list).catch(() => []);
    cache.set(list, p);
    p.then((rows) => listeners.get(list)?.forEach((l) => l(rows)));
  }
  return cache.get(list)!;
}

/** Reload a list everywhere it's shown (after adding or editing an entry). */
export const refreshSettingsList = (list: SettingsListName) => load(list, true);

export function useSettingsList<T>(list: SettingsListName) {
  const [rows, setRows] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let alive = true;
    const set = (r: any[]) => alive && setRows(r as T[]);
    if (!listeners.has(list)) listeners.set(list, new Set());
    listeners.get(list)!.add(set);
    load(list).then((r) => { set(r); if (alive) setLoading(false); });
    return () => { alive = false; listeners.get(list)!.delete(set); };
  }, [list]);
  const reload = useCallback(() => load(list, true), [list]);
  return { rows, loading, reload };
}

/**
 * A fighter's class: the class with the lowest maximum at or above their weight;
 * above every maximum → the open-ended top class (no maximum).
 */
export function weightClassFor(kg: number | string | null | undefined, classes: WeightClass[]): string {
  const w = Number(kg);
  if (!w || classes.length === 0) return "";
  const bounded = classes.filter((c) => c.max_kg != null).sort((a, b) => a.max_kg! - b.max_kg!);
  return (bounded.find((c) => w <= c.max_kg!) ?? classes.find((c) => c.max_kg == null) ?? bounded[bounded.length - 1])?.name ?? "";
}

export function useWeightClasses() {
  const { rows, loading } = useSettingsList<WeightClass>("weight-classes");
  return {
    classes: rows,
    names: rows.map((c) => c.name),
    classFor: (kg: number | string | null | undefined) => weightClassFor(kg, rows),
    loading,
  };
}

/** "Twins Special BGVL-3": how a glove brand is stored on a bout. */
export const gloveLabel = (g: Pick<GloveBrand, "brand" | "model">) => [g.brand, g.model].filter(Boolean).join(" ");

/**
 * Position (percent) of a venue on the fight-card page's Cambodia map, from its
 * coordinates (fitted to the map's former hand-placed pins); null without coordinates.
 */
export function venuePin(v: Pick<Venue, "latitude" | "longitude">): { x: number; y: number } | null {
  if (v.latitude == null || v.longitude == null) return null;
  const clamp = (n: number) => Math.min(95, Math.max(5, n));
  return { x: clamp(25 + (v.longitude - 103.2022) * 15.79), y: clamp(35 + (13.0957 - v.latitude) * 16.44) };
}

/** A list entry's name in the chosen language: the Khmer name when Khmer is on and one is set, else the English name. */
export const listName = (row: { name: string; name_khmer?: string | null }, lang: "en" | "km") => (lang === "km" && row.name_khmer ? row.name_khmer : row.name);

/** The venue list entry for an event's saved place text (events save the English name). */
export const venueFor = <V extends { name: string }>(venues: V[], place: string | null | undefined) => (place ? venues.find((v) => v.name === place) : undefined);

/** `placeName(text)`: an event's saved place in the chosen language (its Khmer name when it is a listed venue). */
export function usePlaceName() {
  const { rows } = useSettingsList<Venue>("venues");
  const lang = useLang();
  return (place: string | null | undefined) => {
    const venue = venueFor(rows, place);
    return venue ? listName(venue, lang) : (place ?? "");
  };
}
