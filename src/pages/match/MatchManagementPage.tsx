import { useEffect, useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router';
import {
  completeMatch,
  getMatchById,
  postponeMatch,
  rescheduleMatch,
  startMatch,
} from '../../api/match.api';
import { getTournamentTeams } from '../../api/team.api';
import type { CompleteMatchRequest, MatchResponse } from '../../types/match.types';
import type { TeamResponse } from '../../types/team.types';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorAlert from '../../components/common/ErrorAlert';
import { getApiErrorMessage } from '../../utils/apiError';
import { formatDateTime, toLocalDateTimeString } from '../../utils/date';

const todayMin = new Date().toISOString().slice(0, 16);

export default function MatchManagementPage() {
  const { matchId } = useParams();
  const navigate = useNavigate();

  const [match, setMatch] = useState<MatchResponse | null>(null);
  const [teams, setTeams] = useState<TeamResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Score form
  const [teamAScore, setTeamAScore] = useState('');
  const [teamBScore, setTeamBScore] = useState('');
  const [teamARunRate, setTeamARunRate] = useState('');
  const [teamBRunRate, setTeamBRunRate] = useState('');
  const [winnerTeamId, setWinnerTeamId] = useState('');
  const [tieBreaker, setTieBreaker] = useState('');

  // Reschedule form
  const [rescheduleDate, setRescheduleDate] = useState('');

  const numMatchId = Number(matchId);

  useEffect(() => {
    if (!matchId || Number.isNaN(numMatchId)) return;

    let ignore = false;
    const fetchMatch = async () => {
      try {
        setError('');
        const data = await getMatchById(numMatchId);
        if (ignore) return;
        setMatch(data);

        // Pre-fill score fields if already set
        if (data.teamAScore !== null) setTeamAScore(String(data.teamAScore));
        if (data.teamBScore !== null) setTeamBScore(String(data.teamBScore));
        if (data.teamARunRate !== null) setTeamARunRate(String(data.teamARunRate));
        if (data.teamBRunRate !== null) setTeamBRunRate(String(data.teamBRunRate));
        if (data.winnerTeamId) setWinnerTeamId(String(data.winnerTeamId));
        if (data.tieBreakerDescription) setTieBreaker(data.tieBreakerDescription);
        if (data.scheduledAt) setRescheduleDate(data.scheduledAt.slice(0, 16));

        // Fetch team names
        if (data.tournamentId) {
          try {
            const teamsData = await getTournamentTeams(data.tournamentId);
            if (!ignore) setTeams(teamsData);
          } catch {
            // degrade gracefully
          }
        }
      } catch (err) {
        if (!ignore) setError(getApiErrorMessage(err, 'Failed to load match.'));
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    fetchMatch();
    return () => { ignore = true; };
  }, [matchId, numMatchId]);

  const run = async (action: () => Promise<MatchResponse>) => {
    try {
      setActionLoading(true);
      setError('');
      setSuccess('');
      const updated = await action();
      setMatch(updated);
      return updated;
    } catch (err) {
      setError(getApiErrorMessage(err, 'Action failed.'));
      return null;
    } finally {
      setActionLoading(false);
    }
  };

  const handleStart = async () => {
    const updated = await run(() => startMatch(numMatchId));
    if (updated) setSuccess('Match is now LIVE.');
  };

  const handlePostpone = async () => {
    const updated = await run(() => postponeMatch(numMatchId));
    if (updated) setSuccess('Match has been postponed.');
  };

  const handleReschedule = async (e: FormEvent) => {
    e.preventDefault();
    if (!rescheduleDate) {
      setError('Select a new date and time.');
      return;
    }
    const updated = await run(() =>
      rescheduleMatch(numMatchId, { scheduledAt: toLocalDateTimeString(rescheduleDate) })
    );
    if (updated) setSuccess('Match rescheduled.');
  };

  const handleComplete = async (e: FormEvent) => {
    e.preventDefault();
    const payload: CompleteMatchRequest = {
      teamAScore: Number(teamAScore) || 0,
      teamBScore: Number(teamBScore) || 0,
      teamARunRate: Number(teamARunRate) || 0,
      teamBRunRate: Number(teamBRunRate) || 0,
      winnerTeamId: winnerTeamId ? Number(winnerTeamId) : null,
      tieBreakerDescription: tieBreaker.trim() || undefined,
    };
    const updated = await run(() => completeMatch(numMatchId, payload));
    if (updated) {
      setSuccess('Scores saved. Match completed.');
      // Redirect to details after a moment
      setTimeout(() => navigate(`/matches/${numMatchId}`), 1200);
    }
  };

  if (loading) return <LoadingSpinner message="Loading match…" />;

  if (error && !match) {
    return (
      <div className="mx-auto max-w-xl py-12">
        <ErrorAlert message={error} />
      </div>
    );
  }

  if (!match) return null;

  // Redirect completed matches to details page
  if (match.status === 'COMPLETED') {
    return <Navigate to={`/matches/${match.id}`} replace />;
  }

  const teamMap = new Map<number, TeamResponse>();
  teams.forEach((t) => teamMap.set(t.id, t));

  const teamA = match.teamAId ? teamMap.get(match.teamAId) : null;
  const teamB = match.teamBId ? teamMap.get(match.teamBId) : null;
  const teamALabel = teamA?.name ?? (match.teamAId ? `Team #${match.teamAId}` : 'TBD');
  const teamBLabel = teamB?.name ?? (match.teamBId ? `Team #${match.teamBId}` : 'TBD');

  const teamsAssigned = !!match.teamAId && !!match.teamBId;

  // Status-based logic
  const isPostponed = match.status === 'POSTPONED';
  const isScheduled = match.status === 'SCHEDULED';
  const isLive = match.status === 'LIVE';

  // Start is allowed: SCHEDULED or (POSTPONED only if rescheduled = originalScheduledAt differs from scheduledAt, indicating reschedule happened)
  // Per user: "a match can be started only if the match is rescheduled (this is only if the match is postponed)"
  // So: if POSTPONED, start is shown only if scheduledAt !== originalScheduledAt (i.e., rescheduled)
  const isRescheduled = isPostponed && match.scheduledAt !== match.originalScheduledAt;

  const canStart = isScheduled || isRescheduled;
  const canPostpone = isScheduled || isLive;
  const canReschedule = isPostponed;
  const canComplete = isLive;

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

        {match.tournamentId && (
          <Link
            to={`/tournaments/${match.tournamentId}?tab=matches`}
            className="inline-flex items-center rounded-lg border border-gray-200 px-3.5 py-2 text-xs font-semibold text-gray-600 transition hover:bg-gray-50"
          >
            All Matches
          </Link>
        )}
      </div>

      {/* Notifications */}
      {error && <ErrorAlert message={error} onClose={() => setError('')} />}
      {success && (
        <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-800">
          {success}
        </div>
      )}

      {/* Teams at a glance */}
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 text-center">
          <div>
            <p className="text-base font-bold text-gray-900">{teamALabel}</p>
            <p className="mt-0.5 text-3xl font-black tabular-nums text-gray-900">
              {match.teamAScore ?? '–'}
            </p>
          </div>
          <span className="text-sm font-bold text-gray-300">VS</span>
          <div>
            <p className="text-base font-bold text-gray-900">{teamBLabel}</p>
            <p className="mt-0.5 text-3xl font-black tabular-nums text-gray-900">
              {match.teamBScore ?? '–'}
            </p>
          </div>
        </div>
        {match.scheduledAt && (
          <p className="mt-4 border-t border-gray-100 pt-3 text-center text-xs text-gray-400">
            {isPostponed ? 'Rescheduled for ' : 'Scheduled for '}
            {formatDateTime(match.scheduledAt)}
          </p>
        )}
      </div>

      {/* Unassigned teams warning */}
      {!teamsAssigned && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Teams haven't been assigned to this match yet. Management options will be available once both teams are confirmed.
        </div>
      )}

      {/* Action buttons — contextual and minimal */}
      {teamsAssigned && (
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="flex flex-wrap items-center gap-2">
            {canStart && (
              <button
                type="button"
                disabled={actionLoading}
                onClick={handleStart}
                className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-700 disabled:opacity-50"
              >
                Start Match
              </button>
            )}

            {canPostpone && (
              <button
                type="button"
                disabled={actionLoading}
                onClick={handlePostpone}
                className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-700 transition hover:bg-amber-100 disabled:opacity-50"
              >
                Postpone
              </button>
            )}

            {!canStart && !canPostpone && !canComplete && (
              <p className="text-sm text-gray-400">
                {isPostponed
                  ? 'Reschedule the match below before starting.'
                  : 'No actions available for the current match status.'}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Reschedule — only when POSTPONED */}
      {teamsAssigned && canReschedule && (
        <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-3">
          <h2 className="text-sm font-semibold text-gray-900">Reschedule</h2>
          <form onSubmit={handleReschedule} className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex-1">
              <label className="mb-1 block text-xs font-medium text-gray-500">
                New date &amp; time
              </label>
              <input
                type="datetime-local"
                min={todayMin}
                value={rescheduleDate}
                onChange={(e) => setRescheduleDate(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3.5 py-2 text-sm text-gray-900 outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
              />
            </div>
            <button
              type="submit"
              disabled={actionLoading}
              className="rounded-lg bg-gray-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:opacity-50"
            >
              {actionLoading ? 'Saving…' : 'Update Schedule'}
            </button>
          </form>
        </div>
      )}

      {/* Complete / Scores — only when LIVE */}
      {teamsAssigned && canComplete && (
        <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-4">
          <h2 className="text-sm font-semibold text-gray-900">Record Final Scores</h2>

          <form onSubmit={handleComplete} className="space-y-4">
            {/* Scores — always required */}
            <div className="grid gap-4 sm:grid-cols-2">
              <ScoreField
                label={`${teamALabel} — Score`}
                value={teamAScore}
                onChange={setTeamAScore}
                placeholder="0"
                required
              />
              <ScoreField
                label={`${teamBLabel} — Score`}
                value={teamBScore}
                onChange={setTeamBScore}
                placeholder="0"
                required
              />
              <ScoreField
                label={`${teamALabel} — Run Rate`}
                value={teamARunRate}
                onChange={setTeamARunRate}
                placeholder="0.00"
                step="0.01"
                required
              />
              <ScoreField
                label={`${teamBLabel} — Run Rate`}
                value={teamBRunRate}
                onChange={setTeamBRunRate}
                placeholder="0.00"
                step="0.01"
                required
              />
            </div>

            {/* Winner + Tie-breaker — only when score AND run rate are equal (true tie) */}
            {(() => {
              const scoresEqual =
                teamAScore !== '' &&
                teamBScore !== '' &&
                teamAScore === teamBScore;
              const runRatesEqual =
                teamARunRate !== '' &&
                teamBRunRate !== '' &&
                Number(teamARunRate).toFixed(2) === Number(teamBRunRate).toFixed(2);
              const isTie = scoresEqual && runRatesEqual;

              return isTie ? (
                <div className="space-y-4 rounded-lg border border-amber-100 bg-amber-50/60 p-4">
                  <p className="text-xs font-semibold text-amber-700">
                    Scores and run rates are equal — specify a winner and write a tie-breaker note.
                  </p>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-xs font-medium text-gray-500">
                        Winner
                      </label>
                      <select
                        value={winnerTeamId}
                        onChange={(e) => setWinnerTeamId(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 px-3.5 py-2 text-sm text-gray-900 outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                      >
                        <option value={String(match.teamAId)}>{teamALabel}</option>
                        <option value={String(match.teamBId)}>{teamBLabel}</option>
                      </select>
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-medium text-gray-500">
                        Tie-breaker note
                      </label>
                      <input
                        type="text"
                        value={tieBreaker}
                        onChange={(e) => setTieBreaker(e.target.value)}
                        placeholder="e.g. Won on penalties (5–4)"
                        className="w-full rounded-lg border border-gray-300 px-3.5 py-2 text-sm text-gray-900 outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                      />
                    </div>
                  </div>
                </div>
              ) : null;
            })()}

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                disabled={actionLoading}
                className="rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:opacity-50"
              >
                {actionLoading ? 'Saving…' : 'Complete Match'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

function ScoreField({
  label,
  value,
  onChange,
  placeholder,
  step,
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  step?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-gray-500">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>
      <input
        type="number"
        min={0}
        step={step}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="w-full rounded-lg border border-gray-300 px-3.5 py-2 text-sm text-gray-900 outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
      />
    </div>
  );
}