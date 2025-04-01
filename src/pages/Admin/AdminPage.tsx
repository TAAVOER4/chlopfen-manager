
import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  Award, 
  Settings, 
  Database, 
  Calendar,
  Printer,
  ArrowRight
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

const AdminPage = () => {
  return (
    <div className="animate-fade-in">
      <h1 className="text-3xl font-bold text-swiss-blue mb-6">Administration</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Teilnehmerverwaltung
            </CardTitle>
            <CardDescription>
              Verwaltung der Teilnehmer und Gruppenzuweisung
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Verwalten Sie alle Teilnehmer, weisen Sie Gruppen zu und exportieren Sie Teilnehmerlisten.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full">
              <Link to="/participants">
                Zur Teilnehmerverwaltung
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Award className="h-5 w-5 mr-2" />
              Richterverwaltung
            </CardTitle>
            <CardDescription>
              Verwaltung der Richter und Zugriffsrechte
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Verwalten Sie die Richter, vergeben Sie Zugriffsrechte und weisen Sie Kategorien zu.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full">
              <Link to="/admin/judges">
                Zur Richterverwaltung
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Database className="h-5 w-5 mr-2" />
              Sponsorenverwaltung
            </CardTitle>
            <CardDescription>
              Verwaltung der Sponsoren und Zuordnung zu Kategorien
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Verwalten Sie die Sponsoren und ordnen Sie diese den Kategorien und Rängen zu.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full">
              <Link to="/admin/sponsors">
                Zur Sponsorenverwaltung
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="h-5 w-5 mr-2" />
              Turniereinstellungen
            </CardTitle>
            <CardDescription>
              Konfiguration des aktuellen Turniers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Legen Sie den Turniernamen, das Datum und andere Einstellungen fest.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full">
              <Link to="/admin/tournament">
                Zu den Turniereinstellungen
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Zeitplan
            </CardTitle>
            <CardDescription>
              Verwaltung des Turnier-Zeitplans
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Erstellen und bearbeiten Sie den Zeitplan für das Turnier.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full">
              <Link to="/admin/schedule">
                Zum Zeitplan
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Printer className="h-5 w-5 mr-2" />
              Berichte & Exporte
            </CardTitle>
            <CardDescription>
              Generierung von Berichten und Exporten
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Erstellen Sie Berichte, Ranglisten und exportieren Sie Daten in verschiedenen Formaten.
            </p>
          </CardContent>
          <CardFooter>
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
