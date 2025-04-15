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
  
  // If the id already contains hyphens, it might be a valid UUID
  if (id && id.includes('-') && id.length === 36) {
    return id;
  }
  
  // If it's purely numeric, it might be a user ID that needs conversion
  // In a real application, you would fetch the actual UUID from the user's record
  if (id && /^\d+$/.test(id)) {
    console.log(`Converting numeric ID ${id} to proper UUID format`);
    return id; // Return as is - the actual conversion happens in the service layer
  }
  
  // Otherwise return placeholder UUID to avoid database errors
  console.warn(`Received invalid UUID format: ${id}, returning placeholder`);
  return '00000000-0000-0000-0000-000000000000';
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
