
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GroupCriterionKey } from '../../types';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/contexts/UserContext';

export const useJudgingAccess = (size: string | undefined, categoryParam: string | null) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentUser, isLoading } = useUser();

  // Validate size parameter and check if user is authorized
  useEffect(() => {
    // Don't run validation checks while auth state is still loading
    if (isLoading) {
      return;
    }

    if (size !== 'three' && size !== 'four') {
      navigate('/judging');
      toast({
        title: "Fehler",
        description: "Ungültige Gruppengröße",
        variant: "destructive"
      });
      return;
    }

    // Validate category parameter
    if (categoryParam && !['kids_juniors', 'active'].includes(categoryParam)) {
      toast({
        title: "Hinweis",
        description: "Keine Kategorie ausgewählt, alle Kategorien werden angezeigt"
      });
    }

    // Only check authorization after we've confirmed the user is not logged in
    // This prevents the "not logged in" error when the auth state is still loading
    if (!isLoading && !currentUser) {
      navigate('/judging');
      toast({
        title: "Fehler",
        description: "Sie sind nicht angemeldet",
        variant: "destructive"
      });
      return;
    }

    // Check if user has the right assignedCriteria for group judging
    // Skip this check for admin users
    if (!isLoading && currentUser && currentUser.role !== 'admin') {
      const validGroupCriteria: GroupCriterionKey[] = ['whipStrikes', 'rhythm', 'tempo'];
      if (!currentUser.assignedCriteria?.group || 
          !validGroupCriteria.includes(currentUser.assignedCriteria.group)) {
        navigate('/judging');
        toast({
          title: "Zugriff verweigert",
          description: "Sie sind nicht berechtigt, Gruppen zu bewerten",
          variant: "destructive"
        });
      }
    }
  }, [size, categoryParam, navigate, toast, currentUser, isLoading]);

  return { isValidAccess: true };
};
