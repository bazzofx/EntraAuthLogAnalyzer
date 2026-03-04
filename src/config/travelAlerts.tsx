/**
 * Configuration for User-specific Impossible Travel Exceptions
 * Mapping of user email to an array of country codes that should be ignored for alerts.
 */

export const USER_EXCEPTIONS: Record<string, string[]> = {
  'admin@example.com': ['IN'],
};

/**
 * Helper to check if a user's login from a specific country should be ignored
 */
export const isUserException = (user: string, country: string): boolean => {
  const allowedCountries = USER_EXCEPTIONS[user];
  return allowedCountries ? allowedCountries.includes(country.toUpperCase()) : false;
};
