
import { CriterionKey, GroupCriterionKey, Tournament } from '@/types';
import { mockTournaments } from '@/data/mockTournaments';

export const useUserCriteriaData = () => {
  const individualCriteria: { value: CriterionKey; label: string }[] = [
    { value: 'whipStrikes', label: 'Schläge' },
    { value: 'rhythm', label: 'Rhythmus' },
    { value: 'stance', label: 'Stand' },
    { value: 'posture', label: 'Körperhaltung' },
    { value: 'whipControl', label: 'Geiselführung' },
  ];
  
  const groupCriteria: { value: GroupCriterionKey; label: string }[] = [
    { value: 'whipStrikes', label: 'Schläge (Gruppe)' },
    { value: 'rhythm', label: 'Rhythmus (Gruppe)' },
    { value: 'tempo', label: 'Takt (Gruppe)' },
  ];

  // Using mock tournaments data
  const tournaments: Tournament[] = mockTournaments;

  return { individualCriteria, groupCriteria, tournaments };
};
