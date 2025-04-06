
export type Category = 'kids' | 'juniors' | 'active';
export type GroupCategory = 'kids_juniors' | 'active';
export type AllCategory = 'all'; // New type for "all" categories
export type GroupSize = 'three' | 'four';
export type CriterionKey = 'whipStrikes' | 'rhythm' | 'stance' | 'posture' | 'whipControl';
export type GroupCriterionKey = 'whipStrikes' | 'rhythm' | 'tempo';
export type UserRole = 'admin' | 'judge' | 'reader' | 'editor';
export type SponsorType = 'prize' | 'donor' | 'banner' | 'main';

export interface Participant {
  id: number;
  firstName: string;
  lastName: string;
  location: string;
  birthYear: number;
  category: Category;
  groupIds?: number[];
  isGroupOnly?: boolean; // New flag to indicate participant is only in groups, not individual competition
  tournamentId?: number; // Reference to which tournament this participant belongs to
  displayOrder?: number; // New field for ordering participants in the UI
}

export interface Group {
  id: number;
  name: string;
  size: GroupSize;
  category: GroupCategory; // Changed from Category to GroupCategory
  participantIds: number[];
  tournamentId?: number; // Reference to which tournament this group belongs to
  displayOrder?: number; // New field for ordering groups in the UI
}

export interface IndividualScore {
  id?: number;
  participantId: number;
  judgeId: string; // Changed from number to string to match UUID in database
  round: 1 | 2;
  whipStrikes: number; // Now allows decimal values like 9.1
  rhythm: number;
  stance: number;
  posture: number;
  whipControl: number;
  tournamentId?: number; // Reference to tournament
}

export interface GroupScore {
  id?: number;
  groupId: number;
  judgeId: string; // Changed from number to string to match UUID in database
  whipStrikes: number;
  rhythm: number;
  tempo: number;
  time?: boolean; // Changed to boolean - either timed correctly (true) or not (false)
  tournamentId?: number; // Reference to tournament
}

export interface User {
  id: number;
  name: string;
  username: string;
  role: UserRole;
  passwordHash: string; // Hashed password for authentication
  password?: string; // Optional plain text password field for new user creation
  assignedCriteria?: {
    individual?: CriterionKey;
    group?: GroupCriterionKey;
  };
  tournamentIds: number[]; // Array of tournaments this user has access to
}

// For backward compatibility - Judge is now an alias to User
export type Judge = User;

export interface Sponsor {
  id: number;
  name: string;
  logo: string;
  category: Category | GroupCategory;
  rank?: 1 | 2 | 3;
  type: SponsorType;
  websiteUrl?: string;
  tournamentId?: number; // Reference to tournament
  isMainSponsor?: boolean; // New flag to mark main sponsors
}

export interface ParticipantResult {
  participant: Participant;
  totalScore: number;
  averageScore: number;
  rank: number;
}

export interface GroupResult {
  groupId: number;
  category: GroupCategory; // Updated to GroupCategory
  groupSize: GroupSize;
  members: Participant[];
  totalScore: number;
  averageRhythm: number;
  rank: number;
}

// New tournament interface
export interface Tournament {
  id: number;
  name: string;
  date: string; // ISO date string format
  location: string;
  year: number; // The year of the tournament
  isActive: boolean; // Flag to mark the currently active tournament
}

// New Schedule interface
export interface ScheduleItem {
  id: number;
  tournamentId: number;
  startTime: string; // format: "HH:mm"
  endTime: string; // format: "HH:mm"
  title: string;
  description?: string;
  category?: Category | GroupCategory | AllCategory; // Updated to include AllCategory
  type: 'competition' | 'ceremony' | 'break' | 'other';
}
