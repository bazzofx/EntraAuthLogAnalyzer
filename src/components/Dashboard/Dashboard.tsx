/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { StatsGrid } from './StatsGrid';
import { AdvancedCorrelation } from './AdvancedCorrelation';
import { LocationDistribution } from './LocationDistribution';
import { SuccessFailureByLocation } from './SuccessFailureByLocation';
import { TopApplications } from './TopApplications';
import { Stats, TabType, CorrelationTabType, Filters } from '../../types';

interface DashboardProps {
  stats: Stats;
  setActiveTab: (tab: TabType) => void;
  activeCorrelationTab: CorrelationTabType;
  setActiveCorrelationTab: (tab: CorrelationTabType) => void;
  correlationMetrics: any;
  securityMetrics: any;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
  handleTravelAlertClick: (alert: any) => void;
  locationDistribution: { name: string, value: number }[];
  locationSuccessFailure: any[];
  topApps: any[];
  setFlowCountryFilter: (cc: string | null) => void;
  setSelectedUser: (user: string | null) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  stats,
  setActiveTab,
  activeCorrelationTab,
  setActiveCorrelationTab,
  correlationMetrics,
  securityMetrics,
  setFilters,
  handleTravelAlertClick,
  locationDistribution,
  locationSuccessFailure,
  topApps,
  setFlowCountryFilter,
  setSelectedUser
}) => {
  return (
    <div className="space-y-8">
      <StatsGrid stats={stats} setActiveTab={setActiveTab} setFilters={setFilters} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <AdvancedCorrelation 
          activeCorrelationTab={activeCorrelationTab}
          setActiveCorrelationTab={setActiveCorrelationTab}
          correlationMetrics={correlationMetrics}
          securityMetrics={securityMetrics}
          setFilters={setFilters}
          setActiveTab={setActiveTab}
          handleTravelAlertClick={handleTravelAlertClick}
          setSelectedUser={setSelectedUser}
        />

        <div className="space-y-8">
          <LocationDistribution 
            data={locationDistribution} 
            onCountryClick={(country) => {
              setFlowCountryFilter(country === 'Unknown' ? null : country);
              setActiveTab('flow');
            }}
          />
          <SuccessFailureByLocation 
            data={locationSuccessFailure} 
            onCountryClick={(country) => {
              setFlowCountryFilter(country === 'Unknown' ? null : country);
              setActiveTab('flow');
            }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <TopApplications data={topApps} />
        <div className="bg-white border border-black p-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-center">
          <h3 className="text-sm font-bold uppercase tracking-widest mb-4 border-b border-black pb-2 italic">Analyst Quick Actions</h3>
          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => {
                setFilters(f => ({ ...f, status: 'Failure', search: '' }));
                setActiveTab('logs');
              }}
              className="p-4 bg-red-50 border border-red-200 hover:bg-red-100 transition-colors text-left group"
            >
              <div className="text-[10px] font-bold text-red-800 uppercase mb-1">Investigate</div>
              <div className="text-sm font-bold text-red-600 group-hover:underline">All Failures</div>
            </button>
            <button 
              onClick={() => {
                setFilters(f => ({ ...f, search: 'mfa' }));
                setActiveTab('logs');
              }}
              className="p-4 bg-blue-50 border border-blue-200 hover:bg-blue-100 transition-colors text-left group"
            >
              <div className="text-[10px] font-bold text-blue-800 uppercase mb-1">Audit</div>
              <div className="text-sm font-bold text-blue-600 group-hover:underline">MFA Activity</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
