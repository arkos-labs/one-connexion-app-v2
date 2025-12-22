import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppStore, useHydration } from '@/stores/useAppStore';

/**
 * AuthGuard - Protège les routes authentifiées
 * 
 * CRITIQUE : Attend l'hydratation du store avant de vérifier l'authentification
 * Cela évite de déconnecter l'utilisateur lors d'un refresh de la page
 */
export const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useAppStore((state) => state.isAuthenticated);
  const hydrated = useHydration(); // ← CRITIQUE : Attend que le localStorage soit lu
  const navigate = useNavigate();
  const location = useLocation();

  // Effet stable pour les abonnements (ne dépend pas de location/navigate)
  useEffect(() => {
    if (hydrated && isAuthenticated) {
      console.log("✅ Authenticated, initializing data stream...");
      const { initializeOrders, subscribeToNewOrders } = useAppStore.getState();

      initializeOrders();
      const unsub = subscribeToNewOrders();

      // Polling de sécurité toutes les 10s pour garantir la réception des ordres
      const interval = setInterval(() => {
        console.log("🔄 [AuthGuard] Polling de sécurité commandes...");
        initializeOrders();
      }, 10000);

      return () => {
        console.log("Cleanup stable order subscriptions and polling");
        unsub();
        clearInterval(interval);
      };
    }
  }, [isAuthenticated, hydrated, useAppStore.getState().initializeOrders, useAppStore.getState().subscribeToNewOrders]);

  useEffect(() => {
    // ⚠️ NE PAS rediriger tant que le store n'est pas hydraté
    if (!hydrated) {
      console.log("⏳ Waiting for store hydration...");
      return;
    }

    // Une fois hydraté, vérifier l'authentification pour redirection
    if (!isAuthenticated) {
      console.log("🚫 Not authenticated, redirecting to login...");
      navigate('/login', { state: { from: location }, replace: true });
    }
  }, [isAuthenticated, hydrated, navigate, location]);

  // Afficher un loader pendant l'hydratation
  if (!hydrated) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  // Si pas authentifié après hydratation, ne rien afficher (redirection en cours)
  if (!isAuthenticated) return null;

  // Authentifié et hydraté → Afficher le contenu protégé
  return <>{children}</>;
};
