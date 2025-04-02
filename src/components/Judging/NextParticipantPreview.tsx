
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Participant, Group } from '@/types';
import { ChevronRight } from 'lucide-react';

interface NextParticipantPreviewProps {
  nextParticipant?: Participant;
  nextGroup?: Group;
  label: string;
}

const NextParticipantPreview: React.FC<NextParticipantPreviewProps> = ({
  nextParticipant,
  nextGroup,
  label
}) => {
  if (!nextParticipant && !nextGroup) {
    return (
      <Card className="h-full border border-dashed border-gray-300">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-muted-foreground flex items-center">
            <ChevronRight className="h-4 w-4 mr-1" />
            {label}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-32 text-center">
          <p className="text-muted-foreground">Keine weiteren Teilnehmer</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full border-2 border-primary/20 bg-primary/5">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm text-primary flex items-center">
          <ChevronRight className="h-4 w-4 mr-1" />
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {nextParticipant && (
          <div className="space-y-2">
            <h3 className="font-semibold text-lg">{nextParticipant.firstName} {nextParticipant.lastName}</h3>
            <p className="text-sm text-muted-foreground">{nextParticipant.location}</p>
            <p className="text-sm text-muted-foreground">Jahrgang {nextParticipant.birthYear}</p>
          </div>
        )}
        
        {nextGroup && (
          <div className="space-y-2">
            <h3 className="font-semibold text-lg">{nextGroup.name}</h3>
            <p className="text-sm text-muted-foreground">
              {nextGroup.size === 'three' ? '3er-Gruppe' : '4er-Gruppe'}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default NextParticipantPreview;
