
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

const WelcomeCard: React.FC = () => {
  return (
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
  );
};

export default WelcomeCard;
