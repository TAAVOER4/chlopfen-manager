
import React, { useMemo } from 'react';
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui';
import { Plus } from 'lucide-react';
import { Participant, GroupCategory } from '../../types';
import { getCategoryDisplay } from '../../utils/categoryUtils';
import { useQuery } from '@tanstack/react-query';
import { Spinner } from '@/components/ui/spinner';
import { useTournament } from '@/contexts/TournamentContext';
import { supabase } from '@/lib/supabase';

export interface AvailableParticipantsProps {
  availableParticipants: Participant[];
  selectedCategory: string;
  addParticipant: (participant: Participant) => void;
  selectedParticipants: Participant[];
  currentGroupId?: number;
}

const AvailableParticipants: React.FC<AvailableParticipantsProps> = ({
  availableParticipants,
  selectedCategory,
  addParticipant,
  selectedParticipants,
  currentGroupId
}) => {
  const { activeTournament } = useTournament();
  
  const { 
    data: allGroups = [], 
    isLoading: isLoadingGroups
  } = useQuery({
    queryKey: ['groups'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('groups')
          .select('*')
          .order('display_order', { ascending: true });
          
        if (error) throw error;
        
        const { data: groupParticipants, error: relError } = await supabase
          .from('group_participants')
          .select('*');
          
        if (relError) throw relError;
        
        const transformedData = data.map(group => ({
          id: group.id,
          name: group.name,
          category: group.category,
          size: group.size,
          tournamentId: group.tournament_id,
          displayOrder: group.display_order,
          participantIds: groupParticipants
            .filter(gp => gp.group_id === group.id)
            .map(gp => gp.participant_id)
        }));
        
        return transformedData;
      } catch (error) {
        console.error('Error fetching groups:', error);
        return [];
      }
    },
    retry: 1,
    staleTime: 5 * 60 * 1000,
  });
  
  const { 
    data: directParticipants = [], 
    isLoading: isLoadingDirectParticipants 
  } = useQuery({
    queryKey: ['direct-participants', activeTournament?.id],
    queryFn: async () => {
      console.log("Direct fetching participants in AvailableParticipants component");
      try {
        const { data: participants, error } = await supabase
          .from('participants')
          .select('*')
          .order('display_order', { ascending: true });
          
        if (error) throw error;
        
        console.log(`Fetched ${participants.length} participants directly in AvailableParticipants`);
        
        // Fetch all group-participant relationships
        const { data: groupParticipants, error: relError } = await supabase
          .from('group_participants')
          .select('*');
          
        if (relError) {
          console.error('Error loading group-participant relationships:', relError);
        }
        
        return participants.map(p => ({
          id: p.id,
          firstName: p.first_name,
          lastName: p.last_name,
          location: p.location,
          birthYear: p.birth_year,
          category: p.category,
          isGroupOnly: p.is_group_only || false,
          tournamentId: p.tournament_id,
          displayOrder: p.display_order,
          groupIds: groupParticipants
            ? groupParticipants.filter(gp => gp.participant_id === p.id).map(gp => gp.group_id)
            : []
        }));
      } catch (error) {
        console.error('Error directly fetching participants:', error);
        return [];
      }
    },
    enabled: true, // Always fetch directly, don't rely on availableParticipants prop
    retry: 1,
    staleTime: 0 // Don't cache this data
  });
  
  const filteredParticipants = useMemo(() => {
    console.log("Filtering participants in AvailableParticipants:");
    console.log("- selectedCategory:", selectedCategory);
    console.log("- directParticipants:", directParticipants.length);
    console.log("- selectedParticipants:", selectedParticipants.map(p => p.id));
    console.log("- activeTournament:", activeTournament?.id);
    
    // Always use directParticipants as the base, don't depend on availableParticipants prop
    return directParticipants
      // Filter out already selected participants
      .filter(p => !selectedParticipants.some(sp => sp.id === p.id))
      // Only show participants associated with the current tournament
      .filter(p => !p.tournamentId || p.tournamentId === activeTournament?.id);
      // Remove category filtering to show all participants
  }, [directParticipants, selectedParticipants, activeTournament]);

  console.log(`Final filtered participants: ${filteredParticipants.length}`);

  const isLoading = isLoadingGroups || isLoadingDirectParticipants;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Verfügbare Teilnehmer</CardTitle>
          <CardDescription>Daten werden geladen...</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Spinner />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Verfügbare Teilnehmer</CardTitle>
        <CardDescription>
          Wählen Sie Teilnehmer für die Gruppe aus
          {selectedCategory && ` (${getCategoryDisplay(selectedCategory as any)})`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {filteredParticipants.length > 0 ? (
          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
            {filteredParticipants.map((participant) => {
              const existingGroups = participant.groupIds?.map(gId => {
                if (currentGroupId && gId === currentGroupId) return null;
                const group = allGroups.find(g => g.id === gId);
                return group?.name || '';
              }).filter(Boolean).join(', ');
              
              return (
                <div 
                  key={participant.id} 
                  className="flex items-center justify-between p-3 border rounded-md hover:bg-accent/50 cursor-pointer"
                  onClick={() => addParticipant(participant)}
                >
                  <div>
                    <div className="font-medium">{participant.firstName} {participant.lastName}</div>
                    <div className="text-sm text-muted-foreground">{participant.location}, {participant.birthYear}</div>
                    <div className="text-xs text-muted-foreground">
                      {getCategoryDisplay(participant.category)}
                    </div>
                    {existingGroups && (
                      <div className="text-xs text-muted-foreground mt-1">
                        Bereits in: {existingGroups}
                      </div>
                    )}
                  </div>
                  <Button size="icon" variant="ghost">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              {selectedCategory ? 
                `Keine verfügbaren Teilnehmer in der Kategorie ${getCategoryDisplay(selectedCategory as any)}` : 
                'Keine verfügbaren Teilnehmer'
              }
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AvailableParticipants;
