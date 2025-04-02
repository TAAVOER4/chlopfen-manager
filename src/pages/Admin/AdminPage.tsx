
import React from 'react';
import { useUser } from '@/contexts/UserContext';
import { AdminCardsGrid } from '@/components/Admin/AdminCardsGrid';
import { AccessDenied } from '@/components/Admin/AccessDenied';

const AdminPage = () => {
  const { isAdmin } = useUser();
  
  if (!isAdmin) {
    return <AccessDenied />;
  }
  
  return (
    <div className="animate-fade-in">
      <h1 className="text-3xl font-bold text-swiss-blue mb-6">Administration</h1>
      <AdminCardsGrid />
    </div>
  );
};

export default AdminPage;
