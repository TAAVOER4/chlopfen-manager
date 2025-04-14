
import React from 'react';
import { Category, Participant } from '../../types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import IndividualCategories from './IndividualJudgingTab/IndividualCategories';

interface IndividualJudgingTabProps {
  categories: Category[];
  participantsByCategory: Record<string, Participant[]>;
  isAdmin: boolean;
  openReorderDialog: (category: Category) => void;
}

const IndividualJudgingTab: React.FC<IndividualJudgingTabProps> = ({
  categories,
  participantsByCategory,
  isAdmin,
  openReorderDialog
}) => {
  return (
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
        
        <IndividualCategories 
          categories={categories}
          participantsByCategory={participantsByCategory}
          isAdmin={isAdmin}
          openReorderDialog={openReorderDialog}
        />
      </CardContent>
    </Card>
  );
};

export default IndividualJudgingTab;
