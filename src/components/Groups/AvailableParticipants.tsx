import React, { useMemo } from 'react';
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui';
import { Plus } from 'lucide-react';
import { Participant, GroupCategory } from '../../types';
import { getCategoryDisplay } from '../../utils/categoryUtils';
import { useQuery } from '@tanstack/react-query';
import { ParticipantQueryService } from '@/services/database/participant';
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
      console.log("Direct fetching participants due to empty availableParticipants");
      try {
        const { data: participants, error } = await supabase
          .from('participants')
          .select('*')
          .order('display_order', { ascending: true });
          
        if (error) throw error;
        
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
          groupIds: []
        }));
      } catch (error) {
        console.error('Error directly fetching participants:', error);
        return [];
      }
    },
    enabled: availableParticipants.length === 0,
    retry: 1
  });
  
  const filteredParticipants = useMemo(() => {
    console.log("Filtering participants:");
    console.log("- availableParticipants:", availableParticipants.length);
    console.log("- directParticipants:", directParticipants.length);
    console.log("- selectedParticipants:", selectedParticipants.length);
    console.log("- activeTournament:", activeTournament?.id);
    
    const baseParticipants = availableParticipants.length > 0 
      ? availableParticipants 
      : directParticipants;
    
    return baseParticipants
      .filter(p => !selectedParticipants.some(sp => sp.id === p.id))
      .filter(p => !p.tournamentId || p.tournamentId === activeTournament?.id)
      .filter(p => {
        if (!selectedCategory || selectedCategory === 'all') return true;
        
        if (selectedCategory === 'active') return p.category === 'active';
        
        if (selectedCategory === 'kids_juniors') {
          return p.category === 'kids' || p.category === 'juniors';
        }
        
        return p.category === selectedCategory;
      });
  }, [availableParticipants, directParticipants, selectedParticipants, activeTournament, selectedCategory]);

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
