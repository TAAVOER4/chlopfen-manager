// This is a simplified version of bcrypt for browser environments
import bcrypt from 'bcryptjs';

/**
 * Hash a password for storing.
 */
export function hashPassword(password: string): string {
  if (!password || password.trim() === '') {
    throw new Error('Password cannot be empty');
  }
  
  try {
    // Use bcryptjs with a salt rounds value of 10
    const salt = bcrypt.genSaltSync(10);
    return bcrypt.hashSync(password, salt);
  } catch (error) {
    console.error('Password hashing error:', error);
    throw new Error('Error hashing password');
  }
}

/**
 * Check a password against a hash.
 */
export function verifyPassword(password: string, hash: string): boolean {
  if (!password || !hash) {
    console.log('Missing password or hash in verification');
    return false;
  }
  
  try {
    // Try to validate with bcryptjs
    if (hash.startsWith('$2a$') || hash.startsWith('$2b$') || hash.startsWith('$2y$')) {
      return bcrypt.compareSync(password, hash);
    }
    
    // If the hash format is not recognized, return false
    console.log('Unrecognized hash format');
    return false;
  } catch (error) {
    console.error('Password verification error:', error);
    return false;
  }
}

/**
 * Find a user by username and verify the password.
 */
export function findUserByCredentials(users: any[], username: string, password: string) {
  const user = users.find(u => u.username === username);
  
  if (!user) {
    return null;
  }
  
  if (verifyPassword(password, user.passwordHash)) {
    return user;
  }
  
  return null;
}

/**
 * Authenticate a user by checking username and password against all users.
 */
export function authenticateUser(users: any[], username: string, password: string) {
  const user = findUserByCredentials(users, username, password);
  
  if (!user) {
    throw new Error("Invalid username or password");
  }
  
  return user;
}

/**
 * Check if a user exists with the given ID
 */
export function userExists(users: any[], userId: number) {
  return users.some(user => user.id === userId);
}
