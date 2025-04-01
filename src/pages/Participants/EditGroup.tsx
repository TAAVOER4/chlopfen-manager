
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
import { mockGroups, mockParticipants } from '../../data/mockData';
import { useToast } from '@/hooks/use-toast';
import { Group } from '../../types';
import { isDuplicateGroup } from '../../utils/groupUtils';
import GroupInfoForm, { groupSchema, GroupFormValues } from '@/components/Groups/GroupInfoForm';
import AvailableParticipants from '@/components/Groups/AvailableParticipants';
import DeleteGroupDialog from '@/components/Groups/DeleteGroupDialog';
import { useGroupForm } from '@/hooks/useGroupForm';

const EditGroup = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [group, setGroup] = useState<Group | null>(null);
  
  const form = useForm<GroupFormValues>({
    resolver: zodResolver(groupSchema),
    defaultValues: {
      name: "",
      category: "kids",
      size: "three",
    },
  });
  
  // Find the group and initialize form data
  useEffect(() => {
    if (!id) return;
    
    const groupId = parseInt(id);
    const foundGroup = mockGroups.find(g => g.id === groupId);
    
    if (!foundGroup) {
      toast({
        title: "Gruppe nicht gefunden",
        description: "Die angeforderte Gruppe konnte nicht gefunden werden.",
        variant: "destructive"
      });
      navigate('/participants');
      return;
    }
    
    setGroup(foundGroup);
    
    form.setValue('name', foundGroup.name);
    form.setValue('category', foundGroup.category);
    form.setValue('size', foundGroup.size);
    
    const groupParticipants = mockParticipants.filter(p => 
      foundGroup.participantIds.includes(p.id)
    );
    setSelectedParticipants(groupParticipants);
  }, [id, navigate, toast, form]);

  // Initialize the useGroupForm hook with the current group's participants
  const initialParticipants = group ? 
    mockParticipants.filter(p => group.participantIds.includes(p.id)) : 
    [];
  
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
    mockParticipants 
  });

  const handleDeleteGroup = () => {
    if (!group) return;
    
    mockParticipants.forEach(participant => {
      if (participant.groupIds && participant.groupIds.includes(group.id)) {
        participant.groupIds = participant.groupIds.filter(gId => gId !== group.id);
      }
    });
    
    const groupIndex = mockGroups.findIndex(g => g.id === group.id);
    if (groupIndex !== -1) {
      mockGroups.splice(groupIndex, 1);
    }
    
    toast({
      title: "Gruppe gelöscht",
      description: `${group.name} wurde erfolgreich gelöscht.`
    });
    
    navigate('/participants');
  };

  const onSubmit = (data: GroupFormValues) => {
    if (!group) return;
    
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
    
    const participantIds = selectedParticipants.map(p => p.id);
    
    if (isDuplicateGroup(participantIds, group.id)) {
      toast({
        title: "Doppelte Gruppe",
        description: "Es existiert bereits eine Gruppe mit genau diesen Teilnehmern.",
        variant: "destructive"
      });
      return;
    }
    
    const oldParticipantIds = group.participantIds || [];
    const newParticipantIds = participantIds;
    
    // Remove participants that are no longer in the group
    oldParticipantIds.forEach(oldId => {
      if (!newParticipantIds.includes(oldId)) {
        const participantIndex = mockParticipants.findIndex(p => p.id === oldId);
        if (participantIndex !== -1 && mockParticipants[participantIndex].groupIds) {
          mockParticipants[participantIndex].groupIds = mockParticipants[participantIndex].groupIds!.filter(gId => gId !== group.id);
        }
      }
    });
    
    // Add new participants to the group
    newParticipantIds.forEach(newId => {
      if (!oldParticipantIds.includes(newId)) {
        const participantIndex = mockParticipants.findIndex(p => p.id === newId);
        if (participantIndex !== -1) {
          if (!mockParticipants[participantIndex].groupIds) {
            mockParticipants[participantIndex].groupIds = [];
          }
          mockParticipants[participantIndex].groupIds!.push(group.id);
        }
      }
    });
    
    // Update the group in the mockGroups array
    const groupIndex = mockGroups.findIndex(g => g.id === group.id);
    if (groupIndex !== -1) {
      mockGroups[groupIndex] = {
        ...mockGroups[groupIndex],
        name: data.name,
        size: data.size,
        category: data.category,
        participantIds: newParticipantIds
      };
    }
    
    toast({
      title: "Gruppe aktualisiert",
      description: `${data.name} wurde erfolgreich aktualisiert.`
    });
    
    navigate('/participants');
  };

  if (!group) {
    return <div>Lade...</div>;
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
                <Button type="submit">Gruppe speichern</Button>
              </CardFooter>
            </form>
          </Form>
        </Card>

        <AvailableParticipants 
          availableParticipants={availableParticipants}
          selectedCategory={selectedCategory}
          addParticipant={addParticipant}
          mockGroups={mockGroups}
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
