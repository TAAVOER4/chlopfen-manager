
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
import { Participant, Group } from '@/types';
import { toast } from 'sonner';

interface ExportsTabProps {
  participants: Participant[];
  tournamentName: string;
  groups?: Group[];
}

export const ExportsTab: React.FC<ExportsTabProps> = ({ 
  participants,
  tournamentName,
  groups = []
}) => {
  // Process text for Swiss German conventions (ß → ss)
  const processTextForSwiss = (text: string): string => {
    if (!text) return '';
    // Replace German eszett with 'ss' for Swiss German
    return text.replace(/ß/g, 'ss');
  };
  
  // Create and download CSV file with proper encoding for umlauts
  const downloadCSV = (content: string, filename: string) => {
    // Add BOM (Byte Order Mark) for UTF-8
    const BOM = '\uFEFF';
    // Process content for Swiss German conventions
    const processedContent = processTextForSwiss(content);
    const blob = new Blob([BOM + processedContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`${filename} wurde erfolgreich exportiert`);
  };
  
  // Export participant list as CSV
  const handleExportParticipantsCSV = () => {
    // Create CSV content with semicolon delimiter
    let csvContent = "Vorname;Nachname;Kategorie;Wohnort;Geburtsjahr\n";
    
    participants.forEach(participant => {
      csvContent += `${processTextForSwiss(participant.firstName)};${processTextForSwiss(participant.lastName)};${participant.category};${processTextForSwiss(participant.location)};${participant.birthYear}\n`;
    });
    
    // Download the file
    downloadCSV(
      csvContent, 
      `teilnehmer_${tournamentName.toLowerCase().replace(/\s+/g, '-')}.csv`
    );
  };

  // Export groups list as CSV
  const handleExportGroupsCSV = () => {
    if (!groups || groups.length === 0) {
      toast.error("Keine Gruppen zum Exportieren vorhanden");
      return;
    }
    
    // Create CSV content with semicolon delimiter
    let csvContent = "Gruppenname;Kategorie;Größe;Teilnehmer\n";
    
    groups.forEach(group => {
      // Find participants for this group
      const groupParticipants = group.participantIds
        .map(id => participants.find(p => p.id === id))
        .filter(p => p !== undefined)
        .map(p => `${processTextForSwiss(p.firstName)} ${processTextForSwiss(p.lastName)}`)
        .join(", ");
        
      csvContent += `${processTextForSwiss(group.name)};${group.category};${group.size === 'three' ? '3' : '4'};${groupParticipants}\n`;
    });
    
    // Download the file
    downloadCSV(
      csvContent, 
      `gruppen_${tournamentName.toLowerCase().replace(/\s+/g, '-')}.csv`
    );
  };

  // Export scores data as CSV (mock functionality)
  const handleExportScoresCSV = () => {
    // Create CSV content with semicolon delimiter
    let csvContent = "Teilnehmer;Kategorie;Richter;Punktzahl;Zeitpunkt\n";
    
    // Sample data for scores (in a real application, this would come from a scores database)
    participants.slice(0, 10).forEach(participant => {
      const mockJudge = "Richter 1";
      const mockScore = Math.floor(Math.random() * 10) + 1;
      const mockTimestamp = new Date().toISOString().split('T')[0];
      
      csvContent += `${processTextForSwiss(participant.firstName)} ${processTextForSwiss(participant.lastName)};${participant.category};${mockJudge};${mockScore};${mockTimestamp}\n`;
    });
    
    // Download the file
    downloadCSV(
      csvContent, 
      `bewertungen_${tournamentName.toLowerCase().replace(/\s+/g, '-')}.csv`
    );
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
          <Button variant="outline" onClick={handleExportGroupsCSV}>
            <Download className="h-4 w-4 mr-2" />
            CSV
          </Button>
        </div>
        
        <div className="flex items-center justify-between border p-4 rounded-md">
          <div>
            <h3 className="font-medium">Bewertungsdaten</h3>
            <p className="text-sm text-muted-foreground">Rohdaten aller Bewertungen</p>
          </div>
          <Button variant="outline" onClick={handleExportScoresCSV}>
            <Download className="h-4 w-4 mr-2" />
            CSV
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
