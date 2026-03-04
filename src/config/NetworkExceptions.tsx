/**
 * Configuration for IP-specific Exceptions
 * Add IP addresses here that should be ignored in Network Infrastructure Analysis.
 */

export const IP_EXCEPTIONS: string[] = [
  '127.0.0.1',
  '::1',
  '152.114.64.4', 
  '118.185.175.45',
];

/**
 * Helper to check if an IP should be ignored
 */
export const isIPException = (ip: string): boolean => {
  return IP_EXCEPTIONS.includes(ip);
};
