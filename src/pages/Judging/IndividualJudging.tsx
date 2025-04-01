
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Save, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { mockParticipants } from '../../data/mockData';
import { getCategoryDisplay, getCategoryRequiredStrikes } from '../../utils/categoryUtils';
import { Participant, Category, IndividualScore } from '../../types';

const IndividualJudging = () => {
  const { category = '' } = useParams<{ category: Category }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const categoryParticipants = mockParticipants.filter(
    (p) => p.category === category
  );

  const [currentIndex, setCurrentIndex] = useState(0);
  const [round, setRound] = useState<1 | 2>(1);
  const [scores, setScores] = useState<{ [key: string]: number }>({
    whipStrikes: 0,
    rhythm: 0,
    stance: 0,
    posture: 0,
    whipControl: 0,
  });

  const currentParticipant = categoryParticipants[currentIndex];
  const requiredStrikes = getCategoryRequiredStrikes(category as Category);

  const handleScoreChange = (field: string, value: number) => {
    // Ensure score is between 1 and 10
    const score = Math.max(1, Math.min(10, value));
    setScores({ ...scores, [field]: score });
  };

  const handleSave = () => {
    // In a real application, this would save to the database
    toast({
      title: "Bewertung gespeichert",
      description: `Bewertung für ${currentParticipant.firstName} ${currentParticipant.lastName} gespeichert.`
    });

    // Reset scores for the next participant or round
    setScores({
      whipStrikes: 0,
      rhythm: 0,
      stance: 0,
      posture: 0,
      whipControl: 0,
    });

    // Move to the next participant or round
    if (currentIndex < categoryParticipants.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else if (round === 1) {
      setRound(2);
      setCurrentIndex(0);
      toast({
        title: "Erste Runde abgeschlossen",
        description: "Starten Sie nun mit der zweiten Runde."
      });
    } else {
      // End of judging
      toast({
        title: "Bewertung abgeschlossen",
        description: "Alle Teilnehmer wurden bewertet."
      });
      navigate('/judging');
    }
  };

  const isFormValid = () => {
    return scores.whipStrikes > 0 && 
           scores.rhythm > 0 && 
           scores.stance > 0 && 
           scores.posture > 0 && 
           scores.whipControl > 0;
  };

  if (!currentParticipant) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <h2 className="text-2xl font-bold mb-4">Keine Teilnehmer in dieser Kategorie</h2>
        <Button onClick={() => navigate('/judging')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Zurück zur Übersicht
        </Button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Button variant="ghost" onClick={() => navigate('/judging')} className="mr-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Zurück
          </Button>
          <h1 className="text-3xl font-bold text-swiss-blue">
            Einzelbewertung: {getCategoryDisplay(category as Category)}
          </h1>
        </div>
        <div className="text-sm font-medium bg-primary/10 text-primary px-3 py-1 rounded-full">
          Runde {round}/2
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-2xl">
                {currentParticipant.firstName} {currentParticipant.lastName}
              </CardTitle>
              <CardDescription>
                {currentParticipant.location} | Jahrgang {currentParticipant.birthYear}
              </CardDescription>
            </div>
            <div className="text-sm font-medium bg-primary/10 text-primary px-3 py-1 rounded-full">
              {currentIndex + 1}/{categoryParticipants.length}
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-8">
            {/* Whip Strikes */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <label className="font-medium">Schläge ({requiredStrikes})</label>
                <span className="text-sm text-muted-foreground">Note: {scores.whipStrikes || '-'}/10</span>
              </div>
              <div className="grid grid-cols-10 gap-2">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
                  <button
                    key={`whipStrikes-${score}`}
                    className={`h-12 rounded-md border-2 flex items-center justify-center transition-all ${
                      scores.whipStrikes === score
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-input hover:border-primary'
                    }`}
                    onClick={() => handleScoreChange('whipStrikes', score)}
                  >
                    {score}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Rhythm */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <label className="font-medium">Rhythmus</label>
                <span className="text-sm text-muted-foreground">Note: {scores.rhythm || '-'}/10</span>
              </div>
              <div className="grid grid-cols-10 gap-2">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
                  <button
                    key={`rhythm-${score}`}
                    className={`h-12 rounded-md border-2 flex items-center justify-center transition-all ${
                      scores.rhythm === score
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-input hover:border-primary'
                    }`}
                    onClick={() => handleScoreChange('rhythm', score)}
                  >
                    {score}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Stance */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <label className="font-medium">Stand</label>
                <span className="text-sm text-muted-foreground">Note: {scores.stance || '-'}/10</span>
              </div>
              <div className="grid grid-cols-10 gap-2">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
                  <button
                    key={`stance-${score}`}
                    className={`h-12 rounded-md border-2 flex items-center justify-center transition-all ${
                      scores.stance === score
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-input hover:border-primary'
                    }`}
                    onClick={() => handleScoreChange('stance', score)}
                  >
                    {score}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Posture */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <label className="font-medium">Körperhaltung</label>
                <span className="text-sm text-muted-foreground">Note: {scores.posture || '-'}/10</span>
              </div>
              <div className="grid grid-cols-10 gap-2">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
                  <button
                    key={`posture-${score}`}
                    className={`h-12 rounded-md border-2 flex items-center justify-center transition-all ${
                      scores.posture === score
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-input hover:border-primary'
                    }`}
                    onClick={() => handleScoreChange('posture', score)}
                  >
                    {score}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Whip Control */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <label className="font-medium">Geiselführung</label>
                <span className="text-sm text-muted-foreground">Note: {scores.whipControl || '-'}/10</span>
              </div>
              <div className="grid grid-cols-10 gap-2">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
                  <button
                    key={`whipControl-${score}`}
                    className={`h-12 rounded-md border-2 flex items-center justify-center transition-all ${
                      scores.whipControl === score
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-input hover:border-primary'
                    }`}
                    onClick={() => handleScoreChange('whipControl', score)}
                  >
                    {score}
                  </button>
                ))}
              </div>
            </div>
            
            <Separator />
            
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-medium">Gesamtpunkte</h3>
                <p className="text-sm text-muted-foreground">Summe aller Kategorien</p>
              </div>
              <div className="text-4xl font-bold">
                {Object.values(scores).reduce((sum, score) => sum + score, 0)}
              </div>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between">
          <div>
            <Button variant="outline" onClick={() => navigate('/judging')}>
              Abbrechen
            </Button>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleSave}
              disabled={!isFormValid()}
              className="gap-2"
            >
              <Save className="h-4 w-4" />
              Speichern und weiter
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default IndividualJudging;
