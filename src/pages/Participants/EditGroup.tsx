
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Trash } from 'lucide-react';
import { 
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui';
import { Form } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from '@/hooks/use-toast';
import { Group, GroupSize, GroupCategory } from '@/types';
import GroupInfoForm, { groupSchema, GroupFormValues } from '@/components/Groups/GroupInfoForm';
import AvailableParticipants from '@/components/Groups/AvailableParticipants';
import DeleteGroupDialog from '@/components/Groups/DeleteGroupDialog';
import { useGroupForm } from '@/hooks/useGroupForm';
import { DatabaseService } from '@/services/DatabaseService';
import { useTournament } from '@/contexts/TournamentContext';
import { useQuery } from '@tanstack/react-query';

const EditGroup = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [group, setGroup] = useState<Group | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { activeTournament } = useTournament();
  
  const form = useForm<GroupFormValues>({
    resolver: zodResolver(groupSchema),
    defaultValues: {
      name: "",
      category: "kids_juniors",
      size: "three",
    },
  });
  
  // Fetch all groups
  const { data: groups = [], isLoading: isLoadingGroups } = useQuery({
    queryKey: ['groups'],
    queryFn: DatabaseService.getAllGroups,
    staleTime: 5 * 60 * 1000,
  });
  
  // Find the group from the fetched data
  useEffect(() => {
    if (!id || isLoadingGroups || groups.length === 0) return;
    
    const groupId = parseInt(id);
    const foundGroup = groups.find(g => g.id === groupId);
    
    if (!foundGroup) {
      toast({
        title: "Gruppe nicht gefunden",
        description: "Die angeforderte Gruppe konnte nicht gefunden werden.",
        variant: "destructive"
      });
      navigate('/participants');
      return;
    }
    
    console.log("Found group:", foundGroup);
    setGroup(foundGroup);
    
    form.setValue('name', foundGroup.name);
    form.setValue('category', foundGroup.category);
    form.setValue('size', foundGroup.size);
  }, [id, navigate, toast, form, groups, isLoadingGroups]);

  // Fetch participants for the current group
  const { data: participants = [], isLoading: isLoadingParticipants } = useQuery({
    queryKey: ['participants'],
    queryFn: DatabaseService.getAllParticipants,
    staleTime: 5 * 60 * 1000,
  });

  // Initialize the useGroupForm hook with the current group's participants
  const initialParticipants = React.useMemo(() => {
    if (!group || !participants.length) return [];
    return participants.filter(p => group.participantIds.includes(p.id));
  }, [group, participants]);
  
  const {
    selectedParticipants,
    setSelectedParticipants,
    availableParticipants,
    selectedCategory,
    addParticipant,
    removeParticipant,
    handleNameChange,
    handleRegenerateName
  } = useGroupForm({ 
    form, 
    initialParticipants,
    currentGroupId: group?.id
  });

  const handleDeleteGroup = async () => {
    if (!group) return;
    
    try {
      await DatabaseService.deleteGroup(group.id);
      
      toast({
        title: "Gruppe gelöscht",
        description: `${group.name} wurde erfolgreich gelöscht.`
      });
      
      navigate('/participants');
    } catch (error) {
      console.error("Error deleting group:", error);
      toast({
        title: "Fehler beim Löschen",
        description: "Die Gruppe konnte nicht gelöscht werden.",
        variant: "destructive"
      });
    }
  };

  const onSubmit = async (data: GroupFormValues) => {
    if (!group || !activeTournament) return;
    
    if (selectedParticipants.length === 0) {
      toast({
        title: "Keine Teilnehmer ausgewählt",
        description: "Bitte wählen Sie mindestens einen Teilnehmer aus.",
        variant: "destructive"
      });
      return;
    }

    const requiredParticipants = data.size === 'three' ? 3 : 4;
    if (selectedParticipants.length !== requiredParticipants) {
      toast({
        title: "Falsche Anzahl an Teilnehmern",
        description: `Eine ${data.size === 'three' ? 'Dreier' : 'Vierer'}gruppe muss genau ${requiredParticipants} Teilnehmer haben.`,
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      const updatedGroup: Group = {
        id: group.id,
        name: data.name,
        category: data.category as GroupCategory,
        size: data.size as GroupSize,
        participantIds: selectedParticipants.map(p => p.id),
        tournamentId: activeTournament.id
      };
      
      console.log("Updating group:", updatedGroup);
      await DatabaseService.updateGroup(updatedGroup);
      
      toast({
        title: "Gruppe aktualisiert",
        description: `${data.name} wurde erfolgreich aktualisiert.`
      });
      
      navigate('/participants');
    } catch (error) {
      console.error("Error updating group:", error);
      toast({
        title: "Fehler beim Speichern",
        description: "Die Gruppe konnte nicht aktualisiert werden.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingGroups || isLoadingParticipants) {
    return <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-lg">Lade Daten...</p>
      </div>
    </div>;
  }

  if (!group) {
    return <div className="text-center p-8">
      <h2 className="text-xl font-bold mb-2">Gruppe nicht gefunden</h2>
      <p className="mb-4">Die angeforderte Gruppe konnte nicht gefunden werden.</p>
      <Button onClick={() => navigate('/participants')}>
        Zurück zur Übersicht
      </Button>
    </div>;
  }

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Button variant="ghost" onClick={() => navigate('/participants')} className="mr-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Zurück
          </Button>
          <h1 className="text-3xl font-bold text-swiss-blue">Gruppe bearbeiten</h1>
        </div>
        <Button 
          variant="destructive" 
          onClick={() => setDeleteDialogOpen(true)}
        >
          <Trash className="h-4 w-4 mr-2" />
          Gruppe löschen
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardHeader>
                <CardTitle>Gruppeninformationen</CardTitle>
                <CardDescription>
                  Bearbeiten Sie die Informationen der Gruppe
                </CardDescription>
              </CardHeader>
              <CardContent>
                <GroupInfoForm 
                  form={form}
                  selectedParticipants={selectedParticipants}
                  handleNameChange={handleNameChange}
                  handleRegenerateName={handleRegenerateName}
                  removeParticipant={removeParticipant}
                />
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" type="button" onClick={() => navigate('/participants')}>
                  Abbrechen
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Speichern..." : "Gruppe speichern"}
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>

        <AvailableParticipants 
          availableParticipants={availableParticipants}
          selectedCategory={selectedCategory}
          addParticipant={addParticipant}
          selectedParticipants={selectedParticipants}
          currentGroupId={group.id}
        />
      </div>

      <DeleteGroupDialog 
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        group={group}
        onDelete={handleDeleteGroup}
      />
    </div>
  );
};

export default EditGroup;
