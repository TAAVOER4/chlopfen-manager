
import { ParticipantService as NewParticipantService } from './participant';

// Re-export the new service to maintain backward compatibility
export class ParticipantService extends NewParticipantService {}
