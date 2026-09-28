import api from './axios';

import type {
  PublicMatchResponse,
  PublicTournamentStatsResponse,
} from '../types/public.types';


export const getPublicTournament = async (
  slug: string
): Promise<PublicTournamentStatsResponse> => {
  const response =
    await api.get<PublicTournamentStatsResponse>(
      `/api/public/tournaments/${slug}`
    );

  return response.data;
};


export const getPublicMatch = async (
  slug: string,
  matchCode: string
): Promise<PublicMatchResponse> => {
  const response =
    await api.get<PublicMatchResponse>(
      `/api/public/tournaments/${slug}/matches/${matchCode}`
    );

  return response.data;
};