import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router';
import { getPublicTournaments } from '../../api/tournament.api';
import type { TournamentResponse } from '../../types/tournament.types';
import type { TeamResponse } from '../../types/team.types';
import TournamentCard from '../../components/tournament/TournamentCard';
import RegisterTeamModal, {
  type RegisterTeamTournamentInfo,
} from '../../components/tournament/RegisterTeamModal';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import ErrorAlert from '../../components/common/ErrorAlert';
import EmptyState from '../../components/common/EmptyState';
import { getApiErrorMessage } from '../../utils/apiError';
import { useAppSelector } from '../../app/hooks';

export default function PublicTournamentsPage() {
  const [tournaments, setTournaments] = useState<TournamentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [selectedSport, setSelectedSport] = useState('ALL');

  // Registration modal state
  const [selectedTournament, setSelectedTournament] = useState<TournamentResponse | null>(null);
  const [registeredSuccess, setRegisteredSuccess] = useState<{
    team: TeamResponse;
    tournament: RegisterTeamTournamentInfo;
  } | null>(null);

  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const location = useLocation();

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await getPublicTournaments();
        setTournaments(data);
      } catch (err) {
        setError(getApiErrorMessage(err, 'Failed to load public tournaments.'));
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const sportsList = useMemo(() => {
    const sports = new Set(tournaments.map((t) => t.sportType));
    return ['ALL', ...Array.from(sports)];
  }, [tournaments]);

  const filteredTournaments = useMemo(() => {
    return tournaments.filter((item) => {
      const matchesSport =
        selectedSport === 'ALL' || item.sportType === selectedSport;
      const matchesSearch =
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.location.toLowerCase().includes(search.toLowerCase()) ||
        item.sportType.toLowerCase().includes(search.toLowerCase());

      return matchesSport && matchesSearch;
    });
  }, [tournaments, selectedSport, search]);

  const handleOpenRegisterModal = (tournament: TournamentResponse) => {
    setSelectedTournament(tournament);
  };

  const handleRegistrationSuccess = (
    team: TeamResponse,
    tournament: RegisterTeamTournamentInfo
  ) => {
    setRegisteredSuccess({ team, tournament });
  };

  return (
    <div className="space-y-6">
      {/* Registration Success Banner */}
      {registeredSuccess && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-900 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🎉</span>
            <div>
              <p className="text-sm font-bold">
                Team "{registeredSuccess.team.name}" registered successfully!
              </p>
              <p className="text-xs text-emerald-700">
                You are registered for {registeredSuccess.tournament.name}. You can manage team members from your dashboard.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setRegisteredSuccess(null)}
            className="rounded-lg bg-emerald-100 px-3 py-1.5 text-xs font-semibold text-emerald-800 hover:bg-emerald-200 transition"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Conditional Rendering Authentication Callout */}
      {!isAuthenticated ? (
        <div className="relative overflow-hidden rounded-3xl border border-blue-200 bg-gradient-to-r from-blue-900 to-indigo-900 p-6 sm:p-8 text-white shadow-lg">
          <div className="relative z-10 max-w-2xl">
            <span className="rounded-full bg-blue-400/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-blue-200">
              Player & Organizer Notice
            </span>
            <h2 className="mt-3 text-2xl font-black sm:text-3xl">
              Ready to enter a tournament?
            </h2>
            <p className="mt-2 text-sm text-blue-100 sm:text-base leading-relaxed">
              To register your team, submit rosters, and track live fixtures, you need to sign in. Browsing tournaments is open to everyone!
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <Link
                to="/login"
                state={{ from: location }}
                className="rounded-xl bg-white px-5 py-2.5 text-xs font-bold text-gray-900 shadow-xs transition hover:bg-gray-100"
              >
                Sign In to Register
              </Link>
              <Link
                to="/register"
                className="rounded-xl border border-blue-400/40 bg-blue-800/40 px-5 py-2.5 text-xs font-bold text-white backdrop-blur-xs transition hover:bg-blue-700/50"
              >
                Create Account
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-xl font-bold text-blue-600">
              👋
            </span>
            <div>
              <p className="text-sm font-bold text-gray-900">
                Welcome back, {user?.name}!
              </p>
              <p className="text-xs text-gray-500">
                Select any open tournament below to register your team directly.
              </p>
            </div>
          </div>

          <Link
            to="/tournaments/new"
            className="rounded-xl bg-gray-900 px-4 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-gray-800 text-center"
          >
            + Create New Tournament
          </Link>
        </div>
      )}

      {error && <ErrorAlert message={error} onClose={() => setError('')} />}

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between shadow-xs">
        <div className="flex-1 max-w-md">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by tournament name, sport, or venue..."
            className="w-full rounded-xl border border-gray-300 px-3.5 py-2 text-xs sm:text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
          />
        </div>

        {/* Sport Type Filters */}
        <div className="flex flex-wrap items-center gap-1.5">
          {sportsList.map((sport) => (
            <button
              key={sport}
              type="button"
              onClick={() => setSelectedSport(sport)}
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                selectedSport === sport
                  ? 'bg-gray-900 text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {sport}
            </button>
          ))}
        </div>
      </div>

      {/* Tournaments Grid */}
      {loading ? (
        <LoadingSkeleton count={6} />
      ) : filteredTournaments.length === 0 ? (
        <EmptyState
          title="No tournaments found"
          description="There are currently no public tournaments matching your filters. Check back soon or try another sport."
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredTournaments.map((tournament) => (
            <TournamentCard
              key={tournament.id}
              tournament={tournament}
              isPublic={true}
              onRegisterClick={handleOpenRegisterModal}
            />
          ))}
        </div>
      )}

      {/* Register Team Modal */}
      <RegisterTeamModal
        isOpen={!!selectedTournament}
        tournament={selectedTournament}
        onClose={() => setSelectedTournament(null)}
        onSuccess={handleRegistrationSuccess}
      />
    </div>
  );
}
