import { Navigate, Outlet } from 'react-router';
import { useAppSelector } from '../../app/hooks';

export default function PublicRoute() {
  const { isAuthenticated } = useAppSelector(
    (state) => state.auth
  );

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}