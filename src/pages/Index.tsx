
import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  Award, 
  BarChart, 
  Calendar,
  User,
  UsersRound
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { mockParticipants } from '../data/mockData';
import { getCategoryDisplay, getCategoryClass } from '../utils/categoryUtils';

const Index = () => {
  // Group participants by category
  const participantsByCategory = mockParticipants.reduce(
    (acc, participant) => {
      if (!acc[participant.category]) {
        acc[participant.category] = {
          all: [],
          individual: [],
          groupOnly: []
        };
      }
      
      // Add to all participants
      acc[participant.category].all.push(participant);
      
      // Sort by participation type
      if (participant.isGroupOnly) {
        acc[participant.category].groupOnly.push(participant);
      } else {
        acc[participant.category].individual.push(participant);
      }
      
      return acc;
    },
    {} as Record<string, { 
      all: typeof mockParticipants,
      individual: typeof mockParticipants,
      groupOnly: typeof mockParticipants
    }>
  );

  const totalParticipants = mockParticipants.length;
  const individualParticipants = mockParticipants.filter(p => !p.isGroupOnly).length;
  const groupOnlyParticipants = mockParticipants.filter(p => p.isGroupOnly).length;

  return (
    <div className="animate-fade-in">
      <div className="text-center mb-6">
        <h1 className="text-4xl font-bold text-swiss-blue mb-2">Wettchlöpfen Manager</h1>
        
        {/* Sponsor logos in the same style as footer */}
        <div className="flex justify-center mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 bg-white p-4 rounded-lg w-full max-w-4xl">
            <div className="flex justify-center items-center">
              <img 
                src="/lovable-uploads/a5d2c313-c136-4233-8b7b-e1347138b272.png" 
                alt="Geislechlöpfer Ohmstal" 
                className="h-24 object-contain"
              />
            </div>
            <div className="flex justify-center items-center">
              <img 
                src="/lovable-uploads/d96b84f9-8847-4e45-bd71-c44b3fb53513.png" 
                alt="Geislechlöpfer Buttisholz" 
                className="h-24 object-contain"
              />
            </div>
            <div className="flex justify-center items-center">
              <img 
                src="/lovable-uploads/4ea13025-c283-4b04-91f7-8176d706ccf7.png" 
                alt="Chlaus-chlöpfer Hergiswil" 
                className="h-24 object-contain"
              />
            </div>
          </div>
        </div>
        
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Digitale Verwaltung und Bewertung für Wettchlöpfen-Turniere
        </p>
      </div>

      {/* Overview Cards - Total Participants */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Teilnehmer Total
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
              Einzelwertung
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{individualParticipants}</div>
              <User className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Nur Gruppe
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{groupOnlyParticipants}</div>
              <UsersRound className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Kids Category */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between">
              <span>{getCategoryDisplay('kids')}</span>
              <div className="h-4 w-4 rounded-full bg-green-500" />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">Total:</div>
              <div className="font-medium">{participantsByCategory['kids']?.all.length || 0}</div>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">Einzelwertung:</div>
              <div className="font-medium">{participantsByCategory['kids']?.individual.length || 0}</div>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">Nur Gruppe:</div>
              <div className="font-medium">{participantsByCategory['kids']?.groupOnly.length || 0}</div>
            </div>
          </CardContent>
        </Card>

        {/* Juniors Category */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between">
              <span>{getCategoryDisplay('juniors')}</span>
              <div className="h-4 w-4 rounded-full bg-blue-500" />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">Total:</div>
              <div className="font-medium">{participantsByCategory['juniors']?.all.length || 0}</div>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">Einzelwertung:</div>
              <div className="font-medium">{participantsByCategory['juniors']?.individual.length || 0}</div>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">Nur Gruppe:</div>
              <div className="font-medium">{participantsByCategory['juniors']?.groupOnly.length || 0}</div>
            </div>
          </CardContent>
        </Card>

        {/* Active Category */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between">
              <span>{getCategoryDisplay('active')}</span>
              <div className="h-4 w-4 rounded-full bg-red-500" />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">Total:</div>
              <div className="font-medium">{participantsByCategory['active']?.all.length || 0}</div>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">Einzelwertung:</div>
              <div className="font-medium">{participantsByCategory['active']?.individual.length || 0}</div>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">Nur Gruppe:</div>
              <div className="font-medium">{participantsByCategory['active']?.groupOnly.length || 0}</div>
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
