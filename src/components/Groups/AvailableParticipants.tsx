
import React, { useMemo } from 'react';
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui';
import { Plus } from 'lucide-react';
import { Participant, GroupCategory } from '../../types';
import { getCategoryDisplay } from '../../utils/categoryUtils';
import { useQuery } from '@tanstack/react-query';
import { DatabaseService } from '@/services/DatabaseService';
import { Spinner } from '@/components/ui/spinner';
import { useTournament } from '@/contexts/TournamentContext';

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
  
  // Fetch groups to show existing group memberships
  const { 
    data: allGroups = [], 
    isLoading: isLoadingGroups
  } = useQuery({
    queryKey: ['groups'],
    queryFn: DatabaseService.getAllGroups,
    retry: 1,
    staleTime: 5 * 60 * 1000,
  });
  
  // Filter available participants by tournament and exclude already selected participants
  const filteredParticipants = useMemo(() => {
    return availableParticipants
      .filter(p => !selectedParticipants.some(sp => sp.id === p.id))
      .filter(p => !p.tournamentId || p.tournamentId === activeTournament?.id);
  }, [availableParticipants, selectedParticipants, activeTournament]);

  if (isLoadingGroups) {
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
              // Show existing group memberships
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
