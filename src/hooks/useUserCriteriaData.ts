
import { useState, useEffect } from 'react';
import { CriterionKey, GroupCriterionKey, Tournament } from '@/types';
import { BaseSupabaseService } from '@/services/BaseSupabaseService';

// Criterion mapping for individual criteria
const individualCriteriaOptions = [
  { value: 'whip_control', label: 'Geisselführung' },
  { value: 'posture', label: 'Haltung' },
  { value: 'stance', label: 'Stand' },
  { value: 'rhythm', label: 'Rhythmus' },
  { value: 'whip_strikes', label: 'Schlagerfolge' }
];

// Criterion mapping for group criteria
const groupCriteriaOptions = [
  { value: 'rhythm', label: 'Rhythmus' },
  { value: 'tempo', label: 'Tempo' },
  { value: 'whip_strikes', label: 'Schlagerfolge' }
];

export const useUserCriteriaData = () => {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch tournaments from database
  useEffect(() => {
    const fetchTournaments = async () => {
      setLoading(true);
      try {
        const { data, error } = await BaseSupabaseService.getClient()
          .from('tournaments')
          .select('*')
          .order('date', { ascending: false });
          
        if (error) {
          console.error('Error fetching tournaments:', error);
          return;
        }

        if (data) {
          // Convert database fields to match our Tournament type
          const mappedTournaments = data.map(t => ({
            id: t.id,
            name: t.name,
            date: t.date,
            location: t.location,
            year: t.year,
            isActive: t.is_active // Map from is_active to isActive
          })) as Tournament[];
          
          setTournaments(mappedTournaments);
        }
      } catch (error) {
        console.error('Error in fetchTournaments:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTournaments();
  }, []);

  return {
    individualCriteria: individualCriteriaOptions,
    groupCriteria: groupCriteriaOptions,
    tournaments,
    loading
  };
};
