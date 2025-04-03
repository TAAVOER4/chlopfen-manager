
import { User } from '@/types';

export const useLocalStorage = () => {
  // Save user to localStorage
  const saveUserToLocalStorage = (user: User) => {
    const userToStore = { ...user };
    delete (userToStore as any).passwordHash;
    localStorage.setItem('currentUser', JSON.stringify(userToStore));
  };

  // Save impersonated user to localStorage
  const saveImpersonatedUserToLocalStorage = (user: User) => {
    const userToStore = { ...user };
    delete (userToStore as any).passwordHash;
    localStorage.setItem('impersonatedUser', JSON.stringify(userToStore));
    localStorage.setItem('adminMode', 'true');
  };

  // Load user from localStorage
  const loadUserFromLocalStorage = (): User | null => {
    const savedUserJSON = localStorage.getItem('currentUser');
    if (savedUserJSON) {
      try {
        return JSON.parse(savedUserJSON) as User;
      } catch (e) {
        console.error('Error parsing saved user:', e);
        localStorage.removeItem('currentUser');
      }
    }
    return null;
  };

  // Load impersonated user from localStorage
  const loadImpersonatedUserFromLocalStorage = (): User | null => {
    const impersonatedUserJSON = localStorage.getItem('impersonatedUser');
    const isAdminMode = localStorage.getItem('adminMode') === 'true';
    
    if (isAdminMode && impersonatedUserJSON) {
      try {
        return JSON.parse(impersonatedUserJSON) as User;
      } catch (e) {
        console.error('Error parsing impersonated user:', e);
      }
    }
    return null;
  };

  // Clear user data from localStorage
  const clearUserFromLocalStorage = () => {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('impersonatedUser');
    localStorage.removeItem('adminMode');
  };

  return {
    saveUserToLocalStorage,
    saveImpersonatedUserToLocalStorage,
    loadUserFromLocalStorage,
    loadImpersonatedUserFromLocalStorage,
    clearUserFromLocalStorage,
  };
};
