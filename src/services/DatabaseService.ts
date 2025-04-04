
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
  static getGroupById = GroupService.getGroupById;
  static getGroupParticipants = GroupService.getGroupParticipants;
  static addParticipantToGroup = GroupService.addParticipantToGroup;
  static removeParticipantFromGroup = GroupService.removeParticipantFromGroup;
  
  // Score methods
  static getAllIndividualScores = ScoreService.getAllIndividualScores;
  static getIndividualScoresByParticipant = ScoreService.getIndividualScoresByParticipant;
  static createIndividualScore = ScoreService.createIndividualScore;
  static updateIndividualScore = ScoreService.updateIndividualScore;
  static getAllGroupScores = ScoreService.getAllGroupScores;
  static getGroupScoresByGroup = ScoreService.getGroupScoresByGroup;
  static createGroupScore = ScoreService.createGroupScore;
  static updateGroupScore = ScoreService.updateGroupScore;
  
  // Statistics methods
  static getIndividualResults = StatisticsService.getIndividualResults;
  static getGroupResults = StatisticsService.getGroupResults;
}
