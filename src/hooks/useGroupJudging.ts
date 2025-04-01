
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Group, GroupScore, GroupSize, GroupCriterionKey, Category } from '../types';
import { mockGroups } from '../data/mockData';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/contexts/UserContext';

export const useGroupJudging = (size: string | undefined, categoryParam: string | null) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentUser } = useUser();
  
  // State for groups and scores
  const [groups, setGroups] = useState<Group[]>([]);
  const [scores, setScores] = useState<Record<number, Partial<GroupScore>>>({});
  const [currentGroupIndex, setCurrentGroupIndex] = useState(0);

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

  return {
    groups,
    currentGroupIndex,
    scores,
    canEditCriterion,
    handleScoreChange,
    handleSaveScore,
    setCurrentGroupIndex
  };
};
