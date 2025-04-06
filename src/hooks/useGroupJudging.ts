
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Group, GroupScore, GroupSize, GroupCriterionKey, GroupCategory } from '../types';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/contexts/UserContext';
import { GroupService } from '@/services/database/GroupService';
import { ScoreService } from '@/services/database/ScoreService';
import { useMutation } from '@tanstack/react-query';

export const useGroupJudging = (size: string | undefined, categoryParam: string | null) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentUser, selectedTournament } = useUser();
  
  // State for groups and scores
  const [groups, setGroups] = useState<Group[]>([]);
  const [scores, setScores] = useState<Record<number, Partial<GroupScore>>>({});
  const [currentGroupIndex, setCurrentGroupIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Create mutation for saving scores
  const saveScoreMutation = useMutation({
    mutationFn: (score: Omit<GroupScore, 'id'>) => {
      console.log('Submitting score to mutation:', score);
      return ScoreService.createGroupScore(score);
    },
    onSuccess: () => {
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
    },
    onError: (error) => {
      console.error('Error saving score:', error);
      toast({
        title: "Fehler",
        description: "Die Bewertung konnte nicht gespeichert werden.",
        variant: "destructive"
      });
    }
  });

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
    if (categoryParam && !['kids_juniors', 'active'].includes(categoryParam)) {
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

  // Load groups from database based on size and category
  useEffect(() => {
    const fetchGroups = async () => {
      if (!size) return;
      
      setIsLoading(true);
      try {
        const groupSize: GroupSize = size === 'three' ? 'three' : 'four';
        
        // Fetch all groups from the database
        const allGroups = await GroupService.getAllGroups();
        console.log('Fetched groups from database:', allGroups);
        
        // Filter groups by size and category
        let filteredGroups = allGroups.filter(group => group.size === groupSize);
        
        // Filter by category if provided
        if (categoryParam && ['kids_juniors', 'active'].includes(categoryParam)) {
          filteredGroups = filteredGroups.filter(
            group => group.category === categoryParam as GroupCategory
          );
        }
        
        console.log('Filtered groups:', filteredGroups);
        
        // Use reordered groups from session storage if available
        const storedGroups = sessionStorage.getItem(`reorderedGroups-${groupSize}-${categoryParam || 'all'}`);
        if (storedGroups) {
          try {
            const parsedGroups: Group[] = JSON.parse(storedGroups);
            // Find the actual database group objects that match the stored order
            const orderedGroups = parsedGroups
              .map(storedGroup => filteredGroups.find(g => g.id === storedGroup.id))
              .filter(Boolean) as Group[];
            
            // Add any new groups that might not be in storage yet
            filteredGroups.forEach(group => {
              if (!orderedGroups.some(g => g.id === group.id)) {
                orderedGroups.push(group);
              }
            });
            
            setGroups(orderedGroups);
          } catch (error) {
            console.error('Error parsing stored groups:', error);
            setGroups(filteredGroups);
          }
        } else {
          setGroups(filteredGroups);
        }
        
        // Initialize scores for each group
        const initialScores: Record<number, Partial<GroupScore>> = {};
        filteredGroups.forEach(group => {
          initialScores[group.id] = {
            groupId: group.id,
            judgeId: currentUser?.id,
            whipStrikes: 0,
            rhythm: 0,
            tempo: 0,
            time: true,
            tournamentId: selectedTournament?.id || group.tournamentId
          };
        });
        setScores(initialScores);
        
      } catch (error) {
        console.error('Error fetching groups:', error);
        toast({
          title: "Fehler",
          description: "Gruppen konnten nicht geladen werden",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchGroups();
  }, [size, categoryParam, currentUser, toast, selectedTournament]);

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

  const handleSaveScore = async () => {
    const currentGroup = groups[currentGroupIndex];
    if (!currentGroup || !currentUser?.id) return;
    
    const currentScore = scores[currentGroup.id];
    if (!currentScore) return;
    
    // Prepare score data for saving
    const scoreData: Omit<GroupScore, 'id'> = {
      groupId: currentGroup.id,
      judgeId: currentUser.id,
      whipStrikes: currentScore.whipStrikes || 0,
      rhythm: currentScore.rhythm || 0,
      tempo: currentScore.tempo || 0,
      time: currentScore.time !== undefined ? currentScore.time : true,
      tournamentId: selectedTournament?.id || currentGroup.tournamentId
    };
    
    console.log('Saving score data:', scoreData);
    
    // Save score to database
    saveScoreMutation.mutate(scoreData);
  };

  return {
    groups,
    currentGroupIndex,
    scores,
    canEditCriterion,
    handleScoreChange,
    handleSaveScore,
    setCurrentGroupIndex,
    isLoading
  };
};
