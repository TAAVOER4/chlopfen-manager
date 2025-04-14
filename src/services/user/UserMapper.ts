
import { User, UserRole } from '@/types';

// This function maps database user records to our application User type
export function mapDatabaseUserToAppUser(dbUser: any): User {
  if (!dbUser) return null as any;
  
  // Use the ID directly as a string
  const id = dbUser.id ? String(dbUser.id) : '';
  
  return {
    id,
    name: dbUser.name || '',
    username: dbUser.username || '',
    role: (dbUser.role as UserRole) || 'judge',
    passwordHash: dbUser.password_hash || '',
    assignedCriteria: {
      individual: dbUser.individual_criterion || undefined,
      group: dbUser.group_criterion || undefined
    },
    tournamentIds: dbUser.tournamentIds || []
  };
}

// This function creates a database record from an app User
export function mapAppUserToDatabaseUser(appUser: User): any {
  return {
    id: appUser.id,
    name: appUser.name,
    username: appUser.username,
    role: appUser.role,
    password_hash: appUser.passwordHash,
    individual_criterion: appUser.assignedCriteria?.individual || null,
    group_criterion: appUser.assignedCriteria?.group || null
  };
}
