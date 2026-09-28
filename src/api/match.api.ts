import api from './axios';

import type {
  CompleteMatchRequest,
  MatchResponse,
  RescheduleMatchRequest,
} from '../types/match.types';


export const getTournamentMatches = async (
  tournamentId: number
): Promise<MatchResponse[]> => {
  const response = await api.get<MatchResponse[]>(
    `/api/tournaments/${tournamentId}/matches`
  );

  return response.data;
};


export const getMatchById = async (
  matchId: number
): Promise<MatchResponse> => {
  const response = await api.get<MatchResponse>(
    `/api/matches/${matchId}`
  );

  return response.data;
};


export const startMatch = async (
  matchId: number
): Promise<MatchResponse> => {
  const response = await api.post<MatchResponse>(
    `/api/matches/${matchId}/start`
  );

  return response.data;
};


export const completeMatch = async (
  matchId: number,
  request: CompleteMatchRequest
): Promise<MatchResponse> => {
  const response = await api.post<MatchResponse>(
    `/api/matches/${matchId}/complete`,
    request
  );

  return response.data;
};


export const postponeMatch = async (
  matchId: number
): Promise<MatchResponse> => {
  const response = await api.post<MatchResponse>(
    `/api/matches/${matchId}/postpone`
  );

  return response.data;
};


export const rescheduleMatch = async (
  matchId: number,
  request: RescheduleMatchRequest
): Promise<MatchResponse> => {
  const response = await api.post<MatchResponse>(
    `/api/matches/${matchId}/reschedule`,
    request
  );

  return response.data;
};