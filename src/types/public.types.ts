import type { StandingResponse } from './standing.types';


export interface PublicGroupResponse {
  groupId: number;
  name: string;
  sequenceNumber: number;
  status: string;
  standings: StandingResponse[];
}


export interface PublicMatchResponse {
  matchId: number;
  tournamentId: number;
  matchCode: string;

  matchType: string;
  status: string;

  groupId: number | null;
  groupName: string | null;

  teamAId: number;
  teamAName: string;

  teamBId: number;
  teamBName: string;

  winnerTeamId: number | null;
  winnerTeamName: string | null;

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


export interface PublicTournamentStatsResponse {
  tournamentId: number;
  publicSlug: string;

  name: string;
  sportType: string;

  visibility: string;
  status: string;
  format: string;

  totalTeams: number;
  totalMatches: number;
  completedMatches: number;
  liveMatches: number;
  upcomingMatches: number;

  currentStage: string;

  championTeamId: number | null;
  championTeamName: string | null;

  groups: PublicGroupResponse[];
}