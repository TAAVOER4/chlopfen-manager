
import { ParticipantService } from './ParticipantService';
import { GroupService } from './GroupService';
import { ScoreService } from './ScoreService';
import { StatisticsService } from './StatisticsService';

/**
 * DatabaseService acts as a facade for all database services
 * to maintain backward compatibility with existing code
 */
export class DatabaseService {
  // Participant operations
  static getAllParticipants = ParticipantService.getAllParticipants;
  static createParticipant = ParticipantService.createParticipant;
  static updateParticipant = ParticipantService.updateParticipant;
  static deleteParticipant = ParticipantService.deleteParticipant;
  static updateParticipantTournament = ParticipantService.updateParticipantTournament;
  static bulkUpdateParticipantTournaments = ParticipantService.bulkUpdateParticipantTournaments;

  // Group operations
  static getAllGroups = GroupService.getAllGroups;
  static createGroup = GroupService.createGroup;
  static updateGroup = GroupService.updateGroup;
  static deleteGroup = GroupService.deleteGroup;

  // Score operations
  static getIndividualScores = ScoreService.getIndividualScores;
  static createIndividualScore = ScoreService.createIndividualScore;
  static getGroupScores = ScoreService.getGroupScores;
  static createGroupScore = ScoreService.createGroupScore;

  // Statistics operations
  static getParticipantStatistics = StatisticsService.getParticipantStatistics;
  static getGroupStatistics = StatisticsService.getGroupStatistics;
  static getScoreStatistics = StatisticsService.getScoreStatistics;
}
