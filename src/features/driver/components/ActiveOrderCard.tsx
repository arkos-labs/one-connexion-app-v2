import { useRef, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, Navigation, MapPin, User, Clock, CheckCircle, XCircle, MoreVertical, MessageSquare, Headset, ChevronDown, ChevronUp, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Order } from "@/types";
import { useAppPreferences } from "@/hooks/useAppPreferences";
import { useAppStore } from "@/stores/useAppStore";
import { cn } from "@/lib/utils";

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
  onStatusChange: (orderId: string, status: 'in_progress' | 'completed') => void;
  onChatOpen?: () => void;
}

export const ActiveOrderCard = ({ order, onStatusChange, onChatOpen }: ActiveOrderCardProps) => {
  const { openGPS } = useAppPreferences();
  const { driverLocation } = useAppStore();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [sliderConfirmed, setSliderConfirmed] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  const isPickupPhace = order.status === 'accepted';
  const targetLocation = isPickupPhace ? order.pickupLocation : order.dropoffLocation;

  // Calcul de distance pour validation (Seuil 200m)
  const distanceToTarget = useMemo(() => {
    return calculateDistance(
      driverLocation.lat, driverLocation.lng,
      targetLocation.lat, targetLocation.lng
    );
  }, [driverLocation, targetLocation]);

  const isNearby = distanceToTarget < 200; // 200 mètres

  // Config according to status
  const statusConfig = isPickupPhace ? {
    title: "En route vers le retrait",
    color: "text-blue-500",
    thumbColor: "bg-blue-600",
    bgColor: "bg-blue-500/10",
    nextAction: "Confirmer le Retrait",
    nextStatus: 'in_progress' as const
  } : {
    title: "En route vers la livraison",
    color: "text-green-500",
    thumbColor: "bg-green-600",
    bgColor: "bg-green-500/10",
    nextAction: "Terminer la Course",
    nextStatus: 'completed' as const
  };

  const handleSlideEnd = (info: any) => {
    if (!isNearby) return; // Sécurité supplémentaire

    const containerWidth = containerRef.current?.offsetWidth || 300;
    const threshold = containerWidth * 0.7;

    if (info.offset.x >= threshold) {
      setSliderConfirmed(true);
      setTimeout(() => {
        onStatusChange(order.id, statusConfig.nextStatus);
        setSliderConfirmed(false);
      }, 300);
    }
  };

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      className="fixed bottom-0 left-0 right-0 z-50 p-4"
    >
      <Card className="border-t border-x border-border/50 shadow-2xl bg-card/95 backdrop-blur-xl rounded-t-3xl overflow-hidden transition-all duration-300">

        {/* HEADER */}
        <div
          className={cn("px-6 py-4 flex justify-between items-center border-b border-border/50 cursor-pointer hover:bg-white/5 transition-colors", statusConfig.bgColor)}
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          <div className="flex items-center gap-3">
            <div className={cn("h-3 w-3 rounded-full animate-pulse ring-2 ring-white/20", statusConfig.thumbColor)} />
            <div>
              <span className={cn("font-bold text-sm uppercase tracking-wide block leading-none", statusConfig.color)}>
                {statusConfig.title}
              </span>
              {/* Affichage Distance */}
              <span className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <Navigation className="h-3 w-3" />
                {distanceToTarget > 1000
                  ? `${(distanceToTarget / 1000).toFixed(1)} km`
                  : `${Math.round(distanceToTarget)} m`}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Badge variant="outline" className="bg-background/50 backdrop-blur border-border/50">
              <Clock className="mr-1 h-3 w-3" /> 12 min
            </Badge>
            {isCollapsed ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </div>
        </div>

        {/* CORPS DE LA CARTE */}
        <AnimatePresence>
          {!isCollapsed && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <CardContent className="p-6 space-y-6">
                {/* Client Info & Actions (inchangé) */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-secondary flex items-center justify-center border-2 border-border shadow-sm">
                      <User className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg leading-none">{order.clientName}</h3>
                      <p className="text-sm text-muted-foreground mt-1">Client Premium ⭐ 4.9</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-10 w-10 rounded-full bg-background/50 hover:bg-primary hover:text-primary-foreground border-primary/20 shadow-sm"
                      onClick={onChatOpen}
                    >
                      <MessageSquare className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-10 w-10 rounded-full bg-background/50 hover:bg-destructive hover:text-white border-destructive/20 shadow-sm"
                      onClick={() => window.open('tel:+33100000000')}
                    >
                      <Headset className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <Separator className="bg-border/50" />

                {/* Destination */}
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 space-y-1">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      {isPickupPhace ? "Lieu de prise en charge" : "Destination"}
                    </p>
                    <div className="flex items-start gap-2">
                      <MapPin className={cn("h-5 w-5 mt-0.5 shrink-0", isPickupPhace ? "text-blue-500" : "text-green-500")} />
                      <p className="font-medium text-base leading-snug">
                        {targetLocation.address}
                      </p>
                    </div>
                  </div>

                  <Button
                    size="lg"
                    className="bg-blue-600 hover:bg-blue-700 text-white shadow-blue-900/20 shadow-lg rounded-2xl h-14 w-14 p-0 shrink-0"
                    onClick={() => openGPS(targetLocation.lat, targetLocation.lng)}
                  >
                    <Navigation className="h-6 w-6" />
                  </Button>
                </div>
              </CardContent>

              {/* FOOTER : Slider Intelligent */}
              <CardFooter className="p-6 pt-0">
                <div
                  ref={containerRef}
                  className={cn(
                    "relative h-16 w-full rounded-full overflow-hidden p-1.5 select-none touch-none border shadow-inner transition-colors",
                    isNearby
                      ? "bg-secondary/40 border-white/5"
                      : "bg-muted/30 border-dashed border-white/10 cursor-not-allowed"
                  )}
                >
                  {/* Texte de fond */}
                  <div className="absolute inset-0 flex items-center justify-center z-0 pointer-events-none">
                    <span className={cn(
                      "text-sm font-bold uppercase tracking-[0.2em] flex items-center gap-2",
                      isNearby ? "text-muted-foreground/60 animate-pulse" : "text-muted-foreground/40"
                    )}>
                      {isNearby ? "Glisser pour valider" : "Rapprochez-vous"}
                      {!isNearby && <Lock className="h-3 w-3" />}
                    </span>
                  </div>

                  {/* Thumb draggable ou locké */}
                  <motion.div
                    drag={isNearby ? "x" : false} // Désactivé si trop loin
                    dragConstraints={containerRef}
                    dragElastic={0.05}
                    dragMomentum={false}
                    dragSnapToOrigin={!sliderConfirmed}
                    onDragEnd={(e, info) => handleSlideEnd(info)}
                    className={cn(
                      "h-full aspect-square rounded-full shadow-2xl flex items-center justify-center z-10 relative border-2 transition-all",
                      isNearby
                        ? cn(statusConfig.thumbColor, "cursor-grab active:cursor-grabbing border-white/20 text-white")
                        : "bg-muted border-white/10 text-muted-foreground"
                    )}
                    animate={sliderConfirmed ? { x: "100%" } : { x: 0 }}
                  >
                    {isNearby ? <CheckCircle className="h-6 w-6" /> : <Navigation className="h-5 w-5 opacity-50" />}
                  </motion.div>
                </div>
              </CardFooter>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
};
