
import { User } from '@/types';
import { hashPassword } from '@/utils/authUtils';

// Initial default password is "password"
const defaultPasswordHash = "$2a$10$8DArxIj8AvMXCg7BXNgRhuGZfXxqpArWJI.uF9DS9T3EqYAPWIjPi";

export let mockJudges: User[] = [
  {
    id: 'f5b2c3a7-1e5d-4839-a7dd-1c25f4b3a74f',
    name: 'Hans Müller',
    username: 'hans.mueller',
    role: 'admin',
    passwordHash: defaultPasswordHash,
    assignedCriteria: undefined,
    tournamentIds: []  // Admins can see all tournaments
  },
  {
    id: 'a7b8c9d0-e1f2-4a3b-4c5d-6e7f8a9b0c1d',
    name: 'Erwin Vogel',
    username: 'erwin.vogel',
    role: 'admin',
    passwordHash: defaultPasswordHash,
    assignedCriteria: undefined,
    tournamentIds: []  // Admins can see all tournaments
  },
  {
    id: 'a1b2c3d4-e5f6-4a3b-8c9d-0e1f2a3b4c5d',
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
    id: 'b2c3d4e5-f6a7-4b3c-9d0e-1f2a3b4c5d6e',
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
    id: 'c3d4e5f6-a7b8-4c3d-0e1f-2a3b4c5d6e7f',
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
    id: 'd4e5f6a7-b8c9-4d3e-1f2a-3b4c5d6e7f8a',
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
    id: 'e5f6a7b8-c9d0-4e3f-2a3b-4c5d6e7f8a9b',
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
    id: 'f6a7b8c9-d0e1-4f3a-3b4c-5d6e7f8a9b0c',
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
    id: 'b8c9d0e1-f2a3-4b4c-5d6e-7f8a9b0c1d2e',
    name: 'Christina Huber',
    username: 'christina.huber',
    role: 'reader',
    passwordHash: defaultPasswordHash,
    assignedCriteria: undefined,
    tournamentIds: [1]  // Only assigned tournaments
  },
  {
    id: 'c9d0e1f2-a3b4-4c5d-6e7f-8a9b0c1d2e3f',
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
