/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { cn, formatDate } from '../utils/formatters';
import { AuthLog } from '../types';

interface RawLogsTableProps {
  logs: AuthLog[];
  hideFalsePositives: boolean;
  setHideFalsePositives: (hide: boolean) => void;
}

export const RawLogsTable: React.FC<RawLogsTableProps> = ({ logs, hideFalsePositives, setHideFalsePositives }) => {
  return (
    <div className="bg-white border border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
      <div className="p-4 border-b border-black bg-gray-50 flex justify-between items-center">
        <h3 className="text-sm font-bold uppercase tracking-widest italic">Raw Authentication Logs</h3>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setHideFalsePositives(!hideFalsePositives)}
            className={cn(
              "flex items-center gap-2 px-3 py-1 text-[10px] font-bold uppercase border border-black transition-colors",
              hideFalsePositives ? "bg-black text-white" : "bg-white hover:bg-gray-100"
            )}
          >
            {hideFalsePositives ? <EyeOff size={12} /> : <Eye size={12} />}
            {hideFalsePositives ? "Showing Success Only" : "Showing All Logs"}
          </button>
          <div className="text-[10px] font-mono text-gray-500">{logs.length} entries found</div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-black text-white text-[10px] uppercase tracking-widest italic">
              <th className="p-3 font-medium">Timestamp</th>
              <th className="p-3 font-medium">User</th>
              <th className="p-3 font-medium">Application</th>
              <th className="p-3 font-medium">Location</th>
              <th className="p-3 font-medium">Status</th>
              <th className="p-3 font-medium">MFA</th>
              <th className="p-3 font-medium">Browser/OS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/10">
            {logs.map((log, i) => (
              <tr key={i} className="hover:bg-gray-50 transition-colors">
                <td className="p-3 text-[11px] font-mono">{formatDate(log.date)}</td>
                <td className="p-3 text-[11px] font-bold">{log.user}</td>
                <td className="p-3 text-[11px]">{log.application}</td>
                <td className="p-3 text-[11px]">{log.location}</td>
                <td className="p-3">
                  <span className={cn(
                    "px-2 py-0.5 text-[9px] font-bold uppercase border",
                    log.status === 'Success' ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-red-50 text-red-700 border-red-200"
                  )}>
                    {log.status}
                  </span>
                </td>
                <td className="p-3 text-[11px] font-mono text-gray-500">{log.mfaResult}</td>
                <td className="p-3 text-[11px] text-gray-400">{log.browser} / {log.os}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
