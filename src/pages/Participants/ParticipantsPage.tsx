
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Edit, Trash, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { mockParticipants } from '../../data/mockData';
import { getCategoryDisplay, getCategoryClass } from '../../utils/categoryUtils';
import { Participant } from '../../types';

const ParticipantsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [participants, setParticipants] = useState<Participant[]>(mockParticipants);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [participantToDelete, setParticipantToDelete] = useState<Participant | null>(null);
  const { toast } = useToast();
  
  const filteredParticipants = participants.filter((participant) => {
    const matchesSearch = 
      participant.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      participant.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      participant.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || participant.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  const handleDeleteClick = (participant: Participant) => {
    setParticipantToDelete(participant);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (participantToDelete) {
      setParticipants(participants.filter(p => p.id !== participantToDelete.id));
      toast({
        title: "Teilnehmer gelöscht",
        description: `${participantToDelete.firstName} ${participantToDelete.lastName} wurde entfernt.`
      });
      setIsDeleteDialogOpen(false);
      setParticipantToDelete(null);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-swiss-blue">Teilnehmerverwaltung</h1>
        <Button asChild>
          <Link to="/participants/register">
            <Plus className="mr-2 h-4 w-4" />
            Neuer Teilnehmer
          </Link>
        </Button>
      </div>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Teilnehmer suchen</CardTitle>
          <CardDescription>
            Suchen Sie nach Namen oder Wohnort und filtern Sie nach Kategorie
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative w-full">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Suche nach Name oder Ort..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex sm:w-auto">
              <Button 
                variant={categoryFilter === 'all' ? 'default' : 'outline'} 
                onClick={() => setCategoryFilter('all')}
                className="rounded-l-md rounded-r-none"
              >
                Alle
              </Button>
              <Button 
                variant={categoryFilter === 'kids' ? 'default' : 'outline'} 
                onClick={() => setCategoryFilter('kids')}
                className="rounded-none"
              >
                Kids
              </Button>
              <Button 
                variant={categoryFilter === 'juniors' ? 'default' : 'outline'} 
                onClick={() => setCategoryFilter('juniors')}
                className="rounded-none"
              >
                Junioren
              </Button>
              <Button 
                variant={categoryFilter === 'active' ? 'default' : 'outline'} 
                onClick={() => setCategoryFilter('active')}
                className="rounded-r-md rounded-l-none"
              >
                Aktive
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Teilnehmerliste</CardTitle>
          <CardDescription>
            {filteredParticipants.length} Teilnehmer gefunden
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredParticipants.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Jahrgang</TableHead>
                  <TableHead>Wohnort</TableHead>
                  <TableHead>Kategorie</TableHead>
                  <TableHead>Gruppe</TableHead>
                  <TableHead className="text-right">Aktionen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredParticipants.map((participant) => (
                  <TableRow key={participant.id}>
                    <TableCell className="font-medium">
                      {participant.firstName} {participant.lastName}
                    </TableCell>
                    <TableCell>{participant.birthYear}</TableCell>
                    <TableCell>{participant.location}</TableCell>
                    <TableCell>
                      <span className={`category-badge ${getCategoryClass(participant.category)}`}>
                        {getCategoryDisplay(participant.category)}
                      </span>
                    </TableCell>
                    <TableCell>{participant.group || '-'}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="ghost" size="sm" asChild>
                        <Link to={`/participants/edit/${participant.id}`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteClick(participant)}>
                        <Trash className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <h3 className="text-lg font-medium">Keine Teilnehmer gefunden</h3>
              <p className="text-muted-foreground">
                Passen Sie Ihre Suchkriterien an oder fügen Sie neue Teilnehmer hinzu.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Teilnehmer löschen</DialogTitle>
            <DialogDescription>
              Möchten Sie den Teilnehmer wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.
            </DialogDescription>
          </DialogHeader>
          {participantToDelete && (
            <div className="py-4">
              <p className="mb-2">
                <span className="font-medium">Name:</span> {participantToDelete.firstName} {participantToDelete.lastName}
              </p>
              <p className="mb-2">
                <span className="font-medium">Jahrgang:</span> {participantToDelete.birthYear}
              </p>
              <p>
                <span className="font-medium">Kategorie:</span> {getCategoryDisplay(participantToDelete.category)}
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Abbrechen
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Löschen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ParticipantsPage;
