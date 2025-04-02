
import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Download, FileSpreadsheet } from 'lucide-react';
import { Participant } from '@/types';

interface ExportsTabProps {
  participants: Participant[];
  tournamentName: string;
}

export const ExportsTab: React.FC<ExportsTabProps> = ({ 
  participants,
  tournamentName
}) => {
  // Export participant list as CSV (mock functionality)
  const handleExportParticipantsCSV = () => {
    // Create CSV content
    let csvContent = "Vorname,Nachname,Kategorie,Wohnort,Geburtsjahr\n";
    
    participants.forEach(participant => {
      csvContent += `${participant.firstName},${participant.lastName},${participant.category},${participant.location},${participant.birthYear}\n`;
    });
    
    // Create and download the file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `teilnehmer_${tournamentName.toLowerCase().replace(/\s+/g, '-')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <FileSpreadsheet className="h-5 w-5 mr-2" />
          Teilnehmerdaten
        </CardTitle>
        <CardDescription>
          Exportieren Sie Teilnehmerdaten für das aktuelle Turnier
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between border p-4 rounded-md">
          <div>
            <h3 className="font-medium">Teilnehmerliste</h3>
            <p className="text-sm text-muted-foreground">Liste aller Teilnehmer mit Kategorien</p>
          </div>
          <Button variant="outline" onClick={handleExportParticipantsCSV}>
            <Download className="h-4 w-4 mr-2" />
            CSV
          </Button>
        </div>
        
        <div className="flex items-center justify-between border p-4 rounded-md">
          <div>
            <h3 className="font-medium">Gruppenliste</h3>
            <p className="text-sm text-muted-foreground">Liste aller Gruppen mit Teilnehmern</p>
          </div>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            CSV
          </Button>
        </div>
        
        <div className="flex items-center justify-between border p-4 rounded-md">
          <div>
            <h3 className="font-medium">Bewertungsdaten</h3>
            <p className="text-sm text-muted-foreground">Rohdaten aller Bewertungen</p>
          </div>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            CSV
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
