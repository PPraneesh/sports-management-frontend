import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';

import {
  getPublicTournaments,
  getPublicTournamentDetails,
  getPublicTournamentStats,
  getTournamentMatches,
  getPublicMatch,
  getTournamentTeams,
  getTeamMembers,
} from '../../api/public.api';

import type {
  PublicTournamentStatsResponse,
  PublicMatchResponse,
} from '../../types/public.types';
import type { TournamentResponse } from '../../types/tournament.types';
import type { MatchResponse } from '../../types/match.types';
import type { TeamResponse, TeamMemberResponse } from '../../types/team.types';

import PublicStatCard from './PublicStatCard';
import PublicGroupCard from './PublicGroupCard';
import StatusBadge from '../../components/common/StatusBadge';
import { getApiErrorMessage } from '../../utils/apiError';
import { formatDate, formatDateTime } from '../../utils/date';
import {
  LuX,
  LuChevronDown,
  LuMapPin,
  LuCalendar,
  LuUsers,
  LuClipboard,
  LuCheck,
  LuZap,
  LuClock,
  LuTrophy,
} from 'react-icons/lu';

// ---------------------------------------------------------------------------
// Match Detail Modal (Powered by API 5: /api/public/tournaments/{slug}/matches/{matchCode})
// ---------------------------------------------------------------------------

function MatchDetailModal({
  slug,
  matchCode,
  onClose,
}: {
  slug: string;
  matchCode: string;
  onClose: () => void;
}) {
  const [match, setMatch] = useState<PublicMatchResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;
    const fetchMatch = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await getPublicMatch(slug, matchCode);
        if (isMounted) setMatch(res);
      } catch (err) {
        if (isMounted) {
          setError(getApiErrorMessage(err, 'Failed to load match details.'));
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchMatch();
    return () => {
      isMounted = false;
    };
  }, [slug, matchCode]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-8 backdrop-blur-sm animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-2xl rounded-3xl border border-gray-200/80 bg-white shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/80 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <span className="font-mono text-xs font-bold text-gray-700 bg-gray-200/80 px-2 py-0.5 rounded-md">
              {matchCode}
            </span>
            {match && <StatusBadge status={match.status} />}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-gray-400 hover:bg-gray-200/60 hover:text-gray-700 transition"
            aria-label="Close match details"
          >
            <LuX className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto">
          {loading && (
            <div className="py-12 text-center space-y-3">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-r-transparent" />
              <p className="text-sm font-semibold text-gray-600">Loading match scoreboard...</p>
            </div>
          )}

          {!loading && error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-center text-sm font-medium text-red-700">
              {error}
            </div>
          )}

          {!loading && !error && match && (
            <div className="space-y-6">
              {/* Stage & Group banner */}
              <div className="text-center">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 border border-indigo-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-indigo-700">
                  {match.matchType.replace(/_/g, ' ')}
                  {match.groupName ? ` • ${match.groupName}` : ''}
                </span>
              </div>

              {/* Head-to-Head Scoreboard */}
              <div className="grid grid-cols-1 items-center gap-6 sm:grid-cols-3 rounded-2xl bg-gradient-to-b from-gray-50/70 to-gray-100/40 p-6 border border-gray-100">
                {/* Team A */}
                <div className="flex flex-col items-center text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white border border-gray-200 shadow-xs text-xl font-black text-indigo-600">
                    {(match.teamAName || 'Team A').slice(0, 2).toUpperCase()}
                  </div>
                  <h4 className="mt-3 text-base font-bold text-gray-900 leading-tight">
                    {match.teamAName || 'Team A'}
                  </h4>
                  {match.teamARunRate !== null && (
                    <span className="mt-1 font-mono text-xs font-semibold text-gray-500">
                      RR: {match.teamARunRate.toFixed(2)}
                    </span>
                  )}
                  <span className="mt-3 text-4xl font-black tracking-tight text-gray-900">
                    {match.teamAScore ?? '—'}
                  </span>
                </div>

                {/* VS / Winner Indicator */}
                <div className="flex flex-col items-center justify-center text-center">
                  <span className="font-mono text-xs font-extrabold uppercase tracking-widest text-gray-400">
                    VS
                  </span>
                  {match.winnerTeamName ? (
                    <div className="mt-3 rounded-full bg-emerald-100 border border-emerald-300 px-3 py-1 text-xs font-bold text-emerald-800 shadow-2xs">
                      🏆 {match.winnerTeamName}
                    </div>
                  ) : match.status === 'LIVE' ? (
                    <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-bold text-red-700 animate-pulse">
                      <span className="h-2 w-2 rounded-full bg-red-600" />
                      LIVE
                    </span>
                  ) : null}
                  {match.tieBreakerDescription && (
                    <p className="mt-2 text-xs italic text-gray-500 max-w-[200px]">
                      {match.tieBreakerDescription}
                    </p>
                  )}
                </div>

                {/* Team B */}
                <div className="flex flex-col items-center text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white border border-gray-200 shadow-xs text-xl font-black text-indigo-600">
                    {(match.teamBName || 'Team B').slice(0, 2).toUpperCase()}
                  </div>
                  <h4 className="mt-3 text-base font-bold text-gray-900 leading-tight">
                    {match.teamBName || 'Team B'}
                  </h4>
                  {match.teamBRunRate !== null && (
                    <span className="mt-1 font-mono text-xs font-semibold text-gray-500">
                      RR: {match.teamBRunRate.toFixed(2)}
                    </span>
                  )}
                  <span className="mt-3 text-4xl font-black tracking-tight text-gray-900">
                    {match.teamBScore ?? '—'}
                  </span>
                </div>
              </div>

              {/* Match Schedule Timestamps */}
              <div className="rounded-2xl border border-gray-100 bg-gray-50/50 p-4 text-xs space-y-2 text-gray-600">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Scheduled Time</span>
                  <span className="font-semibold text-gray-900">
                    {formatDateTime(match.scheduledAt)}
                  </span>
                </div>
                {match.startedAt && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Match Started</span>
                    <span className="font-semibold text-gray-900">
                      {formatDateTime(match.startedAt)}
                    </span>
                  </div>
                )}
                {match.completedAt && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Match Completed</span>
                    <span className="font-semibold text-gray-900">
                      {formatDateTime(match.completedAt)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Match Card Component (Fixtures Grid)
// ---------------------------------------------------------------------------

function MatchCardItem({
  match,
  teamsMap,
  groupName,
  onClick,
}: {
  match: MatchResponse;
  teamsMap: Record<number, TeamResponse>;
  groupName?: string;
  onClick: () => void;
}) {
  const teamA = teamsMap[match.teamAId];
  const teamB = teamsMap[match.teamBId];

  const teamAName = teamA?.name ?? `Team #${match.teamAId}`;
  const teamBName = teamB?.name ?? `Team #${match.teamBId}`;

  const isTeamAWinner = match.winnerTeamId === match.teamAId;
  const isTeamBWinner = match.winnerTeamId === match.teamBId;

  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-gray-200/90 bg-white p-5 shadow-2xs transition-all hover:border-indigo-400 hover:shadow-md cursor-pointer"
    >
      <div>
        {/* Match Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">
              {match.matchCode}
            </span>
            {groupName && (
              <span className="rounded bg-indigo-50 px-2 py-0.5 text-[11px] font-semibold text-indigo-700">
                {groupName}
              </span>
            )}
            {match.roundNumber > 0 && (
              <span className="text-[11px] text-gray-400 font-medium">
                R{match.roundNumber}
              </span>
            )}
          </div>

          <div>
            {match.status === 'LIVE' ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-2.5 py-0.5 text-[11px] font-extrabold text-red-700">
                <span className="h-1.5 w-1.5 rounded-full bg-red-600 animate-ping" />
                LIVE
              </span>
            ) : (
              <StatusBadge status={match.status} />
            )}
          </div>
        </div>

        {/* Competitors & Scores */}
        <div className="space-y-3">
          {/* Team A */}
          <div
            className={`flex items-center justify-between p-2 rounded-xl transition ${
              isTeamAWinner ? 'bg-emerald-50/70 border border-emerald-200/60 font-bold' : ''
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              {teamA?.logoUrl ? (
                <img
                  src={teamA.logoUrl}
                  alt={teamAName}
                  className="h-6 w-6 rounded-md object-cover border border-gray-200 shrink-0"
                />
              ) : (
                <div className="flex h-6 w-6 items-center justify-center rounded-md bg-gray-100 text-[10px] font-bold text-gray-600 shrink-0">
                  {(teamA?.shortName || teamAName || 'TA').slice(0, 2).toUpperCase()}
                </div>
              )}
              <span className="truncate text-sm text-gray-900 font-semibold">
                {teamAName}
              </span>
              {isTeamAWinner && (
                <span className="rounded bg-emerald-200/80 px-1 py-0.2 text-[10px] font-extrabold text-emerald-900">
                  WIN
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {match.teamARunRate !== null && match.teamARunRate !== undefined && (
                <span className="font-mono text-[11px] text-gray-400">
                  RR {match.teamARunRate.toFixed(2)}
                </span>
              )}
              <span
                className={`font-mono text-base font-extrabold ${
                  isTeamAWinner ? 'text-emerald-900' : 'text-gray-800'
                }`}
              >
                {match.teamAScore ?? '—'}
              </span>
            </div>
          </div>

          {/* Team B */}
          <div
            className={`flex items-center justify-between p-2 rounded-xl transition ${
              isTeamBWinner ? 'bg-emerald-50/70 border border-emerald-200/60 font-bold' : ''
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              {teamB?.logoUrl ? (
                <img
                  src={teamB.logoUrl}
                  alt={teamBName}
                  className="h-6 w-6 rounded-md object-cover border border-gray-200 shrink-0"
                />
              ) : (
                <div className="flex h-6 w-6 items-center justify-center rounded-md bg-gray-100 text-[10px] font-bold text-gray-600 shrink-0">
                  {(teamB?.shortName || teamBName || 'TB').slice(0, 2).toUpperCase()}
                </div>
              )}
              <span className="truncate text-sm text-gray-900 font-semibold">
                {teamBName}
              </span>
              {isTeamBWinner && (
                <span className="rounded bg-emerald-200/80 px-1 py-0.2 text-[10px] font-extrabold text-emerald-900">
                  WIN
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {match.teamBRunRate !== null && match.teamBRunRate !== undefined && (
                <span className="font-mono text-[11px] text-gray-400">
                  RR {match.teamBRunRate.toFixed(2)}
                </span>
              )}
              <span
                className={`font-mono text-base font-extrabold ${
                  isTeamBWinner ? 'text-emerald-900' : 'text-gray-800'
                }`}
              >
                {match.teamBScore ?? '—'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Card Footer */}
      <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3 text-[11px] text-gray-400">
        <span>
          {match.status === 'COMPLETED' && match.completedAt
            ? `Finished ${formatDateTime(match.completedAt)}`
            : formatDateTime(match.scheduledAt)}
        </span>
        <span className="font-semibold text-indigo-600 group-hover:text-indigo-800 flex items-center gap-1 transition">
          Scoreboard →
        </span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Registered Team Card (with Roster fetching via API 7: /api/teams/{teamId}/members)
// ---------------------------------------------------------------------------

function RegisteredTeamCard({
  team,
  members,
  loadingMembers,
  onToggleRoster,
  isExpanded,
}: {
  team: TeamResponse;
  members?: TeamMemberResponse[];
  loadingMembers: boolean;
  onToggleRoster: () => void;
  isExpanded: boolean;
}) {
  const captain = members?.find((m) => m.memberRole === 'CAPTAIN');

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200/90 bg-white shadow-2xs transition-all hover:border-gray-300 hover:shadow-xs">
      {/* Team Card Main Row */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3.5 min-w-0">
            {team.logoUrl ? (
              <img
                src={team.logoUrl}
                alt={team.name}
                className="h-12 w-12 rounded-2xl object-cover border border-gray-200 shadow-2xs shrink-0"
              />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 font-black text-indigo-700 text-sm border border-indigo-100 shadow-2xs shrink-0">
                {(team.shortName || team.name).slice(0, 2).toUpperCase()}
              </div>
            )}
            <div className="min-w-0">
              <h4 className="text-base font-bold text-gray-900 truncate">
                {team.name}
              </h4>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-bold text-gray-600">
                  {team.shortName}
                </span>
                <span className="text-[11px] text-gray-400">
                  ID #{team.id}
                </span>
              </div>
            </div>
          </div>

          <span
            className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider shrink-0 ${
              team.status === 'ACTIVE'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}
          >
            {team.status}
          </span>
        </div>

        {team.description && (
          <p className="mt-3 text-xs text-gray-600 line-clamp-2">
            {team.description}
          </p>
        )}

        <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3 text-xs">
          <span className="text-gray-400">
            Registered: {formatDate(team.createdAt)}
          </span>
          <button
            type="button"
            onClick={onToggleRoster}
            className="flex items-center gap-1.5 font-bold text-indigo-600 hover:text-indigo-800 transition py-1 px-2 rounded-lg hover:bg-indigo-50"
          >
            <span>{isExpanded ? 'Hide Roster' : 'View Roster'}</span>
            <LuChevronDown
              className={`h-3.5 w-3.5 transition-transform duration-200 ${
                isExpanded ? 'rotate-180' : ''
              }`}
            />
          </button>
        </div>
      </div>

      {/* Expandable Team Roster Section */}
      {isExpanded && (
        <div className="border-t border-gray-100 bg-gray-50/70 p-4 transition-all">
          <div className="flex items-center justify-between mb-3">
            <h5 className="text-xs font-bold uppercase tracking-wider text-gray-600">
              Team Roster ({members ? members.length : '...'})
            </h5>
            {captain && (
              <span className="text-[11px] font-medium text-indigo-600">
                Captain: <strong className="text-gray-900">{captain.name}</strong>
              </span>
            )}
          </div>

          {loadingMembers && (
            <div className="py-4 text-center">
              <div className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-indigo-600 border-r-transparent" />
              <p className="text-xs text-gray-500 mt-1">Loading members...</p>
            </div>
          )}

          {!loadingMembers && members && members.length === 0 && (
            <p className="py-3 text-center text-xs text-gray-400 italic">
              No roster members registered yet.
            </p>
          )}

          {!loadingMembers && members && members.length > 0 && (
            <div className="space-y-2">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between rounded-xl bg-white p-2.5 border border-gray-100 text-xs shadow-2xs"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div
                      className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold shrink-0 ${
                        member.memberRole === 'CAPTAIN'
                          ? 'bg-amber-100 text-amber-900'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {(member.name || 'M').charAt(0).toUpperCase()}
                    </div>
                    <div className="truncate">
                      <p className="font-semibold text-gray-900 truncate">
                        {member.name || 'Unnamed Member'}
                      </p>
                      <p className="text-[10px] text-gray-400 truncate">
                        {member.email}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                        member.memberRole === 'CAPTAIN'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {member.memberRole}
                    </span>
                    {member.active && (
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" title="Active" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tournament Switcher / Selector Dropdown
// ---------------------------------------------------------------------------

function TournamentSelector({
  currentSlug,
  tournaments,
  onSelect,
}: {
  currentSlug: string;
  tournaments: TournamentResponse[];
  onSelect: (slug: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search.trim()) return tournaments;
    const q = search.toLowerCase();
    return tournaments.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.sportType.toLowerCase().includes(q) ||
        t.location.toLowerCase().includes(q)
    );
  }, [tournaments, search]);

  const current = tournaments.find((t) => t.publicSlug === currentSlug);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-2 rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-white/20 transition"
      >
        <span className="text-sm">🏆</span>
        <span className="max-w-[180px] sm:max-w-[260px] truncate">
          {current?.name || 'Switch Tournament'}
        </span>
        <LuChevronDown
          className={`h-4 w-4 text-white/70 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full mt-2 z-50 w-80 sm:w-96 rounded-2xl border border-gray-200 bg-white p-3 shadow-xl animate-fade-in">
            <div className="mb-2">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search public tournaments..."
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-900 placeholder-gray-400 outline-none focus:border-indigo-500 focus:bg-white transition"
                autoFocus
              />
            </div>

            <div className="max-h-64 overflow-y-auto divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <p className="py-4 text-center text-xs text-gray-400">
                  No public tournaments found.
                </p>
              ) : (
                filtered.map((t) => {
                  const isCurrent = t.publicSlug === currentSlug;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => {
                        onSelect(t.publicSlug);
                        setIsOpen(false);
                      }}
                      className={`w-full text-left p-2.5 rounded-xl transition flex items-center justify-between gap-2 ${
                        isCurrent
                          ? 'bg-indigo-50 text-indigo-900 font-bold'
                          : 'hover:bg-gray-50 text-gray-800'
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-semibold">{t.name}</p>
                        <p className="text-[10px] text-gray-400 truncate">
                          {t.sportType} • {t.location}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[9px] font-bold uppercase text-gray-600">
                          {t.status}
                        </span>
                        {isCurrent && <span className="text-indigo-600 font-bold text-xs">✓</span>}
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            <div className="mt-2 border-t border-gray-100 pt-2 text-center">
              <Link
                to="/tournaments/public"
                className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 transition"
              >
                Browse All Tournaments Directory →
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main PublicTournamentPage Component
// ---------------------------------------------------------------------------

type TabKey = 'standings' | 'matches' | 'teams' | 'info';

export default function PublicTournamentPage() {
  const { slug: routeSlug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  // Resolve slug from route or hash (e.g., /#/summer-cricket-championship-2026)
  const currentSlug = useMemo(() => {
    if (routeSlug) return routeSlug;
    if (typeof window !== 'undefined' && window.location.hash) {
      const cleaned = window.location.hash.replace(/^#\/?/, '').split('?')[0];
      if (cleaned) return cleaned;
    }
    return '';
  }, [routeSlug]);

  // Data states
  const [tournamentsList, setTournamentsList] = useState<TournamentResponse[]>([]);
  const [details, setDetails] = useState<TournamentResponse | null>(null);
  const [stats, setStats] = useState<PublicTournamentStatsResponse | null>(null);
  const [teams, setTeams] = useState<TeamResponse[]>([]);
  const [matches, setMatches] = useState<MatchResponse[]>([]);

  // Member roster cache for Team cards: { [teamId]: TeamMemberResponse[] }
  const [rosterCache, setRosterCache] = useState<Record<number, TeamMemberResponse[]>>({});
  const [expandedTeams, setExpandedTeams] = useState<Record<number, boolean>>({});
  const [loadingMembers, setLoadingMembers] = useState<Record<number, boolean>>({});

  // Loading & error states
  const [pageLoading, setPageLoading] = useState(true);
  const [pageError, setPageError] = useState('');

  // UI Filter states
  const [activeTab, setActiveTab] = useState<TabKey>('standings');
  const [selectedGroupFilter, setSelectedGroupFilter] = useState<string>('ALL');
  const [matchStatusFilter, setMatchStatusFilter] = useState<string>('ALL');
  const [matchSearch, setMatchSearch] = useState<string>('');
  const [teamSearch, setTeamSearch] = useState<string>('');
  const [selectedMatchCode, setSelectedMatchCode] = useState<string | null>(null);

  // 1. Fetch all public tournaments (API 1) on mount for the selector
  useEffect(() => {
    let isMounted = true;
    const loadPublicList = async () => {
      try {
        const data = await getPublicTournaments();
        if (isMounted) {
          setTournamentsList(data);
          // If no slug specified in route, auto-select the first available tournament
          if (!currentSlug && data.length > 0) {
            navigate(`/public/tournaments/${data[0].publicSlug}`, { replace: true });
          }
        }
      } catch (err) {
        console.error('Failed to load public tournaments list', err);
      }
    };
    loadPublicList();
    return () => {
      isMounted = false;
    };
  }, [currentSlug, navigate]);

  // 2. Fetch tournament details & stats, then teams and matches
  const loadTournamentData = useCallback(async (slug: string) => {
    if (!slug) return;
    try {
      setPageLoading(true);
      setPageError('');

      // Concurrently query Tournament Service (API 2) & Competition Service (API 3)
      const [detailsRes, statsRes] = await Promise.allSettled([
        getPublicTournamentDetails(slug),
        getPublicTournamentStats(slug),
      ]);

      const fetchedDetails = detailsRes.status === 'fulfilled' ? detailsRes.value : null;
      const fetchedStats = statsRes.status === 'fulfilled' ? statsRes.value : null;

      if (!fetchedDetails && !fetchedStats) {
        throw new Error('Tournament could not be found or is not currently public.');
      }

      setDetails(fetchedDetails);
      setStats(fetchedStats);

      // Resolve tournamentId from either stats or details
      const tournamentId = fetchedStats?.tournamentId ?? fetchedDetails?.id;

      if (tournamentId) {
        // Concurrently query Matches (API 4) & Teams (API 6)
        const [matchesRes, teamsRes] = await Promise.allSettled([
          getTournamentMatches(tournamentId),
          getTournamentTeams(tournamentId),
        ]);

        if (matchesRes.status === 'fulfilled') {
          setMatches(matchesRes.value);
        } else {
          console.warn('Could not load fixtures:', matchesRes.reason);
          setMatches([]);
        }

        if (teamsRes.status === 'fulfilled') {
          setTeams(teamsRes.value);
        } else {
          console.warn('Could not load teams:', teamsRes.reason);
          setTeams([]);
        }
      }
    } catch (err) {
      setPageError(getApiErrorMessage(err, 'Tournament not found or failed to load.'));
    } finally {
      setPageLoading(false);
    }
  }, []);

  useEffect(() => {
    if (currentSlug) {
      loadTournamentData(currentSlug);
    }
  }, [currentSlug, loadTournamentData]);

  // Update SEO document title when tournament loads
  useEffect(() => {
    const tournamentName = stats?.name || details?.name;
    if (tournamentName) {
      document.title = `${tournamentName} | Live Public Tournament Hub`;
    }
  }, [stats?.name, details?.name]);

  // Handle switching tournaments via selector
  const handleSelectTournament = (slug: string) => {
    navigate(`/public/tournaments/${slug}`);
  };

  // Toggle Team Roster expansion & fetch on demand (API 7)
  const handleToggleRoster = async (teamId: number) => {
    setExpandedTeams((prev) => ({ ...prev, [teamId]: !prev[teamId] }));

    // Fetch members if not already cached
    if (!rosterCache[teamId] && !loadingMembers[teamId]) {
      try {
        setLoadingMembers((prev) => ({ ...prev, [teamId]: true }));
        const members = await getTeamMembers(teamId);
        setRosterCache((prev) => ({ ...prev, [teamId]: members }));
      } catch (err) {
        console.error(`Failed to load members for team ${teamId}`, err);
        setRosterCache((prev) => ({ ...prev, [teamId]: [] }));
      } finally {
        setLoadingMembers((prev) => ({ ...prev, [teamId]: false }));
      }
    }
  };

  // Construct quick lookups
  const teamsMap = useMemo(() => {
    return teams.reduce<Record<number, TeamResponse>>((acc, t) => {
      acc[t.id] = t;
      return acc;
    }, {});
  }, [teams]);

  const groupsMap = useMemo(() => {
    return (
      stats?.groups?.reduce<Record<number, string>>((acc, g) => {
        acc[g.groupId] = g.name;
        return acc;
      }, {}) ?? {}
    );
  }, [stats?.groups]);

  // Filter matches
  const filteredMatches = useMemo(() => {
    return matches.filter((m) => {
      // Status filter
      if (matchStatusFilter !== 'ALL' && m.status !== matchStatusFilter) {
        return false;
      }
      // Search filter (team A or team B name or match code)
      if (matchSearch.trim()) {
        const q = matchSearch.toLowerCase();
        const teamAName = teamsMap[m.teamAId]?.name?.toLowerCase() ?? '';
        const teamBName = teamsMap[m.teamBId]?.name?.toLowerCase() ?? '';
        const code = m.matchCode.toLowerCase();
        if (!teamAName.includes(q) && !teamBName.includes(q) && !code.includes(q)) {
          return false;
        }
      }
      return true;
    });
  }, [matches, matchStatusFilter, matchSearch, teamsMap]);

  // Filter teams
  const filteredTeams = useMemo(() => {
    if (!teamSearch.trim()) return teams;
    const q = teamSearch.toLowerCase();
    return teams.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.shortName?.toLowerCase().includes(q) ||
        t.description?.toLowerCase().includes(q)
    );
  }, [teams, teamSearch]);

  // Combined metadata from details (API 2) & stats (API 3)
  const tournamentName = stats?.name || details?.name || 'Tournament Hub';
  const sportType = stats?.sportType || details?.sportType || 'SPORTS';
  const status = stats?.status || details?.status || 'ACTIVE';
  const format = stats?.format || details?.format || 'TOURNAMENT';
  const location = details?.location || 'Venue TBA';
  const championName = stats?.championTeamName;

  // Live Stats calculations
  const totalTeamsCount = stats?.totalTeams ?? teams.length;
  const totalMatchesCount = stats?.totalMatches ?? matches.length;
  const completedMatchesCount =
    stats?.completedMatches ?? matches.filter((m) => m.status === 'COMPLETED').length;
  const liveMatchesCount =
    stats?.liveMatches ?? matches.filter((m) => m.status === 'LIVE').length;
  const upcomingMatchesCount =
    stats?.upcomingMatches ?? matches.filter((m) => m.status === 'SCHEDULED').length;
  const currentStage = stats?.currentStage ?? (details ? 'SCHEDULED' : 'IN_PROGRESS');

  // Available groups for tabbed group view
  const availableGroups = stats?.groups || [];
  const displayGroups = useMemo(() => {
    if (selectedGroupFilter === 'ALL') return availableGroups;
    return availableGroups.filter((g) => g.groupId.toString() === selectedGroupFilter);
  }, [availableGroups, selectedGroupFilter]);

  // SKELETON LOADING STATE
  if (pageLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 animate-pulse">
        {/* Header Skeleton */}
        <div className="h-64 rounded-3xl bg-gray-200/80" />
        {/* Stats Grid Skeleton */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-28 rounded-2xl bg-gray-200/70" />
          ))}
        </div>
        {/* Tabs Skeleton */}
        <div className="h-12 w-96 rounded-xl bg-gray-200/60" />
        {/* Content Skeleton */}
        <div className="h-96 rounded-3xl bg-gray-200/50" />
      </div>
    );
  }

  // ERROR STATE / INVALID SLUG
  if (pageError || (!details && !stats)) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-red-100 text-2xl text-red-600">
          ⚠️
        </div>
        <h2 className="mt-4 text-2xl font-black text-gray-900">
          Tournament Not Found
        </h2>
        <p className="mt-2 text-sm text-gray-500 max-w-md mx-auto">
          {pageError || 'The requested tournament slug is invalid or is not published yet.'}
        </p>

        {tournamentsList.length > 0 && (
          <div className="mt-8 text-left bg-white p-6 rounded-3xl border border-gray-200 shadow-sm">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-700 mb-3">
              Available Public Tournaments:
            </h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {tournamentsList.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => handleSelectTournament(t.publicSlug)}
                  className="flex items-center justify-between p-3.5 rounded-2xl border border-gray-100 bg-gray-50 hover:bg-indigo-50 hover:border-indigo-200 transition text-left group"
                >
                  <div>
                    <p className="text-sm font-bold text-gray-900 group-hover:text-indigo-900">
                      {t.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {t.sportType} • {t.location}
                    </p>
                  </div>
                  <span className="text-indigo-600 font-bold text-xs group-hover:translate-x-1 transition-transform">
                    View →
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8">
          <Link
            to="/tournaments/public"
            className="inline-flex items-center rounded-xl bg-gray-900 px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-gray-800 transition"
          >
            ← Back to All Tournaments
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* ------------------------------------------------------------------- */}
      {/* 1. HERO & TOURNAMENT HEADER                                          */}
      {/* ------------------------------------------------------------------- */}
      <header className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl">
        {/* Subtle decorative glow elements */}
        <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 p-6 sm:p-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            {/* Left: Tournament Identity */}
            <div className="flex-1 space-y-4">
              {/* Badges bar */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-indigo-500/20 border border-indigo-400/30 px-3 py-1 text-xs font-black uppercase tracking-wider text-indigo-200 backdrop-blur-md">
                  ⚡ {sportType}
                </span>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-black uppercase tracking-wider ${
                    status === 'ACTIVE'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
                      : status === 'COMPLETED'
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-400/30'
                      : 'bg-white/10 text-white border border-white/20'
                  }`}
                >
                  {status}
                </span>

                <span className="rounded-full bg-white/10 border border-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-gray-300">
                  {format.replace(/_/g, ' ')}
                </span>

                {details?.visibility && (
                  <span className="rounded-full bg-white/5 border border-white/10 px-2.5 py-0.5 text-[11px] font-medium text-gray-400">
                    {details.visibility}
                  </span>
                )}
              </div>

              {/* Tournament Title */}
              <h1 className="text-3xl font-black tracking-tight sm:text-5xl text-white">
                {tournamentName}
              </h1>

              {details?.description && (
                <p className="text-sm text-gray-300 max-w-3xl leading-relaxed">
                  {details.description}
                </p>
              )}

              {/* Location & Dates row */}
              <div className="flex flex-wrap items-center gap-y-2 gap-x-6 pt-2 text-xs text-gray-300">
                <div className="flex items-center gap-1.5">
                  <LuMapPin className="h-4 w-4 text-indigo-400" />
                  <span className="font-semibold text-white">{location}</span>
                </div>

                {details?.startDate && details?.endDate && (
                  <div className="flex items-center gap-1.5">
                    <LuCalendar className="h-4 w-4 text-indigo-400" />
                    <span>
                      {formatDate(details.startDate)} – {formatDate(details.endDate)}
                    </span>
                  </div>
                )}
              </div>

              {/* Points Rules Summary Strip */}
              {details && (
                <div className="flex flex-wrap items-center gap-2 pt-2">
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                    Points Rules:
                  </span>
                  <span className="rounded-lg bg-white/10 px-2 py-0.5 text-xs font-semibold text-emerald-300">
                    Win: +{details.winPoints} pts
                  </span>
                  <span className="rounded-lg bg-white/10 px-2 py-0.5 text-xs font-semibold text-amber-300">
                    Draw: +{details.drawPoints} pt
                  </span>
                  <span className="rounded-lg bg-white/10 px-2 py-0.5 text-xs font-semibold text-rose-300">
                    Loss: {details.lossPoints} pts
                  </span>
                  {details.maximumTeams > 0 && (
                    <span className="rounded-lg bg-white/10 px-2 py-0.5 text-xs font-semibold text-blue-300">
                      Cap: {details.maximumTeams} Teams
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Right: Tournament Selector & Quick Actions */}
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <TournamentSelector
                currentSlug={currentSlug}
                tournaments={tournamentsList}
                onSelect={handleSelectTournament}
              />
              <Link
                to="/tournaments/public"
                className="rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md px-4 py-2 text-xs font-bold text-white hover:bg-white/20 transition"
              >
                All Tournaments
              </Link>
            </div>
          </div>

          {/* Champion Highlight Banner (if crowned) */}
          {championName && (
            <div className="mt-8 flex items-center gap-4 rounded-2xl bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-amber-500/10 border border-amber-400/40 p-4 backdrop-blur-md">
              <span className="text-3xl">🏆</span>
              <div>
                <p className="text-[11px] font-black uppercase tracking-widest text-amber-300">
                  Defending / Crowned Champion
                </p>
                <p className="text-xl sm:text-2xl font-black text-amber-100">
                  {championName}
                </p>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* ------------------------------------------------------------------- */}
      {/* 2. LIVE STATS DASHBOARD                                              */}
      {/* ------------------------------------------------------------------- */}
      <section aria-label="Tournament Stats Dashboard">
        <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-6">
          <PublicStatCard
            label="Total Teams"
            value={totalTeamsCount}
            sublabel="Registered squads"
            icon={
              <LuUsers className="h-5 w-5" />
            }
          />

          <PublicStatCard
            label="Total Matches"
            value={totalMatchesCount}
            sublabel="Across all stages"
            icon={
              <LuClipboard className="h-5 w-5" />
            }
          />

          <PublicStatCard
            label="Completed"
            value={completedMatchesCount}
            sublabel="Matches finished"
            icon={
              <LuCheck className="h-5 w-5" />
            }
          />

          <PublicStatCard
            label="Live Action"
            value={liveMatchesCount}
            sublabel={liveMatchesCount > 0 ? 'Active right now' : 'No live game'}
            isLive={liveMatchesCount > 0}
            variant={liveMatchesCount > 0 ? 'live' : 'default'}
            icon={
              <LuZap className="h-5 w-5" />
            }
          />

          <PublicStatCard
            label="Upcoming"
            value={upcomingMatchesCount}
            sublabel="Scheduled fixtures"
            icon={
              <LuClock className="h-5 w-5" />
            }
          />

          <PublicStatCard
            label="Current Stage"
            value={currentStage.replace(/_/g, ' ')}
            sublabel={championName ? `Winner: ${championName}` : 'In progress'}
            variant={championName ? 'champion' : 'default'}
            icon={
              <LuTrophy className="h-5 w-5" />
            }
          />
        </div>
      </section>

      {/* ------------------------------------------------------------------- */}
      {/* 3. SECTION TABS                                                     */}
      {/* ------------------------------------------------------------------- */}
      <nav className="border-b border-gray-200" aria-label="Tournament Sections">
        <div className="flex gap-2 overflow-x-auto pb-px">
          <button
            type="button"
            onClick={() => setActiveTab('standings')}
            className={`whitespace-nowrap px-4 py-3 text-sm font-bold border-b-2 transition ${
              activeTab === 'standings'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            📊 Groups & Standings ({availableGroups.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('matches')}
            className={`whitespace-nowrap px-4 py-3 text-sm font-bold border-b-2 transition ${
              activeTab === 'matches'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            ⚔️ Fixtures & Matches ({matches.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('teams')}
            className={`whitespace-nowrap px-4 py-3 text-sm font-bold border-b-2 transition ${
              activeTab === 'teams'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            🛡️ Registered Teams ({teams.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('info')}
            className={`whitespace-nowrap px-4 py-3 text-sm font-bold border-b-2 transition ${
              activeTab === 'info'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            ℹ️ Tournament Details & Rules
          </button>
        </div>
      </nav>

      {/* ------------------------------------------------------------------- */}
      {/* 4. TAB CONTENT                                                      */}
      {/* ------------------------------------------------------------------- */}

      {/* TAB A: GROUPS & STANDINGS */}
      {activeTab === 'standings' && (
        <section className="space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-black text-gray-900 tracking-tight">
                Groups & Standings
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Official table standings, points, score differences, and qualification status.
              </p>
            </div>

            {/* Filter by group if multiple groups exist */}
            {availableGroups.length > 1 && (
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setSelectedGroupFilter('ALL')}
                  className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                    selectedGroupFilter === 'ALL'
                      ? 'bg-gray-900 text-white shadow-2xs'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  All Groups
                </button>
                {availableGroups.map((g) => (
                  <button
                    key={g.groupId}
                    type="button"
                    onClick={() => setSelectedGroupFilter(g.groupId.toString())}
                    className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                      selectedGroupFilter === g.groupId.toString()
                        ? 'bg-indigo-600 text-white shadow-2xs'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {g.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {displayGroups.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-gray-300 bg-white p-12 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-2xl text-gray-400">
                📋
              </div>
              <h3 className="mt-3 text-base font-bold text-gray-800">
                No Group Standings Available Yet
              </h3>
              <p className="mt-1 text-xs text-gray-500 max-w-sm mx-auto">
                Group structures and standings will appear here once the tournament competition begins.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {displayGroups.map((group) => (
                <PublicGroupCard
                  key={group.groupId}
                  group={group}
                  teamsMap={teamsMap}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {/* TAB B: FIXTURES & MATCHES */}
      {activeTab === 'matches' && (
        <section className="space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-black text-gray-900 tracking-tight">
                Fixtures & Match Schedule
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Full match lineup, real-time scores, round numbers, and head-to-head details.
              </p>
            </div>

            {/* Filter pills */}
            <div className="flex flex-wrap items-center gap-1.5">
              {(['ALL', 'LIVE', 'SCHEDULED', 'COMPLETED'] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setMatchStatusFilter(s)}
                  className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                    matchStatusFilter === s
                      ? s === 'LIVE'
                        ? 'bg-red-600 text-white shadow-xs'
                        : 'bg-gray-900 text-white shadow-2xs'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {s === 'ALL' ? 'All Matches' : s}
                </button>
              ))}
            </div>
          </div>

          {/* Search bar within fixtures */}
          {matches.length > 0 && (
            <div className="flex items-center gap-3">
              <div className="relative flex-1 max-w-md">
                <input
                  type="text"
                  value={matchSearch}
                  onChange={(e) => setMatchSearch(e.target.value)}
                  placeholder="Filter by team name or match code (e.g. M01)..."
                  className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-xs text-gray-900 placeholder-gray-400 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition shadow-2xs"
                />
                {matchSearch && (
                  <button
                    type="button"
                    onClick={() => setMatchSearch('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                )}
              </div>
              <span className="text-xs font-semibold text-gray-400">
                Showing {filteredMatches.length} of {matches.length}
              </span>
            </div>
          )}

          {filteredMatches.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-gray-300 bg-white p-12 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-2xl text-gray-400">
                🏟️
              </div>
              <h3 className="mt-3 text-base font-bold text-gray-800">
                {matches.length === 0
                  ? 'No Matches Scheduled Yet'
                  : 'No Matches Match Your Filters'}
              </h3>
              <p className="mt-1 text-xs text-gray-500 max-w-sm mx-auto">
                {matches.length === 0
                  ? 'Fixtures will be published once registration closes and tournament schedules are generated.'
                  : 'Try selecting another status pill or clearing your search term.'}
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredMatches.map((m) => (
                <MatchCardItem
                  key={m.id || m.matchCode}
                  match={m}
                  teamsMap={teamsMap}
                  groupName={m.groupId ? groupsMap[m.groupId] : undefined}
                  onClick={() => setSelectedMatchCode(m.matchCode)}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {/* TAB C: REGISTERED TEAMS */}
      {activeTab === 'teams' && (
        <section className="space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-black text-gray-900 tracking-tight">
                Registered Teams
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Participating squads, team captains, and active player rosters.
              </p>
            </div>

            {teams.length > 3 && (
              <div className="w-full sm:w-72">
                <input
                  type="text"
                  value={teamSearch}
                  onChange={(e) => setTeamSearch(e.target.value)}
                  placeholder="Search teams by name or code..."
                  className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-xs text-gray-900 placeholder-gray-400 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition shadow-2xs"
                />
              </div>
            )}
          </div>

          {filteredTeams.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-gray-300 bg-white p-12 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-2xl text-gray-400">
                🛡️
              </div>
              <h3 className="mt-3 text-base font-bold text-gray-800">
                {teams.length === 0
                  ? 'No Teams Registered Yet'
                  : 'No Teams Match Your Search'}
              </h3>
              <p className="mt-1 text-xs text-gray-500 max-w-sm mx-auto">
                {teams.length === 0
                  ? 'Teams that register for this tournament will be shown here along with their rosters.'
                  : 'Try typing a different search query.'}
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredTeams.map((team) => (
                <RegisteredTeamCard
                  key={team.id}
                  team={team}
                  members={rosterCache[team.id]}
                  loadingMembers={!!loadingMembers[team.id]}
                  isExpanded={!!expandedTeams[team.id]}
                  onToggleRoster={() => handleToggleRoster(team.id)}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {/* TAB D: TOURNAMENT DETAILS & RULES */}
      {activeTab === 'info' && (
        <section className="space-y-6">
          <div className="rounded-3xl border border-gray-200/90 bg-white p-6 sm:p-8 shadow-xs space-y-6">
            <div>
              <h2 className="text-xl font-black text-gray-900 tracking-tight">
                Tournament Overview & Regulations
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                Official rules, schedule timeline, and scoring guidelines for {tournamentName}.
              </p>
            </div>

            {/* Grid of Key Info */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border border-gray-100 bg-gray-50/70 p-4">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Sport & Discipline
                </span>
                <p className="mt-1.5 text-base font-extrabold text-gray-900">
                  {sportType}
                </p>
              </div>

              <div className="rounded-2xl border border-gray-100 bg-gray-50/70 p-4">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Format
                </span>
                <p className="mt-1.5 text-base font-extrabold text-gray-900">
                  {format.replace(/_/g, ' ')}
                </p>
              </div>

              <div className="rounded-2xl border border-gray-100 bg-gray-50/70 p-4">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Tournament Status
                </span>
                <p className="mt-1.5 text-base font-extrabold text-gray-900">
                  {status}
                </p>
              </div>

              <div className="rounded-2xl border border-gray-100 bg-gray-50/70 p-4">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Maximum Teams
                </span>
                <p className="mt-1.5 text-base font-extrabold text-gray-900">
                  {details?.maximumTeams ?? 'Unlimited'}
                </p>
              </div>
            </div>

            {/* Dates & Timeline */}
            {details && (
              <div className="rounded-2xl border border-indigo-100 bg-indigo-50/40 p-5 space-y-3">
                <h3 className="text-sm font-bold text-indigo-950 uppercase tracking-wider">
                  Official Tournament Timeline
                </h3>
                <div className="grid gap-3 sm:grid-cols-2 text-xs">
                  <div>
                    <span className="text-gray-500">Registration Period:</span>
                    <p className="font-bold text-gray-900 mt-0.5">
                      {formatDate(details.registrationStart)} – {formatDate(details.registrationEnd)}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500">Tournament Dates:</span>
                    <p className="font-bold text-gray-900 mt-0.5">
                      {formatDate(details.startDate)} – {formatDate(details.endDate)}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Scoring & Points System Table */}
            {details && (
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                  Scoring & Ranking Rules
                </h3>
                <div className="overflow-x-auto rounded-2xl border border-gray-100">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gray-50 text-[11px] font-bold uppercase text-gray-500">
                      <tr>
                        <th className="py-3 px-4">Match Outcome</th>
                        <th className="py-3 px-4 text-center">Points Awarded</th>
                        <th className="py-3 px-4">Tie-Breaker Rule</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      <tr>
                        <td className="py-3 px-4 font-semibold text-emerald-700">Win</td>
                        <td className="py-3 px-4 text-center font-bold text-gray-900">
                          +{details.winPoints}
                        </td>
                        <td className="py-3 px-4 text-gray-500">
                          Ranked by total points accrued
                        </td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 font-semibold text-amber-700">Draw / Tie</td>
                        <td className="py-3 px-4 text-center font-bold text-gray-900">
                          +{details.drawPoints}
                        </td>
                        <td className="py-3 px-4 text-gray-500">
                          Net run rate / score differential if points are tied
                        </td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 font-semibold text-rose-700">Loss</td>
                        <td className="py-3 px-4 text-center font-bold text-gray-900">
                          {details.lossPoints}
                        </td>
                        <td className="py-3 px-4 text-gray-500">
                          0 points awarded for standard defeat
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* 5. MATCH DETAIL MODAL (API 5)                                       */}
      {/* ------------------------------------------------------------------- */}
      {selectedMatchCode && currentSlug && (
        <MatchDetailModal
          slug={currentSlug}
          matchCode={selectedMatchCode}
          onClose={() => setSelectedMatchCode(null)}
        />
      )}
    </main>
  );
}
