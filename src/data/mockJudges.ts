
import { User } from '@/types';
import { hashPassword } from '@/utils/authUtils';

// Initial default password is "password"
const defaultPasswordHash = "$2a$10$8DArxIj8AvMXCg7BXNgRhuGZfXxqpArWJI.uF9DS9T3EqYAPWIjPi";

export let mockJudges: User[] = [
  {
    id: 'judge_1',
    name: 'Hans Müller',
    username: 'hans.mueller',
    role: 'admin',
    passwordHash: defaultPasswordHash,
    assignedCriteria: undefined
  },
  {
    id: 'judge_8',
    name: 'Erwin Vogel',
    username: 'erwin.vogel',
    role: 'admin',
    passwordHash: defaultPasswordHash,
    assignedCriteria: undefined
  },
  {
    id: 'judge_2',
    name: 'Maria Schmidt',
    username: 'maria.schmidt',
    role: 'judge',
    passwordHash: defaultPasswordHash,
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
    passwordHash: defaultPasswordHash,
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
    passwordHash: defaultPasswordHash,
    assignedCriteria: {
      individual: 'stance'
    }
  },
  {
    id: 'judge_5',
    name: 'Stefan Keller',
    username: 'stefan.keller',
    role: 'judge',
    passwordHash: defaultPasswordHash,
    assignedCriteria: {
      individual: 'posture'
    }
  },
  {
    id: 'judge_6',
    name: 'Lisa Schmid',
    username: 'lisa.schmid',
    role: 'judge',
    passwordHash: defaultPasswordHash,
    assignedCriteria: {
      group: 'tempo'
    }
  },
  {
    id: 'judge_7',
    name: 'Thomas Brunner',
    username: 'thomas.brunner',
    role: 'judge',
    passwordHash: defaultPasswordHash,
    assignedCriteria: {
      individual: 'whipControl'
    }
  }
];

// Function to update the mockJudges array
export const updateMockJudges = (updatedJudges: User[]) => {
  mockJudges = updatedJudges;
};
