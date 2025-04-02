
import React from 'react';
import { Plus, Download } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';

import { useUser } from '@/contexts/UserContext';
import { useTournament } from '@/contexts/TournamentContext';
import { Sponsor, SponsorType } from '@/types';
import { mockSponsors } from '@/data/mockData';

import ScheduleTable from '@/components/Schedule/ScheduleTable';
import ScheduleItemForm from '@/components/Schedule/ScheduleItemForm';
import DeleteScheduleItemDialog from '@/components/Schedule/DeleteScheduleItemDialog';
import SchedulePreview from '@/components/Schedule/SchedulePreview';
import { useSchedule } from '@/hooks/useSchedule';

const SchedulePage: React.FC = () => {
  const { isAdmin } = useUser();
  const { activeTournament } = useTournament();
  const [sponsors] = React.useState<Sponsor[]>(mockSponsors);

  // Get main sponsors
  const mainSponsors = sponsors.filter(sponsor => sponsor.type === 'main');
  
  const {
    sortedSchedule,
    currentItem,
    formData,
    isDialogOpen,
    isDeleteDialogOpen,
    handleAddItem,
    handleEditItem,
    handleDeleteItem,
    confirmDelete,
    handleFormChange,
    handleSelectChange,
    handleSubmit,
    handleGeneratePDF,
    setIsDialogOpen,
    setIsDeleteDialogOpen
  } = useSchedule(activeTournament);

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
              <ScheduleTable 
                scheduleItems={sortedSchedule}
                onEditItem={handleEditItem}
                onDeleteItem={handleDeleteItem}
              />
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
              <SchedulePreview 
                scheduleItems={sortedSchedule}
                mainSponsors={mainSponsors}
                tournament={activeTournament}
                onGeneratePDF={handleGeneratePDF}
              />
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
          
          <ScheduleItemForm
            formData={formData}
            currentItem={currentItem}
            handleFormChange={handleFormChange}
            handleSelectChange={handleSelectChange}
            handleSubmit={handleSubmit}
            onCancel={() => setIsDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DeleteScheduleItemDialog
          currentItem={currentItem}
          onConfirmDelete={confirmDelete}
          onCancel={() => setIsDeleteDialogOpen(false)}
        />
      </Dialog>
    </div>
  );
};

export default SchedulePage;
