import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router';
import {
  cancelTournament,
  closeTournamentRegistration,
  getTournamentById,
  openTournamentRegistration,
} from '../../api/tournament.api';
import type { TournamentResponse } from '../../types/tournament.types';
import { TournamentStatus } from '../../types/enums';
import { useAppSelector } from '../../app/hooks';

import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorAlert from '../../components/common/ErrorAlert';
import StatusBadge from '../../components/common/StatusBadge';
import { getApiErrorMessage } from '../../utils/apiError';

// Tabs
import TournamentOverviewTab from './tabs/TournamentOverviewTab';
import TournamentTeamsTab from './tabs/TournamentTeamsTab';
import TournamentMatchesTab from './tabs/TournamentMatchesTab';
import TournamentEditTab from './tabs/TournamentEditTab';

// ─── Confirmation Dialog ─────────────────────────────────────────────────────

interface ConfirmDialogProps {
  title: string;
  description: string;
  confirmLabel: string;
  confirmClass?: string;
  loading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

function ConfirmDialog({
  title,
  description,
  confirmLabel,
  confirmClass = 'bg-red-600 hover:bg-red-500 text-white',
  loading,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
        onClick={onCancel}
      />
      {/* Card */}
      <div className="relative w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-6 shadow-xl">
        <h2 className="text-base font-bold text-gray-900">{title}</h2>
        <p className="mt-2 text-sm text-gray-500 leading-relaxed">{description}</p>
        <div className="mt-6 flex gap-2.5">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="flex-1 rounded-xl border border-gray-300 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
          >
            Keep it
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 rounded-xl py-2.5 text-sm font-semibold shadow-xs transition disabled:opacity-50 ${confirmClass}`}
          >
            {loading ? 'Please wait…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}


export default function TournamentDetailsPage() {
  const { tournamentId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const user = useAppSelector((state) => state.auth.user);

  const [tournament, setTournament] = useState<TournamentResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [teamsCount, setTeamsCount] = useState<number | undefined>(undefined);

  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showCloseRegDialog, setShowCloseRegDialog] = useState(false);

  const numericTournamentId = Number(tournamentId);
  const activeTab = searchParams.get('tab') || 'overview';

  const handleTabChange = (tabId: string) => {
    setSearchParams(tabId === 'overview' ? {} : { tab: tabId });
  };

  useEffect(() => {
    if (!tournamentId || Number.isNaN(numericTournamentId)) return;

    const loadTournament = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await getTournamentById(numericTournamentId);
        setTournament(data);
      } catch (err) {
        setError(getApiErrorMessage(err, 'Unable to load tournament.'));
      } finally {
        setLoading(false);
      }
    };

    loadTournament();
  }, [numericTournamentId, tournamentId]);

  const executeAction = async (action: () => Promise<TournamentResponse>) => {
    try {
      setActionLoading(true);
      setError('');
      const updated = await action();
      setTournament(updated);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Unable to update tournament status.'));
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenRegistration = () =>
    executeAction(() => openTournamentRegistration(numericTournamentId));

  const handleCloseRegistrationConfirm = async () => {
    await executeAction(() => closeTournamentRegistration(numericTournamentId));
    setShowCloseRegDialog(false);
  };

  const handleCancelConfirm = async () => {
    await executeAction(() => cancelTournament(numericTournamentId));
    setShowCancelDialog(false);
  };

  if (loading) return <LoadingSpinner message="Loading tournament…" />;

  if (!tournament) {
    return <ErrorAlert message={error || 'Tournament could not be found.'} />;
  }

  const isOrganizer = user?.id === tournament.organizerId;

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'teams', label: 'Teams', badge: teamsCount },
    { id: 'matches', label: 'Matches' },
    ...(isOrganizer ? [{ id: 'edit', label: 'Edit' }] : []),
  ];

  return (
    <>
      {showCancelDialog && (
        <ConfirmDialog
          title="Cancel tournament?"
          description="This action cannot be undone. All registered teams will be notified that the tournament has been cancelled."
          confirmLabel="Yes, cancel it"
          loading={actionLoading}
          onConfirm={handleCancelConfirm}
          onCancel={() => setShowCancelDialog(false)}
        />
      )}

      {showCloseRegDialog && (
        <ConfirmDialog
          title="Close registration?"
          description="New teams will no longer be able to register. You can still add teams manually as the organizer."
          confirmLabel="Close registration"
          confirmClass="bg-gray-900 hover:bg-gray-800 text-white"
          loading={actionLoading}
          onConfirm={handleCloseRegistrationConfirm}
          onCancel={() => setShowCloseRegDialog(false)}
        />
      )}

      <div className="space-y-5">
        {error && <ErrorAlert message={error} onClose={() => setError('')} />}

        <div className="flex flex-col justify-between gap-4 border-b border-gray-200 pb-5 lg:flex-row lg:items-end">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                {tournament.name}
              </h1>
              <StatusBadge status={tournament.status} />
            </div>
            <p className="mt-1 text-sm text-gray-400">
              {tournament.sportType} · {tournament.location}
            </p>
          </div>

          {isOrganizer && (
            <div className="flex flex-wrap items-center gap-2">
              {tournament.status === TournamentStatus.DRAFT && (
                <button
                  type="button"
                  onClick={handleOpenRegistration}
                  disabled={actionLoading}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-blue-500 disabled:opacity-60"
                >
                  {actionLoading ? 'Updating…' : 'Open Registration'}
                </button>
              )}

              {tournament.status === TournamentStatus.OPEN && (
                <button
                  type="button"
                  onClick={() => setShowCloseRegDialog(true)}
                  disabled={actionLoading}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-xs font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-60"
                >
                  Close Registration
                </button>
              )}

              {tournament.status !== TournamentStatus.CANCELLED &&
                tournament.status !== TournamentStatus.COMPLETED && (
                  <button
                    type="button"
                    onClick={() => setShowCancelDialog(true)}
                    disabled={actionLoading}
                    className="rounded-lg border border-red-200 px-4 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-60"
                  >
                    Cancel Tournament
                  </button>
                )}
            </div>
          )}
        </div>

        <div className="flex justify-center">
          <div className="grid w-full grid-flow-col auto-cols-fr gap-1 rounded-xl bg-gray-100 p-1">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleTabChange(tab.id)}
                  className={`flex items-center justify-center gap-1.5 rounded-lg py-2 px-3 text-xs font-semibold transition-all ${isActive
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                  <span>{tab.label}</span>
                  {tab.badge !== undefined && tab.badge > 0 && (
                    <span className="rounded-full bg-gray-200 px-1.5 py-px text-[10px] font-bold text-gray-600">
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          {activeTab === 'overview' && (
            <TournamentOverviewTab
              tournament={tournament}
              onNavigateTab={handleTabChange}
              isOrganizer={isOrganizer}
            />
          )}

          {activeTab === 'teams' && (
            <TournamentTeamsTab
              tournamentId={numericTournamentId}
              tournament={tournament}
              isOrganizer={isOrganizer}
              onTeamsCountChange={setTeamsCount}
            />
          )}

          {activeTab === 'matches' && (
            <TournamentMatchesTab tournamentId={numericTournamentId} />
          )}

          {activeTab === 'edit' && (
            <TournamentEditTab
              tournament={tournament}
              onTournamentUpdated={(updated) => setTournament(updated)}
              onBackToOverview={() => handleTabChange('overview')}
            />
          )}
        </div>
      </div>
    </>
  );
}
