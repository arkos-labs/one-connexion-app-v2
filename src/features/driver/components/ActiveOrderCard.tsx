import { useState, useMemo, useEffect } from "react";
import { Phone, Navigation, MapPin, User, Clock, Menu, MessageSquare, Star, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Order } from "@/types";
import { useAppPreferences } from "@/hooks/useAppPreferences";
import { useAppStore } from "@/stores/useAppStore";
import { cn } from "@/lib/utils";
import { ProofOfDeliveryDrawer } from "./ProofOfDeliveryDrawer";
import { locationService } from "@/services/locationService";

// Calcul de distance (Haversine)
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371e3;
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

interface ActiveOrderCardProps {
  order: Order;
  onStatusChange: (orderId: string, status: 'arrived_pickup' | 'in_progress' | 'completed') => void;
  onChatOpen?: () => void;
}

export const ActiveOrderCard = ({ order, onStatusChange, onChatOpen }: ActiveOrderCardProps) => {
  const { openGPS } = useAppPreferences();
  const { driverLocation, completeOrder } = useAppStore();
  const [isProofModalOpen, setIsProofModalOpen] = useState(false);
  const [forceNearby, setForceNearby] = useState(false);

  // Phases
  const isEnRoutePickup = order.status === 'accepted';
  const isArrivedPickup = order.status === 'arrived_pickup';
  const isPickupPhase = isEnRoutePickup || isArrivedPickup;

  const targetLocation = isPickupPhase ? order.pickupLocation : order.dropoffLocation;

  // Geocoding auto-fix
  const [fixedTargetLocation, setFixedTargetLocation] = useState<{ lat: number; lng: number; address: string } | null>(null);

  useEffect(() => {
    const fixMissingCoordinates = async () => {
      if (targetLocation.lat === 0 && targetLocation.lng === 0 && targetLocation.address) {
        try {
          const coords = await locationService.geocodeAddress(targetLocation.address);
          if (coords) {
            setFixedTargetLocation({ ...coords, address: targetLocation.address });
          }
        } catch (err) {
          console.error("❌ Client-side geocoding failed", err);
        }
      } else {
        setFixedTargetLocation(null);
      }
    };
    fixMissingCoordinates();
  }, [targetLocation.address, targetLocation.lat, targetLocation.lng]);

  const effectiveTarget = fixedTargetLocation || targetLocation;

  // Distance
  const distanceToTarget = useMemo(() => {
    return calculateDistance(
      driverLocation.lat, driverLocation.lng,
      effectiveTarget.lat, effectiveTarget.lng
    );
  }, [driverLocation, effectiveTarget]);

  const isNearby = forceNearby || distanceToTarget < 200;

  // Config dynamique
  let statusConfig;
  if (isEnRoutePickup) {
    statusConfig = {
      title: "EN ROUTE VERS LE RETRAIT",
      badgeText: "EN COURSE",
      nextAction: "JE SUIS ARRIVÉ",
      nextStatus: 'arrived_pickup' as const
    };
  } else if (isArrivedPickup) {
    statusConfig = {
      title: "SUR PLACE (RETRAIT)",
      badgeText: "EN ATTENTE",
      nextAction: "CONFIRMER LA PRISE EN CHARGE",
      nextStatus: 'in_progress' as const
    };
  } else if (order.status === 'in_progress') {
    statusConfig = {
      title: "EN ROUTE VERS LA LIVRAISON",
      badgeText: "EN LIVRAISON",
      nextAction: "TERMINER LA COURSE",
      nextStatus: 'completed' as const
    };
  } else {
    statusConfig = {
      title: "MISSION EN COURS",
      badgeText: "EN COURS",
      nextAction: "CONTINUER",
      nextStatus: 'pending' as any
    };
  }

  const handleProofConfirmed = (proofType: 'signature' | 'photo', proofData: string) => {
    const proof = {
      type: proofType,
      dataUrl: proofData,
      timestamp: new Date().toISOString()
    };
    completeOrder(proof);
  };

  const handleAction = () => {
    if (!isNearby) return;

    if (statusConfig.nextStatus === 'completed' && order.status === 'in_progress') {
      setIsProofModalOpen(true);
    } else if (statusConfig.nextStatus !== 'pending') {
      onStatusChange(order.id, statusConfig.nextStatus);
    }
  };

  return (
    <div className="relative w-full">

      {/* Header flottant */}
      <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between">
        {/* Bouton Menu */}
        <button className="h-10 w-10 rounded-xl bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 flex items-center justify-center hover:bg-slate-800 transition-colors">
          <Menu className="h-5 w-5 text-white" />
        </button>

        {/* Badge EN COURSE */}
        <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-slate-900 text-xs font-bold px-4 py-2 rounded-full shadow-lg shadow-yellow-500/30 flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-slate-900 animate-pulse"></div>
          {statusConfig.badgeText}
        </div>
      </div>

      {/* Card principale */}
      <div className="bg-slate-900/95 backdrop-blur-xl border-2 border-slate-700/50 rounded-3xl shadow-2xl overflow-hidden">

        {/* Titre de la phase */}
        <div className="bg-gradient-to-b from-slate-800/50 to-transparent p-4 border-b border-slate-800/50">
          <h3 className="text-center text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-500 uppercase tracking-wider">
            {statusConfig.title}
          </h3>
        </div>

        <div className="p-5 space-y-4">

          {/* Informations Client + Actions */}
          <div className="flex items-center justify-between">
            {/* Client */}
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center shadow-lg shadow-yellow-500/20">
                <User className="h-6 w-6 text-slate-900" />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">{order.clientName}</h4>
                <p className="text-xs text-yellow-500 flex items-center gap-1">
                  4.85 <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                </p>
              </div>
            </div>

            {/* Icônes d'action */}
            <div className="flex items-center gap-2">
              <button className="h-9 w-9 rounded-xl bg-slate-800/50 hover:bg-slate-700 border border-slate-700/50 flex items-center justify-center transition-colors">
                <Phone className="h-4 w-4 text-slate-300" />
              </button>
              <button
                onClick={onChatOpen}
                className="h-9 w-9 rounded-xl bg-slate-800/50 hover:bg-slate-700 border border-slate-700/50 flex items-center justify-center transition-colors"
              >
                <MessageSquare className="h-4 w-4 text-slate-300" />
              </button>
              <button
                onClick={() => openGPS(effectiveTarget.lat, effectiveTarget.lng)}
                className="h-9 w-9 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 flex items-center justify-center transition-colors"
              >
                <Navigation className="h-4 w-4 text-blue-400" />
              </button>

              {/* Bouton Mode Test */}
              <button
                onClick={() => setForceNearby(!forceNearby)}
                className={cn(
                  "h-9 w-9 rounded-xl border flex items-center justify-center transition-all",
                  forceNearby
                    ? "bg-orange-500/30 border-orange-500/50 hover:bg-orange-500/40"
                    : "bg-slate-800/50 border-slate-700/50 hover:bg-slate-700"
                )}
                title={forceNearby ? "Mode test activé" : "Activer le mode test"}
              >
                <Target className={cn(
                  "h-4 w-4 transition-colors",
                  forceNearby ? "text-orange-400" : "text-slate-400"
                )} />
              </button>
            </div>
          </div>

          {/* Adresse */}
          <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-3 flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-yellow-500/20 flex items-center justify-center shrink-0">
              <MapPin className="h-4 w-4 text-yellow-400" />
            </div>
            <p className="text-sm text-white font-medium flex-1 leading-tight">
              {effectiveTarget.address}
            </p>
          </div>

          {/* Timer */}
          <div className="flex items-center justify-center gap-2 text-slate-400">
            <Clock className="h-4 w-4" />
            <span className="text-sm font-medium">
              {(effectiveTarget.lat === 0 && effectiveTarget.lng === 0) ? "--" : "12 min"}
            </span>
          </div>

          {/* Bouton CTA */}
          <Button
            onClick={handleAction}
            disabled={!isNearby}
            className={cn(
              "w-full h-14 text-base font-bold rounded-2xl transition-all shadow-lg",
              isNearby
                ? "bg-gradient-to-r from-yellow-500 via-yellow-600 to-yellow-500 hover:from-yellow-400 hover:via-yellow-500 hover:to-yellow-400 text-slate-900 shadow-yellow-500/30 hover:scale-[1.02] active:scale-[0.98]"
                : "bg-slate-800/50 text-slate-500 cursor-not-allowed border-2 border-dashed border-slate-700/50"
            )}
          >
            {isNearby ? statusConfig.nextAction : "RAPPROCHEZ-VOUS"}
          </Button>
        </div>
      </div>

      <ProofOfDeliveryDrawer
        isOpen={isProofModalOpen}
        onClose={() => setIsProofModalOpen(false)}
        onConfirm={handleProofConfirmed}
      />
    </div>
  );
};
