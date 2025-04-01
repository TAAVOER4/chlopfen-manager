
import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  Award, 
  BarChart, 
  Calendar 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { mockParticipants } from '../data/mockData';
import { getCategoryDisplay, getCategoryClass } from '../utils/categoryUtils';

const Index = () => {
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

  const totalParticipants = mockParticipants.length;

  return (
    <div className="animate-fade-in">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-swiss-blue mb-2">Wettchlöpfen Manager</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Digitale Verwaltung und Bewertung für Wettchlöpfen-Turniere
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Quick stats cards */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Teilnehmer
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{totalParticipants}</div>
              <Users className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Kids
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">
                {participantsByCategory['kids']?.length || 0}
              </div>
              <div className="h-5 w-5 rounded-full bg-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Junioren
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">
                {participantsByCategory['juniors']?.length || 0}
              </div>
              <div className="h-5 w-5 rounded-full bg-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Aktive
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">
                {participantsByCategory['active']?.length || 0}
              </div>
              <div className="h-5 w-5 rounded-full bg-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Willkommen zum Wettchlöpfen Manager</CardTitle>
            <CardDescription>
              Verwalten Sie Teilnehmer, Bewertungen und Ergebnisse für das Wettchlöpfen-Turnier
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Mit dieser Anwendung können Sie den gesamten Ablauf des
              Wettchlöpfen-Turniers digital verwalten:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Erfassung und Kategorisierung der Teilnehmer</li>
              <li>Digitale Bewertung durch die Richter</li>
              <li>Automatische Berechnung der Ranglisten</li>
              <li>Anzeige der Live-Ergebnisse</li>
            </ul>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" asChild>
              <Link to="/admin">Einstellungen</Link>
            </Button>
            <Button asChild>
              <Link to="/participants">Teilnehmer verwalten</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Schnellzugriff</CardTitle>
            <CardDescription>Wichtige Funktionen im Überblick</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link to="/participants/register">
                <Users className="mr-2 h-4 w-4" />
                Teilnehmer erfassen
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link to="/judging">
                <Award className="mr-2 h-4 w-4" />
                Bewertung starten
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link to="/results">
                <BarChart className="mr-2 h-4 w-4" />
                Ergebnisse anzeigen
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link to="/admin">
                <Calendar className="mr-2 h-4 w-4" />
                Turnier verwalten
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
