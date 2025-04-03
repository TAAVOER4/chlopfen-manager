
import React, { useState, useEffect } from 'react';
import { useUser } from '@/contexts/UserContext';
import { useTournament } from '@/contexts/TournamentContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { SupabaseService } from '@/services/SupabaseService';
import LoginFormFields from './LoginFormFields';

const LoginForm: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedTournamentId, setSelectedTournamentId] = useState<string>('');
  
  const { login } = useUser();
  const { tournaments, setActiveTournament } = useTournament();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Load tournaments at component mount
  useEffect(() => {
    const loadTournaments = async () => {
      try {
        console.log('Loading tournaments...');
        const tournamentData = await SupabaseService.getAllTournaments();
        console.log('Loaded tournaments:', tournamentData);
        if (tournamentData && tournamentData.length > 0) {
          // Set default tournament if available
          const activeTournament = tournamentData.find(t => t.isActive);
          const selectedId = activeTournament?.id.toString() || tournamentData[0].id.toString();
          console.log('Setting default tournament ID:', selectedId);
          setSelectedTournamentId(selectedId);
        }
      } catch (error) {
        console.error('Error loading tournaments:', error);
      }
    };
    
    loadTournaments();
  }, []);

  // Select active tournament from session storage if available
  useEffect(() => {
    const storedTournamentId = sessionStorage.getItem('activeTournamentId');
    console.log('Tournament ID from session storage:', storedTournamentId);
    if (storedTournamentId) {
      setSelectedTournamentId(storedTournamentId);
    } else if (tournaments && tournaments.length > 0) {
      const activeTournament = tournaments.find(t => t.isActive);
      const selectedId = activeTournament?.id.toString() || tournaments[0].id.toString();
      console.log('Setting tournament ID from context:', selectedId);
      setSelectedTournamentId(selectedId);
    }
  }, [tournaments]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Login form submitted with username:', username);
    setError('');
    setIsLoading(true);
    
    try {
      // First initialize users to ensure we have data in the database
      console.log('Initializing users...');
      await SupabaseService.initializeUsers();
      
      console.log('Starting login process with username:', username);
      const success = await login(username, password);
      console.log('Login process completed, success:', success);
      
      if (success) {
        // Set active tournament if one is selected and tournaments are available
        if (selectedTournamentId && tournaments.length > 0) {
          console.log('Setting active tournament with ID:', selectedTournamentId);
          const tournament = tournaments.find(t => t.id.toString() === selectedTournamentId);
          if (tournament) {
            // Set in context and also update in database
            setActiveTournament(tournament);
            try {
              console.log('Updating active tournament in database:', tournament.id);
              await SupabaseService.setActiveTournament(tournament.id);
            } catch (updateError) {
              console.error('Error updating active tournament:', updateError);
            }
          }
        }
        
        const tournamentName = tournaments.find(t => t.id.toString() === selectedTournamentId)?.name || '';
        console.log('Selected tournament name:', tournamentName);
        
        toast({
          title: "Login successful",
          description: selectedTournamentId && tournaments.length > 0
            ? `You are now working with tournament: ${tournamentName}`
            : "Please select a tournament in the tournament management.",
        });
        
        console.log('Navigating to home page');
        navigate('/');
      } else {
        console.log('Login failed');
        setError('Incorrect username or password. Please try again.');
        toast({
          title: "Login failed",
          description: "Incorrect username or password.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('An error occurred. Please try again later.');
      toast({
        title: "Login failed",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Login</CardTitle>
        <CardDescription>Log in to continue</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent>
          <LoginFormFields 
            username={username}
            setUsername={setUsername}
            password={password}
            setPassword={setPassword}
            error={error}
            selectedTournamentId={selectedTournamentId}
            setSelectedTournamentId={setSelectedTournamentId}
            tournaments={tournaments}
          />
        </CardContent>
        <CardFooter className="flex-col space-y-2">
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Logging in...' : 'Login'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default LoginForm;
