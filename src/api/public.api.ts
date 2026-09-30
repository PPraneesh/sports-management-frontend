import api from './axios';

import type {
  PublicMatchResponse,
  PublicTournamentStatsResponse,
} from '../types/public.types';
import type { TournamentResponse } from '../types/tournament.types';
import type { MatchResponse } from '../types/match.types';
import type { TeamMemberResponse, TeamResponse } from '../types/team.types';

/**
 * 1. Fetch list of all public tournaments (for selector/browser).
 * Endpoint: GET /api/tournaments/public (Tournament Service)
 */
export const getPublicTournaments = async (): Promise<TournamentResponse[]> => {
  const response = await api.get<TournamentResponse[]>('/api/tournaments/public');
  return response.data;
};

/**
 * 2. Fetch tournament metadata, location, dates, format, and rules.
 * Endpoint: GET /api/tournaments/public/{slug} (Tournament Service)
 */
export const getPublicTournamentDetails = async (
  slug: string
): Promise<TournamentResponse> => {
  const response = await api.get<TournamentResponse>(
    `/api/tournaments/public/${slug}`
  );
  return response.data;
};

/**
 * 3. Fetch tournament stats, group tables, and full standings.
 * Endpoint: GET /api/public/tournaments/{slug} (Competition Service)
 */
export const getPublicTournamentStats = async (
  slug: string
): Promise<PublicTournamentStatsResponse> => {
  const response = await api.get<PublicTournamentStatsResponse>(
    `/api/public/tournaments/${slug}`
  );
  return response.data;
};

/** Backward compatibility alias */
export const getPublicTournament = getPublicTournamentStats;

/**
 * 4. Fetch full tournament fixtures, scores, rounds, and match statuses.
 * Endpoint: GET /api/tournaments/{tournamentId}/matches (Competition Service)
 */
export const getTournamentMatches = async (
  tournamentId: number
): Promise<MatchResponse[]> => {
  const response = await api.get<MatchResponse[]>(
    `/api/tournaments/${tournamentId}/matches`
  );
  return response.data;
};

/**
 * 5. Fetch single match details with resolved team & group names.
 * Endpoint: GET /api/public/tournaments/{slug}/matches/{matchCode} (Competition Service)
 */
export const getPublicMatch = async (
  slug: string,
  matchCode: string
): Promise<PublicMatchResponse> => {
  const response = await api.get<PublicMatchResponse>(
    `/api/public/tournaments/${slug}/matches/${matchCode}`
  );
  return response.data;
};

/**
 * 6. Fetch all registered teams in the tournament.
 * Endpoint: GET /api/tournaments/{tournamentId}/teams (Team Service)
 */
export const getTournamentTeams = async (
  tournamentId: number
): Promise<TeamResponse[]> => {
  const response = await api.get<TeamResponse[]>(
    `/api/tournaments/${tournamentId}/teams`
  );
  return response.data;
};

/**
 * 7. Fetch roster/members for a registered team (optional/expandable).
 * Endpoint: GET /api/teams/{teamId}/members (Team Service)
 */
export const getTeamMembers = async (
  teamId: number
): Promise<TeamMemberResponse[]> => {
  const response = await api.get<TeamMemberResponse[]>(
    `/api/teams/${teamId}/members`
  );
  return response.data;
};