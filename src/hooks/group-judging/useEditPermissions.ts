
import { GroupCriterionKey } from '@/types';
import { useUser } from '@/contexts/UserContext';

export const useEditPermissions = () => {
  const { isAdmin, isJudge, currentUser } = useUser();
  
  const canEditScores = isAdmin || isJudge;

  const canEditCriterion = (criterion: GroupCriterionKey): boolean => {
    if (!canEditScores) return false;
    if (isAdmin) return true;
    return currentUser?.assignedCriteria?.group === criterion;
  };

  return {
    canEditScores,
    canEditCriterion
  };
};
