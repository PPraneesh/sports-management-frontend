import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router';
import EmptyState from '../../components/common/EmptyState';

export default function InvitationsPage() {
  const [tokenInput, setTokenInput] = useState('');
  const navigate = useNavigate();

  const handleJoin = (e: FormEvent) => {
    e.preventDefault();
    if (!tokenInput.trim()) return;
    navigate(`/invitations/${encodeURIComponent(tokenInput.trim())}`);
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
          Team Invitations
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your tournament and team invitations or redeem an invitation code.
        </p>
      </div>

      {/* Enter Invitation Code Card */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xs">
        <h2 className="text-base font-semibold text-gray-900">
          Have an Invitation Code?
        </h2>
        <p className="mt-1 text-xs text-gray-500">
          If you received an invitation token from a team captain or tournament organizer, enter it below to join.
        </p>

        <form onSubmit={handleJoin} className="mt-4 flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={tokenInput}
            onChange={(e) => setTokenInput(e.target.value)}
            placeholder="Paste your invitation token here..."
            className="flex-1 rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 shadow-xs focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
          />
          <button
            type="submit"
            className="rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white shadow-xs transition hover:bg-gray-800"
          >
            Redeem Token
          </button>
        </form>
      </div>

      {/* Invitations List / Empty State */}
      <EmptyState
        title="No pending invitations"
        description="You have responded to all your invitations or haven't received any yet."
      />
    </div>
  );
}
