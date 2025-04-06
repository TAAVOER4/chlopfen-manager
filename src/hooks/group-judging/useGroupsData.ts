
import { useState, useEffect, useCallback } from 'react';
import { Group, GroupSize, GroupCategory } from '../../types';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/contexts/UserContext';
import { GroupService } from '@/services/database/GroupService';
import { useJudgingErrors } from './useJudgingErrors';

export const useGroupsData = (
  size: string | undefined,
  categoryParam: string | null
) => {
  const { toast } = useToast();
  const { currentUser, selectedTournament, isLoading: isUserLoading } = useUser();
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { handleError } = useJudgingErrors();

  // Memoize the fetchGroups function to avoid recreation on every render
  const fetchGroups = useCallback(async () => {
    if (!size || isUserLoading) return;
    
    setIsLoading(true);
    try {
      const groupSize: GroupSize = size === 'three' ? 'three' : 'four';
      
      console.log('Fetching groups from database...');
      const allGroups = await GroupService.getAllGroups();
      
      // Filter groups by size and category
      let filteredGroups = allGroups.filter(group => group.size === groupSize);
      
      // Filter by tournament if available
      if (selectedTournament?.id) {
        filteredGroups = filteredGroups.filter(group => 
          group.tournamentId === selectedTournament.id
        );
      }
      
      // Filter by category if provided
      if (categoryParam && ['kids_juniors', 'active'].includes(categoryParam)) {
        filteredGroups = filteredGroups.filter(
          group => group.category === categoryParam as GroupCategory
        );
      }
      
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
          handleError(error, 'Error parsing stored groups');
          setGroups(filteredGroups);
        }
      } else {
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
    }
  }, [size, categoryParam, selectedTournament, handleError, toast, isUserLoading]);

  // Load groups from database based on size and category
  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  return { 
    groups, 
    isLoading: isLoading || isUserLoading,
    refetchGroups: fetchGroups
  };
};
