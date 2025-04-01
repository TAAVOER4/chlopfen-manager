
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { User, CriterionKey, GroupCriterionKey, UserRole } from '@/types';

interface UserFormProps {
  user: User;
  onUserChange: (updatedUser: User) => void;
  individualCriteria: { value: CriterionKey; label: string }[];
  groupCriteria: { value: GroupCriterionKey; label: string }[];
}

const UserForm: React.FC<UserFormProps> = ({
  user,
  onUserChange,
  individualCriteria,
  groupCriteria
}) => {
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUserChange({...user, name: e.target.value});
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUserChange({...user, username: e.target.value});
  };

  const handleRoleChange = (value: string) => {
    onUserChange({
      ...user, 
      role: value as UserRole
    });
  };

  const handleIndividualCriterionChange = (value: string) => {
    const updatedCriteria = {
      ...(user.assignedCriteria || {}),
      individual: value as CriterionKey
    };
    onUserChange({...user, assignedCriteria: updatedCriteria});
  };

  const handleGroupCriterionChange = (value: string) => {
    const updatedCriteria = {
      ...(user.assignedCriteria || {}),
      group: value as GroupCriterionKey
    };
    onUserChange({...user, assignedCriteria: updatedCriteria});
  };

  return (
    <div className="space-y-4">
      <div>
        <Input 
          value={user.name}
          onChange={handleNameChange}
        />
      </div>
      
      <div>
        <Input 
          value={user.username}
          onChange={handleUsernameChange}
        />
      </div>
      
      <div>
        <Select 
          value={user.role}
          onValueChange={handleRoleChange}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Rolle auswählen" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="admin">Administrator</SelectItem>
            <SelectItem value="judge">Richter</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {user.role === 'judge' && (
        <div className="space-y-2">
          <div>
            <Label htmlFor="individual-criterion">Einzelwertung</Label>
            <Select 
              value={user.assignedCriteria?.individual || ''}
              onValueChange={handleIndividualCriterionChange}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Kriterium auswählen" />
              </SelectTrigger>
              <SelectContent>
                {individualCriteria.map((criterion) => (
                  <SelectItem key={criterion.value} value={criterion.value}>
                    {criterion.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="group-criterion">Gruppenwertung</Label>
            <Select 
              value={user.assignedCriteria?.group || ''}
              onValueChange={handleGroupCriterionChange}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Kriterium auswählen" />
              </SelectTrigger>
              <SelectContent>
                {groupCriteria.map((criterion) => (
                  <SelectItem key={criterion.value} value={criterion.value}>
                    {criterion.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserForm;
