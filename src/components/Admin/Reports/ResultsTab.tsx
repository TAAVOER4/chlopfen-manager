
import React, { useMemo, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { generateResultsPDF } from '@/utils/pdf/pdfExportUtils';
import { Tournament, GroupSize, GroupCategory } from '@/types';
import { toast } from "sonner";
import { mockGroups } from '@/data/mockData';
import { FilterControls } from './FilterControls';
import { GroupFilterPanel } from './GroupFilterPanel';
import { ResultsTable } from './ResultsTable';

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
    if (!groupResults || groupResults.length === 0) {
      return [];
    }

    console.log("Filtering groups:", groupResults);
    console.log("Selected size:", selectedGroupSize);
    console.log("Selected category:", selectedGroupCategory);
    
    // Get original groups from mockGroups to check their categories
    const groupMap = new Map();
    mockGroups.forEach(group => {
      groupMap.set(group.name, {
        size: group.size,
        category: group.category
      });
    });
    
    return groupResults.filter(group => {
      if (!group || !group.name) return false;
      
      // Find the original group data by name
      const originalGroup = groupMap.get(group.name);
      
      if (originalGroup) {
        // Use the actual category and size from mockGroups
        return originalGroup.size === selectedGroupSize && 
               originalGroup.category === selectedGroupCategory;
      }
      
      // Fallback to name-based filtering if group not found in mockGroups
      const groupName = group.name.toLowerCase();
      
      if (selectedGroupCategory === 'active') {
        return groupName.includes('aktiv') || groupName.includes('active');
      } 
      else if (selectedGroupCategory === 'kids_juniors') {
        const isActive = groupName.includes('aktiv') || groupName.includes('active');
        return !isActive;
      }
      
      return false;
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
          {selectedExportType === 'individual' ? (
            <FilterControls
              exportType={selectedExportType}
              onExportTypeChange={setSelectedExportType}
              category={selectedCategory}
              onCategoryChange={setSelectedCategory}
              onGeneratePDF={handleGenerateResults}
              showCategorySelect={true}
            />
          ) : (
            <GroupFilterPanel
              exportType={selectedExportType}
              onExportTypeChange={setSelectedExportType}
              groupSize={selectedGroupSize}
              onGroupSizeChange={setSelectedGroupSize}
              groupCategory={selectedGroupCategory}
              onGroupCategoryChange={setSelectedGroupCategory}
              onGeneratePDF={handleGenerateResults}
            />
          )}
          
          <Separator className="my-6" />
          
          <ResultsTable results={currentResults} />
        </CardContent>
      </Card>
    </div>
  );
};
