
import React, { useState, useEffect } from 'react';
import { useUser } from '@/contexts/UserContext';
import { useTournament } from '@/contexts/TournamentContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { SupabaseService } from '@/services/SupabaseService';
import { Alert, AlertDescription } from '@/components/ui/alert';

const LoginForm: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedTournamentId, setSelectedTournamentId] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);
  
  const { login } = useUser();
  const { tournaments, setActiveTournament } = useTournament();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Load tournaments at component mount
  useEffect(() => {
    const loadTournaments = async () => {
      try {
        const tournamentData = await SupabaseService.getAllTournaments();
        if (tournamentData && tournamentData.length > 0) {
          // Set default tournament if available
          const activeTournament = tournamentData.find(t => t.isActive);
          setSelectedTournamentId(activeTournament?.id.toString() || tournamentData[0].id.toString());
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
    if (storedTournamentId) {
      setSelectedTournamentId(storedTournamentId);
    } else if (tournaments && tournaments.length > 0) {
      const activeTournament = tournaments.find(t => t.isActive);
      setSelectedTournamentId(activeTournament?.id.toString() || tournaments[0].id.toString());
    }
  }, [tournaments]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      console.log('Attempting login with:', username);
      
      // First initialize users to ensure we have test users available
      await SupabaseService.initializeUsers();
      
      // Use specific test credentials for testing if needed
      const actualUsername = username;
      const actualPassword = password;
      
      console.log('Login credentials:', { username: actualUsername, password: actualPassword });
      
      const success = await login(actualUsername, actualPassword);
      
      if (success) {
        // Set active tournament if one is selected and tournaments are available
        if (selectedTournamentId && tournaments.length > 0) {
          const tournament = tournaments.find(t => t.id.toString() === selectedTournamentId);
          if (tournament) {
            // Set in context and also update in database
            setActiveTournament(tournament);
            try {
              await SupabaseService.setActiveTournament(tournament.id);
            } catch (updateError) {
              console.error('Error updating active tournament:', updateError);
            }
          }
        }
        
        toast({
          title: "Login successful",
          description: selectedTournamentId && tournaments.length > 0
            ? `You are now working with tournament: ${tournaments.find(t => t.id.toString() === selectedTournamentId)?.name}`
            : "Please select a tournament in the tournament management.",
        });
        
        navigate('/');
      } else {
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

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Login</CardTitle>
        <CardDescription>Log in to continue</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
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
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter password"
                className="pr-10"
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>
          {tournaments && tournaments.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="tournament">Active Tournament</Label>
              <Select 
                value={selectedTournamentId} 
                onValueChange={setSelectedTournamentId}
              >
                <SelectTrigger id="tournament">
                  <SelectValue placeholder="Select tournament" />
                </SelectTrigger>
                <SelectContent>
                  {tournaments.map((tournament) => (
                    <SelectItem 
                      key={tournament.id} 
                      value={tournament.id.toString()}
                    >
                      {tournament.name} ({tournament.year})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
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
