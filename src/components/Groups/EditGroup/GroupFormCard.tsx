
import React from 'react';
import { 
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui';
import { Form } from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";
import { Participant } from '@/types';
import GroupInfoForm, { GroupFormValues } from '@/components/Groups/GroupInfoForm';

interface GroupFormCardProps {
  form: UseFormReturn<GroupFormValues>;
  isSubmitting: boolean;
  selectedParticipants: Participant[];
  handleNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleRegenerateName: () => void;
  removeParticipant: (participant: Participant) => void;
  onSubmit: (data: GroupFormValues) => void;
  onCancel: () => void;
}

const GroupFormCard: React.FC<GroupFormCardProps> = ({
  form,
  isSubmitting,
  selectedParticipants,
  handleNameChange,
  handleRegenerateName,
  removeParticipant,
  onSubmit,
  onCancel
}) => {
  return (
    <Card>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardHeader>
            <CardTitle>Gruppeninformationen</CardTitle>
            <CardDescription>
              Bearbeiten Sie die Informationen der Gruppe
            </CardDescription>
          </CardHeader>
          <CardContent>
            <GroupInfoForm 
              form={form}
              selectedParticipants={selectedParticipants}
              handleNameChange={handleNameChange}
              handleRegenerateName={handleRegenerateName}
              removeParticipant={removeParticipant}
            />
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" type="button" onClick={onCancel}>
              Abbrechen
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Speichern..." : "Gruppe speichern"}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
};

export default GroupFormCard;
