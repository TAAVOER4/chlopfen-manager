
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';

const GroupJudgingTab: React.FC = () => {
  return (
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
  );
};

export default GroupJudgingTab;
