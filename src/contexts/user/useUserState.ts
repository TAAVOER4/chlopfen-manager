
import { useEffect } from 'react';
import { User, Tournament } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { useAuthentication } from './hooks/useAuthentication';
import { useTournaments } from './hooks/useTournaments';
import { useUserRoles } from './hooks/useUserRoles';

export const useUserState = () => {
  const { toast } = useToast();
  
  // Authentication hooks
  const {
    currentUser,
    originalAdmin,
    isLoading: authLoading,
    initFromLocalStorage,
    login,
    logout,
    impersonate,
    stopImpersonating
  } = useAuthentication();

  // Tournament hooks
  const {
    availableTournaments,
    selectedTournament,
    isLoading: tournamentsLoading,
    setSelectedTournament
  } = useTournaments(currentUser);

  // User roles hooks
  const {
    isAdmin,
    isJudge,
    isReader,
    isEditor,
    isImpersonating
  } = useUserRoles(currentUser, originalAdmin);

  // Init from localStorage on component mount
  useEffect(() => {
    initFromLocalStorage();
  }, []);

  return {
    // User state
    currentUser,
    originalAdmin,
    
    // Role flags
    isAdmin,
    isJudge,
    isReader,
    isEditor,
    isImpersonating,
    
    // Loading state
    isLoading: authLoading || tournamentsLoading,
    
    // Auth methods
    login,
    logout,
    impersonate,
    stopImpersonating,
    
    // Tournament state
    availableTournaments,
    selectedTournament,
    setSelectedTournament
  };
};
