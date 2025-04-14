
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Category, Participant } from '../../types';
import { useUser } from '@/contexts/UserContext';
import ParticipantReorderDialog from '@/components/Judging/ParticipantReorderDialog';
import { useParticipantReordering } from '@/hooks/useParticipantReordering';
import { useQuery } from '@tanstack/react-query';
import { DatabaseService } from '@/services/DatabaseService';
import LoadingState from '@/components/Judging/LoadingState';
import ErrorState from '@/components/Judging/ErrorState';
import JudgingTabs from '@/components/Judging/JudgingTabs';

const JudgingPage: React.FC = () => {
  const location = useLocation();
  
  const getInitialTab = (): string => {
    if (location.state?.from === 'groupJudging') {
      return 'group';
    }
    const savedTab = sessionStorage.getItem('judgingActiveTab');
    return savedTab || 'individual';
  };

  const [activeTab, setActiveTab] = useState<string>(getInitialTab);
  const [participantsByCategory, setParticipantsByCategory] = useState<Record<string, Participant[]>>({});
  
  const { isAdmin } = useUser();
  const categories: Category[] = ['kids', 'juniors', 'active'];

  const { 
    data: participants = [], 
    isLoading: isLoadingParticipants,
    error: participantsError
  } = useQuery({
    queryKey: ['participants'],
    queryFn: DatabaseService.getAllParticipants,
    retry: 1,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (participants.length > 0) {
      const individualParticipants = participants.filter(p => !p.isGroupOnly);
      const categorizedParticipants = individualParticipants.reduce(
        (acc, participant) => {
          if (!acc[participant.category]) {
            acc[participant.category] = [];
          }
          acc[participant.category].push(participant as Participant);
          return acc;
        },
        {} as Record<string, Participant[]>
      );
      
      Object.keys(categorizedParticipants).forEach(category => {
        categorizedParticipants[category].sort((a, b) => {
          if (a.displayOrder !== undefined && b.displayOrder !== undefined) {
            return a.displayOrder - b.displayOrder;
          }
          if (a.displayOrder !== undefined) return -1;
          if (b.displayOrder !== undefined) return 1;
          return a.id - b.id;
        });
      });
      
      setParticipantsByCategory(categorizedParticipants);
    }
  }, [participants]);

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

  useEffect(() => {
    sessionStorage.setItem('judgingActiveTab', activeTab);
  }, [activeTab]);

  if (isLoadingParticipants) {
    return <LoadingState />;
  }

  if (participantsError) {
    return <ErrorState />;
  }

  return (
    <div className="animate-fade-in">
      <h1 className="text-3xl font-bold text-swiss-blue mb-6">Bewertung</h1>
      
      <JudgingTabs 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        categories={categories}
        participantsByCategory={participantsByCategory}
        isAdmin={isAdmin}
        openReorderDialog={openReorderDialog}
      />

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
