import {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  Link,
  useParams,
} from 'react-router';

import {
  getTournamentMatches,
} from '../../api/match.api';

import {
  getTournamentTeams,
} from '../../api/team.api';

import type {
  MatchResponse,
} from '../../types/match.types';

import type {
  TeamResponse,
} from '../../types/team.types';

import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorAlert from '../../components/common/ErrorAlert';
import StatusBadge from '../../components/common/StatusBadge';

import {
  getApiErrorMessage,
} from '../../utils/apiError';

import {
  formatDateTime,
} from '../../utils/date';


export default function TournamentMatchesPage() {
  const { tournamentId } = useParams();

  const id = Number(tournamentId);


  const [matches, setMatches] =
    useState<MatchResponse[]>([]);

  const [teams, setTeams] =
    useState<TeamResponse[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState('');

  const [
    selectedStatus,
    setSelectedStatus,
  ] = useState('ALL');


  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError('');

        const [
          matchesResponse,
          teamsResponse,
        ] = await Promise.all([
          getTournamentMatches(id),
          getTournamentTeams(id),
        ]);

        setMatches(matchesResponse);
        setTeams(teamsResponse);

      } catch (error) {
        setError(
          getApiErrorMessage(
            error,
            'Unable to load tournament fixtures.'
          )
        );
      } finally {
        setLoading(false);
      }
    };


    if (
      tournamentId &&
      !Number.isNaN(id)
    ) {
      load();
    }
  }, [tournamentId, id]);


  const teamMap = useMemo(() => {
    const map = new Map<number, string>();

    teams.forEach((team) => {
      map.set(team.id, team.name);
    });

    return map;
  }, [teams]);


  const filteredMatches = useMemo(() => {
    if (selectedStatus === 'ALL') {
      return matches;
    }

    return matches.filter(
      (match) =>
        match.status === selectedStatus
    );
  }, [matches, selectedStatus]);


  return (
    <div className="space-y-6">

      <div>

        <Link
          to={`/tournaments/${id}`}
          className="text-sm font-medium text-gray-500 hover:text-gray-900"
        >
          ← Back to tournament
        </Link>

        <div className="mt-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Fixtures
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Tournament matches and current status.
            </p>
          </div>


          <select
            value={selectedStatus}
            onChange={(event) =>
              setSelectedStatus(
                event.target.value
              )
            }
            className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-gray-900"
          >
            <option value="ALL">
              All Matches
            </option>

            <option value="SCHEDULED">
              Scheduled
            </option>

            <option value="LIVE">
              Live
            </option>

            <option value="POSTPONED">
              Postponed
            </option>

            <option value="COMPLETED">
              Completed
            </option>
          </select>

        </div>

      </div>


      {error && (
        <ErrorAlert message={error} />
      )}


      {loading ? (
        <LoadingSpinner message="Loading fixtures..." />
      ) : filteredMatches.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center">

          <h2 className="font-semibold text-gray-900">
            No matches found
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            Fixtures will appear here after they are generated.
          </p>

        </div>
      ) : (
        <div className="space-y-4">

          {filteredMatches
            .sort(
              (a, b) =>
                a.roundNumber -
                b.roundNumber ||
                a.matchNumber -
                b.matchNumber
            )
            .map((match) => (
              <MatchCard
                key={match.id}
                match={match}
                teamMap={teamMap}
              />
            ))}

        </div>
      )}

    </div>
  );
}


interface MatchCardProps {
  match: MatchResponse;
  teamMap: Map<number, string>;
}


function MatchCard({
  match,
  teamMap,
}: MatchCardProps) {
  const teamA =
    teamMap.get(match.teamAId) ??
    `Team #${match.teamAId}`;

  const teamB =
    teamMap.get(match.teamBId) ??
    `Team #${match.teamBId}`;


  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">

      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

        <div className="min-w-0">

          <div className="flex flex-wrap items-center gap-3">

            <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">
              {match.matchType.replaceAll('_', ' ')}
            </span>

            <span className="text-xs text-gray-400">
              Round {match.roundNumber}
            </span>

            <span className="text-xs text-gray-400">
              Match {match.matchNumber}
            </span>

            <StatusBadge status={match.status} />

          </div>


          <div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-center gap-4">

            <div className="text-right">
              <p className="font-semibold text-gray-900">
                {teamA}
              </p>

              <p className="mt-1 text-2xl font-bold text-gray-900">
                {match.teamAScore ?? '-'}
              </p>
            </div>


            <span className="text-sm font-medium text-gray-400">
              VS
            </span>


            <div>
              <p className="font-semibold text-gray-900">
                {teamB}
              </p>

              <p className="mt-1 text-2xl font-bold text-gray-900">
                {match.teamBScore ?? '-'}
              </p>
            </div>

          </div>


          <p className="mt-4 text-sm text-gray-500">
            {formatDateTime(match.scheduledAt)}
          </p>

        </div>


        <div className="flex gap-3">

          <Link
            to={`/matches/${match.id}`}
            className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            Details
          </Link>


          <Link
            to={`/matches/${match.id}/manage`}
            className="rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-gray-800"
          >
            Manage
          </Link>

        </div>

      </div>

    </div>
  );
}