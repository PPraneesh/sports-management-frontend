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
  getMyTeam,
} from '../../api/team.api';

import type {
  TeamResponse,
} from '../../types/team.types';

import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorAlert from '../../components/common/ErrorAlert';

import {
  getApiErrorMessage,
} from '../../utils/apiError';


export default function MyTeamPage() {
  const {
    tournamentId,
  } = useParams();

  const navigate = useNavigate();

  const id = Number(tournamentId);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState('');

  const [team, setTeam] =
    useState<TeamResponse | null>(null);


  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError('');

        const data =
          await getMyTeam(id);

        setTeam(data);

      } catch (error) {
        setError(
          getApiErrorMessage(
            error,
            'You do not have a registered team in this tournament.'
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
      load();
    }
  }, [tournamentId, id]);


  if (loading) {
    return (
      <LoadingSpinner message="Loading your team..." />
    );
  }


  if (!team) {
    return (
      <div className="mx-auto max-w-lg py-16 text-center">
        {error && <ErrorAlert message={error} />}

        <h1 className="text-xl font-bold text-gray-900">
          No Team Registered
        </h1>

        <Link
          to={`/tournaments/${id}/teams`}
          className="mt-6 inline-block rounded-lg bg-gray-900 px-5 py-3 text-sm font-semibold text-white"
        >
          View Tournament Teams
        </Link>
      </div>
    );
  }


  return (
    <div className="mx-auto max-w-lg py-16 text-center">

      <h1 className="text-xl font-bold text-gray-900">
        Your Team
      </h1>

      <p className="mt-2 text-sm text-gray-500">
        {team.name}
      </p>

      <button
        type="button"
        onClick={() =>
          navigate(`/teams/${team.id}`)
        }
        className="mt-6 rounded-lg bg-gray-900 px-5 py-3 text-sm font-semibold text-white"
      >
        Open Team
      </button>

    </div>
  );
}