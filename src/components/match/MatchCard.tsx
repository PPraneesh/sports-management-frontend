import { Link } from 'react-router';
import type { MatchResponse } from '../../types/match.types';
import type { PublicMatchResponse } from '../../types/public.types';
import StatusBadge from '../common/StatusBadge';
import { formatDateTime } from '../../utils/date';

interface MatchCardProps {
  match: MatchResponse | PublicMatchResponse;
  teamAName?: string;
  teamBName?: string;
  linkTo?: string;
}

export default function MatchCard({
  match,
  teamAName,
  teamBName,
  linkTo,
}: MatchCardProps) {
  // Discriminate or normalize match properties
  const isPublicMatch = 'teamAName' in match;
  const nameA = isPublicMatch ? match.teamAName : teamAName || `Team #${match.teamAId}`;
  const nameB = isPublicMatch ? match.teamBName : teamBName || `Team #${match.teamBId}`;
  const matchId = 'id' in match ? match.id : match.matchId;

  const defaultHref = isPublicMatch
    ? undefined
    : `/matches/${matchId}`;

  const targetHref = linkTo ?? defaultHref;

  const content = (
    <div className="flex flex-col justify-between rounded-xl border border-gray-200 bg-white p-5 transition hover:border-gray-300 hover:shadow-sm">
      <div className="flex items-center justify-between border-b border-gray-100 pb-3">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-bold text-gray-500">
            {match.matchCode}
          </span>
          <span className="rounded bg-gray-100 px-2 py-0.5 text-[11px] font-semibold text-gray-700">
            {match.matchType.replace('_', ' ')}
          </span>
        </div>
        <StatusBadge status={match.status} />
      </div>

      <div className="my-4 space-y-3">
        {/* Team A */}
        <div className="flex items-center justify-between">
          <span
            className={`font-semibold text-sm truncate max-w-[180px] ${
              match.winnerTeamId && match.winnerTeamId === ('teamAId' in match ? match.teamAId : undefined)
                ? 'text-green-700 font-bold'
                : 'text-gray-900'
            }`}
          >
            {nameA}
          </span>
          <span className="text-lg font-bold text-gray-900">
            {match.teamAScore ?? '-'}
          </span>
        </div>

        {/* Team B */}
        <div className="flex items-center justify-between">
          <span
            className={`font-semibold text-sm truncate max-w-[180px] ${
              match.winnerTeamId && match.winnerTeamId === ('teamBId' in match ? match.teamBId : undefined)
                ? 'text-green-700 font-bold'
                : 'text-gray-900'
            }`}
          >
            {nameB}
          </span>
          <span className="text-lg font-bold text-gray-900">
            {match.teamBScore ?? '-'}
          </span>
        </div>
      </div>

      <div className="border-t border-gray-100 pt-3 text-xs text-gray-500 flex items-center justify-between">
        <span>Scheduled:</span>
        <span className="font-medium text-gray-700">
          {formatDateTime(match.scheduledAt)}
        </span>
      </div>
    </div>
  );

  if (targetHref) {
    return <Link to={targetHref}>{content}</Link>;
  }

  return content;
}
