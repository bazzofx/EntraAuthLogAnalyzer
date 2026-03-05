/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { COLORS } from '../../utils/formatters';

interface LocationDistributionProps {
  data: { name: string, value: number }[];
  onCountryClick: (country: string) => void;
}

export const LocationDistribution: React.FC<LocationDistributionProps> = ({ data, onCountryClick }) => {
  return (
    <div className="bg-white border border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
      <div className="flex justify-between items-center mb-6 border-b border-black pb-2">
        <h3 className="text-sm font-bold uppercase tracking-widest italic">Location Distribution (Country)</h3>
        <span className="text-[10px] text-blue-500 font-bold uppercase tracking-tighter animate-pulse">Interactive</span>
      </div>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
              onClick={(entry) => onCountryClick(entry.name)}
              className="cursor-pointer"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} className="hover:opacity-80 transition-opacity" />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ backgroundColor: '#fff', border: '1px solid #000', borderRadius: '0px' }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
