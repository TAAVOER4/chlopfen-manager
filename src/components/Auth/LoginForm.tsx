
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

  // Select active tournament from session storage if available
  useEffect(() => {
    const storedTournamentId = sessionStorage.getItem('activeTournamentId');
    if (storedTournamentId) {
      setSelectedTournamentId(storedTournamentId);
    } else if (tournaments.length > 0) {
      const activeTournament = tournaments.find(t => t.isActive);
      setSelectedTournamentId(activeTournament?.id.toString() || tournaments[0].id.toString());
    }
  }, [tournaments]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    // Attempt login
    const success = login(username, password);
    
    if (success) {
      // Set active tournament if one is selected
      if (selectedTournamentId) {
        const tournament = tournaments.find(t => t.id.toString() === selectedTournamentId);
        if (tournament) {
          setActiveTournament(tournament);
        }
      }
      
      toast({
        title: "Anmeldung erfolgreich",
        description: selectedTournamentId 
          ? `Sie arbeiten jetzt mit dem Turnier: ${tournaments.find(t => t.id.toString() === selectedTournamentId)?.name}`
          : "Bitte wählen Sie ein Turnier in der Turnierverwaltung aus.",
      });
      
      navigate('/'); // Redirect to home page
    } else {
      setError('Falscher Benutzername oder Passwort. Für Testbenutzer ist das Standardpasswort "password".');
      toast({
        title: "Anmeldung fehlgeschlagen",
        description: "Bitte überprüfen Sie Ihre Anmeldedaten.",
        variant: "destructive",
      });
    }
    
    setIsLoading(false);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Anmelden</CardTitle>
        <CardDescription>Melden Sie sich an, um fortzufahren</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="username">Benutzername</Label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              placeholder="Benutzername eingeben"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Passwort</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Passwort eingeben"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tournament">Aktives Turnier</Label>
            <Select 
              value={selectedTournamentId} 
              onValueChange={setSelectedTournamentId}
            >
              <SelectTrigger id="tournament">
                <SelectValue placeholder="Turnier auswählen" />
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
        </CardContent>
        <CardFooter className="flex-col space-y-2">
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Wird angemeldet...' : 'Anmelden'}
          </Button>
          <p className="text-xs text-center text-gray-500">
            Hinweis: Für alle Testbenutzer ist das Passwort "password"
          </p>
        </CardFooter>
      </form>
    </Card>
  );
};

export default LoginForm;
