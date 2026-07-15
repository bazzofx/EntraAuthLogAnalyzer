/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { cn } from '../utils/formatters';
import { AuthLog } from '../types';
import { SankeyFlow } from './SankeyFlow';

interface AuthFlowMapProps {
  filteredLogs: AuthLog[];
  flowCountryFilter: string | null;
  setFlowCountryFilter: (cc: string | null) => void;
  uniqueCountries: string[];
}

export const AuthFlowMap: React.FC<AuthFlowMapProps> = ({
  filteredLogs,
  flowCountryFilter,
  setFlowCountryFilter,
  uniqueCountries
}) => {
  const displayedCountries = React.useMemo(() => {
    return Array.from(
      new Set(
        filteredLogs.map(l => l.location.split(',').pop()?.trim() || 'Unknown')
      )
    ).sort();
  }, [filteredLogs]);

  const flowData = React.useMemo(() => {
    return filteredLogs
      .map(l => ({
        ...l,
        country: l.location.split(',').pop()?.trim() || 'Unknown'
      }))
      .filter(l => {
        if (!flowCountryFilter) return true;
        return l.country === flowCountryFilter;
      });
  }, [filteredLogs, flowCountryFilter]);

  return (
    <div className="bg-white border border-black p-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h2 className="text-xl font-bold tracking-tight mb-2">Authentication Flow Map</h2>
          <p className="text-sm text-gray-500 italic">Visualizing the relationship between Users, Countries, Applications, and Authentication Status.</p>
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
          {displayedCountries.map(cc => (
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
          data={flowData.slice(0, 100)} 
          customNodes={['user', 'country', 'application', 'status']}
          width={1200} 
          height={600} 
        />
      </div>
      <div className="mt-8 grid grid-cols-4 gap-8 text-center border-t border-black pt-8">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-[#8b5cf6] mb-1">Source</div>
          <div className="text-sm font-bold text-gray-900">Users</div>
        </div>
        <div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-[#3b82f6] mb-1">Location</div>
          <div className="text-sm font-bold text-gray-900">Countries</div>
        </div>
        <div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-[#0ea5e9] mb-1">Target</div>
          <div className="text-sm font-bold text-gray-900">Applications</div>
        </div>
        <div>
          <div className="text-[10px] font-bold uppercase tracking-widest mb-1">
            <span className="text-[#10b981]">Success</span> <span className="text-gray-300">/</span> <span className="text-[#ef4444]">Failure</span>
          </div>
          <div className="text-sm font-bold text-gray-900">Outcome</div>
        </div>
      </div>
    </div>
  );
};
