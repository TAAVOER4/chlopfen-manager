
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
  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="space-y-6">
          <div>
            <h3 className="font-medium mb-2">1. Schläge (Note 1-10)</h3>
            <div>
              <label className="text-sm font-medium">Schläge Bewertung</label>
              <Input 
                type="number" 
                className="w-full mt-1"
                min="1"
                max="10"
                step="0.1"
                value={scores[currentGroup.id]?.whipStrikes || 1}
                onChange={(e) => handleScoreChange(
                  currentGroup.id, 
                  'whipStrikes', 
                  Number(e.target.value)
                )}
                disabled={!canEditCriterion('whipStrikes')}
              />
              {!canEditCriterion('whipStrikes') && (
                <p className="text-xs text-muted-foreground mt-1">
                  Sie können dieses Kriterium nicht bewerten
                </p>
              )}
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-2">2. Rhythmus (Note 1-10)</h3>
            <div>
              <label className="text-sm font-medium">Rhythmus Bewertung</label>
              <p className="text-xs text-muted-foreground mb-1">
                Anfang bis Ende, gleich schnell und laut
              </p>
              <Input 
                type="number" 
                className="w-full mt-1"
                min="1"
                max="10"
                step="0.1"
                value={scores[currentGroup.id]?.rhythm || 1}
                onChange={(e) => handleScoreChange(
                  currentGroup.id, 
                  'rhythm', 
                  Number(e.target.value)
                )}
                disabled={!canEditCriterion('rhythm')}
              />
              {!canEditCriterion('rhythm') && (
                <p className="text-xs text-muted-foreground mt-1">
                  Sie können dieses Kriterium nicht bewerten
                </p>
              )}
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-2">3. Takt (Note 1-10)</h3>
            <div>
              <label className="text-sm font-medium">Takt Bewertung</label>
              <p className="text-xs text-muted-foreground mb-1">
                Gleiche Taktgeschwindigkeit vom Anfang bis zum Schluss
              </p>
              <Input 
                type="number" 
                className="w-full mt-1"
                min="1"
                max="10"
                step="0.1"
                value={scores[currentGroup.id]?.tempo || 1}
                onChange={(e) => handleScoreChange(
                  currentGroup.id, 
                  'tempo', 
                  Number(e.target.value)
                )}
                disabled={!canEditCriterion('tempo')}
              />
              {!canEditCriterion('tempo') && (
                <p className="text-xs text-muted-foreground mt-1">
                  Sie können dieses Kriterium nicht bewerten
                </p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full" 
          onClick={handleSaveScore}
        >
          <Save className="mr-2 h-4 w-4" /> 
          {currentGroupIndex < totalGroups - 1 ? 'Speichern und weiter' : 'Speichern und beenden'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default GroupJudgingForm;
