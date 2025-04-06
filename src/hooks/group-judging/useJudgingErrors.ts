
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

export const useJudgingErrors = () => {
  const { toast } = useToast();
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleError = (error: unknown, context: string) => {
    console.error(`Error in ${context}:`, error);
    
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'An unexpected error occurred';
      
    toast({
      title: "Error",
      description: `${context}: ${errorMessage}`,
      variant: "destructive"
    });
    
    setErrors(prev => ({
      ...prev,
      [context]: errorMessage
    }));
    
    return errorMessage;
  };

  const clearError = (context: string) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[context];
      return newErrors;
    });
  };

  const clearAllErrors = () => {
    setErrors({});
  };

  return {
    errors,
    hasErrors: Object.keys(errors).length > 0,
    handleError,
    clearError,
    clearAllErrors
  };
};
