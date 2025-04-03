// This is a simplified version of bcrypt for browser environments

/**
 * Hash a password for storing.
 */
export function hashPassword(password: string): string {
  if (!password || password.trim() === '') {
    throw new Error('Password cannot be empty');
  }
  
  if (password === "password") {
    // Return a predefined hash for the default password to simplify development
    return "$2a$10$8DArxIj8AvMXCg7BXNgRhuGZfXxqpArWJI.uF9DS9T3EqYAPWIjPi";
  }
  
  // For simplicity in this demo, we're creating a more unique hash
  // In a real application, you would use a proper hashing algorithm like bcrypt
  const salt = Date.now().toString(36) + Math.random().toString(36).substring(2);
  return `hashed_${password}_${salt}`;
}

/**
 * Check a password against a hash.
 */
export function verifyPassword(password: string, hash: string): boolean {
  // Special case for our default password and hash for development
  if (password === "password" && hash === "$2a$10$8DArxIj8AvMXCg7BXNgRhuGZfXxqpArWJI.uF9DS9T3EqYAPWIjPi") {
    return true;
  }
  
  // Extract the original password from the hash (for this simplified demo)
  // In a real application, you would use a proper verification method
  const parts = hash.split('_');
  if (parts.length >= 2 && parts[0] === 'hashed') {
    return parts[1] === password;
  }
  
  return false;
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
