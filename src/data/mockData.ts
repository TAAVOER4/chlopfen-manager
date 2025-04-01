import { Participant, IndividualScore, GroupScore, Judge, Sponsor, Group } from '../types';
import { determineCategory } from '../utils/categoryUtils';

// Mock Participants
export const mockParticipants: Participant[] = [
  {
    id: '1',
    firstName: 'Max',
    lastName: 'Muster',
    location: 'Bern',
    birthYear: 2011,
    category: 'kids',
    groupIds: ['g1']
  },
  {
    id: '2',
    firstName: 'Anna',
    lastName: 'Schmidt',
    location: 'Zürich',
    birthYear: 2010,
    category: 'kids',
    groupIds: ['g1']
  },
  {
    id: '3',
    firstName: 'Tim',
    lastName: 'Meier',
    location: 'Luzern',
    birthYear: 2007,
    category: 'juniors',
    groupIds: ['g2']
  },
  {
    id: '4',
    firstName: 'Sarah',
    lastName: 'Huber',
    location: 'Basel',
    birthYear: 2008,
    category: 'juniors',
    groupIds: ['g2']
  },
  {
    id: '5',
    firstName: 'Michael',
    lastName: 'Weber',
    location: 'St. Gallen',
    birthYear: 2000,
    category: 'active'
  },
  {
    id: '6',
    firstName: 'Laura',
    lastName: 'Müller',
    location: 'Bern',
    birthYear: 1995,
    category: 'active'
  }
];

// Mock Groups
export const mockGroups: Group[] = [
  {
    id: 'g1',
    name: 'Berner Jungs',
    size: 'three',
    category: 'kids',
    participantIds: ['1', '2']
  },
  {
    id: 'g2',
    name: 'Zürcher Junioren',
    size: 'four',
    category: 'juniors',
    participantIds: ['3', '4']
  }
];

// Default password hash (for the password "password")
const defaultPasswordHash = "$2a$10$8DArxIj8AvMXCg7BXNgRhuGZfXxqpArWJI.uF9DS9T3EqYAPWIjPi";

// Mock Judges
export const mockJudges: Judge[] = [
  { 
    id: 'j1', 
    name: 'Hans Fischer', 
    username: 'hans', 
    role: 'admin',
    passwordHash: defaultPasswordHash,
    assignedCriteria: {
      individual: 'whipStrikes'
    }
  },
  { 
    id: 'j2', 
    name: 'Maria Gerber', 
    username: 'maria', 
    role: 'judge',
    passwordHash: defaultPasswordHash,
    assignedCriteria: {
      individual: 'rhythm'
    }
  },
  { 
    id: 'j3', 
    name: 'Peter Keller', 
    username: 'peter', 
    role: 'judge',
    passwordHash: defaultPasswordHash,
    assignedCriteria: {
      individual: 'stance'
    }
  },
  { 
    id: 'j4', 
    name: 'Christine Wagner', 
    username: 'christine', 
    role: 'judge',
    passwordHash: defaultPasswordHash,
    assignedCriteria: {
      individual: 'posture'
    }
  },
  { 
    id: 'j5', 
    name: 'Thomas Schneider', 
    username: 'thomas', 
    role: 'judge',
    passwordHash: defaultPasswordHash,
    assignedCriteria: {
      individual: 'whipControl'
    }
  }
];

// Mock Individual Scores
export const mockIndividualScores: IndividualScore[] = [
  {
    participantId: '1',
    judgeId: 'j1',
    round: 1,
    whipStrikes: 8,
    rhythm: 7,
    stance: 8,
    posture: 7,
    whipControl: 8
  },
  {
    participantId: '1',
    judgeId: 'j2',
    round: 1,
    whipStrikes: 7,
    rhythm: 8,
    stance: 7,
    posture: 8,
    whipControl: 7
  }
];

// Mock Group Scores
export const mockGroupScores: GroupScore[] = [
  {
    groupId: 'g1',
    judgeId: 'j1',
    whipStrikes: 8,
    rhythm: 7,
    tempo: 8,
    time: true
  }
];

// Mock Sponsors
export const mockSponsors: Sponsor[] = [
  {
    id: 's1',
    name: 'Swiss Traditions AG',
    category: 'kids',
    rank: 1,
    logo: '/lovable-uploads/a5d2c313-c136-4233-8b7b-e1347138b272.png'
  },
  {
    id: 's2',
    name: 'Schweizer Folklore GmbH',
    category: 'juniors',
    rank: 1,
    logo: '/lovable-uploads/d96b84f9-8847-4e45-bd71-c44b3fb53513.png'
  },
  {
    id: 's3',
    name: 'Alpen Traditions',
    category: 'active',
    rank: 1,
    logo: '/lovable-uploads/4ea13025-c283-4b04-91f7-8176d706ccf7.png'
  }
];
