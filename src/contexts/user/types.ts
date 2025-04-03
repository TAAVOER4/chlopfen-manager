
import { User, Tournament } from '@/types';

export interface UserContextType {
  currentUser: User | null;
  isAdmin: boolean;
  isJudge: boolean;
  isReader: boolean;
  isEditor: boolean;
  isImpersonating: boolean;
  login: (username: string, password: string) => Promise<boolean>; // Changed to Promise<boolean>
  logout: () => void;
  impersonate: (user: User) => void;
  stopImpersonating: () => void;
  availableTournaments: Tournament[];
  selectedTournament: Tournament | null;
  setSelectedTournament: (tournament: Tournament | null) => void;
}

// Add TournamentContextType here
export interface TournamentContextType {
  tournaments: Tournament[];
  activeTournament: Tournament | null;
  setActiveTournament: (tournament: Tournament) => void;
  updateTournament: (tournament: Tournament) => void;
  addTournament: (tournament: Tournament) => void;
  deleteTournament: (tournamentId: number) => void;
}
