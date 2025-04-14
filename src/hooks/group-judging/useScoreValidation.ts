
import { GroupScore, GroupCriterionKey } from '@/types';
import { useToast } from '@/hooks/use-toast';

export const useScoreValidation = (
  canEditCriterion: (criterion: GroupCriterionKey) => boolean
) => {
  const { toast } = useToast();

  const validateScore = (
    score: Partial<GroupScore>,
    groupName: string
  ): boolean => {
    // Check if required fields are filled in for current judge's criteria
    const requiredFields = ['whipStrikes', 'rhythm', 'tempo'] as const;
    const missingFields = requiredFields.filter(field => {
      if (canEditCriterion(field)) {
        const value = score[field];
        return value === undefined || value === null || value === '';
      }
      return false;
    });

    if (missingFields.length > 0) {
      toast({
        title: "Fehlende Bewertungen",
        description: `Bitte geben Sie Bewertungen für alle Ihnen zugewiesenen Kriterien für ${groupName} ein.`,
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  return { validateScore };
};
