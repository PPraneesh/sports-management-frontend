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

// Tournament Management Pages
import MyTournamentsPage from './pages/tournament/MyTournamentsPage';
import CreateTournamentPage from './pages/tournament/CreateTournamentPage';
import TournamentDetailsPage from './pages/tournament/TournamentDetailsPage';

// Team Management Pages
import TeamDetailsPage from './pages/team/TeamDetailsPage';
import TeamMembersPage from './pages/team/TeamMembersPage';
import MyTeamsPage from './pages/team/MyTeamsPage';
import MyTeamManagePage from './pages/team/MyTeamManagePage';

// Match Management Pages
import MatchDetailsPage from './pages/match/MatchDetailsPage';
import MatchManagementPage from './pages/match/MatchManagementPage';

// Invitation Pages
import InvitationsPage from './pages/invitation/InvitationsPage';
import InvitationTokenPage from './pages/invitation/InvitationTokenPage';

// Redirect /t/:slug -> /public/tournaments/:slug
function PublicTournamentSlugRedirect() {
  const { slug } = useParams();
  return <Navigate to={`/public/tournaments/${slug}`} replace />;
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
      // Public Tournament browsing (accessible with or without login)
      {
        path: '/tournaments/public',
        element: <PublicTournamentsPage />,
      },
      {
        // Canonical single-route public tournament experience
        path: '/public/tournaments/:slug',
        element: <PublicTournamentPage />,
      },
      {
        path: '/public/tournaments',
        element: <PublicTournamentPage />,
      },
      {
        // Singular alias: /public/tournament/:slug -> /public/tournaments/:slug
        path: '/public/tournament/:slug',
        element: <PublicTournamentSlugRedirect />,
      },
      {
        // Legacy: /t/:slug -> /public/tournaments/:slug
        path: '/t/:slug',
        element: <PublicTournamentSlugRedirect />,
      },
      {
        // Legacy: /tournaments/public/:slug -> /public/tournaments/:slug
        path: '/tournaments/public/:slug',
        element: <PublicTournamentSlugRedirect />,
      },
      {
        // Legacy match page: redirect to public tournament page (modal handles inline)
        path: '/t/:slug/matches/:matchCode',
        element: <PublicTournamentSlugRedirect />,
      },
      {
        path: '/browse',
        element: <Navigate to="/tournaments/public" replace />,
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
            path: '/my-teams',
            element: <MyTeamsPage />,
          },
          {
            path: '/my-teams/:teamId',
            element: <MyTeamManagePage />,
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