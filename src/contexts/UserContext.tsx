
import React, { createContext, useContext, ReactNode } from 'react';
import { UserContextType } from './user/types';
import { useUserState } from './user/useUserState';

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const userState = useUserState();
  
  return (
    <UserContext.Provider
      value={{
        currentUser: userState.currentUser,
        isAdmin: userState.isAdmin,
        isJudge: userState.isJudge,
        isReader: userState.isReader,
        isEditor: userState.isEditor,
        isImpersonating: userState.isImpersonating,
        login: userState.login,
        logout: userState.logout,
        impersonate: userState.impersonate,
        stopImpersonating: userState.stopImpersonating,
        availableTournaments: userState.availableTournaments,
        selectedTournament: userState.selectedTournament,
        setSelectedTournament: userState.setSelectedTournament
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

