import { MOCK_JUDGES, MOCK_REFEREES, type Official } from "../data/officials";

const JUDGES_STORAGE_KEY = "kkf_judges";
const REFEREES_STORAGE_KEY = "kkf_referees";

// Initialize from localStorage or use mock data
const initializeData = <T>(storageKey: string, defaultData: T[]): T[] => {
  if (typeof window === "undefined") return defaultData;
  
  const stored = localStorage.getItem(storageKey);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      // Force reset if the data contains old short IDs (like 'J001' or 'R001')
      if (Array.isArray(parsed) && parsed.length > 0 && String((parsed[0] as any).id || "").length < 10) {
        localStorage.setItem(storageKey, JSON.stringify(defaultData));
        return defaultData;
      }
      return parsed;
    } catch {
      return defaultData;
    }
  }
  
  // Save default data to localStorage
  localStorage.setItem(storageKey, JSON.stringify(defaultData));
  return defaultData;
};

// Get all judges
export const getJudges = (): Official[] => {
  return initializeData(JUDGES_STORAGE_KEY, MOCK_JUDGES);
};

// Get all referees
export const getReferees = (): Official[] => {
  return initializeData(REFEREES_STORAGE_KEY, MOCK_REFEREES);
};

// Get all officials
export const getAllOfficials = (): (Official & { role: "Referee" | "Judge" })[] => {
  const referees = getReferees().map(r => ({ ...r, role: "Referee" as const }));
  const judges = getJudges().map(j => ({ ...j, role: "Judge" as const }));
  return [...referees, ...judges];
};

// Add a new judge
export const addJudge = (judge: Official): void => {
  const judges = getJudges();
  judges.unshift(judge); // Add to beginning
  localStorage.setItem(JUDGES_STORAGE_KEY, JSON.stringify(judges));
};

// Add a new referee
export const addReferee = (referee: Official): void => {
  const referees = getReferees();
  referees.unshift(referee); // Add to beginning
  localStorage.setItem(REFEREES_STORAGE_KEY, JSON.stringify(referees));
};

// Update a judge
export const updateJudge = (id: string, updatedJudge: Official): void => {
  const judges = getJudges();
  const index = judges.findIndex(j => j.id === id);
  if (index !== -1) {
    judges[index] = updatedJudge;
    localStorage.setItem(JUDGES_STORAGE_KEY, JSON.stringify(judges));
  }
};

// Update a referee
export const updateReferee = (id: string, updatedReferee: Official): void => {
  const referees = getReferees();
  const index = referees.findIndex(r => r.id === id);
  if (index !== -1) {
    referees[index] = updatedReferee;
    localStorage.setItem(REFEREES_STORAGE_KEY, JSON.stringify(referees));
  }
};

// Delete a judge
export const deleteJudge = (id: string): void => {
  const judges = getJudges().filter(j => j.id !== id);
  localStorage.setItem(JUDGES_STORAGE_KEY, JSON.stringify(judges));
};

// Delete a referee
export const deleteReferee = (id: string): void => {
  const referees = getReferees().filter(r => r.id !== id);
  localStorage.setItem(REFEREES_STORAGE_KEY, JSON.stringify(referees));
};

// Get a specific official by ID
export const getOfficialById = (id: string): (Official & { role: "Referee" | "Judge" }) | null => {
  const allOfficials = getAllOfficials();
  return allOfficials.find(o => o.id === id) || null;
};

// Reset to default data (useful for testing)
export const resetToDefaultData = (): void => {
  localStorage.setItem(JUDGES_STORAGE_KEY, JSON.stringify(MOCK_JUDGES));
  localStorage.setItem(REFEREES_STORAGE_KEY, JSON.stringify(MOCK_REFEREES));
};
