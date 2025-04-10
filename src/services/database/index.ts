
import { ParticipantService } from './ParticipantService';
import { GroupService } from './GroupService';
import { ScoreService } from './ScoreService';
import { StatisticsService } from './StatisticsService';

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
  static getIndividualScores = ScoreService.getIndividualScores;
  static createIndividualScore = ScoreService.createIndividualScore;
  static updateIndividualScore = ScoreService.createIndividualScore; // Use existing method as fallback
  static getGroupScores = ScoreService.getGroupScores;
  static createGroupScore = ScoreService.createGroupScore;
  static updateGroupScore = ScoreService.createGroupScore; // Use existing method as fallback

  // Statistics operations
  static getParticipantStatistics = StatisticsService.getParticipantStatistics;
  static getGroupStatistics = StatisticsService.getGroupStatistics;
  static getScoreStatistics = StatisticsService.getScoreStatistics;
}
