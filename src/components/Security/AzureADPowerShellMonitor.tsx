/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Terminal, ShieldAlert, ArrowRight } from 'lucide-react';
import { cn, formatDate } from '../../utils/formatters';
import { Filters, TabType } from '../../types';

interface AzureADPowerShellMonitorProps {
  powershellSignins: any[];
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
  setActiveTab: (tab: TabType) => void;
}

export const AzureADPowerShellMonitor: React.FC<AzureADPowerShellMonitorProps> = ({ 
  powershellSignins, 
  setFilters, 
  setActiveTab 
}) => {
  return (
    <div className="bg-white border border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
      <div className="flex items-center justify-between mb-6 border-b border-black pb-2">
        <h3 className="text-sm font-bold uppercase tracking-widest italic flex items-center gap-2">
          <Terminal size={14} className="text-blue-600" /> Azure AD PowerShell Monitor
        </h3>
        <span className={cn(
          "text-[10px] px-2 py-0.5 font-bold rounded-full uppercase",
          powershellSignins.length > 0 ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-500"
        )}>
          {powershellSignins.length} Successful Sign-ins
        </span>
      </div>
      
      <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
        {powershellSignins.length === 0 ? (
          <div className="text-center py-12 text-gray-400 italic text-xs">
            No successful PowerShell sign-ins detected.
          </div>
        ) : (
          powershellSignins.map((signin) => (
            <div 
              key={signin.id} 
              className="p-3 bg-blue-50 border border-blue-200 rounded-sm cursor-pointer hover:bg-blue-100 transition-colors shadow-sm hover:shadow-md group"
              onClick={() => {
                setFilters(f => ({ ...f, user: signin.user, search: 'Azure Active Directory PowerShell' }));
                setActiveTab('logs');
              }}
            >
              <div className="flex justify-between items-start">
                <div className="text-xs font-bold text-blue-800">{signin.user}</div>
                <ShieldAlert size={12} className="text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="text-[10px] text-gray-600 mt-1 flex items-center justify-between">
                <span>{signin.ip} ({signin.location})</span>
                <span className="font-mono text-[9px]">{formatDate(signin.date)}</span>
              </div>
              <div className="flex justify-end mt-1">
                <div className="text-[9px] text-blue-400 flex items-center gap-1 italic">
                  Investigate <ArrowRight size={10} />
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      
      <div className="mt-4 p-3 bg-gray-50 border border-black/5 rounded-sm">
        <p className="text-[10px] text-gray-500 leading-relaxed italic">
          <strong>Security Note:</strong> Successful sign-ins via Azure AD PowerShell should be closely monitored as they are often used by administrators but can also be leveraged by attackers for automated reconnaissance and persistence.
        </p>
      </div>
    </div>
  );
};
