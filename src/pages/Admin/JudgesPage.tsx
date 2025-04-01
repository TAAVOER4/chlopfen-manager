import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, UserPlus, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { mockJudges, updateMockJudges } from '@/data/mockJudges';
import { Judge, CriterionKey, GroupCriterionKey } from '@/types';
import { useUser } from '@/contexts/UserContext';
import DeleteJudgeDialog from '@/components/Admin/DeleteJudgeDialog';
import JudgeTable from '@/components/Admin/JudgeTable';

const JudgesPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [judges, setJudges] = useState<Judge[]>(mockJudges);
  const [editingJudge, setEditingJudge] = useState<Judge | null>(null);
  const [judgeToDelete, setJudgeToDelete] = useState<Judge | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const { impersonate } = useUser();
  
  // Available criteria for assignment
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

  const handleImpersonate = (judgeId: string) => {
    const judge = judges.find(j => j.id === judgeId);
    if (judge) {
      impersonate(judge);
      
      if (judge.role === 'judge') {
        navigate('/judging');
      } else {
        navigate('/');
      }
    }
  };

  const handleEdit = (judge: Judge) => {
    setEditingJudge({ ...judge });
  };

  const handleJudgeChange = (updatedJudge: Judge) => {
    setEditingJudge(updatedJudge);
  };

  const handleSave = () => {
    if (editingJudge) {
      const updatedJudges = judges.map(j => 
        j.id === editingJudge.id ? editingJudge : j
      );
      
      setJudges(updatedJudges);
      // Update the mockJudges in the data file
      updateMockJudges(updatedJudges);
      setEditingJudge(null);
      
      toast({
        title: "Richter aktualisiert",
        description: `Daten für ${editingJudge.name} wurden gespeichert.`
      });
    }
  };

  const handleAddJudge = () => {
    const newJudge: Judge = {
      id: `judge_${Date.now()}`,
      name: 'Neuer Richter',
      username: 'neuer.richter',
      role: 'judge',
      assignedCriteria: {
        individual: 'rhythm'
      }
    };
    
    const updatedJudges = [...judges, newJudge];
    setJudges(updatedJudges);
    // Update the mockJudges in the data file
    updateMockJudges(updatedJudges);
    setEditingJudge(newJudge);
    
    toast({
      title: "Neuer Richter",
      description: "Bitte vervollständigen Sie die Daten des neuen Richters."
    });
  };

  const handleDeleteClick = (judge: Judge) => {
    setJudgeToDelete(judge);
    setDeleteDialogOpen(true);
  };

  const handleDeleteJudge = (judgeId: string) => {
    const updatedJudges = judges.filter(j => j.id !== judgeId);
    setJudges(updatedJudges);
    // Update the mockJudges in the data file
    updateMockJudges(updatedJudges);
    
    toast({
      title: "Richter gelöscht",
      description: "Der Richter wurde erfolgreich gelöscht."
    });
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Button variant="ghost" onClick={() => navigate('/admin')} className="mr-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Zurück
          </Button>
          <h1 className="text-3xl font-bold text-swiss-blue">Richterverwaltung</h1>
        </div>
        <Button onClick={handleAddJudge}>
          <UserPlus className="h-4 w-4 mr-2" />
          Neuer Richter
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="h-5 w-5 mr-2" />
            Richter und Berechtigungen
          </CardTitle>
        </CardHeader>
        <CardContent>
          <JudgeTable
            judges={judges}
            editingJudge={editingJudge}
            onEdit={handleEdit}
            onSave={handleSave}
            onImpersonate={handleImpersonate}
            onDeleteClick={handleDeleteClick}
            onJudgeChange={handleJudgeChange}
            individualCriteria={individualCriteria}
            groupCriteria={groupCriteria}
          />
        </CardContent>
        <CardFooter className="justify-between">
          <Button variant="outline" onClick={() => navigate('/admin')}>
            Zurück
          </Button>
        </CardFooter>
      </Card>
      
      <DeleteJudgeDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        judge={judgeToDelete}
        onDelete={handleDeleteJudge}
      />
    </div>
  );
};

export default JudgesPage;
