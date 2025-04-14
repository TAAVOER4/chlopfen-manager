
import { useJudgingAccess } from './group-judging/useJudgingAccess';
import { useGroupsData } from './group-judging/useGroupsData';
import { useGroupScores } from './group-judging/useGroupScores';
import { useScoreSubmission } from './group-judging/useScoreSubmission';
import { useJudgingErrors } from './group-judging/useJudgingErrors';
import { useState, useEffect } from 'react';

export const useGroupJudging = (size: string | undefined, categoryParam: string | null) => {
  // Setup error handling
  const { errors, hasErrors, handleError, clearError, clearAllErrors } = useJudgingErrors();
  
  // Check if user has access to judging
  const { isValidAccess, isChecking } = useJudgingAccess(size, categoryParam);
  
  // Only load groups data if access is valid to prevent unnecessary API calls
  const { groups, isLoading, refetchGroups } = useGroupsData(
    isValidAccess ? size : undefined, 
    isValidAccess ? categoryParam : null
  );
  
  // Setup scoring logic - only initialize if we have groups
  const { scores, canEditCriterion, handleScoreChange, canEditScores, isLoadingScores } = useGroupScores(groups);
  
  // Setup submission logic
  const { 
    currentGroupIndex, 
    setCurrentGroupIndex, 
    handleSaveScore,
    isSaving,
    canSubmitScores,
    existingScores
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
    isChecking,
    canEditScores,
    canSubmitScores,
    isLoadingScores,
    existingScores
  };
};
