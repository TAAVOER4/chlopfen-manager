
import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Award, BarChart, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

const QuickAccessCard: React.FC = () => {
  return (
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
  );
};

export default QuickAccessCard;
