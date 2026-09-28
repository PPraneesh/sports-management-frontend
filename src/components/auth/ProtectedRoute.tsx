import { Navigate, Outlet, useLocation } from 'react-router';
import { useAppSelector } from '../../app/hooks';

export default function ProtectedRoute() {
  const { isAuthenticated } = useAppSelector(
    (state) => state.auth
  );

  const location = useLocation();

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    );
  }

  return <Outlet />;
}