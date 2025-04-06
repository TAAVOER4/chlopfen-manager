
import { BaseParticipantService } from './BaseParticipantService';
import { ParticipantQueryService } from './ParticipantQueryService';
import { ParticipantMutationService } from './ParticipantMutationService';
import { ParticipantTournamentService } from './ParticipantTournamentService';
import { ParticipantOrderService } from './ParticipantOrderService';

// Re-export for ease of use
export { 
  BaseParticipantService, 
  ParticipantQueryService, 
  ParticipantMutationService,
  ParticipantTournamentService,
  ParticipantOrderService
};

// Main service that combines all functionality
export class ParticipantService {
  // Query methods
  static getAllParticipants = ParticipantQueryService.getAllParticipants;
  
  // Mutation methods
  static createParticipant = ParticipantMutationService.createParticipant;
  static updateParticipant = ParticipantMutationService.updateParticipant;
  static deleteParticipant = ParticipantMutationService.deleteParticipant;
  
  // Tournament methods
  static updateParticipantTournament = ParticipantTournamentService.updateParticipantTournament;
  static bulkUpdateParticipantTournaments = ParticipantTournamentService.bulkUpdateParticipantTournaments;
  
  // Order methods
  static updateParticipantDisplayOrder = ParticipantOrderService.updateParticipantDisplayOrder;
  static bulkUpdateParticipantDisplayOrder = ParticipantOrderService.bulkUpdateParticipantDisplayOrder;
}
