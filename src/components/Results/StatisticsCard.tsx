
import React from 'react';
import { TrendingUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Participant } from '../../types';

interface StatisticsCardProps {
  participants: Participant[];
  individualScoresCount: number;
}

const StatisticsCard: React.FC<StatisticsCardProps> = ({ participants, individualScoresCount }) => {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center">
          <TrendingUp className="h-5 w-5 mr-2" />
          Statistiken
        </CardTitle>
        <CardDescription>
          Allgemeine Statistiken zum Wettkampf
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Teilnehmer gesamt</p>
            <p className="text-2xl font-bold">{participants.length}</p>
          </div>
          
          <div>
            <p className="text-sm font-medium text-muted-foreground">Kids</p>
            <p className="text-2xl font-bold">
              {participants.filter(p => p.category === 'kids').length}
            </p>
          </div>
          
          <div>
            <p className="text-sm font-medium text-muted-foreground">Junioren</p>
            <p className="text-2xl font-bold">
              {participants.filter(p => p.category === 'juniors').length}
            </p>
          </div>
          
          <div>
            <p className="text-sm font-medium text-muted-foreground">Aktive</p>
            <p className="text-2xl font-bold">
              {participants.filter(p => p.category === 'active').length}
            </p>
          </div>
          
          <div>
            <p className="text-sm font-medium text-muted-foreground">Bewertungen</p>
            <p className="text-2xl font-bold">{individualScoresCount}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatisticsCard;
