
import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  Award, 
  Settings, 
  Database, 
  Calendar,
  Printer,
  ArrowRight,
  Flag,
  Trophy,
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useUser } from '@/contexts/UserContext';

const AdminPage = () => {
  const { isAdmin } = useUser();
  
  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <h2 className="text-2xl font-bold mb-4">Zugriff verweigert</h2>
        <p className="text-muted-foreground mb-4">Sie haben keine Berechtigung, diese Seite zu sehen.</p>
        <Button asChild>
          <Link to="/">Zurück zur Startseite</Link>
        </Button>
      </div>
    );
  }
  
  return (
    <div className="animate-fade-in">
      <h1 className="text-3xl font-bold text-swiss-blue mb-6">Administration</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Each card has fixed min-height to ensure consistent button positioning */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Teilnehmerverwaltung
            </CardTitle>
            <CardDescription>
              Verwaltung der Teilnehmer und Gruppenzuweisung
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-grow">
            <p className="text-sm text-muted-foreground">
              Verwalten Sie alle Teilnehmer, weisen Sie Gruppen zu und exportieren Sie Teilnehmerlisten.
            </p>
          </CardContent>
          <CardFooter className="mt-auto">
            <Button asChild className="w-full">
              <Link to="/participants">
                Zur Teilnehmerverwaltung
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
        
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Award className="h-5 w-5 mr-2" />
              Benutzerverwaltung
            </CardTitle>
            <CardDescription>
              Verwaltung der Benutzer und Zugriffsrechte
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-grow">
            <p className="text-sm text-muted-foreground">
              Verwalten Sie die Benutzer, vergeben Sie Zugriffsrechte und weisen Sie Kategorien zu.
            </p>
          </CardContent>
          <CardFooter className="mt-auto">
            <Button asChild className="w-full">
              <Link to="/admin/users">
                Zur Benutzerverwaltung
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
        
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Flag className="h-5 w-5 mr-2" />
              Sponsorenverwaltung
            </CardTitle>
            <CardDescription>
              Verwaltung der Sponsoren und Zuordnung zu Kategorien
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-grow">
            <p className="text-sm text-muted-foreground">
              Verwalten Sie die Sponsoren und ordnen Sie diese den Kategorien und Rängen zu.
            </p>
          </CardContent>
          <CardFooter className="mt-auto">
            <Button asChild className="w-full">
              <Link to="/admin/sponsors">
                Zur Sponsorenverwaltung
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
        
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Trophy className="h-5 w-5 mr-2" />
              Turniereinstellungen
            </CardTitle>
            <CardDescription>
              Konfiguration des aktuellen Turniers
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-grow">
            <p className="text-sm text-muted-foreground">
              Legen Sie den Turniernamen, das Datum und andere Einstellungen fest. Weisen Sie dem Turnier Teilnehmer und Richter zu.
            </p>
          </CardContent>
          <CardFooter className="mt-auto">
            <Button asChild className="w-full">
              <Link to="/admin/tournament">
                Zu den Turniereinstellungen
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
        
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Zeitplan
            </CardTitle>
            <CardDescription>
              Verwaltung des Turnier-Zeitplans
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-grow">
            <p className="text-sm text-muted-foreground">
              Erstellen und bearbeiten Sie den Zeitplan für das Turnier.
            </p>
          </CardContent>
          <CardFooter className="mt-auto">
            <Button asChild className="w-full">
              <Link to="/admin/schedule">
                Zum Zeitplan
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
        
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Berichte & Exporte
            </CardTitle>
            <CardDescription>
              Generierung von Berichten und Exporten
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-grow">
            <p className="text-sm text-muted-foreground">
              Erstellen Sie Berichte, Ranglisten und exportieren Sie Daten in verschiedenen Formaten.
            </p>
          </CardContent>
          <CardFooter className="mt-auto">
            <Button asChild className="w-full">
              <Link to="/admin/reports">
                Zu den Berichten
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default AdminPage;
