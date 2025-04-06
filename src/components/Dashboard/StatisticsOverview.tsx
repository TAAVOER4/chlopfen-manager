
import React from 'react';
import { Users, User, UsersRound, Group } from 'lucide-react';
import StatisticsCard from './StatisticsCard';

interface ParticipantStats {
  total: number;
  individual: number;
  groupOnly: number;
  byCategory: Record<string, {
    total: number;
    individual: number;
    groupOnly: number;
  }>;
}

interface GroupStats {
  total: number;
  bySize: {
    three: number;
    four: number;
  };
}

interface StatisticsOverviewProps {
  participantStats: ParticipantStats;
  groupStats: GroupStats;
}

const StatisticsOverview: React.FC<StatisticsOverviewProps> = ({ 
  participantStats, 
  groupStats 
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <StatisticsCard 
        title="Teilnehmer Total" 
        value={participantStats.total} 
        icon={<Users className="h-5 w-5 text-muted-foreground" />} 
      />
      <StatisticsCard 
        title="Einzelwertung" 
        value={participantStats.individual} 
        icon={<User className="h-5 w-5 text-muted-foreground" />} 
      />
      <StatisticsCard 
        title="Nur Gruppe" 
        value={participantStats.groupOnly} 
        icon={<UsersRound className="h-5 w-5 text-muted-foreground" />} 
      />
      <StatisticsCard 
        title="Gruppen Total" 
        value={groupStats.total} 
        icon={<Group className="h-5 w-5 text-muted-foreground" />} 
      />
    </div>
  );
};

export default StatisticsOverview;
