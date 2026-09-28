/**
 * Official weight classes from the API (`/settings/weight-classes`, edited by KKF in
 * the admin's System Settings). Loaded once and shared; the division standings and
 * fighter cards use them.
 */
import { useEffect, useState } from "react";
import { api } from "../utils/api";

export interface WeightClass {
  id: string;
  name: string;
  name_khmer: string | null;
  min_kg: number | null;
  max_kg: number | null;
}

let cache: Promise<WeightClass[]> | null = null;

export function loadWeightClasses(): Promise<WeightClass[]> {
  if (!cache) {
    cache = api.settings.listWeightClasses().catch(() => {
      cache = null; // retry on the next page load
      return [];
    });
  }
  return cache!;
}

/**
 * A fighter's class: the class with the lowest maximum at or above their weight;
 * above every maximum → the open-ended top class. Null when unknown.
 */
export function weightClassFor(kg: number | string | null | undefined, classes: WeightClass[]): WeightClass | null {
  const w = Number(kg);
  if (!w || classes.length === 0) return null;
  const bounded = classes.filter((c) => c.max_kg != null).sort((a, b) => a.max_kg! - b.max_kg!);
  return bounded.find((c) => w <= c.max_kg!) ?? classes.find((c) => c.max_kg == null) ?? bounded[bounded.length - 1] ?? null;
}

export function useWeightClasses(): WeightClass[] {
  const [classes, setClasses] = useState<WeightClass[]>([]);
  useEffect(() => {
    let alive = true;
    loadWeightClasses().then((c) => alive && setClasses(c));
    return () => {
      alive = false;
    };
  }, []);
  return classes;
}
