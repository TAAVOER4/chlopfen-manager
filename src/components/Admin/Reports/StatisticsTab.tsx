
import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { BarChart2, FileText } from 'lucide-react';
import { Participant, Group, IndividualScore, GroupScore } from '@/types';

interface StatisticsTabProps {
  participants: Participant[];
  groups: Group[];
  individualScores: IndividualScore[];
  groupScores: GroupScore[];
}

export const StatisticsTab: React.FC<StatisticsTabProps> = ({ 
  participants, 
  groups, 
  individualScores, 
  groupScores 
}) => {
  // Calculate max height for the chart based on the highest participant count
  const kidCount = participants.filter(p => p.category === 'kids').length;
  const juniorCount = participants.filter(p => p.category === 'juniors').length;
  const activeCount = participants.filter(p => p.category === 'active').length;
  const maxCount = Math.max(kidCount, juniorCount, activeCount);
  
  // Calculate bar heights as percentages of the maximum value
  const kidHeight = maxCount > 0 ? (kidCount / maxCount) * 160 : 0;
  const juniorHeight = maxCount > 0 ? (juniorCount / maxCount) * 160 : 0;
  const activeHeight = maxCount > 0 ? (activeCount / maxCount) * 160 : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <BarChart2 className="h-5 w-5 mr-2" />
          Turnierstatistiken
        </CardTitle>
        <CardDescription>
          Übersicht über das aktuelle Turnier
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-muted p-4 rounded-md">
            <h3 className="font-medium mb-2">Teilnehmer</h3>
            <p className="text-3xl font-bold">{participants.length}</p>
            <p className="text-sm text-muted-foreground">Gesamt</p>
          </div>
          
          <div className="bg-muted p-4 rounded-md">
            <h3 className="font-medium mb-2">Gruppen</h3>
            <p className="text-3xl font-bold">{groups.length}</p>
            <p className="text-sm text-muted-foreground">Gesamt</p>
          </div>
          
          <div className="bg-muted p-4 rounded-md">
            <h3 className="font-medium mb-2">Bewertungen</h3>
            <p className="text-3xl font-bold">{individualScores.length + groupScores.length}</p>
            <p className="text-sm text-muted-foreground">Gesamt</p>
          </div>
        </div>
        
        <div className="mt-8">
          <h3 className="font-medium mb-4">Teilnehmer pro Kategorie</h3>
          <div className="h-[200px] w-full bg-muted rounded-md flex items-end justify-around p-4 overflow-hidden">
            <div className="flex flex-col items-center">
              <div className="bg-blue-500 w-16 rounded-t-md" style={{ height: `${kidHeight}px` }}></div>
              <p className="mt-2 text-sm">Kinder</p>
              <p className="text-muted-foreground text-xs">{kidCount}</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-green-500 w-16 rounded-t-md" style={{ height: `${juniorHeight}px` }}></div>
              <p className="mt-2 text-sm">Junioren</p>
              <p className="text-muted-foreground text-xs">{juniorCount}</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-red-500 w-16 rounded-t-md" style={{ height: `${activeHeight}px` }}></div>
              <p className="mt-2 text-sm">Aktive</p>
              <p className="text-muted-foreground text-xs">{activeCount}</p>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button>
          <FileText className="h-4 w-4 mr-2" />
          Statistikbericht generieren
        </Button>
      </CardFooter>
    </Card>
  );
};
