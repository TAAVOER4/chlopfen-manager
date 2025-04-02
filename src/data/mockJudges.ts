
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
    assignedCriteria: undefined,
    tournamentIds: []  // Admins can see all tournaments
  },
  {
    id: 8,
    name: 'Erwin Vogel',
    username: 'erwin.vogel',
    role: 'admin',
    passwordHash: defaultPasswordHash,
    assignedCriteria: undefined,
    tournamentIds: []  // Admins can see all tournaments
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
    },
    tournamentIds: []  // Judges can see all tournaments
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
    },
    tournamentIds: []  // Judges can see all tournaments
  },
  {
    id: 4,
    name: 'Anna Weber',
    username: 'anna.weber',
    role: 'judge',
    passwordHash: defaultPasswordHash,
    assignedCriteria: {
      individual: 'stance'
    },
    tournamentIds: []  // Judges can see all tournaments
  },
  {
    id: 5,
    name: 'Stefan Keller',
    username: 'stefan.keller',
    role: 'judge',
    passwordHash: defaultPasswordHash,
    assignedCriteria: {
      individual: 'posture'
    },
    tournamentIds: []  // Judges can see all tournaments
  },
  {
    id: 6,
    name: 'Lisa Schmid',
    username: 'lisa.schmid',
    role: 'judge',
    passwordHash: defaultPasswordHash,
    assignedCriteria: {
      group: 'tempo'
    },
    tournamentIds: []  // Judges can see all tournaments
  },
  {
    id: 7,
    name: 'Thomas Brunner',
    username: 'thomas.brunner',
    role: 'judge',
    passwordHash: defaultPasswordHash,
    assignedCriteria: {
      individual: 'whipControl'
    },
    tournamentIds: []  // Judges can see all tournaments
  },
  {
    id: 9,
    name: 'Christina Huber',
    username: 'christina.huber',
    role: 'reader',
    passwordHash: defaultPasswordHash,
    assignedCriteria: undefined,
    tournamentIds: [1]  // Only assigned tournaments
  },
  {
    id: 10,
    name: 'Michael Wagner',
    username: 'michael.wagner',
    role: 'editor',
    passwordHash: defaultPasswordHash,
    assignedCriteria: undefined,
    tournamentIds: [2]  // Only assigned tournaments
  }
];

// Function to update the mockJudges array
export const updateMockJudges = (updatedJudges: User[]) => {
  mockJudges = updatedJudges;
};
