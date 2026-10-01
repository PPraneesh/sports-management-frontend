import type {
  TeamMemberRole,
  TeamStatus,
} from './enums';

export interface RegisterTeamRequest {
  name: string;
  shortName: string;
  logoUrl?: string;
  description?: string;
}

export interface ManualTeamRequest {
  name: string;
  shortName: string;
  logoUrl?: string;
  description?: string;
  captainEmail: string;
}

export interface UpdateTeamRequest {
  name: string;
  shortName: string;
  logoUrl?: string;
  description?: string;
}

export interface AddTeamMemberRequest {
  email: string;
}

export interface TournamentSummary {
  id: number;
  organizerId: number;
  name: string;
  visibility: 'PUBLIC' | 'PRIVATE';
  status: string;
  maximumTeams: number;
  registrationStart: string;
  registrationEnd: string;
}

export interface MyTeamSummary {
  teamId: number;
  tournamentId: number;
  teamName: string;
  shortName: string;
  logoUrl: string | null;
  teamStatus: 'ACTIVE' | 'WITHDRAWN';
  memberRole: 'CAPTAIN' | 'PLAYER';
  tournament: TournamentSummary;
}

export interface TeamResponse {
  id: number;
  tournamentId: number;
  captainId: number;
  name: string;
  shortName: string;
  logoUrl: string | null;
  description: string | null;
  status: TeamStatus;
  createdAt: string;
  updatedAt: string;
}

export interface TeamMemberResponse {
  id: number;
  teamId: number;
  name: string;
  email: string;
  memberRole: TeamMemberRole;
  active: boolean;
  joinedAt: string;
}