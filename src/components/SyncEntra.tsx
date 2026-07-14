/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { RefreshCw, CheckCircle, AlertCircle, Cloud } from 'lucide-react';
import { AuthLog } from '../types';
import { cn } from '../utils/formatters';

interface SyncEntraProps {
  onSyncComplete: (logs: AuthLog[]) => void;
}

export const SyncEntra: React.FC<SyncEntraProps> = ({ onSyncComplete }) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSync = async () => {
    setIsSyncing(true);
    setStatus('idle');
    setErrorMessage('');

    try {
      const response = await fetch('/api/entra/logs');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to sync with Microsoft Entra');
      }

      onSyncComplete(data);
      setStatus('success');
      setTimeout(() => setStatus('idle'), 3000);
    } catch (error: any) {
      console.error('Sync error:', error);
      setStatus('error');
      setErrorMessage(error.message);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="relative group">
      <button
        onClick={handleSync}
        disabled={isSyncing}
        className={cn(
          "px-4 py-1.5 text-sm font-medium transition-all flex items-center gap-2 border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]",
          isSyncing ? "bg-gray-100 cursor-not-allowed" : "bg-white hover:bg-gray-50",
          status === 'success' && "bg-green-50 border-green-600 text-green-700",
          status === 'error' && "bg-red-50 border-red-600 text-red-700"
        )}
      >
        {isSyncing ? (
          <RefreshCw size={16} className="animate-spin" />
        ) : status === 'success' ? (
          <CheckCircle size={16} />
        ) : status === 'error' ? (
          <AlertCircle size={16} />
        ) : (
          <Cloud size={16} className="text-blue-600" />
        )}
        {isSyncing ? 'Syncing...' : status === 'success' ? 'Synced' : status === 'error' ? 'Error' : 'Sync Entra'}
      </button>

      {status === 'error' && (
        <div className="absolute top-full right-0 mt-2 w-64 p-3 bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] z-50">
          <p className="text-[10px] font-bold text-red-600 uppercase mb-1 flex items-center gap-1">
            <AlertCircle size={12} /> Sync Failed
          </p>
          <p className="text-[10px] text-gray-600 italic leading-tight">
            {errorMessage}
          </p>
          <p className="mt-2 text-[9px] text-gray-400 border-t pt-1">
            Ensure ENTRA_CLIENT_ID, ENTRA_CLIENT_SECRET, and ENTRA_TENANT_ID are set in environment variables.
          </p>
        </div>
      )}
    </div>
  );
};
