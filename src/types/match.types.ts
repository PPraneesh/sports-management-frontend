import type {
  MatchStatus,
  MatchType,
} from './enums';


export interface CompleteMatchRequest {
  teamAScore: number;
  teamBScore: number;
  teamARunRate: number;
  teamBRunRate: number;
  tieBreakerDescription?: string;
  winnerTeamId?: number | null;
}


export interface RescheduleMatchRequest {
  scheduledAt: string;
}


export interface MatchResponse {
  id: number;
  tournamentId: number;
  groupId: number | null;

  teamAId: number;
  teamBId: number;

  winnerTeamId: number | null;

  matchCode: string;

  matchType: MatchType;
  status: MatchStatus;

  roundNumber: number;
  matchNumber: number;

  teamAScore: number | null;
  teamBScore: number | null;

  teamARunRate: number | null;
  teamBRunRate: number | null;

  tieBreakerDescription: string | null;

  scheduledAt: string;
  originalScheduledAt: string;

  startedAt: string | null;
  completedAt: string | null;
}