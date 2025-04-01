
import { Tournament } from '../types';

// Mock tournament data
export const mockTournaments: Tournament[] = [
  {
    id: 1,
    name: 'Schweizermeisterschaft Chlausjagen 2023',
    date: '2023-12-15',
    location: 'Bern, Kongresszentrum',
    year: 2023,
    isActive: false
  },
  {
    id: 2,
    name: 'Schweizermeisterschaft Chlausjagen 2024',
    date: '2024-12-14',
    location: 'Zürich, Messehalle',
    year: 2024,
    isActive: true
  }
];

// Function to get the active tournament
export const getActiveTournament = (): Tournament | undefined => {
  return mockTournaments.find(tournament => tournament.isActive);
};

// Function to get a tournament by ID
export const getTournamentById = (id: number): Tournament | undefined => {
  return mockTournaments.find(tournament => tournament.id === id);
};

// Function to get tournaments by year
export const getTournamentsByYear = (year: number): Tournament[] => {
  return mockTournaments.filter(tournament => tournament.year === year);
};
