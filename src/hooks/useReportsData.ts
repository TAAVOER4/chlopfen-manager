
import { useMemo } from 'react';
import { useUser } from '@/contexts/UserContext';
import { useQuery } from '@tanstack/react-query';
import { DatabaseService } from '@/services/DatabaseService';
import { generateResults, generateGroupResults } from '@/services/ResultsService';
import { Tournament, ScheduleItem, Participant, Group, IndividualScore, GroupScore } from '@/types';
import { Spinner } from '@/components/ui/spinner';

export const useReportsData = () => {
  const { selectedTournament } = useUser();
  
  // Fetch data from database with proper error handling
  const { 
    data: participants = [], 
    isLoading: isLoadingParticipants,
    error: participantsError
  } = useQuery({
    queryKey: ['participants'],
    queryFn: DatabaseService.getAllParticipants,
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  const { 
    data: groups = [],
    isLoading: isLoadingGroups,
    error: groupsError
  } = useQuery({
    queryKey: ['groups'],
    queryFn: DatabaseService.getAllGroups,
    retry: 1,
    staleTime: 5 * 60 * 1000,
  });
  
  const { 
    data: individualScores = [],
    isLoading: isLoadingIndividualScores,
    error: individualScoresError
  } = useQuery({
    queryKey: ['individualScores'],
    queryFn: DatabaseService.getIndividualScores,
    retry: 1,
    staleTime: 5 * 60 * 1000,
  });
  
  const { 
    data: groupScores = [],
    isLoading: isLoadingGroupScores,
    error: groupScoresError
  } = useQuery({
    queryKey: ['groupScores'],
    queryFn: DatabaseService.getGroupScores,
    retry: 1,
    staleTime: 5 * 60 * 1000,
  });
  
  // Log any errors for debugging
  if (participantsError) console.error('Error fetching participants:', participantsError);
  if (groupsError) console.error('Error fetching groups:', groupsError);
  if (individualScoresError) console.error('Error fetching individual scores:', individualScoresError);
  if (groupScoresError) console.error('Error fetching group scores:', groupScoresError);
  
  // Generate results using the fetched data
  const allIndividualResults = useMemo(() => ({
    'kids': generateResults('kids', participants, individualScores),
    'juniors': generateResults('juniors', participants, individualScores),
    'active': generateResults('active', participants, individualScores)
  }), [participants, individualScores]);
  
  const groupResults = useMemo(() => 
    generateGroupResults(groups, participants, groupScores), 
    [groups, participants, groupScores]
  );
  
  const tournamentName = selectedTournament?.name || "Schweiz. Peitschenclub Turnier";
  const tournament = selectedTournament || {
    id: 1,
    name: "Schweiz. Peitschenclub Turnier",
    date: new Date().toISOString().split('T')[0],
    location: "Default Location",
    year: new Date().getFullYear(),
    isActive: true
  };
  
  // Mock schedule data - this could be replaced with data from the database in future
  const mockSchedule: ScheduleItem[] = [
    {
      id: 1,
      tournamentId: tournament.id,
      title: 'Anmeldung',
      description: 'Anmeldung und Ausgabe der Startnummern',
      startTime: '08:00',
      endTime: '09:00',
      type: 'other'
    },
    {
      id: 2,
      tournamentId: tournament.id,
      title: 'Eröffnung',
      description: 'Offizielle Eröffnung des Turniers',
      startTime: '09:15',
      endTime: '09:30',
      type: 'ceremony'
    },
    {
      id: 3,
      tournamentId: tournament.id,
      title: 'Vorrunde Kinder',
      description: 'Erste Runde der Kinderkategorie',
      startTime: '09:45',
      endTime: '10:30',
      category: 'kids',
      type: 'competition'
    }
  ];
  
  // Fetch sponsors
  const { 
    data: sponsors = [],
    isLoading: isLoadingSponsors,
    error: sponsorsError 
  } = useQuery({
    queryKey: ['sponsors'],
    // This would ideally come from a DatabaseService.getSponsors method
    // For now, we'll use the mock data
    queryFn: () => Promise.resolve([]), // Empty for now until we implement sponsor fetching
    retry: 1,
    staleTime: 5 * 60 * 1000,
  });
  
  if (sponsorsError) console.error('Error fetching sponsors:', sponsorsError);
  
  // Determine if any data is still loading
  const isLoading = isLoadingParticipants || isLoadingGroups || 
                    isLoadingIndividualScores || isLoadingGroupScores || 
                    isLoadingSponsors;
  
  return {
    allIndividualResults,
    groupResults,
    tournamentName,
    tournament,
    mockSchedule,
    mockParticipants: participants,
    mockGroups: groups,
    mockIndividualScores: individualScores,
    mockGroupScores: groupScores,
    mockSponsors: sponsors,
    participants,
    groups,
    individualScores,
    groupScores,
    sponsors,
    isLoading,
    hasError: !!(participantsError || groupsError || individualScoresError || groupScoresError || sponsorsError)
  };
};
