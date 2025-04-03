
import { useMemo } from 'react';
import { useUser } from '@/contexts/UserContext';
import { useQuery } from '@tanstack/react-query';
import { DatabaseService } from '@/services/DatabaseService';
import { generateResults, generateGroupResults } from '@/services/ResultsService';
import { Tournament, ScheduleItem } from '@/types';

export const useReportsData = () => {
  const { selectedTournament } = useUser();
  
  // Fetch data from database
  const { data: participants = [] } = useQuery({
    queryKey: ['participants'],
    queryFn: DatabaseService.getAllParticipants,
  });
  
  const { data: groups = [] } = useQuery({
    queryKey: ['groups'],
    queryFn: DatabaseService.getAllGroups,
  });
  
  const { data: individualScores = [] } = useQuery({
    queryKey: ['individualScores'],
    queryFn: DatabaseService.getIndividualScores,
  });
  
  const { data: groupScores = [] } = useQuery({
    queryKey: ['groupScores'],
    queryFn: DatabaseService.getGroupScores,
  });
  
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
  const { data: sponsors = [] } = useQuery({
    queryKey: ['sponsors'],
    // This would ideally come from a DatabaseService.getSponsors method
    // For now, we'll use the mock data
    queryFn: () => Promise.resolve([]), // Empty for now until we implement sponsor fetching
  });
  
  return {
    allIndividualResults,
    groupResults,
    tournamentName,
    tournament,
    mockSchedule,
    participants,
    groups,
    individualScores,
    groupScores,
    sponsors
  };
};
