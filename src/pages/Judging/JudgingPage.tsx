
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  User, 
  Users, 
  ArrowRight,
  Move
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { mockParticipants } from '../../data/mockData';
import { getCategoryDisplay } from '../../utils/categoryUtils';
import { Category, Participant } from '../../types';
import { reorderParticipants } from '@/utils/scoreUtils';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/contexts/UserContext';

const JudgingPage = () => {
  const [activeTab, setActiveTab] = useState<string>('individual');
  const [participantsByCategory, setParticipantsByCategory] = useState<Record<string, Participant[]>>(() => {
    const initialParticipants = mockParticipants.reduce(
      (acc, participant) => {
        if (!acc[participant.category]) {
          acc[participant.category] = [];
        }
        acc[participant.category].push(participant);
        return acc;
      },
      {} as Record<string, typeof mockParticipants>
    );
    return initialParticipants;
  });
  const [draggingCategory, setDraggingCategory] = useState<Category | null>(null);
  const [isShowingOrderingTools, setIsShowingOrderingTools] = useState<Record<string, boolean>>({
    kids: false,
    juniors: false,
    active: false
  });
  
  const { toast } = useToast();
  const { isAdmin } = useUser();
  const categories: Category[] = ['kids', 'juniors', 'active'];

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number, category: Category) => {
    e.dataTransfer.setData('application/json', JSON.stringify({ index, category }));
    setDraggingCategory(category);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.classList.add('bg-accent');
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.currentTarget.classList.remove('bg-accent');
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetIndex: number, category: Category) => {
    e.preventDefault();
    e.currentTarget.classList.remove('bg-accent');

    try {
      const data = JSON.parse(e.dataTransfer.getData('application/json'));

      if (data.category !== category) {
        toast({
          title: "Nicht möglich",
          description: "Teilnehmer können nicht zwischen Kategorien verschoben werden.",
          variant: "destructive"
        });
        return;
      }

      if (data.index !== targetIndex) {
        const updatedParticipants = reorderParticipants(
          participantsByCategory[category],
          data.index,
          targetIndex
        );
        
        setParticipantsByCategory(prev => ({
          ...prev,
          [category]: updatedParticipants
        }));

        toast({
          title: "Reihenfolge aktualisiert",
          description: "Die Reihenfolge der Teilnehmer wurde erfolgreich geändert."
        });
      }
    } catch (error) {
      console.error("Error during drag and drop:", error);
    }

    setDraggingCategory(null);
  };

  const toggleOrderingTools = (category: Category) => {
    setIsShowingOrderingTools(prev => ({
      ...prev, 
      [category]: !prev[category]
    }));
  };

  const updateParticipantOrder = (category: Category, participantId: string, newPosition: number) => {
    if (isNaN(newPosition) || newPosition < 1 || newPosition > participantsByCategory[category].length) {
      toast({
        title: "Ungültige Position",
        description: `Position muss zwischen 1 und ${participantsByCategory[category].length} sein.`,
        variant: "destructive"
      });
      return;
    }

    const participants = participantsByCategory[category];
    const oldIndex = participants.findIndex(p => p.id === participantId);
    const newIndex = newPosition - 1; // Convert to zero-based index

    if (oldIndex === newIndex) return;

    const updatedParticipants = reorderParticipants(participants, oldIndex, newIndex);
    
    setParticipantsByCategory(prev => ({
      ...prev,
      [category]: updatedParticipants
    }));

    toast({
      title: "Reihenfolge aktualisiert",
      description: "Die Reihenfolge der Teilnehmer wurde erfolgreich geändert."
    });
  };

  return (
    <div className="animate-fade-in">
      <h1 className="text-3xl font-bold text-swiss-blue mb-6">Bewertung</h1>
      
      <Tabs defaultValue="individual" className="mb-6" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="individual">
            <User className="mr-2 h-4 w-4" />
            Einzelbewertung
          </TabsTrigger>
          <TabsTrigger value="group">
            <Users className="mr-2 h-4 w-4" />
            Gruppenbewertung
          </TabsTrigger>
        </TabsList>
        <TabsContent value="individual" className="mt-4">
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
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {categories.map((category) => {
                  const participants = participantsByCategory[category] || [];
                  return (
                    <Card key={category}>
                      <CardHeader className="pb-2">
                        <CardTitle className="flex justify-between items-center">
                          {getCategoryDisplay(category)}
                          {isAdmin && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => toggleOrderingTools(category)}
                              className="ml-2"
                            >
                              <Move className="h-4 w-4" />
                            </Button>
                          )}
                        </CardTitle>
                        <CardDescription>
                          {participants.length} Teilnehmer
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pb-2 space-y-4">
                        <p className="text-sm text-muted-foreground">
                          {category === 'kids' ? '17 Schläge' : 
                           category === 'juniors' ? '23 Schläge' : '33 Schläge'}
                        </p>

                        {isAdmin && isShowingOrderingTools[category] && (
                          <Collapsible open={true} className="border rounded-md p-2 bg-muted/50">
                            <CollapsibleContent className="space-y-2">
                              <p className="text-sm font-medium">Reihenfolge anpassen</p>
                              
                              <div className="space-y-2">
                                {participants.map((participant, index) => (
                                  <div 
                                    key={participant.id}
                                    draggable
                                    onDragStart={e => handleDragStart(e, index, category)}
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={e => handleDrop(e, index, category)}
                                    className={`flex items-center justify-between p-2 rounded-md border ${draggingCategory === category ? 'cursor-grab' : ''}`}
                                  >
                                    <div className="flex items-center gap-2">
                                      <Move className="h-4 w-4 text-muted-foreground cursor-grab" />
                                      <span>{participant.firstName} {participant.lastName}</span>
                                    </div>
                                    <div className="flex items-center">
                                      <input
                                        type="number"
                                        min={1}
                                        max={participants.length}
                                        defaultValue={index + 1}
                                        className="w-16 h-8 text-center border rounded-md"
                                        onBlur={(e) => {
                                          const val = parseInt(e.target.value);
                                          if (!isNaN(val)) {
                                            updateParticipantOrder(category, participant.id, val);
                                          }
                                        }}
                                        onKeyDown={(e) => {
                                          if (e.key === 'Enter') {
                                            const val = parseInt((e.target as HTMLInputElement).value);
                                            if (!isNaN(val)) {
                                              updateParticipantOrder(category, participant.id, val);
                                            }
                                          }
                                        }}
                                      />
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </CollapsibleContent>
                          </Collapsible>
                        )}
                      </CardContent>
                      <CardFooter>
                        <Button asChild className="w-full">
                          <Link to={`/judging/individual/${category}`}>
                            Bewerten
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Link>
                        </Button>
                      </CardFooter>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="group" className="mt-4">
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
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default JudgingPage;
