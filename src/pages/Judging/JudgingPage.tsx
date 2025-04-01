
import React, { useState, useEffect } from 'react';
import { User, Users } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { mockParticipants, mockGroups } from '../../data/mockData';
import { Category, Participant } from '../../types';
import { useUser } from '@/contexts/UserContext';
import IndividualJudgingTab from '@/components/Judging/IndividualJudgingTab';
import GroupJudgingTab from '@/components/Judging/GroupJudgingTab';
import ParticipantReorderDialog from '@/components/Judging/ParticipantReorderDialog';
import { useParticipantReordering } from '@/hooks/useParticipantReordering';

const JudgingPage: React.FC = () => {
  const location = useLocation();
  // Initialize defaultTab based on the URL path or retrieved from sessionStorage
  const getInitialTab = (): string => {
    // Check if we're coming back from a group judging page
    if (location.pathname.includes('/judging') && location.state?.from === 'groupJudging') {
      return 'group';
    }
    
    // Try to get from session storage
    const savedTab = sessionStorage.getItem('judgingActiveTab');
    return savedTab || 'individual';
  };

  const [activeTab, setActiveTab] = useState<string>(getInitialTab);
  const [participantsByCategory, setParticipantsByCategory] = useState<Record<string, Participant[]>>(() => {
    const individualParticipants = mockParticipants.filter(p => !p.isGroupOnly);
    
    const initialParticipants = individualParticipants.reduce(
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
  
  const { isAdmin } = useUser();
  const categories: Category[] = ['kids', 'juniors', 'active'];

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

  // Effect to update the global mockParticipants array when participantsByCategory changes
  useEffect(() => {
    if (Object.keys(participantsByCategory).length > 0) {
      const groupOnlyParticipants = mockParticipants.filter(p => p.isGroupOnly);
      
      mockParticipants.splice(0, mockParticipants.length);
      
      Object.values(participantsByCategory).forEach(categoryParticipants => {
        categoryParticipants.forEach(participant => {
          mockParticipants.push(participant);
        });
      });
      
      groupOnlyParticipants.forEach(participant => {
        mockParticipants.push(participant);
      });
    }
  }, [participantsByCategory]);

  // Save active tab to session storage when it changes
  useEffect(() => {
    sessionStorage.setItem('judgingActiveTab', activeTab);
  }, [activeTab]);

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
