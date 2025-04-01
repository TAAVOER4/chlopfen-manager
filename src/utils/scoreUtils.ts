
import { IndividualScore, GroupScore, Participant, Category } from '../types';

export const calculateIndividualTotal = (scores: IndividualScore[]): number => {
  if (scores.length === 0) return 0;
  
  return scores.reduce((total, score) => {
    return total + score.whipStrikes + score.rhythm + score.stance + score.posture + score.whipControl;
  }, 0);
};

export const calculateIndividualAverage = (scores: IndividualScore[]): number => {
  if (scores.length === 0) return 0;
  
  const total = calculateIndividualTotal(scores);
  return total / scores.length;
};

export const calculateGroupTotal = (scores: GroupScore[]): number => {
  if (scores.length === 0) return 0;
  
  return scores.reduce((total, score) => {
    return total + score.whipStrikes + score.rhythm1 + score.rhythm2 + score.tempo1 + score.tempo2;
  }, 0);
};

export const calculateGroupAverageRhythm = (scores: GroupScore[]): number => {
  if (scores.length === 0) return 0;
  
  const rhythmTotal = scores.reduce((total, score) => {
    return total + score.rhythm1 + score.rhythm2;
  }, 0);
  
  return rhythmTotal / (scores.length * 2);
};

export const sortParticipantsByScore = (
  participants: Participant[],
  scoresByParticipant: Record<string, IndividualScore[]>
): Participant[] => {
  return [...participants].sort((a, b) => {
    const aScores = scoresByParticipant[a.id] || [];
    const bScores = scoresByParticipant[b.id] || [];
    
    const aTotal = calculateIndividualTotal(aScores);
    const bTotal = calculateIndividualTotal(bScores);
    
    if (bTotal !== aTotal) {
      return bTotal - aTotal; // Higher score first
    }
    
    // Tiebreaker: Check rhythm scores
    const aRhythm = aScores.reduce((sum, score) => sum + score.rhythm, 0);
    const bRhythm = bScores.reduce((sum, score) => sum + score.rhythm, 0);
    
    return bRhythm - aRhythm;
  });
};
