
import bcryptjs from 'bcryptjs';
import { User } from '@/types';
import { mockJudges } from '@/data/mockJudges';

// Hash a password
export const hashPassword = (password: string): string => {
  const salt = bcryptjs.genSaltSync(10);
  return bcryptjs.hashSync(password, salt);
};

// Verify a password against a hash
export const verifyPassword = (password: string, hash: string): boolean => {
  return bcryptjs.compareSync(password, hash);
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
  const userIndex = mockJudges.findIndex(user => user.id === userId);
  
  if (userIndex !== -1) {
    mockJudges[userIndex] = {
      ...mockJudges[userIndex],
      passwordHash: hashPassword(newPassword)
    };
    return true;
  }
  
  return false;
};
