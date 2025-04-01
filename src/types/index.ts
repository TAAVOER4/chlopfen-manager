
export type Category = 'kids' | 'juniors' | 'active';
export type GroupSize = 'three' | 'four';
export type CriterionKey = 'whipStrikes' | 'rhythm' | 'stance' | 'posture' | 'whipControl';
export type GroupCriterionKey = 'whipStrikes' | 'rhythm' | 'tempo' | 'time';

export interface Participant {
  id: string;
  firstName: string;
  lastName: string;
  location: string;
  birthYear: number;
  category: Category;
  groupIds?: string[];
  isGroupOnly?: boolean; // New flag to indicate participant is only in groups, not individual competition
}

export interface Group {
  id: string;
  name: string;
  size: GroupSize;
  category: Category;
  participantIds: string[];
}

export interface IndividualScore {
  participantId: string;
  judgeId: string;
  round: 1 | 2;
  whipStrikes: number; // Now allows decimal values like 9.1
  rhythm: number;
  stance: number;
  posture: number;
  whipControl: number;
}

export interface GroupScore {
  groupId: string;
  judgeId: string;
  whipStrikes: number;
  rhythm: number;
  tempo: number;
  time?: boolean; // Changed to boolean - either timed correctly (true) or not (false)
}

export interface Judge {
  id: string;
  name: string;
  username: string;
  role: 'admin' | 'judge';
  assignedCriterion?: CriterionKey | GroupCriterionKey;
}

export interface Sponsor {
  id: string;
  name: string;
  logo: string;
  category: Category;
  rank: 1 | 2 | 3;
}

export interface ParticipantResult {
  participant: Participant;
  totalScore: number;
  averageScore: number;
  rank: number;
}

export interface GroupResult {
  groupId: string;
  category: Category;
  groupSize: GroupSize;
  members: Participant[];
  totalScore: number;
  averageRhythm: number;
  rank: number;
}
