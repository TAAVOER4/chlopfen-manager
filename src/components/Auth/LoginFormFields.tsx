
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import PasswordInput from './PasswordInput';
import TournamentSelect from './TournamentSelect';
import { Tournament } from '@/types';

interface LoginFormFieldsProps {
  username: string;
  setUsername: (username: string) => void;
  password: string;
  setPassword: (password: string) => void;
  error: string;
  selectedTournamentId: string;
  setSelectedTournamentId: (id: string) => void;
  tournaments: Tournament[];
}

const LoginFormFields: React.FC<LoginFormFieldsProps> = ({
  username,
  setUsername,
  password,
  setPassword,
  error,
  selectedTournamentId,
  setSelectedTournamentId,
  tournaments
}) => {
  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
      )}
      <div className="space-y-2">
        <Label htmlFor="username">Username</Label>
        <Input
          id="username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          placeholder="Enter username"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <PasswordInput 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      {tournaments && tournaments.length > 0 && (
        <TournamentSelect 
          tournaments={tournaments}
          selectedTournamentId={selectedTournamentId}
          onSelect={setSelectedTournamentId}
        />
      )}
    </div>
  );
};

export default LoginFormFields;
