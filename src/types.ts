/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface AuthLog {
  date: string;
  requestId: string;
  user: string;
  username: string;
  application: string;
  ipAddress: string;
  location: string;
  status: string;
  failureReason: string;
  browser: string;
  os: string;
  mfaResult: string;
  authRequirement: string;
  userAgent: string;
  latency: number;
  [key: string]: any;
}

export interface Filters {
  search: string;
  status: string;
  user: string;
  app: string;
}

export interface Stats {
  total: number;
  success: number;
  failure: number;
  uniqueUsers: number;
  uniqueApps: number;
  uniqueCountries: number;
}

export type TabType = 'dashboard' | 'logs' | 'flow' | 'security' | 'travel-detail' | 'app-detail' | 'hourly-detail' | 'user-detail' | 'anomaly-detail';
export type CorrelationTabType = 'temporal' | 'geographical' | 'infrastructure' | 'behavioral';
