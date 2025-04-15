export function isAdminId(id: string): boolean {
  // Check if the ID is for an admin user
  // This is a placeholder implementation - in a real app,
  // you would check against actual admin IDs or roles
  return id === 'admin' || id === '1';
}

export function normalizeUuid(id: string): string {
  // If the id already contains hyphens, it might be a valid UUID
  if (id && id.includes('-') && id.length === 36) {
    return id;
  }
  
  // If it's purely numeric, it might be a user ID that needs lookup
  if (id && /^\d+$/.test(id)) {
    console.log('ID appears to be numeric, may need conversion to UUID');
    return id;
  }
  
  // Otherwise just return as is, the database query will handle validation
  return id;
}
