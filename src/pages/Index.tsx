
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  Award, 
  BarChart, 
  Calendar,
  User,
  UsersRound,
  Group
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { getCategoryDisplay, getCategoryClass } from '../utils/categoryUtils';
import { Spinner } from '@/components/ui/spinner';
import { DatabaseService } from '@/services/DatabaseService';
import { useTournament } from '@/contexts/TournamentContext';

// Initialize statistics types
type ParticipantStats = {
  total: number;
  individual: number;
  groupOnly: number;
  byCategory: Record<string, {
    total: number;
    individual: number;
    groupOnly: number;
  }>;
};

type GroupStats = {
  total: number;
  bySize: {
    three: number;
    four: number;
  };
};

const Index = () => {
  const { activeTournament } = useTournament();
  const [isLoading, setIsLoading] = useState(true);
  const [participantStats, setParticipantStats] = useState<ParticipantStats>({
    total: 0,
    individual: 0,
    groupOnly: 0,
    byCategory: {}
  });
  const [groupStats, setGroupStats] = useState<GroupStats>({
    total: 0,
    bySize: {
      three: 0,
      four: 0
    }
  });

  // Fetch statistics from database
  useEffect(() => {
    const fetchStatistics = async () => {
      setIsLoading(true);
      try {
        const [participantData, groupData] = await Promise.all([
          DatabaseService.getParticipantStatistics(),
          DatabaseService.getGroupStatistics()
        ]);
        
        setParticipantStats(participantData);
        setGroupStats(groupData);
      } catch (error) {
        console.error('Error fetching dashboard statistics:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchStatistics();
  }, [activeTournament]);

  // Get category stats with default values if category doesn't exist
  const getCategoryStats = (category: string) => {
    return participantStats.byCategory[category] || { total: 0, individual: 0, groupOnly: 0 };
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Spinner size="large" className="mx-auto mb-4" />
          <p className="text-lg text-muted-foreground">Lade Dashboard...</p>
        </div>
      </div>
    );
  }

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

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Teilnehmer Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{participantStats.total}</div>
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
              <div className="text-2xl font-bold">{participantStats.individual}</div>
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
              <div className="text-2xl font-bold">{participantStats.groupOnly}</div>
              <UsersRound className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Gruppen Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{groupStats.total}</div>
              <Group className="h-5 w-5 text-muted-foreground" />
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
              <div className="font-medium">{getCategoryStats('kids').total}</div>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">Einzelwertung:</div>
              <div className="font-medium">{getCategoryStats('kids').individual}</div>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">Nur Gruppe:</div>
              <div className="font-medium">{getCategoryStats('kids').groupOnly}</div>
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
              <div className="font-medium">{getCategoryStats('juniors').total}</div>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">Einzelwertung:</div>
              <div className="font-medium">{getCategoryStats('juniors').individual}</div>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">Nur Gruppe:</div>
              <div className="font-medium">{getCategoryStats('juniors').groupOnly}</div>
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
              <div className="font-medium">{getCategoryStats('active').total}</div>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">Einzelwertung:</div>
              <div className="font-medium">{getCategoryStats('active').individual}</div>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">Nur Gruppe:</div>
              <div className="font-medium">{getCategoryStats('active').groupOnly}</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Group Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between">
              <span>Dreiergruppen</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">Anzahl:</div>
              <div className="text-2xl font-bold">{groupStats.bySize.three}</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between">
              <span>Vierergruppen</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">Anzahl:</div>
              <div className="text-2xl font-bold">{groupStats.bySize.four}</div>
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
