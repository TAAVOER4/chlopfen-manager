
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Filter } from 'lucide-react';
import { User } from '@/types';

interface UserFilterTabsProps {
  activeTab: string;
  onTabChange: (value: string) => void;
  users: User[];
}

const UserFilterTabs: React.FC<UserFilterTabsProps> = ({ 
  activeTab,
  onTabChange,
  users 
}) => {
  return (
    <div className="flex items-center">
      <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
      <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
        <TabsList className="grid grid-cols-5">
          <TabsTrigger value="all">
            Alle <Badge variant="outline" className="ml-2">{users.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="admin">
            Admins <Badge variant="outline" className="ml-2">
              {users.filter(u => u.role === 'admin').length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="judge">
            Richter <Badge variant="outline" className="ml-2">
              {users.filter(u => u.role === 'judge').length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="reader">
            Leser <Badge variant="outline" className="ml-2">
              {users.filter(u => u.role === 'reader').length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="editor">
            Bearbeiter <Badge variant="outline" className="ml-2">
              {users.filter(u => u.role === 'editor').length}
            </Badge>
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
};

export default UserFilterTabs;
