
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
