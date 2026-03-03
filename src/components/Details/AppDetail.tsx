/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ChevronUp } from 'lucide-react';
import { cn } from '../../utils/formatters';
import { AuthLog, TabType } from '../../types';
import { SankeyFlow } from '../SankeyFlow';

interface AppDetailProps {
  setActiveTab: (tab: TabType) => void;
  selectedApp: string | null;
  setSelectedApp: (app: string | null) => void;
  uniqueAppsList: string[];
  filteredLogs: AuthLog[];
}

export const AppDetail: React.FC<AppDetailProps> = ({ setActiveTab, selectedApp, setSelectedApp, uniqueAppsList, filteredLogs }) => {
  return (
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
  );
};
