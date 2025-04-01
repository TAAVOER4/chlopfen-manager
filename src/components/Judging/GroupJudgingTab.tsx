
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
import { Group, GroupSize, GroupCriterionKey } from '../../types';
import { useUser } from '../../contexts/UserContext';

const GroupJudgingTab: React.FC = () => {
  const [groupCounts, setGroupCounts] = useState<Record<GroupSize, number>>({
    three: 0,
    four: 0
  });
  
  const { currentUser } = useUser();
  const isAdmin = currentUser?.role === 'admin';
  
  // Check if judge can score groups
  const canJudgeGroups = isAdmin || (
    currentUser?.assignedCriteria?.group && 
    ['whipStrikes', 'rhythm', 'tempo', 'time'].includes(currentUser.assignedCriteria.group)
  );
  
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
          <li>Schläge (Note 1-10)</li>
          <li>Rhythmus (Note 1-10)</li>
          <li>Takt (Note 1-10)</li>
          <li>Zeit (Note 1-10)</li>
        </ul>
        
        {!canJudgeGroups && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-yellow-800">
              Sie sind nicht berechtigt, Gruppen zu bewerten. 
              Nur Richter mit den Kriterien Schläge, Rhythmus, Takt oder Zeit können Gruppen bewerten.
            </p>
          </div>
        )}
        
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
              <Button 
                asChild 
                className="w-full" 
                disabled={groupCounts.three === 0 || !canJudgeGroups}
              >
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
              <Button 
                asChild 
                className="w-full" 
                disabled={groupCounts.four === 0 || !canJudgeGroups}
              >
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
