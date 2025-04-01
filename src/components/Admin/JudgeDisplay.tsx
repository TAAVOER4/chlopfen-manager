
import React from 'react';
import { Judge } from '@/types';

interface JudgeDisplayProps {
  judge: Judge;
  individualCriteriaMap: Record<string, string>;
  groupCriteriaMap: Record<string, string>;
}

const JudgeDisplay: React.FC<JudgeDisplayProps> = ({ 
  judge, 
  individualCriteriaMap,
  groupCriteriaMap
}) => {
  return (
    <div className="space-y-1">
      {judge.role === 'admin' ? (
        'Alle Kriterien'
      ) : (
        <>
          {judge.assignedCriteria?.individual && (
            <div className="text-sm">
              <span className="font-medium">Einzel:</span> {' '}
              {individualCriteriaMap[judge.assignedCriteria.individual] || 'Keine'}
            </div>
          )}
          {judge.assignedCriteria?.group && (
            <div className="text-sm">
              <span className="font-medium">Gruppe:</span> {' '}
              {groupCriteriaMap[judge.assignedCriteria.group] || 'Keine'}
            </div>
          )}
          {!judge.assignedCriteria?.individual && !judge.assignedCriteria?.group && 'Keine Kriterien zugewiesen'}
        </>
      )}
    </div>
  );
};

export default JudgeDisplay;
