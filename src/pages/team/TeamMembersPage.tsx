import {
  useEffect,
  useState,
} from 'react';

import {
  Link,
  useParams,
} from 'react-router';

import {
  addTeamMember,
  getTeamById,
  getTeamMembers,
  removeTeamMember,
} from '../../api/team.api';

import type {
  TeamMemberResponse,
  TeamResponse,
} from '../../types/team.types';

import {
  useAppSelector,
} from '../../app/hooks';

import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorAlert from '../../components/common/ErrorAlert';

import {
  getApiErrorMessage,
} from '../../utils/apiError';

import {
  formatDateTime,
} from '../../utils/date';


export default function TeamMembersPage() {
  const { teamId } = useParams();

  const user = useAppSelector(
    (state) => state.auth.user
  );

  const id = Number(teamId);


  const [team, setTeam] =
    useState<TeamResponse | null>(null);

  const [members, setMembers] =
    useState<TeamMemberResponse[]>([]);

  const [userId, setUserId] =
    useState('');

  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [removingId, setRemovingId] =
    useState<number | null>(null);

  const [error, setError] = useState('');
  const [addError, setAddError] =
    useState('');


  const isCaptain =
    user?.id === team?.captainId;


  useEffect(() => {
    if (!teamId || Number.isNaN(id)) return;

    let ignore = false;
    const fetchMembers = async () => {
      try {
        setError('');
        const [teamResponse, membersResponse] = await Promise.all([
          getTeamById(id),
          getTeamMembers(id),
        ]);
        if (ignore) return;
        setTeam(teamResponse);
        setMembers(membersResponse);
      } catch (err) {
        if (!ignore) {
          setError(getApiErrorMessage(err, 'Unable to load team members.'));
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    fetchMembers();

    return () => {
      ignore = true;
    };
  }, [teamId, id]);


  const handleAddMember = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    const numericUserId =
      Number(userId);

    if (!numericUserId) {
      setAddError('Enter a valid user ID.');
      return;
    }

    try {
      setAdding(true);
      setAddError('');

      const member =
        await addTeamMember(
          id,
          {
            userId: numericUserId,
          }
        );

      setMembers((current) => [
        ...current,
        member,
      ]);

      setUserId('');

    } catch (error) {
      setAddError(
        getApiErrorMessage(
          error,
          'Unable to add team member.'
        )
      );
    } finally {
      setAdding(false);
    }
  };


  const handleRemove = async (
    member: TeamMemberResponse
  ) => {
    if (
      member.memberRole === 'CAPTAIN'
    ) {
      return;
    }

    const confirmed =
      window.confirm(
        `Remove user ${member.userId} from this team?`
      );

    if (!confirmed) {
      return;
    }

    try {
      setRemovingId(member.id);

      await removeTeamMember(
        id,
        member.id
      );

      setMembers((current) =>
        current.filter(
          (item) =>
            item.id !== member.id
        )
      );

    } catch (error) {
      setError(
        getApiErrorMessage(
          error,
          'Unable to remove team member.'
        )
      );
    } finally {
      setRemovingId(null);
    }
  };


  if (loading) {
    return (
      <LoadingSpinner message="Loading members..." />
    );
  }


  return (
    <div className="space-y-6">

      {error && (
        <ErrorAlert message={error} />
      )}


      <div>

        <Link
          to={`/teams/${id}`}
          className="text-sm font-medium text-gray-500 hover:text-gray-900"
        >
          ← Team Details
        </Link>


        <h1 className="mt-4 text-2xl font-bold text-gray-900">
          {team?.name} Members
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Manage the players and captain of this team.
        </p>

      </div>


      {isCaptain &&
        team?.status === 'ACTIVE' && (
          <section className="rounded-xl border border-gray-200 bg-white p-6">

            <h2 className="text-lg font-semibold text-gray-900">
              Add Member
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Enter the user ID of the player you want to add.
            </p>


            {addError && (
              <div className="mt-5">
                <ErrorAlert message={addError} />
              </div>
            )}


            <form
              onSubmit={handleAddMember}
              className="mt-5 flex flex-col gap-3 sm:flex-row"
            >

              <input
                type="number"
                min={1}
                value={userId}
                onChange={(event) =>
                  setUserId(
                    event.target.value
                  )
                }
                placeholder="User ID"
                required
                className="min-w-0 flex-1 rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-gray-900"
              />


              <button
                type="submit"
                disabled={adding}
                className="rounded-lg bg-gray-900 px-5 py-3 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-60"
              >
                {adding
                  ? 'Adding...'
                  : 'Add Member'}
              </button>

            </form>

          </section>
        )}


      <section className="overflow-hidden rounded-xl border border-gray-200 bg-white">

        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="font-semibold text-gray-900">
            Members ({members.length})
          </h2>
        </div>


        {members.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-sm text-gray-500">
              No members found.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">

            {members.map((member) => (
              <div
                key={member.id}
                className="flex flex-col justify-between gap-4 px-6 py-5 sm:flex-row sm:items-center"
              >

                <div>

                  <div className="flex flex-wrap items-center gap-3">

                    <p className="font-semibold text-gray-900">
                      User #{member.userId}
                    </p>

                    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
                      {member.memberRole}
                    </span>

                    {member.active ? (
                      <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                        Active
                      </span>
                    ) : (
                      <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-500">
                        Inactive
                      </span>
                    )}

                  </div>


                  <p className="mt-1 text-xs text-gray-500">
                    Joined {formatDateTime(member.joinedAt)}
                  </p>

                </div>


                {isCaptain &&
                  member.memberRole !== 'CAPTAIN' &&
                  member.active && (
                    <button
                      type="button"
                      onClick={() =>
                        handleRemove(member)
                      }
                      disabled={
                        removingId === member.id
                      }
                      className="rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-60"
                    >
                      {removingId === member.id
                        ? 'Removing...'
                        : 'Remove'}
                    </button>
                  )}

              </div>
            ))}

          </div>
        )}

      </section>

    </div>
  );
}