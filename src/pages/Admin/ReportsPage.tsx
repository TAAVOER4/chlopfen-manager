
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
import StatisticsTab from '@/components/Admin/Reports/StatisticsTab';
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
    mockSponsors,
    participants,
    groups,
    individualScores,
    groupScores,
    sponsors
  } = useReportsData();

  // If not admin, show access denied
  if (!isAdmin) {
    return <AccessDenied />;
  }
  
  // Transform the data to match the expected types for ResultsTab
  const formattedIndividualResults = {
    kids: allIndividualResults.kids.map(result => ({
      rank: result.rank,
      name: `${result.participant.firstName} ${result.participant.lastName}`,
      location: result.participant.location,
      score: result.totalScore
    })),
    juniors: allIndividualResults.juniors.map(result => ({
      rank: result.rank,
      name: `${result.participant.firstName} ${result.participant.lastName}`,
      location: result.participant.location,
      score: result.totalScore
    })),
    active: allIndividualResults.active.map(result => ({
      rank: result.rank,
      name: `${result.participant.firstName} ${result.participant.lastName}`,
      location: result.participant.location,
      score: result.totalScore
    }))
  };

  // Transform group results to the expected format
  const formattedGroupResults = Object.values(groupResults)
    .flat()
    .map(group => ({
      rank: group.rank,
      name: `Group ${group.groupId}`,
      location: group.members.map(m => m.location).join(', '),
      score: group.totalScore
    }));
  
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
            allIndividualResults={formattedIndividualResults}
            groupResults={formattedGroupResults}
            tournamentName={tournamentName}
            selectedTournamentId={tournament.id}
            mockSponsors={mockSponsors}
            mockSchedule={mockSchedule}
          />
        </TabsContent>
        
        {/* Data Exports Tab */}
        <TabsContent value="exports">
          <ExportsTab 
            participants={participants}
            tournamentName={tournamentName}
            groups={groups}
          />
        </TabsContent>
        
        {/* Statistics Tab */}
        <TabsContent value="statistics">
          <StatisticsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReportsPage;
