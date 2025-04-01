
import { Judge } from '@/types';

export let mockJudges: Judge[] = [
  {
    id: 'judge_1',
    name: 'Hans Müller',
    username: 'hans.mueller',
    role: 'admin',
    assignedCriteria: undefined
  },
  {
    id: 'judge_2',
    name: 'Maria Schmidt',
    username: 'maria.schmidt',
    role: 'judge',
    assignedCriteria: {
      individual: 'rhythm',
      group: 'rhythm'
    }
  },
  {
    id: 'judge_3',
    name: 'Peter Meier',
    username: 'peter.meier',
    role: 'judge',
    assignedCriteria: {
      individual: 'whipStrikes',
      group: 'whipStrikes'
    }
  },
  {
    id: 'judge_4',
    name: 'Anna Weber',
    username: 'anna.weber',
    role: 'judge',
    assignedCriteria: {
      individual: 'stance'
    }
  },
  {
    id: 'judge_5',
    name: 'Stefan Keller',
    username: 'stefan.keller',
    role: 'judge',
    assignedCriteria: {
      individual: 'posture'
    }
  },
  {
    id: 'judge_6',
    name: 'Lisa Schmid',
    username: 'lisa.schmid',
    role: 'judge',
    assignedCriteria: {
      group: 'tempo'
    }
  },
  {
    id: 'judge_7',
    name: 'Thomas Brunner',
    username: 'thomas.brunner',
    role: 'judge',
    assignedCriteria: {
      individual: 'whipControl'
    }
  }
];

// Function to update the mockJudges array
export const updateMockJudges = (updatedJudges: Judge[]) => {
  mockJudges = updatedJudges;
};
