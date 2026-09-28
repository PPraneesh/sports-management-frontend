import type {
  PublicGroupResponse,
} from '../../types/public.types';

import PublicStandingsTable from './PublicStandingsTable';

interface PublicGroupCardProps {
  group: PublicGroupResponse;
}

export default function PublicGroupCard({
  group,
}: PublicGroupCardProps) {
  return (
    <section className="rounded-xl border border-gray-200 bg-white">

      <div className="flex flex-col justify-between gap-3 border-b border-gray-200 px-5 py-4 sm:flex-row sm:items-center">

        <div>
          <h2 className="font-semibold text-gray-900">
            {group.name}
          </h2>

          <p className="mt-1 text-xs text-gray-500">
            Sequence {group.sequenceNumber}
          </p>
        </div>


        <span className="w-fit rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
          {group.status}
        </span>

      </div>


      <div className="p-5">
        <PublicStandingsTable
          standings={group.standings}
        />
      </div>

    </section>
  );
}