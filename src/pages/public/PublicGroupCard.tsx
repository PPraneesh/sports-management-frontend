import type { PublicGroupResponse } from '../../types/public.types';
import type { TeamResponse } from '../../types/team.types';
import PublicStandingsTable from './PublicStandingsTable';

interface PublicGroupCardProps {
  group: PublicGroupResponse;
  teamsMap?: Record<number, TeamResponse>;
}

export default function PublicGroupCard({
  group,
  teamsMap,
}: PublicGroupCardProps) {
  const groupTag =
    (group.name || 'Group').replace(/[^0-9A-Z]/gi, '').slice(-2).toUpperCase() || 'GP';
  const groupName = group.name || `Group #${group.sequenceNumber || group.groupId}`;
  const standings = group.standings || [];

  return (
    <section className="overflow-hidden rounded-3xl border border-gray-200/90 bg-white shadow-xs transition hover:shadow-sm">
      <div className="flex flex-col justify-between gap-3 border-b border-gray-100 bg-gradient-to-r from-gray-50/80 to-white px-6 py-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white font-black text-sm shadow-xs">
            {groupTag}
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900 tracking-tight">
              {groupName}
            </h3>
            <p className="text-xs text-gray-400">
              Sequence #{group.sequenceNumber ?? 1} · {standings.length} Teams
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${
              group.status === 'ACTIVE'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            {group.status || 'ACTIVE'}
          </span>
        </div>
      </div>

      <div className="p-4 sm:p-6">
        <PublicStandingsTable standings={standings} teamsMap={teamsMap} />
      </div>
    </section>
  );
}