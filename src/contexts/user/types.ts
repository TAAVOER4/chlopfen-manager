
import { User, Tournament } from '@/types';

export interface UserContextType {
  currentUser: User | null;
  isAdmin: boolean;
  isJudge: boolean;
  isReader: boolean;
  isEditor: boolean;
  isImpersonating: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  impersonate: (user: User) => void;
  stopImpersonating: () => void;
  availableTournaments: Tournament[];
  selectedTournament: Tournament | null;
  setSelectedTournament: (tournament: Tournament) => void;
}

export interface TournamentContextType {
  tournaments: Tournament[];
  activeTournament: Tournament | null;
  setActiveTournament: (tournament: Tournament) => Promise<void>;
  updateTournament: (tournament: Tournament) => Promise<void>;
  addTournament: (tournament: Tournament) => Promise<void>;
  deleteTournament: (tournamentId: number) => Promise<void>;
  isLoading: boolean;
}
