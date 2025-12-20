import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Menu, Bell, TrendingUp, Clock, Euro, Settings, PlayCircle, PlusCircle, Car } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DriverStatusToggle, DriverStatusBadge } from "./DriverStatusToggle";
import { ActiveOrderCard } from "./ActiveOrderCard";
import { DriverMap } from "./DriverMap";
import { RideHistorySheet } from "./RideHistorySheet";
import { DriverSettings } from "./DriverSettings";
import { useAppStore } from "@/stores/useAppStore";
import { useDriverPosition } from "@/hooks/useDriverPosition";
import { useDriverAlerts } from "@/hooks/useDriverAlerts";
import { useSidebar } from "@/components/ui/sidebar";
import { RideSummary } from "./RideSummary";
import { AnimatePresence } from "framer-motion";

export const DriverHomeScreen = () => {
  const { toggleSidebar } = useSidebar();
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isSettingsOpen, setSettingsOpen] = useState(false);

  const {
    orders,
    currentOrder,
    history,
    earnings,
    acceptOrder,
    rejectOrder,
    updateOrderStatus,
    completeOrder,
    triggerNewOrder,
    isOnDuty,
    driverLocation,
    lastCompletedOrder
  } = useAppStore();

  const { simulateTravel } = useDriverPosition();
  useDriverAlerts();

  const stats = useMemo(() => {
    const count = history.length;
    const totalMinutes = count * 20;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const timeDisplay = count > 0 ? `${hours}h${minutes > 0 ? minutes : ''}` : "0h";

    return [
      { label: "Courses", value: count.toString(), icon: TrendingUp },
      { label: "Heures", value: timeDisplay, icon: Clock },
      { label: "Gains", value: earnings.toFixed(2) + "€", icon: Euro },
    ];
  }, [history, earnings]);


  const handleOrderStatusChange = (orderId: string, status: 'in_progress' | 'completed') => {
    if (status === 'completed') {
      completeOrder();
    } else {
      updateOrderStatus(status);
    }
  };

  const handleSimulateTrip = () => {
    if (!currentOrder) return;
    const target = currentOrder.status === 'accepted'
      ? currentOrder.pickupLocation
      : currentOrder.dropoffLocation;
    simulateTravel({ lat: target.lat, lng: target.lng });
  };

  return (
    <div className="min-h-screen pb-32">
      {/* Header removed from home screen as it is now global */}

      <div className="p-4 space-y-6">
        {/* Map Container */}
        <motion.div
          className="relative flex flex-col items-center justify-center rounded-3xl bg-secondary/30 border border-border/30 overflow-hidden min-h-[350px] shadow-inner"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="absolute inset-0 z-0">
            <DriverMap
              activeOrder={currentOrder}
              driverLocation={driverLocation}
            />
          </div>

          {/* Dev Tools Overlay */}
          <div className="absolute bottom-4 left-4 z-20 flex flex-col gap-2">
            {currentOrder && (
              <Button
                variant="destructive"
                size="sm"
                className="opacity-90 hover:opacity-100 shadow-xl"
                onClick={handleSimulateTrip}
              >
                <PlayCircle className="mr-2 h-4 w-4" /> Demo: Avancer
              </Button>
            )}

            {isOnDuty && !currentOrder && (
              <Button
                variant="default"
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white shadow-xl"
                onClick={triggerNewOrder}
              >
                <PlusCircle className="mr-2 h-4 w-4" /> Test: New Order
              </Button>
            )}
          </div>
        </motion.div>

        {/* Stats Grid */}
        {/* Stats Grid - Hidden during active order */}
        {!currentOrder && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center justify-between mb-3 px-1">
              <h2 className="text-sm font-medium text-muted-foreground">Performance (Session)</h2>
              <button
                onClick={() => setIsHistoryOpen(true)}
                className="text-xs font-bold text-accent"
              >
                Voir l'historique
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {stats.map((stat) => (
                <Card
                  key={stat.label}
                  className="glass border-border/30 active:scale-95 transition-transform cursor-pointer hover:bg-secondary/20"
                  onClick={() => setIsHistoryOpen(true)}
                >
                  <CardContent className="p-3 text-center">
                    <stat.icon className="h-4 w-4 mx-auto mb-1 text-accent" />
                    <p className="text-xl font-bold">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>
        )}

      </div>

      {/* NewOrderModal Removed from here */}

      {currentOrder && (
        <ActiveOrderCard
          order={currentOrder}
          onStatusChange={handleOrderStatusChange}
        />
      )}

      {/* Ride Summary Overlay */}
      <AnimatePresence>
        {lastCompletedOrder && (
          <RideSummary order={lastCompletedOrder} />
        )}
      </AnimatePresence>

      {/* Sheets */}
      <RideHistorySheet isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} />
      <DriverSettings open={isSettingsOpen} onOpenChange={setSettingsOpen} />

    </div>
  );
};
