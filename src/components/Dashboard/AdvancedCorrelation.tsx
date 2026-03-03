/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Clock, Globe, Server, Activity, Zap, ShieldAlert, Network, Monitor, Chrome, Smartphone, Share2, Key, ArrowRight, Users } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { cn, formatDate, COLORS } from '../../utils/formatters';
import { CorrelationTabType, TabType, Filters } from '../../types';

interface AdvancedCorrelationProps {
  activeCorrelationTab: CorrelationTabType;
  setActiveCorrelationTab: (tab: CorrelationTabType) => void;
  correlationMetrics: any;
  securityMetrics: any;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
  setActiveTab: (tab: TabType) => void;
  handleTravelAlertClick: (alert: any) => void;
}

export const AdvancedCorrelation: React.FC<AdvancedCorrelationProps> = ({
  activeCorrelationTab,
  setActiveCorrelationTab,
  correlationMetrics,
  securityMetrics,
  setFilters,
  setActiveTab,
  handleTravelAlertClick
}) => {
  if (!correlationMetrics) return null;

  return (
    <div className="lg:col-span-2 bg-white border border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
      <div className="p-4 border-b border-black bg-gray-50 flex justify-between items-center">
        <h3 className="text-sm font-bold uppercase tracking-widest italic">Advanced Correlation Analysis</h3>
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'temporal', label: 'Temporal', icon: Clock },
            { id: 'geographical', label: 'Geographical', icon: Globe },
            { id: 'infrastructure', label: 'Infrastructure', icon: Server },
            { id: 'behavioral', label: 'Behavioral', icon: Activity }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveCorrelationTab(tab.id as any)}
              className={cn(
                "px-3 py-1.5 text-[10px] font-bold uppercase border border-black transition-colors flex items-center gap-2",
                activeCorrelationTab === tab.id ? "bg-black text-white" : "bg-white hover:bg-gray-100"
              )}
            >
              <tab.icon size={12} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>
      
      <div className="p-6 min-h-[400px]">
        {activeCorrelationTab === 'temporal' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Zap className="text-orange-500" size={18} />
                <h4 className="text-xs font-bold uppercase tracking-widest">Rapid Authentication Sequences</h4>
              </div>
              <div className="space-y-3">
                {correlationMetrics.rapidSequences.length === 0 ? (
                  <p className="text-xs text-gray-400 italic">No rapid sequences detected.</p>
                ) : (
                  correlationMetrics.rapidSequences.slice(0, 5).map((seq: any, i: number) => (
                    <div 
                      key={i} 
                      className="p-3 bg-orange-50 border-l-4 border-orange-500 flex justify-between items-center cursor-pointer hover:bg-orange-100 transition-colors group"
                      onClick={() => {
                        setFilters(f => ({ ...f, user: seq.user, search: '' }));
                        setActiveTab('logs');
                      }}
                    >
                      <div>
                        <div className="text-sm font-bold group-hover:text-orange-700">{seq.user}</div>
                        <div className="text-[10px] text-orange-700">{seq.count} attempts in &lt; 1 min</div>
                      </div>
                      <div className="text-[10px] font-mono text-gray-500 flex items-center gap-1">
                        {formatDate(seq.time)}
                        <ArrowRight size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="mt-6">
                <div className="flex items-center gap-2 mb-4">
                  <Activity className="text-red-500" size={18} />
                  <h4 className="text-xs font-bold uppercase tracking-widest">Brute Force Patterns</h4>
                </div>
                <div className="space-y-3">
                  {correlationMetrics.bruteForce.length === 0 ? (
                    <p className="text-xs text-gray-400 italic">No brute force patterns detected.</p>
                  ) : (
                    correlationMetrics.bruteForce.slice(0, 5).map((bf: any, i: number) => (
                      <div 
                        key={i} 
                        className="p-3 bg-red-50 border-l-4 border-red-500 flex justify-between items-center cursor-pointer hover:bg-red-100 transition-colors group"
                        onClick={() => {
                          setFilters(f => ({ ...f, user: bf.user, search: '' }));
                          setActiveTab('logs');
                        }}
                      >
                        <div>
                          <div className="text-sm font-bold group-hover:text-red-700">{bf.user}</div>
                          <div className="text-[10px] text-red-700">{bf.count} failures in &lt; 5 mins</div>
                        </div>
                        <div className="text-[10px] font-mono text-gray-500 flex items-center gap-1">
                          {formatDate(bf.time)}
                          <ArrowRight size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="mt-6">
                <div className="flex items-center gap-2 mb-4">
                  <ShieldAlert className="text-purple-600" size={18} />
                  <h4 className="text-xs font-bold uppercase tracking-widest">Password Spray Detection</h4>
                </div>
                <div className="space-y-3">
                  {correlationMetrics.passwordSpray.length === 0 ? (
                    <p className="text-xs text-gray-400 italic">No password spray patterns detected.</p>
                  ) : (
                    correlationMetrics.passwordSpray.slice(0, 5).map((ps: any, i: number) => (
                      <div 
                        key={i} 
                        className="p-3 bg-purple-50 border-l-4 border-purple-600 flex justify-between items-center cursor-pointer hover:bg-purple-100 transition-colors group"
                        onClick={() => {
                          setFilters(f => ({ ...f, search: ps.ip, user: 'All' }));
                          setActiveTab('logs');
                        }}
                      >
                        <div>
                          <div className="text-sm font-bold group-hover:text-purple-700">{ps.ip}</div>
                          <div className="text-[10px] text-purple-700">Targeted {ps.userCount} unique accounts</div>
                          <div className="text-[9px] text-gray-400 mt-1 italic">
                            e.g. {ps.users.join(', ')}...
                          </div>
                        </div>
                        <div className="text-[10px] font-mono text-gray-500 flex items-center gap-1">
                          {formatDate(ps.time)}
                          <ArrowRight size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
            <div className="bg-gray-50 p-4 border border-black/5">
              <h4 className="text-[10px] font-bold uppercase text-gray-400 mb-4">Temporal Correlation Insights</h4>
              <p className="text-xs text-gray-600 leading-relaxed mb-4">
                Analyzing login frequency and failure patterns to identify automated attacks. 
                Rapid sequences often indicate script-based access, while brute force patterns 
                suggest credential stuffing or password spraying attempts.
              </p>
              <p className="text-xs text-gray-600 leading-relaxed">
                <strong>Password Spraying:</strong> A technique where an attacker tries a common password against many accounts to avoid account lockouts. 
                Detected here when a single IP address targets multiple distinct usernames.
              </p>
            </div>
          </div>
        )}

        {activeCorrelationTab === 'geographical' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Globe className="text-blue-500" size={18} />
                <h4 className="text-xs font-bold uppercase tracking-widest">Impossible Travel Incidents</h4>
              </div>
              <div className="space-y-3">
                {securityMetrics.impossibleTravel.length === 0 ? (
                  <p className="text-xs text-gray-400 italic">No impossible travel incidents.</p>
                ) : (
                  securityMetrics.impossibleTravel.slice(0, 5).map((alert: any, i: number) => (
                    <div 
                      key={i} 
                      className="p-3 bg-red-50 border-l-4 border-red-500 cursor-pointer hover:bg-red-100 transition-colors group"
                      onClick={() => handleTravelAlertClick(alert)}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <div className="text-sm font-bold group-hover:text-red-700">{alert.user}</div>
                        <div className="text-[10px] font-bold text-red-700 uppercase">{alert.reason}</div>
                      </div>
                      <div className="text-[10px] text-gray-600 truncate flex items-center justify-between">
                        <span>{alert.loc1} → {alert.loc2}</span>
                        <ArrowRight size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Globe className="text-purple-500" size={18} />
                <h4 className="text-xs font-bold uppercase tracking-widest">Country Transitions</h4>
              </div>
              <div className="space-y-3">
                {correlationMetrics.countryTransitions.length === 0 ? (
                  <p className="text-xs text-gray-400 italic">No country transitions detected.</p>
                ) : (
                  correlationMetrics.countryTransitions.slice(0, 5).map((trans: any, i: number) => (
                    <div 
                      key={i} 
                      className="p-3 bg-purple-50 border-l-4 border-purple-500 flex justify-between items-center cursor-pointer hover:bg-purple-100 transition-colors group"
                      onClick={() => {
                        setFilters(f => ({ ...f, user: trans.user, search: '' }));
                        setActiveTab('logs');
                      }}
                    >
                      <div>
                        <div className="text-sm font-bold group-hover:text-purple-700">{trans.user}</div>
                        <div className="text-[10px] text-purple-700">{trans.from} → {trans.to}</div>
                      </div>
                      <div className="text-[10px] font-mono text-gray-500 flex items-center gap-1">
                        {formatDate(trans.time)}
                        <ArrowRight size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {activeCorrelationTab === 'infrastructure' && (
          <div className="space-y-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Unique IPs', value: correlationMetrics.uniqueIPs, icon: Network, color: 'text-blue-600' },
                { label: 'Device Types', value: correlationMetrics.deviceCount, icon: Monitor, color: 'text-purple-600' },
                { label: 'Browser Types', value: correlationMetrics.browserCount, icon: Chrome, color: 'text-emerald-600' },
                { label: 'Suspicious IPs', value: correlationMetrics.topSuspiciousIPs.length, icon: ShieldAlert, color: 'text-red-600' }
              ].map((m, i) => (
                <div key={i} className="bg-gray-50 border border-black/5 p-4 rounded-sm">
                  <div className="flex items-center gap-2 mb-1">
                    <m.icon size={14} className="text-gray-400" />
                    <div className="text-[10px] font-bold uppercase text-gray-400">{m.label}</div>
                  </div>
                  <div className={cn("text-xl font-mono font-bold", m.color)}>{m.value}</div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Share2 size={14} /> Network Infrastructure Analysis
                </h4>
                <div className="space-y-2">
                  {correlationMetrics.sharedIPs.slice(0, 5).map((item: any, i: number) => (
                    <div 
                      key={i} 
                      className="text-xs p-2 border border-black/5 flex justify-between items-center cursor-pointer hover:bg-gray-100 transition-colors group"
                      onClick={() => {
                        setFilters(f => ({ ...f, search: item.ip, user: 'All' }));
                        setActiveTab('logs');
                      }}
                    >
                      <span className="font-mono font-bold group-hover:text-blue-600">{item.ip}</span>
                      <span className="text-gray-500 flex items-center gap-2">
                        {item.users.length} users
                        <ArrowRight size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Smartphone size={14} /> Client Environment Analysis
                </h4>
                <div className="h-[150px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={correlationMetrics.deviceTypes.slice(0, 5)}
                        innerRadius={40}
                        outerRadius={60}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {correlationMetrics.deviceTypes.slice(0, 5).map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ fontSize: '10px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeCorrelationTab === 'behavioral' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Users className="text-blue-500" size={18} />
                <h4 className="text-xs font-bold uppercase tracking-widest">Behavioral Clusters</h4>
              </div>
              <div className="space-y-3">
                {correlationMetrics.sharedIPs.slice(0, 5).map((cluster: any, i: number) => (
                  <div 
                    key={i} 
                    className="p-3 bg-blue-50 border-l-4 border-blue-500 cursor-pointer hover:bg-blue-100 transition-colors group"
                    onClick={() => {
                      setFilters(f => ({ ...f, search: cluster.ip, user: 'All' }));
                      setActiveTab('logs');
                    }}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <div className="text-[10px] font-bold text-blue-700 uppercase">IP Cluster: {cluster.ip}</div>
                      <ArrowRight size={10} className="text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {cluster.users.map((u: string) => (
                        <span key={u} className="text-[9px] bg-white px-1.5 py-0.5 border border-blue-200 rounded-sm">{u}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Key className="text-emerald-500" size={18} />
                <h4 className="text-xs font-bold uppercase tracking-widest">Privilege Escalation</h4>
              </div>
              <div className="space-y-3">
                {correlationMetrics.privilegeEscalation.length === 0 ? (
                  <p className="text-xs text-gray-400 italic">No suspicious privilege access patterns.</p>
                ) : (
                  correlationMetrics.privilegeEscalation.slice(0, 5).map((log: any, i: number) => (
                    <div 
                      key={i} 
                      className="p-3 bg-emerald-50 border-l-4 border-emerald-500 flex justify-between items-center cursor-pointer hover:bg-emerald-100 transition-colors group"
                      onClick={() => {
                        setFilters(f => ({ ...f, user: log.user, app: log.application, search: '' }));
                        setActiveTab('logs');
                      }}
                    >
                      <div>
                        <div className="text-sm font-bold group-hover:text-emerald-700">{log.user}</div>
                        <div className="text-[10px] text-emerald-700 truncate max-w-[200px]">{log.application}</div>
                      </div>
                      <div className="text-[10px] font-mono text-gray-500 flex items-center gap-1">
                        {formatDate(log.date)}
                        <ArrowRight size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
