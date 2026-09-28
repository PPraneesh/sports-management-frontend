import { useEffect, useState } from 'react';
import {
  createManualTeam,
  getTournamentTeams,
  registerTeam,
} from '../../../api/team.api';
import type {
  ManualTeamRequest,
  RegisterTeamRequest,
  TeamResponse,
} from '../../../types/team.types';
import type { TournamentResponse } from '../../../types/tournament.types';
import { TournamentStatus } from '../../../types/enums';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import ErrorAlert from '../../../components/common/ErrorAlert';
import TeamCard from '../../../components/team/TeamCard';
import { getApiErrorMessage } from '../../../utils/apiError';

interface TournamentTeamsTabProps {
  tournamentId: number;
  tournament: TournamentResponse;
  isOrganizer: boolean;
  onTeamsCountChange?: (count: number) => void;
}

const emptyRegisterForm: RegisterTeamRequest = {
  name: '',
  shortName: '',
  logoUrl: '',
  description: '',
};

const emptyManualForm: ManualTeamRequest = {
  name: '',
  shortName: '',
  logoUrl: '',
  description: '',
  captainEmail: '',
};

export default function TournamentTeamsTab({
  tournamentId,
  tournament,
  isOrganizer,
  onTeamsCountChange,
}: TournamentTeamsTabProps) {
  const [teams, setTeams] = useState<TeamResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [registerLoading, setRegisterLoading] = useState(false);
  const [manualLoading, setManualLoading] = useState(false);

  const [error, setError] = useState('');
  const [registerError, setRegisterError] = useState('');
  const [manualError, setManualError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [registerForm, setRegisterForm] = useState(emptyRegisterForm);
  const [manualForm, setManualForm] = useState(emptyManualForm);

  useEffect(() => {
    let ignore = false;
    const fetchTeams = async () => {
      try {
        setLoading(true);
        setError('');
        const teamsData = await getTournamentTeams(tournamentId);
        if (ignore) return;
        setTeams(teamsData);
        onTeamsCountChange?.(teamsData.length);
      } catch (err) {
        if (!ignore) {
          setError(getApiErrorMessage(err, 'Unable to load tournament teams.'));
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    fetchTeams();

    return () => {
      ignore = true;
    };
  }, [tournamentId, onTeamsCountChange]);

  const updateRegisterField = (
    field: keyof RegisterTeamRequest,
    value: string
  ) => {
    setRegisterForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const updateManualField = (
    field: keyof ManualTeamRequest,
    value: string
  ) => {
    setManualForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleRegisterTeam = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    try {
      setRegisterLoading(true);
      setRegisterError('');
      setSuccessMessage('');

      const team = await registerTeam(tournamentId, {
        name: registerForm.name.trim(),
        shortName: registerForm.shortName.trim(),
        logoUrl: registerForm.logoUrl?.trim() || undefined,
        description: registerForm.description?.trim() || undefined,
      });

      const updated = [...teams, team];
      setTeams(updated);
      onTeamsCountChange?.(updated.length);
      setRegisterForm(emptyRegisterForm);
      setSuccessMessage(`Team "${team.name}" registered successfully!`);
    } catch (err) {
      setRegisterError(getApiErrorMessage(err, 'Unable to register team.'));
    } finally {
      setRegisterLoading(false);
    }
  };

  const handleManualTeam = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!manualForm.captainEmail) {
      setManualError('Captain Email ID is required.');
      return;
    }

    try {
      setManualLoading(true);
      setManualError('');
      setSuccessMessage('');

      const team = await createManualTeam(tournamentId, {
        name: manualForm.name.trim(),
        shortName: manualForm.shortName.trim(),
        logoUrl: manualForm.logoUrl?.trim() || undefined,
        description: manualForm.description?.trim() || undefined,
        captainEmail: manualForm.captainEmail.trim(),
      });

      const updated = [...teams, team];
      setTeams(updated);
      onTeamsCountChange?.(updated.length);
      setManualForm(emptyManualForm);
      setSuccessMessage(`Manual team "${team.name}" created successfully!`);
    } catch (err) {
      setManualError(getApiErrorMessage(err, 'Unable to create manual team.'));
    } finally {
      setManualLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading tournament teams..." />;
  }

  return (
    <div className="space-y-8">
      {error && <ErrorAlert message={error} />}

      {successMessage && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span>✅</span>
            <span>{successMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setSuccessMessage('')}
            className="text-emerald-600 hover:text-emerald-800 text-xs font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Team Registration Forms — only when registration is OPEN */}
      {tournament.status === TournamentStatus.OPEN ? (
        <section className="">
          {/* Register My Team Form */}
          {/* <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xs">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                Register My Team
              </h2>
              <span className="rounded-md bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                Registration Open
              </span>
            </div>

            <p className="mt-1 text-sm text-gray-500">
              Register a team under your account as the team captain.
            </p>

            {registerError && (
              <div className="mt-4">
                <ErrorAlert message={registerError} />
              </div>
            )}

            <form onSubmit={handleRegisterTeam} className="mt-5 space-y-4">
              <FormInput
                label="Team Name"
                value={registerForm.name}
                onChange={(value) => updateRegisterField('name', value)}
                placeholder="e.g. Thunder Strikers or Rama"
                required
                maxLength={150}
              />

              <FormInput
                label="Short Name (Abbreviation)"
                value={registerForm.shortName}
                onChange={(value) => updateRegisterField('shortName', value)}
                placeholder="e.g. TS or SR"
                required
                maxLength={30}
              />

              <FormInput
                label="Logo URL"
                value={registerForm.logoUrl ?? ''}
                onChange={(value) => updateRegisterField('logoUrl', value)}
                placeholder="https://example.com/logo.png"
                maxLength={500}
              />

              <FormTextarea
                label="Description"
                value={registerForm.description ?? ''}
                onChange={(value) => updateRegisterField('description', value)}
                placeholder="Optional team bio, home ground, or motto..."
                maxLength={1000}
              />

              <button
                type="submit"
                disabled={registerLoading}
                className="w-full rounded-xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white shadow-xs transition hover:bg-gray-800 disabled:opacity-60"
              >
                {registerLoading ? 'Registering Team...' : 'Register Team'}
              </button>
            </form>
          </div> */}

          {/* Create Team Manually (Organizer Only) */}
          {isOrganizer ? (
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xs">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                  Create Team Manually
                </h2>
              </div>

              <p className="mt-1 text-sm text-gray-500">
                Add a team on behalf of an existing captain using their email.
              </p>

              {manualError && (
                <div className="mt-4">
                  <ErrorAlert message={manualError} />
                </div>
              )}

              <form onSubmit={handleManualTeam} className="mt-5 space-y-4">
                <FormInput
                  label="Team Name"
                  value={manualForm.name}
                  onChange={(value) => updateManualField('name', value)}
                  placeholder="e.g. Royal Challengers"
                  required
                  maxLength={150}
                />

                <FormInput
                  label="Short Name"
                  value={manualForm.shortName}
                  onChange={(value) => updateManualField('shortName', value)}
                  placeholder="e.g. RC"
                  required
                  maxLength={30}
                />

                <FormInput
                  label="Captain Email ID"
                  type="email"
                  value={manualForm.captainEmail}
                  onChange={(value) => updateManualField('captainEmail', value)}
                  placeholder="captain@example.com"
                  required
                />

                <FormInput
                  label="Logo URL"
                  value={manualForm.logoUrl ?? ''}
                  onChange={(value) => updateManualField('logoUrl', value)}
                  placeholder="https://example.com/logo.png"
                  maxLength={500}
                />

                <FormTextarea
                  label="Description"
                  value={manualForm.description ?? ''}
                  onChange={(value) => updateManualField('description', value)}
                  placeholder="Optional team bio..."
                  maxLength={1000}
                />

                <button
                  type="submit"
                  disabled={manualLoading}
                  className="w-full rounded-xl border border-gray-900 px-5 py-3 text-sm font-semibold text-gray-900 transition hover:bg-gray-50 disabled:opacity-60"
                >
                  {manualLoading ? 'Creating Manual Team...' : 'Create Manual Team'}
                </button>
              </form>
            </div>
          ) : (
            <div className="flex flex-col justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50/50 p-6 text-center">
              <span className="mx-auto text-3xl">👥</span>
              <h3 className="mt-3 text-base font-semibold text-gray-800">
                Captains & Teams
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Each user can register a team to compete in this tournament. If you are a captain, use the form to enter your team!
              </p>
            </div>
          )}
        </section>
      ) : (
        /* Registration is NOT open — show a status notice */
        <RegistrationClosedNotice status={tournament.status} isOrganizer={isOrganizer} />
      )}

      {/* Registered Teams List */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-gray-200 pb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Registered Teams
            </h2>
            <p className="text-sm text-gray-500">
              Teams currently participating in this tournament.
            </p>
          </div>
          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-700">
            {teams.length} / {tournament.maximumTeams} Teams
          </span>
        </div>

        {teams.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center">
            <span className="mx-auto text-4xl">🛡️</span>
            <h3 className="mt-3 font-semibold text-gray-900">
              No teams registered yet
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Be the first to register a team for this tournament!
            </p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {teams.map((team) => (
              <TeamCard key={team.id} team={team} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

interface FormInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  maxLength?: number;
  type?: string;
  placeholder?: string;
}

function FormInput({
  label,
  value,
  onChange,
  required = false,
  maxLength,
  type = 'text',
  placeholder,
}: FormInputProps) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-gray-700">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        maxLength={maxLength}
        placeholder={placeholder}
        className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
      />
    </div>
  );
}

interface FormTextareaProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  maxLength?: number;
  placeholder?: string;
}

function FormTextarea({
  label,
  value,
  onChange,
  maxLength,
  placeholder,
}: FormTextareaProps) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-gray-700">
        {label}
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        maxLength={maxLength}
        rows={3}
        placeholder={placeholder}
        className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
      />
    </div>
  );
}

// --- Registration Closed Notice ---

const STATUS_INFO: Record<
  string,
  { icon: string; title: string; description: string; bgClass: string; borderClass: string; textClass: string; badgeClass: string }
> = {
  DRAFT: {
    icon: '📋',
    title: 'Registration Not Yet Open',
    description: 'This tournament is currently in draft mode. The organizer has not opened registration yet. Check back soon!',
    bgClass: 'bg-gray-50',
    borderClass: 'border-gray-200',
    textClass: 'text-gray-700',
    badgeClass: 'bg-gray-100 text-gray-600',
  },
  REGISTRATION_CLOSED: {
    icon: '🔒',
    title: 'Registration Closed',
    description: 'The registration window for this tournament has ended. No new teams can be added at this stage.',
    bgClass: 'bg-amber-50',
    borderClass: 'border-amber-200',
    textClass: 'text-amber-800',
    badgeClass: 'bg-amber-100 text-amber-700',
  },
  FIXTURES_GENERATED: {
    icon: '📅',
    title: 'Registration Closed — Fixtures Generated',
    description: 'The match schedule has been generated. Registration is closed and all participating teams have been confirmed.',
    bgClass: 'bg-blue-50',
    borderClass: 'border-blue-200',
    textClass: 'text-blue-800',
    badgeClass: 'bg-blue-100 text-blue-700',
  },
  IN_PROGRESS: {
    icon: '⚽',
    title: 'Tournament In Progress',
    description: 'This tournament is currently underway. Registration is closed — check the Matches tab to follow the action live!',
    bgClass: 'bg-green-50',
    borderClass: 'border-green-200',
    textClass: 'text-green-800',
    badgeClass: 'bg-green-100 text-green-700',
  },
  COMPLETED: {
    icon: '🏆',
    title: 'Tournament Completed',
    description: 'This tournament has concluded. Registration is permanently closed.',
    bgClass: 'bg-purple-50',
    borderClass: 'border-purple-200',
    textClass: 'text-purple-800',
    badgeClass: 'bg-purple-100 text-purple-700',
  },
  CANCELLED: {
    icon: '🚫',
    title: 'Tournament Cancelled',
    description: 'This tournament has been cancelled. Registration is no longer available.',
    bgClass: 'bg-red-50',
    borderClass: 'border-red-200',
    textClass: 'text-red-800',
    badgeClass: 'bg-red-100 text-red-700',
  },
};

function RegistrationClosedNotice({
  status,
  isOrganizer,
}: {
  status: string;
  isOrganizer: boolean;
}) {
  const info = STATUS_INFO[status] ?? {
    icon: '🔒',
    title: 'Registration Unavailable',
    description: 'Team registration is not available at this time.',
    bgClass: 'bg-gray-50',
    borderClass: 'border-gray-200',
    textClass: 'text-gray-700',
    badgeClass: 'bg-gray-100 text-gray-600',
  };

  return (
    <div
      className={`rounded-2xl border ${info.borderClass} ${info.bgClass} p-6 sm:p-8`}
    >
      <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
        <span className="text-5xl">{info.icon}</span>
        <div className="flex-1">
          <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
            <h3 className={`text-lg font-bold ${info.textClass}`}>
              {info.title}
            </h3>
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider ${info.badgeClass}`}
            >
              {status.replace(/_/g, ' ')}
            </span>
          </div>
          <p className={`mt-1.5 text-sm leading-relaxed ${info.textClass} opacity-80`}>
            {info.description}
          </p>
          {isOrganizer && status === TournamentStatus.DRAFT && (
            <p className="mt-3 text-xs font-semibold text-blue-600">
              💡 As the organizer, you can open registration from the Overview tab using the "Open Registration" button.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
