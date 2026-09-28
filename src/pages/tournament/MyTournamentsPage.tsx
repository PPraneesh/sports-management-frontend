import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import { getMyTournaments } from '../../api/tournament.api';
import type { TournamentResponse } from '../../types/tournament.types';
import TournamentCard from '../../components/tournament/TournamentCard';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import ErrorAlert from '../../components/common/ErrorAlert';
import EmptyState from '../../components/common/EmptyState';
import { getApiErrorMessage } from '../../utils/apiError';

const STATUS_TABS = [
  { label: 'All', value: 'ALL' },
  { label: 'Open', value: 'OPEN' },
  { label: 'In Progress', value: 'IN_PROGRESS' },
  { label: 'Fixtures Generated', value: 'FIXTURES_GENERATED' },
  { label: 'Registration Closed', value: 'REGISTRATION_CLOSED' },
  { label: 'Draft', value: 'DRAFT' },
  { label: 'Completed', value: 'COMPLETED' },
];

export default function MyTournamentsPage() {
  const [tournaments, setTournaments] = useState<TournamentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('ALL');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await getMyTournaments();
        setTournaments(data);
      } catch (err) {
        setError(getApiErrorMessage(err, 'Failed to fetch tournaments.'));
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const filteredTournaments = useMemo(() => {
    return tournaments.filter((item) => {
      const matchesTab =
        activeTab === 'ALL' ? true : item.status === activeTab;
      const matchesSearch =
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.sportType.toLowerCase().includes(search.toLowerCase()) ||
        item.location.toLowerCase().includes(search.toLowerCase());

      return matchesTab && matchesSearch;
    });
  }, [tournaments, activeTab, search]);

  return (
    <div className="space-y-6">
      {/* Page Title & Action */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            My Tournaments
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            View and manage all tournaments you are organizing
          </p>
        </div>

        <Link
          to="/tournaments/new"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white shadow-xs transition hover:bg-gray-800"
        >
          <span>+</span> Create Tournament
        </Link>
      </div>

      {error && <ErrorAlert message={error} onClose={() => setError('')} />}

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1 max-w-md">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tournaments by name, sport, or venue..."
            className="w-full rounded-lg border border-gray-300 px-3.5 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
          />
        </div>

        {/* Tab Filters */}
        <div className="flex flex-wrap gap-1.5">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setActiveTab(tab.value)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                activeTab === tab.value
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tournaments Grid */}
      {loading ? (
        <LoadingSkeleton count={6} />
      ) : filteredTournaments.length === 0 ? (
        <EmptyState
          title={search || activeTab !== 'ALL' ? 'No matching tournaments' : 'No tournaments created'}
          description={
            search || activeTab !== 'ALL'
              ? 'Try adjusting your search criteria or switching the status filter.'
              : 'You have not created any tournaments yet. Get started by clicking the button below.'
          }
          actionText={!search && activeTab === 'ALL' ? 'Create Tournament' : undefined}
          actionHref="/tournaments/new"
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredTournaments.map((tournament) => (
            <TournamentCard key={tournament.id} tournament={tournament} />
          ))}
        </div>
      )}
    </div>
  );
}
