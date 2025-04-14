import { ParticipantService } from './participant';
import { GroupService } from './GroupService';
import { StatisticsService } from './StatisticsService';
import { IndividualScoreService, GroupScoreService } from './scores';

/**
 * DatabaseService acts as a facade for all database services
 * to provide a unified API for database operations
 */
export class DatabaseService {
  // Participant operations
  static getAllParticipants = ParticipantService.getAllParticipants;
  static createParticipant = ParticipantService.createParticipant;
  static updateParticipant = ParticipantService.updateParticipant;
  static deleteParticipant = ParticipantService.deleteParticipant;
  static updateParticipantTournament = ParticipantService.updateParticipantTournament;
  static bulkUpdateParticipantTournaments = ParticipantService.bulkUpdateParticipantTournaments;
  static updateParticipantDisplayOrder = ParticipantService.updateParticipantDisplayOrder;
  static bulkUpdateParticipantDisplayOrder = ParticipantService.bulkUpdateParticipantDisplayOrder;

  // Group operations
  static getAllGroups = GroupService.getAllGroups;
  static createGroup = GroupService.createGroup;
  static updateGroup = GroupService.updateGroup;
  static deleteGroup = GroupService.deleteGroup;
  static updateGroupDisplayOrder = GroupService.updateGroupDisplayOrder;
  static bulkUpdateGroupDisplayOrder = GroupService.bulkUpdateGroupDisplayOrder;

  // Score operations
  static getIndividualScores = IndividualScoreService.getIndividualScores;
  static createIndividualScore = IndividualScoreService.createIndividualScore;
  static updateIndividualScore = IndividualScoreService.updateIndividualScore; 
  static getGroupScores = GroupScoreService.getGroupScores;
  static createGroupScore = GroupScoreService.createGroupScore;
  static updateGroupScore = GroupScoreService.updateGroupScore;

  // Statistics operations
  static getParticipantStatistics = StatisticsService.getParticipantStatistics;
  static getGroupStatistics = StatisticsService.getGroupStatistics;
  static getScoreStatistics = StatisticsService.getScoreStatistics;
}
