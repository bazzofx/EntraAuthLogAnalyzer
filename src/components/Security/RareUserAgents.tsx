/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface RareUserAgentsProps {
  rareUAs: any[];
}

export const RareUserAgents: React.FC<RareUserAgentsProps> = ({ rareUAs }) => {
  return (
    <div className="bg-white border border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
      <h3 className="text-sm font-bold uppercase tracking-widest mb-6 border-b border-black pb-2 italic">Rare User Agents (Bot Detection)</h3>
      <div className="space-y-3">
        {rareUAs.map((ua, i) => (
          <div key={i} className="p-2 bg-orange-50 border-l-2 border-orange-400">
            <div className="text-[11px] font-bold truncate">{ua.name}</div>
            <div className="flex justify-between items-center mt-1">
              <span className="text-[10px] text-orange-700 font-mono">{ua.value} occurrences</span>
              <span className="text-[9px] bg-orange-200 px-1 rounded">Anomaly</span>
            </div>
          </div>
        ))}
        {rareUAs.length === 0 && (
          <div className="text-center py-12 text-gray-400 italic text-xs">No rare user agents detected</div>
        )}
      </div>
    </div>
  );
};
