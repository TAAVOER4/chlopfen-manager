
import { Judge } from '@/types';

export const mockJudges: Judge[] = [
  {
    id: 'judge_1',
    name: 'Hans Müller',
    username: 'hans.mueller',
    role: 'admin',
    assignedCriterion: undefined
  },
  {
    id: 'judge_2',
    name: 'Maria Schmidt',
    username: 'maria.schmidt',
    role: 'judge',
    assignedCriterion: 'rhythm'
  },
  {
    id: 'judge_3',
    name: 'Peter Meier',
    username: 'peter.meier',
    role: 'judge',
    assignedCriterion: 'whipStrikes'
  },
  {
    id: 'judge_4',
    name: 'Anna Weber',
    username: 'anna.weber',
    role: 'judge',
    assignedCriterion: 'stance'
  },
  {
    id: 'judge_5',
    name: 'Stefan Keller',
    username: 'stefan.keller',
    role: 'judge',
    assignedCriterion: 'posture'
  }
];
