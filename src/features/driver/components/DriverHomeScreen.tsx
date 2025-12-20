import { useState } from "react";
import { motion } from "framer-motion";
import { Menu, Bell, MapPin, TrendingUp, Clock, Euro, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DriverStatusToggle, DriverStatusBadge } from "./DriverStatusToggle";
import { NewOrderModal } from "./NewOrderModal";
import { ActiveOrderCard } from "./ActiveOrderCard";
import { DriverMap } from "./DriverMap";
import { useAppStore } from "@/stores/useAppStore";

export const DriverHomeScreen = () => {
  const {
    orders,
    currentOrder,
    acceptOrder,
    rejectOrder,
    updateOrderStatus,
    completeOrder,
    earnings,
    isOnDuty
  } = useAppStore();

  const [showDemo, setShowDemo] = useState(false);

  // Stats derived from store - simple derivation or placeholders for missing data
  const todayStats = [
    { label: "Courses", value: "--", icon: TrendingUp }, // Not tracked in store yet
    { label: "Heures", value: "--h", icon: Clock },      // Not tracked in store yet
    { label: "Gains", value: earnings.toFixed(2) + "€", icon: Euro },
  ];

  const handleAcceptOrder = (orderId: string) => {
    acceptOrder(orderId);
  };

  const handleRejectOrder = (orderId: string) => {
    rejectOrder(orderId);
  };

  const handleOrderStatusChange = (orderId: string, status: 'in_progress' | 'completed') => {
    if (status === 'completed') {
      completeOrder();
    } else {
      updateOrderStatus(status);
    }
  };

  // Logic to find pending order if driver is available
  const pendingOrder = isOnDuty && !currentOrder
    ? orders.find(o => o.status === 'pending') || null
    : null;

  return (
    <div className="min-h-screen pb-32">
      {/* Header */}
      <header className="sticky top-0 z-30 glass border-b border-border/30">
        <div className="flex items-center justify-between p-4">
          <Button variant="ghost" size="icon">
            <Menu className="h-5 w-5" />
          </Button>

          <DriverStatusBadge />

          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            {isOnDuty && (
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-accent" />
            )}
          </Button>
        </div>
      </header>

      <div className="p-4 space-y-6">
        {/* Status Toggle + Map Placeholder */}
        <motion.div
          className="relative flex flex-col items-center justify-center rounded-3xl bg-secondary/30 border border-border/30 overflow-hidden min-h-[350px]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Real Map Background */}
          <div className="absolute inset-0 z-0">
            <DriverMap
              activeOrder={currentOrder}
              driverLocation={{ lat: 48.8566, lng: 2.3522 }} // Default Paris Center
            />
          </div>

          {/* Status Toggle Overlay */}
          <div className="relative z-10 flex flex-col items-center bg-background/60 backdrop-blur-md p-6 rounded-3xl border border-border/20 shadow-lg mt-auto mb-6">
            <DriverStatusToggle />
            <p className="mt-4 text-sm font-medium text-foreground">
              {isOnDuty
                ? "Vous êtes en ligne"
                : "Appuyez pour commencer"}
            </p>
          </div>
        </motion.div>

        {/* Demo Button (Optional / keeping logic minimal) */}
        {/* Removed redundant demo logic since we use store now, but could be added back if needed */}

        {/* Today Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h2 className="text-sm font-medium text-muted-foreground mb-3">
            Aujourd'hui
          </h2>
          <div className="grid grid-cols-3 gap-3">
            {todayStats.map((stat, i) => (
              <Card key={stat.label} className="glass border-border/30">
                <CardContent className="p-3 text-center">
                  <stat.icon className="h-4 w-4 mx-auto mb-1 text-accent" />
                  <p className="text-xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* Quick Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="glass border-border/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary">
                    <Settings className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Préférences</p>
                    <p className="text-xs text-muted-foreground">
                      Zone, véhicule, notifications
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  Modifier
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* New Order Modal - only shows if isOnDuty, no current order, and pending order exists */}
      <NewOrderModal
        order={pendingOrder}
        onAccept={handleAcceptOrder}
        onReject={handleRejectOrder}
      />

      {/* Active Order Card - only shows if currentOrder exists */}
      {currentOrder && (
        <ActiveOrderCard
          order={currentOrder}
          onStatusChange={handleOrderStatusChange}
        />
      )}
    </div>
  );
};
