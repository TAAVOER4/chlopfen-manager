
import { Category, ParticipantResult, GroupResult, Participant, Group } from '../types';
import { calculateBothRoundsTotal } from '../utils/scoreUtils';

export const generateResults = (
  category: Category, 
  participants: Participant[], 
  individualScores: any[]
): ParticipantResult[] => {
  const filteredParticipants = participants.filter(p => 
    p.category === category && !p.isGroupOnly
  );
  
  const scoresByParticipant: Record<string, any[]> = {};
  
  individualScores.forEach(score => {
    const participantId = score.participantId;
    if (!scoresByParticipant[participantId]) {
      scoresByParticipant[participantId] = [];
    }
    scoresByParticipant[participantId].push(score);
  });
  
  return filteredParticipants.map(participant => {
    const participantScores = scoresByParticipant[participant.id] || [];
    
    const totalScore = calculateBothRoundsTotal(participantScores);
    
    const totalCriteria = participantScores.length * 5;
    const averageScore = totalCriteria > 0 ? totalScore / totalCriteria : 0;
    
    return {
      participant,
      totalScore,
      averageScore,
      rank: 0
    };
  }).sort((a, b) => b.totalScore - a.totalScore)
    .map((result, index) => ({
      ...result,
      rank: index + 1
    }));
};

export const generateGroupResults = (
  groups: Group[],
  participants: Participant[],
  groupScores: any[]
): Record<string, GroupResult[]> => {
  const results: Record<string, GroupResult[]> = {};
  
  const sizes = ['three', 'four'];
  const categories = ['kids_juniors', 'active'];
  
  sizes.forEach(size => {
    categories.forEach(category => {
      const key = `${size}_${category}`;
      
      const filteredGroups = groups.filter(g => 
        g.size === size && g.category === category
      );
      
      const groupResults = filteredGroups.map(group => {
        const groupScoresForGroup = groupScores.filter(s => s.groupId === group.id);
        
        const totalScore = groupScoresForGroup.reduce((sum, score) => {
          return sum + score.whipStrikes + score.rhythm + score.tempo;
        }, 0);
        
        const averageRhythm = groupScoresForGroup.length > 0 
          ? groupScoresForGroup.reduce((sum, s) => sum + s.rhythm, 0) / groupScoresForGroup.length 
          : 0;
        
        const members = group.participantIds.map(id => 
          participants.find(p => p.id === id)
        ).filter(p => p !== undefined) as typeof participants;
        
        return {
          groupId: group.id,
          category: group.category,
          groupSize: group.size,
          members,
          totalScore,
          averageRhythm,
          rank: 0
        };
      }).sort((a, b) => b.totalScore - a.totalScore)
        .map((result, index) => ({
          ...result,
          rank: index + 1
        }));
      
      results[key] = groupResults;
    });
  });
  
  return results;
};
