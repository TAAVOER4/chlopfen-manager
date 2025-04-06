
import React from 'react';
import GroupSizeCard from './GroupSizeCard';

interface GroupStats {
  total: number;
  bySize: {
    three: number;
    four: number;
  };
}

interface GroupStatisticsProps {
  groupStats: GroupStats;
}

const GroupStatistics: React.FC<GroupStatisticsProps> = ({ groupStats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      <GroupSizeCard size="three" count={groupStats.bySize.three} />
      <GroupSizeCard size="four" count={groupStats.bySize.four} />
    </div>
  );
};

export default GroupStatistics;
