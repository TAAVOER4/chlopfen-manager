
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useUser } from '@/contexts/UserContext';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { FileText, BarChart2, Download, FileExport, FileSpreadsheet } from 'lucide-react';
import { mockParticipants, mockIndividualScores, mockSponsors, mockGroups, mockGroupScores } from '@/data/mockData';
import { generateResults, generateGroupResults } from '@/services/ResultsService';
import { generateSchedulePDF, generateResultsPDF } from '@/utils/pdfUtils';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { mockTournaments } from '@/data/mockTournaments';

const ReportsPage: React.FC = () => {
  const { isAdmin, selectedTournament } = useUser();
  const [activeTab, setActiveTab] = useState('results');
  
  // Generate data for reports
  const allIndividualResults = {
    'kids': generateResults('kids', mockParticipants, mockIndividualScores),
    'juniors': generateResults('juniors', mockParticipants, mockIndividualScores),
    'active': generateResults('active', mockParticipants, mockIndividualScores)
  };
  
  const groupResults = generateGroupResults(mockGroups, mockParticipants, mockGroupScores);
  const tournamentName = selectedTournament?.name || "Schweiz. Peitschenclub Turnier";
  
  // Handle PDF export of results
  const handleExportResultsPDF = () => {
    generateResultsPDF(
      allIndividualResults,
      groupResults,
      mockSponsors,
      tournamentName
    );
  };
  
  // Handle PDF export of schedule
  const handleExportSchedulePDF = () => {
    const tournament = selectedTournament || mockTournaments[0];
    const mainSponsors = mockSponsors.filter(s => s.type === 'main');
    
    // For this example, we'll use mock schedule data
    const mockSchedule = [
      {
        id: '1',
        title: 'Anmeldung',
        description: 'Anmeldung und Ausgabe der Startnummern',
        startTime: '08:00',
        endTime: '09:00',
        category: undefined
      },
      {
        id: '2',
        title: 'Eröffnung',
        description: 'Offizielle Eröffnung des Turniers',
        startTime: '09:15',
        endTime: '09:30',
        category: undefined
      },
      {
        id: '3',
        title: 'Vorrunde Kinder',
        description: 'Erste Runde der Kinderkategorie',
        startTime: '09:45',
        endTime: '10:30',
        category: 'kids'
      }
    ];
    
    generateSchedulePDF(mockSchedule, mainSponsors, tournament);
  };

  // Export participant list as CSV (mock functionality)
  const handleExportParticipantsCSV = () => {
    // Create CSV content
    let csvContent = "Vorname,Nachname,Kategorie,Wohnort,Geburtsjahr\n";
    
    mockParticipants.forEach(participant => {
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

  // If not admin, show access denied
  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <h2 className="text-2xl font-bold mb-4">Zugriff verweigert</h2>
        <p className="text-muted-foreground mb-4">Sie haben keine Berechtigung, diese Seite zu sehen.</p>
        <Button asChild>
          <Link to="/">Zurück zur Startseite</Link>
        </Button>
      </div>
    );
  }
  
  return (
    <div className="animate-fade-in">
      <h1 className="text-3xl font-bold text-swiss-blue mb-6">Berichte & Exporte</h1>
      <p className="text-muted-foreground mb-6">
        Erstellen Sie Berichte, Ranglisten und exportieren Sie Daten in verschiedenen Formaten.
      </p>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="results">
            <BarChart2 className="h-4 w-4 mr-2" />
            Ergebnisse & Ranglisten
          </TabsTrigger>
          <TabsTrigger value="exports">
            <FileExport className="h-4 w-4 mr-2" />
            Datenexporte
          </TabsTrigger>
          <TabsTrigger value="statistics">
            <FileText className="h-4 w-4 mr-2" />
            Statistiken
          </TabsTrigger>
        </TabsList>
        
        {/* Results & Rankings Tab */}
        <TabsContent value="results" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Ranglisten
              </CardTitle>
              <CardDescription>
                Ergebnisse und Ranglisten für verschiedene Kategorien
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Einzel-Ranglisten</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Kategorie</TableHead>
                        <TableHead>Anzahl Teilnehmer</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Aktion</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell>Kinder</TableCell>
                        <TableCell>{allIndividualResults.kids.length}</TableCell>
                        <TableCell>
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-md text-xs font-medium">
                            Abgeschlossen
                          </span>
                        </TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm" asChild>
                            <Link to="/results">Anzeigen</Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Junioren</TableCell>
                        <TableCell>{allIndividualResults.juniors.length}</TableCell>
                        <TableCell>
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-md text-xs font-medium">
                            Abgeschlossen
                          </span>
                        </TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm" asChild>
                            <Link to="/results">Anzeigen</Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Aktive</TableCell>
                        <TableCell>{allIndividualResults.active.length}</TableCell>
                        <TableCell>
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-md text-xs font-medium">
                            Abgeschlossen
                          </span>
                        </TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm" asChild>
                            <Link to="/results">Anzeigen</Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
                
                <div>
                  <h3 className="font-medium mb-2">Gruppen-Ranglisten</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Kategorie</TableHead>
                        <TableHead>Anzahl Gruppen</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Aktion</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell>3er Gruppen</TableCell>
                        <TableCell>{(groupResults.three_kids_juniors?.length || 0) + (groupResults.three_active?.length || 0)}</TableCell>
                        <TableCell>
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-md text-xs font-medium">
                            Abgeschlossen
                          </span>
                        </TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm" asChild>
                            <Link to="/results">Anzeigen</Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>4er Gruppen</TableCell>
                        <TableCell>{(groupResults.four_kids_juniors?.length || 0) + (groupResults.four_active?.length || 0)}</TableCell>
                        <TableCell>
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-md text-xs font-medium">
                            Abgeschlossen
                          </span>
                        </TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm" asChild>
                            <Link to="/results">Anzeigen</Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleExportResultsPDF}>
                <Download className="h-4 w-4 mr-2" />
                Alle Ranglisten als PDF exportieren
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Zeitplan
              </CardTitle>
              <CardDescription>
                Zeitplan für das aktuelle Turnier
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Der aktuelle Turnierplan enthält alle geplanten Aktivitäten und Wettbewerbe.</p>
              <div className="mt-4">
                <Button onClick={handleExportSchedulePDF}>
                  <Download className="h-4 w-4 mr-2" />
                  Zeitplan als PDF exportieren
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Data Exports Tab */}
        <TabsContent value="exports" className="space-y-6">
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
        </TabsContent>
        
        {/* Statistics Tab */}
        <TabsContent value="statistics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart2 className="h-5 w-5 mr-2" />
                Turnierstatistiken
              </CardTitle>
              <CardDescription>
                Übersicht über das aktuelle Turnier
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-muted p-4 rounded-md">
                  <h3 className="font-medium mb-2">Teilnehmer</h3>
                  <p className="text-3xl font-bold">{mockParticipants.length}</p>
                  <p className="text-sm text-muted-foreground">Gesamt</p>
                </div>
                
                <div className="bg-muted p-4 rounded-md">
                  <h3 className="font-medium mb-2">Gruppen</h3>
                  <p className="text-3xl font-bold">{mockGroups.length}</p>
                  <p className="text-sm text-muted-foreground">Gesamt</p>
                </div>
                
                <div className="bg-muted p-4 rounded-md">
                  <h3 className="font-medium mb-2">Bewertungen</h3>
                  <p className="text-3xl font-bold">{mockIndividualScores.length + mockGroupScores.length}</p>
                  <p className="text-sm text-muted-foreground">Gesamt</p>
                </div>
              </div>
              
              <div className="mt-8">
                <h3 className="font-medium mb-4">Teilnehmer pro Kategorie</h3>
                <div className="h-[200px] w-full bg-muted rounded-md flex items-end justify-around p-4">
                  <div className="flex flex-col items-center">
                    <div className="bg-blue-500 w-16 rounded-t-md" style={{ height: '80px' }}></div>
                    <p className="mt-2 text-sm">Kinder</p>
                    <p className="text-muted-foreground text-xs">{mockParticipants.filter(p => p.category === 'kids').length}</p>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="bg-green-500 w-16 rounded-t-md" style={{ height: '120px' }}></div>
                    <p className="mt-2 text-sm">Junioren</p>
                    <p className="text-muted-foreground text-xs">{mockParticipants.filter(p => p.category === 'juniors').length}</p>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="bg-red-500 w-16 rounded-t-md" style={{ height: '160px' }}></div>
                    <p className="mt-2 text-sm">Aktive</p>
                    <p className="text-muted-foreground text-xs">{mockParticipants.filter(p => p.category === 'active').length}</p>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button>
                <FileText className="h-4 w-4 mr-2" />
                Statistikbericht generieren
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReportsPage;
