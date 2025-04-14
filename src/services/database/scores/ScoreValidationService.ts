
import { GroupScore } from '@/types';

export class ScoreValidationService {
  static validateScoreData(score: Omit<GroupScore, 'id'>): void {
    if (!score.groupId) {
      throw new Error('Group ID is required');
    }
    
    if (!score.judgeId) {
      throw new Error('Judge ID is required');
    }

    // Validate numeric fields have valid values
    const whipStrikes = score.whipStrikes === null ? 0 : score.whipStrikes;
    const rhythm = score.rhythm === null ? 0 : score.rhythm;
    const tempo = score.tempo === null ? 0 : score.tempo;

    if (whipStrikes !== undefined && (isNaN(Number(whipStrikes)) || Number(whipStrikes) < 0)) {
      throw new Error('Invalid value for whip strikes');
    }
    
    if (rhythm !== undefined && (isNaN(Number(rhythm)) || Number(rhythm) < 0)) {
      throw new Error('Invalid value for rhythm');
    }
    
    if (tempo !== undefined && (isNaN(Number(tempo)) || Number(tempo) < 0)) {
      throw new Error('Invalid value for tempo');
    }
  }
}
