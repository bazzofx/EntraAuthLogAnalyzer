/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ShieldAlert, ArrowRight, Activity, AlertCircle } from 'lucide-react';
import { cn } from '../../utils/formatters';
import { Filters, TabType } from '../../types';

interface HighRiskAppMonitorProps {
  highRiskAppSignins: any[];
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
  setActiveTab: (tab: TabType) => void;
}

export const HighRiskAppMonitor: React.FC<HighRiskAppMonitorProps> = ({ 
  highRiskAppSignins, 
  setFilters, 
  setActiveTab 
}) => {
  return (
    <div className="bg-white border border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
      <div className="flex items-center justify-between mb-6 border-b border-black pb-2">
        <h3 className="text-sm font-bold uppercase tracking-widest italic flex items-center gap-2">
          <ShieldAlert size={14} className="text-red-600" /> High-Risk Application Monitor
        </h3>
        <span className="text-[10px] text-gray-400 font-bold uppercase">
          Critical Infrastructure Access
        </span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {highRiskAppSignins.map((app) => (
          <div 
            key={app.name}
            onClick={() => {
              setFilters(f => ({ ...f, search: app.name }));
              setActiveTab('flow');
            }}
            className={cn(
              "p-4 border border-black cursor-pointer transition-all hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] group",
              app.count > 0 ? "bg-red-50 border-red-200" : "bg-gray-50 border-gray-200 opacity-60"
            )}
          >
            <div className="flex justify-between items-start mb-2">
              <div className="text-[10px] font-bold uppercase text-gray-500 tracking-tighter truncate max-w-[80%]">
                {app.name}
              </div>
              {app.count > 0 ? (
                <Activity size={12} className="text-red-500 animate-pulse" />
              ) : (
                <AlertCircle size={12} className="text-gray-300" />
              )}
            </div>
            
            <div className="flex items-baseline gap-1">
              <span className={cn(
                "text-2xl font-black",
                app.count > 0 ? "text-red-600" : "text-gray-400"
              )}>
                {app.count}
              </span>
              <span className="text-[10px] font-bold text-gray-400 uppercase">Sign-ins</span>
            </div>
            
            <div className="mt-4 flex items-center justify-between">
              <div className="text-[9px] font-bold uppercase text-red-400 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                View Flow <ArrowRight size={10} />
              </div>
              {app.count > 0 && (
                <div className="h-1 w-12 bg-red-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-red-600" 
                    style={{ width: `${Math.min(100, (app.count / 10) * 100)}%` }}
                  />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-6 p-3 bg-red-50 border border-red-100 rounded-sm">
        <p className="text-[10px] text-red-800 leading-relaxed">
          <strong>Security Warning:</strong> These applications provide high-level access to your cloud environment. Any successful login to these tools should be verified against known administrative activity. Attackers frequently use these for reconnaissance, data exfiltration, and persistence.
        </p>
      </div>
    </div>
  );
};
