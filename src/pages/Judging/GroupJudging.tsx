
import React from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { GroupCategory, GroupSize } from '../../types';
import { getCategoryDisplay } from '@/utils/categoryUtils';
import { useGroupJudging } from '@/hooks/useGroupJudging';
import GroupJudgingHeader from '@/components/Judging/GroupJudgingHeader';
import GroupJudgingForm from '@/components/Judging/GroupJudgingForm';
import EmptyGroupState from '@/components/Judging/EmptyGroupState';
import NextParticipantPreview from '@/components/Judging/NextParticipantPreview';
import { Skeleton } from '@/components/ui/skeleton';

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
    handleSaveScore,
    isLoading
  } = useGroupJudging(size, categoryParam);

  // Navigate back to judging page with group tab selected
  const handleBackClick = () => {
    navigate('/judging', { 
      state: { from: 'groupJudging' } 
    });
  };

  // Display loading state
  if (isLoading) {
    return (
      <div className="animate-fade-in">
        <div className="flex items-center justify-between mb-6">
          <Skeleton className="h-10 w-1/3" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div className="col-span-3">
            <Skeleton className="h-[400px] w-full" />
          </div>
          <div className="col-span-1">
            <Skeleton className="h-[200px] w-full" />
          </div>
        </div>
      </div>
    );
  }

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
  const nextGroup = currentGroupIndex < groups.length - 1 ? groups[currentGroupIndex + 1] : undefined;
  
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

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <div className="col-span-3">
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
        
        <div className="col-span-1">
          <NextParticipantPreview 
            nextGroup={nextGroup}
            label="Nächste Gruppe"
          />
        </div>
      </div>
    </div>
  );
};

export default GroupJudging;
