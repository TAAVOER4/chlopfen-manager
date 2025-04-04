
import { ParticipantService } from './database/ParticipantService';
import { GroupService } from './database/GroupService';
import { ScoreService } from './database/ScoreService';
import { StatisticsService } from './database/StatisticsService';

// Facade pattern to maintain backward compatibility
export class DatabaseService {
  // Participant methods
  static getAllParticipants = ParticipantService.getAllParticipants;
  static createParticipant = ParticipantService.createParticipant;
  static updateParticipant = ParticipantService.updateParticipant;
  static deleteParticipant = ParticipantService.deleteParticipant;
  static updateParticipantTournament = ParticipantService.updateParticipantTournament;
  static bulkUpdateParticipantTournaments = ParticipantService.bulkUpdateParticipantTournaments;

  // Group methods
  static getAllGroups = GroupService.getAllGroups;
  static createGroup = GroupService.createGroup;
  static updateGroup = GroupService.updateGroup;
  static deleteGroup = GroupService.deleteGroup;
  
  // Score methods
  static getIndividualScores = ScoreService.getIndividualScores;
  static createIndividualScore = ScoreService.createIndividualScore;
  static updateIndividualScore = ScoreService.createIndividualScore; // Use existing method as fallback
  static getGroupScores = ScoreService.getGroupScores;
  static createGroupScore = ScoreService.createGroupScore;
  static updateGroupScore = ScoreService.createGroupScore; // Use existing method as fallback
  
  // Statistics methods
  static getParticipantStatistics = StatisticsService.getParticipantStatistics;
  static getGroupStatistics = StatisticsService.getGroupStatistics;
  static getScoreStatistics = StatisticsService.getScoreStatistics;
}
