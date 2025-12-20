import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MapPin, Navigation, Phone, MessageCircle, ChevronUp, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SlideToAction } from "./SlideToAction";
import { Order } from "@/types";

interface ActiveOrderCardProps {
  order: Order;
  onStatusChange: (orderId: string, status: 'in_progress' | 'completed') => void;
}

import { useAppStore } from "@/stores/useAppStore";

export const ActiveOrderCard = ({ order, onStatusChange }: ActiveOrderCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [key, setKey] = useState(0);

  const isPickupPhase = order.status === 'accepted';
  const isInProgressPhase = order.status === 'in_progress';

  // IMPORTANT: Reset du slider à chaque changement d'étape pour éviter qu'il reste bloqué
  useEffect(() => {
    setKey((prev) => prev + 1);
  }, [order.status]);

  // Configuration dynamique selon l'étape
  const displayConfig = isPickupPhase ? {
    title: "Récupération",
    address: order.pickupLocation.address,
    addressLabel: "Récupérer à",
    targetLocation: order.pickupLocation, // Cible GPS : Client
    action: "Glisser - Client récupéré",
    nextStatus: 'in_progress' as const,
  } : {
    title: "En route",
    address: order.dropoffLocation.address,
    addressLabel: "Destination",
    targetLocation: order.dropoffLocation, // Cible GPS : Destination finale
    action: "Glisser - Course terminée",
    nextStatus: 'completed' as const,
  };

  // FONCTION POUR LANCER LE GPS EXTERNE
  const handleLaunchGPS = () => {
    const { lat, lng } = displayConfig.targetLocation;
    const app = useAppStore.getState().preferences.navigationApp; // Accès direct au store

    let url = "";

    if (app === 'waze') {
      // Lien profond Waze
      url = `https://waze.com/ul?ll=${lat},${lng}&navigate=yes`;
    } else if (app === 'apple_maps') {
      // Lien Apple Maps
      url = `http://maps.apple.com/?daddr=${lat},${lng}`;
    } else {
      // Google Maps (Défaut)
      url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    }

    window.open(url, '_blank');
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

        <div className="px-4 pb-4">
          {/* Header avec Actions */}
          <div className="flex items-center justify-between mb-4">

            {/* BOUTON GPS ACTIF */}
            <Button
              variant="outline"
              className="flex items-center gap-2 h-auto py-2 px-3 border-accent/20 bg-accent/10 hover:bg-accent/20"
              onClick={handleLaunchGPS}
            >
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-accent text-white">
                <Navigation className="h-3 w-3" />
              </div>
              <div className="text-left">
                <p className="text-sm font-bold text-accent">GPS</p>
                <p className="text-[10px] text-muted-foreground leading-none">
                  Ouvrir Maps
                </p>
              </div>
            </Button>

            {/* Quick Actions (Tél / Message) */}
            <div className="flex gap-2">
              <Button size="icon" variant="secondary" className="h-10 w-10 rounded-full">
                <Phone className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="secondary" className="h-10 w-10 rounded-full">
                <MessageCircle className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Titre de l'étape actuelle */}
          <div className="mb-2 px-1">
            <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">{displayConfig.title}</p>
          </div>

          {/* Adresse principale (celle actuelle) */}
          <div className="mb-4 rounded-xl bg-secondary/50 p-3 border border-border/50">
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-foreground mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">
                  {displayConfig.addressLabel}
                </p>
                <p className="text-base font-semibold leading-tight">{displayConfig.address}</p>
              </div>
            </div>
          </div>

          {/* Détails étendus (Client, etc.) */}
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

              {/* Infos complémentaires selon phase */}
              {isInProgressPhase && (
                <div className="flex items-start gap-2 rounded-xl bg-secondary/50 p-3 opacity-70">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground">Point de départ (Historique)</p>
                    <p className="text-sm">{order.pickupLocation.address}</p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Slider Action avec Key pour Reset */}
          <div className="flex justify-center mt-2">
            <SlideToAction
              key={key}
              label={displayConfig.action}
              onConfirm={() => onStatusChange(order.id, displayConfig.nextStatus)}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
};
