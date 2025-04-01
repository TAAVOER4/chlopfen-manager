
import React from 'react';
import {
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';

const GroupJudgingTabHeader: React.FC = () => {
  return (
    <>
      <CardHeader>
        <CardTitle>Gruppenbewertung</CardTitle>
        <CardDescription>
          Bewerten Sie die Gruppenperformances
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="mb-4">
          Bei der Gruppenbewertung werden folgende Kriterien bewertet:
        </p>
        <ul className="list-disc pl-5 mb-6 space-y-1">
          <li>Schläge</li>
          <li>Rhythmus</li>
          <li>Takt</li>
        </ul>

        <p className="mb-4">Wählen Sie eine Kategorie für die Bewertung:</p>
      </CardContent>
    </>
  );
};

export default GroupJudgingTabHeader;
