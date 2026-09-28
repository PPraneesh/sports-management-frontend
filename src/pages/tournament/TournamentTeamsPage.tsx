import {
  useEffect,
  useState,
} from 'react';

import {
  Link,
  useParams,
} from 'react-router';

import {
  createManualTeam,
  getTournamentTeams,
  registerTeam,
} from '../../api/team.api';

import {
  getTournamentById,
} from '../../api/tournament.api';

import type {
  ManualTeamRequest,
  RegisterTeamRequest,
  TeamResponse,
} from '../../types/team.types';

import type {
  TournamentResponse,
} from '../../types/tournament.types';

import {
  useAppSelector,
} from '../../app/hooks';

import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorAlert from '../../components/common/ErrorAlert';
import TeamCard from '../../components/team/TeamCard';

import {
  getApiErrorMessage,
} from '../../utils/apiError';


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


export default function TournamentTeamsPage() {
  const { tournamentId } = useParams();

  const user = useAppSelector(
    (state) => state.auth.user
  );

  const id = Number(tournamentId);


  const [tournament, setTournament] =
    useState<TournamentResponse | null>(null);

  const [teams, setTeams] =
    useState<TeamResponse[]>([]);

  const [loading, setLoading] = useState(true);
  const [registerLoading, setRegisterLoading] =
    useState(false);
  const [manualLoading, setManualLoading] =
    useState(false);

  const [error, setError] = useState('');
  const [registerError, setRegisterError] =
    useState('');
  const [manualError, setManualError] =
    useState('');

  const [registerForm, setRegisterForm] =
    useState(emptyRegisterForm);

  const [manualForm, setManualForm] =
    useState(emptyManualForm);


  const isOrganizer =
    tournament?.organizerId === user?.id;


  useEffect(() => {
    if (!tournamentId || Number.isNaN(id)) {
      return;
    }

    let ignore = false;
    const fetchData = async () => {
      try {
        setError('');
        const [tournamentResponse, teamsResponse] = await Promise.all([
          getTournamentById(id),
          getTournamentTeams(id),
        ]);
        if (ignore) return;
        setTournament(tournamentResponse);
        setTeams(teamsResponse);
      } catch (err) {
        if (!ignore) {
          setError(
            getApiErrorMessage(
              err,
              'Unable to load tournament teams.'
            )
          );
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      ignore = true;
    };
  }, [tournamentId, id]);


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
    value: string | number
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

      const team = await registerTeam(
        id,
        {
          ...registerForm,
          name: registerForm.name.trim(),
          shortName: registerForm.shortName.trim(),
          logoUrl:
            registerForm.logoUrl?.trim() || undefined,
          description:
            registerForm.description?.trim() || undefined,
        }
      );

      setTeams((current) => [
        ...current,
        team,
      ]);

      setRegisterForm(emptyRegisterForm);

    } catch (error) {
      setRegisterError(
        getApiErrorMessage(
          error,
          'Unable to register team.'
        )
      );
    } finally {
      setRegisterLoading(false);
    }
  };


  const handleManualTeam = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!manualForm.captainEmail) {
      setManualError(
        'Captain Email Id is required.'
      );
      return;
    }

    try {
      setManualLoading(true);
      setManualError('');

      const team = await createManualTeam(
        id,
        {
          ...manualForm,
          name: manualForm.name.trim(),
          shortName:
            manualForm.shortName.trim(),
          logoUrl:
            manualForm.logoUrl?.trim() || undefined,
          description:
            manualForm.description?.trim() ||
            undefined,
          captainEmail: String(
            manualForm.captainEmail
          ),
        }
      );

      setTeams((current) => [
        ...current,
        team,
      ]);

      setManualForm(emptyManualForm);

    } catch (error) {
      setManualError(
        getApiErrorMessage(
          error,
          'Unable to create manual team.'
        )
      );
    } finally {
      setManualLoading(false);
    }
  };


  if (loading) {
    return (
      <LoadingSpinner message="Loading teams..." />
    );
  }


  return (
    <div className="space-y-8">

      <div>

        <Link
          to={`/tournaments/${id}`}
          className="text-sm font-medium text-gray-500 hover:text-gray-900"
        >
          ← Back to tournament
        </Link>

        <div className="mt-4">
          <h1 className="text-2xl font-bold text-gray-900">
            Tournament Teams
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            {tournament?.name} · {teams.length}/
            {tournament?.maximumTeams} teams
          </p>
        </div>

      </div>


      {error && (
        <ErrorAlert message={error} />
      )}


      <section className="grid gap-6 lg:grid-cols-2">

        <div className="rounded-xl border border-gray-200 bg-white p-6">

          <h2 className="text-lg font-semibold text-gray-900">
            Register My Team
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Register a team using your authenticated account as captain.
          </p>


          {registerError && (
            <div className="mt-5">
              <ErrorAlert message={registerError} />
            </div>
          )}


          <form
            onSubmit={handleRegisterTeam}
            className="mt-6 space-y-4"
          >

            <FormInput
              label="Team Name"
              value={registerForm.name}
              onChange={(value) =>
                updateRegisterField(
                  'name',
                  value
                )
              }
              required
              maxLength={150}
            />

            <FormInput
              label="Short Name"
              value={registerForm.shortName}
              onChange={(value) =>
                updateRegisterField(
                  'shortName',
                  value
                )
              }
              required
              maxLength={30}
            />

            <FormInput
              label="Logo URL"
              value={registerForm.logoUrl ?? ''}
              onChange={(value) =>
                updateRegisterField(
                  'logoUrl',
                  value
                )
              }
              maxLength={500}
            />

            <FormTextarea
              label="Description"
              value={registerForm.description ?? ''}
              onChange={(value) =>
                updateRegisterField(
                  'description',
                  value
                )
              }
              maxLength={1000}
            />


            <button
              type="submit"
              disabled={registerLoading}
              className="w-full rounded-lg bg-gray-900 px-5 py-3 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-60"
            >
              {registerLoading
                ? 'Registering...'
                : 'Register Team'}
            </button>

          </form>

        </div>


        {isOrganizer && (
          <div className="rounded-xl border border-gray-200 bg-white p-6">

            <h2 className="text-lg font-semibold text-gray-900">
              Create Team Manually
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Create a team for a specific captain.
            </p>


            {manualError && (
              <div className="mt-5">
                <ErrorAlert message={manualError} />
              </div>
            )}


            <form
              onSubmit={handleManualTeam}
              className="mt-6 space-y-4"
            >

              <FormInput
                label="Team Name"
                value={manualForm.name}
                onChange={(value) =>
                  updateManualField(
                    'name',
                    value
                  )
                }
                required
                maxLength={150}
              />


              <FormInput
                label="Short Name"
                value={manualForm.shortName}
                onChange={(value) =>
                  updateManualField(
                    'shortName',
                    value
                  )
                }
                required
                maxLength={30}
              />


              <FormInput
                label="Captain Email Id"
                value={
                  
                        manualForm.captainEmail
                   
                }
                onChange={(value) =>
                  updateManualField(
                    'captainEmail',
                    value
                  )
                }
                required
              />


              <FormInput
                label="Logo URL"
                value={
                  manualForm.logoUrl ?? ''
                }
                onChange={(value) =>
                  updateManualField(
                    'logoUrl',
                    value
                  )
                }
                maxLength={500}
              />


              <FormTextarea
                label="Description"
                value={
                  manualForm.description ?? ''
                }
                onChange={(value) =>
                  updateManualField(
                    'description',
                    value
                  )
                }
                maxLength={1000}
              />


              <button
                type="submit"
                disabled={manualLoading}
                className="w-full rounded-lg border border-gray-900 px-5 py-3 text-sm font-semibold text-gray-900 hover:bg-gray-50 disabled:opacity-60"
              >
                {manualLoading
                  ? 'Creating...'
                  : 'Create Manual Team'}
              </button>

            </form>

          </div>
        )}

      </section>


      <section>

        <div className="mb-5">
          <h2 className="text-lg font-semibold text-gray-900">
            Registered Teams
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Teams participating in this tournament.
          </p>
        </div>


        {teams.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center">
            <h3 className="font-semibold text-gray-900">
              No teams registered
            </h3>

            <p className="mt-2 text-sm text-gray-500">
              Teams will appear here after registration.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {teams.map((team) => (
              <TeamCard
                key={team.id}
                team={team}
              />
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
}


function FormInput({
  label,
  value,
  onChange,
  required = false,
  maxLength,
  type = 'text',
}: FormInputProps) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-gray-700">
        {label}
        {required && (
          <span className="ml-1 text-red-500">*</span>
        )}
      </label>

      <input
        type={type}
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        required={required}
        maxLength={maxLength}
        className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
      />
    </div>
  );
}


interface FormTextareaProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  maxLength?: number;
}


function FormTextarea({
  label,
  value,
  onChange,
  maxLength,
}: FormTextareaProps) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-gray-700">
        {label}
      </label>

      <textarea
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        maxLength={maxLength}
        rows={4}
        className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
      />
    </div>
  );
}