import { Link } from 'react-router';

import type { TeamResponse } from '../../types/team.types';

import StatusBadge from '../common/StatusBadge';

interface TeamCardProps {
  team: TeamResponse;
}

export default function TeamCard({
  team,
}: TeamCardProps) {
  return (
    <Link
      to={`/teams/${team.id}`}
      className="block rounded-xl border border-gray-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-md"
    >
      <div className="flex items-start gap-4">

        {team.logoUrl ? (
          <img
            src={team.logoUrl}
            alt={`${team.name} logo`}
            className="h-14 w-14 rounded-xl border border-gray-200 object-cover"
          />
        ) : (
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-lg font-bold text-gray-600">
            {team.shortName
              .slice(0, 2)
              .toUpperCase()}
          </div>
        )}

        <div className="min-w-0 flex-1">

          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate font-semibold text-gray-900">
              {team.name}
            </h3>

            <StatusBadge status={team.status} />
          </div>

          <p className="mt-1 text-sm text-gray-500">
            {team.shortName}
          </p>

          <p className="mt-3 text-xs text-gray-400">
            Captain ID: {team.captainId}
          </p>

        </div>

      </div>
    </Link>
  );
}