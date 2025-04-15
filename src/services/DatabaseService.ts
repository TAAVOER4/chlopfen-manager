
import { BaseGroupService } from './database/group/BaseGroupService';
import { GroupQueryService } from './database/group/GroupQueryService';
import { GroupMutationService } from './database/group/GroupMutationService';
import { GroupOrderService } from './database/group/GroupOrderService';
import { ParticipantQueryService } from './database/participant/ParticipantQueryService';
import { ParticipantMutationService } from './database/participant/ParticipantMutationService';
import { ParticipantOrderService } from './database/participant/ParticipantOrderService';
import { IndividualScoreService } from './database/scores/IndividualScoreService';
import { GroupScoreService } from './database/scores/GroupScoreService';

export class DatabaseService {
  // Participant management
  static async getAllParticipants() {
    return ParticipantQueryService.getAllParticipants();
  }

  static async createParticipant(participantData: any) {
    return ParticipantMutationService.createParticipant(participantData);
  }

  static async updateParticipant(participant: any) {
    return ParticipantMutationService.updateParticipant(participant);
  }

  static async deleteParticipant(id: number) {
    return ParticipantMutationService.deleteParticipant(id);
  }

  // Participant order management
  static async updateParticipantDisplayOrder(participantId: number, displayOrder: number) {
    return ParticipantOrderService.updateParticipantDisplayOrder(participantId, displayOrder);
  }

  static async bulkUpdateParticipantDisplayOrder(participantUpdates: { id: number, displayOrder: number }[]) {
    return ParticipantOrderService.bulkUpdateParticipantDisplayOrder(participantUpdates);
  }

  // Group management
  static async getAllGroups() {
    return GroupQueryService.getAllGroups();
  }

  static async createGroup(groupData: any) {
    return GroupMutationService.createGroup(groupData);
  }

  static async updateGroup(group: any) {
    return GroupMutationService.updateGroup(group);
  }

  static async deleteGroup(id: number) {
    return GroupMutationService.deleteGroup(id);
  }

  // Group order management
  static async updateGroupDisplayOrder(groupId: number, displayOrder: number) {
    return GroupOrderService.updateGroupDisplayOrder(groupId, displayOrder);
  }

  static async bulkUpdateGroupDisplayOrder(groupUpdates: { id: number, displayOrder: number }[]) {
    return GroupOrderService.bulkUpdateGroupDisplayOrder(groupUpdates);
  }

  // Individual score management
  static async getIndividualScores() {
    return IndividualScoreService.getIndividualScores();
  }

  static async createIndividualScore(scoreData: any) {
    return IndividualScoreService.createIndividualScore(scoreData);
  }

  static async updateIndividualScore(scoreData: any) {
    return IndividualScoreService.updateIndividualScore(scoreData);
  }

  // Group score management
  static async getGroupScores() {
    return GroupScoreService.getGroupScores();
  }

  static async createGroupScore(scoreData: any) {
    return GroupScoreService.createGroupScore(scoreData);
  }

  static async updateGroupScore(scoreData: any) {
    return GroupScoreService.createGroupScore(scoreData);
  }
}
