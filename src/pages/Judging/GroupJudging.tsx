import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
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
import { Input } from '@/components/ui/input';
import { mockGroups } from '../../data/mockData';
import { Group, GroupScore, GroupSize, GroupCriterionKey, Category } from '../../types';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/contexts/UserContext';
import { getCategoryDisplay } from '@/utils/categoryUtils';

const GroupJudging: React.FC = () => {
  const { size } = useParams<{ size: string }>();
  const [searchParams] = useSearchParams();
  const categoryParam = searchParams.get('category');
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentUser } = useUser();
  const location = useLocation();
  
  // State for groups and scores
  const [groups, setGroups] = useState<Group[]>([]);
  const [scores, setScores] = useState<Record<number, Partial<GroupScore>>>({});
  const [currentGroupIndex, setCurrentGroupIndex] = useState(0);

  // Navigate back to judging page with group tab selected
  const handleBackClick = () => {
    navigate('/judging', { 
      state: { from: 'groupJudging' } 
    });
  };

  // Validate size parameter and check if user is authorized
  useEffect(() => {
    if (size !== 'three' && size !== 'four') {
      navigate('/judging');
      toast({
        title: "Fehler",
        description: "Ungültige Gruppengröße",
        variant: "destructive"
      });
      return;
    }

    // Validate category parameter
    if (!['kids', 'juniors', 'active'].includes(categoryParam || '')) {
      toast({
        title: "Hinweis",
        description: "Keine Kategorie ausgewählt, alle Kategorien werden angezeigt"
      });
    }

    // Check if user is authorized to judge
    if (!currentUser) {
      navigate('/judging');
      toast({
        title: "Fehler",
        description: "Sie sind nicht angemeldet",
        variant: "destructive"
      });
      return;
    }

    // Check if user has the right assignedCriteria for group judging
    const validGroupCriteria: GroupCriterionKey[] = ['whipStrikes', 'rhythm', 'tempo'];
    if (currentUser.role !== 'admin' && 
        (!currentUser.assignedCriteria?.group || 
         !validGroupCriteria.includes(currentUser.assignedCriteria.group))) {
      navigate('/judging');
      toast({
        title: "Zugriff verweigert",
        description: "Sie sind nicht berechtigt, Gruppen zu bewerten",
        variant: "destructive"
      });
    }
  }, [size, categoryParam, navigate, toast, currentUser]);

  // Filter groups based on size and category
  useEffect(() => {
    if (!size) return;
    
    const groupSize: GroupSize = size === 'three' ? 'three' : 'four';
    let filteredGroups = mockGroups.filter(group => group.size === groupSize);
    
    // Filter by category if provided
    if (categoryParam && ['kids', 'juniors', 'active'].includes(categoryParam)) {
      filteredGroups = filteredGroups.filter(
        group => group.category === categoryParam as Category
      );
    }
    
    setGroups(filteredGroups);
    
    // Initialize scores for each group
    const initialScores: Record<number, Partial<GroupScore>> = {};
    filteredGroups.forEach(group => {
      initialScores[group.id] = {
        groupId: group.id,
        judgeId: currentUser?.id,
        whipStrikes: 0,
        rhythm: 0,
        tempo: 0
      };
    });
    setScores(initialScores);
  }, [size, categoryParam, currentUser]);

  // Determine if current user can edit a specific criterion
  const canEditCriterion = (criterion: GroupCriterionKey): boolean => {
    // Admins can edit all criteria
    if (currentUser?.role === 'admin') return true;
    
    // Judges can only edit their assigned criterion
    return currentUser?.assignedCriteria?.group === criterion;
  };

  const handleScoreChange = (groupId: number, criterion: keyof Omit<GroupScore, 'groupId' | 'judgeId' | 'time'>, value: number) => {
    // Clamp value between 1 and 10
    const clampedValue = Math.max(1, Math.min(10, value));
    
    setScores(prev => ({
      ...prev,
      [groupId]: {
        ...prev[groupId],
        [criterion]: clampedValue
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
          onClick={handleBackClick} 
          className="mb-4"
        >
          <ChevronLeft className="mr-2 h-4 w-4" /> Zurück
        </Button>
        <Card>
          <CardHeader>
            <CardTitle>Keine Gruppen gefunden</CardTitle>
            <CardDescription>
              Es wurden keine {size === 'three' ? 'Dreier' : 'Vierer'}gruppen 
              {categoryParam ? ` in der Kategorie ${getCategoryDisplay(categoryParam as Category)}` : ''} gefunden
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const currentGroup = groups[currentGroupIndex];
  const categoryName = categoryParam ? 
    getCategoryDisplay(categoryParam as Category) : 
    getCategoryDisplay(currentGroup.category);

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-swiss-blue">
          {categoryName} - {size === 'three' ? 'Dreiergruppen' : 'Vierergruppen'} Bewertung
        </h1>
        <Button 
          variant="outline" 
          onClick={handleBackClick} 
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
              <h3 className="font-medium mb-2">1. Schläge (Note 1-10)</h3>
              <div>
                <label className="text-sm font-medium">Schläge Bewertung</label>
                <Input 
                  type="number" 
                  className="w-full mt-1"
                  min="1"
                  max="10"
                  step="0.1"
                  value={scores[currentGroup.id]?.whipStrikes || 1}
                  onChange={(e) => handleScoreChange(
                    currentGroup.id, 
                    'whipStrikes', 
                    Number(e.target.value)
                  )}
                  disabled={!canEditCriterion('whipStrikes')}
                />
                {!canEditCriterion('whipStrikes') && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Sie können dieses Kriterium nicht bewerten
                  </p>
                )}
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-2">2. Rhythmus (Note 1-10)</h3>
              <div>
                <label className="text-sm font-medium">Rhythmus Bewertung</label>
                <p className="text-xs text-muted-foreground mb-1">
                  Anfang bis Ende, gleich schnell und laut
                </p>
                <Input 
                  type="number" 
                  className="w-full mt-1"
                  min="1"
                  max="10"
                  step="0.1"
                  value={scores[currentGroup.id]?.rhythm || 1}
                  onChange={(e) => handleScoreChange(
                    currentGroup.id, 
                    'rhythm', 
                    Number(e.target.value)
                  )}
                  disabled={!canEditCriterion('rhythm')}
                />
                {!canEditCriterion('rhythm') && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Sie können dieses Kriterium nicht bewerten
                  </p>
                )}
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-2">3. Takt (Note 1-10)</h3>
              <div>
                <label className="text-sm font-medium">Takt Bewertung</label>
                <p className="text-xs text-muted-foreground mb-1">
                  Gleiche Taktgeschwindigkeit vom Anfang bis zum Schluss
                </p>
                <Input 
                  type="number" 
                  className="w-full mt-1"
                  min="1"
                  max="10"
                  step="0.1"
                  value={scores[currentGroup.id]?.tempo || 1}
                  onChange={(e) => handleScoreChange(
                    currentGroup.id, 
                    'tempo', 
                    Number(e.target.value)
                  )}
                  disabled={!canEditCriterion('tempo')}
                />
                {!canEditCriterion('tempo') && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Sie können dieses Kriterium nicht bewerten
                  </p>
                )}
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
