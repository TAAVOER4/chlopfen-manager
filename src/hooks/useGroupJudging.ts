
import { useJudgingAccess } from './group-judging/useJudgingAccess';
import { useGroupsData } from './group-judging/useGroupsData';
import { useGroupScores } from './group-judging/useGroupScores';
import { useScoreSubmission } from './group-judging/useScoreSubmission';
import { useJudgingErrors } from './group-judging/useJudgingErrors';

export const useGroupJudging = (size: string | undefined, categoryParam: string | null) => {
  // Setup error handling
  const { errors, hasErrors, handleError, clearError, clearAllErrors } = useJudgingErrors();
  
  // Check if user has access to judging
  const { isValidAccess, isChecking } = useJudgingAccess(size, categoryParam);
  
  // Load groups data
  const { groups, isLoading, refetchGroups } = useGroupsData(size, categoryParam);
  
  // Setup scoring logic
  const { scores, canEditCriterion, handleScoreChange } = useGroupScores(groups);
  
  // Setup submission logic
  const { 
    currentGroupIndex, 
    setCurrentGroupIndex, 
    handleSaveScore,
    isSaving
  } = useScoreSubmission(groups, scores, canEditCriterion, handleError);

  return {
    groups,
    currentGroupIndex,
    scores,
    canEditCriterion,
    handleScoreChange,
    handleSaveScore,
    setCurrentGroupIndex,
    isLoading,
    errors,
    hasErrors,
    clearError,
    clearAllErrors,
    refetchGroups,
    isSaving,
    isChecking
  };
};
