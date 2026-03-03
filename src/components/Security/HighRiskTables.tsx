/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { cn } from '../../utils/formatters';
import { Filters } from '../../types';

interface HighRiskTablesProps {
  securityMetrics: any;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
}

export const HighRiskTables: React.FC<HighRiskTablesProps> = ({ securityMetrics, setFilters }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* High Risk IPs Table */}
      <div className="bg-white border border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <div className="flex justify-between items-center mb-6 border-b border-black pb-2">
          <h3 className="text-sm font-bold uppercase tracking-widest italic">Threat Hunting: High Risk IPs</h3>
          <span className="text-[10px] text-blue-500 font-bold uppercase tracking-tighter animate-pulse">Interactive filter</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[10px] uppercase tracking-widest text-gray-500 border-b border-black/10">
                <th className="pb-2">IP Address</th>
                <th className="pb-2 text-center">Failures</th>
                <th className="pb-2 text-center">Users</th>
                <th className="pb-2 text-right">Risk Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {securityMetrics.highRiskIPs.map((item: any, i: number) => (
                <tr key={i} className="hover:bg-gray-50 cursor-pointer" onClick={() => setFilters(f => ({ ...f, search: item.ip }))}>
                  <td className="py-3 text-xs font-mono font-bold">{item.ip}</td>
                  <td className="py-3 text-xs text-center text-red-600 font-bold">{item.failures}</td>
                  <td className="py-3 text-xs text-center">{item.uniqueUsers}</td>
                  <td className="py-3 text-xs text-right">
                    <span className={cn(
                      "px-2 py-0.5 rounded-full text-[10px] font-bold",
                      item.riskScore > 50 ? "bg-red-100 text-red-700" : "bg-orange-100 text-orange-700"
                    )}>
                      {item.riskScore}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* High Risk Users Table */}
      <div className="bg-white border border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <h3 className="text-sm font-bold uppercase tracking-widest mb-6 border-b border-black pb-2 italic">Threat Hunting: High Risk Users</h3>
        <div className="overflow-x-auto"
        title="High risk users based on the amount of different countries login in from">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[10px] uppercase tracking-widest text-gray-500 border-b border-black/10">
                <th className="pb-2">User</th>
                <th className="pb-2 text-center">IPs</th>
                <th className="pb-2 text-center">Apps</th>
                <th className="pb-2 text-right">Risk Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {securityMetrics.highRiskUsers.map((item: any, i: number) => (
                <tr 
                  key={i} 
                  className="hover:bg-gray-50 cursor-pointer group" 
                  onClick={() => setFilters(f => ({ ...f, user: item.user }))}
                >
                  <td className="py-3 text-xs font-bold truncate max-w-[150px] group-hover:text-blue-600 transition-colors">{item.user}</td>
                  <td className="py-3 text-xs text-center font-mono">{item.uniqueIPs}</td>
                  <td className="py-3 text-xs text-center font-mono">{item.uniqueApps}</td>
                  <td className="py-3 text-xs text-right">
                    <span className={cn(
                      "px-2 py-0.5 rounded-full text-[10px] font-bold",
                      item.riskScore > 1 ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-700"
                    )}>
                      {item.riskScore}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
