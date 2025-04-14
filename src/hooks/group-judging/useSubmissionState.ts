
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@/contexts/UserContext';

export const useSubmissionState = () => {
  const navigate = useNavigate();
  const { isAdmin, isJudge } = useUser();
  const [currentGroupIndex, setCurrentGroupIndex] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  // Check if user is authorized to submit scores
  const canSubmitScores = isAdmin || isJudge;

  return {
    currentGroupIndex,
    setCurrentGroupIndex,
    isSaving,
    setIsSaving,
    canSubmitScores,
    navigate
  };
};
