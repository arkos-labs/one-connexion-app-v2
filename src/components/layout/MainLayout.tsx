import { useEffect } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "../AppSidebar";
import { Outlet, useLocation } from "react-router-dom";
import { DriverTopBar } from "./DriverTopBar";
import { KeepAwake } from "@capacitor-community/keep-awake";
import { Capacitor } from "@capacitor/core";

// --- IMPORTS CRITIQUES POUR LES COMMANDES ---
import { NewOrderModal } from "@/features/driver/components/NewOrderModal";
import { useIncomingOrderAlert } from "@/hooks/useIncomingOrderAlert";
import { useAppStore } from "@/stores/useAppStore";

export function MainLayout({ children }: { children?: React.ReactNode }) {
  const location = useLocation();

  // 1. Activer l'écoute des commandes GLOBALEMENT
  useIncomingOrderAlert();

  const { currentOrder, orders, isOnDuty, acceptOrder, rejectOrder } = useAppStore();

  // 1.5 Gestion du KeepAwake (Mobile uniquement)
  useEffect(() => {
    const manageKeepAwake = async () => {
      if (!Capacitor.isNativePlatform()) return;

      const isDriverPath = location.pathname.includes('/driver') || location.pathname.includes('/mission');

      try {
        if (isDriverPath) {
          await KeepAwake.keepAwake();
          console.log("🔦 KeepAwake activé (Mode Chauffeur)");
        } else {
          await KeepAwake.allowSleep();
          console.log("💤 KeepAwake désactivé (Mode Passager/Autre)");
        }
      } catch (e) {
        console.warn("KeepAwake Error:", e);
      }
    };

    manageKeepAwake();

    // Nettoyage au démontage
    return () => {
      if (Capacitor.isNativePlatform()) {
        KeepAwake.allowSleep().catch(() => { });
      }
    };
  }, [location.pathname]);

  // Logique pour trouver une commande en attente (globale "pending" ou assignée spécifiquement)
  const pendingOrder = isOnDuty && !currentOrder
    ? orders.find(o =>
      o.status === 'pending' ||
      (o.status === 'assigned' && o.assignedDriverId === useAppStore.getState().user?.id)
    ) || null
    : null;

  const handleAcceptOrder = (orderId: string) => acceptOrder(orderId);
  const handleRejectOrder = (orderId: string) => rejectOrder(orderId);

  return (
    <SidebarProvider>
      <div className="flex h-[100dvh] w-full bg-background overflow-hidden relative">
        <AppSidebar />

        <main className="flex-1 w-full relative flex flex-col h-full overflow-hidden">
          {/* 3. La Barre Supérieure Globale (Statut + Nav) */}
          <DriverTopBar />

          {/* Zone de contenu principale */}
          <div className="flex-1 overflow-auto relative">
            {children || <Outlet />}
          </div>

          {/* 4. LA MODALE DE COMMANDE (Globale) */}
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
