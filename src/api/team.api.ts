import api from './axios';

import type {
  AddTeamMemberRequest,
  ManualTeamRequest,
  MyTeamSummary,
  RegisterTeamRequest,
  TeamMemberResponse,
  TeamResponse,
  UpdateTeamRequest,
} from '../types/team.types';


export const registerTeam = async (
  tournamentId: number,
  request: RegisterTeamRequest
): Promise<TeamResponse> => {
  const response = await api.post<TeamResponse>(
    `/api/tournaments/${tournamentId}/teams`,
    request
  );

  return response.data;
};


export const createManualTeam = async (
  tournamentId: number,
  request: ManualTeamRequest
): Promise<TeamResponse> => {
  const response = await api.post<TeamResponse>(
    `/api/tournaments/${tournamentId}/teams/manual`,
    request
  );

  return response.data;
};


export const getTournamentTeams = async (
  tournamentId: number
): Promise<TeamResponse[]> => {
  const response = await api.get<TeamResponse[]>(
    `/api/tournaments/${tournamentId}/teams`
  );

  return response.data;
};


export const getMyTeam = async (
  tournamentId: number
): Promise<TeamResponse> => {
  const response = await api.get<TeamResponse>(
    `/api/tournaments/${tournamentId}/teams/mine`
  );

  return response.data;
};


export const getTournamentTeam = async (
  tournamentId: number,
  teamId: number
): Promise<TeamResponse> => {
  const response = await api.get<TeamResponse>(
    `/api/tournaments/${tournamentId}/teams/${teamId}`
  );

  return response.data;
};


export const getTeamById = async (
  teamId: number
): Promise<TeamResponse> => {
  const response = await api.get<TeamResponse>(
    `/api/teams/${teamId}`
  );

  return response.data;
};


export const updateTeam = async (
  teamId: number,
  request: UpdateTeamRequest
): Promise<TeamResponse> => {
  const response = await api.put<TeamResponse>(
    `/api/teams/${teamId}`,
    request
  );

  return response.data;
};


export const getTeamMembers = async (
  teamId: number
): Promise<TeamMemberResponse[]> => {
  const response = await api.get<TeamMemberResponse[]>(
    `/api/teams/${teamId}/members`
  );

  return response.data;
};


export const addTeamMember = async (
  teamId: number,
  request: AddTeamMemberRequest
): Promise<TeamMemberResponse> => {
  const response = await api.post<TeamMemberResponse>(
    `/api/teams/${teamId}/members`,
    request
  );

  return response.data;
};


export const removeTeamMember = async (
  teamId: number,
  memberId: number
): Promise<void> => {
  await api.delete(
    `/api/teams/${teamId}/members/${memberId}`
  );
};


export const withdrawTeam = async (
  teamId: number
): Promise<void> => {
  await api.post(`/api/teams/${teamId}/withdraw`);
};


export const getMyTeams = async (): Promise<MyTeamSummary[]> => {
  const response = await api.get<MyTeamSummary[]>('/api/users/me/teams');
  return response.data;
};