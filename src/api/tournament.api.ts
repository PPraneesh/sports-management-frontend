import api from './axios';

import type {
  CreateTournamentRequest,
  TournamentResponse,
  UpdateTournamentRequest,
} from '../types/tournament.types';


export const createTournament = async (
  request: CreateTournamentRequest
): Promise<TournamentResponse> => {
  const response = await api.post<TournamentResponse>(
    '/api/tournaments',
    request
  );

  return response.data;
};


export const getPublicTournaments = async (): Promise<
  TournamentResponse[]
> => {
  const response = await api.get<TournamentResponse[]>(
    '/api/tournaments/public'
  );

  return response.data;
};


export const getPublicTournamentBySlug = async (
  slug: string
): Promise<TournamentResponse> => {
  const response = await api.get<TournamentResponse>(
    `/api/tournaments/public/${slug}`
  );

  return response.data;
};


export const getMyTournaments = async (): Promise<
  TournamentResponse[]
> => {
  const response = await api.get<TournamentResponse[]>(
    '/api/tournaments/my'
  );

  return response.data;
};


export const getTournamentById = async (
  tournamentId: number
): Promise<TournamentResponse> => {
  const response = await api.get<TournamentResponse>(
    `/api/tournaments/${tournamentId}`
  );

  return response.data;
};


export const updateTournament = async (
  tournamentId: number,
  request: UpdateTournamentRequest
): Promise<TournamentResponse> => {
  const response = await api.put<TournamentResponse>(
    `/api/tournaments/${tournamentId}`,
    request
  );

  return response.data;
};


export const openTournamentRegistration = async (
  tournamentId: number
): Promise<TournamentResponse> => {
  const response = await api.post<TournamentResponse>(
    `/api/tournaments/${tournamentId}/open-registration`
  );

  return response.data;
};


export const closeTournamentRegistration = async (
  tournamentId: number
): Promise<TournamentResponse> => {
  const response = await api.post<TournamentResponse>(
    `/api/tournaments/${tournamentId}/close-registration`
  );

  return response.data;
};


export const cancelTournament = async (
  tournamentId: number
): Promise<TournamentResponse> => {
  const response = await api.post<TournamentResponse>(
    `/api/tournaments/${tournamentId}/cancel`
  );

  return response.data;
};