
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  User, 
  Users, 
  ArrowRight 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { mockParticipants } from '../../data/mockData';
import { getCategoryDisplay } from '../../utils/categoryUtils';
import { Category } from '../../types';

const JudgingPage = () => {
  const [activeTab, setActiveTab] = useState<string>('individual');

  const participantsByCategory = mockParticipants.reduce(
    (acc, participant) => {
      if (!acc[participant.category]) {
        acc[participant.category] = [];
      }
      acc[participant.category].push(participant);
      return acc;
    },
    {} as Record<string, typeof mockParticipants>
  );

  const categories: Category[] = ['kids', 'juniors', 'active'];

  return (
    <div className="animate-fade-in">
      <h1 className="text-3xl font-bold text-swiss-blue mb-6">Bewertung</h1>
      
      <Tabs defaultValue="individual" className="mb-6" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="individual">
            <User className="mr-2 h-4 w-4" />
            Einzelbewertung
          </TabsTrigger>
          <TabsTrigger value="group">
            <Users className="mr-2 h-4 w-4" />
            Gruppenbewertung
          </TabsTrigger>
        </TabsList>
        <TabsContent value="individual" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Einzelbewertung</CardTitle>
              <CardDescription>
                Bewerten Sie die individuellen Leistungen der Teilnehmer
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                Bei der Einzelbewertung werden folgende Kriterien bewertet:
              </p>
              <ul className="list-disc pl-5 mb-6 space-y-1">
                <li>Schläge (17/23/33 je nach Kategorie)</li>
                <li>Rhythmus</li>
                <li>Stand</li>
                <li>Körperhaltung</li>
                <li>Geiselführung</li>
              </ul>
              <p className="mb-4">Wählen Sie eine Kategorie für die Bewertung:</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {categories.map((category) => {
                  const participants = participantsByCategory[category] || [];
                  return (
                    <Card key={category}>
                      <CardHeader className="pb-2">
                        <CardTitle>{getCategoryDisplay(category)}</CardTitle>
                        <CardDescription>
                          {participants.length} Teilnehmer
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <p className="text-sm text-muted-foreground">
                          {category === 'kids' ? '17 Schläge' : 
                           category === 'juniors' ? '23 Schläge' : '33 Schläge'}
                        </p>
                      </CardContent>
                      <CardFooter>
                        <Button asChild className="w-full">
                          <Link to={`/judging/individual/${category}`}>
                            Bewerten
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Link>
                        </Button>
                      </CardFooter>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="group" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Gruppenbewertung</CardTitle>
              <CardDescription>
                Bewerten Sie die Leistungen der Teilnehmergruppen
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                Bei der Gruppenbewertung werden folgende Kriterien bewertet:
              </p>
              <ul className="list-disc pl-5 mb-6 space-y-1">
                <li>Schläge (Zeitlimit 45 Sekunden)</li>
                <li>Rhythmus (2 Noten)</li>
                <li>Takt (2 Noten)</li>
              </ul>
              
              <p className="mb-4">Wählen Sie eine Gruppenkategorie für die Bewertung:</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle>Dreiergruppen</CardTitle>
                    <CardDescription>
                      Bewertung der Dreiergruppen
                    </CardDescription>
                  </CardHeader>
                  <CardFooter>
                    <Button asChild className="w-full">
                      <Link to="/judging/group/three">
                        Bewerten
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle>Vierergruppen</CardTitle>
                    <CardDescription>
                      Bewertung der Vierergruppen
                    </CardDescription>
                  </CardHeader>
                  <CardFooter>
                    <Button asChild className="w-full">
                      <Link to="/judging/group/four">
                        Bewerten
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default JudgingPage;
