import {
  useEffect,
  useState,
} from 'react';

import {
  Link,
  useParams,
} from 'react-router';

import {
  getMatchById,
} from '../../api/match.api';

import type {
  MatchResponse,
} from '../../types/match.types';

import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorAlert from '../../components/common/ErrorAlert';
import StatusBadge from '../../components/common/StatusBadge';

import {
  getApiErrorMessage,
} from '../../utils/apiError';

import {
  formatDateTime,
} from '../../utils/date';


export default function MatchDetailsPage() {
  const { matchId } = useParams();

  const id = Number(matchId);


  const [match, setMatch] =
    useState<MatchResponse | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState('');


  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError('');

        const data =
          await getMatchById(id);

        setMatch(data);

      } catch (error) {
        setError(
          getApiErrorMessage(
            error,
            'Unable to load match.'
          )
        );
      } finally {
        setLoading(false);
      }
    };


    if (
      matchId &&
      !Number.isNaN(id)
    ) {
      load();
    }
  }, [matchId, id]);


  if (loading) {
    return (
      <LoadingSpinner message="Loading match..." />
    );
  }


  if (!match) {
    return (
      <ErrorAlert
        message={
          error || 'Match not found.'
        }
      />
    );
  }


  return (
    <div className="space-y-6">

      {error && (
        <ErrorAlert message={error} />
      )}


      <Link
        to={`/tournaments/${match.tournamentId}/matches`}
        className="text-sm font-medium text-gray-500 hover:text-gray-900"
      >
        ← Fixtures
      </Link>


      <div className="rounded-2xl border border-gray-200 bg-white p-6 md:p-8">

        <div className="flex flex-col items-center">

          <div className="flex flex-wrap items-center justify-center gap-3">
            <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">
              {match.matchType.replaceAll('_', ' ')}
            </span>

            <StatusBadge
              status={match.status}
            />
          </div>


          <p className="mt-3 text-sm text-gray-500">
            {match.matchCode}
          </p>


          <div className="mt-8 grid w-full max-w-2xl grid-cols-[1fr_auto_1fr] items-center gap-6">

            <div className="text-right">
              <p className="text-lg font-semibold text-gray-900">
                Team #{match.teamAId}
              </p>

              <p className="mt-2 text-5xl font-bold text-gray-900">
                {match.teamAScore ?? '-'}
              </p>

              {match.teamARunRate !== null && (
                <p className="mt-2 text-sm text-gray-500">
                  Run rate: {match.teamARunRate}
                </p>
              )}
            </div>


            <span className="text-lg font-semibold text-gray-300">
              VS
            </span>


            <div>
              <p className="text-lg font-semibold text-gray-900">
                Team #{match.teamBId}
              </p>

              <p className="mt-2 text-5xl font-bold text-gray-900">
                {match.teamBScore ?? '-'}
              </p>

              {match.teamBRunRate !== null && (
                <p className="mt-2 text-sm text-gray-500">
                  Run rate: {match.teamBRunRate}
                </p>
              )}
            </div>

          </div>


          <div className="mt-8 grid w-full max-w-2xl gap-4 border-t border-gray-100 pt-6 sm:grid-cols-2">

            <Info
              label="Scheduled"
              value={formatDateTime(match.scheduledAt)}
            />

            <Info
              label="Original Schedule"
              value={formatDateTime(match.originalScheduledAt)}
            />

            <Info
              label="Started"
              value={formatDateTime(match.startedAt)}
            />

            <Info
              label="Completed"
              value={formatDateTime(match.completedAt)}
            />

          </div>


          {match.winnerTeamId !== null && (
            <div className="mt-6 rounded-lg bg-green-50 px-5 py-3 text-sm font-semibold text-green-700">
              Winner: Team #{match.winnerTeamId}
            </div>
          )}


          {match.tieBreakerDescription && (
            <div className="mt-4 rounded-lg bg-gray-50 px-5 py-4 text-sm text-gray-600">
              <span className="font-semibold text-gray-900">
                Tie-breaker:
              </span>{' '}
              {match.tieBreakerDescription}
            </div>
          )}

        </div>

      </div>

    </div>
  );
}


function Info({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
        {label}
      </p>

      <p className="mt-1 text-sm font-medium text-gray-900">
        {value}
      </p>
    </div>
  );
}