/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useMemo } from 'react';
import { parseISO, differenceInMinutes } from 'date-fns';
import { AuthLog } from '../types';
import { isLocationException } from '../config/ExceptionUser';
import { isUserException } from '../config/travelAlerts';
import { isIPException } from '../config/NetworkExceptions';

export const useAuthMetrics = (filteredLogs: AuthLog[]) => {
  const stats = useMemo(() => {
    const total = filteredLogs.length;
    const success = filteredLogs.filter(l => l.status === 'Success').length;
    const failure = total - success;
    const uniqueUsers = new Set(filteredLogs.map(l => l.user)).size;
    const uniqueApps = new Set(filteredLogs.map(l => l.application)).size;
    const uniqueCountries = new Set(filteredLogs.map(l => l.location.split(',').pop()?.trim())).size;

    return { total, success, failure, uniqueUsers, uniqueApps, uniqueCountries };
  }, [filteredLogs]);

  const usersWithMultiCountrySuccess = useMemo(() => {
    const userCountries: Record<string, Set<string>> = {};
    filteredLogs.forEach(l => {
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
  }, [filteredLogs]);

  const impossibleTravel = useMemo(() => {
    const alerts: any[] = [];
    const userLogs: Record<string, AuthLog[]> = {};
    filteredLogs.forEach(log => {
      if (!userLogs[log.user]) userLogs[log.user] = [];
      userLogs[log.user].push(log);
    });

    Object.entries(userLogs).forEach(([user, logs]) => {
      const sorted = [...logs].sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime());
      for (let i = 0; i < sorted.length - 1; i++) {
        const l1 = sorted[i];
        const l2 = sorted[i+1];
        const t1 = parseISO(l1.date);
        const t2 = parseISO(l2.date);
        const diffMinutes = differenceInMinutes(t2, t1);
        
        const c1 = l1.location.split(',').pop()?.trim() || '';
        const c2 = l2.location.split(',').pop()?.trim() || '';

        // Check user-specific country exceptions
        if (isUserException(user, c1) || isUserException(user, c2)) continue;

        // Check location-pair exceptions
        if (c1 && c2 && isLocationException(c1, c2)) continue;

        if (c1 && c2 && c1 !== c2 && diffMinutes < 240) {
          if (usersWithMultiCountrySuccess.has(user)) {
            alerts.push({
              id: `${user}-${i}`,
              user,
              loc1: l1.location,
              loc2: l2.location,
              timeDiff: `${diffMinutes} mins`,
              reason: 'Speed Anomaly',
              logs: [l1, l2]
            });
          }
        }
      }
    });
    return alerts;
  }, [filteredLogs, usersWithMultiCountrySuccess]);

  const securityMetrics = useMemo(() => {
    if (filteredLogs.length === 0) return {
      highRiskIPs: [],
      highRiskUsers: [],
      hourlyData: [],
      rareUAs: [],
      mfaStats: { total: 0, success: 0, failure: 0 },
      mfaPatterns: { byRequirement: {}, byApp: {}, byUA: {}, byResult: {} },
      impossibleTravel: [],
      newEntityAlerts: [],
      powershellSignins: []
    };

    // High Risk IPs
    const ipFailures: Record<string, { count: number, users: Set<string> }> = {};
    filteredLogs.forEach(log => {
      if (log.status !== 'Success' && !isIPException(log.ipAddress)) {
        if (!ipFailures[log.ipAddress]) ipFailures[log.ipAddress] = { count: 0, users: new Set() };
        ipFailures[log.ipAddress].count++;
        ipFailures[log.ipAddress].users.add(log.user);
      }
    });

    const highRiskIPs = Object.entries(ipFailures)
      .map(([ip, data]) => ({
        ip,
        failures: data.count,
        uniqueUsers: data.users.size,
        riskScore: Math.min(100, data.count * 10 + data.users.size * 5)
      }))
      .sort((a, b) => b.failures - a.failures)
      .slice(0, 10);

    // High Risk Users
    const userCountries: Record<string, Set<string>> = {};
    const userIPs: Record<string, Set<string>> = {};
    const userApps: Record<string, Set<string>> = {};
    
    filteredLogs.forEach(log => {
      if (!userCountries[log.user]) userCountries[log.user] = new Set();
      if (!userIPs[log.user]) userIPs[log.user] = new Set();
      if (!userApps[log.user]) userApps[log.user] = new Set();
      
      const country = log.location.split(',').pop()?.trim();
      if (country) userCountries[log.user].add(country);
      userIPs[log.user].add(log.ipAddress);
      userApps[log.user].add(log.application);
    });

    const highRiskUsers = Object.entries(userCountries)
      .map(([user, countries]) => ({
        user,
        uniqueCountries: countries.size,
        uniqueIPs: userIPs[user].size,
        uniqueApps: userApps[user].size,
        riskScore: countries.size // Simple score for now
      }))
      .sort((a, b) => b.uniqueCountries - a.uniqueCountries)
      .slice(0, 10);

    // Hourly Distribution
    const hourCounts: Record<number, number> = {};
    for (let i = 0; i < 24; i++) hourCounts[i] = 0;
    filteredLogs.forEach(log => {
      const hour = parseISO(log.date).getHours();
      hourCounts[hour]++;
    });
    const hourlyData = Object.entries(hourCounts).map(([hour, count]) => ({
      hour: `${hour}:00`,
      count,
      isOffHours: parseInt(hour) < 6 || parseInt(hour) > 20
    }));

    // MFA Stats
    const mfaLogs = filteredLogs.filter(l => l.mfaResult && l.mfaResult !== 'None');
    const mfaStats = {
      total: mfaLogs.length,
      success: mfaLogs.filter(l => l.mfaResult.toLowerCase().includes('success')).length,
      failure: mfaLogs.filter(l => l.mfaResult.toLowerCase().includes('fail') || l.mfaResult.toLowerCase().includes('deny')).length
    };

    const mfaPatterns = {
      byRequirement: {} as Record<string, any>,
      byApp: {} as Record<string, any>,
      byUA: {} as Record<string, any>,
      byResult: {} as Record<string, any>
    };

    mfaLogs.forEach(log => {
      const isSuccess = log.mfaResult.toLowerCase().includes('success');
      const req = log.authRequirement || 'Unknown';
      const app = log.application;
      const ua = log.browser;
      const res = log.mfaResult;

      [
        { key: 'byRequirement', val: req },
        { key: 'byApp', val: app },
        { key: 'byUA', val: ua }
      ].forEach(p => {
        const patterns = (mfaPatterns as any)[p.key];
        if (!patterns[p.val]) patterns[p.val] = { success: 0, failure: 0 };
        if (isSuccess) patterns[p.val].success++;
        else patterns[p.val].failure++;
      });

      mfaPatterns.byResult[res] = (mfaPatterns.byResult[res] || 0) + 1;
    });

    // Rare User Agents
    const uaCounts: Record<string, number> = {};
    filteredLogs.forEach(log => {
      const ua = log.browser || 'Unknown';
      uaCounts[ua] = (uaCounts[ua] || 0) + 1;
    });
    const rareUAs = Object.entries(uaCounts)
      .filter(([_, count]) => count < 5)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => a.value - b.value)
      .slice(0, 5);

    // New Entity Alerting
    const newEntityAlerts: any[] = [];
    const userHistory: Record<string, { ips: Set<string>, countries: Set<string> }> = {};
    
    [...filteredLogs].sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime()).forEach(log => {
      if (log.status !== 'Success') return;
      
      if (!userHistory[log.user]) {
        userHistory[log.user] = { ips: new Set([log.ipAddress]), countries: new Set([log.location.split(',').pop()?.trim() || '']) };
        return;
      }

      const country = log.location.split(',').pop()?.trim() || '';
      const isNewIP = !userHistory[log.user].ips.has(log.ipAddress);
      const isNewCountry = country && !userHistory[log.user].countries.has(country);

      if (isNewIP || isNewCountry) {
        newEntityAlerts.push({
          id: log.requestId,
          user: log.user,
          type: isNewIP ? 'IP' : 'Country',
          value: isNewIP ? log.ipAddress : country,
          date: log.date
        });
      }

      userHistory[log.user].ips.add(log.ipAddress);
      if (country) userHistory[log.user].countries.add(country);
    });

    // Azure AD PowerShell Monitoring
    const powershellSignins = filteredLogs.filter(log => 
      log.status === 'Success' && 
      log.application.toLowerCase().includes('azure active directory powershell')
    ).map(log => ({
      id: log.requestId,
      user: log.user,
      date: log.date,
      ip: log.ipAddress,
      location: log.location
    }));

    return { 
      highRiskIPs, 
      highRiskUsers, 
      hourlyData, 
      rareUAs, 
      mfaStats, 
      mfaPatterns, 
      impossibleTravel,
      powershellSignins,
      newEntityAlerts: newEntityAlerts.reverse().slice(0, 20)
    };
  }, [filteredLogs, impossibleTravel]);

  const correlationMetrics = useMemo(() => {
    if (filteredLogs.length === 0) return null;

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

    // Temporal
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

      let consecutiveFailures = 0;
      let firstFailureTime: Date | null = null;

      for (let i = 0; i < sorted.length; i++) {
        const log = sorted[i];
        if (log.status !== 'Success') {
          if (consecutiveFailures === 0) firstFailureTime = parseISO(log.date);
          consecutiveFailures++;
        } else {
          // Success login
          if (consecutiveFailures >= 5 && firstFailureTime) {
            const successTime = parseISO(log.date);
            // If the sequence happened within 10 minutes
            if (successTime.getTime() - firstFailureTime.getTime() < 600000) {
              bruteForce.push({ 
                user, 
                count: consecutiveFailures, 
                time: log.date 
              });
            }
          }
          // Reset after a success or if threshold not met
          consecutiveFailures = 0;
          firstFailureTime = null;
        }
      }
    });

    // Password Spray Detection
    Object.entries(ipLogs).forEach(([ip, logs]) => {
      if (isIPException(ip)) return;
      const uniqueUsers = new Set(logs.map(l => l.user));
      if (uniqueUsers.size >= 5) {
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
      // Skip IP exceptions
      if (isIPException(log.ipAddress)) return;

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
    const uniqueImpossibleUsers = new Set<string>();
    
    impossibleTravel.forEach(alert => {
      uniqueImpossibleUsers.add(alert.user);
    });

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
      uniqueImpossibleUsers: Array.from(uniqueImpossibleUsers),
      uniqueIPs: Object.keys(ipToUsers).length,
      deviceCount: Object.keys(deviceTypes).length,
      browserCount: Object.keys(browserTypes).length
    };
  }, [filteredLogs, impossibleTravel]);

  const locationDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredLogs.forEach(log => {
      const country = log.location.split(',').pop()?.trim() || 'Unknown';
      counts[country] = (counts[country] || 0) + 1;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, value]) => ({ name, value }));
  }, [filteredLogs]);

  const locationSuccessFailure = useMemo(() => {
    const counts: Record<string, { success: number, failure: number, total: number }> = {};
    filteredLogs.forEach(log => {
      const country = log.location.split(',').pop()?.trim() || 'Unknown';
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

  const uniqueUsersList = useMemo(() => Array.from(new Set(filteredLogs.map(l => l.user))).sort(), [filteredLogs]);
  const uniqueAppsList = useMemo(() => Array.from(new Set(filteredLogs.map(l => l.application))).sort(), [filteredLogs]);
  const uniqueCountries = useMemo(() => Array.from(new Set(filteredLogs.map(l => l.location.split(',').pop()?.trim() || 'Unknown'))).sort(), [filteredLogs]);

  return { 
    stats, 
    securityMetrics, 
    correlationMetrics, 
    locationDistribution, 
    locationSuccessFailure, 
    topApps,
    uniqueUsersList,
    uniqueAppsList,
    uniqueCountries,
    usersWithMultiCountrySuccess,
    impossibleTravel
  };
};
