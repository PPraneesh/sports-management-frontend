import { useMemo, useState } from 'react';
import type { StandingResponse } from '../../types/standing.types';
import type { TeamResponse } from '../../types/team.types';
import { LuTable } from 'react-icons/lu';

interface PublicStandingsTableProps {
  standings: StandingResponse[];
  teamsMap?: Record<number, TeamResponse>;
}

export default function PublicStandingsTable({
  standings,
  teamsMap,
}: PublicStandingsTableProps) {
  const [search, setSearch] = useState('');

  const filteredStandings = useMemo(() => {
    if (!search.trim()) return standings;
    const q = search.toLowerCase();
    return standings.filter((s) => {
      const name = s.teamName || teamsMap?.[s.teamId]?.name || `Team #${s.teamId}`;
      return name.toLowerCase().includes(q);
    });
  }, [standings, search, teamsMap]);

  if (standings.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50/50 p-8 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
          <LuTable className="h-6 w-6" />
        </div>
        <p className="mt-2 text-sm font-semibold text-gray-700">No standings available yet</p>
        <p className="text-xs text-gray-400 mt-0.5">Standings will update dynamically once matches are completed.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {standings.length > 4 && (
        <div className="flex justify-end">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search teams in group..."
            className="w-full sm:w-64 rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-900 placeholder-gray-400 shadow-2xs outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      )}

      <div className="overflow-x-auto rounded-2xl border border-gray-200/80 bg-white shadow-2xs">
        <table className="w-full min-w-[860px] text-left text-xs">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/70 text-[11px] font-bold uppercase tracking-wider text-gray-500">
              <th className="py-3.5 pl-4 pr-2 text-center w-12">#</th>
              <th className="py-3.5 px-3">Team</th>
              <th className="py-3.5 px-3 text-center" title="Matches Played">MP</th>
              <th className="py-3.5 px-3 text-center text-emerald-700" title="Wins">W</th>
              <th className="py-3.5 px-3 text-center text-amber-700" title="Draws">D</th>
              <th className="py-3.5 px-3 text-center text-rose-700" title="Losses">L</th>
              <th className="py-3.5 px-3 text-center font-extrabold text-gray-900" title="Total Points">PTS</th>
              <th className="py-3.5 px-3 text-center text-gray-500" title="Score For">FOR</th>
              <th className="py-3.5 px-3 text-center text-gray-500" title="Score Against">AGST</th>
              <th className="py-3.5 px-3 text-center" title="Score Difference">DIFF</th>
              <th className="py-3.5 px-3 text-center" title="Net / Normalized Run Rate">NRR</th>
              <th className="py-3.5 px-3 text-center" title="Win Percentage">WIN %</th>
              <th className="py-3.5 pr-4 pl-3 text-center">Status</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100/80">
            {filteredStandings.map((standing) => {
              const teamInfo = teamsMap?.[standing.teamId];
              const teamDisplayName =
                standing.teamName || teamInfo?.name || `Team #${standing.teamId}`;
              const initials = (teamInfo?.shortName || teamDisplayName || 'TM')
                .slice(0, 2)
                .toUpperCase();

              const isFirst = standing.rank === 1;
              const isSecond = standing.rank === 2;
              const isThird = standing.rank === 3;

              return (
                <tr
                  key={`${standing.groupId}-${standing.teamId}`}
                  className={`transition-colors hover:bg-gray-50/80 ${
                    standing.qualified ? 'bg-emerald-50/30' : ''
                  }`}
                >
                  {/* Rank */}
                  <td className="py-3.5 pl-4 pr-2 text-center">
                    {isFirst ? (
                      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-amber-100 text-xs font-black text-amber-800 ring-2 ring-amber-400/40">
                        1
                      </span>
                    ) : isSecond ? (
                      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-700">
                        2
                      </span>
                    ) : isThird ? (
                      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-orange-50 text-xs font-bold text-orange-700">
                        3
                      </span>
                    ) : (
                      <span className="font-semibold text-gray-500">{standing.rank}</span>
                    )}
                  </td>

                  {/* Team */}
                  <td className="py-3.5 px-3">
                    <div className="flex items-center gap-2.5">
                      {teamInfo?.logoUrl ? (
                        <img
                          src={teamInfo.logoUrl}
                          alt={teamDisplayName}
                          className="h-7 w-7 rounded-lg object-cover border border-gray-200 shrink-0"
                        />
                      ) : (
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 font-bold text-indigo-700 text-[10px] shrink-0 border border-indigo-100">
                          {initials}
                        </div>
                      )}
                      <div>
                        <span className="font-bold text-gray-900 leading-snug">
                          {teamDisplayName}
                        </span>
                        {teamInfo?.shortName && (
                          <span className="ml-1.5 rounded bg-gray-100 px-1 py-0.5 text-[10px] font-medium text-gray-500">
                            {teamInfo.shortName}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* MP */}
                  <td className="py-3.5 px-3 text-center font-medium text-gray-700">
                    {standing.matchesPlayed ?? 0}
                  </td>

                  {/* W */}
                  <td className="py-3.5 px-3 text-center font-bold text-emerald-600">
                    {standing.wins ?? 0}
                  </td>

                  {/* D */}
                  <td className="py-3.5 px-3 text-center text-amber-600">
                    {standing.draws ?? 0}
                  </td>

                  {/* L */}
                  <td className="py-3.5 px-3 text-center text-rose-500">
                    {standing.losses ?? 0}
                  </td>

                  {/* Points */}
                  <td className="py-3.5 px-3 text-center">
                    <span className="inline-block min-w-6 rounded-md bg-gray-900 px-2 py-0.5 text-xs font-black text-white">
                      {standing.points ?? 0}
                    </span>
                  </td>

                  {/* Score For */}
                  <td className="py-3.5 px-3 text-center text-gray-600 font-mono text-[11px]">
                    {standing.scoreFor ?? 0}
                  </td>

                  {/* Score Against */}
                  <td className="py-3.5 px-3 text-center text-gray-600 font-mono text-[11px]">
                    {standing.scoreAgainst ?? 0}
                  </td>

                  {/* Score Diff */}
                  <td className="py-3.5 px-3 text-center font-semibold font-mono text-[11px]">
                    {(standing.scoreDifference ?? 0) > 0 ? (
                      <span className="text-emerald-600">+{standing.scoreDifference}</span>
                    ) : (standing.scoreDifference ?? 0) < 0 ? (
                      <span className="text-rose-600">{standing.scoreDifference}</span>
                    ) : (
                      <span className="text-gray-400">0</span>
                    )}
                  </td>

                  {/* NRR */}
                  <td className="py-3.5 px-3 text-center font-mono text-[11px] text-gray-700">
                    {standing.normalizedRunRate !== null && standing.normalizedRunRate !== undefined
                      ? (standing.normalizedRunRate > 0 ? '+' : '') + standing.normalizedRunRate.toFixed(2)
                      : '—'}
                  </td>

                  {/* Win % */}
                  <td className="py-3.5 px-3 text-center font-mono text-[11px] text-gray-600">
                    {standing.winPercentage !== null && standing.winPercentage !== undefined
                      ? `${standing.winPercentage.toFixed(1)}%`
                      : '—'}
                  </td>

                  {/* Qualification Status */}
                  <td className="py-3.5 pr-4 pl-3 text-center">
                    {standing.qualified ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800 ring-1 ring-emerald-500/20 shadow-2xs">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Qualified
                      </span>
                    ) : (
                      <span className="text-gray-300 font-bold">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}