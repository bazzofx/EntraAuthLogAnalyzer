/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AlertCircle, Activity, Shield } from 'lucide-react';
import { cn } from '../../utils/formatters';
import { TabType } from '../../types';

interface SecurityOverviewProps {
  securityMetrics: any;
  setActiveTab: (tab: TabType) => void;
  setSelectedHour: (hour: number | null) => void;
}

export const SecurityOverview: React.FC<SecurityOverviewProps> = ({ securityMetrics, setActiveTab, setSelectedHour }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-white border border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-l-8 border-l-red-500">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold uppercase tracking-widest text-gray-500 italic">High Risk IPs</span>
          <AlertCircle className="text-red-500" size={20} />
        </div>
        <div className="text-3xl font-mono font-bold">{securityMetrics.highRiskIPs.filter((i: any) => i.failures > 5).length}</div>
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
          {securityMetrics.hourlyData.filter((d: any) => d.isOffHours).reduce((acc: number, d: any) => acc + d.count, 0)}
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
  );
};
