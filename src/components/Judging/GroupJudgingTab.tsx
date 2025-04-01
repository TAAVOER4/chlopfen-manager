
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { mockGroups } from '../../data/mockData';
import { Group, GroupSize } from '../../types';

const GroupJudgingTab: React.FC = () => {
  const [groupCounts, setGroupCounts] = useState<Record<GroupSize, number>>({
    three: 0,
    four: 0
  });
  
  // Count groups by size
  useEffect(() => {
    const counts: Record<GroupSize, number> = { three: 0, four: 0 };
    mockGroups.forEach(group => {
      counts[group.size]++;
    });
    setGroupCounts(counts);
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gruppenbewertung</CardTitle>
        <CardDescription>
          Bewerten Sie die Leistungen der Teilnehmergruppen
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="mb-4">
          Bei der Gruppenbewertung werden folgende Kriterien bewertet:
        </p>
        <ul className="list-disc pl-5 mb-6 space-y-1">
          <li>Schläge (Zeitlimit 45 Sekunden)</li>
          <li>Rhythmus (2 Noten)</li>
          <li>Takt (2 Noten)</li>
        </ul>
        
        <p className="mb-4">Wählen Sie eine Gruppenkategorie für die Bewertung:</p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center">
                <Users className="mr-2 h-5 w-5" />
                Dreiergruppen
              </CardTitle>
              <CardDescription>
                {groupCounts.three} Gruppen
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-2">
              <p className="text-sm text-muted-foreground">
                Drei Teilnehmer pro Gruppe
              </p>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full" disabled={groupCounts.three === 0}>
                <Link to="/judging/group/three">
                  Bewerten
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center">
                <Users className="mr-2 h-5 w-5" />
                Vierergruppen
              </CardTitle>
              <CardDescription>
                {groupCounts.four} Gruppen
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-2">
              <p className="text-sm text-muted-foreground">
                Vier Teilnehmer pro Gruppe
              </p>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full" disabled={groupCounts.four === 0}>
                <Link to="/judging/group/four">
                  Bewerten
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
};

export default GroupJudgingTab;
