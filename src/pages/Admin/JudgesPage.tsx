
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Edit, 
  Save,
  UserPlus, 
  UserCheck,
  User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { mockJudges } from '@/data/mockJudges';
import { Judge, CriterionKey, GroupCriterionKey } from '@/types';
import { useUser } from '@/contexts/UserContext';

const JudgesPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [judges, setJudges] = useState<Judge[]>(mockJudges);
  const [editingJudge, setEditingJudge] = useState<Judge | null>(null);
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
    { value: 'time', label: 'Zeit (Gruppe)' },
  ];

  const handleImpersonate = (judgeId: string) => {
    const judge = judges.find(j => j.id === judgeId);
    if (judge) {
      impersonate(judge);
      
      // Redirect to the judging page if they're a judge
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

  const handleSave = () => {
    if (editingJudge) {
      setJudges(judges.map(j => j.id === editingJudge.id ? editingJudge : j));
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
    
    setJudges([...judges, newJudge]);
    setEditingJudge(newJudge);
    
    toast({
      title: "Neuer Richter",
      description: "Bitte vervollständigen Sie die Daten des neuen Richters."
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Benutzername</TableHead>
                <TableHead>Rolle</TableHead>
                <TableHead>Zugewiesene Kriterien</TableHead>
                <TableHead className="text-right">Aktionen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {judges.map(judge => (
                <TableRow key={judge.id}>
                  <TableCell>
                    {editingJudge?.id === judge.id ? (
                      <Input 
                        value={editingJudge.name}
                        onChange={(e) => setEditingJudge({...editingJudge, name: e.target.value})}
                      />
                    ) : (
                      judge.name
                    )}
                  </TableCell>
                  <TableCell>
                    {editingJudge?.id === judge.id ? (
                      <Input 
                        value={editingJudge.username}
                        onChange={(e) => setEditingJudge({...editingJudge, username: e.target.value})}
                      />
                    ) : (
                      judge.username
                    )}
                  </TableCell>
                  <TableCell>
                    {editingJudge?.id === judge.id ? (
                      <Select 
                        value={editingJudge.role}
                        onValueChange={(value) => setEditingJudge({...editingJudge, role: value as 'admin' | 'judge'})}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Rolle auswählen" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Administrator</SelectItem>
                          <SelectItem value="judge">Richter</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      judge.role === 'admin' ? 'Administrator' : 'Richter'
                    )}
                  </TableCell>
                  <TableCell>
                    {editingJudge?.id === judge.id && editingJudge.role === 'judge' ? (
                      <div className="space-y-2">
                        <div>
                          <Label htmlFor="individual-criterion">Einzelwertung</Label>
                          <Select 
                            value={editingJudge.assignedCriteria?.individual || ''}
                            onValueChange={(value) => {
                              const updatedCriteria = {
                                ...(editingJudge.assignedCriteria || {}),
                                individual: value as CriterionKey
                              };
                              setEditingJudge({
                                ...editingJudge, 
                                assignedCriteria: updatedCriteria
                              });
                            }}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Kriterium auswählen" />
                            </SelectTrigger>
                            <SelectContent>
                              {individualCriteria.map((criterion) => (
                                <SelectItem key={criterion.value} value={criterion.value}>
                                  {criterion.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <Label htmlFor="group-criterion">Gruppenwertung</Label>
                          <Select 
                            value={editingJudge.assignedCriteria?.group || ''}
                            onValueChange={(value) => {
                              const updatedCriteria = {
                                ...(editingJudge.assignedCriteria || {}),
                                group: value as GroupCriterionKey
                              };
                              setEditingJudge({
                                ...editingJudge, 
                                assignedCriteria: updatedCriteria
                              });
                            }}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Kriterium auswählen" />
                            </SelectTrigger>
                            <SelectContent>
                              {groupCriteria.map((criterion) => (
                                <SelectItem key={criterion.value} value={criterion.value}>
                                  {criterion.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        {judge.role === 'admin' ? (
                          'Alle Kriterien'
                        ) : (
                          <>
                            {judge.assignedCriteria?.individual && (
                              <div className="text-sm">
                                <span className="font-medium">Einzel:</span> {' '}
                                {individualCriteria.find(c => c.value === judge.assignedCriteria?.individual)?.label || 'Keine'}
                              </div>
                            )}
                            {judge.assignedCriteria?.group && (
                              <div className="text-sm">
                                <span className="font-medium">Gruppe:</span> {' '}
                                {groupCriteria.find(c => c.value === judge.assignedCriteria?.group)?.label || 'Keine'}
                              </div>
                            )}
                            {!judge.assignedCriteria?.individual && !judge.assignedCriteria?.group && 'Keine Kriterien zugewiesen'}
                          </>
                        )}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {editingJudge?.id === judge.id ? (
                        <Button size="sm" onClick={handleSave}>
                          <Save className="h-4 w-4 mr-2" />
                          Speichern
                        </Button>
                      ) : (
                        <Button size="sm" variant="outline" onClick={() => handleEdit(judge)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Bearbeiten
                        </Button>
                      )}
                      <Button 
                        size="sm" 
                        variant="secondary" 
                        onClick={() => handleImpersonate(judge.id)}
                      >
                        Als Benutzer anmelden
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter className="justify-between">
          <Button variant="outline" onClick={() => navigate('/admin')}>
            Zurück
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default JudgesPage;
