
import { BaseService } from './BaseService';
import { ParticipantService } from './ParticipantService';
import { GroupService } from './GroupService';
import { ScoreService } from './ScoreService';

export class StatisticsService extends BaseService {
  // Statistics Methods
  static async getParticipantStatistics() {
    try {
      const participants = await ParticipantService.getAllParticipants();
      
      // Calculate statistics
      const kidCount = participants.filter(p => p.category === 'kids').length;
      const juniorCount = participants.filter(p => p.category === 'juniors').length;
      const activeCount = participants.filter(p => p.category === 'active').length;
      
      return {
        total: participants.length,
        kidCount,
        juniorCount,
        activeCount,
        participants
      };
    } catch (error) {
      console.error('Error getting participant statistics:', error);
      return {
        total: 0,
        kidCount: 0,
        juniorCount: 0,
        activeCount: 0,
        participants: []
      };
    }
  }
  
  static async getGroupStatistics() {
    try {
      const groups = await GroupService.getAllGroups();
      
      // Calculate statistics
      const threeSizeGroups = groups.filter(g => g.size === 'three').length;
      const fourSizeGroups = groups.filter(g => g.size === 'four').length;
      const kidsJuniorsGroups = groups.filter(g => g.category === 'kids_juniors').length;
      const activeGroups = groups.filter(g => g.category === 'active').length;
      
      return {
        total: groups.length,
        threeSizeGroups,
        fourSizeGroups,
        kidsJuniorsGroups,
        activeGroups,
        groups
      };
    } catch (error) {
      console.error('Error getting group statistics:', error);
      return {
        total: 0,
        threeSizeGroups: 0,
        fourSizeGroups: 0,
        kidsJuniorsGroups: 0,
        activeGroups: 0,
        groups: []
      };
    }
  }
  
  static async getScoreStatistics() {
    try {
      const individualScores = await ScoreService.getIndividualScores();
      const groupScores = await ScoreService.getGroupScores();
      
      // Calculate average scores if there are any scores
      let averageIndividualScore = 0;
      if (individualScores.length > 0) {
        const totalScore = individualScores.reduce((sum, score) => {
          return sum + score.whipStrikes + score.rhythm + score.stance + score.posture + score.whipControl;
        }, 0);
        averageIndividualScore = totalScore / (individualScores.length * 5);
      }
      
      let averageGroupScore = 0;
      if (groupScores.length > 0) {
        const totalScore = groupScores.reduce((sum, score) => {
          return sum + score.whipStrikes + score.rhythm + score.tempo + (score.time ? 10 : 0);
        }, 0);
        averageGroupScore = totalScore / (groupScores.length * 4); // Including time as a criterion
      }
      
      return {
        individualScoresCount: individualScores.length,
        groupScoresCount: groupScores.length,
        totalScoresCount: individualScores.length + groupScores.length,
        averageIndividualScore,
        averageGroupScore,
        individualScores,
        groupScores
      };
    } catch (error) {
      console.error('Error getting score statistics:', error);
      return {
        individualScoresCount: 0,
        groupScoresCount: 0,
        totalScoresCount: 0,
        averageIndividualScore: 0,
        averageGroupScore: 0,
        individualScores: [],
        groupScores: []
      };
    }
  }
}
