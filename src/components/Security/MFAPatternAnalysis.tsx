/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { cn } from '../../utils/formatters';
import { Filters } from '../../types';

interface MFAPatternAnalysisProps {
  securityMetrics: any;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
}

export const MFAPatternAnalysis: React.FC<MFAPatternAnalysisProps> = ({ securityMetrics, setFilters }) => {
  return (
    <div className="bg-white border border-black p-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
      <div className="flex justify-between items-start mb-8 border-b border-black pb-4">
        <div>
          <h3 className="text-lg font-bold tracking-tight">MFA Pattern Analysis</h3>
          <p className="text-[10px] text-gray-500 mt-1">Analyzing MFA outcomes across requirements, applications, and user agents.</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => setFilters(f => ({ ...f, search: 'success' }))}
            className="text-center hover:bg-gray-50 p-1 rounded transition-colors group"
            title="Filter by MFA Success"
          >
            <div className="text-[10px] text-gray-400 uppercase group-hover:text-black transition-colors">Success Rate</div>
            <div className="text-lg font-mono font-bold text-emerald-600">
              {securityMetrics.mfaStats.total > 0 ? ((securityMetrics.mfaStats.success / securityMetrics.mfaStats.total) * 100).toFixed(1) : 0}%
            </div>
          </button>
          <button 
            onClick={() => setFilters(f => ({ ...f, search: 'fail' }))}
            className="text-center hover:bg-gray-50 p-1 rounded transition-colors group"
            title="Filter by MFA Failure"
          >
            <div className="text-[10px] text-gray-400 uppercase group-hover:text-black transition-colors">Failure Rate</div>
            <div className="text-lg font-mono font-bold text-red-600">
              {securityMetrics.mfaStats.total > 0 ? ((securityMetrics.mfaStats.failure / securityMetrics.mfaStats.total) * 100).toFixed(1) : 0}%
            </div>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* By Requirement */}
        <div className="space-y-4">
          <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 border-b border-black/5 pb-1">By Requirement</h4>
          <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
            {Object.entries(securityMetrics.mfaPatterns.byRequirement)
              .sort((a, b) => {
                const sa = a[1] as { success: number; failure: number };
                const sb = b[1] as { success: number; failure: number };
                return (sb.success + sb.failure) - (sa.success + sa.failure);
              })
              .map(([req, stats]) => {
                const s = stats as { success: number; failure: number };
                return (
                  <button 
                    key={req} 
                    onClick={() => setFilters(f => ({ ...f, search: req }))}
                    className="w-full text-left group hover:bg-gray-50 p-1 -m-1 rounded transition-colors"
                  >
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="font-medium truncate max-w-[120px]" title={req}>{req}</span>
                      <span className="font-mono text-gray-400">{s.success + s.failure}</span>
                    </div>
                    <div className="flex h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full" style={{ width: `${(s.success / (s.success + s.failure || 1)) * 100}%` }}></div>
                      <div className="bg-red-500 h-full" style={{ width: `${(s.failure / (s.success + s.failure || 1)) * 100}%` }}></div>
                    </div>
                  </button>
                );
              })}
          </div>
        </div>

        {/* By Application */}
        <div className="space-y-4">
          <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 border-b border-black/5 pb-1">By Application</h4>
          <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
            {Object.entries(securityMetrics.mfaPatterns.byApp)
              .sort((a, b) => {
                const sa = a[1] as { success: number; failure: number };
                const sb = b[1] as { success: number; failure: number };
                return (sb.success + sb.failure) - (sa.success + sa.failure);
              })
              .map(([app, stats]) => {
                const s = stats as { success: number; failure: number };
                return (
                  <button 
                    key={app} 
                    onClick={() => setFilters(f => ({ ...f, app }))}
                    className="w-full text-left group hover:bg-gray-50 p-1 -m-1 rounded transition-colors"
                  >
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="font-medium truncate max-w-[120px]" title={app}>{app}</span>
                      <span className="font-mono text-gray-400">{s.success + s.failure}</span>
                    </div>
                    <div className="flex h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full" style={{ width: `${(s.success / (s.success + s.failure || 1)) * 100}%` }}></div>
                      <div className="bg-red-500 h-full" style={{ width: `${(s.failure / (s.success + s.failure || 1)) * 100}%` }}></div>
                    </div>
                  </button>
                );
              })}
          </div>
        </div>

        {/* By User Agent */}
        <div className="space-y-4">
          <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 border-b border-black/5 pb-1">By User Agent</h4>
          <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
            {Object.entries(securityMetrics.mfaPatterns.byUA)
              .sort((a, b) => {
                const sa = a[1] as { success: number; failure: number };
                const sb = b[1] as { success: number; failure: number };
                return (sb.success + sb.failure) - (sa.success + sa.failure);
              })
              .slice(0, 10)
              .map(([ua, stats]) => {
                const s = stats as { success: number; failure: number };
                return (
                  <button 
                    key={ua} 
                    onClick={() => setFilters(f => ({ ...f, search: ua }))}
                    className="w-full text-left group hover:bg-gray-50 p-1 -m-1 rounded transition-colors"
                  >
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="font-medium truncate max-w-[120px]" title={ua}>{ua}</span>
                      <span className="font-mono text-gray-400">{s.success + s.failure}</span>
                    </div>
                    <div className="flex h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full" style={{ width: `${(s.success / (s.success + s.failure || 1)) * 100}%` }}></div>
                      <div className="bg-red-500 h-full" style={{ width: `${(s.failure / (s.success + s.failure || 1)) * 100}%` }}></div>
                    </div>
                  </button>
                );
              })}
          </div>
        </div>

        {/* By Result */}
        <div className="space-y-4">
          <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 border-b border-black/5 pb-1">By Result Detail</h4>
          <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
            {Object.entries(securityMetrics.mfaPatterns.byResult)
              .sort((a, b) => (b[1] as number) - (a[1] as number))
              .map(([result, count]) => (
                <button 
                  key={result} 
                  onClick={() => setFilters(f => ({ ...f, search: result }))}
                  className="w-full text-left flex justify-between items-center text-[11px] hover:bg-gray-50 p-1 -m-1 rounded transition-colors"
                >
                  <span className={cn(
                    "font-medium truncate max-w-[120px]",
                    result.toLowerCase().includes('success') ? "text-emerald-600" : 
                    (result.toLowerCase().includes('fail') || result.toLowerCase().includes('deny')) ? "text-red-600" : "text-gray-600"
                  )} title={result}>
                    {result}
                  </span>
                  <span className="font-mono bg-gray-100 px-1.5 py-0.5 border border-black/5 rounded">{count as number}</span>
                </button>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};
