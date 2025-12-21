import { useEffect, useState } from "react";
import { useAppStore } from "@/stores/useAppStore";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Navigation, Menu, Bell, Shield, Wallet, Zap } from "lucide-react";
import { DriverMap } from "./DriverMap";
import { ActiveOrderCard } from "./ActiveOrderCard";
import { RideSummary } from "./RideSummary";
import { SlideToAction } from "./SlideToAction";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "@/hooks/use-toast";
import { ClientChat } from "./ClientChat";
import { NewOrderModal } from "./NewOrderModal";
import { useTrafficSimulation } from "@/hooks/useTrafficSimulation";
import { useIncomingOrderAlert } from "@/hooks/useIncomingOrderAlert";
import { useDriverPosition } from "@/hooks/useDriverPosition";
import { useDriverLocationSync, useOrderProgressNotifications } from "@/hooks/useDriverLocationSync";


export const DriverHomeScreen = () => {
  const currentOrder = useAppStore((state) => state.currentOrder);
  const orders = useAppStore((state) => state.orders);
  const driverStatus = useAppStore((state) => state.driverStatus);
  const driverLocation = useAppStore((state) => state.driverLocation);
  const lastCompletedOrder = useAppStore((state) => state.lastCompletedOrder);
  const earnings = useAppStore((state) => state.getEarnings());

  const acceptOrder = useAppStore((state) => state.acceptOrder);
  const updateOrderStatus = useAppStore((state) => state.updateOrderStatus);
  const completeOrder = useAppStore((state) => state.completeOrder);
  const rejectOrder = useAppStore((state) => state.rejectOrder);
  const triggerNewOrder = useAppStore((state) => state.triggerNewOrder);
  const clearSummary = useAppStore((state) => state.clearSummary);
  const initializeOrders = useAppStore((state) => state.initializeOrders);
  const subscribeToNewOrders = useAppStore((state) => state.subscribeToNewOrders);

  const { simulateTravel } = useDriverPosition();

  // Initialization and Subscription
  useEffect(() => {
    initializeOrders();
    const unsubscribe = subscribeToNewOrders();
    return () => unsubscribe();
  }, [initializeOrders, subscribeToNewOrders]);

  // 🔥 HOOKS DE SYNCHRONISATION EN TEMPS RÉEL
  // Synchronise la position du chauffeur toutes les 10s pendant une course
  useDriverLocationSync();

  // Affiche des notifications de progression au chauffeur
  useOrderProgressNotifications();

  // Hooks simulation et alertes
  // useTrafficSimulation();
  useIncomingOrderAlert();

  const [isChatOpen, setIsChatOpen] = useState(false);

  // Find any pending order
  const pendingOrder = orders.find(o => o.status === 'pending');



  const handleSimulateTravel = () => {
    if (!currentOrder) return;
    const target = currentOrder.status === 'accepted' ? currentOrder.pickupLocation : currentOrder.dropoffLocation;
    simulateTravel(target);
  };

  return (
    // CONTENEUR PRINCIPAL : Flex Column pour séparer Carte et Info
    <div className="flex flex-col h-full w-full bg-background relative overflow-hidden">

      {/* 1. ZONE CARTE (Prend tout l'espace restant) */}
      <div className="flex-1 relative w-full min-h-0">
        <DriverMap activeOrder={currentOrder || pendingOrder || null} driverLocation={driverLocation} />

        {/* Boutons flottants sur la carte (GPS, Recentrer...) */}
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

          <Button size="icon" className="rounded-full shadow-lg bg-white text-black hover:bg-zinc-100 h-10 w-10">
            <Navigation className="h-4 w-4" />
          </Button>
          <Button size="icon" className="rounded-full shadow-lg bg-white text-black hover:bg-zinc-100 h-10 w-10">
            <MapPin className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* 2. ZONE INFO (Fixe en bas, ne cache pas la carte) */}
      <div className="shrink-0 z-20 w-full bg-background border-t shadow-[0_-5px_20px_-5px_rgba(0,0,0,0.1)]">
        <AnimatePresence mode="wait">
          {currentOrder ? (
            // CAS 1 : COURSE ACTIVE
            <motion.div
              key="active-order"
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="p-4 pb-0" // Reset padding as Card has its own
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
              className="p-6 space-y-6"
            >
              {/* Statut Toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold">Bonjour, Chauffeur</h2>
                  <p className="text-muted-foreground text-sm">
                    {driverStatus === 'online' ? 'Vous êtes visible' : 'Passez en ligne pour recevoir des courses'}
                  </p>
                </div>
                {/* Indicateur visuel simple */}
                <div className={`h-3 w-3 rounded-full ${driverStatus === 'online' ? 'bg-green-500 animate-pulse' : 'bg-zinc-300'}`} />
              </div>

              {/* Stats Rapides */}
              <div className="grid grid-cols-2 gap-4">
                <Card className="p-4 flex items-center gap-3 bg-secondary/20 border-none">
                  <div className="p-2 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-lg">
                    <Wallet className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">Gains du jour</p>
                    <p className="text-lg font-bold">{earnings.toFixed(2)} €</p>
                  </div>
                </Card>
                <Card className="p-4 flex items-center gap-3 bg-secondary/20 border-none">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-lg">
                    <Shield className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">Taux d'accept.</p>
                    <p className="text-lg font-bold">98%</p>
                  </div>
                </Card>
              </div>

              {/* Statut hors ligne ou recherche msg */}
              <div className="text-center py-4 text-muted-foreground animate-pulse">
                {driverStatus === 'online' ? (
                  <p className="flex items-center justify-center gap-2">
                    <Zap className="h-4 w-4" /> Recherche de courses...
                  </p>
                ) : (
                  <p>Passez en ligne pour commencer</p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* MODALES */}

      {/* 1. Modale de nouvelle commande - IMPOSÉE ICI POUR ÊTRE SÛR QU'ELLE S'AFFICHE */}
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
