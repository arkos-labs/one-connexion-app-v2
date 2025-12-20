import { ReactNode, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "@/stores/useAppStore";
import { SplashScreen } from "@/components/ui/SplashScreen";

interface AuthGuardProps {
  children: ReactNode;
  requireAuth?: boolean;
}

export const AuthGuard = ({ children, requireAuth = true }: AuthGuardProps) => {
  const navigate = useNavigate();
  const {
    isAuthenticated,
    isLoading,
    setIsLoading,
    isSplashComplete,
    setSplashComplete
  } = useAppStore();

  useEffect(() => {
    // Simulate initial auth check
    const timer = setTimeout(() => {
      setSplashComplete(true);
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, [setSplashComplete, setIsLoading]);

  useEffect(() => {
    if (isSplashComplete && !isLoading) {
      if (requireAuth && !isAuthenticated) {
        navigate("/auth/login", { replace: true });
      }
    }
  }, [isSplashComplete, isLoading, isAuthenticated, requireAuth, navigate]);

  if (!isSplashComplete) {
    return <SplashScreen />;
  }

  return <>{children}</>;
};
