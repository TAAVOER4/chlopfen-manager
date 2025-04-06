
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface GroupSizeCardProps {
  size: 'three' | 'four';
  count: number;
}

const GroupSizeCard: React.FC<GroupSizeCardProps> = ({ size, count }) => {
  const title = size === 'three' ? 'Dreiergruppen' : 'Vierergruppen';
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between">
          <span>{title}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">Anzahl:</div>
          <div className="text-2xl font-bold">{count}</div>
        </div>
      </CardContent>
    </Card>
  );
};

export default GroupSizeCard;
