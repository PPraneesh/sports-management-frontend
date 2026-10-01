import { useEffect, useState } from 'react';
import { Link } from 'react-router';

import { getMyTeams } from '../../api/team.api';
import type { MyTeamSummary } from '../../types/team.types';

import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorAlert from '../../components/common/ErrorAlert';
import EmptyState from '../../components/common/EmptyState';
import { LuUsers, LuTrophy, LuCalendar, LuEye } from 'react-icons/lu';

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
          icon={<LuUsers className="h-7 w-7" />}
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


      {/* Tournament details */}
      <div className="mt-4 rounded-lg bg-gray-50 px-3 py-3 space-y-2">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
          <LuTrophy className="h-3.5 w-3.5" />
          Tournament
        </div>
        <p className="text-sm font-semibold text-gray-800 leading-tight">
          {team.tournament.name}
        </p>
        <div className="flex flex-wrap gap-2">
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
              team.tournament.visibility === 'PUBLIC'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-purple-100 text-purple-700'
            }`}
          >
            <LuEye className="h-3 w-3" />
            {team.tournament.visibility === 'PUBLIC' ? 'Public' : 'Private'}
          </span>
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
              team.tournament.status === 'OPEN'
                ? 'bg-green-100 text-green-700'
                : team.tournament.status === 'REGISTRATION_CLOSED'
                ? 'bg-orange-100 text-orange-700'
                : 'bg-gray-100 text-gray-500'
            }`}
          >
            <LuCalendar className="h-3 w-3" />
            {team.tournament.status.replace(/_/g, ' ')}
          </span>
        </div>
      </div>

      {/* Meta */}
      <div className="mt-3 space-y-1 text-xs text-gray-500">
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
        <p>
          <span className="font-medium text-gray-700">Max Teams:</span>{' '}
          {team.tournament.maximumTeams}
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
