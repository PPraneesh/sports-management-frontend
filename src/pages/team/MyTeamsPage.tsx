import { useEffect, useState } from 'react';
import { Link } from 'react-router';

import { getMyTeams } from '../../api/team.api';
import type { MyTeamSummary } from '../../types/team.types';

import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorAlert from '../../components/common/ErrorAlert';
import EmptyState from '../../components/common/EmptyState';

import { getApiErrorMessage } from '../../utils/apiError';


export default function MyTeamsPage() {
  const [teams, setTeams] = useState<MyTeamSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');


  useEffect(() => {
    let ignore = false;

    const load = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await getMyTeams();
        if (!ignore) setTeams(data);
      } catch (err) {
        if (!ignore) setError(getApiErrorMessage(err, 'Failed to load your teams.'));
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    load();

    return () => {
      ignore = true;
    };
  }, []);


  if (loading) {
    return <LoadingSpinner message="Loading your teams..." />;
  }


  return (
    <div className="space-y-6">

      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
          My Teams
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          All the teams you are currently a member of.
        </p>
      </div>


      {error && <ErrorAlert message={error} onClose={() => setError('')} />}


      {!error && teams.length === 0 ? (
        <EmptyState
          title="No active teams"
          description="You are not currently part of any active team."
          icon={
            <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
            </svg>
          }
        />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {teams.map((team) => (
            <MyTeamCard key={team.teamId} team={team} />
          ))}
        </div>
      )}

    </div>
  );
}


interface MyTeamCardProps {
  team: MyTeamSummary;
}

function MyTeamCard({ team }: MyTeamCardProps) {
  const isCaptain = team.memberRole === 'CAPTAIN';

  return (
    <div className="flex flex-col rounded-xl border border-gray-200 bg-white p-5 transition hover:border-gray-300 hover:shadow-md">

      {/* Logo + Name row */}
      <div className="flex items-start gap-4">

        {team.logoUrl ? (
          <img
            src={team.logoUrl}
            alt={`${team.teamName} logo`}
            className="h-14 w-14 rounded-xl border border-gray-200 object-cover"
          />
        ) : (
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-lg font-bold text-gray-600">
            {team.shortName.slice(0, 2).toUpperCase()}
          </div>
        )}

        <div className="min-w-0 flex-1">

          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate font-semibold text-gray-900">
              {team.teamName}
            </h3>

            <span
              className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                team.teamStatus === 'ACTIVE'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-500'
              }`}
            >
              {team.teamStatus === 'ACTIVE' ? 'Active' : 'Withdrawn'}
            </span>
          </div>

          <p className="mt-0.5 text-sm text-gray-500">{team.shortName}</p>

        </div>
      </div>


      {/* Meta */}
      <div className="mt-4 space-y-1.5 text-xs text-gray-500">
        <p>
          <span className="font-medium text-gray-700">Tournament:</span>{' '}
          #{team.tournamentId}
        </p>
        <p>
          <span className="font-medium text-gray-700">Role:</span>{' '}
          <span
            className={`font-semibold ${
              isCaptain ? 'text-blue-600' : 'text-gray-700'
            }`}
          >
            {isCaptain ? 'Captain' : 'Player'}
          </span>
        </p>
      </div>


      {/* Action */}
      <div className="mt-5 pt-4 border-t border-gray-100">
        <Link
          to={`/my-teams/${team.teamId}`}
          className={`block w-full rounded-lg px-4 py-2.5 text-center text-sm font-semibold transition ${
            isCaptain
              ? 'bg-gray-900 text-white hover:bg-gray-800'
              : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
        >
          {isCaptain ? 'Manage Team' : 'View Team'}
        </Link>
      </div>

    </div>
  );
}
