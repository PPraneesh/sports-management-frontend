import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { useAppSelector } from '../../app/hooks';
import { getMyTournaments } from '../../api/tournament.api';
import type { TournamentResponse } from '../../types/tournament.types';
import TournamentCard from '../../components/tournament/TournamentCard';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import ErrorAlert from '../../components/common/ErrorAlert';
import EmptyState from '../../components/common/EmptyState';
import { getApiErrorMessage } from '../../utils/apiError';

export default function DashboardPage() {
  const user = useAppSelector((state) => state.auth.user);
  const [tournaments, setTournaments] = useState<TournamentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await getMyTournaments();
        setTournaments(data);
      } catch (err) {
        setError(getApiErrorMessage(err, 'Failed to load your tournaments.'));
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const totalTournaments = tournaments.length;
  const openTournaments = tournaments.filter((t) => t.status === 'OPEN').length;
  const inProgressTournaments = tournaments.filter((t) => t.status === 'IN_PROGRESS').length;
  const completedTournaments = tournaments.filter((t) => t.status === 'COMPLETED').length;

  const recentTournaments = tournaments.slice(0, 6);

  return (
    <div className="space-y-8">
      {/* Header section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            Welcome back, {user?.name ?? 'Organizer'}!
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Here is what is happening across your sports tournaments.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/tournaments/public"
            className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-xs transition hover:bg-gray-50"
          >
            Browse Public
          </Link>
          <Link
            to="/tournaments/new"
            className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white shadow-xs transition hover:bg-gray-800"
          >
            <span>+</span> Create Tournament
          </Link>
        </div>
      </div>

      {error && <ErrorAlert message={error} onClose={() => setError('')} />}

      {/* Metric Stats Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs">
          <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
            Total Tournaments
          </p>
          <p className="mt-2 text-3xl font-extrabold text-gray-900">
            {loading ? '-' : totalTournaments}
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs">
          <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
            Registration Open
          </p>
          <p className="mt-2 text-3xl font-extrabold text-green-600">
            {loading ? '-' : openTournaments}
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs">
          <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
            In Progress
          </p>
          <p className="mt-2 text-3xl font-extrabold text-blue-600">
            {loading ? '-' : inProgressTournaments}
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs">
          <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
            Completed
          </p>
          <p className="mt-2 text-3xl font-extrabold text-emerald-600">
            {loading ? '-' : completedTournaments}
          </p>
        </div>
      </div>

      {/* Recent Tournaments Section */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">Your Tournaments</h2>
          {tournaments.length > 6 && (
            <Link
              to="/tournaments"
              className="text-sm font-medium text-blue-600 hover:text-blue-500"
            >
              View all ({tournaments.length}) →
            </Link>
          )}
        </div>

        {loading ? (
          <LoadingSkeleton count={3} />
        ) : recentTournaments.length === 0 ? (
          <EmptyState
            title="No tournaments yet"
            description="Get started by creating your first sports tournament or browsing available public events."
            actionText="Create Tournament"
            actionHref="/tournaments/new"
          />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {recentTournaments.map((tournament) => (
              <TournamentCard key={tournament.id} tournament={tournament} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
