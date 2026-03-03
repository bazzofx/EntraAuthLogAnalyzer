/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Map as MapIcon, Activity, ChevronUp } from 'lucide-react';
import { cn } from '../../utils/formatters';

interface ImpossibleTravelAlertsProps {
  impossibleTravel: any[];
  handleTravelAlertClick: (alert: any) => void;
}

export const ImpossibleTravelAlerts: React.FC<ImpossibleTravelAlertsProps> = ({ impossibleTravel, handleTravelAlertClick }) => {
  return (
    <div className="bg-white border border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
      <div className="flex items-center justify-between mb-6 border-b border-black pb-2">
        <h3 className="text-sm font-bold uppercase tracking-widest italic flex items-center gap-2">
          <MapIcon size={14} className="text-red-500" /> Impossible Travel Alerts
        </h3>
      </div>
      <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
        {impossibleTravel.map((alert) => (
          <div 
            key={alert.id} 
            className="p-3 bg-red-50 border border-red-200 rounded-sm cursor-pointer hover:bg-red-100 transition-colors shadow-sm hover:shadow-md"
            onClick={() => handleTravelAlertClick(alert)}
          >
            <div className="flex justify-between items-start">
              <div className="text-xs font-bold text-red-800">{alert.user}</div>
              <span className="text-[9px] bg-red-200 px-1 rounded font-bold uppercase">{alert.reason}</span>
            </div>
            <div className="text-[10px] text-gray-600 mt-1 flex items-center gap-1">
              <span className="truncate max-w-[100px]">{alert.loc1}</span>
              <Activity size={10} className="shrink-0" />
              <span className="truncate max-w-[100px]">{alert.loc2}</span>
            </div>
            <div className="flex justify-between items-center mt-1">
              <div className="text-[10px] font-bold text-red-600">Gap: {alert.timeDiff}</div>
              <div className="text-[9px] text-red-400 flex items-center gap-1 italic">
                Click for details <ChevronUp size={10} className="rotate-90" />
              </div>
            </div>
          </div>
        ))}
        {impossibleTravel.length === 0 && (
          <div className="text-center py-12 text-gray-400 italic text-xs">No impossible travel detected</div>
        )}
      </div>
    </div>
  );
};
