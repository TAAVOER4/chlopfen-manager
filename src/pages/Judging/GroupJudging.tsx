
import React from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { GroupCategory, GroupSize } from '../../types';
import { getCategoryDisplay } from '@/utils/categoryUtils';
import { useGroupJudging } from '@/hooks/useGroupJudging';
import GroupJudgingHeader from '@/components/Judging/GroupJudgingHeader';
import GroupJudgingForm from '@/components/Judging/GroupJudgingForm';
import EmptyGroupState from '@/components/Judging/EmptyGroupState';

const GroupJudging: React.FC = () => {
  const { size } = useParams<{ size: string }>();
  const [searchParams] = useSearchParams();
  const categoryParam = searchParams.get('category');
  const navigate = useNavigate();
  
  // Use our custom hook for most of the functionality
  const {
    groups,
    currentGroupIndex,
    scores,
    canEditCriterion,
    handleScoreChange,
    handleSaveScore
  } = useGroupJudging(size, categoryParam);

  // Navigate back to judging page with group tab selected
  const handleBackClick = () => {
    navigate('/judging', { 
      state: { from: 'groupJudging' } 
    });
  };

  // Return early if no groups found
  if (groups.length === 0) {
    return (
      <EmptyGroupState 
        size={size as GroupSize} 
        categoryParam={categoryParam as GroupCategory | null}
        handleBackClick={handleBackClick}
      />
    );
  }

  const currentGroup = groups[currentGroupIndex];
  const categoryName = categoryParam ? 
    getCategoryDisplay(categoryParam as GroupCategory) : 
    getCategoryDisplay(currentGroup.category);

  return (
    <div className="animate-fade-in">
      <GroupJudgingHeader 
        size={size as GroupSize}
        categoryName={categoryName}
        handleBackClick={handleBackClick}
        currentGroupIndex={currentGroupIndex}
        totalGroups={groups.length}
        currentGroupName={currentGroup.name}
      />

      <GroupJudgingForm 
        currentGroup={currentGroup}
        scores={scores}
        handleScoreChange={handleScoreChange}
        handleSaveScore={handleSaveScore}
        canEditCriterion={canEditCriterion}
        currentGroupIndex={currentGroupIndex}
        totalGroups={groups.length}
      />
    </div>
  );
};

export default GroupJudging;
