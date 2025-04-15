
export function isAdminId(id: string): boolean {
  // Check if the ID is for an admin user
  return id === 'admin' || id === '1';
}

export function normalizeUuid(id: string): string {
  // If the id is null or undefined, return a placeholder string
  if (!id) {
    console.warn('Received undefined or null ID to normalize');
    return '00000000-0000-0000-0000-000000000000';
  }
  
  // Just return the ID as is - we'll handle any formatting issues at the database level
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
