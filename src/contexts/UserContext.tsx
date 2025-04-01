
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Judge } from '@/types';
import { mockJudges } from '@/data/mockJudges';
import { useToast } from '@/hooks/use-toast';

interface UserContextType {
  currentUser: Judge | null;
  isAdmin: boolean;
  isImpersonating: boolean;
  impersonate: (judge: Judge) => void;
  stopImpersonating: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { toast } = useToast();
  const [currentUser, setCurrentUser] = useState<Judge | null>(null);
  const [originalAdmin, setOriginalAdmin] = useState<Judge | null>(null);

  // On initial load, check if we have a saved user or are impersonating
  useEffect(() => {
    const impersonatedUserJSON = localStorage.getItem('impersonatedUser');
    const isAdminMode = localStorage.getItem('adminMode') === 'true';

    if (impersonatedUserJSON) {
      try {
        const impersonatedUser = JSON.parse(impersonatedUserJSON) as Judge;
        setCurrentUser(impersonatedUser);
        
        if (isAdminMode && !originalAdmin) {
          // Find the first admin from mockJudges to use as original admin
          const adminUser = mockJudges.find(j => j.role === 'admin');
          if (adminUser) {
            setOriginalAdmin(adminUser);
          }
        }
      } catch (e) {
        console.error('Error parsing impersonated user:', e);
        localStorage.removeItem('impersonatedUser');
        // Default to the first admin user
        const adminUser = mockJudges.find(j => j.role === 'admin');
        if (adminUser) {
          setCurrentUser(adminUser);
        }
      }
    } else {
      // Default to the first admin user
      const adminUser = mockJudges.find(j => j.role === 'admin');
      if (adminUser) {
        setCurrentUser(adminUser);
      }
    }
  }, []);

  const isAdmin = !!currentUser && currentUser.role === 'admin';
  const isImpersonating = !!originalAdmin;

  const impersonate = (judge: Judge) => {
    // Store the admin state to return to later
    if (!originalAdmin && currentUser?.role === 'admin') {
      setOriginalAdmin(currentUser);
      localStorage.setItem('adminMode', 'true');
    }
    
    setCurrentUser(judge);
    localStorage.setItem('impersonatedUser', JSON.stringify(judge));
    
    toast({
      title: "Benutzer wechseln",
      description: `Sie agieren jetzt als ${judge.name} (${judge.role === 'admin' ? 'Administrator' : 'Richter'}).`
    });
  };

  const stopImpersonating = () => {
    if (originalAdmin) {
      setCurrentUser(originalAdmin);
      setOriginalAdmin(null);
      localStorage.removeItem('adminMode');
      localStorage.removeItem('impersonatedUser');
      
      toast({
        title: "Zurück zum Admin-Modus",
        description: "Sie sind jetzt wieder als Administrator angemeldet."
      });
    }
  };

  return (
    <UserContext.Provider
      value={{
        currentUser,
        isAdmin,
        isImpersonating,
        impersonate,
        stopImpersonating
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
