
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { mockParticipants, mockIndividualScores, mockSponsors, mockGroups, mockGroupScores } from '../../data/mockData';
import { Category, ParticipantResult } from '../../types';
import { generateResultsPDF } from '../../utils/pdfUtils';

// Import new components
import ResultsList from '../../components/Results/ResultsList';
import PodiumView from '../../components/Results/PodiumView';
import StatisticsCard from '../../components/Results/StatisticsCard';
import ResultsControls from '../../components/Results/ResultsControls';
import { generateResults, generateGroupResults } from '../../services/ResultsService';

const ResultsPage = () => {
  const [selectedCategory, setSelectedCategory] = useState<Category>('kids');
  const [selectedView, setSelectedView] = useState<string>('list');

  // Generate results using the imported service
  const results = generateResults(selectedCategory, mockParticipants, mockIndividualScores);
  
  // Generate all individual results for all categories
  const allIndividualResults: Record<Category, ParticipantResult[]> = {
    'kids': generateResults('kids', mockParticipants, mockIndividualScores),
    'juniors': generateResults('juniors', mockParticipants, mockIndividualScores),
    'active': generateResults('active', mockParticipants, mockIndividualScores)
  };
  
  // Generate group results
  const groupResults = generateGroupResults(mockGroups, mockParticipants, mockGroupScores);
  const sponsor = mockSponsors.find(s => s.category === selectedCategory && s.rank === 1);

  // Handle PDF export
  const handleExportPDF = () => {
    generateResultsPDF(
      allIndividualResults,
      groupResults,
      mockSponsors,
      "Schweiz. Peitschenclub Turnier"
    );
  };

  return (
    <div className="animate-fade-in">
      <h1 className="text-3xl font-bold text-swiss-blue mb-6">Ergebnisse</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
        <Card className="lg:col-span-3">
          <CardHeader className="pb-3">
            <CardTitle>Rangliste {selectedCategory}</CardTitle>
            <CardDescription>
              Zeigen Sie die Ranglisten für verschiedene Kategorien an
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Results controls component */}
            <ResultsControls
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
              selectedView={selectedView}
              onViewChange={setSelectedView}
              onExportPDF={handleExportPDF}
            />

            {/* Conditionally render list or podium view */}
            {selectedView === 'list' ? (
              <ResultsList results={results} />
            ) : (
              <PodiumView results={results} sponsor={sponsor} />
            )}
          </CardContent>
        </Card>

        {/* Statistics card component */}
        <StatisticsCard 
          participants={mockParticipants} 
          individualScoresCount={mockIndividualScores.length} 
        />
      </div>
    </div>
  );
};

export default ResultsPage;
