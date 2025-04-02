
import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { toast } from 'sonner';
import { Plus, Trash2, Download, Clock, PenLine, Calendar, FileText } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { useUser } from '@/contexts/UserContext';
import { useTournament } from '@/contexts/TournamentContext';
import { ScheduleItem, Category, GroupCategory, Sponsor, SponsorType } from '@/types';
import { mockSponsors } from '@/data/mockData';
import { generateSchedulePDF } from '@/utils/pdfUtils';
import { getCategoryDisplay } from '@/utils/categoryUtils';

// Mock schedule data
const mockSchedule: ScheduleItem[] = [
  {
    id: 1,
    tournamentId: 1,
    startTime: '09:00',
    endTime: '10:00',
    title: 'Eröffnungszeremonie',
    description: 'Begrüßung und Vorstellung der Sponsoren',
    type: 'ceremony'
  },
  {
    id: 2,
    tournamentId: 1,
    startTime: '10:00',
    endTime: '12:00',
    title: 'Kids Einzelwettbewerb',
    category: 'kids',
    type: 'competition'
  },
  {
    id: 3,
    tournamentId: 1,
    startTime: '12:00',
    endTime: '13:00',
    title: 'Mittagspause',
    type: 'break'
  },
  {
    id: 4,
    tournamentId: 1,
    startTime: '13:00',
    endTime: '15:00',
    title: 'Junioren Einzelwettbewerb',
    category: 'juniors',
    type: 'competition'
  },
  {
    id: 5,
    tournamentId: 1,
    startTime: '15:00',
    endTime: '17:00',
    title: 'Aktive Einzelwettbewerb',
    category: 'active',
    type: 'competition'
  },
  {
    id: 6,
    tournamentId: 1,
    startTime: '17:00',
    endTime: '18:00',
    title: 'Siegerehrung',
    description: 'Verleihung der Preise für alle Kategorien',
    type: 'ceremony'
  }
];

const SchedulePage: React.FC = () => {
  const { isAdmin } = useUser();
  const { activeTournament } = useTournament();
  const [schedule, setSchedule] = useState<ScheduleItem[]>(mockSchedule);
  const [sponsors, setSponsors] = useState<Sponsor[]>(mockSponsors);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<ScheduleItem | null>(null);
  const [formData, setFormData] = useState<Partial<ScheduleItem>>({
    startTime: '09:00',
    endTime: '10:00',
    title: '',
    description: '',
    type: 'competition',
    category: 'kids'
  });

  // Get main sponsors
  const mainSponsors = sponsors.filter(sponsor => sponsor.type === 'main');

  // Filter schedule by active tournament
  const tournamentSchedule = activeTournament 
    ? schedule.filter(item => item.tournamentId === activeTournament.id) 
    : schedule;
  
  // Sort schedule by start time
  const sortedSchedule = [...tournamentSchedule].sort((a, b) => {
    return a.startTime.localeCompare(b.startTime);
  });

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

  const handleAddItem = () => {
    setCurrentItem(null);
    setFormData({
      startTime: '09:00',
      endTime: '10:00',
      title: '',
      description: '',
      type: 'competition',
      category: 'kids'
    });
    setIsDialogOpen(true);
  };

  const handleEditItem = (item: ScheduleItem) => {
    setCurrentItem(item);
    setFormData({
      startTime: item.startTime,
      endTime: item.endTime,
      title: item.title,
      description: item.description || '',
      type: item.type,
      category: item.category
    });
    setIsDialogOpen(true);
  };

  const handleDeleteItem = (item: ScheduleItem) => {
    setCurrentItem(item);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (currentItem) {
      setSchedule(schedule.filter(item => item.id !== currentItem.id));
      toast.success("Zeitplan-Eintrag gelöscht");
      setIsDeleteDialogOpen(false);
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.startTime || !formData.endTime || !formData.type) {
      toast.error("Bitte füllen Sie alle erforderlichen Felder aus.");
      return;
    }
    
    if (currentItem) {
      // Edit existing item
      const updatedSchedule = schedule.map(item => 
        item.id === currentItem.id ? 
        { 
          ...item, 
          startTime: formData.startTime || item.startTime,
          endTime: formData.endTime || item.endTime,
          title: formData.title || item.title,
          description: formData.description,
          type: formData.type || item.type,
          category: formData.category
        } : item
      );
      setSchedule(updatedSchedule);
      toast.success("Zeitplan-Eintrag aktualisiert");
    } else {
      // Add new item
      const newItem: ScheduleItem = {
        id: Math.max(...schedule.map(item => item.id), 0) + 1,
        tournamentId: activeTournament?.id || 1,
        startTime: formData.startTime || '09:00',
        endTime: formData.endTime || '10:00',
        title: formData.title || '',
        description: formData.description,
        type: formData.type as 'competition' | 'ceremony' | 'break' | 'other',
        category: formData.type === 'competition' ? formData.category as Category | GroupCategory | AllCategory : undefined
      };
      
      setSchedule([...schedule, newItem]);
      toast.success("Zeitplan-Eintrag hinzugefügt");
    }
    
    setIsDialogOpen(false);
  };

  const handleGeneratePDF = () => {
    if (!activeTournament) {
      toast.error("Bitte wählen Sie ein aktives Turnier aus");
      return;
    }

    try {
      generateSchedulePDF(sortedSchedule, mainSponsors, activeTournament);
      toast.success("PDF wurde generiert und der Download wurde gestartet");
    } catch (error) {
      toast.error("Fehler beim Generieren des PDFs");
      console.error("PDF generation error:", error);
    }
  };

  const getItemTypeIcon = (type: string) => {
    switch (type) {
      case 'competition': return <Calendar className="h-4 w-4" />;
      case 'ceremony': return <FileText className="h-4 w-4" />;
      case 'break': return <Clock className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getItemTypeDisplay = (type: string) => {
    switch (type) {
      case 'competition': return 'Wettbewerb';
      case 'ceremony': return 'Zeremonie';
      case 'break': return 'Pause';
      default: return 'Sonstiges';
    }
  };

  return (
    <div className="animate-fade-in">
      <h1 className="text-3xl font-bold text-swiss-blue mb-6">Zeitplan</h1>
      
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-lg font-medium">
            Zeitplan für {activeTournament?.name || 'Turnier'}
          </h2>
          <p className="text-muted-foreground">
            {activeTournament?.date ? new Date(activeTournament.date).toLocaleDateString('de-CH') : 'Kein Datum ausgewählt'}
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button onClick={handleAddItem} className="gap-2">
            <Plus className="h-4 w-4" />
            Eintrag hinzufügen
          </Button>
          
          <Button variant="outline" onClick={handleGeneratePDF} className="gap-2">
            <Download className="h-4 w-4" />
            PDF generieren
          </Button>
        </div>
      </div>

      <Tabs defaultValue="schedule">
        <TabsList className="mb-4">
          <TabsTrigger value="schedule">Zeitplan</TabsTrigger>
          <TabsTrigger value="preview">Vorschau</TabsTrigger>
        </TabsList>
        
        <TabsContent value="schedule">
          <Card>
            <CardHeader>
              <CardTitle>Tagesplan bearbeiten</CardTitle>
              <CardDescription>
                Verwalten Sie den zeitlichen Ablauf des Turniers.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Zeit</TableHead>
                    <TableHead>Titel</TableHead>
                    <TableHead>Kategorie</TableHead>
                    <TableHead>Typ</TableHead>
                    <TableHead>Beschreibung</TableHead>
                    <TableHead className="text-right">Aktionen</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedSchedule.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        Keine Einträge gefunden. Fügen Sie einen neuen Eintrag hinzu.
                      </TableCell>
                    </TableRow>
                  ) : (
                    sortedSchedule.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div className="font-medium whitespace-nowrap">
                            {item.startTime} - {item.endTime}
                          </div>
                        </TableCell>
                        <TableCell>{item.title}</TableCell>
                        <TableCell>
                          {item.category ? getCategoryDisplay(item.category) : '-'}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getItemTypeIcon(item.type)}
                            <span>{getItemTypeDisplay(item.type)}</span>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate">
                          {item.description || '-'}
                        </TableCell>
                        <TableCell className="text-right whitespace-nowrap">
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="sm" onClick={() => handleEditItem(item)}>
                              <PenLine className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" className="text-destructive hover:text-destructive" onClick={() => handleDeleteItem(item)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="preview">
          <Card>
            <CardHeader>
              <CardTitle>Zeitplan Vorschau</CardTitle>
              <CardDescription>
                So wird der Zeitplan im PDF erscheinen.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg p-6 bg-white">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold mb-2">{activeTournament?.name || 'Turnier'} - Zeitplan</h2>
                  <p className="text-muted-foreground">
                    {activeTournament?.date ? new Date(activeTournament.date).toLocaleDateString('de-CH') : 'Kein Datum'}
                  </p>
                </div>
                
                {mainSponsors.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-lg font-medium mb-4 text-center">Hauptsponsoren</h3>
                    <div className="flex flex-wrap justify-center gap-8">
                      {mainSponsors.map(sponsor => (
                        <div key={sponsor.id} className="text-center">
                          <div className="h-20 w-32 bg-gray-50 rounded flex items-center justify-center overflow-hidden mb-2">
                            {sponsor.logo ? (
                              <img src={sponsor.logo} alt={`${sponsor.name} Logo`} className="max-h-16 max-w-full object-contain" />
                            ) : (
                              <span className="text-muted-foreground text-sm">{sponsor.name}</span>
                            )}
                          </div>
                          <p className="text-sm font-medium">{sponsor.name}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <div>
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="py-2 px-4 text-left">Zeit</th>
                        <th className="py-2 px-4 text-left">Programm</th>
                        <th className="py-2 px-4 text-left">Kategorie</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedSchedule.map((item, index) => (
                        <tr key={item.id} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                          <td className="py-3 px-4 whitespace-nowrap">
                            {item.startTime} - {item.endTime}
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-medium">{item.title}</div>
                            {item.description && (
                              <div className="text-sm text-muted-foreground">{item.description}</div>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            {item.category ? getCategoryDisplay(item.category) : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-center">
              <Button onClick={handleGeneratePDF} className="gap-2">
                <Download className="h-4 w-4" />
                PDF herunterladen
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Add/Edit Schedule Item Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{currentItem ? 'Zeitplan-Eintrag bearbeiten' : 'Neuen Eintrag hinzufügen'}</DialogTitle>
            <DialogDescription>
              {currentItem 
                ? 'Bearbeiten Sie die Details des Zeitplan-Eintrags.' 
                : 'Fügen Sie einen neuen Eintrag zum Zeitplan hinzu.'}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startTime">Startzeit *</Label>
                <Input 
                  id="startTime" 
                  name="startTime" 
                  type="time"
                  value={formData.startTime} 
                  onChange={handleFormChange} 
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="endTime">Endzeit *</Label>
                <Input 
                  id="endTime" 
                  name="endTime" 
                  type="time"
                  value={formData.endTime} 
                  onChange={handleFormChange} 
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="title">Titel *</Label>
              <Input 
                id="title" 
                name="title" 
                value={formData.title} 
                onChange={handleFormChange} 
                placeholder="Z.B. Kids Einzelwettbewerb" 
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="type">Typ *</Label>
              <Select 
                value={formData.type} 
                onValueChange={(value) => handleSelectChange('type', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Wählen Sie einen Typ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="competition">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>Wettbewerb</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="ceremony">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      <span>Zeremonie</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="break">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>Pause</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="other">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      <span>Sonstiges</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {formData.type === 'competition' && (
              <div className="space-y-2">
                <Label htmlFor="category">Kategorie</Label>
                <Select 
                  value={formData.category as string} 
                  onValueChange={(value) => handleSelectChange('category', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Wählen Sie eine Kategorie" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Alle</SelectItem>
                    <SelectItem value="kids">Kids</SelectItem>
                    <SelectItem value="juniors">Junioren</SelectItem>
                    <SelectItem value="active">Aktive</SelectItem>
                    <SelectItem value="kids_juniors">Kids/Junioren</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="description">Beschreibung</Label>
              <Textarea 
                id="description" 
                name="description" 
                value={formData.description || ''} 
                onChange={handleFormChange} 
                placeholder="Optionale Beschreibung" 
                rows={3}
              />
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Abbrechen
              </Button>
              <Button type="submit">
                {currentItem ? 'Speichern' : 'Hinzufügen'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Zeitplan-Eintrag löschen</DialogTitle>
            <DialogDescription>
              Sind Sie sicher, dass Sie diesen Zeitplan-Eintrag löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.
            </DialogDescription>
          </DialogHeader>
          
          {currentItem && (
            <div className="py-4">
              <p className="font-medium">{currentItem.title}</p>
              <p className="text-sm text-muted-foreground">
                {currentItem.startTime} - {currentItem.endTime}
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

export default SchedulePage;
