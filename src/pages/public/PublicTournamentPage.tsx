import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router';
import { getPublicTournament } from '../../api/public.api';
import type { PublicTournamentStatsResponse } from '../../types/public.types';
import type { TeamResponse } from '../../types/team.types';
import PublicStatCard from './PublicStatCard';
import PublicGroupCard from './PublicGroupCard';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorAlert from '../../components/common/ErrorAlert';
import RegisterTeamModal from '../../components/tournament/RegisterTeamModal';
import { getApiErrorMessage } from '../../utils/apiError';
import { useAppSelector } from '../../app/hooks';

export default function PublicTournamentPage() {
  const { slug } = useParams();
  const location = useLocation();
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  const [data, setData] = useState<PublicTournamentStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [registeredTeam, setRegisteredTeam] = useState<TeamResponse | null>(null);

  useEffect(() => {
    if (!slug) return;

    const loadTournament = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await getPublicTournament(slug);
        setData(res);
      } catch (err) {
        setError(getApiErrorMessage(err, 'Failed to load tournament information.'));
      } finally {
        setLoading(false);
      }
    };

    loadTournament();
  }, [slug]);

  if (loading) {
    return <LoadingSpinner message="Loading tournament details & standings..." />;
  }

  if (error || !data) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12">
        <ErrorAlert message={error || 'Tournament not found.'} />
        <div className="mt-4 text-center">
          <Link
            to="/tournaments/public"
            className="inline-flex items-center rounded-xl bg-gray-900 px-5 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-gray-800 transition"
          >
            ← Back to Public Tournaments
          </Link>
        </div>
      </div>
    );
  }

  const isOpenForRegistration =
    data.status === 'OPEN' || data.status === 'REGISTRATION_OPEN';

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Registration Success Notification */}
      {registeredTeam && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-900 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🎉</span>
            <div>
              <p className="text-sm font-bold">
                Your team "{registeredTeam.name}" has been registered!
              </p>
              <p className="text-xs text-emerald-700">
                You are ready to compete in {data.name}. You can manage team members from your dashboard.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setRegisteredTeam(null)}
            className="rounded-lg bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800 hover:bg-emerald-200 transition"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Tournament Header */}
      <div className="rounded-3xl border border-gray-200 bg-white p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-md bg-blue-50 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider text-blue-700">
                {data.sportType}
              </span>
              <StatusBadge status={data.status} />
              <span className="rounded bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600 uppercase">
                {data.format?.replace('_', ' ')}
              </span>
            </div>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              {data.name}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Current Stage:{' '}
              <span className="font-semibold text-gray-800">
                {data.currentStage || 'Stage Pending'}
              </span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Registration CTA */}
            {isAuthenticated ? (
              isOpenForRegistration && (
                <button
                  type="button"
                  onClick={() => setIsRegisterModalOpen(true)}
                  className="rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-blue-500"
                >
                  ➕ Register Team
                </button>
              )
            ) : (
              <Link
                to="/login"
                state={{ from: location }}
                className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-2.5 text-xs font-bold text-blue-700 transition hover:bg-blue-100 flex items-center gap-1.5"
              >
                <span>🔒</span> Sign In to Register Team
              </Link>
            )}

            <Link
              to="/tournaments/public"
              className="rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 text-center transition"
            >
              ← All Tournaments
            </Link>
          </div>
        </div>

        {/* Champion announcement if tournament is completed */}
        {data.championTeamName && (
          <div className="mt-6 flex items-center gap-4 rounded-2xl bg-amber-50 border border-amber-200 p-4">
            <span className="text-3xl">🏆</span>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-amber-700">
                Tournament Champion
              </p>
              <p className="text-lg font-extrabold text-amber-950">
                {data.championTeamName}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
        <PublicStatCard label="Total Teams" value={data.totalTeams} />
        <PublicStatCard label="Total Matches" value={data.totalMatches} />
        <PublicStatCard label="Live Matches" value={data.liveMatches} />
        <PublicStatCard label="Upcoming Matches" value={data.upcomingMatches} />
        <PublicStatCard label="Completed Matches" value={data.completedMatches} />
      </div>

      {/* Group Standings */}
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Group Standings</h2>
          <p className="text-sm text-gray-500">
            Points, scores, and qualification tables for each group.
          </p>
        </div>

        {data.groups && data.groups.length > 0 ? (
          <div className="space-y-6">
            {data.groups.map((group) => (
              <PublicGroupCard key={group.groupId} group={group} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center shadow-xs">
            <p className="text-sm text-gray-500">
              No groups or standings generated for this tournament yet.
            </p>
          </div>
        )}
      </div>

      {/* Register Team Modal */}
      {data && (
        <RegisterTeamModal
          isOpen={isRegisterModalOpen}
          tournament={{
            id: data.tournamentId,
            name: data.name,
            sportType: data.sportType,
          }}
          onClose={() => setIsRegisterModalOpen(false)}
          onSuccess={(team) => {
            setRegisteredTeam(team);
          }}
        />
      )}
    </div>
  );
}
