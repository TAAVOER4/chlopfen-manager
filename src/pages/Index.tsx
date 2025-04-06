
import React from 'react';
import { Spinner } from '@/components/ui/spinner';
import DashboardHeader from '@/components/Dashboard/DashboardHeader';
import StatisticsOverview from '@/components/Dashboard/StatisticsOverview';
import CategoryStatistics from '@/components/Dashboard/CategoryStatistics';
import GroupStatistics from '@/components/Dashboard/GroupStatistics';
import WelcomeCard from '@/components/Dashboard/WelcomeCard';
import QuickAccessCard from '@/components/Dashboard/QuickAccessCard';
import { useDashboardStatistics } from '@/hooks/useDashboardStatistics';

const Index = () => {
  const { isLoading, participantStats, groupStats } = useDashboardStatistics();

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Spinner size="large" className="mx-auto mb-4" />
          <p className="text-lg text-muted-foreground">Lade Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <DashboardHeader />
      
      {/* Overview Statistics */}
      <StatisticsOverview 
        participantStats={participantStats} 
        groupStats={groupStats} 
      />

      {/* Category Statistics */}
      <CategoryStatistics participantStats={participantStats} />

      {/* Group Statistics */}
      <GroupStatistics groupStats={groupStats} />

      {/* Welcome and Quick Access Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <WelcomeCard />
        <QuickAccessCard />
      </div>
    </div>
  );
};

export default Index;
