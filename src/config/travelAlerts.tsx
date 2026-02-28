/**
 * Configuration for Impossible Travel False Positives
 * Add country code pairs here that should be ignored when "Hide False Positives" is active.
 */

export interface TravelExclusion {
  from: string;
  to: string;
}

export const TRAVEL_EXCLUSIONS: TravelExclusion[] = [
  { from: 'GB', to: 'IE' },
  { from: 'IE', to: 'GB' },
  { from: 'GB', to: 'IN' },
  { from: 'IN', to: 'GB' },
  { from: 'AU', to: 'GB' },
  { from: 'GB', to: 'AU' },
];

/**
 * Helper to check if a pair of locations is a known false positive
 */
export const isFalsePositive = (loc1: string, loc2: string): boolean => {
  const c1 = loc1.slice(-2).toUpperCase();
  const c2 = loc2.slice(-2).toUpperCase();
  
  return TRAVEL_EXCLUSIONS.some(ex => 
    (ex.from === c1 && ex.to === c2) || (ex.from === c2 && ex.to === c1)
  );
};
