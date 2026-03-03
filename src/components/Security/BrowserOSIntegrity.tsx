/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { COLORS } from '../../utils/formatters';

interface BrowserOSIntegrityProps {
  uaData: any[];
}

export const BrowserOSIntegrity: React.FC<BrowserOSIntegrityProps> = ({ uaData }) => {
  return (
    <div className="bg-white border border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
      <h3 className="text-sm font-bold uppercase tracking-widest mb-6 border-b border-black pb-2 italic">Browser/OS Integrity</h3>
      <div className="h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={uaData}
              innerRadius={50}
              outerRadius={70}
              paddingAngle={5}
              dataKey="value"
            >
              {uaData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend layout="vertical" align="right" verticalAlign="middle" />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <p className="text-[10px] text-gray-500 mt-4 italic">Spotting unusual browsers or automated tools used for credential stuffing.</p>
    </div>
  );
};
