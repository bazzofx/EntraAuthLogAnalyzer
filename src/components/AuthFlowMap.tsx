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
  return (
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
          <div className="text-[10px] font-bold uppercase tracking-widest text-blue-500 mb-1">Outcome</div>
          <div className="text-sm font-bold">Status</div>
        </div>
      </div>
    </div>
  );
};
