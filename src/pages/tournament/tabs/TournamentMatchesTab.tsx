import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { getTournamentMatches } from '../../../api/match.api';
import { getTournamentTeams } from '../../../api/team.api';
import type { MatchResponse } from '../../../types/match.types';
import type { TeamResponse } from '../../../types/team.types';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import ErrorAlert from '../../../components/common/ErrorAlert';
import StatusBadge from '../../../components/common/StatusBadge';
import { getApiErrorMessage } from '../../../utils/apiError';
import { formatDateTime } from '../../../utils/date';

interface TournamentMatchesTabProps {
  tournamentId: number;
}

export default function TournamentMatchesTab({
  tournamentId,
}: TournamentMatchesTabProps) {
  const [matches, setMatches] = useState<MatchResponse[]>([]);
  const [teams, setTeams] = useState<TeamResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  useEffect(() => {
    let ignore = false;
    const load = async () => {
      try {
        setLoading(true);
        setError('');
        const [matchesRes, teamsRes] = await Promise.all([
          getTournamentMatches(tournamentId),
          getTournamentTeams(tournamentId),
        ]);
        if (ignore) return;
        setMatches(matchesRes);
        setTeams(teamsRes);
      } catch (err) {
        if (!ignore) {
          setError(getApiErrorMessage(err, 'Unable to load fixtures.'));
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    load();
    return () => { ignore = true; };
  }, [tournamentId]);

  const teamMap = useMemo(() => {
    const map = new Map<number, TeamResponse>();
    teams.forEach((t) => map.set(t.id, t));
    return map;
  }, [teams]);

  const filteredMatches = useMemo(
    () =>
      selectedStatus === 'ALL'
        ? matches
        : matches.filter((m) => m.status === selectedStatus),
    [matches, selectedStatus]
  );

  if (loading) return <LoadingSpinner message="Loading fixtures…" />;

  return (
    <div className="space-y-5">
      {error && <ErrorAlert message={error} />}

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-gray-500">
          {matches.length} {matches.length === 1 ? 'fixture' : 'fixtures'}
        </p>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-gray-400">Filter</span>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 outline-none transition focus:border-gray-400"
          >
            <option value="ALL">All ({matches.length})</option>
            <option value="SCHEDULED">Scheduled</option>
            <option value="LIVE">Live</option>
            <option value="POSTPONED">Postponed</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>
      </div>

      {filteredMatches.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 bg-white p-12 text-center">
          <p className="font-medium text-gray-700">No fixtures found</p>
          <p className="mt-1 text-sm text-gray-400">
            {selectedStatus !== 'ALL'
              ? 'Try a different filter.'
              : `The organizer hasn't generated the schedule yet.`}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredMatches
            .sort(
              (a, b) =>
                a.roundNumber - b.roundNumber || a.matchNumber - b.matchNumber
            )
            .map((match) => (
              <MatchCard key={match.id} match={match} teamMap={teamMap} />
            ))}
        </div>
      )}
    </div>
  );
}

interface MatchCardProps {
  match: MatchResponse;
  teamMap: Map<number, TeamResponse>;
}

function MatchCard({ match, teamMap }: MatchCardProps) {
  const navigate = useNavigate();

  const teamAInfo = match.teamAId ? teamMap.get(match.teamAId) : null;
  const teamBInfo = match.teamBId ? teamMap.get(match.teamBId) : null;
  const teamA = teamAInfo?.name ?? (match.teamAId ? `Team #${match.teamAId}` : 'TBD');
  const teamB = teamBInfo?.name ?? (match.teamBId ? `Team #${match.teamBId}` : 'TBD');

  const isLive = match.status === 'LIVE';
  const isCompleted = match.status === 'COMPLETED';
  const teamsAssigned = !!match.teamAId && !!match.teamBId;

  const handleManageClick = () => {
    if (!teamsAssigned) return; // button is disabled
    navigate(`/matches/${match.id}/manage`);
  };

  return (
    <div
      className={`rounded-xl border bg-white p-5 transition ${
        isLive
          ? 'border-green-200 ring-1 ring-green-100'
          : 'border-gray-200 hover:border-gray-300'
      }`}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Match info */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 text-xs text-gray-400">
            <span className="font-medium uppercase tracking-wider text-gray-500">
              {match.matchType.replaceAll('_', ' ')}
            </span>
            <span>·</span>
            <span>R{match.roundNumber} M{match.matchNumber}</span>
            <StatusBadge status={match.status} />
            {!teamsAssigned && (
              <span className="rounded-md bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold text-amber-600">
                Teams TBD
              </span>
            )}
          </div>

          <div className="mt-3 grid grid-cols-[1fr_auto_1fr] items-center gap-4">
            <div className="text-right">
              <p className="truncate text-sm font-semibold text-gray-900">{teamA}</p>
              <p className="mt-0.5 text-2xl font-black tabular-nums text-gray-900">
                {match.teamAScore ?? '–'}
              </p>
            </div>
            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-bold text-gray-400">
              VS
            </span>
            <div>
              <p className="truncate text-sm font-semibold text-gray-900">{teamB}</p>
              <p className="mt-0.5 text-2xl font-black tabular-nums text-gray-900">
                {match.teamBScore ?? '–'}
              </p>
            </div>
          </div>

          <p className="mt-2 text-xs text-gray-400">{formatDateTime(match.scheduledAt)}</p>
        </div>

        {/* Actions */}
        <div className="flex shrink-0 gap-2">
          {/* View button — always shown */}
          <Link
            to={`/matches/${match.id}`}
            className="rounded-lg border border-gray-200 px-3.5 py-2 text-xs font-semibold text-gray-600 transition hover:bg-gray-50"
          >
            View
          </Link>

          {/* Manage — shown only when not completed; disabled + tooltip when teams unassigned */}
          {!isCompleted && (
            <button
              type="button"
              onClick={handleManageClick}
              disabled={!teamsAssigned}
              title={!teamsAssigned ? 'Teams must be assigned before managing this match' : undefined}
              className="rounded-lg bg-gray-900 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Manage
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
