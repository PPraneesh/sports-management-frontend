import { useState } from 'react';
import type { RegisterTeamRequest, TeamResponse } from '../../types/team.types';
import { registerTeam } from '../../api/team.api';
import { getApiErrorMessage } from '../../utils/apiError';
import ErrorAlert from '../common/ErrorAlert';

export interface RegisterTeamTournamentInfo {
  id: number;
  name: string;
  sportType?: string;
}

interface RegisterTeamModalProps {
  isOpen: boolean;
  tournament: RegisterTeamTournamentInfo | null;
  onClose: () => void;
  onSuccess: (team: TeamResponse, tournament: RegisterTeamTournamentInfo) => void;
}

const initialForm: RegisterTeamRequest = {
  name: '',
  shortName: '',
  logoUrl: '',
  description: '',
};

export default function RegisterTeamModal({
  isOpen,
  tournament,
  onClose,
  onSuccess,
}: RegisterTeamModalProps) {
  const [form, setForm] = useState<RegisterTeamRequest>(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [registeredTeam, setRegisteredTeam] = useState<TeamResponse | null>(null);

  if (!isOpen || !tournament) return null;

  const updateField = (field: keyof RegisterTeamRequest, value: string) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleClose = () => {
    setForm(initialForm);
    setError('');
    setRegisteredTeam(null);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.shortName.trim()) {
      setError('Team name and short name are required.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const response = await registerTeam(tournament.id, {
        name: form.name.trim(),
        shortName: form.shortName.trim(),
        logoUrl: form.logoUrl?.trim() || undefined,
        description: form.description?.trim() || undefined,
      });

      setRegisteredTeam(response);
      onSuccess(response, tournament);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to register team.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={handleClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 sm:p-8 shadow-2xl transition-all z-10 max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          type="button"
          onClick={handleClose}
          className="absolute right-5 top-5 rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition"
        >
          ✕
        </button>

        {registeredTeam ? (
          /* Success Screen */
          <div className="py-4 text-center space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-3xl">
              🎉
            </div>

            <h3 className="text-2xl font-black text-gray-900">
              Registration Successful!
            </h3>

            <p className="text-sm text-gray-600">
              Your team <span className="font-bold text-gray-900">{registeredTeam.name}</span> ({registeredTeam.shortName}) has been officially registered for <span className="font-semibold text-blue-600">{tournament.name}</span>.
            </p>

            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 text-left text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500">Team Name:</span>
                <span className="font-bold text-gray-900">{registeredTeam.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Short Code:</span>
                <span className="font-bold text-gray-900">{registeredTeam.shortName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Status:</span>
                <span className="font-bold uppercase text-emerald-700">{registeredTeam.status}</span>
              </div>
              {registeredTeam.description && (
                <div className="pt-2 border-t border-gray-200">
                  <span className="text-gray-500 block mb-1">Description:</span>
                  <p className="text-gray-700">{registeredTeam.description}</p>
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-center">
              <button
                type="button"
                onClick={handleClose}
                className="w-full rounded-xl bg-gray-900 py-3 text-sm font-semibold text-white shadow-xs transition hover:bg-gray-800"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          /* Registration Form */
          <div>
            <div className="pr-8">
              <span className="rounded-md bg-blue-50 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-blue-700">
                {tournament.sportType}
              </span>
              <h2 className="mt-2 text-2xl font-black text-gray-900">
                Register Your Team
              </h2>
              <p className="mt-1 text-xs text-gray-500">
                Tournament: <span className="font-semibold text-gray-800">{tournament.name}</span>
              </p>
            </div>

            {error && (
              <div className="mt-4">
                <ErrorAlert message={error} onClose={() => setError('')} />
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-gray-700">
                  Team Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  maxLength={150}
                  value={form.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  placeholder="e.g. Thunder Strikers or Rama"
                  className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-gray-700">
                  Short Name (Abbreviation) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  maxLength={30}
                  value={form.shortName}
                  onChange={(e) => updateField('shortName', e.target.value)}
                  placeholder="e.g. TS or SR"
                  className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-gray-700">
                  Logo URL
                </label>
                <input
                  type="url"
                  maxLength={500}
                  value={form.logoUrl ?? ''}
                  onChange={(e) => updateField('logoUrl', e.target.value)}
                  placeholder="https://example.com/logo.png"
                  className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-gray-700">
                  Team Description
                </label>
                <textarea
                  maxLength={1000}
                  rows={3}
                  value={form.description ?? ''}
                  onChange={(e) => updateField('description', e.target.value)}
                  placeholder="Tell us about your team, players, or history..."
                  className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 rounded-xl border border-gray-300 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 rounded-xl bg-gray-900 py-3 text-sm font-semibold text-white shadow-xs transition hover:bg-gray-800 disabled:opacity-60"
                >
                  {loading ? 'Registering...' : 'Register Team'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
