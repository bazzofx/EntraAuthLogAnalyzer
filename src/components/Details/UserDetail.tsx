/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { 
  User, 
  MapPin, 
  Laptop, 
  ShieldCheck, 
  Grid, 
  Clock, 
  ArrowLeft,
  ExternalLink,
  ShieldAlert,
  Smartphone,
  Globe,
  AlertTriangle,
  Share2
} from 'lucide-react';
import { AuthLog, TabType } from '../../types';
import { cn } from '../../utils/formatters';
import { SankeyFlow } from '../SankeyFlow';
import { UserMap } from './UserMap';

interface UserDetailProps {
  setActiveTab: (tab: TabType) => void;
  selectedUser: string | null;
  setSelectedUser: (user: string | null) => void;
  uniqueUsersList: string[];
  allLogs: AuthLog[];
  securityMetrics: any;
}

export const UserDetail: React.FC<UserDetailProps> = ({ 
  setActiveTab, 
  selectedUser, 
  setSelectedUser, 
  uniqueUsersList,
  allLogs,
  securityMetrics
}) => {
  const userLogs = useMemo(() => {
    if (!selectedUser) return [];
    return allLogs.filter(l => l.user === selectedUser);
  }, [allLogs, selectedUser]);

  const latestLog = userLogs[0] || {} as AuthLog;

  const insights = useMemo(() => {
    if (userLogs.length === 0) return null;

    // Location Insights
    const countries = userLogs.map(l => l.location.split(',').pop()?.trim() || 'Unknown');
    const countryCounts: Record<string, number> = {};
    countries.forEach(c => countryCounts[c] = (countryCounts[c] || 0) + 1);
    const primaryCountry = Object.entries(countryCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
    const uniqueLocations = new Set(userLogs.map(l => l.location)).size;

    // Device Insights
    const devices = userLogs.map(l => l['Device ID'] || 'Unknown');
    const deviceCounts: Record<string, number> = {};
    devices.forEach(d => deviceCounts[d] = (deviceCounts[d] || 0) + 1);
    const primaryDevice = Object.entries(deviceCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
    
    const browsers = userLogs.map(l => l.browser || 'Unknown');
    const browserCounts: Record<string, number> = {};
    browsers.forEach(b => browserCounts[b] = (browserCounts[b] || 0) + 1);
    const primaryBrowser = Object.entries(browserCounts).sort((a, b) => b[1] - a[1])[0]?.[0];

    // Security Insights
    const mfaSuccess = userLogs.filter(l => l.mfaResult?.toLowerCase().includes('success')).length;
    const mfaRate = (mfaSuccess / userLogs.length) * 100;
    const failures = userLogs.filter(l => l.status !== 'Success').length;

    const userImpossibleTravel = securityMetrics?.impossibleTravel?.filter((a: any) => a.user === selectedUser) || [];

    // App Insights
    const apps = userLogs.map(l => l.application);
    const appCounts: Record<string, number> = {};
    apps.forEach(a => appCounts[a] = (appCounts[a] || 0) + 1);
    const topApps = Object.entries(appCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);

    // Flow Data
    const flowData = userLogs.map(l => ({
      ...l,
      country: l.location.split(',').pop()?.trim() || 'Unknown'
    }));

    return {
      primaryCountry,
      uniqueLocations,
      allLocations: Array.from(new Set(userLogs.map(l => l.location))),
      allCountries: Array.from(new Set(countries)),
      primaryDevice,
      primaryBrowser,
      mfaRate,
      failures,
      topApps,
      userImpossibleTravel,
      flowData
    };
  }, [userLogs, selectedUser, securityMetrics]);

  if (!selectedUser) {
    return (
      <div className="bg-white border border-black p-12 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-center">
        <User className="mx-auto mb-4 text-gray-300" size={48} />
        <h2 className="text-xl font-bold mb-4">Select a User to View Profile</h2>
        <select 
          className="border border-black px-4 py-2 focus:outline-none"
          onChange={(e) => setSelectedUser(e.target.value)}
          value=""
        >
          <option value="" disabled>Choose a user...</option>
          {uniqueUsersList.map(u => <option key={u} value={u}>{u}</option>)}
        </select>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <button 
          onClick={() => setActiveTab('dashboard')}
          className="flex items-center gap-2 text-sm font-bold uppercase hover:underline"
        >
          <ArrowLeft size={16} /> Back to Dashboard
        </button>
        <div className="flex items-center gap-4">
          <span className="text-xs font-bold uppercase text-gray-500">Switch User:</span>
          <select 
            className="border border-black px-3 py-1 text-sm focus:outline-none"
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
          >
            {uniqueUsersList.map(u => <option key={u} value={u}>{u}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 1. User Identity */}
        <div className="lg:col-span-1 bg-white border border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-t-8 border-t-black">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-black text-white p-2">
              <User size={24} />
            </div>
            <h3 className="text-lg font-bold uppercase tracking-tight">User Identity</h3>
          </div>
          <div className="space-y-4">
            <DetailItem label="Name" value={latestLog.user} />
            <DetailItem label="Username" value={latestLog.username} />
            <DetailItem label="User ID" value={latestLog['User ID']} mono />
            <DetailItem label="User Type" value={latestLog['User type']} />
            <DetailItem label="Tenant" value={latestLog['Home tenant name']} />
            <DetailItem label="Tenant ID" value={latestLog['Home tenant ID']} mono />
          </div>
        </div>

        {/* 2. Login Location */}
        <div className="lg:col-span-2 bg-white border border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-t-8 border-t-blue-500">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-blue-500 text-white p-2">
              <MapPin size={24} />
            </div>
            <h3 className="text-lg font-bold uppercase tracking-tight">Login Location Overview</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <DetailItem label="Primary IP" value={latestLog.ipAddress} mono />
              <div>
                <div className="text-[10px] font-bold uppercase text-gray-400 tracking-widest mb-1">All Locations</div>
                <div className="flex flex-wrap gap-2">
                  {insights?.allLocations.map(loc => (
                    <span key={loc} className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 border border-blue-100 font-medium">
                      {loc}
                    </span>
                  ))}
                </div>
              </div>
              <DetailItem label="ASN" value={latestLog['Autonomous system number']} />
              <DetailItem label="Global Secure Access" value={latestLog['Through Global Secure Access'] || 'No'} />
              
              <div className="mt-4">
                <div className="text-[10px] font-bold uppercase text-gray-400 tracking-widest mb-2">Activity Map</div>
                <UserMap countries={insights?.allCountries || []} />
              </div>
            </div>
            <div className="bg-blue-50 p-4 border border-blue-100 flex flex-col">
              <h4 className="text-[10px] font-bold uppercase text-blue-800 mb-3 tracking-widest">Profile Insights</h4>
              <div className="space-y-3 flex-1">
                <InsightItem label="Primary Country" value={insights?.primaryCountry} />
                <InsightItem label="Known Locations" value={`${insights?.uniqueLocations} unique cities`} />
                
                {insights?.userImpossibleTravel && insights.userImpossibleTravel.length > 0 && (
                  <div className="p-3 bg-red-100 border border-red-200 rounded-sm mt-4">
                    <div className="flex items-center gap-2 text-red-700 mb-1">
                      <AlertTriangle size={14} />
                      <span className="text-[10px] font-bold uppercase">Impossible Travel Detected</span>
                    </div>
                    <div className="text-[10px] text-red-600">
                      {insights.userImpossibleTravel.length} incident(s) flagged for this user.
                    </div>
                  </div>
                )}

                <div className="pt-2 border-t border-blue-200 mt-auto">
                  <div className="text-[10px] text-blue-600 font-bold uppercase mb-1">Status</div>
                  <div className="text-xs font-medium">
                    {insights?.userImpossibleTravel && insights.userImpossibleTravel.length > 0 
                      ? "Unusual travel patterns detected. Review required."
                      : "Consistent login patterns detected."}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* User Auth Flow - New Section */}
        <div className="lg:col-span-3 bg-white border border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-t-8 border-t-purple-600">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-purple-600 text-white p-2">
              <Share2 size={24} />
            </div>
            <h3 className="text-lg font-bold uppercase tracking-tight">User Authentication Flow</h3>
          </div>
          <div className="flex justify-center bg-gray-50 p-4 border border-black/5">
            <SankeyFlow 
              data={insights?.flowData || []}
              customNodes={['user', 'country', 'application', 'status']}
              width={1000}
              height={400}
            />
          </div>
          <div className="mt-4 grid grid-cols-4 gap-4 text-center">
            <div className="text-[10px] font-bold uppercase tracking-widest text-purple-600">User</div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-blue-500">Countries</div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-emerald-500">Applications</div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Outcome</div>
          </div>
        </div>

        {/* 3. Device & Platform */}
        <div className="lg:col-span-2 bg-white border border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-t-8 border-t-emerald-500">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-emerald-500 text-white p-2">
              <Laptop size={24} />
            </div>
            <h3 className="text-lg font-bold uppercase tracking-tight">Device & Platform Profile</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <DetailItem label="Device ID" value={latestLog['Device ID']} mono />
              <DetailItem label="Browser" value={latestLog.browser} />
              <DetailItem label="OS" value={latestLog.os} />
              <DetailItem label="Client App" value={latestLog['Client app']} />
              <DetailItem label="Join Type" value={latestLog['Join Type']} />
              <div className="flex gap-4">
                <DetailItem label="Managed" value={latestLog['Managed'] || 'Unknown'} />
                <DetailItem label="Compliant" value={latestLog['Compliant'] || 'Unknown'} />
              </div>
            </div>
            <div className="bg-emerald-50 p-4 border border-emerald-100">
              <h4 className="text-[10px] font-bold uppercase text-emerald-800 mb-3 tracking-widest">Profile Insights</h4>
              <div className="space-y-3">
                <InsightItem label="Primary Device" value={insights?.primaryDevice} />
                <InsightItem label="Primary Browser" value={insights?.primaryBrowser} />
                <InsightItem label="Managed Device" value={latestLog['Managed'] === 'Yes' ? 'Yes' : 'No'} />
                <InsightItem label="Compliant" value={latestLog['Compliant'] === 'Yes' ? 'Yes' : 'No'} />
              </div>
            </div>
          </div>
        </div>

        {/* 4. Auth & Security */}
        <div className="lg:col-span-1 bg-white border border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-t-8 border-t-red-500">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-red-500 text-white p-2">
              <ShieldCheck size={24} />
            </div>
            <h3 className="text-lg font-bold uppercase tracking-tight">Security Posture</h3>
          </div>
          <div className="space-y-4">
            <DetailItem label="Auth Requirement" value={latestLog.authRequirement} />
            <DetailItem label="MFA Result" value={latestLog.mfaResult} />
            <DetailItem label="MFA Method" value={latestLog['Multifactor authentication auth method']} />
            <DetailItem label="Conditional Access" value={latestLog['Conditional Access']} />
            <DetailItem label="Token Protection" value={latestLog['Token Protection - Sign In Session']} />
            <div className="pt-4 border-t border-gray-100">
              <DetailItem label="Last Status" value={latestLog.status} />
              {latestLog.status !== 'Success' && (
                <>
                  <DetailItem label="Error Code" value={latestLog['Sign-in error code']} />
                  <DetailItem label="Failure Reason" value={latestLog.failureReason} />
                </>
              )}
            </div>
          </div>
        </div>

        {/* 5. Application Usage */}
        <div className="lg:col-span-1 bg-white border border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-t-8 border-t-orange-500">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-orange-500 text-white p-2">
              <Grid size={24} />
            </div>
            <h3 className="text-lg font-bold uppercase tracking-tight">Application Profile</h3>
          </div>
          <div className="space-y-4 mb-6">
            <DetailItem label="Latest App" value={latestLog.application} />
            <DetailItem label="Resource" value={latestLog['Resource']} />
            <DetailItem label="Credential Type" value={latestLog['Client credential type']} />
            <DetailItem label="Protocol" value={latestLog['Authentication Protocol']} />
          </div>
          <div className="bg-orange-50 p-4 border border-orange-100">
            <h4 className="text-[10px] font-bold uppercase text-orange-800 mb-3 tracking-widest">Most Used Apps</h4>
            <div className="space-y-2">
              {insights?.topApps.map(([app, count]) => (
                <div key={app} className="flex justify-between items-center text-xs">
                  <span className="font-medium truncate mr-2">{app}</span>
                  <span className="font-mono bg-white px-1 border border-orange-200">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 6. Session Behaviour */}
        <div className="lg:col-span-2 bg-white border border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-t-8 border-t-purple-500">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-purple-500 text-white p-2">
              <Clock size={24} />
            </div>
            <h3 className="text-lg font-bold uppercase tracking-tight">Session Behaviour</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <DetailItem label="Last Sign-in" value={latestLog.date} />
              <DetailItem label="Session ID" value={latestLog['Session ID']} mono />
              <DetailItem label="Correlation ID" value={latestLog['Correlation ID']} mono />
              <DetailItem label="Latency" value={`${latestLog.latency}ms`} />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-[10px]">
                <thead>
                  <tr className="border-b border-black">
                    <th className="text-left pb-2 uppercase italic">Date</th>
                    <th className="text-left pb-2 uppercase italic">App</th>
                    <th className="text-left pb-2 uppercase italic">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {userLogs.slice(0, 8).map((log, i) => (
                    <tr key={i} className="border-b border-gray-100 last:border-0">
                      <td className="py-2 font-mono">{log.date.split('T')[0]}</td>
                      <td className="py-2 truncate max-w-[100px]">{log.application}</td>
                      <td className="py-2">
                        <span className={cn(
                          "px-1 font-bold",
                          log.status === 'Success' ? "text-emerald-600" : "text-red-600"
                        )}>
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const DetailItem = ({ label, value, mono = false }: { label: string, value: any, mono?: boolean }) => (
  <div>
    <div className="text-[10px] font-bold uppercase text-gray-400 tracking-widest mb-0.5">{label}</div>
    <div className={cn(
      "text-sm font-medium break-all",
      mono && "font-mono text-xs bg-gray-50 p-1 border border-gray-100"
    )}>
      {value || '—'}
    </div>
  </div>
);

const InsightItem = ({ label, value }: { label: string, value: any }) => (
  <div className="flex justify-between items-center">
    <span className="text-[10px] font-bold uppercase text-gray-500">{label}</span>
    <span className="text-xs font-bold">{value || '—'}</span>
  </div>
);
