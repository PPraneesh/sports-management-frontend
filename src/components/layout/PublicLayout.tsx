import { Link, Outlet } from 'react-router';
import { useAppSelector } from '../../app/hooks';

export default function PublicLayout() {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 text-gray-900">
      {/* Public Header */}
      <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur-xs">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-8">
            <Link to="/tournaments/public" className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-900 font-bold text-white shadow-xs">
                S
              </span>
              <span className="text-xl font-bold tracking-tight text-gray-900">
                Sports<span className="text-blue-600">Hub</span>
              </span>
            </Link>

            <nav className="hidden sm:flex sm:items-center sm:gap-6">
              <Link
                to="/tournaments/public"
                className="text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Browse Tournaments
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <span className="hidden text-sm font-medium text-gray-600 sm:inline">
                  Hi, {user?.name}
                </span>
                <Link
                  to="/dashboard"
                  className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white shadow-xs transition hover:bg-gray-800"
                >
                  Dashboard
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="rounded-lg px-3.5 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 hover:text-gray-900"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white shadow-xs transition hover:bg-gray-800"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white py-8 text-center text-sm text-gray-500">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} SportsHub Tournament Management. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
