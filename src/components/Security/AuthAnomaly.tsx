/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Flame, ShieldAlert, Zap, Globe, Terminal, Monitor, Key, Lock, AlertTriangle, ArrowRight } from 'lucide-react';
import { cn, formatDate } from '../../utils/formatters';
import { Filters, TabType } from '../../types';

interface AuthAnomalyProps {
  authAnomalies: any[];
  tieredStats: {
    tier1: number;
    admin: number;
    tier2: number;
    tier3: number;
  };
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
  setActiveTab: (tab: TabType) => void;
  setSelectedAnomaly: (anomaly: any) => void;
}

export const AuthAnomaly: React.FC<AuthAnomalyProps> = ({ 
  authAnomalies, 
  tieredStats,
  setFilters, 
  setActiveTab,
  setSelectedAnomaly
}) => {
  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-black text-white p-6 shadow-[8px_8px_0px_0px_rgba(220,38,38,1)] border-2 border-red-600">
        <div className="flex items-center gap-3 mb-2">
          <Flame className="text-red-500 animate-pulse" size={24} />
          <h2 className="text-2xl font-black uppercase tracking-tighter italic">Auth Anomaly Monitor</h2>
        </div>
        <p className="text-red-200 text-xs font-medium max-w-2xl italic">
          Monitoring high-risk applications, token replay targets, and suspicious administrative pivots. 
          These detections focus on the most common attack chains used in modern cloud identity compromises.
        </p>
      </div>

      {/* Tiered Monitoring Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <TierCard 
          title="Tier 1: Core Identity" 
          count={tieredStats.tier1} 
          icon={<Key size={16} />} 
          color="red"
          description="PRT Abuse & Token Issuance"
        />
        <TierCard 
          title="Admin Portals" 
          count={tieredStats.admin} 
          icon={<Lock size={16} />} 
          color="orange"
          description="Privileged Access Points"
        />
        <TierCard 
          title="Tier 2: SaaS/Session" 
          count={tieredStats.tier2} 
          icon={<Monitor size={16} />} 
          color="yellow"
          description="Token Replay Targets"
        />
        <TierCard 
          title="Tier 3: VPN/Remote" 
          count={tieredStats.tier3} 
          icon={<Globe size={16} />} 
          color="blue"
          description="Identity Boundaries"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Critical Detections Column */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white border-2 border-black p-4 flex flex-col h-[500px]">
            <h3 className="text-sm font-bold uppercase tracking-widest mb-3 flex items-center gap-2 shrink-0">
              <Zap size={14} className="text-yellow-500" /> Active Anomaly Detections
            </h3>
            
            <div className="space-y-2 overflow-y-auto pr-2 custom-scrollbar flex-grow">
              {authAnomalies.length === 0 ? (
                <div className="py-12 text-center border border-dashed border-gray-200 rounded-sm">
                  <p className="text-xs text-gray-400 italic">No active anomalies detected in current log set.</p>
                </div>
              ) : (
                authAnomalies.map((anomaly, idx) => (
                  <div 
                    key={idx}
                    className={cn(
                      "p-3 border-l-4 transition-all hover:translate-x-1 cursor-pointer",
                      anomaly.severity === 'CRITICAL' ? "bg-red-50 border-red-600" : "bg-orange-50 border-orange-500"
                    )}
                    onClick={() => {
                      setSelectedAnomaly(anomaly);
                      setActiveTab('anomaly-detail');
                    }}
                  >
                    <div className="flex justify-between items-start mb-0.5">
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          "text-[8px] font-bold px-1.5 py-0.5 rounded-full uppercase",
                          anomaly.severity === 'CRITICAL' ? "bg-red-600 text-white" : "bg-orange-500 text-white"
                        )}>
                          {anomaly.severity}
                        </span>
                        <span className="text-[10px] font-black uppercase tracking-tight">{anomaly.type.replace(/_/g, ' ')}</span>
                      </div>
                      <span className="text-[9px] font-mono text-gray-400">{formatDate(anomaly.date)}</span>
                    </div>
                    
                    <div className="text-[11px] font-bold text-gray-800 leading-none mb-1">{anomaly.user}</div>
                    <p className="text-[10px] text-gray-600 italic leading-tight">{anomaly.details}</p>
                    
                    <div className="mt-2 flex items-center justify-end gap-2 text-[8px] font-bold uppercase text-gray-400 group">
                      Investigate Anomaly <ArrowRight size={10} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Watchlist / Threat Intel Column */}
        <div className="space-y-4">
          <div className="bg-red-900 text-white p-4 border-2 border-black">
            <h3 className="text-xs font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
              <AlertTriangle size={14} className="text-yellow-400" /> Threat Intel Watchlist
            </h3>
            <div className="space-y-3">
              <WatchlistItem 
                title="CLI Login After Web"
                desc="Outlook Web login followed by Azure CLI login from same user within 60m. Classic token theft indicator."
              />
              <WatchlistItem 
                title="Multi-Country High Risk Access"
                desc="Same administrative application accessed from multiple countries in a short window. Indicates session hijacking or token replay."
              />
              <WatchlistItem 
                title="Browser → CLI Pivot"
                desc="User moving from standard browser portal to headless CLI tools. Watch for service principal abuse."
              />
            </div>
          </div>

          <div className="bg-white border border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Security Note</h3>
            <p className="text-[10px] text-gray-600 leading-relaxed italic">
              Attackers often target "Identity & Authentication Core" apps to harvest Primary Refresh Tokens (PRT). 
              A successful compromise here allows for long-lived persistence and the ability to bypass MFA in subsequent sessions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const TierCard = ({ title, count, icon, color, description }: any) => {
  const colorClasses: any = {
    red: "border-red-600 text-red-600 bg-red-50",
    orange: "border-orange-500 text-orange-600 bg-orange-50",
    yellow: "border-yellow-500 text-yellow-600 bg-yellow-50",
    blue: "border-blue-500 text-blue-600 bg-blue-50"
  };

  return (
    <div className={cn("p-4 border-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]", colorClasses[color])}>
      <div className="flex items-center justify-between mb-2">
        <div className="p-1.5 bg-white border border-current rounded-sm">
          {icon}
        </div>
        <span className="text-2xl font-black">{count}</span>
      </div>
      <div className="text-[10px] font-bold uppercase tracking-tight mb-1">{title}</div>
      <div className="text-[9px] opacity-70 italic">{description}</div>
    </div>
  );
};

const WatchlistItem = ({ title, desc }: any) => (
  <div className="border-l-2 border-yellow-400 pl-3 py-1">
    <div className="text-[10px] font-bold uppercase text-yellow-400 mb-1">{title}</div>
    <p className="text-[9px] text-red-100 leading-tight italic">{desc}</p>
  </div>
);
