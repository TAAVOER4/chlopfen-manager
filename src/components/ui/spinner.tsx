
import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface SpinnerProps {
  className?: string;
  size?: 'default' | 'sm' | 'lg' | 'xl';
}

export const Spinner: React.FC<SpinnerProps> = ({ 
  className,
  size = 'default'
}) => {
  const sizeClass = {
    sm: 'h-4 w-4',
    default: 'h-6 w-6', 
    lg: 'h-8 w-8',
    xl: 'h-12 w-12'
  }[size];

  return (
    <Loader2 
      className={cn(
        "animate-spin",
        sizeClass,
        className
      )} 
    />
  );
};
