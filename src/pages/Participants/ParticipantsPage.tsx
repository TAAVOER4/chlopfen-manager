
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle, Users, Pencil, Trash, Filter, Search, User } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { mockParticipants, mockGroups } from '../../data/mockData';
import { getCategoryDisplay } from '../../utils/categoryUtils';
import DeleteParticipantDialog from '../../components/Participants/DeleteParticipantDialog';
import { Participant, Category } from '../../types';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

const ParticipantsPage = () => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [categoryFilter, setCategoryFilter] = useState<Category | 'all'>('all');
  const [searchText, setSearchText] = useState('');
  const [activeTab, setActiveTab] = useState('individual');

  const handleDeleteParticipant = (participant: Participant) => {
    setSelectedParticipant(participant);
    setDeleteDialogOpen(true);
  };

  const handleParticipantDeleted = () => {
    // Refresh the component
    setRefreshKey(prev => prev + 1);
  };

  // Function to get all group names a participant belongs to
  const getParticipantGroups = (participantId: number) => {
    const groupsForParticipant = mockGroups.filter(group => 
      group.participantIds.includes(participantId)
    );
    
    if (groupsForParticipant.length === 0) return '-';
    
    return groupsForParticipant.map(g => g.name).join(', ');
  };
  
  // Filter participants based on selected category and search text
  const filteredParticipants = mockParticipants
    .filter(participant => 
      categoryFilter === 'all' || participant.category === categoryFilter
    )
    .filter(participant => {
      if (!searchText.trim()) return true;
      
      const searchLower = searchText.toLowerCase();
      
      // Search across all text fields EXCEPT groups column
      return (
        participant.firstName.toLowerCase().includes(searchLower) ||
        participant.lastName.toLowerCase().includes(searchLower) ||
        participant.location.toLowerCase().includes(searchLower) ||
        participant.birthYear.toString().includes(searchLower) ||
        getCategoryDisplay(participant.category).toLowerCase().includes(searchLower)
      );
    });

  // Force update when needed
  React.useEffect(() => {
    // This effect ensures the component updates when refreshKey changes
  }, [refreshKey]);

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-swiss-blue">Teilnehmer</h1>
        <div className="flex space-x-2">
          <Link to="/participants/register">
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Teilnehmer erfassen
            </Button>
          </Link>
          <Link to="/participants/register-group">
            <Button variant="outline">
              <Users className="mr-2 h-4 w-4" />
              Gruppe erfassen
            </Button>
          </Link>
        </div>
      </div>

      <Card className="mb-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="individual">
              <User className="mr-2 h-4 w-4" />
              Einzelteilnehmer
            </TabsTrigger>
            <TabsTrigger value="groups">
              <Users className="mr-2 h-4 w-4" />
              Gruppen
            </TabsTrigger>
          </TabsList>

          <TabsContent value="individual" className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold">Einzelteilnehmer</h2>
              <div className="flex items-center gap-4">
                {/* Search input */}
                <div className="relative w-64">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Teilnehmer suchen..."
                    className="pl-8"
                    value={searchText}
                    onChange={e => setSearchText(e.target.value)}
                  />
                </div>

                {/* Category filter */}
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <Select
                    value={categoryFilter}
                    onValueChange={(value) => setCategoryFilter(value as Category | 'all')}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Kategorie wählen" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Alle Kategorien</SelectItem>
                      <SelectItem value="kids">{getCategoryDisplay('kids')}</SelectItem>
                      <SelectItem value="juniors">{getCategoryDisplay('juniors')}</SelectItem>
                      <SelectItem value="active">{getCategoryDisplay('active')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <Table>
              <TableCaption>Alle registrierten Teilnehmer</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Kategorie</TableHead>
                  <TableHead>Jahrgang</TableHead>
                  <TableHead>Wohnort</TableHead>
                  <TableHead>Gruppe(n)</TableHead>
                  <TableHead>Teilnahme</TableHead>
                  <TableHead className="w-[160px]">Aktionen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredParticipants.map((participant) => (
                  <TableRow key={participant.id}>
                    <TableCell className="font-medium">
                      {participant.firstName} {participant.lastName}
                    </TableCell>
                    <TableCell>{getCategoryDisplay(participant.category)}</TableCell>
                    <TableCell>{participant.birthYear}</TableCell>
                    <TableCell>{participant.location}</TableCell>
                    <TableCell>
                      {getParticipantGroups(participant.id)}
                    </TableCell>
                    <TableCell>
                      {participant.isGroupOnly ? 
                        <Badge variant="outline">Nur Gruppe</Badge> : 
                        <Badge>Einzel & Gruppe</Badge>
                      }
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Link to={`/participants/edit/${participant.id}`}>
                          <Button variant="ghost" size="sm">
                            <Pencil className="h-4 w-4 mr-2" />
                            Bearbeiten
                          </Button>
                        </Link>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDeleteParticipant(participant)}
                        >
                          <Trash className="h-4 w-4 mr-2" />
                          Löschen
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredParticipants.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      Keine Teilnehmer vorhanden
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TabsContent>

          <TabsContent value="groups" className="p-4">
            <div className="mb-4">
              <h2 className="text-2xl font-semibold">Gruppen</h2>
            </div>
            <Table>
              <TableCaption>Alle registrierten Gruppen</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Kategorie</TableHead>
                  <TableHead>Größe</TableHead>
                  <TableHead>Mitglieder</TableHead>
                  <TableHead className="w-[100px]">Aktionen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockGroups.map((group) => (
                  <TableRow key={group.id}>
                    <TableCell className="font-medium">{group.name}</TableCell>
                    <TableCell>{getCategoryDisplay(group.category)}</TableCell>
                    <TableCell>{group.size === 'three' ? 'Dreiergruppe' : 'Vierergruppe'}</TableCell>
                    <TableCell>
                      {group.participantIds.map(id => {
                        const participant = mockParticipants.find(p => p.id === id);
                        return participant ? `${participant.firstName} ${participant.lastName}` : '';
                      }).join(', ')}
                    </TableCell>
                    <TableCell>
                      <Link to={`/participants/edit-group/${group.id}`}>
                        <Button variant="ghost" size="sm">
                          <Pencil className="h-4 w-4 mr-2" />
                          Bearbeiten
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
                {mockGroups.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      Keine Gruppen vorhanden
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TabsContent>
        </Tabs>
      </Card>

      <DeleteParticipantDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        participant={selectedParticipant}
        onDeleted={handleParticipantDeleted}
      />
    </div>
  );
};

export default ParticipantsPage;
