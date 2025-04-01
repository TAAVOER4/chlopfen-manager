
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types';
import { mockJudges } from '@/data/mockJudges';
import { useToast } from '@/hooks/use-toast';
import { authenticateUser } from '@/utils/authUtils';

interface UserContextType {
  currentUser: User | null;
  isAdmin: boolean;
  isImpersonating: boolean;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  impersonate: (user: User) => void;
  stopImpersonating: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { toast } = useToast();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [originalAdmin, setOriginalAdmin] = useState<User | null>(null);

  // On initial load, check if we have a saved user or are impersonating
  useEffect(() => {
    const savedUserJSON = localStorage.getItem('currentUser');
    const impersonatedUserJSON = localStorage.getItem('impersonatedUser');
    const isAdminMode = localStorage.getItem('adminMode') === 'true';

    if (savedUserJSON) {
      try {
        const savedUser = JSON.parse(savedUserJSON) as User;
        setCurrentUser(savedUser);
        
        if (isAdminMode && impersonatedUserJSON) {
          try {
            const impersonatedUser = JSON.parse(impersonatedUserJSON) as User;
            if (savedUser.id !== impersonatedUser.id) {
              setOriginalAdmin(savedUser);
            }
          } catch (e) {
            console.error('Error parsing impersonated user:', e);
          }
        }
      } catch (e) {
        console.error('Error parsing saved user:', e);
        localStorage.removeItem('currentUser');
      }
    }
  }, []);

  const isAdmin = !!currentUser && currentUser.role === 'admin';
  const isImpersonating = !!originalAdmin;

  const login = (username: string, password: string): boolean => {
    const authenticatedUser = authenticateUser(username, password);
    
    if (authenticatedUser) {
      setCurrentUser(authenticatedUser);
      
      // Store user in localStorage, but without password hash for security
      const userToStore = { ...authenticatedUser };
      delete (userToStore as any).passwordHash;
      
      localStorage.setItem('currentUser', JSON.stringify(userToStore));
      
      toast({
        title: "Anmeldung erfolgreich",
        description: `Willkommen, ${authenticatedUser.name}!`
      });
      
      return true;
    } else {
      toast({
        title: "Anmeldung fehlgeschlagen",
        description: "Falscher Benutzername oder Passwort.",
        variant: "destructive"
      });
      
      return false;
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setOriginalAdmin(null);
    localStorage.removeItem('currentUser');
    localStorage.removeItem('impersonatedUser');
    localStorage.removeItem('adminMode');
    
    toast({
      title: "Abmeldung erfolgreich",
      description: "Sie wurden erfolgreich abgemeldet."
    });
  };

  const impersonate = (user: User) => {
    // Store the admin state to return to later
    if (!originalAdmin && currentUser?.role === 'admin') {
      setOriginalAdmin(currentUser);
      localStorage.setItem('adminMode', 'true');
    }
    
    setCurrentUser(user);
    
    // Store impersonated user in localStorage, but without password hash for security
    const userToStore = { ...user };
    delete (userToStore as any).passwordHash;
    
    localStorage.setItem('impersonatedUser', JSON.stringify(userToStore));
    
    toast({
      title: "Benutzer wechseln",
      description: `Sie agieren jetzt als ${user.name} (${user.role === 'admin' ? 'Administrator' : 'Richter'}).`
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
        login,
        logout,
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
