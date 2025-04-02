
import { User, Tournament } from '@/types';

export interface UserContextType {
  currentUser: User | null;
  isAdmin: boolean;
  isJudge: boolean;
  isReader: boolean;
  isEditor: boolean;
  isImpersonating: boolean;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  impersonate: (user: User) => void;
  stopImpersonating: () => void;
  availableTournaments: Tournament[];
  selectedTournament: Tournament | null;
  setSelectedTournament: (tournament: Tournament | null) => void;
}
