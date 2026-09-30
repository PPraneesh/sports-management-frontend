import { Link, useLocation } from 'react-router';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { logout } from '../../features/auth/authSlice';

interface SidebarProps {
  mobile?: boolean;
  onNavigate?: () => void;
}

export default function Sidebar({ mobile = false, onNavigate }: SidebarProps) {
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  const isActive = (path: string) => {
    if (path === '/dashboard') return location.pathname === '/dashboard';
    return location.pathname.startsWith(path);
  };

  const handleLogout = () => dispatch(logout());

  const linkClass = (active: boolean) =>
    `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
      active
        ? 'bg-gray-900 text-white'
        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
    }`;

  return (
    <aside
      className={
        mobile
          ? 'flex h-full w-full flex-col bg-white'
          : 'hidden min-h-screen w-60 shrink-0 flex-col border-r border-gray-200 bg-white md:flex'
      }
    >
      {/* Brand */}
      <div className="border-b border-gray-100 px-5 py-4">
        <Link
          to={isAuthenticated ? '/dashboard' : '/tournaments/public'}
          onClick={onNavigate}
          className="flex items-center gap-2.5"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gray-900 text-xs font-black text-white">
            S
          </span>
          <span className="text-sm font-bold text-gray-900">
            Sports<span className="text-blue-600">Hub</span>
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-0.5 p-3">
        <Link
          to="/tournaments/public"
          onClick={onNavigate}
          className={linkClass(
            isActive('/tournaments/public') ||
            isActive('/public/tournaments') ||
            isActive('/public/tournament') ||
            isActive('/t/')
          )}
        >
          <svg className="h-4 w-4 shrink-0" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
            <path fillRule="evenodd" d="M10 2a8 8 0 100 16A8 8 0 0010 2zm0 14a6 6 0 110-12 6 6 0 010 12z" clipRule="evenodd"/>
          </svg>
          <span>Browse</span>
        </Link>

        {isAuthenticated ? (
          <>
            <Link
              to="/dashboard"
              onClick={onNavigate}
              className={linkClass(isActive('/dashboard'))}
            >
              <svg className="h-4 w-4 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path d="M3 4a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 8a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H4a1 1 0 01-1-1v-4zm8-8a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V4zm0 8a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"/>
              </svg>
              <span>Dashboard</span>
            </Link>

            <Link
              to="/tournaments"
              onClick={onNavigate}
              className={linkClass(
                isActive('/tournaments') &&
                  !isActive('/tournaments/public') &&
                  !isActive('/tournaments/new')
              )}
            >
              <svg className="h-4 w-4 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 1l2.928 6.376L20 8.236l-5 4.874L16.18 20 10 16.54 3.82 20 5 13.11 0 8.236l7.072-.86L10 1z" clipRule="evenodd"/>
              </svg>
              <span>My Tournaments</span>
            </Link>

            <Link
              to="/my-teams"
              onClick={onNavigate}
              className={linkClass(isActive('/my-teams'))}
            >
              <svg className="h-4 w-4 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v1h8v-1zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-1a4.978 4.978 0 00-.22-1.447A4.001 4.001 0 0120 19v1h-4zM4.22 16.553A4.978 4.978 0 004 18v1H0v-1a4.001 4.001 0 014.22-2.447z"/>
              </svg>
              <span>My Teams</span>
            </Link>

            <Link
              to="/tournaments/new"
              onClick={onNavigate}
              className={linkClass(location.pathname === '/tournaments/new')}
            >
              <svg className="h-4 w-4 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd"/>
              </svg>
              <span>New Tournament</span>
            </Link>
          </>
        ) : (
          <div className="mt-4 space-y-2 px-1 pt-2">
            <p className="mb-3 text-xs text-gray-400">
              Sign in to manage tournaments and register teams.
            </p>
            <Link
              to="/login"
              onClick={onNavigate}
              className="block w-full rounded-lg bg-gray-900 py-2 text-center text-xs font-semibold text-white transition hover:bg-gray-800"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              onClick={onNavigate}
              className="block w-full rounded-lg border border-gray-300 py-2 text-center text-xs font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              Create Account
            </Link>
          </div>
        )}
      </nav>

      {/* Footer */}
      {isAuthenticated && (
        <div className="border-t border-gray-100 p-3">
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-gray-500 transition hover:bg-red-50 hover:text-red-600"
          >
            <svg className="h-4 w-4 shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h7a1 1 0 000-2H4V5h6a1 1 0 000-2H3zm11.293 4.293a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 01-1.414-1.414L15.586 11H9a1 1 0 110-2h6.586l-1.293-1.293a1 1 0 010-1.414z" clipRule="evenodd"/>
            </svg>
            Sign out
          </button>
        </div>
      )}
    </aside>
  );
}