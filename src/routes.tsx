import { createBrowserRouter, Navigate, useParams } from 'react-router';
import { useAppSelector } from './app/hooks';
import ProtectedRoute from './components/auth/ProtectedRoute';
import PublicRoute from './components/auth/PublicRoute';
import AppLayout from './components/layout/AppLayout';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import PublicTournamentsPage from './pages/public/PublicTournamentsPage';
import PublicTournamentPage from './pages/public/PublicTournamentPage';
import MyTournamentsPage from './pages/tournament/MyTournamentsPage';
import CreateTournamentPage from './pages/tournament/CreateTournamentPage';
import TournamentDetailsPage from './pages/tournament/TournamentDetailsPage';
import TeamDetailsPage from './pages/team/TeamDetailsPage';
import TeamMembersPage from './pages/team/TeamMembersPage';
import MyTeamsPage from './pages/team/MyTeamsPage';
import MyTeamManagePage from './pages/team/MyTeamManagePage';
import MatchDetailsPage from './pages/match/MatchDetailsPage';
import MatchManagementPage from './pages/match/MatchManagementPage';

function RootRedirect() {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  return (
    <Navigate
      to={isAuthenticated ? '/dashboard' : '/tournaments/public'}
      replace
    />
  );
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootRedirect />,
  },
  {
    element: <PublicRoute />,
    children: [
      {
        path: '/login',
        element: <LoginPage />,
      },
      {
        path: '/register',
        element: <RegisterPage />,
      },
    ],
  },
  {
    element: <AppLayout />,
    children: [
      {
        path: '/tournaments/public',
        element: <PublicTournamentsPage />,
      },
      {
        path: '/public/tournaments/:slug',
        element: <PublicTournamentPage />,
      },
      {
        path: '/public/tournaments',
        element: <PublicTournamentPage />,
      },
      {
        path: '/browse',
        element: <Navigate to="/tournaments/public" replace />,
      },
      {
        element: <ProtectedRoute />,
        children: [
          {
            path: '/dashboard',
            element: <DashboardPage />,
          },
          {
            path: '/tournaments',
            element: <MyTournamentsPage />,
          },
          {
            path: '/tournaments/new',
            element: <CreateTournamentPage />,
          },
          {
            path: '/tournaments/:tournamentId',
            element: <TournamentDetailsPage />,
          },
          {
            path: '/tournaments/:tournamentId/matches/:matchId',
            element: <MatchDetailsPage />,
          },
          {
            path: '/tournaments/:tournamentId/matches/:matchId/manage',
            element: <MatchManagementPage />,
          },
          {
            path: '/teams/:teamId',
            element: <TeamDetailsPage />,
          },
          {
            path: '/teams/:teamId/members',
            element: <TeamMembersPage />,
          },
          {
            path: '/my-teams',
            element: <MyTeamsPage />,
          },
          {
            path: '/my-teams/:teamId',
            element: <MyTeamManagePage />,
          },
        ],
      },
    ],
  },

  {
    path: '*',
    element: <Navigate to="/tournaments/public" replace />,
  },
]);