/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ChevronUp, Globe, Activity, ShieldAlert } from 'lucide-react';
import { cn, formatDate } from '../../utils/formatters';
import { TabType } from '../../types';
import { SecurityMap } from '../SecurityMap';

interface TravelDetailProps {
  setActiveTab: (tab: TabType) => void;
  selectedTravelAlert: any;
}

export const TravelDetail: React.FC<TravelDetailProps> = ({ setActiveTab, selectedTravelAlert }) => {
  if (!selectedTravelAlert) return null;

  return (
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
  );
};
