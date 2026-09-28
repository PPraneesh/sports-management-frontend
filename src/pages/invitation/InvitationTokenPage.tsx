import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { useAppSelector } from '../../app/hooks';

export default function InvitationTokenPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  const [accepted, setAccepted] = useState(false);
  const [declined, setDeclined] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAccept = async () => {
    setLoading(true);
    // Simulate accepting token
    setTimeout(() => {
      setLoading(false);
      setAccepted(true);
    }, 600);
  };

  const handleDecline = () => {
    setDeclined(true);
  };

  return (
    <div className="mx-auto max-w-lg px-4 py-16 sm:px-6">
      <div className="rounded-3xl border border-gray-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
          <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
          </svg>
        </div>

        <h1 className="mt-4 text-2xl font-bold tracking-tight text-gray-900">
          Team Invitation
        </h1>

        <p className="mt-2 text-sm text-gray-500">
          You have been invited to join a sports team using invitation token:
        </p>

        <div className="mt-4 inline-block rounded-lg bg-gray-100 px-4 py-2 font-mono text-xs font-semibold text-gray-800 break-all">
          {token}
        </div>

        {accepted ? (
          <div className="mt-8 space-y-4">
            <div className="rounded-xl bg-green-50 p-4 text-sm font-medium text-green-800">
              🎉 Invitation accepted successfully! Welcome to the team.
            </div>
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="w-full rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-gray-800"
            >
              Go to Dashboard
            </button>
          </div>
        ) : declined ? (
          <div className="mt-8 space-y-4">
            <div className="rounded-xl bg-gray-100 p-4 text-sm font-medium text-gray-700">
              You declined this invitation.
            </div>
            <Link
              to="/tournaments/public"
              className="inline-block text-sm font-medium text-blue-600 hover:text-blue-500"
            >
              Browse Public Tournaments
            </Link>
          </div>
        ) : !isAuthenticated ? (
          <div className="mt-8 space-y-3">
            <p className="text-xs text-amber-600 font-medium">
              Please sign in or create an account to accept this invitation.
            </p>
            <div className="flex gap-3">
              <Link
                to="/login"
                className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-xs hover:bg-gray-50"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="flex-1 rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white shadow-xs hover:bg-gray-800"
              >
                Register
              </Link>
            </div>
          </div>
        ) : (
          <div className="mt-8 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={handleDecline}
              disabled={loading}
              className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 shadow-xs hover:bg-gray-50 disabled:opacity-50"
            >
              Decline
            </button>
            <button
              type="button"
              onClick={handleAccept}
              disabled={loading}
              className="rounded-lg bg-gray-900 px-6 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-gray-800 disabled:opacity-50"
            >
              {loading ? 'Joining...' : 'Accept & Join Team'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
