/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Search } from 'lucide-react';
import { Filters } from '../types';

interface FilterBarProps {
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
  uniqueUsersList: string[];
  uniqueAppsList: string[];
}

export const FilterBar: React.FC<FilterBarProps> = ({ filters, setFilters, uniqueUsersList, uniqueAppsList }) => {
  return (
    <div className="bg-white border border-black p-4 flex flex-wrap items-center gap-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
      <div className="flex-1 min-w-[200px] relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input 
          type="text" 
          placeholder="Search user, IP, app, location..."
          className="w-full pl-10 pr-4 py-2 border border-black focus:outline-none focus:ring-1 focus:ring-black"
          value={filters.search}
          onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
        />
      </div>
      
      <div className="flex items-center gap-2">
        <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Status:</span>
        <select 
          className="border border-black px-3 py-2 text-sm focus:outline-none"
          value={filters.status}
          onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
        >
          <option value="All">All Statuses</option>
          <option value="Success">Success</option>
          <option value="Failure">Failure</option>
        </select>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-xs font-bold uppercase tracking-wider text-gray-500">User:</span>
        <select 
          className="border border-black px-3 py-2 text-sm focus:outline-none max-w-[200px]"
          value={filters.user}
          onChange={(e) => setFilters(prev => ({ ...prev, user: e.target.value }))}
        >
          <option value="All">All Users</option>
          {uniqueUsersList.map(u => <option key={u} value={u}>{u}</option>)}
        </select>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-xs font-bold uppercase tracking-wider text-gray-500">App:</span>
        <select 
          className="border border-black px-3 py-2 text-sm focus:outline-none max-w-[200px]"
          value={filters.app}
          onChange={(e) => setFilters(prev => ({ ...prev, app: e.target.value }))}
        >
          <option value="All">All Apps</option>
          {uniqueAppsList.map(a => <option key={a} value={a}>{a}</option>)}
        </select>
      </div>
    </div>
  );
};
