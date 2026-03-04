/**
 * Configuration for Location-specific Impossible Travel Exceptions
 * Add pairs of country codes here that should be ignored for impossible travel alerts.
 * For example: ['IN', 'GB'] will ignore travel between India and Great Britain.
 */

export const LOCATION_EXCEPTIONS: [string, string][] = [
  ['IN', 'GB'],
  ['GB', 'IE'],
  ['GB', 'AU'],
  
];

/**
 * Helper to check if travel between two countries should be ignored
 */
export const isLocationException = (countryA: string, countryB: string): boolean => {
  return LOCATION_EXCEPTIONS.some(pair => 
    (pair[0].toUpperCase() === countryA.toUpperCase() && pair[1].toUpperCase() === countryB.toUpperCase()) || 
    (pair[0].toUpperCase() === countryB.toUpperCase() && pair[1].toUpperCase() === countryA.toUpperCase())
  );
};
