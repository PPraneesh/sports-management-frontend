import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';
import { getPublicMatch } from '../../api/public.api';
import type { PublicMatchResponse } from '../../types/public.types';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorAlert from '../../components/common/ErrorAlert';
import { getApiErrorMessage } from '../../utils/apiError';
import { formatDateTime } from '../../utils/date';

export default function PublicMatchPage() {
  const { slug, matchCode } = useParams();
  const [match, setMatch] = useState<PublicMatchResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!slug || !matchCode) return;

    const loadMatch = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await getPublicMatch(slug, matchCode);
        setMatch(res);
      } catch (err) {
        setError(getApiErrorMessage(err, 'Failed to load match details.'));
      } finally {
        setLoading(false);
      }
    };

    loadMatch();
  }, [slug, matchCode]);

  if (loading) {
    return <LoadingSpinner message="Loading match details..." />;
  }

  if (error || !match) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12">
        <ErrorAlert message={error || 'Match not found.'} />
        <div className="mt-4 text-center">
          <Link
            to={slug ? `/t/${slug}` : '/tournaments/public'}
            className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white shadow-xs hover:bg-gray-800"
          >
            ← Back to Tournament
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      <div className="flex items-center justify-between">
        <Link
          to={`/t/${slug}`}
          className="text-sm font-medium text-blue-600 hover:text-blue-500"
        >
          ← Back to Tournament
        </Link>
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-semibold text-gray-500">
            {match.matchCode}
          </span>
          <StatusBadge status={match.status} />
        </div>
      </div>

      {/* Main Match Scoreboard */}
      <div className="rounded-3xl border border-gray-200 bg-white p-6 sm:p-10 shadow-sm text-center">
        <div className="mb-6">
          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-gray-600">
            {match.matchType.replace('_', ' ')}
            {match.groupName ? ` • ${match.groupName}` : ''}
          </span>
        </div>

        <div className="grid grid-cols-1 items-center gap-8 sm:grid-cols-3">
          {/* Team A */}
          <div className="flex flex-col items-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gray-100 text-2xl font-black text-gray-700">
              {match.teamAName.slice(0, 2).toUpperCase()}
            </div>
            <h2 className="mt-3 text-xl font-bold text-gray-900">{match.teamAName}</h2>
            {match.teamARunRate !== null && (
              <p className="mt-1 text-xs text-gray-500">
                Run Rate: {match.teamARunRate.toFixed(2)}
              </p>
            )}
            <span className="mt-4 text-4xl font-extrabold text-gray-900">
              {match.teamAScore ?? '-'}
            </span>
          </div>

          {/* VS & Winner */}
          <div className="flex flex-col items-center justify-center">
            <span className="text-xl font-black text-gray-300">VS</span>
            {match.winnerTeamName && (
              <div className="mt-3 rounded-full bg-green-50 border border-green-200 px-3 py-1 text-xs font-semibold text-green-700">
                Winner: {match.winnerTeamName}
              </div>
            )}
            {match.tieBreakerDescription && (
              <p className="mt-2 text-xs italic text-gray-500">
                {match.tieBreakerDescription}
              </p>
            )}
          </div>

          {/* Team B */}
          <div className="flex flex-col items-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gray-100 text-2xl font-black text-gray-700">
              {match.teamBName.slice(0, 2).toUpperCase()}
            </div>
            <h2 className="mt-3 text-xl font-bold text-gray-900">{match.teamBName}</h2>
            {match.teamBRunRate !== null && (
              <p className="mt-1 text-xs text-gray-500">
                Run Rate: {match.teamBRunRate.toFixed(2)}
              </p>
            )}
            <span className="mt-4 text-4xl font-extrabold text-gray-900">
              {match.teamBScore ?? '-'}
            </span>
          </div>
        </div>

        {/* Schedule Info */}
        <div className="mt-10 border-t border-gray-100 pt-6 text-sm text-gray-500">
          <p>
            Scheduled for:{' '}
            <span className="font-semibold text-gray-900">
              {formatDateTime(match.scheduledAt)}
            </span>
          </p>
          {match.startedAt && (
            <p className="mt-1 text-xs">
              Started at: {formatDateTime(match.startedAt)}
            </p>
          )}
          {match.completedAt && (
            <p className="mt-1 text-xs">
              Completed at: {formatDateTime(match.completedAt)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}