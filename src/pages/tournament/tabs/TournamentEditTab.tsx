import { useState, useEffect } from 'react';
import { updateTournament } from '../../../api/tournament.api';
import { TournamentVisibility } from '../../../types/enums';
import type {
  UpdateTournamentRequest,
  TournamentResponse,
} from '../../../types/tournament.types';
import ErrorAlert from '../../../components/common/ErrorAlert';
import { getApiErrorMessage } from '../../../utils/apiError';
import {
  toDateTimeLocalInput,
  toLocalDateTimeString,
} from '../../../utils/date';

// Minimum selectable date = right now (prevents picking past dates)
const todayMin = new Date().toISOString().slice(0, 16);

interface TournamentEditTabProps {
  tournament: TournamentResponse;
  onTournamentUpdated: (updated: TournamentResponse) => void;
  onBackToOverview?: () => void;
}

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

export default function TournamentEditTab({
  tournament,
  onTournamentUpdated,
  onBackToOverview,
}: TournamentEditTabProps) {
  const [form, setForm] = useState<FormState>({
    name: tournament.name,
    description: tournament.description ?? '',
    sportType: tournament.sportType,
    location: tournament.location,
    visibility: tournament.visibility,
    maximumTeams: String(tournament.maximumTeams),
    winPoints: String(tournament.winPoints),
    drawPoints: String(tournament.drawPoints),
    lossPoints: String(tournament.lossPoints),
    registrationStart: toDateTimeLocalInput(tournament.registrationStart),
    registrationEnd: toDateTimeLocalInput(tournament.registrationEnd),
    startDate: toDateTimeLocalInput(tournament.startDate),
    endDate: toDateTimeLocalInput(tournament.endDate),
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Keep form in sync if tournament prop changes
  useEffect(() => {
    setForm({
      name: tournament.name,
      description: tournament.description ?? '',
      sportType: tournament.sportType,
      location: tournament.location,
      visibility: tournament.visibility,
      maximumTeams: String(tournament.maximumTeams),
      winPoints: String(tournament.winPoints),
      drawPoints: String(tournament.drawPoints),
      lossPoints: String(tournament.lossPoints),
      registrationStart: toDateTimeLocalInput(tournament.registrationStart),
      registrationEnd: toDateTimeLocalInput(tournament.registrationEnd),
      startDate: toDateTimeLocalInput(tournament.startDate),
      endDate: toDateTimeLocalInput(tournament.endDate),
    });
  }, [tournament]);

  const updateField = (field: keyof FormState, value: string) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (form.registrationStart >= form.registrationEnd) {
      setError('Registration end must be after registration start.');
      return;
    }

    if (form.startDate >= form.endDate) {
      setError('Tournament end must be after tournament start.');
      return;
    }

    if (form.registrationEnd > form.startDate) {
      setError('Registration must end before or when the tournament starts.');
      return;
    }

    const request: UpdateTournamentRequest = {
      name: form.name.trim(),
      description: form.description.trim() || undefined,
      sportType: form.sportType.trim(),
      location: form.location.trim(),
      visibility: form.visibility,
      maximumTeams: Number(form.maximumTeams),
      winPoints: form.winPoints === '' ? undefined : Number(form.winPoints),
      drawPoints: form.drawPoints === '' ? undefined : Number(form.drawPoints),
      lossPoints: form.lossPoints === '' ? undefined : Number(form.lossPoints),
      registrationStart: toLocalDateTimeString(form.registrationStart),
      registrationEnd: toLocalDateTimeString(form.registrationEnd),
      startDate: toLocalDateTimeString(form.startDate),
      endDate: toLocalDateTimeString(form.endDate),
    };

    try {
      setSaving(true);
      const updated = await updateTournament(tournament.id, request);
      onTournamentUpdated(updated);
      setSuccess('Tournament configuration updated successfully!');
    } catch (err) {
      setError(getApiErrorMessage(err, 'Unable to update tournament details.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {error && <ErrorAlert message={error} onClose={() => setError('')} />}

      {success && (
        <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800 shadow-xs">
          <span>{success}</span>
          {onBackToOverview && (
            <button
              type="button"
              onClick={onBackToOverview}
              className="rounded-lg bg-emerald-700 px-3 py-1 text-xs font-bold text-white hover:bg-emerald-800"
            >
              View Overview
            </button>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xs">
          <h2 className="text-lg font-semibold text-gray-900">
            Basic Information
          </h2>

          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <Field label="Tournament Name" required>
              <input
                value={form.name}
                onChange={(e) => updateField('name', e.target.value)}
                maxLength={150}
                required
                className={inputClass}
              />
            </Field>

            <Field label="Sport Type" required>
              <input
                value={form.sportType}
                onChange={(e) => updateField('sportType', e.target.value)}
                maxLength={100}
                required
                className={inputClass}
              />
            </Field>

            <Field label="Location / Venue" required>
              <input
                value={form.location}
                onChange={(e) => updateField('location', e.target.value)}
                maxLength={255}
                required
                className={inputClass}
              />
            </Field>

            <Field label="Visibility" required>
              <select
                value={form.visibility}
                onChange={(e) =>
                  updateField('visibility', e.target.value as TournamentVisibility)
                }
                className={inputClass}
              >
                <option value="PUBLIC">Public</option>
                <option value="PRIVATE">Private</option>
              </select>
            </Field>

            <div className="md:col-span-2">
              <Field label="Description">
                <textarea
                  value={form.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  maxLength={2000}
                  rows={4}
                  className={inputClass}
                  placeholder="Details, prize pool, tournament rules, etc..."
                />
              </Field>
            </div>
          </div>
        </section>

        {/* Tournament Rules */}
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xs">
          <h2 className="text-lg font-semibold text-gray-900">
            Tournament Rules & Standings
          </h2>

          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <Field label="Maximum Teams" required>
              <input
                type="number"
                min={4}
                value={form.maximumTeams}
                onChange={(e) => updateField('maximumTeams', e.target.value)}
                required
                className={inputClass}
              />
            </Field>

            <Field label="Win Points">
              <input
                type="number"
                min={1}
                value={form.winPoints}
                onChange={(e) => updateField('winPoints', e.target.value)}
                className={inputClass}
              />
            </Field>

            <Field label="Draw Points">
              <input
                type="number"
                min={0}
                value={form.drawPoints}
                onChange={(e) => updateField('drawPoints', e.target.value)}
                className={inputClass}
              />
            </Field>

            <Field label="Loss Points">
              <input
                type="number"
                min={0}
                value={form.lossPoints}
                onChange={(e) => updateField('lossPoints', e.target.value)}
                className={inputClass}
              />
            </Field>
          </div>
        </section>

        {/* Registration Schedule */}
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xs">
          <h2 className="text-lg font-semibold text-gray-900">
            Registration Schedule
          </h2>

          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <Field label="Registration Opens" required>
              <input
                type="datetime-local"
                min={todayMin}
                value={form.registrationStart}
                onChange={(e) => updateField('registrationStart', e.target.value)}
                required
                className={inputClass}
              />
            </Field>

            <Field label="Registration Closes" required>
              <input
                type="datetime-local"
                min={form.registrationStart || todayMin}
                value={form.registrationEnd}
                onChange={(e) => updateField('registrationEnd', e.target.value)}
                required
                className={inputClass}
              />
            </Field>
          </div>
        </section>

        {/* Tournament Schedule */}
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xs">
          <h2 className="text-lg font-semibold text-gray-900">
            Tournament Match Schedule
          </h2>

          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <Field label="Tournament Starts" required>
              <input
                type="datetime-local"
                min={form.registrationEnd || todayMin}
                value={form.startDate}
                onChange={(e) => updateField('startDate', e.target.value)}
                required
                className={inputClass}
              />
            </Field>

            <Field label="Tournament Ends" required>
              <input
                type="datetime-local"
                min={form.startDate || todayMin}
                value={form.endDate}
                onChange={(e) => updateField('endDate', e.target.value)}
                required
                className={inputClass}
              />
            </Field>
          </div>
        </section>

        {/* Form Actions */}
        <div className="flex justify-end gap-3 pb-8">
          {onBackToOverview && (
            <button
              type="button"
              onClick={onBackToOverview}
              className="rounded-xl border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              Cancel
            </button>
          )}

          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-gray-900 px-6 py-3 text-sm font-semibold text-white shadow-xs transition hover:bg-gray-800 disabled:opacity-60"
          >
            {saving ? 'Saving Changes...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({
  label,
  required = false,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-gray-700">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputClass =
  'w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none transition focus:border-gray-900 focus:ring-1 focus:ring-gray-900';
