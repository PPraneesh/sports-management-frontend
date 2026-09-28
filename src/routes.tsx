import { createBrowserRouter, Navigate, useParams } from 'react-router';
import { useAppSelector } from './app/hooks';

// Auth Route Guards & Layouts
import ProtectedRoute from './components/auth/ProtectedRoute';
import PublicRoute from './components/auth/PublicRoute';
import AppLayout from './components/layout/AppLayout';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Dashboard
import DashboardPage from './pages/dashboard/DashboardPage';

// Public Pages
import PublicTournamentsPage from './pages/public/PublicTournamentsPage';
import PublicTournamentPage from './pages/public/PublicTournamentPage';
import PublicMatchPage from './pages/public/PublicMatchPage';

// Tournament Management Pages
import MyTournamentsPage from './pages/tournament/MyTournamentsPage';
import CreateTournamentPage from './pages/tournament/CreateTournamentPage';
import TournamentDetailsPage from './pages/tournament/TournamentDetailsPage';

// Team Management Pages
import TeamDetailsPage from './pages/team/TeamDetailsPage';
import TeamMembersPage from './pages/team/TeamMembersPage';

// Match Management Pages
import MatchDetailsPage from './pages/match/MatchDetailsPage';
import MatchManagementPage from './pages/match/MatchManagementPage';

// Invitation Pages
import InvitationsPage from './pages/invitation/InvitationsPage';
import InvitationTokenPage from './pages/invitation/InvitationTokenPage';

// Helper component for backward compatibility redirects to the single route with tabs
function TournamentTabRedirect({ tab }: { tab: string }) {
  const { tournamentId } = useParams();
  return <Navigate to={`/tournaments/${tournamentId}?tab=${tab}`} replace />;
}

// Smart root redirect based on auth status
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

  // Auth pages (redirects to /dashboard if already logged in)
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

  // Unified AppLayout Shell for both Public browsing and Protected management
  {
    element: <AppLayout />,
    children: [
      // Public Tournament & Match browsing (accessible with or without login, with conditional rendering)
      {
        path: '/tournaments/public',
        element: <PublicTournamentsPage />,
      },
      {
        path: '/browse',
        element: <Navigate to="/tournaments/public" replace />,
      },
      {
        path: '/t/:slug',
        element: <PublicTournamentPage />,
      },
      {
        path: '/tournaments/public/:slug',
        element: <PublicTournamentPage />,
      },
      {
        path: '/t/:slug/matches/:matchCode',
        element: <PublicMatchPage />,
      },
      {
        path: '/invitations/:token',
        element: <InvitationTokenPage />,
      },

      // Authenticated Protected Organizer & Team area
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
            path: '/tournaments/create',
            element: <Navigate to="/tournaments/new" replace />,
          },
          {
            path: '/tournaments/:tournamentId',
            element: <TournamentDetailsPage />,
          },
          // Legacy route redirects to the single route with tabs
          {
            path: '/tournaments/:tournamentId/edit',
            element: <TournamentTabRedirect tab="edit" />,
          },
          {
            path: '/tournaments/:tournamentId/teams',
            element: <TournamentTabRedirect tab="teams" />,
          },
          {
            path: '/tournaments/:tournamentId/matches',
            element: <TournamentTabRedirect tab="matches" />,
          },
          {
            path: '/tournaments/:tournamentId/team',
            element: <TournamentTabRedirect tab="my-team" />,
          },
          {
            path: '/tournaments/:tournamentId/matches/:matchId',
            element: <MatchDetailsPage />,
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
            path: '/matches/:matchId',
            element: <MatchDetailsPage />,
          },
          {
            path: '/matches/:matchId/manage',
            element: <MatchManagementPage />,
          },
          {
            path: '/invitations',
            element: <InvitationsPage />,
          },
        ],
      },
    ],
  },

  // 404 Fallback
  {
    path: '*',
    element: <Navigate to="/tournaments/public" replace />,
  },
]);