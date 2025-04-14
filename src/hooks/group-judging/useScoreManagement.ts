
import { GroupScore, GroupCriterionKey } from '@/types';

export const useScoreManagement = (
  scores: Record<number, Partial<GroupScore>>,
  setScores: React.Dispatch<React.SetStateAction<Record<number, Partial<GroupScore>>>>,
  canEditCriterion: (criterion: GroupCriterionKey) => boolean
) => {
  const handleScoreChange = (
    groupId: number, 
    criterion: keyof Omit<GroupScore, 'groupId' | 'judgeId' | 'time'>, 
    value: number
  ) => {
    if (!canEditCriterion(criterion as GroupCriterionKey)) return;
    
    const clampedValue = Math.max(1, Math.min(10, value));
    
    setScores(prev => ({
      ...prev,
      [groupId]: {
        ...prev[groupId],
        [criterion]: clampedValue
      }
    }));
  };

  return { handleScoreChange };
};
