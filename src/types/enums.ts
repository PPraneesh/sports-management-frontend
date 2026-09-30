export const GroupStatus = {
  ACTIVE: 'ACTIVE',
  COMPLETED: 'COMPLETED',
} as const;

export type GroupStatus =
  (typeof GroupStatus)[keyof typeof GroupStatus];


export const MatchStatus = {
  SCHEDULED: 'SCHEDULED',
  LIVE: 'LIVE',
  POSTPONED: 'POSTPONED',
  COMPLETED: 'COMPLETED',
} as const;

export type MatchStatus =
  (typeof MatchStatus)[keyof typeof MatchStatus];


export const MatchType = {
  GROUP_STAGE: 'GROUP_STAGE',
  SEMIFINAL: 'SEMIFINAL',
  FINAL: 'FINAL',
} as const;

export type MatchType =
  (typeof MatchType)[keyof typeof MatchType];


export const TournamentEventType = {
  TOURNAMENT_REGISTRATION_CLOSED:
    'TOURNAMENT_REGISTRATION_CLOSED',
} as const;

export type TournamentEventType =
  (typeof TournamentEventType)[keyof typeof TournamentEventType];


export const TeamMemberRole = {
  CAPTAIN: 'CAPTAIN',
  PLAYER: 'PLAYER',
} as const;

export type TeamMemberRole =
  (typeof TeamMemberRole)[keyof typeof TeamMemberRole];


export const TeamStatus = {
  ACTIVE: 'ACTIVE',
  WITHDRAWN: 'WITHDRAWN',
} as const;

export type TeamStatus =
  (typeof TeamStatus)[keyof typeof TeamStatus];


export const TournamentFormat = {
  DIRECT_KNOCKOUT: 'DIRECT_KNOCKOUT',
  GROUP_AND_KNOCKOUT: 'GROUP_AND_KNOCKOUT',
} as const;

export type TournamentFormat =
  (typeof TournamentFormat)[keyof typeof TournamentFormat];


export const TournamentStatus = {
  DRAFT: 'DRAFT',
  OPEN: 'OPEN',
  REGISTRATION_CLOSED: 'REGISTRATION_CLOSED',
  FIXTURES_GENERATED: 'FIXTURES_GENERATED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
} as const;

export type TournamentStatus =
  (typeof TournamentStatus)[keyof typeof TournamentStatus];


export const TournamentVisibility = {
  PUBLIC: 'PUBLIC',
  PRIVATE: 'PRIVATE',
} as const;

export type TournamentVisibility =
  (typeof TournamentVisibility)[keyof typeof TournamentVisibility];