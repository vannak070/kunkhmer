/**
 * Published "About the Federation" content (/federation, the About page card and the footer link).
 * One request per page load, shared by every caller. See claude/features/about-federation.md.
 */
import { useEffect, useState } from "react";
import { api } from "../utils/api";

export type FederationLeader = { nameEn: string; nameKm: string | null; roleEn: string; roleKm: string | null; photoUrl: string | null };
export type FederationDocument = { titleEn: string; titleKm: string | null; fileUrl: string };
export type Federation = {
  missionEn: string | null;
  missionKm: string | null;
  historyEn: string | null;
  historyKm: string | null;
  foundedYear: number | null;
  leaders: FederationLeader[];
  addressEn: string | null;
  addressKm: string | null;
  phone: string | null;
  email: string | null;
  officeHoursEn: string | null;
  officeHoursKm: string | null;
  mapUrl: string | null;
  registerEn: string | null;
  registerKm: string | null;
  documents: FederationDocument[];
  publishedAt: string | null;
};

let request: Promise<Federation | null> | null = null;

/** undefined while loading, null when nothing is published (or it couldn't be loaded). */
export function useFederation(): Federation | null | undefined {
  const [data, setData] = useState<Federation | null | undefined>(undefined);
  useEffect(() => {
    request ??= api.federation.get().catch(() => {
      request = null;
      return null;
    });
    let live = true;
    request.then((v) => live && setData(v ?? null));
    return () => {
      live = false;
    };
  }, []);
  return data;
}
