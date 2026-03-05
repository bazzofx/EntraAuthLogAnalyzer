/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { SecurityOverview } from './SecurityOverview';
import { HighRiskTables } from './HighRiskTables';
import { ImpossibleTravelAlerts } from './ImpossibleTravelAlerts';
import { HourlyActivityChart } from './HourlyActivityChart';
import { RareUserAgents } from './RareUserAgents';
import { NewEntityFlagging } from './NewEntityFlagging';
import { BrowserOSIntegrity } from './BrowserOSIntegrity';
import { MFAPatternAnalysis } from './MFAPatternAnalysis';
import { HighRiskAppMonitor } from './HighRiskAppMonitor';
import { TabType, Filters } from '../../types';

interface SecurityInsightsProps {
  securityMetrics: any;
  setActiveTab: (tab: TabType) => void;
  setSelectedHour: (hour: number | null) => void;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
  handleTravelAlertClick: (alert: any) => void;
}

export const SecurityInsights: React.FC<SecurityInsightsProps> = ({
  securityMetrics,
  setActiveTab,
  setSelectedHour,
  setFilters,
  handleTravelAlertClick
}) => {
  return (
    <div className="space-y-8">
      <SecurityOverview 
        securityMetrics={securityMetrics} 
        setActiveTab={setActiveTab} 
        setSelectedHour={setSelectedHour} 
      />

      <HighRiskTables 
        securityMetrics={securityMetrics} 
        setFilters={setFilters} 
      />

      <HighRiskAppMonitor 
        highRiskAppSignins={securityMetrics.highRiskAppSignins || []}
        setFilters={setFilters}
        setActiveTab={setActiveTab}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <ImpossibleTravelAlerts 
          impossibleTravel={securityMetrics.impossibleTravel} 
          handleTravelAlertClick={handleTravelAlertClick} 
        />
        <div className="lg:col-span-2">
          <HourlyActivityChart 
            hourlyData={securityMetrics.hourlyData} 
            setSelectedHour={setSelectedHour} 
            setActiveTab={setActiveTab} 
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <RareUserAgents rareUAs={securityMetrics.rareUAs} />
        <NewEntityFlagging 
          newEntityAlerts={securityMetrics.newEntityAlerts} 
          setFilters={setFilters} 
          setActiveTab={setActiveTab} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <BrowserOSIntegrity uaData={securityMetrics.rareUAs} />
        <div className="lg:col-span-2">
          <MFAPatternAnalysis 
            securityMetrics={securityMetrics} 
            setFilters={setFilters} 
          />
        </div>
      </div>
    </div>
  );
};
