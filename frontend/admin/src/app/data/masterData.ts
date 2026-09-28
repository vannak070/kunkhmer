/**
 * Fixed reference data. Glove sizes are physical sizes and don't change.
 * Everything KKF edits (weight classes, venues, bout rule presets, glove brands)
 * lives in the database since Phase 5 — see hooks/useSettingsLists.ts.
 */

export interface GloveSize {
  id: string;
  size: string;
  weightRange: string;
  description: string;
}

// Glove Sizes Master List
export const GLOVE_SIZES: GloveSize[] = [
  {
    id: 'glove-6oz',
    size: '6oz',
    weightRange: 'Up to 54kg',
    description: 'Lightweight gloves for smaller fighters',
  },
  {
    id: 'glove-8oz',
    size: '8oz',
    weightRange: '54kg - 67kg',
    description: 'Standard gloves for most weight classes',
  },
  {
    id: 'glove-10oz',
    size: '10oz',
    weightRange: '67kg and above',
    description: 'Heavier gloves for larger fighters',
  },
];
