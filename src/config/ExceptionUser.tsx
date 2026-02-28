/**
 * Configuration for User-specific Impossible Travel Exceptions
 * Add users and country codes here that should be ignored for impossible travel alerts.
 */

export interface UserException {
  user: string;
  countryCode: string;
}

export const USER_EXCEPTIONS: UserException[] = [
  { user: 'Gita Benayahu', countryCode: 'IL' },
];

/**
 * Helper to check if a user's activity in a specific country should be ignored
 */
export const isUserException = (user: string, countryCode: string): boolean => {
  return USER_EXCEPTIONS.some(ex => 
    ex.user === user && ex.countryCode === countryCode.toUpperCase()
  );
};
