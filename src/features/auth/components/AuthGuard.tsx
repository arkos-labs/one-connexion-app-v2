import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppStore } from '@/stores/useAppStore';

export const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAppStore();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isAuthenticated) {
      // Redirige vers login en mémorisant d'où on vient
      navigate('/login', { state: { from: location }, replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  if (!isAuthenticated) return null;

  return <>{children}</>;
};
