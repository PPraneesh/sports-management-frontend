import type {
  StandingResponse,
} from '../../types/standing.types';

interface PublicStandingsTableProps {
  standings: StandingResponse[];
}

export default function PublicStandingsTable({
  standings,
}: PublicStandingsTableProps) {
  if (standings.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center">
        <p className="text-sm text-gray-500">
          No standings available yet.
        </p>
      </div>
    );
  }


  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">

      <table className="w-full min-w-[900px] text-left text-sm">

        <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
          <tr>

            <th className="px-4 py-3">
              Rank
            </th>

            <th className="px-4 py-3">
              Team
            </th>

            <th className="px-4 py-3 text-center">
              MP
            </th>

            <th className="px-4 py-3 text-center">
              W
            </th>

            <th className="px-4 py-3 text-center">
              D
            </th>

            <th className="px-4 py-3 text-center">
              L
            </th>

            <th className="px-4 py-3 text-center">
              Points
            </th>

            <th className="px-4 py-3 text-center">
              For
            </th>

            <th className="px-4 py-3 text-center">
              Against
            </th>

            <th className="px-4 py-3 text-center">
              Diff
            </th>

            <th className="px-4 py-3 text-center">
              NRR
            </th>

            <th className="px-4 py-3 text-center">
              Win %
            </th>

            <th className="px-4 py-3 text-center">
              Qualification
            </th>

          </tr>
        </thead>


        <tbody className="divide-y divide-gray-100 bg-white">

          {standings.map((standing) => (
            <tr
              key={`${standing.groupId}-${standing.teamId}`}
              className="hover:bg-gray-50"
            >

              <td className="px-4 py-4 font-semibold text-gray-900">
                {standing.rank}
              </td>


              <td className="px-4 py-4 font-medium text-gray-900">
                {standing.teamName}
              </td>


              <td className="px-4 py-4 text-center text-gray-600">
                {standing.matchesPlayed}
              </td>


              <td className="px-4 py-4 text-center text-gray-600">
                {standing.wins}
              </td>


              <td className="px-4 py-4 text-center text-gray-600">
                {standing.draws}
              </td>


              <td className="px-4 py-4 text-center text-gray-600">
                {standing.losses}
              </td>


              <td className="px-4 py-4 text-center font-bold text-gray-900">
                {standing.points}
              </td>


              <td className="px-4 py-4 text-center text-gray-600">
                {standing.scoreFor}
              </td>


              <td className="px-4 py-4 text-center text-gray-600">
                {standing.scoreAgainst}
              </td>


              <td className="px-4 py-4 text-center font-medium text-gray-900">
                {standing.scoreDifference}
              </td>


              <td className="px-4 py-4 text-center text-gray-600">
                {standing.normalizedRunRate.toFixed(2)}
              </td>


              <td className="px-4 py-4 text-center text-gray-600">
                {standing.winPercentage.toFixed(1)}%
              </td>


              <td className="px-4 py-4 text-center">

                {standing.qualified ? (
                  <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                    Qualified
                  </span>
                ) : (
                  <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-500">
                    —
                  </span>
                )}

              </td>

            </tr>
          ))}

        </tbody>

      </table>

    </div>
  );
}