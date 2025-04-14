
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
 * If it's a numeric ID (used by admins), it will be transformed to a deterministic UUID-like string
 * @param id The ID to normalize
 */
export const normalizeUuid = (id: string): string => {
  if (!id) {
    console.error('Received empty ID for normalization');
    return '00000000-0000-0000-0000-000000000000';
  }
  
  // Convert to string if it's not already
  const stringId = String(id);
  
  if (isValidUuid(stringId)) {
    return stringId; // Already a valid UUID
  }
  
  // For numeric IDs, always return a consistent UUID-like string for that ID
  if (isAdminId(stringId)) {
    // Convert numeric ID to a fixed-format UUID-like string
    // Format: 00000000-0000-0000-0000-xxxxxxxxxxxx where x is the numeric ID padded with zeros
    const paddedId = stringId.padStart(12, '0');
    return `00000000-0000-0000-0000-${paddedId}`;
  }
  
  // If not valid UUID and not numeric, return a default placeholder
  console.error('Invalid ID format:', stringId);
  return '00000000-0000-0000-0000-000000000000';
};

/**
 * Makes sure we use the appropriate judge ID for database operations
 * - For regular judges: use their UUID
 * - For admin users: optionally use a provided substitute UUID
 * @param judgeId The original judge ID
 * @param substituteId Optional substitute ID to use for admin users
 */
export const getDatabaseJudgeId = (judgeId: string, substituteId?: string): string => {
  // First normalize the judge ID
  const normalizedId = normalizeUuid(judgeId);
  
  // If it's an admin ID and we have a substitute, use the substitute
  if (isAdminId(judgeId) && substituteId) {
    return normalizeUuid(substituteId);
  }
  
  return normalizedId;
};
