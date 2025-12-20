import { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Navigation, Phone, MessageCircle, Clock, ChevronUp, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SlideToAction } from "./SlideToAction";
import { Order } from "@/types";

interface ActiveOrderCardProps {
  order: Order;
  onStatusChange: (orderId: string, status: 'in_progress' | 'completed') => void;
}

export const ActiveOrderCard = ({ order, onStatusChange }: ActiveOrderCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Deriving the display state from the global order status
  // accepted -> Driver is on the way to pickup -> Show 'Pickup' UI
  // in_progress -> Driver has picked up client -> Show 'En route' UI

  const isPickupPhase = order.status === 'accepted';
  const isInProgressPhase = order.status === 'in_progress';

  // If status is not accepted or in_progress, this component shouldn't ideally be shown or handled elsewhere, 
  // but we can default gracefully.

  const displayConfig = isPickupPhase ? {
    title: "Récupération",
    address: order.pickupLocation.address,
    addressLabel: "Récupérer à",
    action: "Glisser - Client récupéré",
    actionComplete: "Client à bord !",
    nextStatus: 'in_progress' as const,
  } : {
    // Default to in_progress view
    title: "En route",
    address: order.dropoffLocation.address,
    addressLabel: "Destination",
    action: "Glisser - Course terminée",
    actionComplete: "Arrivé !",
    nextStatus: 'completed' as const,
  };

  return (
    <motion.div
      className="fixed bottom-0 left-0 right-0 z-40"
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      transition={{ type: "spring", damping: 25 }}
    >
      <div className="glass border-t border-border/30 rounded-t-3xl shadow-2xl">
        {/* Handle */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex w-full items-center justify-center py-2"
        >
          {isExpanded ? (
            <ChevronDown className="h-5 w-5 text-muted-foreground" />
          ) : (
            <ChevronUp className="h-5 w-5 text-muted-foreground" />
          )}
        </button>

        {/* Mode Focus - Vue principale */}
        <div className="px-4 pb-4">
          {/* Status + ETA */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/20">
                <Navigation className="h-4 w-4 text-accent" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{displayConfig.title}</p>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {/* Estimations not currently in Order type, using generic or maybe distance if needed */}
                  En cours
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex gap-2">
              <Button size="icon" variant="secondary" className="h-10 w-10 rounded-full">
                <Phone className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="secondary" className="h-10 w-10 rounded-full">
                <MessageCircle className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Adresse principale (celle actuelle) */}
          <div className="mb-4 rounded-xl bg-secondary/50 p-3">
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 text-accent mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">
                  {displayConfig.addressLabel}
                </p>
                <p className="text-sm font-medium">{displayConfig.address}</p>
              </div>
            </div>
          </div>

          {/* Expanded content */}
          <motion.div
            initial={false}
            animate={{ height: isExpanded ? "auto" : 0, opacity: isExpanded ? 1 : 0 }}
            className="overflow-hidden mb-4"
          >
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between rounded-xl bg-secondary/50 p-3">
                <span className="text-sm text-muted-foreground">Client</span>
                <span className="text-sm font-medium">{order.clientName}</span>
              </div>

              {/* If we are driving to destination (in_progress), maybe show pickup address as history? */}
              {isInProgressPhase && (
                <div className="flex items-start gap-2 rounded-xl bg-secondary/50 p-3">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground">Point de départ</p>
                    <p className="text-sm">{order.pickupLocation.address}</p>
                  </div>
                </div>
              )}
              {/* If we are picking up, maybe show destination preview? */}
              {isPickupPhase && (
                <div className="flex items-start gap-2 rounded-xl bg-secondary/50 p-3">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground">Destination</p>
                    <p className="text-sm">{order.dropoffLocation.address}</p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Action Slider */}
          <div className="flex justify-center">
            <SlideToAction
              label={displayConfig.action}
              completeLabel={displayConfig.actionComplete}
              variant="success"
              onComplete={() => onStatusChange(order.id, displayConfig.nextStatus)}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
};
