
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import PasswordInput from './PasswordInput';
import TournamentSelect from './TournamentSelect';
import { Tournament } from '@/types';
import { FieldErrors, UseFormRegister } from 'react-hook-form';

interface FormValues {
  username: string;
  password: string;
}

interface LoginFormFieldsProps {
  register: UseFormRegister<FormValues>;
  errors: FieldErrors<FormValues>;
  username?: string;
  setUsername?: (username: string) => void;
  password?: string;
  setPassword?: (password: string) => void;
  error?: string;
  selectedTournamentId?: string;
  setSelectedTournamentId?: (id: string) => void;
  tournaments?: Tournament[];
}

const LoginFormFields: React.FC<LoginFormFieldsProps> = ({
  register,
  errors,
  username,
  setUsername,
  password,
  setPassword,
  error,
  selectedTournamentId,
  setSelectedTournamentId,
  tournaments
}) => {
  // Using either React Hook Form or controlled inputs based on what's provided
  const isUsingHookForm = !!register;
  const isUsingControlledInputs = !!setUsername && !!setPassword;

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
        {isUsingHookForm ? (
          <Input
            id="username"
            type="text"
            {...register('username')}
            required
            placeholder="Enter username"
          />
        ) : (
          <Input
            id="username"
            type="text"
            value={username || ''}
            onChange={(e) => setUsername && setUsername(e.target.value)}
            required
            placeholder="Enter username"
          />
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        {isUsingHookForm ? (
          <PasswordInput 
            {...register('password')}
            required
          />
        ) : (
          <PasswordInput 
            value={password || ''}
            onChange={(e) => setPassword && setPassword(e.target.value)}
            required
          />
        )}
      </div>
      {tournaments && tournaments.length > 0 && selectedTournamentId !== undefined && setSelectedTournamentId && (
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
