
import React, { useState, useEffect } from 'react';
import { User, Users } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Category, Participant } from '../../types';
import { useUser } from '@/contexts/UserContext';
import IndividualJudgingTab from '@/components/Judging/IndividualJudgingTab';
import GroupJudgingTab from '@/components/Judging/GroupJudgingTab';
import ParticipantReorderDialog from '@/components/Judging/ParticipantReorderDialog';
import { useParticipantReordering } from '@/hooks/useParticipantReordering';
import { useQuery } from '@tanstack/react-query';
import { DatabaseService } from '@/services/DatabaseService';
import { Spinner } from '@/components/ui/spinner';

const JudgingPage: React.FC = () => {
  const location = useLocation();
  
  // Initialize defaultTab based on the URL path or retrieved from sessionStorage
  const getInitialTab = (): string => {
    // Check if we're coming back from a group judging page
    if (location.state?.from === 'groupJudging') {
      return 'group';
    }
    
    // Try to get from session storage
    const savedTab = sessionStorage.getItem('judgingActiveTab');
    
    // Default to individual if not coming from group judging
    return savedTab || 'individual';
  };

  const [activeTab, setActiveTab] = useState<string>(getInitialTab);
  const [participantsByCategory, setParticipantsByCategory] = useState<Record<string, Participant[]>>({});
  
  const { isAdmin } = useUser();
  const categories: Category[] = ['kids', 'juniors', 'active'];

  // Fetch participants from the database
  const { 
    data: participants = [], 
    isLoading: isLoadingParticipants,
    error: participantsError
  } = useQuery({
    queryKey: ['participants'],
    queryFn: DatabaseService.getAllParticipants,
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Organize participants by category when data is loaded
  useEffect(() => {
    if (participants.length > 0) {
      const individualParticipants = participants.filter(p => !p.isGroupOnly);
      
      // Group participants by category
      const categorizedParticipants = individualParticipants.reduce(
        (acc, participant) => {
          if (!acc[participant.category]) {
            acc[participant.category] = [];
          }
          // Ensure we're using the correct type by using a type assertion
          acc[participant.category].push(participant as Participant);
          return acc;
        },
        {} as Record<string, Participant[]>
      );
      
      // Sort participants by displayOrder if available
      Object.keys(categorizedParticipants).forEach(category => {
        categorizedParticipants[category].sort((a, b) => {
          // If both have displayOrder, sort by it
          if (a.displayOrder !== undefined && b.displayOrder !== undefined) {
            return a.displayOrder - b.displayOrder;
          }
          // If only one has displayOrder, prioritize it
          if (a.displayOrder !== undefined) return -1;
          if (b.displayOrder !== undefined) return 1;
          // Default to id sort
          return a.id - b.id;
        });
      });
      
      setParticipantsByCategory(categorizedParticipants);
    }
  }, [participants]);

  // Use the custom hook for participant reordering
  const {
    draggingCategory,
    activeReorderCategory,
    handleDragStart,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    updateParticipantOrder,
    openReorderDialog,
    setActiveReorderCategory,
  } = useParticipantReordering(participantsByCategory, setParticipantsByCategory);

  // Save active tab to session storage when it changes
  useEffect(() => {
    sessionStorage.setItem('judgingActiveTab', activeTab);
  }, [activeTab]);

  // Loading state
  if (isLoadingParticipants) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Spinner size="large" />
        <p className="mt-4 text-muted-foreground">Teilnehmer werden geladen...</p>
      </div>
    );
  }

  // Error state
  if (participantsError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <h2 className="text-2xl font-bold mb-4 text-destructive">Fehler beim Laden der Teilnehmer</h2>
        <p className="text-muted-foreground mb-4">Bitte versuchen Sie es später erneut.</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <h1 className="text-3xl font-bold text-swiss-blue mb-6">Bewertung</h1>
      
      <Tabs defaultValue={activeTab} value={activeTab} className="mb-6" onValueChange={setActiveTab}>
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
          <IndividualJudgingTab 
            categories={categories}
            participantsByCategory={participantsByCategory}
            isAdmin={isAdmin}
            openReorderDialog={openReorderDialog}
          />
        </TabsContent>
        
        <TabsContent value="group" className="mt-4">
          <GroupJudgingTab />
        </TabsContent>
      </Tabs>

      <ParticipantReorderDialog
        activeReorderCategory={activeReorderCategory}
        setActiveReorderCategory={setActiveReorderCategory}
        participantsByCategory={participantsByCategory}
        updateParticipantOrder={updateParticipantOrder}
        handleDragStart={handleDragStart}
        handleDragOver={handleDragOver}
        handleDragLeave={handleDragLeave}
        handleDrop={handleDrop}
        draggingCategory={draggingCategory}
      />
    </div>
  );
};

export default JudgingPage;
