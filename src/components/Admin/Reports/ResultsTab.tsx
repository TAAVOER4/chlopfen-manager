
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { FileText, Download } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Participant, IndividualScore, Sponsor, Group, GroupScore, ScheduleItem } from '@/types';
import { generateResultsPDF, generateSchedulePDF } from '@/utils/pdfUtils';
import { generateResults, generateGroupResults } from '@/services/ResultsService';

interface ResultsTabProps {
  allIndividualResults: {
    kids: any[];
    juniors: any[];
    active: any[];
  };
  groupResults: any;
  tournamentName: string;
  selectedTournamentId: number;
  mockSponsors: Sponsor[];
  mockSchedule: ScheduleItem[];
}

export const ResultsTab: React.FC<ResultsTabProps> = ({
  allIndividualResults,
  groupResults,
  tournamentName,
  selectedTournamentId,
  mockSponsors,
  mockSchedule
}) => {
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
    const mainSponsors = mockSponsors.filter(s => s.type === 'main');
    const tournament = { id: selectedTournamentId, name: tournamentName };
    
    generateSchedulePDF(mockSchedule, mainSponsors, tournament);
  };
  
  return (
    <div className="space-y-6">
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
    </div>
  );
};
