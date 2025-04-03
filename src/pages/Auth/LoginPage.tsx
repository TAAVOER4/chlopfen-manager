
import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useUser } from '@/contexts/UserContext';
import LoginForm from '@/components/Auth/LoginForm';
import { SupabaseService } from '@/services/SupabaseService';

const LoginPage: React.FC = () => {
  const { currentUser } = useUser();

  useEffect(() => {
    // Initialize users in the database if needed
    const initializeDatabase = async () => {
      try {
        console.log('Initializing database...');
        await SupabaseService.initializeUsers();
        console.log('Database initialization completed');
      } catch (error) {
        console.error('Error initializing users:', error);
      }
    };

    initializeDatabase();
  }, []);

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
      </div>
    </div>
  );
};

export default LoginPage;
