import { useState } from 'react';
import { Link } from 'react-router';
import Sidebar from './Sidebar';
import { useAppSelector } from '../../app/hooks';
import { LuMenu } from 'react-icons/lu';

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  const initials = user?.name
    ? user.name
      .split(' ')
      .slice(0, 2)
      .map((n) => n[0])
      .join('')
      .toUpperCase()
    : null;

  return (
    <>
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-gray-200 bg-white px-4 md:px-6">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="flex items-center gap-2 text-sm font-medium text-gray-600 md:hidden"
          aria-label="Open menu"
        >
          <LuMenu className="h-5 w-5" />
        </button>

        {isAuthenticated && user ? (
          <div className="ml-auto flex items-center gap-2.5">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-gray-900 leading-tight">{user.name}</p>
              <p className="text-xs text-gray-400">{user.email}</p>
            </div>
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-900 text-xs font-bold text-white select-none">
              {initials}
            </span>
          </div>
        ) : (
          <div className="ml-auto flex items-center gap-2">
            <Link
              to="/login"
              className="rounded-lg px-3 py-1.5 text-xs font-semibold text-gray-700 transition hover:bg-gray-100"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="rounded-lg bg-gray-900 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-gray-800"
            >
              Register
            </Link>
          </div>
        )}
      </header>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative h-full w-64">
            <Sidebar mobile onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}