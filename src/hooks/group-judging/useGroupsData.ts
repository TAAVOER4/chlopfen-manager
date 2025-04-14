import { useState, useCallback, useEffect } from 'react';
import { Group, GroupSize, GroupCategory } from '../../types';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/contexts/UserContext';
import { GroupQueryService } from '@/services/database/group';
import { useJudgingErrors } from './useJudgingErrors';

export const useGroupsData = (
  size: string | undefined,
  categoryParam: string | null
) => {
  const { toast } = useToast();
  const { currentUser, selectedTournament, isLoading: isUserLoading } = useUser();
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasAttemptedFetch, setHasAttemptedFetch] = useState(false);
  const { handleError } = useJudgingErrors();

  const fetchGroups = useCallback(async () => {
    if (!size || isUserLoading) {
      console.log("Skipping fetch - missing size or user loading:", { size, isUserLoading });
      return;
    }
    
    console.log('Attempting to fetch groups with size:', size, 'category:', categoryParam);
    setIsLoading(true);
    
    try {
      const groupSize: GroupSize = size === 'three' ? 'three' : 'four';
      
      console.log('Fetching groups from database using GroupQueryService...');
      const allGroups = await GroupQueryService.getAllGroups();
      console.log('All groups fetched:', allGroups.length, 'groups');
      
      if (allGroups.length === 0) {
        console.warn('No groups returned from database');
      }
      
      let filteredGroups = allGroups.filter(group => group.size === groupSize);
      console.log('Filtered by size:', filteredGroups.length, 'groups');
      
      if (selectedTournament?.id) {
        filteredGroups = filteredGroups.filter(group => 
          group.tournamentId === selectedTournament.id
        );
        console.log('Filtered by tournament:', filteredGroups.length, 'groups');
      }
      
      if (categoryParam && ['kids_juniors', 'active'].includes(categoryParam)) {
        filteredGroups = filteredGroups.filter(
          group => group.category === categoryParam as GroupCategory
        );
        console.log('Filtered by category:', filteredGroups.length, 'groups');
      }
      
      const storedGroups = sessionStorage.getItem(`reorderedGroups-${groupSize}-${categoryParam || 'all'}`);
      if (storedGroups) {
        try {
          const parsedGroups: Group[] = JSON.parse(storedGroups);
          const orderedGroups = parsedGroups
            .map(storedGroup => filteredGroups.find(g => g.id === storedGroup.id))
            .filter(Boolean) as Group[];
          
          filteredGroups.forEach(group => {
            if (!orderedGroups.some(g => g.id === group.id)) {
              orderedGroups.push(group);
            }
          });
          
          console.log('Using ordered groups from session storage:', orderedGroups.length, 'groups');
          setGroups(orderedGroups);
        } catch (error) {
          handleError(error, 'Error parsing stored groups');
          setGroups(filteredGroups);
        }
      } else {
        console.log('Using filtered groups directly:', filteredGroups.length, 'groups');
        setGroups(filteredGroups);
      }
    } catch (error) {
      handleError(error, 'Error fetching groups');
      toast({
        title: "Fehler",
        description: "Gruppen konnten nicht geladen werden",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      setHasAttemptedFetch(true);
    }
  }, [size, categoryParam, selectedTournament?.id, handleError, toast, isUserLoading]);

  useEffect(() => {
    if (!hasAttemptedFetch && size) {
      console.log("Initial fetch triggered");
      fetchGroups();
    }
  }, [fetchGroups, hasAttemptedFetch, size]);

  useEffect(() => {
    if (hasAttemptedFetch) {
      console.log("Parameters changed, resetting fetch state");
      setHasAttemptedFetch(false);
    }
  }, [size, categoryParam]);

  return { 
    groups, 
    isLoading: isLoading || isUserLoading,
    refetchGroups: useCallback(() => {
      console.log("Manual refetch triggered");
      setHasAttemptedFetch(false);
      fetchGroups();
    }, [fetchGroups])
  };
};
