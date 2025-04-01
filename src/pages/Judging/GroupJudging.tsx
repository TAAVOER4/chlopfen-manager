
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Save } from 'lucide-react';
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
import { Group, GroupScore, GroupSize } from '../../types';
import { useToast } from '@/hooks/use-toast';

const GroupJudging: React.FC = () => {
  const { size } = useParams<{ size: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // State for groups and scores
  const [groups, setGroups] = useState<Group[]>([]);
  const [scores, setScores] = useState<Record<string, Partial<GroupScore>>>({});
  const [currentGroupIndex, setCurrentGroupIndex] = useState(0);

  // Validate size parameter
  useEffect(() => {
    if (size !== 'three' && size !== 'four') {
      navigate('/judging');
      toast({
        title: "Fehler",
        description: "Ungültige Gruppengröße",
        variant: "destructive"
      });
    }
  }, [size, navigate, toast]);

  // Filter groups based on size
  useEffect(() => {
    const groupSize: GroupSize = size === 'three' ? 'three' : 'four';
    const filteredGroups = mockGroups.filter(group => group.size === groupSize);
    setGroups(filteredGroups);
    
    // Initialize scores for each group
    const initialScores: Record<string, Partial<GroupScore>> = {};
    filteredGroups.forEach(group => {
      initialScores[group.id] = {
        groupId: group.id,
        whipStrikes: 0,
        rhythm1: 0,
        rhythm2: 0,
        tempo1: 0,
        tempo2: 0,
        timeSeconds: 0
      };
    });
    setScores(initialScores);
  }, [size]);

  const handleScoreChange = (groupId: string, criterion: keyof GroupScore, value: number) => {
    setScores(prev => ({
      ...prev,
      [groupId]: {
        ...prev[groupId],
        [criterion]: value
      }
    }));
  };

  const handleSaveScore = () => {
    const currentGroup = groups[currentGroupIndex];
    if (!currentGroup) return;
    
    toast({
      title: "Bewertung gespeichert",
      description: `Die Bewertung für ${currentGroup.name} wurde gespeichert.`
    });
    
    // Move to next group or back to judging page
    if (currentGroupIndex < groups.length - 1) {
      setCurrentGroupIndex(prev => prev + 1);
    } else {
      navigate('/judging');
    }
  };

  // Return early if no groups found
  if (groups.length === 0) {
    return (
      <div className="animate-fade-in">
        <Button 
          variant="outline" 
          onClick={() => navigate('/judging')} 
          className="mb-4"
        >
          <ChevronLeft className="mr-2 h-4 w-4" /> Zurück
        </Button>
        <Card>
          <CardHeader>
            <CardTitle>Keine Gruppen gefunden</CardTitle>
            <CardDescription>
              Es wurden keine {size === 'three' ? 'Dreier' : 'Vierer'}gruppen gefunden
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const currentGroup = groups[currentGroupIndex];

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-swiss-blue">
          {size === 'three' ? 'Dreiergruppen' : 'Vierergruppen'} Bewertung
        </h1>
        <Button 
          variant="outline" 
          onClick={() => navigate('/judging')} 
        >
          <ChevronLeft className="mr-2 h-4 w-4" /> Zurück
        </Button>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{currentGroup?.name}</CardTitle>
          <CardDescription>
            Gruppe {currentGroupIndex + 1} von {groups.length}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h3 className="font-medium mb-2">Schläge (Zeitlimit 45 Sekunden)</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Anzahl Schläge</label>
                  <input 
                    type="number" 
                    className="w-full mt-1 border rounded-md p-2"
                    value={scores[currentGroup.id]?.whipStrikes || 0}
                    onChange={(e) => handleScoreChange(
                      currentGroup.id, 
                      'whipStrikes', 
                      Number(e.target.value)
                    )}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Zeit (Sekunden)</label>
                  <input 
                    type="number" 
                    className="w-full mt-1 border rounded-md p-2"
                    value={scores[currentGroup.id]?.timeSeconds || 0}
                    onChange={(e) => handleScoreChange(
                      currentGroup.id, 
                      'timeSeconds', 
                      Number(e.target.value)
                    )}
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-2">Rhythmus (2 Noten)</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Rhythmus Note 1</label>
                  <input 
                    type="number" 
                    className="w-full mt-1 border rounded-md p-2"
                    min="0"
                    max="10"
                    step="0.1"
                    value={scores[currentGroup.id]?.rhythm1 || 0}
                    onChange={(e) => handleScoreChange(
                      currentGroup.id, 
                      'rhythm1', 
                      Number(e.target.value)
                    )}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Rhythmus Note 2</label>
                  <input 
                    type="number" 
                    className="w-full mt-1 border rounded-md p-2"
                    min="0"
                    max="10"
                    step="0.1"
                    value={scores[currentGroup.id]?.rhythm2 || 0}
                    onChange={(e) => handleScoreChange(
                      currentGroup.id, 
                      'rhythm2', 
                      Number(e.target.value)
                    )}
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-2">Takt (2 Noten)</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Takt Note 1</label>
                  <input 
                    type="number" 
                    className="w-full mt-1 border rounded-md p-2"
                    min="0"
                    max="10"
                    step="0.1"
                    value={scores[currentGroup.id]?.tempo1 || 0}
                    onChange={(e) => handleScoreChange(
                      currentGroup.id, 
                      'tempo1', 
                      Number(e.target.value)
                    )}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Takt Note 2</label>
                  <input 
                    type="number" 
                    className="w-full mt-1 border rounded-md p-2"
                    min="0"
                    max="10"
                    step="0.1"
                    value={scores[currentGroup.id]?.tempo2 || 0}
                    onChange={(e) => handleScoreChange(
                      currentGroup.id, 
                      'tempo2', 
                      Number(e.target.value)
                    )}
                  />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            className="w-full" 
            onClick={handleSaveScore}
          >
            <Save className="mr-2 h-4 w-4" /> 
            {currentGroupIndex < groups.length - 1 ? 'Speichern und weiter' : 'Speichern und beenden'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default GroupJudging;
