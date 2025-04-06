
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GroupCriterionKey } from '../../types';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/contexts/UserContext';

export const useJudgingAccess = (size: string | undefined, categoryParam: string | null) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentUser, isLoading } = useUser();
  const [hasCheckedAccess, setHasCheckedAccess] = useState(false);
  const [accessValid, setAccessValid] = useState(false);

  // Validate size parameter and check if user is authorized
  useEffect(() => {
    // Don't run validation checks while auth state is still loading
    if (isLoading || hasCheckedAccess) {
      return;
    }

    console.log("Checking access for group judging:", { size, category: categoryParam, userLoaded: !!currentUser });

    let valid = true;

    if (size !== 'three' && size !== 'four') {
      console.log("Invalid size parameter:", size);
      navigate('/judging');
      toast({
        title: "Fehler",
        description: "Ungültige Gruppengröße",
        variant: "destructive"
      });
      valid = false;
    }

    // Validate category parameter
    if (categoryParam && !['kids_juniors', 'active'].includes(categoryParam)) {
      toast({
        title: "Hinweis",
        description: "Keine Kategorie ausgewählt, alle Kategorien werden angezeigt"
      });
    }

    // Check if user is logged in
    if (!currentUser) {
      console.log("User not logged in");
      navigate('/judging');
      toast({
        title: "Fehler",
        description: "Sie sind nicht angemeldet",
        variant: "destructive"
      });
      valid = false;
    }

    // Check if user has the right assignedCriteria for group judging
    // Skip this check for admin users
    if (currentUser && currentUser.role !== 'admin') {
      const validGroupCriteria: GroupCriterionKey[] = ['whipStrikes', 'rhythm', 'tempo'];
      if (!currentUser.assignedCriteria?.group || 
          !validGroupCriteria.includes(currentUser.assignedCriteria.group)) {
        console.log("User does not have valid group criteria:", currentUser.assignedCriteria?.group);
        navigate('/judging');
        toast({
          title: "Zugriff verweigert",
          description: "Sie sind nicht berechtigt, Gruppen zu bewerten",
          variant: "destructive"
        });
        valid = false;
      }
    }

    setAccessValid(valid);
    setHasCheckedAccess(true);
    
    console.log("Access check complete, result:", valid);
  }, [size, categoryParam, navigate, toast, currentUser, isLoading, hasCheckedAccess]);

  return { 
    isValidAccess: accessValid,
    isChecking: isLoading || !hasCheckedAccess
  };
};
