
import React from 'react';
import { User, Users } from 'lucide-react';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import IndividualJudgingTab from './IndividualJudgingTab';
import GroupJudgingTab from './GroupJudgingTab';
import { Category } from '@/types';

interface JudgingTabsProps {
  activeTab: string;
  setActiveTab: (value: string) => void;
  categories: Category[];
  participantsByCategory: Record<string, any>;
  isAdmin: boolean;
  openReorderDialog: (category: any) => void;
}

const JudgingTabs: React.FC<JudgingTabsProps> = ({
  activeTab,
  setActiveTab,
  categories,
  participantsByCategory,
  isAdmin,
  openReorderDialog
}) => {
  return (
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
  );
};

export default JudgingTabs;
