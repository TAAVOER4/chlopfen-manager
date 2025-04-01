
// This is a simplified version of bcrypt for browser environments

/**
 * Hash a password for storing.
 */
export function hashPassword(password: string): string {
  if (password === "password") {
    // Return a predefined hash for the default password to simplify development
    return "$2a$10$8DArxIj8AvMXCg7BXNgRhuGZfXxqpArWJI.uF9DS9T3EqYAPWIjPi";
  }
  
  // For simplicity, we're not actually hashing in this example.
  // In a real application, you would use a proper hashing algorithm.
  return `hashed_${password}_${Date.now()}`;
}

/**
 * Check a password against a hash.
 */
export function verifyPassword(password: string, hash: string): boolean {
  // Special case for our default password and hash for development
  if (password === "password" && hash === "$2a$10$8DArxIj8AvMXCg7BXNgRhuGZfXxqpArWJI.uF9DS9T3EqYAPWIjPi") {
    return true;
  }
  
  // For simplicity, we're just checking if the hash starts with "hashed_" followed by the password
  // In a real application, you would use a proper verification method
  return hash.startsWith(`hashed_${password}_`);
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
