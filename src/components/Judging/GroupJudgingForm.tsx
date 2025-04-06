
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Save } from 'lucide-react';
import {
  Card,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Group, GroupCriterionKey, GroupScore } from '../../types';

interface GroupJudgingFormProps {
  currentGroup: Group;
  scores: Record<number, Partial<GroupScore>>;
  handleScoreChange: (groupId: number, criterion: keyof Omit<GroupScore, 'groupId' | 'judgeId' | 'time'>, value: number) => void;
  handleSaveScore: () => void;
  canEditCriterion: (criterion: GroupCriterionKey) => boolean;
  currentGroupIndex: number;
  totalGroups: number;
}

const GroupJudgingForm: React.FC<GroupJudgingFormProps> = ({
  currentGroup,
  scores,
  handleScoreChange,
  handleSaveScore,
  canEditCriterion,
  currentGroupIndex,
  totalGroups
}) => {
  // All possible criteria
  const allCriteria = [
    { key: 'whipStrikes' as GroupCriterionKey, 
      title: '1. Schläge (Note 1-10)', 
      label: 'Schläge Bewertung', 
      description: '' },
    { key: 'rhythm' as GroupCriterionKey, 
      title: '2. Rhythmus (Note 1-10)', 
      label: 'Rhythmus Bewertung', 
      description: 'Anfang bis Ende, gleich schnell und laut' },
    { key: 'tempo' as GroupCriterionKey, 
      title: '3. Takt (Note 1-10)', 
      label: 'Takt Bewertung', 
      description: 'Gleiche Taktgeschwindigkeit vom Anfang bis zum Schluss' }
  ];
  
  // Filter to only show criteria that the current judge is authorized to see and edit
  const criteriaToShow = allCriteria.filter(criterion => canEditCriterion(criterion.key));

  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="space-y-6">
          {criteriaToShow.map((criterion) => (
            <div key={criterion.key}>
              <h3 className="font-medium mb-2">{criterion.title}</h3>
              <div>
                <label className="text-sm font-medium">{criterion.label}</label>
                {criterion.description && (
                  <p className="text-xs text-muted-foreground mb-1">
                    {criterion.description}
                  </p>
                )}
                <Input 
                  type="number" 
                  className="w-full mt-1"
                  min="1"
                  max="10"
                  step="0.1"
                  value={scores[currentGroup.id]?.[criterion.key] || 1}
                  onChange={(e) => handleScoreChange(
                    currentGroup.id, 
                    criterion.key, 
                    Number(e.target.value)
                  )}
                />
              </div>
            </div>
          ))}
          
          {criteriaToShow.length === 0 && (
            <div className="p-6 text-center">
              <p className="text-muted-foreground">
                Sie haben keine Kriterien zugewiesen bekommen, die Sie bewerten können.
              </p>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full" 
          onClick={handleSaveScore}
          disabled={criteriaToShow.length === 0}
        >
          <Save className="mr-2 h-4 w-4" /> 
          {currentGroupIndex < totalGroups - 1 ? 'Speichern und weiter' : 'Speichern und beenden'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default GroupJudgingForm;
