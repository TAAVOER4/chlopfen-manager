
import { GroupScore, IndividualScore } from '@/types';

/**
 * Validates if a string is a valid UUID format
 * @param id The ID to check
 */
export const isValidUuid = (id: string): boolean => {
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidPattern.test(id);
};

/**
 * Checks if a judge ID belongs to an admin user (numeric IDs are used for admin users)
 * @param judgeId The judge ID to check
 */
export const isAdminId = (judgeId: string): boolean => {
  // Admin users often use numeric IDs instead of UUIDs
  return /^\d+$/.test(judgeId);
};

/**
 * Ensures the provided ID is in a valid format for database operations
 * If it's a numeric ID (used by admins), it needs to be transformed to a valid UUID for DB operations
 * @param id The ID to normalize
 */
export const normalizeUuid = (id: string): string => {
  if (isValidUuid(id)) {
    return id; // Already a valid UUID
  }
  
  // For numeric IDs, return a placeholder UUID format that will be consistent for that ID
  if (isAdminId(id)) {
    // Convert numeric ID to a fixed-format UUID-like string
    // This creates a deterministic UUID-like string for each numeric ID
    // Note: This is NOT a real UUID but a formatted string that will pass validation
    // Format: 00000000-0000-0000-0000-xxxxxxxxxxxx where x is the numeric ID padded with zeros
    const paddedId = id.padStart(12, '0');
    return `00000000-0000-0000-0000-${paddedId}`;
  }
  
  // If not valid UUID and not numeric, return a default placeholder
  // This should generally not happen in production, but provides a fallback
  console.error('Invalid ID format:', id);
  return '00000000-0000-0000-0000-000000000000';
};
