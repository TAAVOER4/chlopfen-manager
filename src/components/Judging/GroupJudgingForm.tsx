
import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Save } from 'lucide-react';
import {
  Card,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Group, GroupCriterionKey, GroupScore } from '../../types';
import { Spinner } from '@/components/ui/spinner';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

interface GroupJudgingFormProps {
  currentGroup: Group;
  scores: Record<number, Partial<GroupScore>>;
  handleScoreChange: (groupId: number, criterion: keyof Omit<GroupScore, 'groupId' | 'judgeId' | 'time'>, value: number) => void;
  handleSaveScore: () => void;
  canEditCriterion: (criterion: GroupCriterionKey) => boolean;
  currentGroupIndex: number;
  totalGroups: number;
  isSaving?: boolean;
  canSubmitScores?: boolean;
  isLoadingScores?: boolean;
}

const GroupJudgingForm: React.FC<GroupJudgingFormProps> = ({
  currentGroup,
  scores,
  handleScoreChange,
  handleSaveScore,
  canEditCriterion,
  currentGroupIndex,
  totalGroups,
  isSaving = false,
  canSubmitScores = false,
  isLoadingScores = false
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
  
  // Check if all required fields have been filled
  const hasAllRequiredFields = criteriaToShow.every(criterion => 
    scores[currentGroup.id]?.[criterion.key] !== undefined && 
    scores[currentGroup.id]?.[criterion.key] !== null
  );

  // Log current scores for debugging
  useEffect(() => {
    if (scores && currentGroup) {
      console.log('Current scores for group:', currentGroup.id, scores[currentGroup.id]);
    }
  }, [scores, currentGroup]);

  // Access denied message if user can't submit scores
  if (!canSubmitScores) {
    return (
      <Card className="mb-6">
        <CardContent className="pt-6">
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Zugriff verweigert</AlertTitle>
            <AlertDescription>
              Sie sind nicht berechtigt, Bewertungen zu speichern. Nur Administratoren und Richter können Bewertungen vornehmen.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  // Show loading state while scores are being fetched
  if (isLoadingScores) {
    return (
      <Card className="mb-6">
        <CardContent className="py-6">
          <div className="flex flex-col items-center justify-center py-8">
            <Spinner size="default" />
            <p className="mt-4 text-muted-foreground">Bewertungen werden geladen...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

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
                  placeholder="Bewertung eingeben (1-10)"
                  value={scores[currentGroup.id]?.[criterion.key] || ''}
                  onChange={(e) => handleScoreChange(
                    currentGroup.id, 
                    criterion.key, 
                    e.target.value === '' ? 0 : Number(e.target.value)
                  )}
                  disabled={isSaving || !canEditCriterion(criterion.key)}
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
          disabled={!hasAllRequiredFields || criteriaToShow.length === 0 || isSaving}
        >
          {isSaving ? (
            <>
              <Spinner className="mr-2" size="sm" /> Speichern...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" /> 
              {currentGroupIndex < totalGroups - 1 ? 'Speichern und weiter' : 'Speichern und beenden'}
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default GroupJudgingForm;
