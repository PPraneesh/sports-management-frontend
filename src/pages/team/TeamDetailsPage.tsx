import {
  useEffect,
  useState,
} from 'react';

import {
  Link,
//   useNavigate,
  useParams,
} from 'react-router';

import {
  getTeamById,
  updateTeam,
  withdrawTeam,
} from '../../api/team.api';

import type {
  TeamResponse,
  UpdateTeamRequest,
} from '../../types/team.types';

import {
  useAppSelector,
} from '../../app/hooks';

import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorAlert from '../../components/common/ErrorAlert';
import StatusBadge from '../../components/common/StatusBadge';

import {
  getApiErrorMessage,
} from '../../utils/apiError';

import {
  formatDateTime,
} from '../../utils/date';


export default function TeamDetailsPage() {
  const { teamId } = useParams();
//   const navigate = useNavigate();

  const user = useAppSelector(
    (state) => state.auth.user
  );

  const id = Number(teamId);


  const [team, setTeam] =
    useState<TeamResponse | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [withdrawing, setWithdrawing] =
    useState(false);

  const [editing, setEditing] =
    useState(false);

  const [error, setError] = useState('');

  const [form, setForm] =
    useState<UpdateTeamRequest>({
      name: '',
      shortName: '',
      logoUrl: '',
      description: '',
    });


  const isCaptain =
    user?.id === team?.captainId;


  useEffect(() => {
    const loadTeam = async () => {
      try {
        setLoading(true);
        setError('');

        const data = await getTeamById(id);

        setTeam(data);

        setForm({
          name: data.name,
          shortName: data.shortName,
          logoUrl: data.logoUrl ?? '',
          description: data.description ?? '',
        });

      } catch (error) {
        setError(
          getApiErrorMessage(
            error,
            'Unable to load team.'
          )
        );
      } finally {
        setLoading(false);
      }
    };

    if (teamId && !Number.isNaN(id)) {
      loadTeam();
    }
  }, [teamId, id]);


  const handleSave = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError('');

      const updated = await updateTeam(
        id,
        {
          name: form.name.trim(),
          shortName: form.shortName.trim(),
          logoUrl:
            form.logoUrl?.trim() || undefined,
          description:
            form.description?.trim() ||
            undefined,
        }
      );

      setTeam(updated);
      setEditing(false);

    } catch (error) {
      setError(
        getApiErrorMessage(
          error,
          'Unable to update team.'
        )
      );
    } finally {
      setSaving(false);
    }
  };


  const handleWithdraw = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to withdraw this team from the tournament?'
    );

    if (!confirmed) {
      return;
    }

    try {
      setWithdrawing(true);
      setError('');

      await withdrawTeam(id);

      setTeam((current) =>
        current
          ? {
              ...current,
              status: 'WITHDRAWN',
            }
          : current
      );

    } catch (error) {
      setError(
        getApiErrorMessage(
          error,
          'Unable to withdraw team.'
        )
      );
    } finally {
      setWithdrawing(false);
    }
  };


  if (loading) {
    return (
      <LoadingSpinner message="Loading team..." />
    );
  }


  if (!team) {
    return (
      <ErrorAlert
        message={
          error || 'Team not found.'
        }
      />
    );
  }


  return (
    <div className="space-y-6">

      {error && (
        <ErrorAlert message={error} />
      )}


      <div>

        <Link
          to={`/tournaments/${team.tournamentId}/teams`}
          className="text-sm font-medium text-gray-500 hover:text-gray-900"
        >
          ← Tournament Teams
        </Link>


        <div className="mt-4 flex flex-col justify-between gap-5 sm:flex-row sm:items-start">

          <div className="flex items-center gap-4">

            {team.logoUrl ? (
              <img
                src={team.logoUrl}
                alt={team.name}
                className="h-20 w-20 rounded-2xl border border-gray-200 object-cover"
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gray-100 text-xl font-bold text-gray-600">
                {team.shortName
                  .slice(0, 2)
                  .toUpperCase()}
              </div>
            )}


            <div>

              <div className="flex flex-wrap items-center gap-3">

                <h1 className="text-2xl font-bold text-gray-900">
                  {team.name}
                </h1>

                <StatusBadge
                  status={team.status}
                />

              </div>

              <p className="mt-1 text-sm text-gray-500">
                {team.shortName}
              </p>

            </div>

          </div>


          <div className="flex flex-wrap gap-3">

            <Link
              to={`/teams/${team.id}/members`}
              className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              Members
            </Link>


            {isCaptain &&
              team.status === 'ACTIVE' && (
                <>
                  <button
                    type="button"
                    onClick={() =>
                      setEditing(
                        (current) => !current
                      )
                    }
                    className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                  >
                    {editing ? 'Cancel Edit' : 'Edit Team'}
                  </button>

                  <button
                    type="button"
                    onClick={handleWithdraw}
                    disabled={withdrawing}
                    className="rounded-lg border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-60"
                  >
                    {withdrawing
                      ? 'Withdrawing...'
                      : 'Withdraw Team'}
                  </button>
                </>
              )}

          </div>

        </div>

      </div>


      {editing && isCaptain && (
        <section className="rounded-xl border border-gray-200 bg-white p-6">

          <h2 className="text-lg font-semibold text-gray-900">
            Edit Team
          </h2>

          <form
            onSubmit={handleSave}
            className="mt-6 grid gap-5 md:grid-cols-2"
          >

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Team Name
              </label>

              <input
                value={form.name}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    name: event.target.value,
                  }))
                }
                required
                maxLength={150}
                className={inputClass}
              />
            </div>


            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Short Name
              </label>

              <input
                value={form.shortName}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    shortName:
                      event.target.value,
                  }))
                }
                required
                maxLength={30}
                className={inputClass}
              />
            </div>


            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Logo URL
              </label>

              <input
                value={form.logoUrl ?? ''}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    logoUrl:
                      event.target.value,
                  }))
                }
                maxLength={500}
                className={inputClass}
              />
            </div>


            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Description
              </label>

              <textarea
                value={form.description ?? ''}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    description:
                      event.target.value,
                  }))
                }
                maxLength={1000}
                rows={4}
                className={inputClass}
              />
            </div>


            <div className="md:col-span-2 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-gray-900 px-5 py-3 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-60"
              >
                {saving
                  ? 'Saving...'
                  : 'Save Changes'}
              </button>
            </div>

          </form>

        </section>
      )}


      <section className="rounded-xl border border-gray-200 bg-white p-6">

        <h2 className="text-lg font-semibold text-gray-900">
          Team Information
        </h2>

        <div className="mt-6 grid gap-5 sm:grid-cols-2">

          <Info
            label="Team ID"
            value={String(team.id)}
          />

          <Info
            label="Tournament ID"
            value={String(team.tournamentId)}
          />

          <Info
            label="Captain ID"
            value={String(team.captainId)}
          />

          <Info
            label="Status"
            value={team.status}
          />

          <Info
            label="Created"
            value={formatDateTime(team.createdAt)}
          />

          <Info
            label="Updated"
            value={formatDateTime(team.updatedAt)}
          />

          <div className="sm:col-span-2">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
              Description
            </p>

            <p className="mt-2 text-sm text-gray-700">
              {team.description ||
                'No description provided.'}
            </p>
          </div>

        </div>

      </section>

    </div>
  );
}


interface InfoProps {
  label: string;
  value: string;
}


function Info({
  label,
  value,
}: InfoProps) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
        {label}
      </p>

      <p className="mt-1 text-sm font-medium text-gray-900">
        {value}
      </p>
    </div>
  );
}


const inputClass =
  'w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900';