import type {
  TournamentFormat,
  TournamentStatus,
  TournamentVisibility,
} from './enums';


export interface CreateTournamentRequest {
  name: string;
  description?: string;
  sportType: string;
  location: string;
  visibility: TournamentVisibility;
  maximumTeams: number;
  winPoints?: number;
  drawPoints?: number;
  lossPoints?: number;
  registrationStart: string;
  registrationEnd: string;
  startDate: string;
  endDate: string;
}


export interface UpdateTournamentRequest {
  name: string;
  description?: string;
  sportType: string;
  location: string;
  visibility: TournamentVisibility;
  maximumTeams: number;
  winPoints?: number;
  drawPoints?: number;
  lossPoints?: number;
  registrationStart: string;
  registrationEnd: string;
  startDate: string;
  endDate: string;
}


export interface TournamentResponse {
  id: number;
  organizerId: number;
  name: string;
  description: string;
  sportType: string;
  location: string;
  publicSlug: string;
  visibility: TournamentVisibility;
  status: TournamentStatus;
  format: TournamentFormat;
  maximumTeams: number;
  winPoints: number;
  drawPoints: number;
  lossPoints: number;
  registrationStart: string;
  registrationEnd: string;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
}


export interface GroupResponse {
  id: number;
  tournamentId: number;
  name: string;
  sequenceNumber: number;
  status: string;
}