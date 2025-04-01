
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Download, Medal, TrendingUp } from 'lucide-react';
import { mockParticipants, mockIndividualScores, mockSponsors } from '../../data/mockData';
import { getCategoryDisplay } from '../../utils/categoryUtils';
import { Category, ParticipantResult } from '../../types';
import { calculateIndividualTotal } from '../../utils/scoreUtils';

const ResultsPage = () => {
  const [selectedCategory, setSelectedCategory] = useState<Category>('kids');
  const [selectedView, setSelectedView] = useState<string>('list');

  // Generate mock results
  const generateResults = (category: Category): ParticipantResult[] => {
    const filteredParticipants = mockParticipants.filter(p => p.category === category);
    
    return filteredParticipants.map(participant => {
      const participantScores = mockIndividualScores.filter(
        score => score.participantId === participant.id
      );
      const totalScore = calculateIndividualTotal(participantScores);
      const averageScore = participantScores.length > 0 ? totalScore / participantScores.length : 0;
      
      return {
        participant,
        totalScore,
        averageScore,
        rank: 0 // Will be set below
      };
    }).sort((a, b) => b.totalScore - a.totalScore)
      .map((result, index) => ({
        ...result,
        rank: index + 1
      }));
  };

  const results = generateResults(selectedCategory);
  const sponsor = mockSponsors.find(s => s.category === selectedCategory && s.rank === 1);

  return (
    <div className="animate-fade-in">
      <h1 className="text-3xl font-bold text-swiss-blue mb-6">Ergebnisse</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
        <Card className="lg:col-span-3">
          <CardHeader className="pb-3">
            <CardTitle>Rangliste {getCategoryDisplay(selectedCategory)}</CardTitle>
            <CardDescription>
              Zeigen Sie die Ranglisten für verschiedene Kategorien an
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
              <div className="mb-4 sm:mb-0">
                <Tabs defaultValue="kids" className="w-full" onValueChange={(value) => setSelectedCategory(value as Category)}>
                  <TabsList>
                    <TabsTrigger value="kids">Kids</TabsTrigger>
                    <TabsTrigger value="juniors">Junioren</TabsTrigger>
                    <TabsTrigger value="active">Aktive</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
              <div className="flex gap-4">
                <Select defaultValue="list" onValueChange={setSelectedView}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Ansicht wählen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="list">Listenansicht</SelectItem>
                    <SelectItem value="podium">Podium</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" className="gap-2">
                  <Download className="h-4 w-4" /> 
                  PDF
                </Button>
              </div>
            </div>

            {selectedView === 'list' ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">Rang</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Wohnort</TableHead>
                    <TableHead className="text-right">Jahrgang</TableHead>
                    <TableHead className="text-right">Punkte</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {results.map((result) => (
                    <TableRow key={result.participant.id}>
                      <TableCell className="font-bold">
                        {result.rank <= 3 ? (
                          <div className="flex items-center">
                            <Medal className={`h-5 w-5 mr-1 ${
                              result.rank === 1 ? 'text-yellow-500' : 
                              result.rank === 2 ? 'text-gray-400' : 'text-amber-700'
                            }`} />
                            {result.rank}
                          </div>
                        ) : result.rank}
                      </TableCell>
                      <TableCell>
                        {result.participant.firstName} {result.participant.lastName}
                      </TableCell>
                      <TableCell>{result.participant.location}</TableCell>
                      <TableCell className="text-right">{result.participant.birthYear}</TableCell>
                      <TableCell className="text-right font-medium">
                        {Math.round(result.totalScore * 10) / 10}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="flex flex-col items-center justify-center py-8">
                <div className="flex items-end mb-12 space-x-8">
                  {results.length >= 2 && (
                    <div className="flex flex-col items-center">
                      <div className="w-32 h-32 bg-gray-200 rounded-lg flex items-center justify-center mb-4">
                        <div className="text-center">
                          <Medal className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                          <span className="font-bold text-xl">#2</span>
                        </div>
                      </div>
                      <div className="text-center">
                        <p className="font-bold">{results[1].participant.firstName} {results[1].participant.lastName}</p>
                        <p className="text-sm text-muted-foreground">{Math.round(results[1].totalScore * 10) / 10} Punkte</p>
                      </div>
                    </div>
                  )}
                  
                  {results.length >= 1 && (
                    <div className="flex flex-col items-center">
                      <div className="w-36 h-40 bg-yellow-100 rounded-lg flex items-center justify-center mb-4 border-2 border-yellow-500">
                        <div className="text-center">
                          <Medal className="h-10 w-10 text-yellow-500 mx-auto mb-2" />
                          <span className="font-bold text-2xl">#1</span>
                        </div>
                      </div>
                      <div className="text-center">
                        <p className="font-bold">{results[0].participant.firstName} {results[0].participant.lastName}</p>
                        <p className="text-sm text-muted-foreground">{Math.round(results[0].totalScore * 10) / 10} Punkte</p>
                      </div>
                    </div>
                  )}
                  
                  {results.length >= 3 && (
                    <div className="flex flex-col items-center">
                      <div className="w-32 h-28 bg-amber-100 rounded-lg flex items-center justify-center mb-4">
                        <div className="text-center">
                          <Medal className="h-8 w-8 text-amber-700 mx-auto mb-2" />
                          <span className="font-bold text-xl">#3</span>
                        </div>
                      </div>
                      <div className="text-center">
                        <p className="font-bold">{results[2].participant.firstName} {results[2].participant.lastName}</p>
                        <p className="text-sm text-muted-foreground">{Math.round(results[2].totalScore * 10) / 10} Punkte</p>
                      </div>
                    </div>
                  )}
                </div>

                {sponsor && (
                  <div className="text-center mt-4">
                    <p className="text-sm text-muted-foreground mb-2">Sponsor</p>
                    <p className="font-medium text-lg">{sponsor.name}</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Statistiken
            </CardTitle>
            <CardDescription>
              Allgemeine Statistiken zum Wettkampf
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Teilnehmer gesamt</p>
                <p className="text-2xl font-bold">{mockParticipants.length}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-muted-foreground">Kids</p>
                <p className="text-2xl font-bold">
                  {mockParticipants.filter(p => p.category === 'kids').length}
                </p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-muted-foreground">Junioren</p>
                <p className="text-2xl font-bold">
                  {mockParticipants.filter(p => p.category === 'juniors').length}
                </p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-muted-foreground">Aktive</p>
                <p className="text-2xl font-bold">
                  {mockParticipants.filter(p => p.category === 'active').length}
                </p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-muted-foreground">Bewertungen</p>
                <p className="text-2xl font-bold">{mockIndividualScores.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ResultsPage;
