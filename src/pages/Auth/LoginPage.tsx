
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUser } from '@/contexts/UserContext';
import LoginForm from '@/components/Auth/LoginForm';

const LoginPage: React.FC = () => {
  const { currentUser } = useUser();

  // Redirect to home if already logged in
  if (currentUser) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold text-center text-swiss-blue mb-6">Wettchlöpfen Manager</h1>
        <LoginForm />
      </div>
    </div>
  );
};

export default LoginPage;
