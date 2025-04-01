
export type Category = 'kids' | 'juniors' | 'active';
export type GroupCategory = 'kids_juniors' | 'active';
export type GroupSize = 'three' | 'four';
export type CriterionKey = 'whipStrikes' | 'rhythm' | 'stance' | 'posture' | 'whipControl';
export type GroupCriterionKey = 'whipStrikes' | 'rhythm' | 'tempo';
export type UserRole = 'admin' | 'judge';
export type SponsorType = 'prize' | 'donor' | 'banner';

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
}

export interface Group {
  id: number;
  name: string;
  size: GroupSize;
  category: GroupCategory; // Changed from Category to GroupCategory
  participantIds: number[];
  tournamentId?: number; // Reference to which tournament this group belongs to
}

export interface IndividualScore {
  participantId: number;
  judgeId: number;
  round: 1 | 2;
  whipStrikes: number; // Now allows decimal values like 9.1
  rhythm: number;
  stance: number;
  posture: number;
  whipControl: number;
  tournamentId?: number; // Reference to tournament
}

export interface GroupScore {
  groupId: number;
  judgeId: number;
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
  assignedCriteria?: {
    individual?: CriterionKey;
    group?: GroupCriterionKey;
  };
  tournamentIds?: number[]; // Reference to tournaments this judge is assigned to
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
