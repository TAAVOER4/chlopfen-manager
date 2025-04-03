
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useUser } from '@/contexts/UserContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import LoginFormFields from './LoginFormFields';
import { AuthenticationService } from '@/services/auth/AuthenticationService';
import { hashPassword } from '@/utils/authUtils';

type FormValues = {
  username: string;
  password: string;
};

const LoginForm: React.FC = () => {
  const { login } = useUser();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showHashTool, setShowHashTool] = useState(false);
  const [passwordToHash, setPasswordToHash] = useState('');
  const [generatedHash, setGeneratedHash] = useState('');
  
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    defaultValues: {
      username: '',
      password: ''
    }
  });

  const onSubmit = async (data: FormValues) => {
    console.log('Login form submitted with username:', data.username);
    setIsLoading(true);
    
    try {
      const success = await login(data.username, data.password);
      if (!success) {
        console.log('Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Login error",
        description: "There was an error while trying to log in. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateHash = () => {
    try {
      const hash = hashPassword(passwordToHash);
      setGeneratedHash(hash);
    } catch (error) {
      console.error('Error generating hash:', error);
      setGeneratedHash('Error generating hash');
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <LoginFormFields 
          register={register} 
          errors={errors} 
        />
        
        <div>
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading}
          >
            {isLoading ? "Logging in..." : "Login"}
          </Button>
        </div>
      </form>
      
      {/* Developer Tool - Toggle with double click on the form title */}
      <div className="mt-8 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500 cursor-pointer" onDoubleClick={() => setShowHashTool(!showHashTool)}>
          {showHashTool ? "Hide Hash Generator" : "Developer Tools (Double-click to show)"}
        </p>
        
        {showHashTool && (
          <div className="mt-4 p-4 bg-gray-100 rounded-md">
            <h3 className="text-sm font-medium mb-2">Password Hash Generator</h3>
            <div className="space-y-2">
              <Input 
                placeholder="Enter password to hash" 
                value={passwordToHash} 
                onChange={(e) => setPasswordToHash(e.target.value)}
              />
              <Button 
                type="button" 
                onClick={handleGenerateHash} 
                size="sm"
              >
                Generate Hash
              </Button>
              
              {generatedHash && (
                <div className="mt-2">
                  <p className="text-xs font-bold">Generated Hash:</p>
                  <p className="text-xs break-all bg-gray-200 p-2 rounded">{generatedHash}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginForm;
