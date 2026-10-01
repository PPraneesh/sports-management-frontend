import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';

import {
  getMyTeams,
  getTeamById,
  getTeamMembers,
  addTeamMember,
  removeTeamMember,
  withdrawTeam,
} from '../../api/team.api';

import type {
  MyTeamSummary,
  TeamMemberResponse,
  TeamResponse,
} from '../../types/team.types';

import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorAlert from '../../components/common/ErrorAlert';
import StatusBadge from '../../components/common/StatusBadge';
import ConfirmationModal from '../../components/common/ConfirmationModal';

import { getApiErrorMessage } from '../../utils/apiError';
import { formatDateTime } from '../../utils/date';


export default function MyTeamManagePage() {
  const { teamId } = useParams();
  const navigate = useNavigate();

  const numericTeamId = Number(teamId);


  // The summary from /api/users/me/teams gives us the memberRole for this team.
  // We load it alongside the full team data.
  const [summary, setSummary] = useState<MyTeamSummary | null>(null);
  const [team, setTeam] = useState<TeamResponse | null>(null);
  const [members, setMembers] = useState<TeamMemberResponse[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Add member
  const [email, setEmail] = useState('');
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState('');

  // Remove member confirmation
  const [removingMember, setRemovingMember] = useState<TeamMemberResponse | null>(null);
  const [removing, setRemoving] = useState(false);
  const [removeError, setRemoveError] = useState('');

  // Withdraw confirmation
  const [withdrawConfirm, setWithdrawConfirm] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);
  const [withdrawError, setWithdrawError] = useState('');

  // Success message
  const [successMessage, setSuccessMessage] = useState('');


  const isCaptain = summary?.memberRole === 'CAPTAIN';


  // ─── Load data ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!teamId || Number.isNaN(numericTeamId)) return;

    let ignore = false;

    const load = async () => {
      try {
        setLoading(true);
        setError('');

        const [teamData, membersData, myTeams] = await Promise.all([
          getTeamById(numericTeamId),
          getTeamMembers(numericTeamId),
          getMyTeams(),
        ]);

        if (ignore) return;

        const found = myTeams.find((t) => t.teamId === numericTeamId) ?? null;

        setTeam(teamData);
        setMembers(membersData);
        setSummary(found);
      } catch (err) {
        if (!ignore) setError(getApiErrorMessage(err, 'Unable to load team.'));
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    load();

    return () => {
      ignore = true;
    };
  }, [teamId, numericTeamId]);


  // ─── Refresh members helper ────────────────────────────────────────────────
  const refreshMembers = async () => {
    const updated = await getTeamMembers(numericTeamId);
    setMembers(updated);
  };


  // ─── Add member ───────────────────────────────────────────────────────────
  const handleAddMember = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!email.trim()) {
      setAddError('Please enter a valid email address.');
      return;
    }

    try {
      setAdding(true);
      setAddError('');

      await addTeamMember(numericTeamId, { email: email.trim() });
      setEmail('');
      setSuccessMessage('Member added successfully.');
      await refreshMembers();
    } catch (err) {
      setAddError(getApiErrorMessage(err, 'Unable to add team member.'));
    } finally {
      setAdding(false);
    }
  };


  // ─── Remove member ────────────────────────────────────────────────────────
  const handleConfirmRemove = async () => {
    if (!removingMember) return;

    try {
      setRemoving(true);
      setRemoveError('');

      await removeTeamMember(numericTeamId, removingMember.id);
      setMembers((current) => current.filter((m) => m.id !== removingMember.id));
      setRemovingMember(null);
      setSuccessMessage('Member removed successfully.');
    } catch (err) {
      setRemoveError(getApiErrorMessage(err, 'Unable to remove team member.'));
    } finally {
      setRemoving(false);
    }
  };


  // ─── Withdraw team ────────────────────────────────────────────────────────
  const handleConfirmWithdraw = async () => {
    try {
      setWithdrawing(true);
      setWithdrawError('');

      await withdrawTeam(numericTeamId);

      setWithdrawConfirm(false);
      setSuccessMessage('Team has been withdrawn from the tournament.');

      // Update local state and redirect back to /my-teams after a brief delay
      setTimeout(() => navigate('/my-teams'), 1500);
    } catch (err) {
      setWithdrawError(getApiErrorMessage(err, 'Unable to withdraw team.'));
    } finally {
      setWithdrawing(false);
    }
  };


  // ─── Render ───────────────────────────────────────────────────────────────
  if (loading) {
    return <LoadingSpinner message="Loading team..." />;
  }

  if (!team) {
    return (
      <div className="space-y-4">
        {error && <ErrorAlert message={error} />}
        <Link to="/my-teams" className="text-sm font-medium text-gray-500 hover:text-gray-900">
          ← My Teams
        </Link>
      </div>
    );
  }

  const captain = members.find((m) => m.memberRole === 'CAPTAIN');
  const players = members.filter((m) => m.memberRole !== 'CAPTAIN');


  return (
    <div className="space-y-6">

      {/* Back link */}
      <Link
        to="/my-teams"
        className="text-sm font-medium text-gray-500 hover:text-gray-900"
      >
        ← My Teams
      </Link>


      {/* Success */}
      {successMessage && (
        <div className="flex items-start justify-between gap-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          <p>{successMessage}</p>
          <button
            type="button"
            onClick={() => setSuccessMessage('')}
            className="font-semibold text-green-700 hover:text-green-900"
          >
            ×
          </button>
        </div>
      )}

      {/* Page-level error */}
      {error && <ErrorAlert message={error} onClose={() => setError('')} />}


      {/* ── Team Header ───────────────────────────────────────────────── */}
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">

        <div className="flex items-center gap-4">

          {team.logoUrl ? (
            <img
              src={team.logoUrl}
              alt={team.name}
              className="h-20 w-20 rounded-2xl border border-gray-200 object-cover"
            />
          ) : (
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gray-100 text-xl font-bold text-gray-600">
              {team.shortName.slice(0, 2).toUpperCase()}
            </div>
          )}

          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">{team.name}</h1>
              <StatusBadge status={team.status} />
            </div>

            <p className="mt-1 text-sm text-gray-500">{team.shortName}</p>

            <p className="mt-1 text-xs text-gray-400">
              Tournament #{team.tournamentId}
              {isCaptain && (
                <span className="ml-3 rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
                  Captain
                </span>
              )}
              {!isCaptain && (
                <span className="ml-3 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-600">
                  Player
                </span>
              )}
            </p>
          </div>

        </div>

      </div>


      {/* ── Add Member (Captain only, Active team) ────────────────────── */}
      {isCaptain && team.status === 'ACTIVE' && (
        <section className="rounded-xl border border-gray-200 bg-white p-6">

          <h2 className="text-lg font-semibold text-gray-900">Add Team Member</h2>
          <p className="mt-1 text-sm text-gray-500">
            Enter the player's email address to add them to the team.
          </p>

          {addError && (
            <div className="mt-4">
              <ErrorAlert message={addError} onClose={() => setAddError('')} />
            </div>
          )}

          <form
            onSubmit={handleAddMember}
            className="mt-5 flex flex-col gap-3 sm:flex-row"
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="player@example.com"
              required
              className="min-w-0 flex-1 rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
            />

            <button
              type="submit"
              disabled={adding}
              className="rounded-lg bg-gray-900 px-5 py-3 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-60"
            >
              {adding ? 'Adding...' : 'Add Member'}
            </button>
          </form>

        </section>
      )}


      {/* ── Members List ──────────────────────────────────────────────── */}
      <section className="overflow-hidden rounded-xl border border-gray-200 bg-white">

        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="font-semibold text-gray-900">
            Members ({members.length})
          </h2>
        </div>

        {removeError && (
          <div className="p-4">
            <ErrorAlert message={removeError} onClose={() => setRemoveError('')} />
          </div>
        )}

        {members.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-sm text-gray-500">No members found.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">

            {/* Captain row */}
            {captain && (
              <MemberRow
                member={captain}
                showRemove={false}
              />
            )}

            {/* Player rows */}
            {players.map((member) => (
              <MemberRow
                key={member.id}
                member={member}
                showRemove={isCaptain && team.status === 'ACTIVE'}
                onRemove={() => setRemovingMember(member)}
              />
            ))}

          </div>
        )}

      </section>


      {/* ── Danger Zone (Captain only, Active team) ───────────────────── */}
      {isCaptain && team.status === 'ACTIVE' && (
        <section className="rounded-xl border border-red-200 bg-red-50 p-6">

          <h2 className="text-base font-semibold text-red-700">Danger Zone</h2>
          <p className="mt-1 text-sm text-red-600">
            Withdrawing your team from the tournament is permanent and cannot be undone.
          </p>

          {withdrawError && (
            <div className="mt-4">
              <ErrorAlert message={withdrawError} onClose={() => setWithdrawError('')} />
            </div>
          )}

          <div className="mt-5">
            <button
              type="button"
              onClick={() => setWithdrawConfirm(true)}
              className="rounded-lg border border-red-300 bg-white px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-100"
            >
              Withdraw Team
            </button>
          </div>

        </section>
      )}


      {/* ── Remove member confirmation ────────────────────────────────── */}
      <ConfirmationModal
        isOpen={!!removingMember}
        title="Remove Team Member"
        message={`Are you sure you want to remove ${removingMember?.name ?? 'this member'} from ${team.name}?`}
        confirmText="Remove"
        isDanger
        loading={removing}
        onConfirm={handleConfirmRemove}
        onCancel={() => {
          setRemovingMember(null);
          setRemoveError('');
        }}
      />


      {/* ── Withdraw confirmation ─────────────────────────────────────── */}
      <ConfirmationModal
        isOpen={withdrawConfirm}
        title="Withdraw Team"
        message="Are you sure you want to withdraw this team from the tournament? This action cannot be undone."
        confirmText="Withdraw"
        isDanger
        loading={withdrawing}
        onConfirm={handleConfirmWithdraw}
        onCancel={() => {
          setWithdrawConfirm(false);
          setWithdrawError('');
        }}
      />

    </div>
  );
}


// ─── MemberRow sub-component ─────────────────────────────────────────────────

interface MemberRowProps {
  member: TeamMemberResponse;
  showRemove: boolean;
  onRemove?: () => void;
}

function MemberRow({ member, showRemove, onRemove }: MemberRowProps) {
  const isCapt = member.memberRole === 'CAPTAIN';

  const initials = member.name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="flex flex-col justify-between gap-4 px-6 py-5 sm:flex-row sm:items-center">

      <div className="flex items-center gap-4">

        {/* Avatar */}
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold ${isCapt
            ? 'bg-amber-100 text-amber-700'
            : 'bg-indigo-100 text-indigo-700'
            }`}
        >
          {initials}
        </div>

        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold text-gray-900">{member.name}</p>

            {isCapt ? (
              <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
                👑 Captain
              </span>
            ) : (
              <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-semibold text-indigo-700">
                Player
              </span>
            )}

            {member.active ? (
              <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-700">
                Active
              </span>
            ) : (
              <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-500">
                Inactive
              </span>
            )}
          </div>

          <p className="mt-0.5 text-xs text-gray-400">{member.email}</p>

          <p className="mt-0.5 text-xs text-gray-400">
            Joined {formatDateTime(member.joinedAt)}
          </p>
        </div>

      </div>


      {showRemove && member.active && (
        <button
          type="button"
          onClick={onRemove}
          className="rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
        >
          Remove
        </button>
      )}

    </div>
  );
}
