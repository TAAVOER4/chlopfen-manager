
import { User } from '@/types';
import { mockJudges, updateMockJudges } from '@/data/mockJudges';

// Diese Funktion ist für Browser optimiert und vermeidet bcryptjs-Probleme
export const verifyPassword = (password: string, hash: string): boolean => {
  // Für Entwicklungszwecke: Wenn der Hash dem vordefinierten entspricht und das Passwort "password" ist
  const defaultPasswordHash = "$2a$10$8DArxIj8AvMXCg7BXNgRhuGZfXxqpArWJI.uF9DS9T3EqYAPWIjPi";
  if (hash === defaultPasswordHash && password === "password") {
    return true;
  }
  
  // Tatsächlicher Vergleich würde normalerweise so aussehen:
  // return bcryptjs.compareSync(password, hash);
  // Aber wir umgehen dies wegen Browser-Kompatibilitätsproblemen
  
  return false;
};

// Hash a password - not used in browser environment
export const hashPassword = (password: string): string => {
  // Für Entwicklungszwecke geben wir einfach den vordefinierten Hash zurück
  return "$2a$10$8DArxIj8AvMXCg7BXNgRhuGZfXxqpArWJI.uF9DS9T3EqYAPWIjPi";
};

// Authenticate a user by username and password
export const authenticateUser = (username: string, password: string): User | null => {
  const user = mockJudges.find(user => user.username === username);
  
  if (user && verifyPassword(password, user.passwordHash)) {
    return user;
  }
  
  return null;
};

// Change a user's password
export const changePassword = (userId: string, newPassword: string): boolean => {
  const updatedJudges = [...mockJudges];
  const userIndex = updatedJudges.findIndex(user => user.id === userId);
  
  if (userIndex !== -1) {
    updatedJudges[userIndex] = {
      ...updatedJudges[userIndex],
      passwordHash: hashPassword(newPassword)
    };
    updateMockJudges(updatedJudges);
    return true;
  }
  
  return false;
};
