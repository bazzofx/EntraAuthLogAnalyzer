/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Activity, Globe } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { cn } from '../../utils/formatters';
import { Filters, TabType } from '../../types';

interface NewEntityFlaggingProps {
  newEntityAlerts: any[];
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
  setActiveTab: (tab: TabType) => void;
}

export const NewEntityFlagging: React.FC<NewEntityFlaggingProps> = ({ newEntityAlerts, setFilters, setActiveTab }) => {
  return (
    <div className="lg:col-span-2 bg-white border border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
      <div className="flex justify-between items-center mb-6 border-b border-black pb-2">
        <h3 className="text-sm font-bold uppercase tracking-widest italic">New Entity Flagging</h3>
        <span className="text-[10px] font-mono bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
          {newEntityAlerts.length} Recent Alerts
        </span>
      </div>
      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
        {newEntityAlerts.map((alert) => (
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
        {newEntityAlerts.length === 0 && (
          <div className="text-center py-12 text-gray-400 italic text-xs">No new entity alerts detected</div>
        )}
      </div>
      <p className="text-[10px] text-gray-500 mt-4 italic">Flagging successful logins from previously unseen IPs or Countries for each user.</p>
    </div>
  );
};
