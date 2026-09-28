export interface StandingSnapshot {
  groupId: number;
  teamId: number;

  matchesPlayed: number;
  wins: number;
  draws: number;
  losses: number;

  points: number;

  scoreFor: number;
  scoreAgainst: number;
  scoreDifference: number;

  pointsPerMatch: number;
  scoreDifferencePerMatch: number;
  normalizedRunRate: number;
  winPercentage: number;
}


export interface StandingResponse {
  groupId: number;
  teamId: number;
  teamName: string;

  rank: number;

  matchesPlayed: number;
  wins: number;
  draws: number;
  losses: number;

  points: number;

  scoreFor: number;
  scoreAgainst: number;
  scoreDifference: number;

  pointsPerMatch: number;
  scoreDifferencePerMatch: number;
  normalizedRunRate: number;
  winPercentage: number;

  qualified: boolean;
}