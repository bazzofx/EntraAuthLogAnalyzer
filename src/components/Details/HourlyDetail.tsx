/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ChevronUp, Globe } from 'lucide-react';
import { parseISO } from 'date-fns';
import { cn } from '../../utils/formatters';
import { AuthLog, TabType } from '../../types';
import { SankeyFlow } from '../SankeyFlow';

interface HourlyDetailProps {
  setActiveTab: (tab: TabType) => void;
  selectedHour: number | null;
  hideFalsePositives: boolean;
  filteredLogs: AuthLog[];
  impossibleTravelFilter: boolean;
  setImpossibleTravelFilter: (filter: boolean) => void;
  usersWithMultiCountrySuccess: Set<string>;
}

export const HourlyDetail: React.FC<HourlyDetailProps> = ({
  setActiveTab,
  selectedHour,
  hideFalsePositives,
  filteredLogs,
  impossibleTravelFilter,
  setImpossibleTravelFilter,
  usersWithMultiCountrySuccess
}) => {
  const getHourlyLogs = () => {
    return (hideFalsePositives ? filteredLogs.filter(l => l.status === 'Success') : filteredLogs).filter(l => {
      const h = parseISO(l.date).getHours();
      const matchesHour = selectedHour !== null ? h === selectedHour : (h < 6 || h > 20);
      if (!matchesHour) return false;
      if (impossibleTravelFilter) {
        return l.status === 'Success' && usersWithMultiCountrySuccess.has(l.user);
      }
      return true;
    });
  };

  const hourlyLogs = getHourlyLogs();
  const success = hourlyLogs.filter(l => l.status === 'Success').length;
  const failure = hourlyLogs.length - success;

  const userCounts: Record<string, number> = {};
  hourlyLogs.forEach(l => { userCounts[l.user] = (userCounts[l.user] || 0) + 1; });
  const topUsers = Object.entries(userCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);

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
          </div>

          <div className="bg-white border border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <h3 className="text-xs font-bold uppercase tracking-widest mb-4 border-b border-black pb-2">Top Users</h3>
            <div className="space-y-2">
              {topUsers.map(([user, count]) => (
                <div key={user} className="flex justify-between items-center text-xs">
                  <span className="font-medium truncate max-w-[120px]">{user}</span>
                  <span className="font-mono bg-gray-100 px-1.5 py-0.5 border border-black/10">{count}</span>
                </div>
              ))}
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
              data={hourlyLogs
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
  );
};
