/**
 * Configuration for Location-specific Impossible Travel Exceptions
 * Add pairs of country codes here that should be ignored for impossible travel alerts.
 * For example: ['IN', 'GB'] will ignore travel between India and Great Britain.
 */

// Countries exceptions that will not show Impossible Travel
export const LOCATION_EXCEPTIONS: [string, string][] = [
  ['IN', 'GB'],
  ['GB', 'IE'],
  ['GB', 'AU'],
  
];
// Countries exceptions that will not show on the Auth Anomaly Monitor
export const TRUSTED_COUNTRIES: string[] = [
  'GB',
  'AU',
  'IN',
  'IE'
];

/**
 * Helper to check if a country is trusted
 */
export const isTrustedCountry = (country: string): boolean => {
  return TRUSTED_COUNTRIES.includes(country.toUpperCase());
};

/**
 * Helper to check if travel between two countries should be ignored
 */
export const isLocationException = (countryA: string, countryB: string): boolean => {
  return LOCATION_EXCEPTIONS.some(pair => 
    (pair[0].toUpperCase() === countryA.toUpperCase() && pair[1].toUpperCase() === countryB.toUpperCase()) || 
    (pair[0].toUpperCase() === countryB.toUpperCase() && pair[1].toUpperCase() === countryA.toUpperCase())
  );
};
