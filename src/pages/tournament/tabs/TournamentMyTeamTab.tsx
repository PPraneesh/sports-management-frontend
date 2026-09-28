import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { getMyTeam } from '../../../api/team.api';
import type { TeamResponse } from '../../../types/team.types';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import ErrorAlert from '../../../components/common/ErrorAlert';
import StatusBadge from '../../../components/common/StatusBadge';
import { getApiErrorMessage } from '../../../utils/apiError';
import { formatDateTime } from '../../../utils/date';

interface TournamentMyTeamTabProps {
  tournamentId: number;
  onSwitchToTeamsTab: () => void;
}

export default function TournamentMyTeamTab({
  tournamentId,
  onSwitchToTeamsTab,
}: TournamentMyTeamTabProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [team, setTeam] = useState<TeamResponse | null>(null);

  useEffect(() => {
    let ignore = false;
    const load = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await getMyTeam(tournamentId);
        if (ignore) return;
        setTeam(data);
      } catch (err) {
        if (!ignore) {
          // 404 or not found means user has no team in this tournament
          setError(getApiErrorMessage(err, 'You do not have a registered team in this tournament yet.'));
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      ignore = true;
    };
  }, [tournamentId]);

  if (loading) {
    return <LoadingSpinner message="Checking your team registration..." />;
  }

  if (!team) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center shadow-xs">
        <span className="mx-auto text-4xl">🛡️</span>
        <h3 className="mt-3 text-lg font-bold text-gray-900">
          No Team Registered
        </h3>
        <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
          You don't have a team in this tournament yet. Register your team now to participate, manage your roster, and compete!
        </p>

        <button
          type="button"
          onClick={onSwitchToTeamsTab}
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white shadow-xs transition hover:bg-gray-800"
        >
          <span>➕</span> Register My Team
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && <ErrorAlert message={error} />}

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xs sm:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between border-b border-gray-100 pb-6">
          <div className="flex items-center gap-4">
            {team.logoUrl ? (
              <img
                src={team.logoUrl}
                alt={team.name}
                className="h-16 w-16 rounded-2xl object-cover border border-gray-200 shadow-xs"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 text-xl font-black text-white shadow-xs">
                {team.shortName || team.name.slice(0, 2).toUpperCase()}
              </div>
            )}

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-black text-gray-900">
                  {team.name}
                </h2>
                <StatusBadge status={team.status} />
              </div>
              <p className="mt-1 text-sm font-semibold text-gray-500">
                Code: <span className="text-gray-900">{team.shortName}</span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <Link
              to={`/teams/${team.id}`}
              className="rounded-xl border border-gray-300 px-4 py-2.5 text-xs font-semibold text-gray-700 transition hover:bg-gray-50 shadow-xs"
            >
              Team Overview
            </Link>
            <Link
              to={`/teams/${team.id}/members`}
              className="rounded-xl bg-gray-900 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-gray-800 shadow-xs"
            >
              Manage Members
            </Link>
          </div>
        </div>

        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">
              Team Description
            </h4>
            <p className="mt-2 text-sm text-gray-700 leading-relaxed">
              {team.description || 'No description provided for this team.'}
            </p>
          </div>

          <div className="space-y-3">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                Registration Date
              </span>
              <p className="mt-1 text-sm font-medium text-gray-800">
                {formatDateTime(team.createdAt)}
              </p>
            </div>

            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                Last Status Update
              </span>
              <p className="mt-1 text-sm font-medium text-gray-800">
                {formatDateTime(team.updatedAt)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
