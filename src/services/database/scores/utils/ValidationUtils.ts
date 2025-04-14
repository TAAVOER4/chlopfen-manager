
/**
 * Validates if a string is a valid UUID format
 * @param id string to check
 * @returns boolean indicating if the string is a valid UUID
 */
export const isValidUUID = (id: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
};

/**
 * Checks if a user ID is likely an admin ID (numeric)
 * @param id user ID to check
 * @returns boolean indicating if the ID is likely an admin ID
 */
export const isAdminId = (id: string): boolean => {
  // If it's a number or a string that only contains digits
  return !isNaN(Number(id)) && /^\d+$/.test(id);
};
