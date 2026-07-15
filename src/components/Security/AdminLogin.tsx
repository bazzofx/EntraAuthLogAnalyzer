/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Shield, Lock, User, AlertCircle, ArrowLeft } from 'lucide-react';
import { TabType } from '../../types';

interface AdminLoginProps {
  onLoginSuccess: () => void;
  setActiveTab: (tab: TabType) => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess, setActiveTab }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Simple local auth check for testing
    if (username === 'admin' && password === 'password123') {
      onLoginSuccess();
    } else {
      setError('Invalid username or password. Use admin / password123 for testing.');
    }
  };

  return (
    <div className="max-w-md mx-auto my-12">
      <button 
        onClick={() => setActiveTab('dashboard')}
        className="mb-6 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-500 hover:text-black transition-colors"
      >
        <ArrowLeft size={14} /> Back to Dashboard
      </button>

      <div className="bg-white border-2 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-black text-white p-2">
            <Shield size={24} />
          </div>
          <div>
            <h2 className="text-xl font-black uppercase tracking-tight">Admin Gate</h2>
            <p className="text-xs text-gray-500 font-mono">AUTHENTICATION REQUIRED</p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-2 border-red-600 text-red-700 text-xs font-medium flex items-start gap-2 leading-relaxed shadow-[4px_4px_0px_0px_rgba(220,38,38,0.2)]">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">Username</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                <User size={16} />
              </span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                className="w-full pl-10 pr-4 py-2 border-2 border-black font-medium focus:outline-none focus:ring-0 focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-shadow placeholder:text-gray-400"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                <Lock size={16} />
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2 border-2 border-black font-medium focus:outline-none focus:ring-0 focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-shadow placeholder:text-gray-400"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-black hover:bg-gray-800 text-white font-bold uppercase tracking-widest text-xs transition-colors shadow-[4px_4px_0px_0px_rgba(150,150,150,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[2px_2px_0px_0px_rgba(150,150,150,1)]"
          >
            Authenticate
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-gray-100 flex justify-between items-center text-[10px] text-gray-400 font-mono">
          <span>LOCAL TEST MODE</span>
          <span>CREDS: admin / password123</span>
        </div>
      </div>
    </div>
  );
};
