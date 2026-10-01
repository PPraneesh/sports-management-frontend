import { Link, useLocation } from 'react-router';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { logout } from '../../features/auth/authSlice';
import {
  HiGlobeAlt,
  HiViewGrid,
  HiStar,
  HiUserGroup,
  HiPlusCircle,
  HiLogout,
} from 'react-icons/hi';

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
    `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${active
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

      <nav className="flex-1 space-y-0.5 p-3">
        <Link
          to="/tournaments/public"
          onClick={onNavigate}
          className={linkClass(
            isActive('/tournaments/public') ||
            isActive('/public/tournaments') ||
            isActive('/public/tournament')
          )}
        >
          <HiGlobeAlt className="h-4 w-4 shrink-0" />
          <span>Browse</span>
        </Link>

        {isAuthenticated ? (
          <>
            <Link
              to="/dashboard"
              onClick={onNavigate}
              className={linkClass(isActive('/dashboard'))}
            >
              <HiViewGrid className="h-4 w-4 shrink-0" />
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
              <HiStar className="h-4 w-4 shrink-0" />
              <span>My Tournaments</span>
            </Link>

            <Link
              to="/my-teams"
              onClick={onNavigate}
              className={linkClass(isActive('/my-teams'))}
            >
              <HiUserGroup className="h-4 w-4 shrink-0" />
              <span>My Teams</span>
            </Link>

            <Link
              to="/tournaments/new"
              onClick={onNavigate}
              className={linkClass(location.pathname === '/tournaments/new')}
            >
              <HiPlusCircle className="h-4 w-4 shrink-0" />
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
            <HiLogout className="h-4 w-4 shrink-0" />
            Sign out
          </button>
        </div>
      )}
    </aside>
  );
}