
import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useUser } from '@/contexts/UserContext';
import LoginForm from '@/components/Auth/LoginForm';
import { SupabaseService } from '@/services/SupabaseService';
import { useToast } from '@/hooks/use-toast';

const LoginPage: React.FC = () => {
  const { currentUser } = useUser();
  const { toast } = useToast();

  useEffect(() => {
    // Initialize users in the database if needed
    const initializeDatabase = async () => {
      try {
        console.log('Initializing database...');
        await SupabaseService.initializeUsers();
        console.log('Database initialization completed');
        
        // Informiere den Benutzer über Testlogins
        toast({
          title: "Hinweis für Testlogin",
          description: "Sie können sich mit den Benutzern 'hans.mueller' oder 'erwin.vogel' und dem Passwort 'password' anmelden.",
          duration: 10000,
        });
      } catch (error) {
        console.error('Error initializing users:', error);
      }
    };

    initializeDatabase();
  }, [toast]);

  // Redirect to home if already logged in
  if (currentUser) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 -mt-16">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-center text-swiss-blue mb-2">Wettchlöpfen Manager</h1>
          <p className="text-center text-gray-600 mb-8">Melden Sie sich an, um das System zu verwalten</p>
        </div>
        <LoginForm />
        <div className="mt-4 text-center text-sm text-gray-500">
          <p>Standardbenutzer für Tests:</p>
          <p className="font-mono mt-1">Benutzername: hans.mueller</p>
          <p className="font-mono">Passwort: password</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
