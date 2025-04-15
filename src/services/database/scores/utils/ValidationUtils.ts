
export function isAdminId(id: string): boolean {
  // Check if the ID is for an admin user
  // This is a placeholder implementation - in a real app,
  // you would check against actual admin IDs or roles
  return id === 'admin' || id === '1';
}

export function normalizeUuid(id: string): string {
  // If the id is null or undefined, return a placeholder string
  if (!id) {
    console.warn('Received undefined or null ID to normalize');
    return '00000000-0000-0000-0000-000000000000';
  }
  
  console.log(`Normalizing UUID input: ${id}, type: ${typeof id}`);
  
  // If the id already contains hyphens, it might be a valid UUID
  if (id && id.includes('-') && id.length === 36) {
    console.log(`Using UUID format as is: ${id}`);
    return id;
  }
  
  // If it's purely numeric, it's likely a user ID that needs to be used as is
  if (id && /^\d+$/.test(id)) {
    console.log(`Using numeric ID ${id} as is`);
    return id;
  }
  
  // Otherwise return the original ID with a warning
  console.warn(`Received potentially invalid UUID format: ${id}, but will use as is`);
  return id;
}

export function isValidUuid(id: string): boolean {
  if (!id) return false;
  
  // Basic check for UUID format
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidPattern.test(id);
}

// Function to help debug what type of ID we're dealing with
export function logIdType(id: any): void {
  console.log(`ID Value: ${id}`);
  console.log(`ID Type: ${typeof id}`);
  
  if (typeof id === 'string') {
    if (id.includes('-') && id.length === 36) {
      console.log('Appears to be a UUID format');
    } else if (/^\d+$/.test(id)) {
      console.log('Appears to be a numeric ID');
    } else {
      console.log('Unknown string format');
    }
  }
}
