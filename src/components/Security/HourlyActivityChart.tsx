/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';
import { TabType } from '../../types';

interface HourlyActivityChartProps {
  hourlyData: any[];
  setSelectedHour: (hour: number | null) => void;
  setActiveTab: (tab: TabType) => void;
}

export const HourlyActivityChart: React.FC<HourlyActivityChartProps> = ({ hourlyData, setSelectedHour, setActiveTab }) => {
  return (
    <div className="bg-white border border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
      <h3 className="text-sm font-bold uppercase tracking-widest mb-6 border-b border-black pb-2 italic">Activity by Hour (Anomalous Timing)</h3>
      <div className="h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={hourlyData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
            <XAxis dataKey="hour" fontSize={8} interval={2} />
            <YAxis fontSize={10} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#fff', border: '1px solid #000', borderRadius: '0px' }}
            />
            <Bar 
              dataKey="count" 
              onClick={(data) => {
                const hour = parseInt(data.hour.split(':')[0]);
                setSelectedHour(hour);
                setActiveTab('hourly-detail');
              }}
              cursor="pointer"
            >
              {hourlyData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.isOffHours ? '#f97316' : '#3b82f6'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 flex items-center gap-4 text-[10px] font-bold uppercase tracking-wider">
        <div className="flex items-center gap-1"><div className="w-2 h-2 bg-[#3b82f6]"></div> Standard</div>
        <div className="flex items-center gap-1"><div className="w-2 h-2 bg-[#f97316]"></div> Off-Hours</div>
      </div>
    </div>
  );
};
