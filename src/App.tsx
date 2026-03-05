/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useCallback } from 'react';
import Papa from 'papaparse';
import { 
  Upload
} from 'lucide-react';
import { Header } from './components/Header';
import { FilterBar } from './components/FilterBar';
import { Dashboard } from './components/Dashboard/Dashboard';
import { SecurityInsights } from './components/Security/SecurityInsights';
import { RawLogsTable } from './components/RawLogsTable';
import { AuthFlowMap } from './components/AuthFlowMap';
import { UserDetail } from './components/Details/UserDetail';
import { AppDetail } from './components/Details/AppDetail';
import { TravelDetail } from './components/Details/TravelDetail';
import { HourlyDetail } from './components/Details/HourlyDetail';
import { AnomalyDetail } from './components/Security/AnomalyDetail';
import { useAuthMetrics } from './hooks/useAuthMetrics';
import { AuthLog, Filters, TabType, CorrelationTabType } from './types';

export default function App() {
  const [logs, setLogs] = useState<AuthLog[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [activeCorrelationTab, setActiveCorrelationTab] = useState<CorrelationTabType>('temporal');
  const [selectedTravelAlert, setSelectedTravelAlert] = useState<any>(null);
  const [selectedHour, setSelectedHour] = useState<number | null>(null);
  const [selectedApp, setSelectedApp] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [selectedAnomaly, setSelectedAnomaly] = useState<any>(null);
  const [flowCountryFilter, setFlowCountryFilter] = useState<string | null>(null);
  const [hideFalsePositives, setHideFalsePositives] = useState(false);
  const [impossibleTravelFilter, setImpossibleTravelFilter] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    search: '',
    status: 'All',
    user: 'All',
    app: 'All'
  });

  const clearFilters = useCallback(() => {
    setFilters({
      search: '',
      status: 'All',
      user: 'All',
      app: 'All'
    });
    setFlowCountryFilter(null);
    setSelectedApp(null);
    setSelectedUser(null);
  }, []);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const parsedLogs: AuthLog[] = results.data.map((row: any) => ({
          date: row['Date (UTC)'] || '',
          requestId: row['Request ID'] || '',
          user: row['User'] || '',
          username: row['Username'] || '',
          application: row['Application'] || '',
          ipAddress: row['IP address'] || '',
          location: row['Location'] || '',
          status: row['Status'] || '',
          failureReason: row['Failure reason'] || '',
          browser: row['Browser'] || '',
          os: row['Operating System'] || '',
          mfaResult: row['Multifactor authentication result'] || '',
          authRequirement: row['Authentication requirement'] || '',
          userAgent: row['User agent'] || '',
          latency: parseInt(row['Latency']) || 0,
          ...row
        }));
        setLogs(parsedLogs);
        setIsUploading(false);
      },
      error: (error) => {
        console.error('Error parsing CSV:', error);
        setIsUploading(false);
      }
    });
  };

  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const matchesSearch = 
        log.user.toLowerCase().includes(filters.search.toLowerCase()) ||
        log.username.toLowerCase().includes(filters.search.toLowerCase()) ||
        log.ipAddress.toLowerCase().includes(filters.search.toLowerCase()) ||
        log.application.toLowerCase().includes(filters.search.toLowerCase()) ||
        log.location.toLowerCase().includes(filters.search.toLowerCase()) ||
        (log.mfaResult || '').toLowerCase().includes(filters.search.toLowerCase()) ||
        (log.authRequirement || '').toLowerCase().includes(filters.search.toLowerCase()) ||
        (log.userAgent || '').toLowerCase().includes(filters.search.toLowerCase());
      
      const matchesStatus = filters.status === 'All' || log.status === filters.status;
      const matchesUser = filters.user === 'All' || log.user === filters.user;
      const matchesApp = filters.app === 'All' || log.application === filters.app;

      return matchesSearch && matchesStatus && matchesUser && matchesApp;
    });
  }, [logs, filters]);

  const {
    stats,
    securityMetrics,
    correlationMetrics,
    locationDistribution,
    locationSuccessFailure,
    topApps,
    uniqueUsersList,
    uniqueAppsList,
    uniqueCountries,
    usersWithMultiCountrySuccess
  } = useAuthMetrics(filteredLogs, logs);

  const handleTravelAlertClick = (alert: any) => {
    setSelectedTravelAlert(alert);
    setActiveTab('travel-detail');
  };

  return (
    <div className="min-h-screen bg-[#F5F5F0] text-black font-sans selection:bg-black selection:text-white">
      <Header 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        clearFilters={clearFilters} 
        handleFileUpload={handleFileUpload} 
      />

      <main className="max-w-[1600px] mx-auto px-6 py-8 space-y-8">
        {logs.length === 0 ? (
          <div className="h-[60vh] flex flex-col items-center justify-center border-2 border-dashed border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <div className="bg-black text-white p-4 mb-6">
              <Upload size={48} />
            </div>
            <h2 className="text-2xl font-bold mb-2 tracking-tight">No Data Loaded</h2>
            <p className="text-gray-500 mb-8 italic">Upload an Azure AD Interactive Sign-in logs CSV to begin analysis.</p>
            <label className="cursor-pointer">
              <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
              <div className="px-8 py-3 bg-black text-white font-bold hover:bg-gray-800 transition-colors shadow-[4px_4px_0px_0px_rgba(100,100,100,1)]">
                Select CSV File
              </div>
            </label>
          </div>
        ) : (
          <>
            <FilterBar 
              filters={filters} 
              setFilters={setFilters} 
              uniqueUsersList={uniqueUsersList} 
              uniqueAppsList={uniqueAppsList} 
            />

            {activeTab === 'dashboard' ? (
              <Dashboard 
                stats={stats}
                setActiveTab={setActiveTab}
                activeCorrelationTab={activeCorrelationTab}
                setActiveCorrelationTab={setActiveCorrelationTab}
                correlationMetrics={correlationMetrics}
                securityMetrics={securityMetrics}
                setFilters={setFilters}
                handleTravelAlertClick={handleTravelAlertClick}
                locationDistribution={locationDistribution}
                locationSuccessFailure={locationSuccessFailure}
                topApps={topApps}
                setFlowCountryFilter={setFlowCountryFilter}
                setSelectedUser={setSelectedUser}
              />
            ) : activeTab === 'security' ? (
              <SecurityInsights 
                securityMetrics={securityMetrics}
                setActiveTab={setActiveTab}
                setSelectedHour={setSelectedHour}
                setFilters={setFilters}
                handleTravelAlertClick={handleTravelAlertClick}
                setSelectedAnomaly={setSelectedAnomaly}
              />
            ) : activeTab === 'anomaly-detail' ? (
              <AnomalyDetail 
                setActiveTab={setActiveTab}
                selectedAnomaly={selectedAnomaly}
              />
            ) : activeTab === 'logs' ? (
              <RawLogsTable 
                logs={filteredLogs}
                hideFalsePositives={hideFalsePositives}
                setHideFalsePositives={setHideFalsePositives}
                onUserClick={(user) => {
                  setSelectedUser(user);
                  setActiveTab('user-detail');
                }}
              />
            ) : activeTab === 'flow' ? (
              <AuthFlowMap 
                filteredLogs={filteredLogs}
                flowCountryFilter={flowCountryFilter}
                setFlowCountryFilter={setFlowCountryFilter}
                uniqueCountries={uniqueCountries}
              />
            ) : activeTab === 'app-detail' ? (
              <AppDetail 
                setActiveTab={setActiveTab}
                selectedApp={selectedApp}
                setSelectedApp={setSelectedApp}
                uniqueAppsList={uniqueAppsList}
                filteredLogs={filteredLogs}
              />
            ) : activeTab === 'user-detail' ? (
              <UserDetail 
                setActiveTab={setActiveTab}
                selectedUser={selectedUser}
                setSelectedUser={setSelectedUser}
                uniqueUsersList={uniqueUsersList}
                allLogs={logs}
                securityMetrics={securityMetrics}
              />
            ) : activeTab === 'travel-detail' ? (
              <TravelDetail 
                setActiveTab={setActiveTab}
                selectedTravelAlert={selectedTravelAlert}
              />
            ) : activeTab === 'hourly-detail' ? (
              <HourlyDetail 
                setActiveTab={setActiveTab}
                selectedHour={selectedHour}
                hideFalsePositives={hideFalsePositives}
                filteredLogs={filteredLogs}
                impossibleTravelFilter={impossibleTravelFilter}
                setImpossibleTravelFilter={setImpossibleTravelFilter}
                usersWithMultiCountrySuccess={usersWithMultiCountrySuccess}
              />
            ) : null}
          </>
        )}
      </main>

      {isUploading && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white border-2 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="font-bold uppercase tracking-widest">Processing Logs...</p>
          </div>
        </div>
      )}
    </div>
  );
}
