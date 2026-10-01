import { Link, useNavigate, useLocation } from 'react-router';
import type { TournamentResponse } from '../../types/tournament.types';
import StatusBadge from '../common/StatusBadge';
import { formatDate } from '../../utils/date';
import { useAppSelector } from '../../app/hooks';
import { TournamentStatus } from '../../types/enums';
import { LuMapPin } from 'react-icons/lu';

interface TournamentCardProps {
  tournament: TournamentResponse;
  linkTo?: string;
  isPublic?: boolean;
  onRegisterClick?: (tournament: TournamentResponse) => void;
}

export default function TournamentCard({
  tournament,
  linkTo,
  isPublic = false,
  onRegisterClick,
}: TournamentCardProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  const targetHref =
    linkTo ??
    (isPublic
      ? `/public/tournaments/${tournament.publicSlug}`
      : `/tournaments/${tournament.id}`);

  const isOpenForRegistration =
    tournament.status === TournamentStatus.OPEN ||
    tournament.status === ('REGISTRATION_OPEN' as unknown as TournamentStatus);

  return (
    <div className="group relative flex flex-col justify-between rounded-2xl border border-gray-200 bg-white p-5 shadow-xs transition duration-200 hover:-translate-y-1 hover:border-gray-300 hover:shadow-md">
      {/* Clickable Header & Details */}
      <Link to={targetHref} className="block">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <span className="inline-block rounded-md bg-blue-50 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider text-blue-700">
              {tournament.sportType}
            </span>
            <h3 className="mt-2 text-base font-bold text-gray-900 group-hover:text-blue-600 transition">
              {tournament.name}
            </h3>
          </div>
          <StatusBadge status={tournament.status} />
        </div>

        {tournament.description && (
          <p className="mt-2 line-clamp-2 text-sm text-gray-500">
            {tournament.description}
          </p>
        )}

        <div className="mt-5 space-y-2 border-t border-gray-100 pt-4 text-xs text-gray-600">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-gray-500">
              <LuMapPin className="h-4 w-4 shrink-0" />
              <span className="truncate max-w-[150px]">{tournament.location || 'Location TBD'}</span>
            </span>

            <span className="font-medium text-gray-700">
              Max {tournament.maximumTeams} teams
            </span>
          </div>

          <div className="flex items-center justify-between text-gray-500">
            <span>Starts: {formatDate(tournament.startDate)}</span>
            <span className="rounded bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-600 uppercase">
              {tournament.visibility}
            </span>
          </div>
        </div>
      </Link>

      {/* Public Action Area */}
      {isPublic && (
        <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
          {isAuthenticated ? (
            isOpenForRegistration ? (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onRegisterClick?.(tournament);
                }}
                className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-blue-500"
              >
                <span>➕</span> Register Team
              </button>
            ) : (
              <span className="text-xs font-semibold text-gray-400">
                Registration Closed
              </span>
            )
          ) : (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                navigate('/login', { state: { from: location } });
              }}
              className="inline-flex items-center gap-1.5 rounded-xl border border-gray-300 bg-gray-50 px-3.5 py-2 text-xs font-bold text-gray-700 transition hover:bg-gray-100"
            >
              <span>🔒</span> Sign In to Register
            </button>
          )}

          <Link
            to={targetHref}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition"
          >
            Details →
          </Link>
        </div>
      )}
    </div>
  );
}
