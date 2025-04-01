
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Save, 
  UserCheck, 
  Award, 
  Clock, 
  ClipboardCheck,
  Lock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { mockParticipants, mockIndividualScores } from '@/data/mockData';
import { Participant, IndividualScore, Judge, Category, CriterionKey } from '@/types';
import { getCategoryRequiredStrikes, getCategoryDisplay } from '@/utils/categoryUtils';
import { Separator } from '@/components/ui/separator';
import { useUser } from '@/contexts/UserContext';

const IndividualJudging = () => {
  const { category = '' } = useParams<{ category: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentUser, isAdmin } = useUser();

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

  const assignedCriterion = currentUser?.assignedCriterion || 'rhythm';

  const currentParticipant = categoryParticipants[currentIndex];
  const requiredStrikes = getCategoryRequiredStrikes(category as Category);

  const handleScoreInput = (field: string, value: string) => {
    let numValue = parseFloat(value);
    
    if (isNaN(numValue)) {
      numValue = 0;
    } else {
      numValue = Math.max(1, Math.min(10, Math.round(numValue * 10) / 10));
    }
    
    setScores({ ...scores, [field]: numValue });
  };

  const handleSave = () => {
    if (!currentUser) {
      toast({
        title: "Fehler",
        description: "Bitte melden Sie sich an, um bewerten zu können.",
        variant: "destructive"
      });
      return;
    }

    // Create a new score record
    const newScore: IndividualScore = {
      participantId: currentParticipant.id,
      judgeId: currentUser.id,
      round: round,
      whipStrikes: scores.whipStrikes,
      rhythm: scores.rhythm,
      stance: scores.stance,
      posture: scores.posture,
      whipControl: scores.whipControl,
    };

    // Add the new score to the mockIndividualScores array
    // In a real application, this would be a backend API call
    mockIndividualScores.push(newScore);
    
    // Log to verify storage (for debugging)
    console.log("Saved score:", newScore);
    console.log("Updated scores data:", mockIndividualScores);

    toast({
      title: "Bewertung gespeichert",
      description: `Bewertung für ${currentParticipant.firstName} ${currentParticipant.lastName} gespeichert.`
    });

    const resetScores = {
      whipStrikes: 0,
      rhythm: 0,
      stance: 0,
      posture: 0,
      whipControl: 0,
    };
    setScores(resetScores);

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
      toast({
        title: "Bewertung abgeschlossen",
        description: "Alle Teilnehmer wurden bewertet."
      });
      navigate('/judging');
    }
  };

  const isFormValid = () => {
    if (isAdmin) {
      return scores.whipStrikes > 0 && 
             scores.rhythm > 0 && 
             scores.stance > 0 && 
             scores.posture > 0 && 
             scores.whipControl > 0;
    }
    
    return scores[assignedCriterion] > 0;
  };

  // Check if the current participant already has scores for this round and judge
  useEffect(() => {
    if (currentParticipant && currentUser) {
      const existingScore = mockIndividualScores.find(
        score => 
          score.participantId === currentParticipant.id && 
          score.judgeId === currentUser.id &&
          score.round === round
      );

      if (existingScore) {
        // If there's an existing score, load it into the form
        setScores({
          whipStrikes: existingScore.whipStrikes,
          rhythm: existingScore.rhythm,
          stance: existingScore.stance,
          posture: existingScore.posture,
          whipControl: existingScore.whipControl,
        });
      } else {
        // Reset scores when moving to a new participant
        setScores({
          whipStrikes: 0,
          rhythm: 0,
          stance: 0,
          posture: 0,
          whipControl: 0,
        });
      }
    }
  }, [currentParticipant, currentUser, round]);

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

  const getCriterionDisplayName = (key: CriterionKey): string => {
    switch (key) {
      case 'whipStrikes':
        return `Schläge (${requiredStrikes})`;
      case 'rhythm':
        return 'Rhythmus';
      case 'stance':
        return 'Stand';
      case 'posture':
        return 'Körperhaltung';
      case 'whipControl':
        return 'Geiselführung';
      default:
        return key;
    }
  };

  const renderScoreInput = (field: CriterionKey, label: string) => {
    return (
      <div className="space-y-2">
        <div className="flex justify-between">
          <label className="font-medium">{label}</label>
          <span className="text-sm text-muted-foreground">Note: {scores[field] || '-'}/10</span>
        </div>
        
        <div className="flex items-center">
          <Input
            type="number"
            min="1"
            max="10"
            step="0.1"
            value={scores[field] || ''}
            onChange={(e) => handleScoreInput(field, e.target.value)}
            className="w-full"
            placeholder="1.0 - 10.0"
          />
        </div>
      </div>
    );
  };

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
            {isAdmin ? (
              <>
                {renderScoreInput('whipStrikes', `Schläge (${requiredStrikes})`)}
                {renderScoreInput('rhythm', 'Rhythmus')}
                {renderScoreInput('stance', 'Stand')}
                {renderScoreInput('posture', 'Körperhaltung')}
                {renderScoreInput('whipControl', 'Geiselführung')}
              </>
            ) : (
              <div className="space-y-2">
                {renderScoreInput(
                  assignedCriterion, 
                  getCriterionDisplayName(assignedCriterion)
                )}
                <p className="text-sm text-muted-foreground mt-4">
                  Sie sind berechtigt, nur {getCriterionDisplayName(assignedCriterion)} zu bewerten.
                </p>
              </div>
            )}
            
            {isAdmin && <Separator />}
            
            {isAdmin && (
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium">Gesamtpunkte</h3>
                  <p className="text-sm text-muted-foreground">Summe aller Kategorien</p>
                </div>
                <div className="text-4xl font-bold">
                  {Object.values(scores).reduce((sum, score) => sum + score, 0).toFixed(1)}
                </div>
              </div>
            )}

            {!isAdmin && (
              <div className="flex items-center mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <Lock className="h-4 w-4 text-blue-600 mr-2" />
                <p className="text-sm text-blue-800">
                  Die Gesamtübersicht ist nur für Administratoren verfügbar.
                </p>
              </div>
            )}
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
