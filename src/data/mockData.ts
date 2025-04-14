import { Participant, IndividualScore, GroupScore, Judge, Sponsor, Group, GroupCategory } from '../types';
import { determineCategory } from '../utils/categoryUtils';

// Mock Participants
export const mockParticipants: Participant[] = [
  // Bestehende Teilnehmer
  {
    id: 1,
    firstName: 'Max',
    lastName: 'Muster',
    location: 'Bern',
    birthYear: 2011,
    category: 'kids',
    groupIds: [1]
  },
  {
    id: 2,
    firstName: 'Anna',
    lastName: 'Schmidt',
    location: 'Zürich',
    birthYear: 2010,
    category: 'kids',
    groupIds: [1]
  },
  {
    id: 3,
    firstName: 'Tim',
    lastName: 'Meier',
    location: 'Luzern',
    birthYear: 2007,
    category: 'juniors',
    groupIds: [2]
  },
  {
    id: 4,
    firstName: 'Sarah',
    lastName: 'Huber',
    location: 'Basel',
    birthYear: 2008,
    category: 'juniors',
    groupIds: [2]
  },
  {
    id: 5,
    firstName: 'Michael',
    lastName: 'Weber',
    location: 'St. Gallen',
    birthYear: 2000,
    category: 'active'
  },
  {
    id: 6,
    firstName: 'Laura',
    lastName: 'Müller',
    location: 'Bern',
    birthYear: 1995,
    category: 'active'
  },
  
  // Zusätzliche "kids" Teilnehmer (bis 15)
  {
    id: 7,
    firstName: 'Felix',
    lastName: 'Keller',
    location: 'Thun',
    birthYear: 2012,
    category: 'kids',
    groupIds: [3]
  },
  {
    id: 8,
    firstName: 'Sophia',
    lastName: 'Berger',
    location: 'Interlaken',
    birthYear: 2011,
    category: 'kids',
    groupIds: [3]
  },
  {
    id: 9,
    firstName: 'Lukas',
    lastName: 'Zimmermann',
    location: 'Biel',
    birthYear: 2012,
    category: 'kids',
    groupIds: [3]
  },
  {
    id: 10,
    firstName: 'Lea',
    lastName: 'Fischer',
    location: 'Chur',
    birthYear: 2010,
    category: 'kids',
    groupIds: [4]
  },
  {
    id: 11,
    firstName: 'Noah',
    lastName: 'Brunner',
    location: 'Zug',
    birthYear: 2011,
    category: 'kids',
    groupIds: [4]
  },
  {
    id: 12,
    firstName: 'Lena',
    lastName: 'Hofmann',
    location: 'Olten',
    birthYear: 2012,
    category: 'kids',
    groupIds: [4]
  },
  {
    id: 13,
    firstName: 'Julian',
    lastName: 'Wagner',
    location: 'Schaffhausen',
    birthYear: 2010,
    category: 'kids',
    groupIds: [5]
  },
  {
    id: 14,
    firstName: 'Elena',
    lastName: 'Schneider',
    location: 'Winterthur',
    birthYear: 2011,
    category: 'kids',
    groupIds: [5]
  },
  {
    id: 15,
    firstName: 'Daniel',
    lastName: 'Koch',
    location: 'Solothurn',
    birthYear: 2012,
    category: 'kids',
    groupIds: [5]
  },
  {
    id: 16,
    firstName: 'Sophie',
    lastName: 'Baumann',
    location: 'Aarau',
    birthYear: 2010,
    category: 'kids',
    groupIds: [6]
  },
  {
    id: 17,
    firstName: 'Luis',
    lastName: 'Vogel',
    location: 'Frauenfeld',
    birthYear: 2011,
    category: 'kids',
    groupIds: [6]
  },
  {
    id: 18,
    firstName: 'Hannah',
    lastName: 'Keller',
    location: 'Sion',
    birthYear: 2012,
    category: 'kids',
    groupIds: [6]
  },
  {
    id: 19,
    firstName: 'Fabian',
    lastName: 'Schmid',
    location: 'Fribourg',
    birthYear: 2010,
    category: 'kids'
  },
  {
    id: 20,
    firstName: 'Klara',
    lastName: 'Ammann',
    location: 'Neuchâtel',
    birthYear: 2011,
    category: 'kids'
  },
  {
    id: 21,
    firstName: 'Luca',
    lastName: 'Frei',
    location: 'Lugano',
    birthYear: 2012,
    category: 'kids'
  },
  
  // Zusätzliche "juniors" Teilnehmer (bis 15)
  {
    id: 22,
    firstName: 'Emma',
    lastName: 'Furrer',
    location: 'Bern',
    birthYear: 2008,
    category: 'juniors',
    groupIds: [7]
  },
  {
    id: 23,
    firstName: 'Simon',
    lastName: 'Egger',
    location: 'Zürich',
    birthYear: 2007,
    category: 'juniors',
    groupIds: [7]
  },
  {
    id: 24,
    firstName: 'Jana',
    lastName: 'Baur',
    location: 'Genf',
    birthYear: 2009,
    category: 'juniors',
    groupIds: [7]
  },
  {
    id: 25,
    firstName: 'Nico',
    lastName: 'Kaiser',
    location: 'Lausanne',
    birthYear: 2007,
    category: 'juniors',
    groupIds: [8]
  },
  {
    id: 26,
    firstName: 'Mia',
    lastName: 'Steiner',
    location: 'Basel',
    birthYear: 2008,
    category: 'juniors',
    groupIds: [8]
  },
  {
    id: 27,
    firstName: 'Jonas',
    lastName: 'Roth',
    location: 'Luzern',
    birthYear: 2009,
    category: 'juniors',
    groupIds: [8]
  },
  {
    id: 28,
    firstName: 'Lisa',
    lastName: 'Bühler',
    location: 'St. Gallen',
    birthYear: 2007,
    category: 'juniors',
    groupIds: [9]
  },
  {
    id: 29,
    firstName: 'David',
    lastName: 'Stucki',
    location: 'Thun',
    birthYear: 2008,
    category: 'juniors',
    groupIds: [9]
  },
  {
    id: 30,
    firstName: 'Nina',
    lastName: 'Gerber',
    location: 'Biel',
    birthYear: 2009,
    category: 'juniors',
    groupIds: [9]
  },
  {
    id: 31,
    firstName: 'Tom',
    lastName: 'Widmer',
    location: 'Zug',
    birthYear: 2007,
    category: 'juniors',
    groupIds: [10]
  },
  {
    id: 32,
    firstName: 'Julia',
    lastName: 'Eberhard',
    location: 'Chur',
    birthYear: 2008,
    category: 'juniors',
    groupIds: [10]
  },
  {
    id: 33,
    firstName: 'Samuel',
    lastName: 'Flückiger',
    location: 'Winterthur',
    birthYear: 2009,
    category: 'juniors',
    groupIds: [10]
  },
  {
    id: 34,
    firstName: 'Selina',
    lastName: 'Frick',
    location: 'Aarau',
    birthYear: 2007,
    category: 'juniors'
  },
  {
    id: 35,
    firstName: 'Benjamin',
    lastName: 'Hauser',
    location: 'Frauenfeld',
    birthYear: 2008,
    category: 'juniors'
  },
  {
    id: 36,
    firstName: 'Elisa',
    lastName: 'Wyss',
    location: 'Sion',
    birthYear: 2009,
    category: 'juniors'
  },
  
  // Zusätzliche "active" Teilnehmer (bis 15)
  {
    id: 37,
    firstName: 'Marco',
    lastName: 'Bühler',
    location: 'Bern',
    birthYear: 1998,
    category: 'active',
    groupIds: [11]
  },
  {
    id: 38,
    firstName: 'Leila',
    lastName: 'Hofer',
    location: 'Zürich',
    birthYear: 1997,
    category: 'active',
    groupIds: [11]
  },
  {
    id: 39,
    firstName: 'Pascal',
    lastName: 'Gut',
    location: 'Basel',
    birthYear: 1999,
    category: 'active',
    groupIds: [11]
  },
  {
    id: 40,
    firstName: 'Nadine',
    lastName: 'Zürcher',
    location: 'Luzern',
    birthYear: 1996,
    category: 'active',
    groupIds: [12]
  },
  {
    id: 41,
    firstName: 'Sven',
    lastName: 'Tanner',
    location: 'St. Gallen',
    birthYear: 1995,
    category: 'active',
    groupIds: [12]
  },
  {
    id: 42,
    firstName: 'Céline',
    lastName: 'Kunz',
    location: 'Genf',
    birthYear: 1997,
    category: 'active',
    groupIds: [12]
  },
  {
    id: 43,
    firstName: 'Rafael',
    lastName: 'Moser',
    location: 'Lausanne',
    birthYear: 1994,
    category: 'active',
    groupIds: [13]
  },
  {
    id: 44,
    firstName: 'Nicole',
    lastName: 'Gasser',
    location: 'Thun',
    birthYear: 1993,
    category: 'active',
    groupIds: [13]
  },
  {
    id: 45,
    firstName: 'Dominik',
    lastName: 'Locher',
    location: 'Biel',
    birthYear: 1998,
    category: 'active',
    groupIds: [13]
  },
  {
    id: 46,
    firstName: 'Jessica',
    lastName: 'Bucher',
    location: 'Chur',
    birthYear: 1995,
    category: 'active',
    groupIds: [14]
  },
  {
    id: 47,
    firstName: 'Adrian',
    lastName: 'Frey',
    location: 'Zug',
    birthYear: 1996,
    category: 'active',
    groupIds: [14]
  },
  {
    id: 48,
    firstName: 'Sandra',
    lastName: 'Ackermann',
    location: 'Winterthur',
    birthYear: 1994,
    category: 'active',
    groupIds: [14]
  },
  {
    id: 49,
    firstName: 'Kevin',
    lastName: 'Koller',
    location: 'Aarau',
    birthYear: 1997,
    category: 'active'
  },
  {
    id: 50,
    firstName: 'Andrea',
    lastName: 'Blum',
    location: 'Frauenfeld',
    birthYear: 1995,
    category: 'active'
  },
  {
    id: 51,
    firstName: 'Thomas',
    lastName: 'Flury',
    location: 'Sion',
    birthYear: 1996,
    category: 'active'
  }
];

// Mock Groups (Updated to use the new GroupCategory type)
export const mockGroups: Group[] = [
  // Bestehende Gruppen
  {
    id: 1,
    name: 'Berner Jungs',
    size: 'three',
    category: 'kids_juniors',
    participantIds: [1, 2]
  },
  {
    id: 2,
    name: 'Zürcher Junioren',
    size: 'four',
    category: 'kids_juniors',
    participantIds: [3, 4]
  },
  
  // Zusätzliche Gruppen (Kids/Juniors)
  {
    id: 3,
    name: 'Thuner Klopfer',
    size: 'three',
    category: 'kids_juniors',
    participantIds: [7, 8, 9]
  },
  {
    id: 4,
    name: 'Churer Schlingel',
    size: 'three',
    category: 'kids_juniors',
    participantIds: [10, 11, 12]
  },
  {
    id: 5,
    name: 'Schaffhauser Kids',
    size: 'three',
    category: 'kids_juniors',
    participantIds: [13, 14, 15]
  },
  {
    id: 6,
    name: 'Aarauer Peitscher',
    size: 'three',
    category: 'kids_juniors',
    participantIds: [16, 17, 18]
  },
  
  // Zusätzliche Gruppen (Juniors - now kids_juniors)
  {
    id: 7,
    name: 'Berner Champions',
    size: 'three',
    category: 'kids_juniors',
    participantIds: [22, 23, 24]
  },
  {
    id: 8,
    name: 'Basler Jugend',
    size: 'three',
    category: 'kids_juniors',
    participantIds: [25, 26, 27]
  },
  {
    id: 9,
    name: 'St. Galler Falken',
    size: 'three',
    category: 'kids_juniors',
    participantIds: [28, 29, 30]
  },
  {
    id: 10,
    name: 'Zuger Adler',
    size: 'three',
    category: 'kids_juniors',
    participantIds: [31, 32, 33]
  },
  
  // Zusätzliche Gruppen (Active)
  {
    id: 11,
    name: 'Berner Elite',
    size: 'three',
    category: 'active',
    participantIds: [37, 38, 39]
  },
  {
    id: 12,
    name: 'Luzerner Profis',
    size: 'three',
    category: 'active',
    participantIds: [40, 41, 42]
  },
  {
    id: 13,
    name: 'Lausanner Meister',
    size: 'three',
    category: 'active',
    participantIds: [43, 44, 45]
  },
  {
    id: 14,
    name: 'Churer Champions',
    size: 'three',
    category: 'active',
    participantIds: [46, 47, 48]
  }
];

// Default password hash (for the password "password")
const defaultPasswordHash = "$2a$10$8DArxIj8AvMXCg7BXNgRhuGZfXxqpArWJI.uF9DS9T3EqYAPWIjPi";

// Mock Judges - Update ID types to string
export const mockJudges: Judge[] = [
  { 
    id: "f5b2c3a7-1e5d-4839-a7dd-1c25f4b3a74f", // Changed from number to string UUID
    name: 'Hans Fischer', 
    username: 'hans', 
    role: 'admin',
    passwordHash: defaultPasswordHash,
    assignedCriteria: {
      individual: 'whipStrikes'
    },
    tournamentIds: [] // Admin can see all tournaments
  },
  { 
    id: "a7b8c9d0-e1f2-4a3b-4c5d-6e7f8a9b0c1d", // Changed from number to string UUID
    name: 'Maria Gerber', 
    username: 'maria', 
    role: 'judge',
    passwordHash: defaultPasswordHash,
    assignedCriteria: {
      individual: 'rhythm'
    },
    tournamentIds: [] // Judge can see all tournaments
  },
  { 
    id: "a1b2c3d4-e5f6-4a3b-8c9d-0e1f2a3b4c5d", // Changed from number to string UUID
    name: 'Peter Keller', 
    username: 'peter', 
    role: 'judge',
    passwordHash: defaultPasswordHash,
    assignedCriteria: {
      individual: 'stance'
    },
    tournamentIds: [] // Judge can see all tournaments
  },
  { 
    id: "b2c3d4e5-f6a7-4b3c-9d0e-1f2a3b4c5d6e", // Changed from number to string UUID
    name: 'Christine Wagner', 
    username: 'christine', 
    role: 'judge',
    passwordHash: defaultPasswordHash,
    assignedCriteria: {
      individual: 'posture'
    },
    tournamentIds: [] // Judge can see all tournaments
  },
  { 
    id: "c3d4e5f6-a7b8-4c3d-0e1f-2a3b4c5d6e7f", // Changed from number to string UUID
    name: 'Thomas Schneider', 
    username: 'thomas', 
    role: 'judge',
    passwordHash: defaultPasswordHash,
    assignedCriteria: {
      individual: 'whipControl'
    },
    tournamentIds: [] // Judge can see all tournaments
  }
];

// Mock Individual Scores (Einige beispielhafte zusätzliche Scores)
export const mockIndividualScores: IndividualScore[] = [
  // Bestehende Scores
  {
    participantId: 1,
    judgeId: "1", // Changed from number to string
    round: 1,
    whipStrikes: 8,
    rhythm: 7,
    stance: 8,
    posture: 7,
    whipControl: 8
  },
  {
    participantId: 1,
    judgeId: "2", // Changed from number to string
    round: 1,
    whipStrikes: 7,
    rhythm: 8,
    stance: 7,
    posture: 8,
    whipControl: 7
  },
  
  // Einige Beispiel-Scores für neue Teilnehmer
  {
    participantId: 7,
    judgeId: "1", // Changed from number to string
    round: 1,
    whipStrikes: 9,
    rhythm: 8,
    stance: 7,
    posture: 8,
    whipControl: 7
  },
  {
    participantId: 22,
    judgeId: "2", // Changed from number to string
    round: 1,
    whipStrikes: 8,
    rhythm: 9,
    stance: 8,
    posture: 7,
    whipControl: 9
  },
  {
    participantId: 37,
    judgeId: "3", // Changed from number to string
    round: 1,
    whipStrikes: 9,
    rhythm: 9,
    stance: 9,
    posture: 8,
    whipControl: 9
  }
];

// Mock Group Scores (Einige beispielhafte zusätzliche Scores)
export const mockGroupScores: GroupScore[] = [
  // Bestehende Scores
  {
    groupId: 1,
    judgeId: "1", // Changed from number to string
    whipStrikes: 8,
    rhythm: 7,
    tempo: 8,
    time: true
  },
  
  // Beispielhafte neue Scores
  {
    groupId: 3,
    judgeId: "2", // Changed from number to string
    whipStrikes: 9,
    rhythm: 8,
    tempo: 7,
    time: true
  },
  {
    groupId: 7,
    judgeId: "3", // Changed from number to string
    whipStrikes: 8,
    rhythm: 9,
    tempo: 8,
    time: true
  },
  {
    groupId: 11,
    judgeId: "4", // Changed from number to string
    whipStrikes: 9,
    rhythm: 9,
    tempo: 9,
    time: true
  }
];

// Mock Sponsors
export const mockSponsors: Sponsor[] = [
  {
    id: 1,
    name: 'Swiss Traditions AG',
    category: 'kids',
    rank: 1,
    logo: '/lovable-uploads/a5d2c313-c136-4233-8b7b-e1347138b272.png',
    type: 'prize'
  },
  {
    id: 2,
    name: 'Schweizer Folklore GmbH',
    category: 'juniors',
    rank: 1,
    logo: '/lovable-uploads/d96b84f9-8847-4e45-bd71-c44b3fb53513.png',
    type: 'prize'
  },
  {
    id: 3,
    name: 'Alpen Traditions',
    category: 'active',
    rank: 1,
    logo: '/lovable-uploads/4ea13025-c283-4b04-91f7-8176d706ccf7.png',
    type: 'prize'
  },
  // Zusätzliche Sponsoren
  {
    id: 4,
    name: 'Bergfreunde GmbH',
    category: 'kids',
    rank: 2,
    logo: '/lovable-uploads/b3e7c249-a712-4f5a-9b31-d7e8a1b9e654.png',
    type: 'prize'
  },
  {
    id: 5,
    name: 'Heimatland Sponsoring',
    category: 'juniors',
    rank: 2,
    logo: '/lovable-uploads/c5f9a3a7-e821-4d2b-b45c-f8d3e2a7bc32.png',
    type: 'prize'
  },
  {
    id: 6,
    name: 'Schweizer Bank AG',
    category: 'active',
    rank: 2,
    logo: '/lovable-uploads/7d9e4a12-f3b6-4e78-a5c3-2d8e7b6f4321.png',
    type: 'prize'
  }
];
