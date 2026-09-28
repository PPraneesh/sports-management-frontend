import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router';
import { createTournament } from '../../api/tournament.api';
import { TournamentVisibility } from '../../types/enums';
import type { CreateTournamentRequest } from '../../types/tournament.types';
import ErrorAlert from '../../components/common/ErrorAlert';
import { getApiErrorMessage } from '../../utils/apiError';
import { toLocalDateTimeString } from '../../utils/date';

const todayMin = new Date().toISOString().slice(0, 16);

interface FormState {
  name: string;
  description: string;
  sportType: string;
  location: string;
  visibility: TournamentVisibility;
  maximumTeams: string;
  winPoints: string;
  drawPoints: string;
  lossPoints: string;
  registrationStart: string;
  registrationEnd: string;
  startDate: string;
  endDate: string;
}

const initialForm: FormState = {
  name: '',
  description: '',
  sportType: 'Football',
  location: '',
  visibility: TournamentVisibility.PUBLIC,
  maximumTeams: '8',
  winPoints: '3',
  drawPoints: '1',
  lossPoints: '0',
  registrationStart: '',
  registrationEnd: '',
  startDate: '',
  endDate: '',
};

export default function CreateTournamentPage() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!form.name.trim()) {
      setError('Tournament name is required.');
      return;
    }
    if (!form.sportType.trim()) {
      setError('Sport type is required.');
      return;
    }
    if (!form.location.trim()) {
      setError('Location is required.');
      return;
    }
    if (!form.registrationStart || !form.registrationEnd) {
      setError('Registration start and end dates are required.');
      return;
    }
    if (!form.startDate || !form.endDate) {
      setError('Tournament start and end dates are required.');
      return;
    }

    const payload: CreateTournamentRequest = {
      name: form.name.trim(),
      description: form.description.trim() || undefined,
      sportType: form.sportType.trim(),
      location: form.location.trim(),
      visibility: form.visibility,
      maximumTeams: Number(form.maximumTeams) || 8,
      winPoints: Number(form.winPoints) || 3,
      drawPoints: Number(form.drawPoints) || 1,
      lossPoints: Number(form.lossPoints) || 0,
      registrationStart: toLocalDateTimeString(form.registrationStart),
      registrationEnd: toLocalDateTimeString(form.registrationEnd),
      startDate: toLocalDateTimeString(form.startDate),
      endDate: toLocalDateTimeString(form.endDate),
    };

    try {
      setLoading(true);
      const created = await createTournament(payload);
      navigate(`/tournaments/${created.id}`);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to create tournament.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            Create Tournament
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Set up details, registration timelines, and point structures for your tournament.
          </p>
        </div>
        <Link
          to="/tournaments"
          className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-xs hover:bg-gray-50"
        >
          Cancel
        </Link>
      </div>

      {error && <ErrorAlert message={error} onClose={() => setError('')} />}

      <form onSubmit={handleSubmit} className="space-y-8 divide-y divide-gray-200">
        {/* Basic Information */}
        <div className="space-y-4">
          <h2 className="text-base font-semibold text-gray-900">Basic Information</h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Tournament Name *
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. Champions League 2026"
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3.5 py-2 text-gray-900 shadow-xs focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="sportType" className="block text-sm font-medium text-gray-700">
                Sport Type *
              </label>
              <input
                id="sportType"
                name="sportType"
                type="text"
                required
                value={form.sportType}
                onChange={handleChange}
                placeholder="e.g. Football, Cricket, Badminton"
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3.5 py-2 text-gray-900 shadow-xs focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                Venue / Location *
              </label>
              <input
                id="location"
                name="location"
                type="text"
                required
                value={form.location}
                onChange={handleChange}
                placeholder="e.g. Central Stadium"
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3.5 py-2 text-gray-900 shadow-xs focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900 sm:text-sm"
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={3}
                value={form.description}
                onChange={handleChange}
                placeholder="Brief information about rules, participation eligibility, prizes, etc."
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3.5 py-2 text-gray-900 shadow-xs focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900 sm:text-sm"
              />
            </div>
          </div>
        </div>

        {/* Configuration & Format */}
        <div className="space-y-4 pt-8">
          <h2 className="text-base font-semibold text-gray-900">Format & Points</h2>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label htmlFor="visibility" className="block text-sm font-medium text-gray-700">
                Visibility *
              </label>
              <select
                id="visibility"
                name="visibility"
                value={form.visibility}
                onChange={handleChange}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3.5 py-2 text-gray-900 shadow-xs focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900 sm:text-sm"
              >
                <option value={TournamentVisibility.PUBLIC}>PUBLIC</option>
                <option value={TournamentVisibility.PRIVATE}>PRIVATE</option>
              </select>
            </div>

            <div>
              <label htmlFor="maximumTeams" className="block text-sm font-medium text-gray-700">
                Maximum Teams *
              </label>
              <input
                id="maximumTeams"
                name="maximumTeams"
                type="number"
                min="2"
                max="128"
                required
                value={form.maximumTeams}
                onChange={handleChange}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3.5 py-2 text-gray-900 shadow-xs focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="winPoints" className="block text-sm font-medium text-gray-700">
                Win Points
              </label>
              <input
                id="winPoints"
                name="winPoints"
                type="number"
                min="0"
                value={form.winPoints}
                onChange={handleChange}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3.5 py-2 text-gray-900 shadow-xs focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="drawPoints" className="block text-sm font-medium text-gray-700">
                Draw Points
              </label>
              <input
                id="drawPoints"
                name="drawPoints"
                type="number"
                min="0"
                value={form.drawPoints}
                onChange={handleChange}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3.5 py-2 text-gray-900 shadow-xs focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900 sm:text-sm"
              />
            </div>
          </div>
        </div>

        {/* Schedule & Deadlines */}
        <div className="space-y-4 pt-8">
          <h2 className="text-base font-semibold text-gray-900">Dates & Schedule</h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="registrationStart" className="block text-sm font-medium text-gray-700">
                Registration Opens *
              </label>
              <input
                id="registrationStart"
                name="registrationStart"
                type="datetime-local"
                min={todayMin}
                required
                value={form.registrationStart}
                onChange={handleChange}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3.5 py-2 text-gray-900 shadow-xs focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="registrationEnd" className="block text-sm font-medium text-gray-700">
                Registration Closes *
              </label>
              <input
                id="registrationEnd"
                name="registrationEnd"
                type="datetime-local"
                min={form.registrationStart || todayMin}
                required
                value={form.registrationEnd}
                onChange={handleChange}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3.5 py-2 text-gray-900 shadow-xs focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
                Tournament Starts *
              </label>
              <input
                id="startDate"
                name="startDate"
                type="datetime-local"
                min={form.registrationEnd || todayMin}
                required
                value={form.startDate}
                onChange={handleChange}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3.5 py-2 text-gray-900 shadow-xs focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
                Tournament Ends *
              </label>
              <input
                id="endDate"
                name="endDate"
                type="datetime-local"
                min={form.startDate || todayMin}
                required
                value={form.endDate}
                onChange={handleChange}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3.5 py-2 text-gray-900 shadow-xs focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900 sm:text-sm"
              />
            </div>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-6">
          <Link
            to="/tournaments"
            className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 shadow-xs hover:bg-gray-50"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-gray-900 px-6 py-2.5 text-sm font-semibold text-white shadow-xs transition hover:bg-gray-800 disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Tournament'}
          </button>
        </div>
      </form>
    </div>
  );
}
