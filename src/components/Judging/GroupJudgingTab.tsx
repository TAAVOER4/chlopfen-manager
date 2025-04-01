
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { User, ArrowRight } from 'lucide-react';
import { Category, GroupSize } from '../../types';
import { useUser } from '@/contexts/UserContext';
import { getCategoryDisplay } from '@/utils/categoryUtils';

const GroupJudgingTab = () => {
  const { isAdmin } = useUser();
  const categories: Category[] = ['kids', 'juniors', 'active'];
  const groupSizes: GroupSize[] = ['three', 'four'];
  
  // Helper function to get display text for group size
  const getGroupSizeDisplay = (size: GroupSize): string => {
    return size === 'three' ? 'Dreiergruppen' : 'Vierergruppen';
  };

  // Helper function to get required info based on category
  const getCategoryInfo = (category: Category) => {
    switch (category) {
      case 'kids':
        return { strikes: '17 Schläge' };
      case 'juniors':
        return { strikes: '23 Schläge' };
      case 'active':
        return { strikes: '33 Schläge' };
    }
  };

  return (
    <Card>
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
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((category) => (
            <>
              {groupSizes.map((size) => (
                <Card key={`${category}-${size}`} className="flex flex-col h-full">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex justify-between items-center text-base">
                      <div className="flex items-center">
                        <User className="mr-2 h-5 w-5" />
                        {getCategoryDisplay(category)} - {getGroupSizeDisplay(size)}
                      </div>
                    </CardTitle>
                    <CardDescription>
                      {getCategoryInfo(category).strikes}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0 mt-auto">
                    <Button 
                      asChild 
                      className="w-full mt-2"
                    >
                      <Link to={`/judging/group/${size}?category=${category}`}>
                        Bewerten
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default GroupJudgingTab;
