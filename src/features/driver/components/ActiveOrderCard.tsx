import { useRef, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, Navigation, MapPin, User, Clock, CheckCircle, XCircle, MoreVertical, MessageSquare, Headset, ChevronDown, ChevronUp, Lock, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Order } from "@/types";
import { useAppPreferences } from "@/hooks/useAppPreferences";
import { useAppStore } from "@/stores/useAppStore";
import { cn } from "@/lib/utils";
import { ProofOfDeliveryDrawer } from "./ProofOfDeliveryDrawer";

// Utilitaires de distance simple (Haversine simplifié)
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371e3; // Rayon Terre en mètres
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance en mètres
};

interface ActiveOrderCardProps {
  order: Order;
  onStatusChange: (orderId: string, status: 'arrived_pickup' | 'in_progress' | 'completed') => void;
  onChatOpen?: () => void;
}

export const ActiveOrderCard = ({ order, onStatusChange, onChatOpen }: ActiveOrderCardProps) => {
  const { openGPS } = useAppPreferences();
  const { driverLocation, completeOrder } = useAppStore();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [sliderConfirmed, setSliderConfirmed] = useState(false);
  const [isProofModalOpen, setIsProofModalOpen] = useState(false);
  const [forceNearby, setForceNearby] = useState(false); // Mode test

  const containerRef = useRef<HTMLDivElement>(null);

  // Phases
  const isEnRoutePickup = order.status === 'accepted';
  const isArrivedPickup = order.status === 'arrived_pickup';
  const isPickupPhase = isEnRoutePickup || isArrivedPickup;

  const targetLocation = isPickupPhase ? order.pickupLocation : order.dropoffLocation;

  // Calcul de distance pour validation (Seuil 200m)
  const distanceToTarget = useMemo(() => {
    return calculateDistance(
      driverLocation.lat, driverLocation.lng,
      targetLocation.lat, targetLocation.lng
    );
  }, [driverLocation, targetLocation]);

  const isNearby = forceNearby || distanceToTarget < 200; // 200 mètres OU mode forcé

  // Configuration dynamique des étapes
  let statusConfig;

  if (isEnRoutePickup) {
    statusConfig = {
      title: "En route vers le retrait",
      color: "text-blue-500",
      thumbColor: "bg-blue-600",
      bgColor: "bg-blue-500/10",
      nextAction: "Je suis arrivé",
      nextStatus: 'arrived_pickup' as const
    };
  } else if (isArrivedPickup) {
    statusConfig = {
      title: "Sur place (Retrait)",
      color: "text-orange-500",
      thumbColor: "bg-orange-600",
      bgColor: "bg-orange-500/10",
      nextAction: "Confirmer la Prise en charge",
      nextStatus: 'in_progress' as const
    };
  } else if (order.status === 'in_progress') {
    statusConfig = {
      title: "En route vers la livraison",
      color: "text-green-500",
      thumbColor: "bg-green-600",
      bgColor: "bg-green-500/10",
      nextAction: "Terminer la Course",
      nextStatus: 'completed' as const
    };
  } else {
    // Fallback for safety (should not be visible if currentOrder logic is correct)
    statusConfig = {
      title: "Mission en cours",
      color: "text-zinc-500",
      thumbColor: "bg-zinc-600",
      bgColor: "bg-zinc-500/10",
      nextAction: "Chargement...",
      nextStatus: 'pending' as any
    };
  }

  const handleProofConfirmed = (proofType: 'signature' | 'photo', proofData: string) => {
    // Collect proof data
    const proof = {
      type: proofType,
      dataUrl: proofData,
      timestamp: new Date().toISOString()
    };

    // Terminer la course avec la preuve
    completeOrder(proof);
  };

  const handleSlideEnd = (info: any) => {
    if (!isNearby) return;

    const containerWidth = containerRef.current?.offsetWidth || 300;
    const threshold = containerWidth * 0.7;

    if (info.offset.x >= threshold) {
      setSliderConfirmed(true);

      setTimeout(() => {
        // Intercept completion for Proof - ONLY if in the correct phase
        if (statusConfig.nextStatus === 'completed' && order.status === 'in_progress') {
          setIsProofModalOpen(true);
        } else if (statusConfig.nextStatus !== 'pending') {
          onStatusChange(order.id, statusConfig.nextStatus);
        }
        setSliderConfirmed(false);
      }, 300);
    }
  };

  return (
    <div className="w-full">
      <Card className="border shadow-2xl bg-card/95 backdrop-blur-xl rounded-xl overflow-hidden">

        {/* HEADER (Visible & Readable) */}
        <div
          className={cn("px-6 py-4 flex justify-between items-center border-b border-border/50 transition-colors", statusConfig.bgColor)}
        >
          <div className="flex items-center gap-3">
            <div className={cn("h-4 w-4 rounded-full animate-pulse ring-4 ring-white/20", statusConfig.thumbColor)} />
            <div>
              <span className={cn("font-bold text-base uppercase tracking-wide block leading-none", statusConfig.color)}>
                {statusConfig.title}
              </span>
              <span className="text-sm text-muted-foreground mt-1 flex items-center gap-1 font-medium">
                <Navigation className="h-4 w-4" />
                {(targetLocation.lat === 0 && targetLocation.lng === 0) ? (
                  <span>Distance inconnue</span>
                ) : distanceToTarget > 1000000 ? ( // > 1000km implies invalid/bugged calc (e.g. Null Island)
                  <span>Distance inconnue</span>
                ) : distanceToTarget > 1000 ? (
                  `${(distanceToTarget / 1000).toFixed(1)} km`
                ) : (
                  `${Math.round(distanceToTarget)} m`
                )}
              </span>
            </div>
          </div>
          <Badge variant="outline" className="bg-background/50 backdrop-blur border-border/50 h-8 text-sm px-3">
            <Clock className="mr-1.5 h-4 w-4" />
            {(targetLocation.lat === 0 && targetLocation.lng === 0) ? "--" : "12 min"}
          </Badge>
        </div>

        {/* CORPS COMPACT */}
        <div className="overflow-hidden">
          <CardContent className="p-4 space-y-3">

            {/* LIGNE 1 : Client + Actions */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center border border-border shadow-sm">
                  <User className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="font-bold text-sm leading-tight">{order.clientName}</h3>
                  <p className="text-[10px] text-muted-foreground">Premium ⭐ 4.9</p>
                </div>
              </div>

              <Button
                size="sm"
                variant="outline"
                className="h-8 text-xs gap-1.5 rounded-full border-blue-200 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800"
                onClick={onChatOpen}
              >
                <Headset className="h-3.5 w-3.5" />
                Régulation
              </Button>
            </div>

            {/* LIGNE 2 : Adresse Cible uniquement */}
            <div className="bg-secondary/30 rounded-lg p-2.5 flex items-center justify-between gap-3 border border-border/50">
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">
                  {isPickupPhase ? "Lieu de prise en charge" : "Destination"}
                </p>
                <div className="flex items-start gap-1.5">
                  <MapPin className={cn("h-4 w-4 mt-0.5 shrink-0", isPickupPhase ? "text-blue-500" : "text-green-500")} />
                  <p className="font-medium text-sm leading-tight truncate">
                    {targetLocation.address}
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  size="icon"
                  className="h-9 w-9 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm shrink-0"
                  onClick={() => openGPS(targetLocation.lat, targetLocation.lng)}
                >
                  <Navigation className="h-4 w-4" />
                </Button>

                {/* Bouton Mode Test - Force la proximité */}
                <Button
                  size="icon"
                  variant={forceNearby ? "default" : "outline"}
                  className={cn(
                    "h-9 w-9 rounded-xl shadow-sm shrink-0",
                    forceNearby
                      ? "bg-orange-600 hover:bg-orange-700 text-white border-orange-600"
                      : "border-orange-200 text-orange-600 hover:bg-orange-50"
                  )}
                  onClick={() => setForceNearby(!forceNearby)}
                  title={forceNearby ? "Mode test activé" : "Activer le mode test"}
                >
                  <Target className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>

          {/* FOOTER : Slider Large & Visible */}
          <CardFooter className="p-6 pt-0">
            <div
              ref={containerRef}
              className={cn(
                "relative h-16 w-full rounded-full overflow-hidden p-1.5 select-none touch-none border shadow-inner transition-colors",
                isNearby
                  ? "bg-secondary/60 border-white/10"
                  : "bg-muted/40 border-dashed border-white/10 cursor-not-allowed"
              )}
            >
              <div className="absolute inset-0 flex items-center justify-center z-0 pointer-events-none">
                <span className={cn(
                  "text-sm font-bold uppercase tracking-[0.2em] flex items-center gap-2",
                  isNearby ? "text-muted-foreground/80 animate-pulse" : "text-muted-foreground/50"
                )}>
                  {isNearby ? (
                    <>
                      {statusConfig.nextAction}
                      {forceNearby && <Target className="h-4 w-4 text-orange-500" />}
                    </>
                  ) : (
                    <>
                      Rapprochez-vous
                      <Lock className="h-4 w-4" />
                    </>
                  )}
                </span>
              </div>

              <motion.div
                drag={isNearby ? "x" : false}
                dragConstraints={containerRef}
                dragElastic={0.05}
                dragMomentum={false}
                dragSnapToOrigin={!sliderConfirmed}
                onDragEnd={(e, info) => handleSlideEnd(info)}
                className={cn(
                  "h-full aspect-square rounded-full shadow-lg flex items-center justify-center z-10 relative border-2 transition-all",
                  isNearby
                    ? cn(statusConfig.thumbColor, "cursor-grab active:cursor-grabbing border-white/20 text-white")
                    : "bg-muted border-white/10 text-muted-foreground"
                )}
                animate={sliderConfirmed ? { x: "100%" } : { x: 0 }}
              >
                {isNearby ? <CheckCircle className="h-7 w-7" /> : <Navigation className="h-6 w-6 opacity-50" />}
              </motion.div>
            </div>
          </CardFooter>
        </div>
      </Card>

      <ProofOfDeliveryDrawer
        isOpen={isProofModalOpen}
        onClose={() => setIsProofModalOpen(false)}
        onConfirm={handleProofConfirmed}
      />
    </div>
  );
};
