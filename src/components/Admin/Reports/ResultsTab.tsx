
import React, { useMemo, useState } from 'react';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { generateResultsPDF } from '@/utils/pdf/pdfExportUtils';
import { Tournament } from '@/types';

interface ResultsTabProps {
  allIndividualResults: {
    [key: string]: Array<{
      rank: number;
      name: string;
      location: string;
      score: number;
    }>;
  };
  groupResults: Array<{
    rank: number;
    name: string;
    location: string;
    score: number;
  }>;
  tournamentName: string;
  selectedTournamentId: number;
  mockSponsors: Array<any>;
  mockSchedule: Array<any>;
}

export const ResultsTab: React.FC<ResultsTabProps> = ({
  allIndividualResults,
  groupResults,
  tournamentName,
  selectedTournamentId,
  mockSponsors,
  mockSchedule
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('kids');
  const [selectedExportType, setSelectedExportType] = useState<string>('individual');
  
  // Create a complete tournament object that matches the Tournament type
  const tournamentObj: Tournament = {
    id: selectedTournamentId,
    name: tournamentName,
    date: new Date().toISOString().split('T')[0], // Format as YYYY-MM-DD
    location: "Default Location",
    year: new Date().getFullYear(),
    isActive: true
  };

  const handleGenerateResults = () => {
    const exportData = selectedExportType === 'individual' 
      ? allIndividualResults[selectedCategory]
      : groupResults;
    
    generateResultsPDF({
      results: exportData,
      category: selectedExportType === 'individual' ? selectedCategory : 'group',
      tournament: tournamentObj,
      sponsors: mockSponsors
    });
  };
  
  const currentResults = useMemo(() => {
    return selectedExportType === 'individual'
      ? allIndividualResults[selectedCategory] || []
      : groupResults;
  }, [selectedExportType, selectedCategory, allIndividualResults, groupResults]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Ergebnisse und Ranglisten</CardTitle>
          <CardDescription>
            Generieren Sie Ergebnis-PDFs für verschiedene Kategorien
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="w-full md:w-1/3">
              <label className="text-sm font-medium mb-2 block">Export-Typ</label>
              <Select
                value={selectedExportType}
                onValueChange={setSelectedExportType}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Export-Typ wählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="individual">Einzelwertung</SelectItem>
                  <SelectItem value="group">Gruppenwertung</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {selectedExportType === 'individual' && (
              <div className="w-full md:w-1/3">
                <label className="text-sm font-medium mb-2 block">Kategorie</label>
                <Select
                  value={selectedCategory}
                  onValueChange={setSelectedCategory}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Kategorie wählen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kids">Kinder</SelectItem>
                    <SelectItem value="juniors">Junioren</SelectItem>
                    <SelectItem value="active">Aktive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            
            <div className="w-full md:w-1/3 flex items-end">
              <Button onClick={handleGenerateResults} className="w-full">
                <Download className="h-4 w-4 mr-2" />
                PDF generieren
              </Button>
            </div>
          </div>
          
          <Separator className="my-6" />
          
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rang</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Ort</TableHead>
                <TableHead className="text-right">Punkte</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentResults.length > 0 ? (
                currentResults.map((result, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{result.rank}</TableCell>
                    <TableCell>{result.name}</TableCell>
                    <TableCell>{result.location}</TableCell>
                    <TableCell className="text-right">{result.score}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-4">
                    Keine Ergebnisse gefunden.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
