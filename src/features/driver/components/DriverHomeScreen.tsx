import { useEffect, useState } from "react";
import { useAppStore } from "@/stores/useAppStore";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Navigation, Target, Wallet, Shield, Zap, Menu } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { DriverMap } from "./DriverMap";
import { ActiveOrderCard } from "./ActiveOrderCard";
import { RideSummary } from "./RideSummary";
import { AnimatePresence, motion } from "framer-motion";
import { ClientChat } from "./ClientChat";
import { NewOrderModal } from "./NewOrderModal";
import { useIncomingOrderAlert } from "@/hooks/useIncomingOrderAlert";
import { useDriverPosition } from "@/hooks/useDriverPosition";
import { useDriverLocationSync, useOrderProgressNotifications } from "@/hooks/useDriverLocationSync";


export const DriverHomeScreen = () => {
  const currentOrder = useAppStore((state) => state.currentOrder);
  const orders = useAppStore((state) => state.orders) || [];
  const driverStatus = useAppStore((state) => state.driverStatus);
  const driverLocation = useAppStore((state) => state.driverLocation);
  const lastCompletedOrder = useAppStore((state) => state.lastCompletedOrder);
  const earnings = useAppStore((state) => state.getEarnings());
  const setDriverStatus = useAppStore((state) => state.setDriverStatus);

  const acceptOrder = useAppStore((state) => state.acceptOrder);
  const updateOrderStatus = useAppStore((state) => state.updateOrderStatus);
  const rejectOrder = useAppStore((state) => state.rejectOrder);

  const { simulateTravel } = useDriverPosition();

  // Initialization
  useEffect(() => {
    console.log("📍 [DriverHomeScreen] Mounted, using global store state");
  }, []);

  // 🔥 HOOKS DE SYNCHRONISATION EN TEMPS RÉEL
  useDriverLocationSync();
  useOrderProgressNotifications();
  useIncomingOrderAlert();

  const [isChatOpen, setIsChatOpen] = useState(false);

  // Commande en attente (si pas de course active)
  const pendingOrder = !currentOrder ? orders.find(o => o.status === 'pending') : null;

  const handleSimulateTravel = () => {
    if (!currentOrder) return;
    const target = currentOrder.status === 'accepted' ? currentOrder.pickupLocation : currentOrder.dropoffLocation;
    simulateTravel(target);
  };

  // Toggle du statut chauffeur
  const toggleDriverStatus = () => {
    if (currentOrder) return; // Ne pas permettre de changer si course active
    setDriverStatus(driverStatus === 'online' ? 'offline' : 'online');
  };

  return (
    <div className="flex flex-col h-full w-full bg-slate-950 relative overflow-hidden">

      {/* Bouton Menu flottant (haut gauche) */}
      <div className="absolute top-4 left-4 z-[500] pointer-events-none">
        <SidebarTrigger asChild>
          <button className="pointer-events-auto h-12 w-12 rounded-full bg-slate-800/90 backdrop-blur-xl border-2 border-yellow-500/50 hover:border-yellow-500 hover:bg-slate-700 transition-all duration-300 shadow-2xl flex items-center justify-center group">
            <Menu className="h-5 w-5 text-yellow-500 group-hover:scale-110 transition-transform" />
          </button>
        </SidebarTrigger>
      </div>

      {/* 2. ZONE CARTE (Plein écran) */}
      <div className="flex-1 relative w-full min-h-0">
        <DriverMap activeOrder={currentOrder || pendingOrder || null} driverLocation={driverLocation} />

        {/* Boutons flottants sur la carte (bas droite) */}
        <div className="absolute right-4 bottom-4 flex flex-col gap-2 pointer-events-auto z-[400]">
          {/* Simulation Button (Demo only) */}
          {currentOrder && (
            <Button
              size="icon"
              onClick={handleSimulateTravel}
              className="rounded-full shadow-lg bg-orange-500 hover:bg-orange-600 text-white h-10 w-10"
              title="Simuler le trajet"
            >
              <Zap className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* 3. ZONE INFO (Card inférieure) */}
      <div className="shrink-0 z-20 w-full">
        <AnimatePresence mode="wait">
          {currentOrder ? (
            // CAS 1 : COURSE ACTIVE
            <motion.div
              key="active-order"
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="p-4"
            >
              <ActiveOrderCard
                order={currentOrder}
                onStatusChange={updateOrderStatus}
                onChatOpen={() => setIsChatOpen(true)}
              />
            </motion.div>
          ) : (
            // CAS 2 : EN ATTENTE / STATUS
            <motion.div
              key="status-panel"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-slate-900/95 backdrop-blur-xl border-t-2 border-slate-800 rounded-t-3xl shadow-2xl"
            >
              <div className="p-6 space-y-5">

                {/* Titre */}
                <div>
                  <h2 className="text-xl font-bold text-white">Bonjour, Chauffeur</h2>
                  <p className="text-slate-400 text-sm">
                    {driverStatus === 'online' ? 'Vous êtes visible' : 'Passez en ligne pour recevoir des courses'}
                  </p>
                </div>

                {/* Stats Rapides */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Gains du jour */}
                  <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-4 flex items-center gap-3">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center shadow-lg shadow-yellow-500/20">
                      <Wallet className="h-6 w-6 text-slate-900" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 font-medium">Gains du jour</p>
                      <p className="text-lg font-bold text-white">{earnings.toFixed(2)} €</p>
                    </div>
                  </div>

                  {/* Taux d'accept */}
                  <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-4 flex items-center gap-3">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center shadow-lg shadow-yellow-500/20">
                      <Shield className="h-6 w-6 text-slate-900" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 font-medium">Taux d'accept</p>
                      <p className="text-lg font-bold text-white">-- %</p>
                    </div>
                  </div>
                </div>

                {/* Message de statut */}
                <div className="text-center py-3">
                  {driverStatus === 'online' ? (
                    <p className="text-slate-400 text-sm flex items-center justify-center gap-2 animate-pulse">
                      <Zap className="h-4 w-4 text-yellow-500" /> Recherche de courses...
                    </p>
                  ) : (
                    <p className="text-slate-500 text-sm">Passez en ligne pour commencer</p>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* MODALES */}

      {/* 1. Modale de nouvelle commande */}
      <AnimatePresence>
        {pendingOrder && (
          <NewOrderModal
            order={pendingOrder}
            onAccept={() => acceptOrder(pendingOrder.id)}
            onReject={() => rejectOrder(pendingOrder.id)}
          />
        )}
      </AnimatePresence>

      {/* 2. Résumé de fin de course */}
      <AnimatePresence>
        {lastCompletedOrder && (
          <RideSummary
            order={lastCompletedOrder}
          />
        )}
      </AnimatePresence>

      <ClientChat isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />

    </div>
  );
};
