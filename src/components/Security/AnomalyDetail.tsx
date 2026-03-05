/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ArrowLeft, AlertCircle, Info, ShieldAlert, MapPin, Terminal, Globe } from 'lucide-react';
import { AuthLog, TabType } from '../../types';
import { formatDate } from '../../utils/formatters';
import { cn } from '../../utils/formatters';

interface AnomalyDetailProps {
  setActiveTab: (tab: TabType) => void;
  selectedAnomaly: any;
}

export const AnomalyDetail: React.FC<AnomalyDetailProps> = ({ setActiveTab, selectedAnomaly }) => {
  if (!selectedAnomaly) {
    return (
      <div className="p-12 text-center">
        <p className="text-gray-500 italic">No anomaly selected for investigation.</p>
        <button 
          onClick={() => setActiveTab('security')}
          className="mt-4 text-sm font-bold uppercase underline"
        >
          Return to Security Monitor
        </button>
      </div>
    );
  }

  const { type, user, details, logs, severity } = selectedAnomaly;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button 
          onClick={() => setActiveTab('security')}
          className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest hover:translate-x-[-4px] transition-transform"
        >
          <ArrowLeft size={14} /> Back to Security
        </button>
        <div className={cn(
          "px-3 py-1 border-2 border-black font-black uppercase italic text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
          severity === 'CRITICAL' ? "bg-red-600 text-white" : "bg-orange-500 text-white"
        )}>
          {severity} THREAT LEVEL
        </div>
      </div>

      <div className="bg-white border-2 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-3xl font-black uppercase tracking-tighter italic mb-1">
              Anomaly Investigation: {type.replace(/_/g, ' ')}
            </h2>
            <p className="text-gray-500 font-mono text-sm">Target User: {user}</p>
          </div>
          <div className="p-3 bg-red-50 border border-red-200 rounded-sm max-w-md">
            <div className="flex items-center gap-2 text-red-600 font-bold text-xs uppercase mb-1">
              <ShieldAlert size={14} /> Detection Logic
            </div>
            <p className="text-[11px] text-red-800 italic leading-snug">{details}</p>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-widest flex items-center gap-2">
            <Info size={14} className="text-blue-500" /> Evidence Timeline & Annotations
          </h3>
          
          <div className="border-2 border-black overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-100 border-b-2 border-black">
                  <th className="p-3 text-[10px] font-black uppercase tracking-widest border-r border-black">Timestamp</th>
                  <th className="p-3 text-[10px] font-black uppercase tracking-widest border-r border-black">Application</th>
                  <th className="p-3 text-[10px] font-black uppercase tracking-widest border-r border-black">Location / IP</th>
                  <th className="p-3 text-[10px] font-black uppercase tracking-widest">Anomaly Annotation</th>
                </tr>
              </thead>
              <tbody>
                {logs && logs.map((log: AuthLog, idx: number) => {
                  const annotation = getAnnotation(type, log, idx, logs);
                  return (
                    <tr key={log.requestId} className={cn(
                      "border-b border-black last:border-0 transition-colors",
                      annotation ? "bg-red-50" : "bg-white"
                    )}>
                      <td className="p-3 text-[11px] font-mono border-r border-black">{formatDate(log.date)}</td>
                      <td className="p-3 border-r border-black">
                        <div className="flex items-center gap-2">
                          {log.application.includes('CLI') || log.application.includes('PowerShell') ? <Terminal size={12} className="text-gray-400" /> : <Globe size={12} className="text-gray-400" />}
                          <span className="text-[11px] font-bold">{log.application}</span>
                        </div>
                      </td>
                      <td className="p-3 border-r border-black">
                        <div className="flex flex-col">
                          <span className="text-[11px] font-bold flex items-center gap-1">
                            <MapPin size={10} /> {log.location}
                          </span>
                          <span className="text-[9px] font-mono text-gray-400">{log.ipAddress}</span>
                        </div>
                      </td>
                      <td className="p-3">
                        {annotation && (
                          <div className="flex items-start gap-2">
                            <AlertCircle size={14} className="text-red-600 shrink-0 mt-0.5" />
                            <p className="text-[11px] text-red-700 font-medium italic leading-tight">
                              {annotation}
                            </p>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 bg-gray-50 border border-black">
            <h4 className="text-[10px] font-bold uppercase tracking-widest mb-2 text-gray-400">Recommended Action</h4>
            <ul className="space-y-2">
              <ActionItem text="Revoke all active sessions for this user immediately." />
              <ActionItem text="Reset user credentials and verify MFA methods." />
              <ActionItem text="Check for newly created service principals or API keys." />
            </ul>
          </div>
          <div className="p-4 bg-gray-50 border border-black">
            <h4 className="text-[10px] font-bold uppercase tracking-widest mb-2 text-gray-400">Forensic Context</h4>
            <p className="text-[10px] text-gray-600 italic leading-relaxed">
              {type === 'CLI_AFTER_WEB' 
                ? "This pattern strongly suggests a 'Token Theft' scenario where a session token from a web browser was intercepted and replayed via a CLI tool to bypass conditional access policies."
                : "Multiple non-trusted country logins for a high-risk app indicate either a VPN-based attack or a compromised account being used by a distributed threat actor group."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const ActionItem = ({ text }: { text: string }) => (
  <li className="flex items-center gap-2 text-[11px] font-bold italic">
    <div className="w-1.5 h-1.5 bg-red-600 rounded-full" /> {text}
  </li>
);

const getAnnotation = (type: string, log: AuthLog, idx: number, allLogs: AuthLog[]) => {
  if (type === 'CLI_AFTER_WEB') {
    if (idx === 0) return "Initial Web session established. Potential source of token harvest.";
    if (idx === 1) return "SUSPICIOUS: Headless CLI login detected shortly after web session. Likely token replay.";
  }
  
  if (type === 'MULTI_COUNTRY_ACCESS') {
    return `Access from non-trusted country: ${log.location.split(',').pop()?.trim()}. High-risk app target.`;
  }
  
  return null;
};
