
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
import { Judge, CriterionKey, GroupCriterionKey } from '@/types';

interface JudgeFormProps {
  judge: Judge;
  onJudgeChange: (updatedJudge: Judge) => void;
  individualCriteria: { value: CriterionKey; label: string }[];
  groupCriteria: { value: GroupCriterionKey; label: string }[];
}

const JudgeForm: React.FC<JudgeFormProps> = ({
  judge,
  onJudgeChange,
  individualCriteria,
  groupCriteria
}) => {
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onJudgeChange({...judge, name: e.target.value});
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onJudgeChange({...judge, username: e.target.value});
  };

  const handleRoleChange = (value: string) => {
    onJudgeChange({
      ...judge, 
      role: value as 'admin' | 'judge'
    });
  };

  const handleIndividualCriterionChange = (value: string) => {
    const updatedCriteria = {
      ...(judge.assignedCriteria || {}),
      individual: value as CriterionKey
    };
    onJudgeChange({...judge, assignedCriteria: updatedCriteria});
  };

  const handleGroupCriterionChange = (value: string) => {
    const updatedCriteria = {
      ...(judge.assignedCriteria || {}),
      group: value as GroupCriterionKey
    };
    onJudgeChange({...judge, assignedCriteria: updatedCriteria});
  };

  return (
    <div className="space-y-4">
      <div>
        <Input 
          value={judge.name}
          onChange={handleNameChange}
        />
      </div>
      
      <div>
        <Input 
          value={judge.username}
          onChange={handleUsernameChange}
        />
      </div>
      
      <div>
        <Select 
          value={judge.role}
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
      
      {judge.role === 'judge' && (
        <div className="space-y-2">
          <div>
            <Label htmlFor="individual-criterion">Einzelwertung</Label>
            <Select 
              value={judge.assignedCriteria?.individual || ''}
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
              value={judge.assignedCriteria?.group || ''}
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

export default JudgeForm;
