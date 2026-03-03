/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

interface TopApplicationsProps {
  data: any[];
}

export const TopApplications: React.FC<TopApplicationsProps> = ({ data }) => {
  return (
    <div className="bg-white border border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
      <h3 className="text-sm font-bold uppercase tracking-widest mb-6 border-b border-black pb-2 italic">Top Applications</h3>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#eee" />
            <XAxis type="number" fontSize={10} />
            <YAxis dataKey="name" type="category" fontSize={10} width={150} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#fff', border: '1px solid #000', borderRadius: '0px' }}
            />
            <Bar dataKey="count" fill="#3b82f6" name="Requests" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
