import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Clock, Euro, X, Navigation, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SlideToAction } from "./SlideToAction";
import { Order } from "@/types";

interface NewOrderModalProps {
  order: Order | null;
  onAccept: (orderId: string) => void;
  onReject: (orderId: string) => void;
}

export const NewOrderModal = ({ order, onAccept, onReject }: NewOrderModalProps) => {
  const [timeLeft, setTimeLeft] = useState(30);

  useEffect(() => {
    if (!order) {
      setTimeLeft(30);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          onReject(order.id);
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    // Vibration si supporté
    if ("vibrate" in navigator) {
      navigator.vibrate([200, 100, 200]);
    }

    return () => clearInterval(timer);
  }, [order, onReject]);

  // Stable handler to prevent slider re-renders
  const handleConfirm = useCallback(() => {
    if (order) {
      onAccept(order.id);
    }
  }, [order, onAccept]);

  return (
    <AnimatePresence>
      {order && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center bg-background/80 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Urgent Pulse Background */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-b from-accent/10 to-transparent"
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
          />

          <motion.div
            className="relative w-full max-w-md mx-4 mb-4 overflow-hidden rounded-3xl border border-accent/30 bg-card shadow-2xl"
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
          >
            {/* Header avec timer */}
            <div className="relative flex items-center justify-between p-4 border-b border-border/30">
              <div className="flex items-center gap-3">
                <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-accent/20">
                  <Navigation className="h-5 w-5 text-accent" />
                  <div className="absolute inset-0 rounded-full bg-accent/30 animate-ping" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Nouvelle course</h3>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {order.clientName}
                  </p>
                </div>
              </div>

              {/* Timer circulaire */}
              <div className="relative flex h-12 w-12 items-center justify-center">
                <svg className="h-12 w-12 -rotate-90 transform">
                  <circle
                    cx="24"
                    cy="24"
                    r="20"
                    fill="none"
                    stroke="hsl(var(--muted))"
                    strokeWidth="3"
                  />
                  <motion.circle
                    cx="24"
                    cy="24"
                    r="20"
                    fill="none"
                    stroke="hsl(var(--accent))"
                    strokeWidth="3"
                    strokeLinecap="round"
                    initial={{ pathLength: 1 }}
                    animate={{ pathLength: timeLeft / 30 }}
                    transition={{ duration: 1 }}
                    style={{
                      strokeDasharray: "126",
                      strokeDashoffset: 0,
                    }}
                  />
                </svg>
                <span className="absolute text-sm font-bold text-accent">{timeLeft}</span>
              </div>
            </div>

            {/* Adresses */}
            <div className="p-4 space-y-4">
              <div className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/20">
                    <div className="h-2.5 w-2.5 rounded-full bg-accent" />
                  </div>
                  <div className="w-0.5 h-8 bg-border/50" />
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-destructive/20">
                    <MapPin className="h-4 w-4 text-destructive" />
                  </div>
                </div>
                <div className="flex-1 space-y-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Départ</p>
                    <p className="text-sm font-medium">{order.pickupLocation.address}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Arrivée</p>
                    <p className="text-sm font-medium">{order.dropoffLocation.address}</p>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-secondary/50 p-3 text-center">
                  <Euro className="h-4 w-4 mx-auto mb-1 text-accent" />
                  <p className="text-lg font-bold">{order.price}€</p>
                  <p className="text-xs text-muted-foreground">Prix</p>
                </div>
                {/* Duration removed as it's not in the Order type yet */}
                <div className="rounded-xl bg-secondary/50 p-3 text-center">
                  <Navigation className="h-4 w-4 mx-auto mb-1 text-accent" />
                  <p className="text-lg font-bold">{order.distance}</p>
                  <p className="text-xs text-muted-foreground">Distance</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="p-4 pt-0 flex flex-col items-center gap-3">
              <SlideToAction
                label="Glisser pour accepter"
                onConfirm={handleConfirm}
              />

              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-destructive"
                onClick={() => onReject(order.id)}
              >
                <X className="h-4 w-4 mr-1" />
                Refuser
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
