
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface StatisticsCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
}

const StatisticsCard: React.FC<StatisticsCardProps> = ({ title, value, icon }) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold">{value}</div>
          {icon}
        </div>
      </CardContent>
    </Card>
  );
};

export default StatisticsCard;
