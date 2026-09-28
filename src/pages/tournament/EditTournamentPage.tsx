import {
  useEffect,
  useState,
} from 'react';

import {
  Link,
  useNavigate,
  useParams,
} from 'react-router';

import {
  getTournamentById,
  updateTournament,
} from '../../api/tournament.api';

import {
  TournamentVisibility,
} from '../../types/enums';

import type {
  UpdateTournamentRequest,
  TournamentResponse,
} from '../../types/tournament.types';

import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorAlert from '../../components/common/ErrorAlert';

import {
  getApiErrorMessage,
} from '../../utils/apiError';

import {
  toDateTimeLocalInput,
  toLocalDateTimeString,
} from '../../utils/date';


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
  sportType: '',
  location: '',
  visibility: TournamentVisibility.PUBLIC,
  maximumTeams: '4',
  winPoints: '2',
  drawPoints: '1',
  lossPoints: '0',
  registrationStart: '',
  registrationEnd: '',
  startDate: '',
  endDate: '',
};


export default function EditTournamentPage() {
  const { tournamentId } = useParams();
  const navigate = useNavigate();

  const id = Number(tournamentId);

  const [tournament, setTournament] =
    useState<TournamentResponse | null>(null);

  const [form, setForm] =
    useState<FormState>(initialForm);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState('');


  useEffect(() => {
    const loadTournament = async () => {
      try {
        setLoading(true);
        setError('');

        const data =
          await getTournamentById(id);

        setTournament(data);

        setForm({
          name: data.name,
          description: data.description ?? '',
          sportType: data.sportType,
          location: data.location,
          visibility: data.visibility,
          maximumTeams: String(
            data.maximumTeams
          ),
          winPoints: String(
            data.winPoints
          ),
          drawPoints: String(
            data.drawPoints
          ),
          lossPoints: String(
            data.lossPoints
          ),
          registrationStart:
            toDateTimeLocalInput(
              data.registrationStart
            ),
          registrationEnd:
            toDateTimeLocalInput(
              data.registrationEnd
            ),
          startDate:
            toDateTimeLocalInput(
              data.startDate
            ),
          endDate:
            toDateTimeLocalInput(
              data.endDate
            ),
        });

      } catch (error) {
        setError(
          getApiErrorMessage(
            error,
            'Unable to load tournament.'
          )
        );
      } finally {
        setLoading(false);
      }
    };

    if (
      tournamentId &&
      !Number.isNaN(id)
    ) {
      loadTournament();
    }
  }, [tournamentId, id]);


  const updateField = (
    field: keyof FormState,
    value: string
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };


  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError('');

    if (
      form.registrationStart >=
      form.registrationEnd
    ) {
      setError(
        'Registration end must be after registration start.'
      );
      return;
    }

    if (
      form.startDate >=
      form.endDate
    ) {
      setError(
        'Tournament end must be after tournament start.'
      );
      return;
    }

    if (
      form.registrationEnd >
      form.startDate
    ) {
      setError(
        'Registration must end before the tournament starts.'
      );
      return;
    }


    const request: UpdateTournamentRequest = {
      name: form.name.trim(),
      description:
        form.description.trim() ||
        undefined,
      sportType:
        form.sportType.trim(),
      location:
        form.location.trim(),
      visibility:
        form.visibility,
      maximumTeams:
        Number(form.maximumTeams),
      winPoints:
        form.winPoints === ''
          ? undefined
          : Number(form.winPoints),
      drawPoints:
        form.drawPoints === ''
          ? undefined
          : Number(form.drawPoints),
      lossPoints:
        form.lossPoints === ''
          ? undefined
          : Number(form.lossPoints),
      registrationStart:
        toLocalDateTimeString(
          form.registrationStart
        ),
      registrationEnd:
        toLocalDateTimeString(
          form.registrationEnd
        ),
      startDate:
        toLocalDateTimeString(
          form.startDate
        ),
      endDate:
        toLocalDateTimeString(
          form.endDate
        ),
    };


    try {
      setSaving(true);

      const updated =
        await updateTournament(
          id,
          request
        );

      setTournament(updated);

      navigate(
        `/tournaments/${id}`,
        { replace: true }
      );

    } catch (error) {
      setError(
        getApiErrorMessage(
          error,
          'Unable to update tournament.'
        )
      );
    } finally {
      setSaving(false);
    }
  };


  if (loading) {
    return (
      <LoadingSpinner
        message="Loading tournament..."
      />
    );
  }


  if (!tournament) {
    return (
      <ErrorAlert
        message={
          error ||
          'Tournament not found.'
        }
      />
    );
  }


  return (
    <div className="mx-auto max-w-4xl">

      <div className="mb-8">

        <Link
          to={`/tournaments/${id}`}
          className="text-sm font-medium text-gray-500 hover:text-gray-900"
        >
          ← Tournament
        </Link>

        <h1 className="mt-4 text-2xl font-bold text-gray-900">
          Edit Tournament
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Update tournament configuration.
        </p>

      </div>


      {error && (
        <ErrorAlert message={error} />
      )}


      <form
        onSubmit={handleSubmit}
        className="space-y-6"
      >

        <section className="rounded-xl border border-gray-200 bg-white p-6">

          <h2 className="text-lg font-semibold text-gray-900">
            Basic Information
          </h2>

          <div className="mt-6 grid gap-5 md:grid-cols-2">

            <Field label="Tournament Name" required>
              <input
                value={form.name}
                onChange={(e) =>
                  updateField(
                    'name',
                    e.target.value
                  )
                }
                maxLength={150}
                required
                className={inputClass}
              />
            </Field>


            <Field label="Sport Type" required>
              <input
                value={form.sportType}
                onChange={(e) =>
                  updateField(
                    'sportType',
                    e.target.value
                  )
                }
                maxLength={100}
                required
                className={inputClass}
              />
            </Field>


            <Field label="Location" required>
              <input
                value={form.location}
                onChange={(e) =>
                  updateField(
                    'location',
                    e.target.value
                  )
                }
                maxLength={255}
                required
                className={inputClass}
              />
            </Field>


            <Field label="Visibility" required>
              <select
                value={form.visibility}
                onChange={(e) =>
                  updateField(
                    'visibility',
                    e.target.value
                  )
                }
                className={inputClass}
              >
                <option value="PUBLIC">
                  Public
                </option>

                <option value="PRIVATE">
                  Private
                </option>
              </select>
            </Field>


            <div className="md:col-span-2">
              <Field label="Description">
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    updateField(
                      'description',
                      e.target.value
                    )
                  }
                  maxLength={2000}
                  rows={4}
                  className={inputClass}
                />
              </Field>
            </div>

          </div>

        </section>


        <section className="rounded-xl border border-gray-200 bg-white p-6">

          <h2 className="text-lg font-semibold text-gray-900">
            Tournament Rules
          </h2>

          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

            <Field label="Maximum Teams" required>
              <input
                type="number"
                min={4}
                value={form.maximumTeams}
                onChange={(e) =>
                  updateField(
                    'maximumTeams',
                    e.target.value
                  )
                }
                required
                className={inputClass}
              />
            </Field>


            <Field label="Win Points">
              <input
                type="number"
                min={1}
                value={form.winPoints}
                onChange={(e) =>
                  updateField(
                    'winPoints',
                    e.target.value
                  )
                }
                className={inputClass}
              />
            </Field>


            <Field label="Draw Points">
              <input
                type="number"
                min={0}
                value={form.drawPoints}
                onChange={(e) =>
                  updateField(
                    'drawPoints',
                    e.target.value
                  )
                }
                className={inputClass}
              />
            </Field>


            <Field label="Loss Points">
              <input
                type="number"
                min={0}
                value={form.lossPoints}
                onChange={(e) =>
                  updateField(
                    'lossPoints',
                    e.target.value
                  )
                }
                className={inputClass}
              />
            </Field>

          </div>

        </section>


        <section className="rounded-xl border border-gray-200 bg-white p-6">

          <h2 className="text-lg font-semibold text-gray-900">
            Registration Schedule
          </h2>

          <div className="mt-6 grid gap-5 md:grid-cols-2">

            <Field
              label="Registration Start"
              required
            >
              <input
                type="datetime-local"
                value={
                  form.registrationStart
                }
                onChange={(e) =>
                  updateField(
                    'registrationStart',
                    e.target.value
                  )
                }
                required
                className={inputClass}
              />
            </Field>


            <Field
              label="Registration End"
              required
            >
              <input
                type="datetime-local"
                value={
                  form.registrationEnd
                }
                onChange={(e) =>
                  updateField(
                    'registrationEnd',
                    e.target.value
                  )
                }
                required
                className={inputClass}
              />
            </Field>

          </div>

        </section>


        <section className="rounded-xl border border-gray-200 bg-white p-6">

          <h2 className="text-lg font-semibold text-gray-900">
            Tournament Schedule
          </h2>

          <div className="mt-6 grid gap-5 md:grid-cols-2">

            <Field
              label="Tournament Start"
              required
            >
              <input
                type="datetime-local"
                value={form.startDate}
                onChange={(e) =>
                  updateField(
                    'startDate',
                    e.target.value
                  )
                }
                required
                className={inputClass}
              />
            </Field>


            <Field
              label="Tournament End"
              required
            >
              <input
                type="datetime-local"
                value={form.endDate}
                onChange={(e) =>
                  updateField(
                    'endDate',
                    e.target.value
                  )
                }
                required
                className={inputClass}
              />
            </Field>

          </div>

        </section>


        <div className="flex justify-end gap-3 pb-8">

          <Link
            to={`/tournaments/${id}`}
            className="rounded-lg border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-gray-900 px-6 py-3 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-60"
          >
            {saving
              ? 'Saving...'
              : 'Save Changes'}
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
      <label className="mb-2 block text-sm font-medium text-gray-700">
        {label}

        {required && (
          <span className="ml-1 text-red-500">
            *
          </span>
        )}
      </label>

      {children}
    </div>
  );
}


const inputClass =
  'w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900';