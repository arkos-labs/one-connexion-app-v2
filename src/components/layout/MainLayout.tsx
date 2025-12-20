import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "../AppSidebar";
import { Outlet } from "react-router-dom";
// DevOverlay removed as it does not exist
import { DriverTopBar } from "./DriverTopBar";

// --- IMPORTS CRITIQUES POUR LES COMMANDES ---
import { NewOrderModal } from "@/features/driver/components/NewOrderModal";
import { useIncomingOrderAlert } from "@/hooks/useIncomingOrderAlert";
import { useAppStore } from "@/stores/useAppStore";
// useEffect is no longer needed for navigation

export function MainLayout({ children }: { children?: React.ReactNode }) {
  // 1. Activer l'écoute des commandes GLOBALEMENT
  useIncomingOrderAlert();

  const { currentOrder, orders, isOnDuty, acceptOrder, rejectOrder } = useAppStore();
  // useNavigate is no longer needed

  // Logique pour trouver une commande en attente (même logique que dans l'ancien DriverHomeScreen)
  const pendingOrder = isOnDuty && !currentOrder
    ? orders.find(o => o.status === 'pending') || null
    : null;

  const handleAcceptOrder = (orderId: string) => acceptOrder(orderId);
  const handleRejectOrder = (orderId: string) => rejectOrder(orderId);

  // 2. Redirection automatique vers la carte si une course commence
  // (Si j'accepte une course depuis "Revenus", je veux être renvoyé sur la carte)
  // This useEffect has been removed as per instructions.

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />

        <main className="flex-1 w-full relative flex flex-col overflow-hidden">

          {/* 3. La Barre Supérieure Globale (Statut + Nav) */}
          <DriverTopBar />

          {/* Zone de contenu principale */}
          <div className="flex-1 overflow-auto relative">
            {children || <Outlet />}
          </div>

          {/* 4. LA MODALE DE COMMANDE (Globale) - Maintenant avec les props requises */}
          <NewOrderModal
            order={pendingOrder}
            onAccept={handleAcceptOrder}
            onReject={handleRejectOrder}
          />
        </main>
      </div>
    </SidebarProvider>
  );
}
