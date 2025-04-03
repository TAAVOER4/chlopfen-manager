
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Plus } from 'lucide-react';
import { format } from 'date-fns';
import { Tournament } from '@/types';
import { useUser } from '@/contexts/UserContext';
import { useTournament } from '@/contexts/TournamentContext';

import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import ActiveTournamentCard from '@/components/Admin/Tournaments/ActiveTournamentCard';
import TournamentsTable from '@/components/Admin/Tournaments/TournamentsTable';
import TournamentDialog from '@/components/Admin/Tournaments/TournamentDialog';
import DeleteTournamentDialog from '@/components/Admin/Tournaments/DeleteTournamentDialog';
import { TournamentFormValues } from '@/components/Admin/Tournaments/TournamentForm';

const TournamentPage = () => {
  const { isAdmin } = useUser();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { tournaments, activeTournament, setActiveTournament, updateTournament, addTournament, deleteTournament } = useTournament();
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [tournamentToDelete, setTournamentToDelete] = useState<Tournament | null>(null);
  
  // Store the ID of tournament being edited (not part of form schema)
  // Moved this state declaration up to ensure consistent hook ordering
  const [editingTournamentId, setEditingTournamentId] = useState<number | null>(null);
  
  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <h2 className="text-2xl font-bold mb-4">Zugriff verweigert</h2>
        <p className="text-muted-foreground mb-4">Sie haben keine Berechtigung, diese Seite zu sehen.</p>
        <Button asChild>
          <a href="/">Zurück zur Startseite</a>
        </Button>
      </div>
    );
  }
  
  const handleEdit = (tournament: Tournament) => {
    setIsEditing(true);
    const formValues: TournamentFormValues = {
      name: tournament.name,
      date: new Date(tournament.date),
      location: tournament.location,
      year: tournament.year,
      isActive: tournament.isActive,
    };
    
    // Use this technique to store the id without adding it to the form schema
    setEditingTournamentId(tournament.id);
    setDialogOpen(true);
  };
  
  const handleAdd = () => {
    setIsEditing(false);
    setEditingTournamentId(null);
    setDialogOpen(true);
  };
  
  const handleDeleteClick = (tournament: Tournament) => {
    setTournamentToDelete(tournament);
    setDeleteConfirmOpen(true);
  };
  
  const handleDelete = () => {
    if (!tournamentToDelete) return;
    
    deleteTournament(tournamentToDelete.id);
    
    toast({
      title: "Turnier gelöscht",
      description: `Das Turnier "${tournamentToDelete.name}" wurde erfolgreich gelöscht.`,
    });
    
    setDeleteConfirmOpen(false);
    setTournamentToDelete(null);
  };
  
  const handleSetActive = (tournament: Tournament) => {
    setActiveTournament({
      ...tournament,
      isActive: true,
    });
    
    toast({
      title: "Aktives Turnier festgelegt",
      description: `"${tournament.name}" ist jetzt das aktive Turnier.`,
    });
  };
  
  const onSubmit = (values: TournamentFormValues) => {
    if (isEditing && editingTournamentId !== null) {
      const updatedTournament: Tournament = {
        id: editingTournamentId,
        name: values.name,
        date: format(values.date, 'yyyy-MM-dd'),
        location: values.location,
        year: values.year,
        isActive: values.isActive
      };
      
      updateTournament(updatedTournament);
      
      toast({
        title: "Turnier aktualisiert",
        description: `Das Turnier "${values.name}" wurde erfolgreich aktualisiert.`,
      });
    } else {
      const newTournament: Tournament = {
        id: Math.max(0, ...tournaments.map(t => t.id)) + 1,
        name: values.name,
        date: format(values.date, 'yyyy-MM-dd'),
        location: values.location,
        year: values.year,
        isActive: values.isActive
      };
      
      addTournament(newTournament);
      
      toast({
        title: "Turnier erstellt",
        description: `Das Turnier "${values.name}" wurde erfolgreich erstellt.`,
      });
    }
    
    setDialogOpen(false);
  };
  
  const goToParticipantAssignment = (tournamentId: number) => {
    navigate(`/admin/tournament/${tournamentId}/participants`);
  };
  
  const goToJudgeAssignment = (tournamentId: number) => {
    navigate(`/admin/tournament/${tournamentId}/judges`);
  };
  
  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-swiss-blue">Turniereinstellungen</h1>
        <Button onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" /> Neues Turnier
        </Button>
      </div>
      
      {activeTournament && (
        <ActiveTournamentCard 
          tournament={activeTournament}
          onEdit={handleEdit}
          onParticipantAssignment={goToParticipantAssignment}
          onJudgeAssignment={goToJudgeAssignment}
        />
      )}
      
      <Card>
        <CardHeader>
          <CardTitle>Alle Turniere</CardTitle>
          <CardDescription>Verwaltung aller Turniere nach Jahr</CardDescription>
        </CardHeader>
        <CardContent>
          <TournamentsTable
            tournaments={tournaments}
            onSetActive={handleSetActive}
            onEdit={handleEdit}
            onDelete={handleDeleteClick}
          />
        </CardContent>
      </Card>
      
      <TournamentDialog
        isOpen={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={onSubmit}
        isEditing={isEditing}
        defaultValues={isEditing && editingTournamentId !== null ? {
          name: tournaments.find(t => t.id === editingTournamentId)?.name || '',
          date: new Date(tournaments.find(t => t.id === editingTournamentId)?.date || new Date()),
          location: tournaments.find(t => t.id === editingTournamentId)?.location || '',
          year: tournaments.find(t => t.id === editingTournamentId)?.year || new Date().getFullYear(),
          isActive: tournaments.find(t => t.id === editingTournamentId)?.isActive || false,
        } : undefined}
      />
      
      <DeleteTournamentDialog
        tournament={tournamentToDelete}
        isOpen={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        onConfirmDelete={handleDelete}
      />
    </div>
  );
};

export default TournamentPage;
