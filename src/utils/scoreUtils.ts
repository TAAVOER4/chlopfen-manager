
import { IndividualScore, GroupScore, Participant, Category } from '../types';

export const calculateIndividualTotal = (scores: IndividualScore[]): number => {
  if (scores.length === 0) return 0;
  
  // Calculate the total from all scores for all rounds
  return scores.reduce((total, score) => {
    return total + score.whipStrikes + score.rhythm + score.stance + score.posture + score.whipControl;
  }, 0);
};

export const calculateIndividualAverage = (scores: IndividualScore[]): number => {
  if (scores.length === 0) return 0;
  
  const total = calculateIndividualTotal(scores);
  // Each complete score has 5 criteria, so we divide by that to get the real average
  return total / (scores.length * 5);
};

export const calculateIndividualBestRound = (scores: IndividualScore[]): number => {
  if (scores.length === 0) return 0;
  
  // Group scores by round
  const roundScores: Record<number, number> = {};
  
  scores.forEach(score => {
    const roundTotal = score.whipStrikes + score.rhythm + score.stance + score.posture + score.whipControl;
    if (!roundScores[score.round]) {
      roundScores[score.round] = 0;
    }
    roundScores[score.round] += roundTotal;
  });
  
  // Return the highest scoring round's total
  return Math.max(...Object.values(roundScores));
};

// New function to calculate the sum of both rounds
export const calculateBothRoundsTotal = (scores: IndividualScore[]): number => {
  if (scores.length === 0) return 0;
  
  // Group scores by round
  const roundScores: Record<number, number> = {};
  
  scores.forEach(score => {
    const roundTotal = score.whipStrikes + score.rhythm + score.stance + score.posture + score.whipControl;
    if (!roundScores[score.round]) {
      roundScores[score.round] = 0;
    }
    roundScores[score.round] += roundTotal;
  });
  
  // Sum up all rounds (in case there are more than 2)
  return Object.values(roundScores).reduce((sum, roundScore) => sum + roundScore, 0);
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
    
    // Use the sum of both rounds (instead of just best round)
    const aTotalScore = calculateBothRoundsTotal(aScores);
    const bTotalScore = calculateBothRoundsTotal(bScores);
    
    if (bTotalScore !== aTotalScore) {
      return bTotalScore - aTotalScore; // Higher score first
    }
    
    // Tiebreaker: Check rhythm scores
    const aRhythm = aScores.reduce((sum, score) => sum + score.rhythm, 0);
    const bRhythm = bScores.reduce((sum, score) => sum + score.rhythm, 0);
    
    return bRhythm - aRhythm;
  });
};
