/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Globe, CheckCircle2, AlertCircle, Users, ArrowRight } from 'lucide-react';
import { cn } from '../../utils/formatters';
import { Stats, TabType, Filters } from '../../types';

interface StatsGridProps {
  stats: Stats;
  setActiveTab: (tab: TabType) => void;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
}

export const StatsGrid: React.FC<StatsGridProps> = ({ stats, setActiveTab, setFilters }) => {
  const statItems = [
    { label: 'Unique Countries', value: stats.uniqueCountries, icon: Globe, color: 'text-blue-600', clickable: true, onClick: () => setActiveTab('flow') },
    { label: 'Success Rate', value: `${((stats.success / stats.total) * 100).toFixed(1)}%`, icon: CheckCircle2, color: 'text-emerald-600' },
    { label: 'Failures', value: stats.failure, icon: AlertCircle, color: 'text-red-600', clickable: true, onClick: () => { setFilters(f => ({ ...f, status: 'Failure' })); setActiveTab('logs'); } },
    { label: 'Unique Users', value: stats.uniqueUsers, icon: Users, color: 'text-purple-600', clickable: true, onClick: () => setActiveTab('user-detail') },
    { label: 'Applications', value: stats.uniqueApps, icon: Globe, color: 'text-orange-600', clickable: true, onClick: () => setActiveTab('app-detail') },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
      {statItems.map((stat, i) => (
        <div 
          key={i} 
          className={cn(
            "bg-white border border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
            stat.clickable && "cursor-pointer hover:bg-gray-50 transition-colors group"
          )}
          onClick={stat.onClick}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-widest text-gray-500 italic">{stat.label}</span>
            <stat.icon className={cn(stat.color, stat.clickable && "group-hover:scale-110 transition-transform")} size={20} />
          </div>
          <div className="text-3xl font-mono font-bold tracking-tighter flex items-center justify-between">
            {stat.value}
            {stat.clickable && <ArrowRight size={18} className="text-gray-300 group-hover:text-black transition-colors" />}
          </div>
        </div>
      ))}
    </div>
  );
};
