export interface AuthLog {
  date: string;
  requestId: string;
  userAgent: string;
  correlationId: string;
  userId: string;
  user: string;
  username: string;
  userType: string;
  application: string;
  applicationId: string;
  resource: string;
  ipAddress: string;
  location: string;
  status: 'Success' | 'Failure' | string;
  errorCode: string;
  failureReason: string;
  clientApp: string;
  browser: string;
  os: string;
  mfaResult: string;
  mfaMethod: string;
  latency: number;
  conditionalAccess: string;
  [key: string]: any; // Allow for other fields
}

export interface FilterState {
  search: string;
  status: string;
  user: string;
  application: string;
  dateRange: {
    start: string;
    end: string;
  };
}
