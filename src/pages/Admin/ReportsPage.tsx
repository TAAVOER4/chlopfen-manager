
import React, { useState } from 'react';
import { useUser } from '@/contexts/UserContext';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui/tabs';
import { FileText, BarChart2, FileOutput } from 'lucide-react';
import { ResultsTab } from '@/components/Admin/Reports/ResultsTab';
import { ExportsTab } from '@/components/Admin/Reports/ExportsTab';
import { StatisticsTab } from '@/components/Admin/Reports/StatisticsTab';
import { AccessDenied } from '@/components/Admin/Reports/AccessDenied';
import { useReportsData } from '@/hooks/useReportsData';

const ReportsPage: React.FC = () => {
  const { isAdmin } = useUser();
  const [activeTab, setActiveTab] = useState('results');
  
  const {
    allIndividualResults,
    groupResults,
    tournamentName,
    tournament,
    mockSchedule,
    mockParticipants,
    mockGroups,
    mockIndividualScores,
    mockGroupScores,
    mockSponsors
  } = useReportsData();

  // If not admin, show access denied
  if (!isAdmin) {
    return <AccessDenied />;
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
            <FileOutput className="h-4 w-4 mr-2" />
            Datenexporte
          </TabsTrigger>
          <TabsTrigger value="statistics">
            <FileText className="h-4 w-4 mr-2" />
            Statistiken
          </TabsTrigger>
        </TabsList>
        
        {/* Results & Rankings Tab */}
        <TabsContent value="results">
          <ResultsTab 
            allIndividualResults={allIndividualResults}
            groupResults={groupResults}
            tournamentName={tournamentName}
            selectedTournamentId={tournament.id}
            mockSponsors={mockSponsors}
            mockSchedule={mockSchedule}
          />
        </TabsContent>
        
        {/* Data Exports Tab */}
        <TabsContent value="exports">
          <ExportsTab 
            participants={mockParticipants}
            tournamentName={tournamentName}
          />
        </TabsContent>
        
        {/* Statistics Tab */}
        <TabsContent value="statistics">
          <StatisticsTab 
            participants={mockParticipants}
            groups={mockGroups}
            individualScores={mockIndividualScores}
            groupScores={mockGroupScores}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReportsPage;
