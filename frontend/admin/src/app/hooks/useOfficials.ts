/**
 * Referees and judges from the API (`GET /officials`, KKF staff and organizers).
 * Pass a fight-night date to get each official's bouts that night ("busy").
 */
import { useCallback, useEffect, useState } from "react";
import { api } from "../utils/api";

export interface Official {
  id: string;
  fullName: string;
  role: "Referee" | "Judge";
  status: string;
  grade: string | null;
  since: number | null;
  yearsExperience: number | null;
  upcomingBouts: number;
  boutsOnDate: number | null;
  username?: string;
  email?: string;
}

export const OFFICIAL_GRADES = ["International A", "National A", "National B"];

/** "International A · 12 yrs" style summary, skipping what isn't known. */
export const officialSummary = (o: Pick<Official, "grade" | "yearsExperience">) =>
  [o.grade, o.yearsExperience != null ? `${o.yearsExperience} yr${o.yearsExperience === 1 ? "" : "s"}` : null].filter(Boolean).join(" · ");

const STAFF_OR_ORGANIZER = ["Super Admin", "KKF Officer", "Organizer"];
export const canListOfficials = () => STAFF_OR_ORGANIZER.includes(api.auth.getCurrentUser()?.role);

export function useOfficials(date?: string | null) {
  const [officials, setOfficials] = useState<Official[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!canListOfficials()) {
      setLoading(false);
      return;
    }
    try {
      setOfficials(await api.officials.list(date ? { date: date.slice(0, 10) } : {}));
    } catch {
      setOfficials([]);
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => {
    load();
  }, [load]);

  const active = officials.filter((o) => o.status === "Active");
  return {
    officials,
    referees: active.filter((o) => o.role === "Referee"),
    judges: active.filter((o) => o.role === "Judge"),
    /** Name for an id (inactive officials included), or null. */
    nameOf: (id?: string | null) => officials.find((o) => o.id === id)?.fullName ?? null,
    byId: (id?: string | null) => officials.find((o) => o.id === id) ?? null,
    loading,
    reload: load,
  };
}

/** Label for a referee/judge picker: name, grade and — the "busy" hint — bouts already that night. */
export const officialOption = (o: Official) =>
  [o.fullName, o.grade, o.boutsOnDate ? `${o.boutsOnDate} bout${o.boutsOnDate === 1 ? "" : "s"} that night` : null].filter(Boolean).join(" · ");
