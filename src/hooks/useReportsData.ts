
import { useMemo } from 'react';
import { useUser } from '@/contexts/UserContext';
import { mockParticipants, mockIndividualScores, mockSponsors, mockGroups, mockGroupScores } from '@/data/mockData';
import { mockTournaments } from '@/data/mockTournaments';
import { generateResults, generateGroupResults } from '@/services/ResultsService';
import { Tournament, ScheduleItem } from '@/types';

export const useReportsData = () => {
  const { selectedTournament } = useUser();
  
  // Generate data for reports
  const allIndividualResults = useMemo(() => ({
    'kids': generateResults('kids', mockParticipants, mockIndividualScores),
    'juniors': generateResults('juniors', mockParticipants, mockIndividualScores),
    'active': generateResults('active', mockParticipants, mockIndividualScores)
  }), []);
  
  const groupResults = useMemo(() => generateGroupResults(mockGroups, mockParticipants, mockGroupScores), []);
  
  const tournamentName = selectedTournament?.name || "Schweiz. Peitschenclub Turnier";
  const tournament = selectedTournament || mockTournaments[0];
  
  // Mock schedule data
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
  
  return {
    allIndividualResults,
    groupResults,
    tournamentName,
    tournament,
    mockSchedule,
    mockParticipants,
    mockGroups,
    mockIndividualScores,
    mockGroupScores,
    mockSponsors
  };
};
