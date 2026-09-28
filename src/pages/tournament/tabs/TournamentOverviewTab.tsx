import { useState } from 'react';
import type { TournamentResponse } from '../../../types/tournament.types';
import { formatDateTime } from '../../../utils/date';

interface TournamentOverviewTabProps {
  tournament: TournamentResponse;
  onNavigateTab: (tabId: string) => void;
  isOrganizer: boolean;
}

export default function TournamentOverviewTab({
  tournament,
}: TournamentOverviewTabProps) {
  const [copied, setCopied] = useState(false);

  const publicUrl = `${window.location.origin}/t/${tournament.publicSlug}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback — select and copy
    }
  };

  return (
    <div className="grid gap-5 lg:grid-cols-3">
      {/* Details */}
      <section className="space-y-5 rounded-xl border border-gray-200 bg-white p-6 lg:col-span-2">
        {/* Name row with copy link */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
              {tournament.sportType}
            </p>
            <p className="mt-0.5 text-sm text-gray-700">{tournament.location}</p>
          </div>

          {tournament.publicSlug && (
            <button
              type="button"
              onClick={handleCopyLink}
              title="Copy public link"
              className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:border-gray-300 hover:bg-white hover:text-gray-900 shrink-0"
            >
              {copied ? (
                <>
                  <svg className="h-3.5 w-3.5 text-emerald-600" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                  </svg>
                  <span className="text-emerald-600">Copied</span>
                </>
              ) : (
                <>
                  <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z"/>
                    <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z"/>
                  </svg>
                  Copy public link
                </>
              )}
            </button>
          )}
        </div>

        {tournament.description && (
          <p className="text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-5">
            {tournament.description}
          </p>
        )}

        <div className="grid gap-x-8 gap-y-5 border-t border-gray-100 pt-5 sm:grid-cols-2 lg:grid-cols-3">
          <InfoItem label="Format" value={formatLabel(tournament.format)} />
          <InfoItem
            label="Visibility"
            value={tournament.visibility === 'PUBLIC' ? 'Public' : 'Private'}
          />
          <InfoItem label="Max Teams" value={String(tournament.maximumTeams)} />
          <InfoItem label="Win" value={`${tournament.winPoints} pts`} />
          <InfoItem label="Draw" value={`${tournament.drawPoints} pts`} />
          <InfoItem label="Loss" value={`${tournament.lossPoints} pts`} />
        </div>
      </section>

      {/* Schedule */}
      <section className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400">
          Schedule
        </h2>

        <div className="mt-4 space-y-4">
          <ScheduleItem
            label="Registration opens"
            value={formatDateTime(tournament.registrationStart)}
          />
          <ScheduleItem
            label="Registration closes"
            value={formatDateTime(tournament.registrationEnd)}
          />
          <ScheduleItem
            label="Tournament starts"
            value={formatDateTime(tournament.startDate)}
          />
          <ScheduleItem
            label="Tournament ends"
            value={formatDateTime(tournament.endDate)}
          />
        </div>
      </section>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] font-medium uppercase tracking-wide text-gray-400">
        {label}
      </p>
      <p className="mt-0.5 text-sm font-medium text-gray-800">{value}</p>
    </div>
  );
}

function ScheduleItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
      <p className="text-[11px] font-medium uppercase tracking-wide text-gray-400">
        {label}
      </p>
      <p className="mt-0.5 text-sm font-medium text-gray-800">{value}</p>
    </div>
  );
}

const formatLabel = (value: string) =>
  value
    ?.replaceAll('_', ' ')
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
