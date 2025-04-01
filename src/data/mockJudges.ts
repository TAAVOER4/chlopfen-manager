
import { User } from '@/types';
import { hashPassword } from '@/utils/authUtils';

// Initial default password is "password"
const defaultPasswordHash = "$2a$10$8DArxIj8AvMXCg7BXNgRhuGZfXxqpArWJI.uF9DS9T3EqYAPWIjPi";

export let mockJudges: User[] = [
  {
    id: 1,
    name: 'Hans Müller',
    username: 'hans.mueller',
    role: 'admin',
    passwordHash: defaultPasswordHash,
    assignedCriteria: undefined
  },
  {
    id: 8,
    name: 'Erwin Vogel',
    username: 'erwin.vogel',
    role: 'admin',
    passwordHash: defaultPasswordHash,
    assignedCriteria: undefined
  },
  {
    id: 2,
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
    id: 3,
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
    id: 4,
    name: 'Anna Weber',
    username: 'anna.weber',
    role: 'judge',
    passwordHash: defaultPasswordHash,
    assignedCriteria: {
      individual: 'stance'
    }
  },
  {
    id: 5,
    name: 'Stefan Keller',
    username: 'stefan.keller',
    role: 'judge',
    passwordHash: defaultPasswordHash,
    assignedCriteria: {
      individual: 'posture'
    }
  },
  {
    id: 6,
    name: 'Lisa Schmid',
    username: 'lisa.schmid',
    role: 'judge',
    passwordHash: defaultPasswordHash,
    assignedCriteria: {
      group: 'tempo'
    }
  },
  {
    id: 7,
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
