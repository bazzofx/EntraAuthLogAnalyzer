/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useCallback } from 'react';
import Papa from 'papaparse';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, Legend 
} from 'recharts';
import { 
  Upload, Filter, Search, FileText, AlertCircle, CheckCircle2, 
  Users, Shield, Globe, Activity, ChevronDown, ChevronUp, Download, RotateCcw,
  LayoutDashboard, List, BarChart3, Map as MapIcon, Share2, ShieldAlert, ArrowRight,
  Eye, EyeOff, Clock, Zap, Server, Monitor, Chrome, Network, Smartphone, Key, MousePointer2
} from 'lucide-react';
import { format, parseISO, isWithinInterval } from 'date-fns';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { SankeyFlow } from './components/SankeyFlow';
import { SecurityMap } from './components/SecurityMap';
import { isFalsePositive } from './config/travelAlerts';
import { isUserException } from './config/ExceptionUser';

// Types
interface AuthLog {
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

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const COLORS = ['#10b981', '#ef4444', '#f59e0b', '#3b82f6', '#8b5cf6', '#ec4899'];

const DATE_FORMAT = 'dd/MM/yyyy HH:mm:ss';
const formatDate = (dateStr: string) => {
  try {
    return format(parseISO(dateStr), DATE_FORMAT);
  } catch (e) {
    return dateStr;
  }
};

export default function App() {
  const [logs, setLogs] = useState<AuthLog[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'logs' | 'flow' | 'security' | 'travel-detail' | 'app-detail' | 'hourly-detail'>('dashboard');
  const [activeCorrelationTab, setActiveCorrelationTab] = useState<'temporal' | 'geographical' | 'infrastructure' | 'behavioral'>('temporal');
  const [selectedTravelAlert, setSelectedTravelAlert] = useState<any>(null);
  const [selectedHour, setSelectedHour] = useState<number | null>(null);
  const [selectedApp, setSelectedApp] = useState<string | null>(null);
  const [flowCountryFilter, setFlowCountryFilter] = useState<string | null>(null);
  const [hideFalsePositives, setHideFalsePositives] = useState(false);
  const [impossibleTravelFilter, setImpossibleTravelFilter] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    status: 'All',
    user: 'All',
    app: 'All'
  });

  const clearFilters = useCallback(() => {
    setFilters({
      search: '',
      status: 'All',
      user: 'All',
      app: 'All'
    });
    setFlowCountryFilter(null);
    setSelectedApp(null);
  }, []);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const parsedLogs: AuthLog[] = results.data.map((row: any) => ({
          date: row['Date (UTC)'] || '',
          requestId: row['Request ID'] || '',
          user: row['User'] || '',
          username: row['Username'] || '',
          application: row['Application'] || '',
          ipAddress: row['IP address'] || '',
          location: row['Location'] || '',
          status: row['Status'] || '',
          failureReason: row['Failure reason'] || '',
          browser: row['Browser'] || '',
          os: row['Operating System'] || '',
          mfaResult: row['Multifactor authentication result'] || '',
          authRequirement: row['Authentication requirement'] || '',
          userAgent: row['User agent'] || '',
          latency: parseInt(row['Latency']) || 0,
          ...row
        }));
        setLogs(parsedLogs);
        setIsUploading(false);
      },
      error: (error) => {
        console.error('Error parsing CSV:', error);
        setIsUploading(false);
      }
    });
  };

  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const matchesSearch = 
        log.user.toLowerCase().includes(filters.search.toLowerCase()) ||
        log.username.toLowerCase().includes(filters.search.toLowerCase()) ||
        log.ipAddress.toLowerCase().includes(filters.search.toLowerCase()) ||
        log.application.toLowerCase().includes(filters.search.toLowerCase()) ||
        log.location.toLowerCase().includes(filters.search.toLowerCase()) ||
        (log.mfaResult || '').toLowerCase().includes(filters.search.toLowerCase()) ||
        (log.authRequirement || '').toLowerCase().includes(filters.search.toLowerCase()) ||
        (log.userAgent || '').toLowerCase().includes(filters.search.toLowerCase());
      
      const matchesStatus = filters.status === 'All' || log.status === filters.status;
      const matchesUser = filters.user === 'All' || log.user === filters.user;
      const matchesApp = filters.app === 'All' || log.application === filters.app;

      return matchesSearch && matchesStatus && matchesUser && matchesApp;
    });
  }, [logs, filters]);

  const stats = useMemo(() => {
    const total = filteredLogs.length;
    const success = filteredLogs.filter(l => l.status === 'Success').length;
    const failure = total - success;
    const uniqueUsers = new Set(filteredLogs.map(l => l.user)).size;
    const uniqueApps = new Set(filteredLogs.map(l => l.application)).size;
    const uniqueCountries = new Set(filteredLogs.map(l => {
      const loc = l.location || '';
      return loc.length >= 2 ? loc.slice(-2).toUpperCase() : '??';
    })).size;

    return { total, success, failure, uniqueUsers, uniqueApps, uniqueCountries };
  }, [filteredLogs]);

  const statusData = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredLogs.forEach(log => {
      counts[log.status] = (counts[log.status] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [filteredLogs]);

  const timelineData = useMemo(() => {
    const counts: Record<string, { success: number, failure: number }> = {};
    filteredLogs.forEach(log => {
      try {
        const date = format(parseISO(log.date), 'dd/MM HH:00');
        if (!counts[date]) counts[date] = { success: 0, failure: 0 };
        if (log.status === 'Success') counts[date].success++;
        else counts[date].failure++;
      } catch (e) {}
    });
    return Object.entries(counts)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([time, data]) => ({ time, ...data }));
  }, [filteredLogs]);

  const topApps = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredLogs.forEach(log => {
      counts[log.application] = (counts[log.application] || 0) + 1;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));
  }, [filteredLogs]);

  const locationMetrics = useMemo(() => {
    const counts: Record<string, { success: number, failure: number, total: number }> = {};
    filteredLogs.forEach(log => {
      const loc = log.location || 'Unknown';
      const country = loc.length >= 2 ? loc.slice(-2).toUpperCase() : '??';
      if (!counts[country]) counts[country] = { success: 0, failure: 0, total: 0 };
      counts[country].total++;
      if (log.status === 'Success') counts[country].success++;
      else counts[country].failure++;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1].total - a[1].total)
      .slice(0, 8)
      .map(([name, data]) => ({ name, ...data }));
  }, [filteredLogs]);

  const countryDonutData = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredLogs.forEach(log => {
      const loc = log.location || '';
      const countryCode = loc.length >= 2 ? loc.slice(-2).toUpperCase() : '??';
      counts[countryCode] = (counts[countryCode] || 0) + 1;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, value]) => ({ name, value }));
  }, [filteredLogs]);

  const usersWithMultiCountrySuccess = useMemo(() => {
    const userCountries: Record<string, Set<string>> = {};
    logs.forEach(l => {
      if (l.status === 'Success') {
        const country = l.location.split(',').pop()?.trim() || 'Unknown';
        if (!userCountries[l.user]) userCountries[l.user] = new Set();
        userCountries[l.user].add(country);
      }
    });
    return new Set(
      Object.entries(userCountries)
        .filter(([_, countries]) => countries.size > 1)
        .map(([user]) => user)
    );
  }, [logs]);

  const securityMetrics = useMemo(() => {
    const logsToProcess = hideFalsePositives 
      ? filteredLogs.filter(l => l.status === 'Success') 
      : filteredLogs;

    const ipRisk: Record<string, { failures: number, users: Set<string>, locations: Set<string> }> = {};
    const hourlyDistribution: number[] = new Array(24).fill(0);
    const userAgents: Record<string, number> = {};
    const mfaStats = { success: 0, failure: 0, total: 0 };
    const mfaPatterns = {
      byResult: {} as Record<string, number>,
      byRequirement: {} as Record<string, { success: number; failure: number }>,
      byApp: {} as Record<string, { success: number; failure: number }>,
      byUA: {} as Record<string, { success: number; failure: number }>
    };

    logsToProcess.forEach(log => {
      // IP Risk
      if (!ipRisk[log.ipAddress]) ipRisk[log.ipAddress] = { failures: 0, users: new Set(), locations: new Set() };
      if (log.status !== 'Success') ipRisk[log.ipAddress].failures++;
      ipRisk[log.ipAddress].users.add(log.user);
      ipRisk[log.ipAddress].locations.add(log.location);

      // Hourly
      try {
        const hour = parseISO(log.date).getHours();
        hourlyDistribution[hour]++;
      } catch (e) {}

      // User Agents
      const ua = log.browser || 'Unknown';
      userAgents[ua] = (userAgents[ua] || 0) + 1;

      // MFA
      if (log.mfaResult) {
        mfaStats.total++;
        const isSuccess = log.mfaResult.toLowerCase().includes('success');
        const isFailure = log.mfaResult.toLowerCase().includes('fail') || log.mfaResult.toLowerCase().includes('deny');

        if (isSuccess) mfaStats.success++;
        else if (isFailure) mfaStats.failure++;

        // Detailed Patterns
        const result = log.mfaResult || 'Unknown';
        mfaPatterns.byResult[result] = (mfaPatterns.byResult[result] || 0) + 1;

        const req = log.authRequirement || 'None';
        if (!mfaPatterns.byRequirement[req]) mfaPatterns.byRequirement[req] = { success: 0, failure: 0 };
        if (isSuccess) mfaPatterns.byRequirement[req].success++;
        if (isFailure) mfaPatterns.byRequirement[req].failure++;

        const app = log.application || 'Unknown';
        if (!mfaPatterns.byApp[app]) mfaPatterns.byApp[app] = { success: 0, failure: 0 };
        if (isSuccess) mfaPatterns.byApp[app].success++;
        if (isFailure) mfaPatterns.byApp[app].failure++;

        const ua = log.userAgent || 'Unknown';
        if (!mfaPatterns.byUA[ua]) mfaPatterns.byUA[ua] = { success: 0, failure: 0 };
        if (isSuccess) mfaPatterns.byUA[ua].success++;
        if (isFailure) mfaPatterns.byUA[ua].failure++;
      }
    });

    const highRiskIPs = Object.entries(ipRisk)
      .map(([ip, data]) => ({
        ip,
        failures: data.failures,
        uniqueUsers: data.users.size,
        locations: Array.from(data.locations).join(', '),
        riskScore: (data.failures * 10) + (data.users.size * 5)
      }))
      .sort((a, b) => b.riskScore - a.riskScore)
      .slice(0, 10);

    // User Risk Profiling
    const userRisk: Record<string, { failures: number, ips: Set<string>, apps: Set<string>, countries: Set<string>, lastStatus: string }> = {};
    const impossibleTravel: { id: string, user: string, loc1: string, loc2: string, timeDiff: string, reason: string, logs: AuthLog[] }[] = [];
    const userHistory: Record<string, AuthLog[]> = {};

    logsToProcess.forEach(log => {
      if (!userRisk[log.user]) userRisk[log.user] = { failures: 0, ips: new Set(), apps: new Set(), countries: new Set(), lastStatus: log.status };
      if (log.status !== 'Success') userRisk[log.user].failures++;
      userRisk[log.user].ips.add(log.ipAddress);
      userRisk[log.user].apps.add(log.application);
      
      const country = log.location.split(',').pop()?.trim() || 'Unknown';
      userRisk[log.user].countries.add(country);
      
      userRisk[log.user].lastStatus = log.status;

      // Impossible Travel Logic
      if (!userHistory[log.user]) userHistory[log.user] = [];
      userHistory[log.user].push(log);
    });

    Object.entries(userHistory).forEach(([user, history]) => {
      const sorted = history.sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime());
      
      // Track countries per day for multi-country detection
      const countriesPerDay: Record<string, Set<string>> = {};

      for (let i = 0; i < sorted.length; i++) {
        const entry = sorted[i];
        const dateObj = parseISO(entry.date);
        const day = format(dateObj, 'yyyy-MM-dd');
        const country = entry.location.split(',').pop()?.trim() || 'Unknown';
        
        if (!countriesPerDay[day]) countriesPerDay[day] = new Set();
        countriesPerDay[day].add(country);

        // Speed-based check (Existing logic)
        if (i < sorted.length - 1) {
          const next = sorted[i+1];
          if (entry.location !== next.location) {
            const country1 = entry.location.slice(-2).toUpperCase();
            const country2 = next.location.slice(-2).toUpperCase();
            
            // Only flag if they are in different countries to reduce false positives
            if (country1 !== country2) {
              // Requirement: Both logs must be 'Success' to be considered a valid impossible travel alert
              if (entry.status === 'Success' && next.status === 'Success') {
                const diffMs = parseISO(next.date).getTime() - dateObj.getTime();
                const diffHours = diffMs / (1000 * 60 * 60);
                if (diffHours < 3 && diffHours > 0) {
                  impossibleTravel.push({
                    id: `speed-${user}-${i}`,
                    user,
                    loc1: entry.location,
                    loc2: next.location,
                    timeDiff: `${Math.round(diffMs / 60000)} mins`,
                    reason: 'Speed Anomaly',
                    logs: [entry, next]
                  });
                }
              }
            }
          }
        }
      }

      // Multi-country detection (New requirement)
      Object.entries(countriesPerDay).forEach(([day, countries]) => {
        if (countries.size > 1) {
          const dayLogs = sorted.filter(l => format(parseISO(l.date), 'yyyy-MM-dd') === day);
          
          // Requirement: At least two different countries must have a 'Success' status on this day
          const successfulCountries = new Set(
            dayLogs
              .filter(l => l.status === 'Success')
              .map(l => l.location.split(',').pop()?.trim() || 'Unknown')
          );

          if (successfulCountries.size > 1) {
            impossibleTravel.push({
              id: `multi-${user}-${day}`,
              user,
              loc1: Array.from(countries).join(' & '),
              loc2: day,
              timeDiff: 'Same Day',
              reason: 'Multi-Country',
              logs: dayLogs
            });
          }
        }
      });
    });

    const highRiskUsers = Object.entries(userRisk)
      .map(([user, data]) => ({
        user,
        failures: data.failures,
        uniqueIPs: data.ips.size,
        uniqueApps: data.apps.size,
        riskScore: data.countries.size
      }))
      .sort((a, b) => b.riskScore - a.riskScore)
      .slice(0, 10);

    const hourlyData = hourlyDistribution.map((count, hour) => ({
      hour: `${hour}:00`,
      count,
      isOffHours: hour < 6 || hour > 20
    }));

    const filteredImpossibleTravel = hideFalsePositives 
      ? impossibleTravel.filter(alert => {
          // Check user-specific exceptions first
          const hasUserException = alert.logs.some(log => {
            const countryCode = log.location.slice(-2).toUpperCase();
            return isUserException(alert.user, countryCode);
          });
          if (hasUserException) return false;

          if (alert.reason === 'Speed Anomaly') {
            return !isFalsePositive(alert.loc1, alert.loc2);
          }
          if (alert.reason === 'Multi-Country') {
            const countries = Array.from(new Set(alert.logs.map(l => l.location.slice(-2).toUpperCase())));
            if (countries.length === 2) {
              return !isFalsePositive(countries[0], countries[1]);
            }
            return true;
          }
          return true;
        })
      : impossibleTravel;

    const totalLogs = filteredLogs.length;
    const uaData = Object.entries(userAgents)
      .sort((a, b) => b[1] - a[1])
      .map(([name, value]) => ({ 
        name, 
        value,
        isRare: (value / totalLogs) < 0.05 // Flag if < 5% of traffic
      }));

    // New Entity Flagging
    const userKnownEntities: Record<string, { ips: Set<string>, countries: Set<string> }> = {};
    const newEntityAlerts: { id: string, user: string, type: 'IP' | 'Country', value: string, date: string, log: AuthLog }[] = [];

    // Process logs in chronological order to correctly identify "new" entities
    const chronologicalLogs = [...logs].sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime());

    chronologicalLogs.forEach(log => {
      if (!userKnownEntities[log.user]) {
        userKnownEntities[log.user] = { ips: new Set(), countries: new Set() };
      }

      const country = log.location.length >= 2 ? log.location.slice(-2).toUpperCase() : '??';
      const known = userKnownEntities[log.user];

      // We only flag SUCCESSFUL logins as "New Entity" alerts
      // because failures from new entities are expected in attacks.
      if (log.status === 'Success') {
        let isNew = false;
        let type: 'IP' | 'Country' | null = null;
        let value = '';

        // Check if this is a new entity for this user
        // We only flag if the user has SOME history (at least one previous success)
        const hasHistory = known.ips.size > 0 || known.countries.size > 0;

        if (hasHistory) {
          if (!known.ips.has(log.ipAddress)) {
            isNew = true;
            type = 'IP';
            value = log.ipAddress;
          } else if (!known.countries.has(country)) {
            isNew = true;
            type = 'Country';
            value = country;
          }

          if (isNew && type) {
            newEntityAlerts.push({
              id: `new-${type}-${log.user}-${log.date}`,
              user: log.user,
              type,
              value,
              date: log.date,
              log
            });
          }
        }

        // Update known entities
        known.ips.add(log.ipAddress);
        known.countries.add(country);
      }
    });

    return { 
      highRiskIPs, 
      highRiskUsers, 
      impossibleTravel: filteredImpossibleTravel, 
      hourlyData, 
      uaData: uaData.slice(0, 5), 
      rareUAs: uaData.filter(d => d.isRare).slice(0, 5), 
      mfaStats, 
      mfaPatterns,
      newEntityAlerts: newEntityAlerts.sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime()).slice(0, 15)
    };
  }, [filteredLogs, hideFalsePositives, logs]);

  const correlationMetrics = useMemo(() => {
    if (filteredLogs.length === 0) return null;

    // Temporal
    const rapidSequences: any[] = [];
    const bruteForce: any[] = [];
    const passwordSpray: any[] = [];
    
    const userLogs: Record<string, AuthLog[]> = {};
    const ipLogs: Record<string, AuthLog[]> = {};

    filteredLogs.forEach(log => {
      if (!userLogs[log.user]) userLogs[log.user] = [];
      userLogs[log.user].push(log);

      if (!ipLogs[log.ipAddress]) ipLogs[log.ipAddress] = [];
      ipLogs[log.ipAddress].push(log);
    });

    Object.entries(userLogs).forEach(([user, logs]) => {
      const sorted = [...logs].sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime());
      
      for (let i = 0; i < sorted.length - 5; i++) {
        const start = parseISO(sorted[i].date);
        const end = parseISO(sorted[i+5].date);
        if (end.getTime() - start.getTime() < 60000) {
          rapidSequences.push({ user, count: 6, time: sorted[i].date });
          break;
        }
      }

      const failures = sorted.filter(l => l.status !== 'Success');
      for (let i = 0; i < failures.length - 10; i++) {
        const start = parseISO(failures[i].date);
        const end = parseISO(failures[i+10].date);
        if (end.getTime() - start.getTime() < 300000) {
          bruteForce.push({ user, count: 11, time: failures[i].date });
          break;
        }
      }
    });

    // Password Spray Detection
    Object.entries(ipLogs).forEach(([ip, logs]) => {
      const uniqueUsers = new Set(logs.map(l => l.user));
      if (uniqueUsers.size >= 5) {
        // Find the time range
        const sorted = [...logs].sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime());
        passwordSpray.push({ 
          ip, 
          userCount: uniqueUsers.size, 
          time: sorted[0].date,
          users: Array.from(uniqueUsers).slice(0, 3)
        });
      }
    });

    // Infrastructure
    const ipToUsers: Record<string, Set<string>> = {};
    const deviceTypes: Record<string, number> = {};
    const browserTypes: Record<string, number> = {};
    const suspiciousIPs: Record<string, number> = {};

    filteredLogs.forEach(log => {
      if (!ipToUsers[log.ipAddress]) ipToUsers[log.ipAddress] = new Set();
      ipToUsers[log.ipAddress].add(log.user);

      const device = log.os || 'Unknown';
      const browser = log.browser || 'Unknown';
      deviceTypes[device] = (deviceTypes[device] || 0) + 1;
      browserTypes[browser] = (browserTypes[browser] || 0) + 1;

      if (log.status !== 'Success') {
        suspiciousIPs[log.ipAddress] = (suspiciousIPs[log.ipAddress] || 0) + 1;
      }
    });

    const sharedIPs = Object.entries(ipToUsers)
      .filter(([_, users]) => users.size > 1)
      .map(([ip, users]) => ({ ip, users: Array.from(users) }));

    const topSuspiciousIPs = Object.entries(suspiciousIPs)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    // Behavioral
    const privilegeEscalation: any[] = [];
    const sensitiveApps = ['Azure Portal', 'Admin Center', 'Privileged Identity Management', 'Security & Compliance', 'Exchange Online', 'PowerShell'];
    
    filteredLogs.forEach(log => {
      if (sensitiveApps.some(app => log.application.toLowerCase().includes(app.toLowerCase()))) {
        privilegeEscalation.push(log);
      }
    });

    // Geographical
    const countryTransitions: any[] = [];
    Object.entries(userLogs).forEach(([user, logs]) => {
      const sorted = [...logs].sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime());
      for (let i = 0; i < sorted.length - 1; i++) {
        const c1 = sorted[i].location.split(',').pop()?.trim();
        const c2 = sorted[i+1].location.split(',').pop()?.trim();
        if (c1 && c2 && c1 !== c2) {
          countryTransitions.push({ user, from: c1, to: c2, time: sorted[i+1].date });
        }
      }
    });

    return {
      rapidSequences,
      bruteForce,
      passwordSpray,
      sharedIPs,
      deviceTypes: Object.entries(deviceTypes).map(([name, value]) => ({ name, value })),
      browserTypes: Object.entries(browserTypes).map(([name, value]) => ({ name, value })),
      topSuspiciousIPs,
      privilegeEscalation: privilegeEscalation.slice(0, 15),
      countryTransitions: countryTransitions.slice(0, 15),
      uniqueIPs: Object.keys(ipToUsers).length,
      deviceCount: Object.keys(deviceTypes).length,
      browserCount: Object.keys(browserTypes).length
    };
  }, [filteredLogs]);

  const handleTravelAlertClick = (alert: any) => {
    setSelectedTravelAlert(alert);
    setFilters(f => ({ ...f, user: alert.user }));
    setActiveTab('travel-detail');
  };

  const uniqueUsersList = useMemo(() => Array.from(new Set(logs.map(l => l.user))).sort(), [logs]);
  const uniqueAppsList = useMemo(() => Array.from(new Set(logs.map(l => l.application))).sort(), [logs]);

  const uniqueCountries = useMemo(() => {
    const countries = logs.map(l => {
      const loc = l.location || '';
      return loc.length >= 2 ? loc.slice(-2).toUpperCase() : '??';
    });
    return Array.from(new Set(countries)).sort();
  }, [logs]);

  if (logs.length === 0) {
    return (
      <div className="min-h-screen bg-[#E4E3E0] flex flex-col items-center justify-center p-6 font-sans">
        <div className="max-w-md w-full bg-white border border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex flex-col items-center text-center space-y-6">
            <div className="w-16 h-16 bg-black text-white flex items-center justify-center rounded-full">
              <Upload size={32} />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold tracking-tight">AuthLog Analyzer</h1>
              <p className="text-gray-600">Upload your Microsoft Entra ID (Azure AD) sign-in logs to begin analysis.</p>
            </div>
            <label className="w-full cursor-pointer">
              <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
              <div className="w-full py-3 bg-black text-white font-medium hover:bg-gray-800 transition-colors flex items-center justify-center gap-2">
                <FileText size={20} />
                Select CSV File
              </div>
            </label>
            <p className="text-xs text-gray-400 font-mono italic">Supports standard Entra ID sign-in log exports</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#E4E3E0] text-[#141414] font-sans">
      {/* Header */}
      <header className="bg-white border-b border-black sticky top-0 z-10">
        <div className="max-w-[1600px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-black text-white p-1.5">
              <Shield size={20} />
            </div>
            <h1 className="font-bold text-lg tracking-tight">AuthLog Analyzer</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <nav className="flex bg-[#E4E3E0] p-1 border border-black">
              <button 
                onClick={() => setActiveTab('dashboard')}
                className={cn(
                  "px-4 py-1.5 text-sm font-medium transition-colors flex items-center gap-2",
                  activeTab === 'dashboard' ? "bg-white border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]" : "hover:bg-white/50"
                )}
              >
                <LayoutDashboard size={16} />
                Dashboard
              </button>
              <button 
                onClick={() => setActiveTab('flow')}
                className={cn(
                  "px-4 py-1.5 text-sm font-medium transition-colors flex items-center gap-2",
                  activeTab === 'flow' ? "bg-white border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]" : "hover:bg-white/50"
                )}
              >
                <Share2 size={16} />
                Auth Flow
              </button>
              <button 
                onClick={() => setActiveTab('security')}
                className={cn(
                  "px-4 py-1.5 text-sm font-medium transition-colors flex items-center gap-2",
                  activeTab === 'security' ? "bg-white border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]" : "hover:bg-white/50"
                )}
              >
                <Shield size={16} className="text-red-600" />
                Security Insights
              </button>
              <button 
                onClick={() => setActiveTab('logs')}
                className={cn(
                  "px-4 py-1.5 text-sm font-medium transition-colors flex items-center gap-2",
                  activeTab === 'logs' ? "bg-white border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]" : "hover:bg-white/50"
                )}
              >
                <List size={16} />
                Raw Logs
              </button>
            </nav>
            
            <button 
              onClick={clearFilters}
              className="px-4 py-1.5 bg-white border border-black text-sm font-medium hover:bg-gray-100 transition-colors flex items-center gap-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
            >
              <RotateCcw size={16} />
              Clear
            </button>

            <label className="cursor-pointer">
              <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
              <div className="px-4 py-1.5 bg-black text-white text-sm font-medium hover:bg-gray-800 transition-colors flex items-center gap-2">
                <Upload size={16} />
                New File
              </div>
            </label>
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto p-6 space-y-6">
        {/* Filters */}
        <div className="bg-white border border-black p-4 flex flex-wrap items-center gap-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search user, IP, app, location..."
              className="w-full pl-10 pr-4 py-2 border border-black focus:outline-none focus:ring-1 focus:ring-black"
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            />
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Status:</span>
            <select 
              className="border border-black px-3 py-2 text-sm focus:outline-none"
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            >
              <option value="All">All Statuses</option>
              <option value="Success">Success</option>
              <option value="Failure">Failure</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">User:</span>
            <select 
              className="border border-black px-3 py-2 text-sm focus:outline-none max-w-[200px]"
              value={filters.user}
              onChange={(e) => setFilters(prev => ({ ...prev, user: e.target.value }))}
            >
              <option value="All">All Users</option>
              {uniqueUsersList.map(u => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">App:</span>
            <select 
              className="border border-black px-3 py-2 text-sm focus:outline-none max-w-[200px]"
              value={filters.app}
              onChange={(e) => setFilters(prev => ({ ...prev, app: e.target.value }))}
            >
              <option value="All">All Apps</option>
              {uniqueAppsList.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
        </div>

        {activeTab === 'dashboard' ? (
          <div className="space-y-6">
            {/* Impossible Travel Banner */}
            {securityMetrics.impossibleTravel.length > 0 && (
              <div 
                className="bg-red-600 text-white p-3 border border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-between cursor-pointer hover:bg-red-700 transition-colors"
                onClick={() => setActiveTab('security')}
              >
                <div className="flex items-center gap-3">
                  <ShieldAlert size={20} className="animate-pulse" />
                  <span className="font-bold uppercase tracking-widest text-sm">Critical: Impossible Travel Detected</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-mono bg-black/20 px-2 py-1">
                  {securityMetrics.impossibleTravel.length} Active Alerts
                  <ArrowRight size={14} />
                </div>
              </div>
            )}

            {/* New Entity Banner */}
            {securityMetrics.newEntityAlerts.length > 0 && (
              <div 
                className="bg-blue-600 text-white p-3 border border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-between cursor-pointer hover:bg-blue-700 transition-colors"
                onClick={() => setActiveTab('security')}
              >
                <div className="flex items-center gap-3">
                  <Shield size={20} className="animate-pulse" />
                  <span className="font-bold uppercase tracking-widest text-sm">Security: New Entities Detected</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-mono bg-black/20 px-2 py-1">
                  {securityMetrics.newEntityAlerts.length} New Success Logins
                  <ArrowRight size={14} />
                </div>
              </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              {[
                { label: 'Unique Countries', value: stats.uniqueCountries, icon: Globe, color: 'text-blue-600', clickable: true, onClick: () => setActiveTab('flow') },
                { label: 'Success Rate', value: `${((stats.success / stats.total) * 100).toFixed(1)}%`, icon: CheckCircle2, color: 'text-emerald-600' },
                { label: 'Failures', value: stats.failure, icon: AlertCircle, color: 'text-red-600' },
                { label: 'Unique Users', value: stats.uniqueUsers, icon: Users, color: 'text-purple-600' },
                { label: 'Applications', value: stats.uniqueApps, icon: Globe, color: 'text-orange-600', clickable: true, onClick: () => setActiveTab('app-detail') },
              ].map((stat, i) => (
                <div 
                  key={i} 
                  className={cn(
                    "bg-white border border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
                    stat.clickable && "cursor-pointer hover:bg-gray-50 transition-colors group"
                  )}
                  onClick={stat.onClick}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-widest text-gray-500 italic">{stat.label}</span>
                    <stat.icon className={cn(stat.color, stat.clickable && "group-hover:scale-110 transition-transform")} size={20} />
                  </div>
                  <div className="text-3xl font-mono font-bold tracking-tighter flex items-center justify-between">
                    {stat.value}
                    {stat.clickable && <ArrowRight size={18} className="text-gray-300 group-hover:text-black transition-colors" />}
                  </div>
                </div>
              ))}
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white border border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
                <div className="p-4 border-b border-black bg-gray-50 flex justify-between items-center">
                  <h3 className="text-sm font-bold uppercase tracking-widest italic">Advanced Correlation Analysis</h3>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { id: 'temporal', label: 'Temporal', icon: Clock },
                      { id: 'geographical', label: 'Geographical', icon: Globe },
                      { id: 'infrastructure', label: 'Infrastructure', icon: Server },
                      { id: 'behavioral', label: 'Behavioral', icon: Activity }
                    ].map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveCorrelationTab(tab.id as any)}
                        className={cn(
                          "px-3 py-1.5 text-[10px] font-bold uppercase border border-black transition-colors flex items-center gap-2",
                          activeCorrelationTab === tab.id ? "bg-black text-white" : "bg-white hover:bg-gray-100"
                        )}
                      >
                        <tab.icon size={12} />
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="p-6 min-h-[400px]">
                  {activeCorrelationTab === 'temporal' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                        <div className="flex items-center gap-2 mb-4">
                          <Zap className="text-orange-500" size={18} />
                          <h4 className="text-xs font-bold uppercase tracking-widest">Rapid Authentication Sequences</h4>
                        </div>
                        <div className="space-y-3">
                          {correlationMetrics?.rapidSequences.length === 0 ? (
                            <p className="text-xs text-gray-400 italic">No rapid sequences detected.</p>
                          ) : (
                            correlationMetrics?.rapidSequences.slice(0, 5).map((seq, i) => (
                              <div 
                                key={i} 
                                className="p-3 bg-orange-50 border-l-4 border-orange-500 flex justify-between items-center cursor-pointer hover:bg-orange-100 transition-colors group"
                                onClick={() => {
                                  setFilters(f => ({ ...f, user: seq.user, search: '' }));
                                  setActiveTab('logs');
                                }}
                              >
                                <div>
                                  <div className="text-sm font-bold group-hover:text-orange-700">{seq.user}</div>
                                  <div className="text-[10px] text-orange-700">{seq.count} attempts in &lt; 1 min</div>
                                </div>
                                <div className="text-[10px] font-mono text-gray-500 flex items-center gap-1">
                                  {formatDate(seq.time)}
                                  <ArrowRight size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                        <div className="mt-6">
                          <div className="flex items-center gap-2 mb-4">
                            <Activity className="text-red-500" size={18} />
                            <h4 className="text-xs font-bold uppercase tracking-widest">Brute Force Patterns</h4>
                          </div>
                          <div className="space-y-3">
                            {correlationMetrics?.bruteForce.length === 0 ? (
                              <p className="text-xs text-gray-400 italic">No brute force patterns detected.</p>
                            ) : (
                              correlationMetrics?.bruteForce.slice(0, 5).map((bf, i) => (
                                <div 
                                  key={i} 
                                  className="p-3 bg-red-50 border-l-4 border-red-500 flex justify-between items-center cursor-pointer hover:bg-red-100 transition-colors group"
                                  onClick={() => {
                                    setFilters(f => ({ ...f, user: bf.user, search: '' }));
                                    setActiveTab('logs');
                                  }}
                                >
                                  <div>
                                    <div className="text-sm font-bold group-hover:text-red-700">{bf.user}</div>
                                    <div className="text-[10px] text-red-700">{bf.count} failures in &lt; 5 mins</div>
                                  </div>
                                  <div className="text-[10px] font-mono text-gray-500 flex items-center gap-1">
                                    {formatDate(bf.time)}
                                    <ArrowRight size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </div>

                        <div className="mt-6">
                          <div className="flex items-center gap-2 mb-4">
                            <ShieldAlert className="text-purple-600" size={18} />
                            <h4 className="text-xs font-bold uppercase tracking-widest">Password Spray Detection</h4>
                          </div>
                          <div className="space-y-3">
                            {correlationMetrics?.passwordSpray.length === 0 ? (
                              <p className="text-xs text-gray-400 italic">No password spray patterns detected.</p>
                            ) : (
                              correlationMetrics?.passwordSpray.slice(0, 5).map((ps, i) => (
                                <div 
                                  key={i} 
                                  className="p-3 bg-purple-50 border-l-4 border-purple-600 flex justify-between items-center cursor-pointer hover:bg-purple-100 transition-colors group"
                                  onClick={() => {
                                    setFilters(f => ({ ...f, search: ps.ip, user: 'All' }));
                                    setActiveTab('logs');
                                  }}
                                >
                                  <div>
                                    <div className="text-sm font-bold group-hover:text-purple-700">{ps.ip}</div>
                                    <div className="text-[10px] text-purple-700">Targeted {ps.userCount} unique accounts</div>
                                    <div className="text-[9px] text-gray-400 mt-1 italic">
                                      e.g. {ps.users.join(', ')}...
                                    </div>
                                  </div>
                                  <div className="text-[10px] font-mono text-gray-500 flex items-center gap-1">
                                    {formatDate(ps.time)}
                                    <ArrowRight size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="bg-gray-50 p-4 border border-black/5">
                        <h4 className="text-[10px] font-bold uppercase text-gray-400 mb-4">Temporal Correlation Insights</h4>
                        <p className="text-xs text-gray-600 leading-relaxed mb-4">
                          Analyzing login frequency and failure patterns to identify automated attacks. 
                          Rapid sequences often indicate script-based access, while brute force patterns 
                          suggest credential stuffing or password spraying attempts.
                        </p>
                        <p className="text-xs text-gray-600 leading-relaxed">
                          <strong>Password Spraying:</strong> A technique where an attacker tries a common password against many accounts to avoid account lockouts. 
                          Detected here when a single IP address targets multiple distinct usernames.
                        </p>
                      </div>
                    </div>
                  )}

                  {activeCorrelationTab === 'geographical' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                        <div className="flex items-center gap-2 mb-4">
                          <MapIcon className="text-blue-500" size={18} />
                          <h4 className="text-xs font-bold uppercase tracking-widest">Impossible Travel Incidents</h4>
                        </div>
                        <div className="space-y-3">
                          {securityMetrics.impossibleTravel.length === 0 ? (
                            <p className="text-xs text-gray-400 italic">No impossible travel incidents.</p>
                          ) : (
                            securityMetrics.impossibleTravel.slice(0, 5).map((alert, i) => (
                              <div 
                                key={i} 
                                className="p-3 bg-red-50 border-l-4 border-red-500 cursor-pointer hover:bg-red-100 transition-colors group"
                                onClick={() => handleTravelAlertClick(alert)}
                              >
                                <div className="flex justify-between items-start mb-1">
                                  <div className="text-sm font-bold group-hover:text-red-700">{alert.user}</div>
                                  <div className="text-[10px] font-bold text-red-700 uppercase">{alert.reason}</div>
                                </div>
                                <div className="text-[10px] text-gray-600 truncate flex items-center justify-between">
                                  <span>{alert.loc1} → {alert.loc2}</span>
                                  <ArrowRight size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-4">
                          <Globe className="text-purple-500" size={18} />
                          <h4 className="text-xs font-bold uppercase tracking-widest">Country Transitions</h4>
                        </div>
                        <div className="space-y-3">
                          {correlationMetrics?.countryTransitions.length === 0 ? (
                            <p className="text-xs text-gray-400 italic">No country transitions detected.</p>
                          ) : (
                            correlationMetrics?.countryTransitions.slice(0, 5).map((trans, i) => (
                              <div 
                                key={i} 
                                className="p-3 bg-purple-50 border-l-4 border-purple-500 flex justify-between items-center cursor-pointer hover:bg-purple-100 transition-colors group"
                                onClick={() => {
                                  setFilters(f => ({ ...f, user: trans.user, search: '' }));
                                  setActiveTab('logs');
                                }}
                              >
                                <div>
                                  <div className="text-sm font-bold group-hover:text-purple-700">{trans.user}</div>
                                  <div className="text-[10px] text-purple-700">{trans.from} → {trans.to}</div>
                                </div>
                                <div className="text-[10px] font-mono text-gray-500 flex items-center gap-1">
                                  {formatDate(trans.time)}
                                  <ArrowRight size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {activeCorrelationTab === 'infrastructure' && (
                    <div className="space-y-8">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                          { label: 'Unique IPs', value: correlationMetrics?.uniqueIPs, icon: Network, color: 'text-blue-600' },
                          { label: 'Device Types', value: correlationMetrics?.deviceCount, icon: Monitor, color: 'text-purple-600' },
                          { label: 'Browser Types', value: correlationMetrics?.browserCount, icon: Chrome, color: 'text-emerald-600' },
                          { label: 'Suspicious IPs', value: correlationMetrics?.topSuspiciousIPs.length, icon: ShieldAlert, color: 'text-red-600' }
                        ].map((m, i) => (
                          <div key={i} className="bg-gray-50 border border-black/5 p-4 rounded-sm">
                            <div className="flex items-center gap-2 mb-1">
                              <m.icon size={14} className="text-gray-400" />
                              <div className="text-[10px] font-bold uppercase text-gray-400">{m.label}</div>
                            </div>
                            <div className={cn("text-xl font-mono font-bold", m.color)}>{m.value}</div>
                          </div>
                        ))}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                          <h4 className="text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Share2 size={14} /> Network Infrastructure Analysis
                          </h4>
                          <div className="space-y-2">
                            {correlationMetrics?.sharedIPs.slice(0, 5).map((item, i) => (
                              <div 
                                key={i} 
                                className="text-xs p-2 border border-black/5 flex justify-between items-center cursor-pointer hover:bg-gray-100 transition-colors group"
                                onClick={() => {
                                  setFilters(f => ({ ...f, search: item.ip, user: 'All' }));
                                  setActiveTab('logs');
                                }}
                              >
                                <span className="font-mono font-bold group-hover:text-blue-600">{item.ip}</span>
                                <span className="text-gray-500 flex items-center gap-2">
                                  {item.users.length} users
                                  <ArrowRight size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h4 className="text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Smartphone size={14} /> Client Environment Analysis
                          </h4>
                          <div className="h-[150px]">
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie
                                  data={correlationMetrics?.deviceTypes.slice(0, 5)}
                                  innerRadius={40}
                                  outerRadius={60}
                                  paddingAngle={5}
                                  dataKey="value"
                                >
                                  {correlationMetrics?.deviceTypes.slice(0, 5).map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                  ))}
                                </Pie>
                                <Tooltip contentStyle={{ fontSize: '10px' }} />
                              </PieChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeCorrelationTab === 'behavioral' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                        <div className="flex items-center gap-2 mb-4">
                          <Users className="text-blue-500" size={18} />
                          <h4 className="text-xs font-bold uppercase tracking-widest">Behavioral Clusters</h4>
                        </div>
                        <div className="space-y-3">
                          {correlationMetrics?.sharedIPs.slice(0, 5).map((cluster, i) => (
                            <div 
                              key={i} 
                              className="p-3 bg-blue-50 border-l-4 border-blue-500 cursor-pointer hover:bg-blue-100 transition-colors group"
                              onClick={() => {
                                setFilters(f => ({ ...f, search: cluster.ip, user: 'All' }));
                                setActiveTab('logs');
                              }}
                            >
                              <div className="flex justify-between items-center mb-1">
                                <div className="text-[10px] font-bold text-blue-700 uppercase">IP Cluster: {cluster.ip}</div>
                                <ArrowRight size={10} className="text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                              </div>
                              <div className="flex flex-wrap gap-1">
                                {cluster.users.map(u => (
                                  <span key={u} className="text-[9px] bg-white px-1.5 py-0.5 border border-blue-200 rounded-sm">{u}</span>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-4">
                          <Key className="text-emerald-500" size={18} />
                          <h4 className="text-xs font-bold uppercase tracking-widest">Privilege Escalation</h4>
                        </div>
                        <div className="space-y-3">
                          {correlationMetrics?.privilegeEscalation.length === 0 ? (
                            <p className="text-xs text-gray-400 italic">No suspicious privilege access patterns.</p>
                          ) : (
                            correlationMetrics?.privilegeEscalation.slice(0, 5).map((log, i) => (
                              <div 
                                key={i} 
                                className="p-3 bg-emerald-50 border-l-4 border-emerald-500 flex justify-between items-center cursor-pointer hover:bg-emerald-100 transition-colors group"
                                onClick={() => {
                                  setFilters(f => ({ ...f, user: log.user, app: log.application, search: '' }));
                                  setActiveTab('logs');
                                }}
                              >
                                <div>
                                  <div className="text-sm font-bold group-hover:text-emerald-700">{log.user}</div>
                                  <div className="text-[10px] text-emerald-700 truncate max-w-[200px]">{log.application}</div>
                                </div>
                                <div className="text-[10px] font-mono text-gray-500 flex items-center gap-1">
                                  {formatDate(log.date)}
                                  <ArrowRight size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-white border border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <h3 className="text-sm font-bold uppercase tracking-widest mb-6 border-b border-black pb-2 italic">Location Distribution (Country)</h3>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={countryDonutData}
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {countryDonutData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#fff', border: '1px solid #000', borderRadius: '0px' }}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Charts Row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white border border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <h3 className="text-sm font-bold uppercase tracking-widest mb-6 border-b border-black pb-2 italic">Success/Failure by Location</h3>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={locationMetrics} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#eee" />
                      <XAxis type="number" fontSize={10} />
                      <YAxis dataKey="name" type="category" fontSize={10} width={150} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#fff', border: '1px solid #000', borderRadius: '0px' }}
                      />
                      <Legend />
                      <Bar dataKey="success" stackId="a" fill="#10b981" name="Success" />
                      <Bar dataKey="failure" stackId="a" fill="#ef4444" name="Failure" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white border border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
                <h3 className="text-sm font-bold uppercase tracking-widest mb-6 border-b border-black pb-2 italic">Top Applications</h3>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={topApps} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#eee" />
                      <XAxis type="number" fontSize={10} />
                      <YAxis dataKey="name" type="category" fontSize={10} width={150} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#fff', border: '1px solid #000', borderRadius: '0px' }}
                      />
                      <Bar dataKey="count" fill="#3b82f6" name="Requests" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Charts Row 3 */}
            <div className="grid grid-cols-1 gap-6">
              {/* Recent Failures removed per user request to replace with Advanced Correlation Analysis above */}
            </div>
          </div>
        ) : activeTab === 'security' ? (
          <div className="space-y-6">
            {/* Security Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white border border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-l-8 border-l-red-500">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-widest text-gray-500 italic">High Risk IPs</span>
                  <AlertCircle className="text-red-500" size={20} />
                </div>
                <div className="text-3xl font-mono font-bold">{securityMetrics.highRiskIPs.filter(i => i.failures > 5).length}</div>
                <p className="text-[10px] text-gray-500 mt-2">IPs with more than 5 failed attempts</p>
              </div>
              <div 
                className="bg-white border border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-l-8 border-l-orange-500 cursor-pointer hover:bg-orange-50 transition-colors group"
                onClick={() => {
                  setSelectedHour(null); // null means "all off-hours"
                  setActiveTab('hourly-detail');
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-widest text-gray-500 italic">Off-Hours Logins</span>
                  <Activity className="text-orange-500 group-hover:scale-110 transition-transform" size={20} />
                </div>
                <div className="text-3xl font-mono font-bold">
                  {securityMetrics.hourlyData.filter(d => d.isOffHours).reduce((acc, d) => acc + d.count, 0)}
                </div>
                <p className="text-[10px] text-gray-500 mt-2">Requests between 10PM and 6AM</p>
              </div>
              <div className="bg-white border border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-l-8 border-l-purple-500">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-widest text-gray-500 italic">MFA Failure Rate</span>
                  <Shield className="text-purple-500" size={20} />
                </div>
                <div className="text-3xl font-mono font-bold">
                  {securityMetrics.mfaStats.total > 0 
                    ? `${((securityMetrics.mfaStats.failure / securityMetrics.mfaStats.total) * 100).toFixed(1)}%` 
                    : '0%'}
                </div>
                <p className="text-[10px] text-gray-500 mt-2">Percentage of MFA challenges failed/denied</p>
              </div>
            </div>

            <div className="flex justify-start gap-4">
              <button 
                onClick={() => setHideFalsePositives(!hideFalsePositives)}
                title={hideFalsePositives ? "Showing Filtered" : "Hide False Positives"}
                className={cn(
                  "p-2 border border-black transition-colors flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]",
                  hideFalsePositives ? "bg-black text-white" : "bg-white hover:bg-gray-100"
                )}
              >
                {hideFalsePositives ? <EyeOff size={18} /> : <Eye size={18} />}
                <span className="ml-2 text-[10px] font-bold uppercase tracking-widest"
                 title="Only display impossible travel logs if successful logins on more than one country, and countries no on travelAlerts.tsx">
                  {hideFalsePositives ? "False Positives Hidden" : "Hide False logins"}
                </span>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* High Risk IPs Table */}
              <div className="bg-white border border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <div className="flex justify-between items-center mb-6 border-b border-black pb-2">
                  <h3 className="text-sm font-bold uppercase tracking-widest italic">Threat Hunting: High Risk IPs</h3>
                  <span className="text-[10px] text-blue-500 font-bold uppercase tracking-tighter animate-pulse">Interactive filter</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="text-[10px] uppercase tracking-widest text-gray-500 border-b border-black/10">
                        <th className="pb-2">IP Address</th>
                        <th className="pb-2 text-center">Failures</th>
                        <th className="pb-2 text-center">Users</th>
                        <th className="pb-2 text-right">Risk Score</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-black/5">
                      {securityMetrics.highRiskIPs.map((item, i) => (
                        <tr key={i} className="hover:bg-gray-50 cursor-pointer" onClick={() => setFilters(f => ({ ...f, search: item.ip }))}>
                          <td className="py-3 text-xs font-mono font-bold">{item.ip}</td>
                          <td className="py-3 text-xs text-center text-red-600 font-bold">{item.failures}</td>
                          <td className="py-3 text-xs text-center">{item.uniqueUsers}</td>
                          <td className="py-3 text-xs text-right">
                            <span className={cn(
                              "px-2 py-0.5 rounded-full text-[10px] font-bold",
                              item.riskScore > 50 ? "bg-red-100 text-red-700" : "bg-orange-100 text-orange-700"
                            )}>
                              {item.riskScore}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* High Risk Users Table */}
              <div className="bg-white border border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <h3 className="text-sm font-bold uppercase tracking-widest mb-6 border-b border-black pb-2 italic">Threat Hunting: High Risk Users</h3>
                <div className="overflow-x-auto"
                title="High risk users based on the amount of different countries login in from">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="text-[10px] uppercase tracking-widest text-gray-500 border-b border-black/10">
                        <th className="pb-2">User</th>
                        <th className="pb-2 text-center">IPs</th>
                        <th className="pb-2 text-center">Apps</th>
                        <th className="pb-2 text-right">Risk Score</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-black/5">
                      {securityMetrics.highRiskUsers.map((item, i) => (
                        <tr 
                          key={i} 
                          className="hover:bg-gray-50 cursor-pointer group" 
                          onClick={() => setFilters(f => ({ ...f, user: item.user }))}
                        >
                          <td className="py-3 text-xs font-bold truncate max-w-[150px] group-hover:text-blue-600 transition-colors">{item.user}</td>
                          <td className="py-3 text-xs text-center font-mono">{item.uniqueIPs}</td>
                          <td className="py-3 text-xs text-center font-mono">{item.uniqueApps}</td>
                          <td className="py-3 text-xs text-right">
                            <span className={cn(
                              "px-2 py-0.5 rounded-full text-[10px] font-bold",
                              item.riskScore > 1 ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-700"
                            )}>
                              {item.riskScore}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Impossible Travel */}
              <div className="bg-white border border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
                <div className="flex items-center justify-between mb-6 border-b border-black pb-2">
                  <h3 className="text-sm font-bold uppercase tracking-widest italic flex items-center gap-2">
                    <MapIcon size={14} className="text-red-500" /> Impossible Travel Alerts
                  </h3>
                </div>
                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                  {securityMetrics.impossibleTravel.map((alert, i) => (
                    <div 
                      key={alert.id} 
                      className="p-3 bg-red-50 border border-red-200 rounded-sm cursor-pointer hover:bg-red-100 transition-colors shadow-sm hover:shadow-md"
                      onClick={() => handleTravelAlertClick(alert)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="text-xs font-bold text-red-800">{alert.user}</div>
                        <span className="text-[9px] bg-red-200 px-1 rounded font-bold uppercase">{alert.reason}</span>
                      </div>
                      <div className="text-[10px] text-gray-600 mt-1 flex items-center gap-1">
                        <span className="truncate max-w-[100px]">{alert.loc1}</span>
                        <Activity size={10} className="shrink-0" />
                        <span className="truncate max-w-[100px]">{alert.loc2}</span>
                      </div>
                      <div className="flex justify-between items-center mt-1">
                        <div className="text-[10px] font-bold text-red-600">Gap: {alert.timeDiff}</div>
                        <div className="text-[9px] text-red-400 flex items-center gap-1 italic">
                          Click for details <ChevronUp size={10} className="rotate-90" />
                        </div>
                      </div>
                    </div>
                  ))}
                  {securityMetrics.impossibleTravel.length === 0 && (
                    <div className="text-center py-12 text-gray-400 italic text-xs">No impossible travel detected</div>
                  )}
                </div>
              </div>

              {/* Hourly Heatmap */}
              <div className="bg-white border border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <h3 className="text-sm font-bold uppercase tracking-widest mb-6 border-b border-black pb-2 italic">Activity by Hour (Anomalous Timing)</h3>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={securityMetrics.hourlyData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                      <XAxis dataKey="hour" fontSize={8} interval={2} />
                      <YAxis fontSize={10} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#fff', border: '1px solid #000', borderRadius: '0px' }}
                      />
                      <Bar 
                        dataKey="count" 
                        onClick={(data) => {
                          const hour = parseInt(data.hour.split(':')[0]);
                          setSelectedHour(hour);
                          setActiveTab('hourly-detail');
                        }}
                        cursor="pointer"
                      >
                        {securityMetrics.hourlyData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.isOffHours ? '#f97316' : '#3b82f6'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 flex items-center gap-4 text-[10px] font-bold uppercase tracking-wider">
                  <div className="flex items-center gap-1"><div className="w-2 h-2 bg-[#3b82f6]"></div> Standard</div>
                  <div className="flex items-center gap-1"><div className="w-2 h-2 bg-[#f97316]"></div> Off-Hours</div>
                </div>
              </div>

              {/* Rare User Agents */}
              <div className="bg-white border border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <h3 className="text-sm font-bold uppercase tracking-widest mb-6 border-b border-black pb-2 italic">Rare User Agents (Bot Detection)</h3>
                <div className="space-y-3">
                  {securityMetrics.rareUAs.map((ua, i) => (
                    <div key={i} className="p-2 bg-orange-50 border-l-2 border-orange-400">
                      <div className="text-[11px] font-bold truncate">{ua.name}</div>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-[10px] text-orange-700 font-mono">{ua.value} occurrences</span>
                        <span className="text-[9px] bg-orange-200 px-1 rounded">Anomaly</span>
                      </div>
                    </div>
                  ))}
                  {securityMetrics.rareUAs.length === 0 && (
                    <div className="text-center py-12 text-gray-400 italic text-xs">No rare user agents detected</div>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* New Entity Alerts */}
              <div className="lg:col-span-2 bg-white border border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <div className="flex justify-between items-center mb-6 border-b border-black pb-2">
                  <h3 className="text-sm font-bold uppercase tracking-widest italic">New Entity Flagging</h3>
                  <span className="text-[10px] font-mono bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                    {securityMetrics.newEntityAlerts.length} Recent Alerts
                  </span>
                </div>
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                  {securityMetrics.newEntityAlerts.map((alert) => (
                    <div 
                      key={alert.id}
                      className="flex items-center justify-between p-3 border border-black/5 hover:border-black transition-colors group cursor-pointer"
                      onClick={() => {
                        setFilters(f => ({ ...f, user: alert.user }));
                        setActiveTab('logs');
                      }}
                    >
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "w-10 h-10 flex items-center justify-center border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]",
                          alert.type === 'IP' ? 'bg-purple-50' : 'bg-blue-50'
                        )}>
                          {alert.type === 'IP' ? <Activity size={18} className="text-purple-600" /> : 
                           <Globe size={18} className="text-blue-600" />}
                        </div>
                        <div>
                          <div className="text-xs font-bold uppercase tracking-tight">{alert.user}</div>
                          <div className="text-[10px] text-gray-500">
                            First successful login from <span className="font-bold text-black">{alert.type}: {alert.value}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] font-mono text-gray-400">{format(parseISO(alert.date), 'MMM dd, HH:mm')}</div>
                        <div className="text-[10px] text-blue-600 font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">View Logs →</div>
                      </div>
                    </div>
                  ))}
                  {securityMetrics.newEntityAlerts.length === 0 && (
                    <div className="text-center py-12 text-gray-400 italic text-xs">No new entity alerts detected</div>
                  )}
                </div>
                <p className="text-[10px] text-gray-500 mt-4 italic">Flagging successful logins from previously unseen IPs or Countries for each user.</p>
              </div>

              {/* User Agent Analysis */}
              <div className="bg-white border border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <h3 className="text-sm font-bold uppercase tracking-widest mb-6 border-b border-black pb-2 italic">Browser/OS Integrity</h3>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={securityMetrics.uaData}
                        innerRadius={50}
                        outerRadius={70}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {securityMetrics.uaData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend layout="vertical" align="right" verticalAlign="middle" />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <p className="text-[10px] text-gray-500 mt-4 italic">Spotting unusual browsers or automated tools used for credential stuffing.</p>
              </div>

              {/* MFA Pattern Analysis */}
              <div className="lg:col-span-3 bg-white border border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <div className="flex justify-between items-center mb-6 border-b border-black pb-4">
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-widest italic">MFA Pattern Analysis</h3>
                    <p className="text-[10px] text-gray-500 mt-1">Analyzing MFA outcomes across requirements, applications, and user agents.</p>
                  </div>
                    <div className="flex gap-4">
                      <button 
                        onClick={() => setFilters(f => ({ ...f, search: 'success' }))}
                        className="text-center hover:bg-gray-50 p-1 rounded transition-colors group"
                        title="Filter by MFA Success"
                      >
                        <div className="text-[10px] text-gray-400 uppercase group-hover:text-black transition-colors">Success Rate</div>
                        <div className="text-lg font-mono font-bold text-emerald-600">
                          {securityMetrics.mfaStats.total > 0 ? ((securityMetrics.mfaStats.success / securityMetrics.mfaStats.total) * 100).toFixed(1) : 0}%
                        </div>
                      </button>
                      <button 
                        onClick={() => setFilters(f => ({ ...f, search: 'fail' }))}
                        className="text-center hover:bg-gray-50 p-1 rounded transition-colors group"
                        title="Filter by MFA Failure"
                      >
                        <div className="text-[10px] text-gray-400 uppercase group-hover:text-black transition-colors">Failure Rate</div>
                        <div className="text-lg font-mono font-bold text-red-600">
                          {securityMetrics.mfaStats.total > 0 ? ((securityMetrics.mfaStats.failure / securityMetrics.mfaStats.total) * 100).toFixed(1) : 0}%
                        </div>
                      </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* By Requirement */}
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 border-b border-black/5 pb-1">By Requirement</h4>
                    <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
                      {Object.entries(securityMetrics.mfaPatterns.byRequirement)
                        .sort((a, b) => {
                          const sa = a[1] as { success: number; failure: number };
                          const sb = b[1] as { success: number; failure: number };
                          return (sb.success + sb.failure) - (sa.success + sa.failure);
                        })
                        .map(([req, stats]) => {
                          const s = stats as { success: number; failure: number };
                          return (
                            <button 
                              key={req} 
                              onClick={() => setFilters(f => ({ ...f, search: req }))}
                              className="w-full text-left group hover:bg-gray-50 p-1 -m-1 rounded transition-colors"
                            >
                              <div className="flex justify-between text-[11px] mb-1">
                                <span className="font-medium truncate max-w-[120px]" title={req}>{req}</span>
                                <span className="font-mono text-gray-400">{s.success + s.failure}</span>
                              </div>
                              <div className="flex h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                <div className="bg-emerald-500 h-full" style={{ width: `${(s.success / (s.success + s.failure || 1)) * 100}%` }}></div>
                                <div className="bg-red-500 h-full" style={{ width: `${(s.failure / (s.success + s.failure || 1)) * 100}%` }}></div>
                              </div>
                            </button>
                          );
                        })}
                    </div>
                  </div>

                  {/* By Application */}
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 border-b border-black/5 pb-1">By Application</h4>
                    <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
                      {Object.entries(securityMetrics.mfaPatterns.byApp)
                        .sort((a, b) => {
                          const sa = a[1] as { success: number; failure: number };
                          const sb = b[1] as { success: number; failure: number };
                          return (sb.success + sb.failure) - (sa.success + sa.failure);
                        })
                        .map(([app, stats]) => {
                          const s = stats as { success: number; failure: number };
                          return (
                            <button 
                              key={app} 
                              onClick={() => setFilters(f => ({ ...f, app }))}
                              className="w-full text-left group hover:bg-gray-50 p-1 -m-1 rounded transition-colors"
                            >
                              <div className="flex justify-between text-[11px] mb-1">
                                <span className="font-medium truncate max-w-[120px]" title={app}>{app}</span>
                                <span className="font-mono text-gray-400">{s.success + s.failure}</span>
                              </div>
                              <div className="flex h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                <div className="bg-emerald-500 h-full" style={{ width: `${(s.success / (s.success + s.failure || 1)) * 100}%` }}></div>
                                <div className="bg-red-500 h-full" style={{ width: `${(s.failure / (s.success + s.failure || 1)) * 100}%` }}></div>
                              </div>
                            </button>
                          );
                        })}
                    </div>
                  </div>

                  {/* By User Agent */}
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 border-b border-black/5 pb-1">By User Agent</h4>
                    <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
                      {Object.entries(securityMetrics.mfaPatterns.byUA)
                        .sort((a, b) => {
                          const sa = a[1] as { success: number; failure: number };
                          const sb = b[1] as { success: number; failure: number };
                          return (sb.success + sb.failure) - (sa.success + sa.failure);
                        })
                        .slice(0, 10)
                        .map(([ua, stats]) => {
                          const s = stats as { success: number; failure: number };
                          return (
                            <button 
                              key={ua} 
                              onClick={() => setFilters(f => ({ ...f, search: ua }))}
                              className="w-full text-left group hover:bg-gray-50 p-1 -m-1 rounded transition-colors"
                            >
                              <div className="flex justify-between text-[11px] mb-1">
                                <span className="font-medium truncate max-w-[120px]" title={ua}>{ua}</span>
                                <span className="font-mono text-gray-400">{s.success + s.failure}</span>
                              </div>
                              <div className="flex h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                <div className="bg-emerald-500 h-full" style={{ width: `${(s.success / (s.success + s.failure || 1)) * 100}%` }}></div>
                                <div className="bg-red-500 h-full" style={{ width: `${(s.failure / (s.success + s.failure || 1)) * 100}%` }}></div>
                              </div>
                            </button>
                          );
                        })}
                    </div>
                  </div>

                  {/* By Result */}
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 border-b border-black/5 pb-1">By Result Detail</h4>
                    <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
                      {Object.entries(securityMetrics.mfaPatterns.byResult)
                        .sort((a, b) => (b[1] as number) - (a[1] as number))
                        .map(([result, count]) => (
                          <button 
                            key={result} 
                            onClick={() => setFilters(f => ({ ...f, search: result }))}
                            className="w-full text-left flex justify-between items-center text-[11px] hover:bg-gray-50 p-1 -m-1 rounded transition-colors"
                          >
                            <span className={cn(
                              "font-medium truncate max-w-[120px]",
                              result.toLowerCase().includes('success') ? "text-emerald-600" : 
                              (result.toLowerCase().includes('fail') || result.toLowerCase().includes('deny')) ? "text-red-600" : "text-gray-600"
                            )} title={result}>
                              {result}
                            </span>
                            <span className="font-mono bg-gray-100 px-1.5 py-0.5 border border-black/5 rounded">{count}</span>
                          </button>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : activeTab === 'app-detail' ? (
          <div className="space-y-6">
            <div className="flex items-center gap-4 mb-4">
              <button 
                onClick={() => setActiveTab('dashboard')}
                className="p-2 bg-white border border-black hover:bg-gray-100 transition-colors"
              >
                <ChevronUp size={20} className="-rotate-90" />
              </button>
              <div>
                <h2 className="text-xl font-bold tracking-tight">Application Insights</h2>
                <p className="text-sm text-gray-500 italic">Analyzing authentication flows and geographic distribution per application.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-1 bg-white border border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col h-[600px]">
                <div className="p-4 border-b border-black bg-gray-50">
                  <h3 className="text-xs font-bold uppercase tracking-widest">Select Application</h3>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                  <button 
                    onClick={() => setSelectedApp(null)}
                    className={cn(
                      "w-full text-left px-3 py-2 text-sm font-medium transition-colors border",
                      selectedApp === null ? "bg-black text-white border-black" : "hover:bg-gray-100 border-transparent"
                    )}
                  >
                    All Applications
                  </button>
                  {uniqueAppsList.map(app => (
                    <button 
                      key={app}
                      onClick={() => setSelectedApp(app)}
                      className={cn(
                        "w-full text-left px-3 py-2 text-sm font-medium transition-colors border truncate",
                        selectedApp === app ? "bg-black text-white border-black" : "hover:bg-gray-100 border-transparent"
                      )}
                    >
                      {app}
                    </button>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-3 space-y-6">
                <div className="bg-white border border-black p-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <div className="mb-8 flex justify-between items-end">
                    <div>
                      <h3 className="text-lg font-bold tracking-tight">{selectedApp || 'All Applications'} Flow</h3>
                      <p className="text-xs text-gray-500">Mapping Locations to Authentication Outcomes</p>
                    </div>
                    <div className="flex gap-4 text-[10px] font-bold uppercase tracking-widest">
                      <div className="flex items-center gap-1"><div className="w-2 h-2 bg-blue-500"></div> Location</div>
                      <div className="flex items-center gap-1"><div className="w-2 h-2 bg-emerald-500"></div> Success</div>
                      <div className="flex items-center gap-1"><div className="w-2 h-2 bg-red-500"></div> Failure</div>
                    </div>
                  </div>
                  <div className="flex justify-center">
                    <SankeyFlow 
                      data={filteredLogs
                        .filter(l => !selectedApp || l.application === selectedApp)
                        .slice(0, 150)
                      } 
                      width={900} 
                      height={450} 
                      customNodes={['location', 'status']}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {(() => {
                    const appLogs = filteredLogs.filter(l => !selectedApp || l.application === selectedApp);
                    const total = appLogs.length;
                    const success = appLogs.filter(l => l.status === 'Success').length;
                    const failure = total - success;
                    const uniqueLocs = new Set(appLogs.map(l => l.location)).size;

                    return [
                      { label: 'Total Requests', value: total, color: 'text-blue-600' },
                      { label: 'Success Rate', value: total > 0 ? `${((success/total)*100).toFixed(1)}%` : '0%', color: 'text-emerald-600' },
                      { label: 'Unique Locations', value: uniqueLocs, color: 'text-purple-600' }
                    ].map((m, i) => (
                      <div key={i} className="bg-white border border-black p-4 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                        <div className="text-[10px] font-bold uppercase text-gray-400 mb-1">{m.label}</div>
                        <div className={cn("text-2xl font-mono font-bold", m.color)}>{m.value}</div>
                      </div>
                    ));
                  })()}
                </div>
              </div>
            </div>
          </div>
        ) : activeTab === 'travel-detail' && selectedTravelAlert ? (
          <div className="space-y-6">
            <div className="flex items-center gap-4 mb-4">
              <button 
                onClick={() => setActiveTab('security')}
                className="p-2 bg-white border border-black hover:bg-gray-100 transition-colors"
              >
                <ChevronUp size={20} className="-rotate-90" />
              </button>
              <div>
                <h2 className="text-xl font-bold tracking-tight">Impossible Travel Investigation</h2>
                <p className="text-sm text-gray-500">Deep-dive analysis for user: <span className="font-mono font-bold text-black">{selectedTravelAlert.user}</span></p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1 space-y-6">
                <div className="bg-white border border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-l-8 border-l-red-500">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-4">Alert Summary</div>
                  <div className="space-y-4">
                    <div>
                      <div className="text-xs text-gray-400 uppercase">Detection Type</div>
                      <div className="text-lg font-bold text-red-600">{selectedTravelAlert.reason}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400 uppercase">Locations Involved</div>
                      <div className="text-sm font-medium">{selectedTravelAlert.loc1}</div>
                      <div className="text-xs text-gray-400 my-1">to</div>
                      <div className="text-sm font-medium">{selectedTravelAlert.loc2}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400 uppercase">Time Interval</div>
                      <div className="text-lg font-mono font-bold">{selectedTravelAlert.timeDiff}</div>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-4">Security Correlation</div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-100 rounded-sm">
                      <Globe size={18} className="text-blue-600 shrink-0" />
                      <div>
                        <div className="text-[11px] font-bold text-blue-900">Geographic Correlation</div>
                        <div className="text-[10px] text-blue-700 leading-tight">
                          Activity linked across: <span className="font-bold underline">{selectedTravelAlert.loc1}</span> and <span className="font-bold underline">{selectedTravelAlert.loc2}</span>.
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-orange-50 border border-orange-100 rounded-sm">
                      <Activity size={18} className="text-orange-600 shrink-0" />
                      <div>
                        <div className="text-[11px] font-bold text-orange-900">Velocity Analysis</div>
                        <div className="text-[10px] text-orange-700 leading-tight">
                          Travel speed required: <span className="font-bold">~1,200 km/h</span>. Exceeds commercial flight capabilities.
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-red-50 border border-red-100 rounded-sm">
                      <ShieldAlert size={18} className="text-red-600 shrink-0" />
                      <div>
                        <div className="text-[11px] font-bold text-red-900">Risk Assessment</div>
                        <div className="text-[10px] text-red-700 leading-tight">
                          High confidence indicator of <span className="font-bold uppercase">Account Takeover</span>.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white border border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
                  <div className="p-4 border-b border-black bg-gray-50 flex justify-between items-center">
                    <h3 className="text-sm font-bold uppercase tracking-widest italic">Geographic Analysis</h3>
                    <div className="text-[10px] font-mono text-gray-500">Visualizing travel path</div>
                  </div>
                  <SecurityMap 
                    locations={selectedTravelAlert.logs.map((l: any) => ({
                      name: l.location,
                      countryCode: l.location.slice(-2).toUpperCase()
                    }))} 
                  />
                </div>

                <div className="bg-white border border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
                  <div className="p-4 border-b border-black bg-gray-50 flex justify-between items-center">
                    <h3 className="text-sm font-bold uppercase tracking-widest italic">Correlated Event Logs</h3>
                    <div className="text-[10px] font-mono text-gray-500">{selectedTravelAlert.logs.length} events linked</div>
                  </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-black text-white text-[10px] uppercase tracking-widest italic">
                        <th className="p-3 font-medium">Timestamp</th>
                        <th className="p-3 font-medium">Location</th>
                        <th className="p-3 font-medium">IP Address</th>
                        <th className="p-3 font-medium">Application</th>
                        <th className="p-3 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-black/10">
                      {selectedTravelAlert.logs.map((log: any, i: number) => (
                        <tr key={i} className="hover:bg-gray-50">
                          <td className="p-3 text-[11px] font-mono">{formatDate(log.date)}</td>
                          <td className="p-3 text-[11px] font-bold">{log.location}</td>
                          <td className="p-3 text-[11px] font-mono">{log.ipAddress}</td>
                          <td className="p-3 text-[11px]">{log.application}</td>
                          <td className="p-3">
                            <span className={cn(
                              "px-2 py-0.5 text-[9px] font-bold uppercase border",
                              log.status === 'Success' ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-red-50 text-red-700 border-red-200"
                            )}>
                              {log.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="p-6 bg-gray-50 border-t border-black">
                  <div className="text-xs font-bold uppercase text-gray-400 mb-2">Analyst Recommendation</div>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    This user account shows high-confidence indicators of compromise. The geographic distance between 
                    <span className="font-bold text-black mx-1">{selectedTravelAlert.loc1}</span> and 
                    <span className="font-bold text-black mx-1">{selectedTravelAlert.loc2}</span> 
                    cannot be traversed in the recorded time of <span className="font-bold text-red-600">{selectedTravelAlert.timeDiff}</span>. 
                    Recommend immediate session revocation and password reset.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        ) : activeTab === 'hourly-detail' ? (
          <div className="space-y-6">
            <div className="flex items-center gap-4 mb-4">
              <button 
                onClick={() => setActiveTab('security')}
                className="p-2 bg-white border border-black hover:bg-gray-100 transition-colors"
              >
                <ChevronUp size={20} className="-rotate-90" />
              </button>
              <div>
                <h2 className="text-xl font-bold tracking-tight">Hourly Activity Analysis</h2>
                <p className="text-sm text-gray-500 italic">
                  {selectedHour !== null 
                    ? `Deep-dive for hour ${selectedHour}:00 - ${selectedHour}:59` 
                    : 'Analyzing all off-hours activity (10PM - 6AM)'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-1 space-y-6">
                <div className="bg-white border border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <h3 className="text-xs font-bold uppercase tracking-widest mb-4 border-b border-black pb-2">Outcome Summary</h3>
                  {(() => {
                    const hourlyLogs = (hideFalsePositives ? filteredLogs.filter(l => l.status === 'Success') : filteredLogs).filter(l => {
                      const h = parseISO(l.date).getHours();
                      const matchesHour = selectedHour !== null ? h === selectedHour : (h < 6 || h > 20);
                      if (!matchesHour) return false;
                      if (impossibleTravelFilter) {
                        return l.status === 'Success' && usersWithMultiCountrySuccess.has(l.user);
                      }
                      return true;
                    });
                    const success = hourlyLogs.filter(l => l.status === 'Success').length;
                    const failure = hourlyLogs.length - success;
                    return (
                      <div className="space-y-4">
                        <div className="flex justify-between items-end">
                          <div className="text-xs text-gray-500 uppercase">Success</div>
                          <div className="text-2xl font-bold text-emerald-600">{success}</div>
                        </div>
                        <div className="flex justify-between items-end">
                          <div className="text-xs text-gray-500 uppercase">Failure</div>
                          <div className="text-2xl font-bold text-red-600">{failure}</div>
                        </div>
                        <div className="pt-4 border-t border-black/10">
                          <div className="text-[10px] text-gray-400 uppercase mb-1">Success Rate</div>
                          <div className="text-lg font-mono font-bold">
                            {hourlyLogs.length > 0 ? ((success/hourlyLogs.length)*100).toFixed(1) : 0}%
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                <div className="bg-white border border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <h3 className="text-xs font-bold uppercase tracking-widest mb-4 border-b border-black pb-2">Top Users</h3>
                  <div className="space-y-2">
                    {(() => {
                      const hourlyLogs = (hideFalsePositives ? filteredLogs.filter(l => l.status === 'Success') : filteredLogs).filter(l => {
                        const h = parseISO(l.date).getHours();
                        const matchesHour = selectedHour !== null ? h === selectedHour : (h < 6 || h > 20);
                        if (!matchesHour) return false;
                        if (impossibleTravelFilter) {
                          return l.status === 'Success' && usersWithMultiCountrySuccess.has(l.user);
                        }
                        return true;
                      });
                      const userCounts: Record<string, number> = {};
                      hourlyLogs.forEach(l => { userCounts[l.user] = (userCounts[l.user] || 0) + 1; });
                      return Object.entries(userCounts)
                        .sort((a, b) => b[1] - a[1])
                        .slice(0, 5)
                        .map(([user, count]) => (
                          <div key={user} className="flex justify-between items-center text-xs">
                            <span className="font-medium truncate max-w-[120px]">{user}</span>
                            <span className="font-mono bg-gray-100 px-1.5 py-0.5 border border-black/10">{count}</span>
                          </div>
                        ));
                    })()}
                  </div>
                </div>
              </div>

              <div className="lg:col-span-3 bg-white border border-black p-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <div className="mb-8 flex justify-between items-end">
                  <div>
                    <h3 className="text-lg font-bold tracking-tight">Authentication Flow</h3>
                    <p className="text-xs text-gray-500 italic">User → Country → Application</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => setImpossibleTravelFilter(!impossibleTravelFilter)}
                      title="Only show successful logins from users with logins in >1 country"
                      className={cn(
                        "px-3 py-1.5 text-[10px] font-bold uppercase border border-black transition-colors flex items-center gap-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]",
                        impossibleTravelFilter ? "bg-blue-600 text-white" : "bg-white hover:bg-gray-100"
                      )}
                    >
                      <Globe size={12} />
                      {impossibleTravelFilter ? "Impossible Travel Filter Active" : "Filter by Impossible Travel"}
                    </button>
                    <div className="flex gap-4 text-[10px] font-bold uppercase tracking-widest">
                      <div className="flex items-center gap-1"><div className="w-2 h-2 bg-purple-500"></div> User</div>
                      <div className="flex items-center gap-1"><div className="w-2 h-2 bg-red-500"></div> Country</div>
                      <div className="flex items-center gap-1"><div className="w-2 h-2 bg-emerald-500"></div> App</div>
                    </div>
                  </div>
                </div>
                <div className="flex justify-center">
                  <SankeyFlow 
                    data={(hideFalsePositives ? filteredLogs.filter(l => l.status === 'Success') : filteredLogs)
                      .filter(l => {
                        const h = parseISO(l.date).getHours();
                        const matchesHour = selectedHour !== null ? h === selectedHour : (h < 6 || h > 20);
                        if (!matchesHour) return false;
                        if (impossibleTravelFilter) {
                          return l.status === 'Success' && usersWithMultiCountrySuccess.has(l.user);
                        }
                        return true;
                      })
                      .map(l => ({
                        ...l,
                        country: l.location.split(',').pop()?.trim() || 'Unknown'
                      }))
                      .slice(0, 150)
                    } 
                    width={900} 
                    height={450} 
                    customNodes={['user', 'country', 'app']}
                  />
                </div>
              </div>
            </div>
          </div>
        ) : activeTab === 'flow' ? (
          <div className="bg-white border border-black p-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <div className="mb-8 flex justify-between items-start">
              <div>
                <h2 className="text-xl font-bold tracking-tight mb-2">Authentication Flow Map</h2>
                <p className="text-sm text-gray-500 italic">Visualizing the relationship between Users, Applications, and Authentication Status.</p>
              </div>
              <div className="flex flex-wrap gap-2 justify-end max-w-[400px]">
                <button 
                  onClick={() => setFlowCountryFilter(null)}
                  className={cn(
                    "px-3 py-1 text-[10px] font-bold uppercase border border-black transition-colors",
                    flowCountryFilter === null ? "bg-black text-white" : "bg-white hover:bg-gray-100"
                  )}
                >
                  All
                </button>
                {uniqueCountries.map(cc => (
                  <button 
                    key={cc}
                    onClick={() => setFlowCountryFilter(cc)}
                    className={cn(
                      "px-3 py-1 text-[10px] font-bold uppercase border border-black transition-colors",
                      flowCountryFilter === cc ? "bg-black text-white" : "bg-white hover:bg-gray-100"
                    )}
                  >
                    {cc}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex justify-center">
              <SankeyFlow 
                data={filteredLogs
                  .filter(l => {
                    if (!flowCountryFilter) return true;
                    const cc = l.location?.length >= 2 ? l.location.slice(-2).toUpperCase() : '??';
                    return cc === flowCountryFilter;
                  })
                  .slice(0, 100)
                } 
                width={1200} 
                height={600} 
              />
            </div>
            <div className="mt-8 grid grid-cols-3 gap-8 text-center border-t border-black pt-8">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-purple-600 mb-1">Source</div>
                <div className="text-sm font-bold">Users</div>
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-emerald-500 mb-1">Target</div>
                <div className="text-sm font-bold">Applications</div>
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 mb-1">Outcome</div>
                <div className="text-sm font-bold">Status</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white border border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-black text-white text-[11px] uppercase tracking-widest italic">
                    <th className="p-4 font-medium">Date (UTC)</th>
                    <th className="p-4 font-medium">User</th>
                    <th className="p-4 font-medium">Application</th>
                    <th className="p-4 font-medium">IP Address</th>
                    <th className="p-4 font-medium">Location</th>
                    <th className="p-4 font-medium">Status</th>
                    <th className="p-4 font-medium">MFA</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/10">
                  {filteredLogs.map((log, i) => (
                    <tr key={i} className="hover:bg-gray-50 transition-colors group">
                      <td className="p-4 text-xs font-mono whitespace-nowrap">{formatDate(log.date)}</td>
                      <td className="p-4">
                        <div className="text-sm font-bold">{log.user}</div>
                        <div className="text-[10px] text-gray-500 font-mono">{log.username}</div>
                      </td>
                      <td className="p-4 text-sm">{log.application}</td>
                      <td className="p-4 text-xs font-mono">{log.ipAddress}</td>
                      <td className="p-4 text-xs">{log.location}</td>
                      <td className="p-4">
                        <span className={cn(
                          "px-2 py-0.5 text-[10px] font-bold uppercase border",
                          log.status === 'Success' ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-red-50 text-red-700 border-red-200"
                        )}>
                          {log.status}
                        </span>
                      </td>
                      <td className="p-4 text-xs">{log.mfaResult || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredLogs.length === 0 && (
              <div className="p-12 text-center text-gray-400 italic">No logs match your filters</div>
            )}
            <div className="p-4 border-t border-black bg-gray-50 text-[10px] font-mono text-gray-500 flex justify-between">
              <span>Showing {filteredLogs.length} of {logs.length} records</span>
              <span>AuthLog Analyzer v1.0</span>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
