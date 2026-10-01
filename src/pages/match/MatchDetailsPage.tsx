import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';
import { getMatchById } from '../../api/match.api';
import { getTournamentTeams } from '../../api/team.api';
import type { MatchResponse } from '../../types/match.types';
import type { TeamResponse } from '../../types/team.types';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorAlert from '../../components/common/ErrorAlert';
import { getApiErrorMessage } from '../../utils/apiError';
import { formatDateTime } from '../../utils/date';

export default function MatchDetailsPage() {
  const { matchId } = useParams();
  const [match, setMatch] = useState<MatchResponse | null>(null);
  const [teams, setTeams] = useState<TeamResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const numMatchId = Number(matchId);

  useEffect(() => {
    if (!matchId || Number.isNaN(numMatchId)) return;

    setLoading(true);
    setError('');

    getMatchById(numMatchId)
      .then((matchData) => {
        setMatch(matchData);

        if (matchData.tournamentId) {
          getTournamentTeams(matchData.tournamentId)
            .then((teamsData) => setTeams(teamsData))
        }
      })
      .catch((err) => {
        setError(getApiErrorMessage(err, 'Failed to load match details.'));
      })
      .finally(() => {
        setLoading(false);
      });
  }, [matchId, numMatchId]);

  if (loading) return <LoadingSpinner message="Loading match…" />;

  if (error || !match) {
    return (
      <div className="mx-auto max-w-xl py-12">
        <ErrorAlert message={error || 'Match not found.'} />
      </div>
    );
  }

  const teamMap = new Map<number, TeamResponse>();
  teams.forEach((t) => teamMap.set(t.id, t));

  const teamA = match.teamAId ? teamMap.get(match.teamAId) : null;
  const teamB = match.teamBId ? teamMap.get(match.teamBId) : null;

  const teamALabel = teamA?.name ?? (match.teamAId ? `Team #${match.teamAId}` : 'TBD');
  const teamBLabel = teamB?.name ?? (match.teamBId ? `Team #${match.teamBId}` : 'TBD');
  const teamAShort = teamA?.shortName ?? teamALabel.slice(0, 3).toUpperCase();
  const teamBShort = teamB?.shortName ?? teamBLabel.slice(0, 3).toUpperCase();

  const winnerTeam = match.winnerTeamId
    ? (teamMap.get(match.winnerTeamId)?.name ?? `Team #${match.winnerTeamId}`)
    : null;

  const isCompleted = match.status === 'COMPLETED';
  const backTo = match.tournamentId
    ? `/tournaments/${match.tournamentId}?tab=matches`
    : '/tournaments';

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 border-b border-gray-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              {match.matchCode}
            </h1>
            <StatusBadge status={match.status} />
            <span className="rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium uppercase tracking-wide text-gray-500">
              {match.matchType.replaceAll('_', ' ')}
            </span>
          </div>
          <p className="mt-1 text-sm text-gray-400">
            Round {match.roundNumber} · Match {match.matchNumber}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {match.tournamentId && (
            <Link
              to={backTo}
              className="rounded-lg border border-gray-200 px-3.5 py-2 text-xs font-semibold text-gray-600 transition hover:bg-gray-50"
            >
              All Matches
            </Link>
          )}
          {!isCompleted && (
            <Link
              to={`/matches/${match.id}/manage`}
              className="rounded-lg bg-gray-900 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-gray-800"
            >
              Manage
            </Link>
          )}
        </div>
      </div>

      {/* Score card */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 sm:p-10">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-6">
          {/* Team A */}
          <div className="flex flex-col items-center text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gray-100 text-sm font-bold text-gray-700">
              {teamAShort}
            </div>
            <p className="mt-3 text-sm font-semibold text-gray-900">{teamALabel}</p>
            <p className="mt-4 text-5xl font-black tabular-nums text-gray-900">
              {match.teamAScore ?? '–'}
            </p>
            {match.teamARunRate !== null && (
              <p className="mt-1.5 text-xs text-gray-400">
                NRR {match.teamARunRate.toFixed(2)}
              </p>
            )}
          </div>

          {/* Center */}
          <div className="flex flex-col items-center gap-3">
            <span className="text-xl font-black text-gray-200">VS</span>
            {winnerTeam && (
              <span className="rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                {winnerTeam} wins
              </span>
            )}
            {match.tieBreakerDescription && (
              <p className="text-center text-xs italic text-gray-400">
                {match.tieBreakerDescription}
              </p>
            )}
          </div>

          {/* Team B */}
          <div className="flex flex-col items-center text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gray-100 text-sm font-bold text-gray-700">
              {teamBShort}
            </div>
            <p className="mt-3 text-sm font-semibold text-gray-900">{teamBLabel}</p>
            <p className="mt-4 text-5xl font-black tabular-nums text-gray-900">
              {match.teamBScore ?? '–'}
            </p>
            {match.teamBRunRate !== null && (
              <p className="mt-1.5 text-xs text-gray-400">
                NRR {match.teamBRunRate.toFixed(2)}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Timeline — only show entries that have values */}
      {(match.scheduledAt || match.startedAt || match.completedAt) && (
        <div className="rounded-xl border border-gray-200 bg-white px-6 py-5">
          <div className="grid gap-4 sm:grid-cols-3">
            {match.scheduledAt && (
              <TimelineItem label="Scheduled" value={formatDateTime(match.scheduledAt)} />
            )}
            {match.startedAt && (
              <TimelineItem label="Started" value={formatDateTime(match.startedAt)} />
            )}
            {match.completedAt && (
              <TimelineItem label="Completed" value={formatDateTime(match.completedAt)} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function TimelineItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] font-medium uppercase tracking-wide text-gray-400">{label}</p>
      <p className="mt-0.5 text-sm font-medium text-gray-800">{value}</p>
    </div>
  );
}