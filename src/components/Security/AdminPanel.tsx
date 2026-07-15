/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { TabType } from '../../types';
import { 
  ShieldAlert, Plus, Trash2, Globe, MapPin, Users, Network, 
  ArrowLeft, RefreshCw, CheckCircle, HelpCircle 
} from 'lucide-react';

interface AdminPanelProps {
  adminSettings: {
    ipExceptions: string[];
    locationExceptions: [string, string][];
    trustedCountries: string[];
    userExceptions: Record<string, string[]>;
  };
  setAdminSettings: React.Dispatch<React.SetStateAction<{
    ipExceptions: string[];
    locationExceptions: [string, string][];
    trustedCountries: string[];
    userExceptions: Record<string, string[]>;
  }>>;
  setActiveTab: (tab: TabType) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ 
  adminSettings, 
  setAdminSettings, 
  setActiveTab 
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'ip' | 'location' | 'trusted' | 'user'>('ip');
  const [saveStatus, setSaveStatus] = useState<boolean>(false);

  // Form states
  const [newIp, setNewIp] = useState('');
  
  const [newLocA, setNewLocA] = useState('');
  const [newLocB, setNewLocB] = useState('');

  const [newTrusted, setNewTrusted] = useState('');

  const [newUser, setNewUser] = useState('');
  const [newUserCountry, setNewUserCountry] = useState('');

  const triggerSaveNotification = () => {
    setSaveStatus(true);
    setTimeout(() => setSaveStatus(false), 2000);
  };

  // Add/Remove IPs
  const handleAddIp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIp) return;
    setAdminSettings(prev => ({
      ...prev,
      ipExceptions: [...new Set([...prev.ipExceptions, newIp.trim()])]
    }));
    setNewIp('');
    triggerSaveNotification();
  };

  const handleRemoveIp = (ip: string) => {
    setAdminSettings(prev => ({
      ...prev,
      ipExceptions: prev.ipExceptions.filter(item => item !== ip)
    }));
    triggerSaveNotification();
  };

  // Add/Remove Location Exceptions
  const handleAddLocation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLocA || !newLocB) return;
    const a = newLocA.trim().toUpperCase();
    const b = newLocB.trim().toUpperCase();
    
    // Check if duplicate
    const exists = adminSettings.locationExceptions.some(
      pair => (pair[0] === a && pair[1] === b) || (pair[0] === b && pair[1] === a)
    );

    if (!exists) {
      setAdminSettings(prev => ({
        ...prev,
        locationExceptions: [...prev.locationExceptions, [a, b]]
      }));
    }
    setNewLocA('');
    setNewLocB('');
    triggerSaveNotification();
  };

  const handleRemoveLocation = (pairToRemove: [string, string]) => {
    setAdminSettings(prev => ({
      ...prev,
      locationExceptions: prev.locationExceptions.filter(
        pair => !(pair[0] === pairToRemove[0] && pair[1] === pairToRemove[1])
      )
    }));
    triggerSaveNotification();
  };

  // Add/Remove Trusted Countries
  const handleAddTrusted = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTrusted) return;
    const country = newTrusted.trim().toUpperCase();
    setAdminSettings(prev => ({
      ...prev,
      trustedCountries: [...new Set([...prev.trustedCountries, country])]
    }));
    setNewTrusted('');
    triggerSaveNotification();
  };

  const handleRemoveTrusted = (country: string) => {
    setAdminSettings(prev => ({
      ...prev,
      trustedCountries: prev.trustedCountries.filter(item => item !== country)
    }));
    triggerSaveNotification();
  };

  // Add/Remove User Country Exception
  const handleAddUserCountry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser || !newUserCountry) return;
    const email = newUser.trim().toLowerCase();
    const country = newUserCountry.trim().toUpperCase();

    setAdminSettings(prev => {
      const existingCountries = prev.userExceptions[email] || [];
      const updatedCountries = [...new Set([...existingCountries, country])];
      return {
        ...prev,
        userExceptions: {
          ...prev.userExceptions,
          [email]: updatedCountries
        }
      };
    });
    setNewUser('');
    setNewUserCountry('');
    triggerSaveNotification();
  };

  const handleRemoveUserCountry = (email: string, countryToRemove: string) => {
    setAdminSettings(prev => {
      const existingCountries = prev.userExceptions[email] || [];
      const updatedCountries = existingCountries.filter(c => c !== countryToRemove);
      
      const updatedExceptions = { ...prev.userExceptions };
      if (updatedCountries.length === 0) {
        delete updatedExceptions[email];
      } else {
        updatedExceptions[email] = updatedCountries;
      }

      return {
        ...prev,
        userExceptions: updatedExceptions
      };
    });
    triggerSaveNotification();
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border-2 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <div className="flex items-center gap-3">
          <div className="bg-black text-white p-2">
            <ShieldAlert size={24} />
          </div>
          <div>
            <h2 className="text-xl font-black uppercase tracking-tight">Security Admin Control Panel</h2>
            <p className="text-xs text-gray-500 font-mono">ADJUST LOGIC VARIABLES & EXCEPTION LISTS IN REAL TIME</p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {saveStatus && (
            <div className="flex items-center gap-1.5 text-xs text-green-600 font-bold bg-green-50 border border-green-600 px-3 py-1.5">
              <CheckCircle size={14} /> Applied Live
            </div>
          )}
          <button 
            onClick={() => setActiveTab('security')}
            className="w-full sm:w-auto px-4 py-2 bg-white border border-black hover:bg-gray-50 text-xs font-bold uppercase flex items-center justify-center gap-2 transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
          >
            <ArrowLeft size={14} /> Back to Insights
          </button>
        </div>
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Side Sidebar Tab Switchers */}
        <div className="lg:col-span-1 bg-white border-2 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col gap-2">
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pb-2 border-b border-gray-100">
            Configure Logic
          </div>

          <button
            onClick={() => setActiveSubTab('ip')}
            className={`w-full px-4 py-3 text-left border-2 flex items-center gap-3 transition-all ${
              activeSubTab === 'ip' 
                ? 'bg-black text-white border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' 
                : 'bg-white text-black border-transparent hover:bg-gray-50'
            }`}
          >
            <Network size={16} />
            <span className="text-xs font-bold uppercase tracking-wide">IP Whitelists</span>
          </button>

          <button
            onClick={() => setActiveSubTab('location')}
            className={`w-full px-4 py-3 text-left border-2 flex items-center gap-3 transition-all ${
              activeSubTab === 'location' 
                ? 'bg-black text-white border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' 
                : 'bg-white text-black border-transparent hover:bg-gray-50'
            }`}
          >
            <MapPin size={16} />
            <span className="text-xs font-bold uppercase tracking-wide">Travel Exclusions</span>
          </button>

          <button
            onClick={() => setActiveSubTab('trusted')}
            className={`w-full px-4 py-3 text-left border-2 flex items-center gap-3 transition-all ${
              activeSubTab === 'trusted' 
                ? 'bg-black text-white border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' 
                : 'bg-white text-black border-transparent hover:bg-gray-50'
            }`}
          >
            <Globe size={16} />
            <span className="text-xs font-bold uppercase tracking-wide">Trusted Countries</span>
          </button>

          <button
            onClick={() => setActiveSubTab('user')}
            className={`w-full px-4 py-3 text-left border-2 flex items-center gap-3 transition-all ${
              activeSubTab === 'user' 
                ? 'bg-black text-white border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' 
                : 'bg-white text-black border-transparent hover:bg-gray-50'
            }`}
          >
            <Users size={16} />
            <span className="text-xs font-bold uppercase tracking-wide">User Exceptions</span>
          </button>

          <div className="mt-6 p-4 bg-[#F9F9F6] border border-black text-[10px] text-gray-500 space-y-2 leading-relaxed">
            <div className="font-bold flex items-center gap-1 text-black">
              <HelpCircle size={12} /> Dynamic State
            </div>
            <p>All modifications update our metric and analysis calculations immediately. No app reload required.</p>
          </div>
        </div>

        {/* Right Side Working Workspace Area */}
        <div className="lg:col-span-3 bg-white border-2 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] min-h-[400px]">
          
          {/* IP Whitelists Config */}
          {activeSubTab === 'ip' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-md font-black uppercase tracking-tight mb-1">Network & IP Whitelists</h3>
                <p className="text-xs text-gray-500">MFA fatigue and brute force alerts will exclude these IP ranges or static IPs from triggering false positives.</p>
              </div>

              {/* Add form */}
              <form onSubmit={handleAddIp} className="flex gap-3">
                <input
                  type="text"
                  value={newIp}
                  onChange={(e) => setNewIp(e.target.value)}
                  placeholder="e.g., 192.168.1.1 or 10.0.0.0/24"
                  className="flex-1 px-4 py-2 border-2 border-black text-xs font-mono focus:outline-none placeholder:text-gray-400"
                />
                <button 
                  type="submit"
                  className="px-6 py-2 bg-black text-white text-xs font-bold uppercase hover:bg-gray-800 transition-colors flex items-center gap-1.5"
                >
                  <Plus size={14} /> Add IP
                </button>
              </form>

              {/* Existing Items */}
              <div className="space-y-2">
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Active Whitelist ({adminSettings.ipExceptions.length})</div>
                
                {adminSettings.ipExceptions.length === 0 ? (
                  <p className="text-xs text-gray-400 italic py-4">No active IP whitelists. All IPs are currently monitored.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {adminSettings.ipExceptions.map((ip) => (
                      <div key={ip} className="flex justify-between items-center px-4 py-2.5 bg-gray-50 border border-gray-200">
                        <span className="text-xs font-mono font-medium">{ip}</span>
                        <button 
                          onClick={() => handleRemoveIp(ip)}
                          className="text-gray-400 hover:text-red-600 transition-colors p-1"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Travel Exclusions Config */}
          {activeSubTab === 'location' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-md font-black uppercase tracking-tight mb-1">Geographic Travel Exclusions</h3>
                <p className="text-xs text-gray-500">Pairs of countries where travel notifications should be bypassed (e.g., cross-border commuting, secure VPN exit nodes).</p>
              </div>

              {/* Add form */}
              <form onSubmit={handleAddLocation} className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <input
                  type="text"
                  value={newLocA}
                  onChange={(e) => setNewLocA(e.target.value)}
                  placeholder="Country Code A (e.g. US)"
                  className="px-4 py-2 border-2 border-black text-xs font-bold uppercase focus:outline-none placeholder:text-gray-400"
                />
                <input
                  type="text"
                  value={newLocB}
                  onChange={(e) => setNewLocB(e.target.value)}
                  placeholder="Country Code B (e.g. CA)"
                  className="px-4 py-2 border-2 border-black text-xs font-bold uppercase focus:outline-none placeholder:text-gray-400"
                />
                <button 
                  type="submit"
                  className="px-6 py-2 bg-black text-white text-xs font-bold uppercase hover:bg-gray-800 transition-colors flex items-center justify-center gap-1.5"
                >
                  <Plus size={14} /> Add Exclusion
                </button>
              </form>

              {/* Existing Items */}
              <div className="space-y-2">
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Active Exclusions ({adminSettings.locationExceptions.length})</div>
                
                {adminSettings.locationExceptions.length === 0 ? (
                  <p className="text-xs text-gray-400 italic py-4">No exclusions defined. All impossible travel country switches will trigger alerts.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {adminSettings.locationExceptions.map((pair, idx) => (
                      <div key={idx} className="flex justify-between items-center px-4 py-2.5 bg-gray-50 border border-gray-200">
                        <span className="text-xs font-bold tracking-wider flex items-center gap-2">
                          <span className="bg-black text-white text-[10px] px-1.5 py-0.5">{pair[0]}</span>
                          <span className="text-gray-400 font-mono">⟷</span>
                          <span className="bg-black text-white text-[10px] px-1.5 py-0.5">{pair[1]}</span>
                        </span>
                        <button 
                          onClick={() => handleRemoveLocation(pair)}
                          className="text-gray-400 hover:text-red-600 transition-colors p-1"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Trusted Countries Config */}
          {activeSubTab === 'trusted' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-md font-black uppercase tracking-tight mb-1">Trusted Regions</h3>
                <p className="text-xs text-gray-500">Specify countries where normal operations are trusted. Successful access from these countries will be ignored by the Auth Anomaly Monitor.</p>
              </div>

              {/* Add form */}
              <form onSubmit={handleAddTrusted} className="flex gap-3">
                <input
                  type="text"
                  value={newTrusted}
                  onChange={(e) => setNewTrusted(e.target.value)}
                  placeholder="Country Code (e.g. US)"
                  className="flex-1 px-4 py-2 border-2 border-black text-xs font-bold uppercase focus:outline-none placeholder:text-gray-400"
                />
                <button 
                  type="submit"
                  className="px-6 py-2 bg-black text-white text-xs font-bold uppercase hover:bg-gray-800 transition-colors flex items-center gap-1.5"
                >
                  <Plus size={14} /> Trust Country
                </button>
              </form>

              {/* Existing Items */}
              <div className="space-y-2">
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Trusted Countries ({adminSettings.trustedCountries.length})</div>
                
                {adminSettings.trustedCountries.length === 0 ? (
                  <p className="text-xs text-gray-400 italic py-4">No trusted countries configured. All regions are treated as untrusted, triggering anomalies on high-risk application activities.</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {adminSettings.trustedCountries.map((country) => (
                      <div key={country} className="flex items-center gap-2 px-3 py-1.5 bg-black text-white text-xs font-bold">
                        <span>{country}</span>
                        <button 
                          onClick={() => handleRemoveTrusted(country)}
                          className="text-gray-400 hover:text-red-400 transition-colors ml-1"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* User Exceptions Config */}
          {activeSubTab === 'user' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-md font-black uppercase tracking-tight mb-1">User-Specific Exclusions</h3>
                <p className="text-xs text-gray-500">Explicit bypass settings per user. Ignore Impossible Travel alerts for specific users commuting or tunneling from designated regions.</p>
              </div>

              {/* Add form */}
              <form onSubmit={handleAddUserCountry} className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <input
                  type="email"
                  value={newUser}
                  onChange={(e) => setNewUser(e.target.value)}
                  placeholder="User Email (e.g. user@domain.com)"
                  className="px-4 py-2 border-2 border-black text-xs font-medium focus:outline-none placeholder:text-gray-400"
                  required
                />
                <input
                  type="text"
                  value={newUserCountry}
                  onChange={(e) => setNewUserCountry(e.target.value)}
                  placeholder="Allowed Country (e.g. IN)"
                  className="px-4 py-2 border-2 border-black text-xs font-bold uppercase focus:outline-none placeholder:text-gray-400"
                  required
                />
                <button 
                  type="submit"
                  className="px-6 py-2 bg-black text-white text-xs font-bold uppercase hover:bg-gray-800 transition-colors flex items-center justify-center gap-1.5"
                >
                  <Plus size={14} /> Add User Exception
                </button>
              </form>

              {/* Existing Items */}
              <div className="space-y-4">
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest font-mono">Configured Exceptions</div>
                
                {Object.keys(adminSettings.userExceptions).length === 0 ? (
                  <p className="text-xs text-gray-400 italic py-4">No user-specific impossible travel exclusions active.</p>
                ) : (
                  <div className="space-y-3">
                    {Object.entries(adminSettings.userExceptions).map(([email, countries]) => (
                      <div key={email} className="p-4 bg-gray-50 border border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
                        <div>
                          <div className="text-xs font-bold mb-1.5 text-gray-800">{email}</div>
                          <div className="flex flex-wrap gap-1.5">
                            {(countries as string[]).map(c => (
                              <span key={c} className="inline-flex items-center gap-1 text-[10px] font-mono font-bold bg-white border border-gray-300 px-2 py-0.5 rounded">
                                {c}
                                <button 
                                  onClick={() => handleRemoveUserCountry(email, c)}
                                  className="text-gray-400 hover:text-red-600 transition-colors"
                                >
                                  ×
                                </button>
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
