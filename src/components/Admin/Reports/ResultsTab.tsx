
import React, { useMemo, useState, useEffect } from 'react';
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
import { Tournament, GroupSize, GroupCategory } from '@/types';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

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
  const [selectedGroupSize, setSelectedGroupSize] = useState<GroupSize>('three');
  const [selectedGroupCategory, setSelectedGroupCategory] = useState<GroupCategory>('kids_juniors');
  
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
    try {
      let exportData;
      const category = selectedExportType === 'individual' 
        ? selectedCategory 
        : `${selectedGroupSize}_${selectedGroupCategory}`;
      
      if (selectedExportType === 'individual') {
        exportData = allIndividualResults[selectedCategory];
      } else {
        exportData = filteredGroupResults;
      }
      
      console.log("Exporting data:", exportData);
      console.log("Category:", category);
      
      generateResultsPDF({
        results: exportData,
        category: category,
        tournament: tournamentObj,
        sponsors: mockSponsors
      });
      
      toast.success("PDF generiert");
    } catch (error) {
      console.error("PDF generation error:", error);
      toast.error("Fehler bei der PDF-Generierung");
    }
  };
  
  // Filter group results based on selected size and category
  const filteredGroupResults = useMemo(() => {
    // For group results, we need to filter by the selected group size and category
    if (!groupResults || groupResults.length === 0) {
      return [];
    }

    console.log("Filtering groups:", groupResults);
    console.log("Selected size:", selectedGroupSize);
    console.log("Selected category:", selectedGroupCategory);
    
    // Since we don't have proper size and category in the mock data,
    // we'll use a simple approach based on group names
    return groupResults.filter(group => {
      if (!group || !group.name) return false;
      
      const groupName = group.name.toLowerCase();
      
      // For Active category, check if name contains "aktiv" or similar terms
      if (selectedGroupCategory === 'active') {
        return groupName.includes('aktiv') || groupName.includes('active');
      } 
      // For Kids/Junioren category, include groups that don't contain active-related terms
      else if (selectedGroupCategory === 'kids_juniors') {
        const isActive = groupName.includes('aktiv') || groupName.includes('active');
        return !isActive;
      }
      
      return false; // Default case: don't include the group
    });
  }, [groupResults, selectedGroupSize, selectedGroupCategory]);

  const currentResults = useMemo(() => {
    if (selectedExportType === 'individual') {
      return allIndividualResults[selectedCategory] || [];
    } else {
      // Use the filtered group results
      return filteredGroupResults;
    }
  }, [selectedExportType, selectedCategory, allIndividualResults, filteredGroupResults]);

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
            
            {selectedExportType === 'individual' ? (
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
            ) : (
              <div className="w-full md:w-2/3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Gruppengrösse</label>
                    <RadioGroup 
                      value={selectedGroupSize}
                      onValueChange={(value) => setSelectedGroupSize(value as GroupSize)}
                      className="flex gap-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="three" id="option-three" />
                        <Label htmlFor="option-three">3er Gruppen</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="four" id="option-four" />
                        <Label htmlFor="option-four">4er Gruppen</Label>
                      </div>
                    </RadioGroup>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block">Kategorie</label>
                    <RadioGroup 
                      value={selectedGroupCategory}
                      onValueChange={(value) => setSelectedGroupCategory(value as GroupCategory)}
                      className="flex gap-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="kids_juniors" id="option-kids_juniors" />
                        <Label htmlFor="option-kids_juniors">Kids/Junioren</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="active" id="option-active" />
                        <Label htmlFor="option-active">Aktive</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>
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
