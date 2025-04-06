
import { useJudgingAccess } from './group-judging/useJudgingAccess';
import { useGroupsData } from './group-judging/useGroupsData';
import { useGroupScores } from './group-judging/useGroupScores';
import { useScoreSubmission } from './group-judging/useScoreSubmission';

export const useGroupJudging = (size: string | undefined, categoryParam: string | null) => {
  // Check if user has access to judging
  useJudgingAccess(size, categoryParam);
  
  // Load groups data
  const { groups, isLoading } = useGroupsData(size, categoryParam);
  
  // Setup scoring logic
  const { scores, canEditCriterion, handleScoreChange } = useGroupScores(groups);
  
  // Setup submission logic
  const { currentGroupIndex, setCurrentGroupIndex, handleSaveScore } = 
    useScoreSubmission(groups, scores, canEditCriterion);

  return {
    groups,
    currentGroupIndex,
    scores,
    canEditCriterion,
    handleScoreChange,
    handleSaveScore,
    setCurrentGroupIndex,
    isLoading
  };
};
