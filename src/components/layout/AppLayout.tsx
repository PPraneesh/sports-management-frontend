import { Outlet } from 'react-router';

import Navbar from './Navbar';
import Sidebar from './Sidebar';


export default function AppLayout() {
  return (
    <div className="min-h-screen bg-gray-50">

      <div className="flex min-h-screen">

        <Sidebar />

        <div className="min-w-0 flex-1">

          <Navbar />

          <main className="mx-auto max-w-7xl px-4 py-6 md:px-6">
            <Outlet />
          </main>

        </div>

      </div>

    </div>
  );
}