
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { User, CriterionKey, GroupCriterionKey, UserRole, Tournament } from '@/types';
import { ScrollArea } from '@/components/ui/scroll-area';

interface UserFormProps {
  user: User;
  onUserChange: (updatedUser: User) => void;
  individualCriteria: { value: CriterionKey; label: string }[];
  groupCriteria: { value: GroupCriterionKey; label: string }[];
  tournaments: Tournament[];
}

const UserForm: React.FC<UserFormProps> = ({
  user,
  onUserChange,
  individualCriteria,
  groupCriteria,
  tournaments
}) => {
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUserChange({...user, name: e.target.value});
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUserChange({...user, username: e.target.value});
  };

  const handleRoleChange = (value: string) => {
    onUserChange({
      ...user, 
      role: value as UserRole
    });
  };

  const handleIndividualCriterionChange = (value: string) => {
    const updatedCriteria = {
      ...(user.assignedCriteria || {}),
      individual: value as CriterionKey
    };
    onUserChange({...user, assignedCriteria: updatedCriteria});
  };

  const handleGroupCriterionChange = (value: string) => {
    const updatedCriteria = {
      ...(user.assignedCriteria || {}),
      group: value as GroupCriterionKey
    };
    onUserChange({...user, assignedCriteria: updatedCriteria});
  };

  const handleTournamentToggle = (tournamentId: number) => {
    const updatedTournamentIds = user.tournamentIds?.includes(tournamentId)
      ? user.tournamentIds.filter(id => id !== tournamentId)
      : [...(user.tournamentIds || []), tournamentId];
    
    onUserChange({...user, tournamentIds: updatedTournamentIds});
  };

  // Admin and Judge roles can see all tournaments by default
  const canSeeAllTournaments = user.role === 'admin' || user.role === 'judge';

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="name">Name</Label>
        <Input 
          id="name"
          value={user.name}
          onChange={handleNameChange}
        />
      </div>
      
      <div>
        <Label htmlFor="username">Benutzername</Label>
        <Input 
          id="username"
          value={user.username}
          onChange={handleUsernameChange}
        />
      </div>
      
      <div>
        <Label htmlFor="role">Rolle</Label>
        <Select 
          value={user.role}
          onValueChange={handleRoleChange}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Rolle auswählen" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="admin">Administrator</SelectItem>
            <SelectItem value="judge">Richter</SelectItem>
            <SelectItem value="reader">Nur Lesen</SelectItem>
            <SelectItem value="editor">Bearbeiter</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {user.role === 'judge' && (
        <div className="space-y-2">
          <div>
            <Label htmlFor="individual-criterion">Einzelwertung</Label>
            <Select 
              value={user.assignedCriteria?.individual || ''}
              onValueChange={handleIndividualCriterionChange}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Kriterium auswählen" />
              </SelectTrigger>
              <SelectContent>
                {individualCriteria.map((criterion) => (
                  <SelectItem key={criterion.value} value={criterion.value}>
                    {criterion.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="group-criterion">Gruppenwertung</Label>
            <Select 
              value={user.assignedCriteria?.group || ''}
              onValueChange={handleGroupCriterionChange}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Kriterium auswählen" />
              </SelectTrigger>
              <SelectContent>
                {groupCriteria.map((criterion) => (
                  <SelectItem key={criterion.value} value={criterion.value}>
                    {criterion.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {(user.role === 'reader' || user.role === 'editor') && (
        <div className="space-y-2">
          <Label>Zugewiesene Turniere</Label>
          <p className="text-sm text-muted-foreground">
            Wählen Sie aus, auf welche Turniere dieser Benutzer Zugriff hat
          </p>
          <ScrollArea className="h-[200px] border rounded-md p-4">
            <div className="space-y-2">
              {tournaments.map(tournament => (
                <div key={tournament.id} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`tournament-${tournament.id}`}
                    checked={user.tournamentIds?.includes(tournament.id) ?? false}
                    onCheckedChange={() => handleTournamentToggle(tournament.id)}
                  />
                  <label
                    htmlFor={`tournament-${tournament.id}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {tournament.name} ({tournament.year})
                  </label>
                </div>
              ))}
            </div>
          </ScrollArea>
          {!user.tournamentIds?.length && (
            <p className="text-sm text-yellow-600">
              Achtung: Benutzer hat keinen Zugriff auf Turniere
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default UserForm;
