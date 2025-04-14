
import React, { useEffect, useState } from 'react';
import { checkSupabaseConnection } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';

const SupabaseConnectionTest: React.FC = () => {
  const [connectionStatus, setConnectionStatus] = useState<string>('Checking connection...');

  useEffect(() => {
    const testConnection = async () => {
      try {
        console.log('Testing Supabase connection...');
        const isConnected = await checkSupabaseConnection();
        if (isConnected) {
          console.log('Supabase connection successful');
          setConnectionStatus('Connected');
        } else {
          console.error('Supabase connection failed');
          setConnectionStatus('Connection failed');
          toast({
            title: 'Database Connection',
            description: 'Failed to connect to database. Please check your configuration.',
            variant: 'destructive'
          });
        }
      } catch (error) {
        console.error('Error checking Supabase connection:', error);
        setConnectionStatus('Error checking connection');
        toast({
          title: 'Database Connection',
          description: 'Error checking database connection.',
          variant: 'destructive'
        });
      }
    };

    testConnection();
  }, []);

  return null; // This component doesn't render anything
};

export default SupabaseConnectionTest;
