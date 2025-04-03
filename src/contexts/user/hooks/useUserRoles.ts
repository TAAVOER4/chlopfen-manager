
import { useMemo } from 'react';
import { User } from '@/types';

export const useUserRoles = (currentUser: User | null, originalAdmin: User | null) => {
  const isAdmin = useMemo(() => 
    !!currentUser && currentUser.role === 'admin',
    [currentUser]
  );
  
  const isJudge = useMemo(() => 
    !!currentUser && currentUser.role === 'judge',
    [currentUser]
  );
  
  const isReader = useMemo(() => 
    !!currentUser && currentUser.role === 'reader',
    [currentUser]
  );
  
  const isEditor = useMemo(() => 
    !!currentUser && currentUser.role === 'editor',
    [currentUser]
  );
  
  const isImpersonating = !!originalAdmin;

  return {
    isAdmin,
    isJudge,
    isReader,
    isEditor,
    isImpersonating
  };
};
