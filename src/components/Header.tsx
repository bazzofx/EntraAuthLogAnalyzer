/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Shield, LayoutDashboard, Share2, List, Upload, RotateCcw } from 'lucide-react';
import { cn } from '../utils/formatters';
import { TabType } from '../types';

interface HeaderProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  clearFilters: () => void;
  handleFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, clearFilters, handleFileUpload }) => {
  return (
    <header className="bg-white border-b border-black sticky top-0 z-10">
      <div className="max-w-[1600px] mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="bg-black text-white p-1.5">
            <Shield size={20} />
          </div>
          <h1 className="font-bold text-lg tracking-tight">AuthLog Analyzer</h1>
        </div>
        
        <div className="flex items-center gap-4">
          <nav className="flex bg-[#E4E3E0] p-1 border border-black">
            <button 
              onClick={() => setActiveTab('dashboard')}
              className={cn(
                "px-4 py-1.5 text-sm font-medium transition-colors flex items-center gap-2",
                activeTab === 'dashboard' ? "bg-white border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]" : "hover:bg-white/50"
              )}
            >
              <LayoutDashboard size={16} />
              Dashboard
            </button>
            <button 
              onClick={() => setActiveTab('flow')}
              className={cn(
                "px-4 py-1.5 text-sm font-medium transition-colors flex items-center gap-2",
                activeTab === 'flow' ? "bg-white border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]" : "hover:bg-white/50"
              )}
            >
              <Share2 size={16} />
              Auth Flow
            </button>
            <button 
              onClick={() => setActiveTab('security')}
              className={cn(
                "px-4 py-1.5 text-sm font-medium transition-colors flex items-center gap-2",
                activeTab === 'security' ? "bg-white border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]" : "hover:bg-white/50"
              )}
            >
              <Shield size={16} className="text-red-600" />
              Security Insights
            </button>
            <button 
              onClick={() => setActiveTab('logs')}
              className={cn(
                "px-4 py-1.5 text-sm font-medium transition-colors flex items-center gap-2",
                activeTab === 'logs' ? "bg-white border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]" : "hover:bg-white/50"
              )}
            >
              <List size={16} />
              Raw Logs
            </button>
          </nav>
          
          <button 
            onClick={clearFilters}
            className="px-4 py-1.5 bg-white border border-black text-sm font-medium hover:bg-gray-100 transition-colors flex items-center gap-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
          >
            <RotateCcw size={16} />
            Clear
          </button>

          <label className="cursor-pointer">
            <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
            <div className="px-4 py-1.5 bg-black text-white text-sm font-medium hover:bg-gray-800 transition-colors flex items-center gap-2">
              <Upload size={16} />
              New File
            </div>
          </label>
        </div>
      </div>
    </header>
  );
};
