import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/stores/useAppStore";
import { Order } from "@/types";
import { MapPin, Navigation, Timer } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface NewOrderModalProps {
  order?: Order | null;
  onAccept?: (orderId: string) => void;
  onReject?: (orderId: string) => void;
}

export const NewOrderModal = ({ order, onAccept, onReject }: NewOrderModalProps) => {
  const { orders, acceptOrder, rejectOrder } = useAppStore();
  const [progress, setProgress] = useState(100);
  const [loading, setLoading] = useState(false);

  // Use prop order or first pending order from store
  const incomingOrder = order !== undefined ? order : (orders.length > 0 ? orders[0] : null);

  useEffect(() => {
    if (!incomingOrder) {
      setProgress(100);
      return;
    }

    // Timer de 45 secondes pour accepter (plus confortable pour le chauffeur)
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev <= 0) {
          clearInterval(timer); // Sécurité: arrêter le timer immédiatement
          console.log("⏱️ [NewOrderModal] Temps écoulé (45s), refus automatique");
          if (onReject) onReject(incomingOrder.id);
          else rejectOrder(incomingOrder.id);
          return 0;
        }
        return prev - (100 / 450); // ~45 secondes (100 ticks par seconde * 45 / 10 = non, 10 ticks/s donc 450 ticks total)
      });
    }, 100);

    return () => clearInterval(timer);
  }, [incomingOrder?.id, rejectOrder, onReject]);

  if (!incomingOrder) return null;

  const handleAccept = async () => {
    if (loading || !incomingOrder) return;
    console.log("🖱️ [NewOrderModal] ACCEPTER cliqué pour:", incomingOrder.id);
    setLoading(true);
    try {
      if (onAccept) await onAccept(incomingOrder.id);
      else await acceptOrder(incomingOrder.id);
    } catch (err) {
      console.error("Erreur acceptation:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (loading || !incomingOrder) return;
    console.log("🖱️ [NewOrderModal] REFUSER cliqué pour:", incomingOrder.id);
    setLoading(true);
    try {
      if (onReject) await onReject(incomingOrder.id);
      else await rejectOrder(incomingOrder.id);
    } catch (err) {
      console.error("Erreur refus:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={!!incomingOrder} onOpenChange={() => { }}>
      <DialogContent
        className="max-w-[90%] sm:max-w-md border-none shadow-[0_35px_60px_-15px_rgba(0,0,0,0.6)] bg-card p-6 !z-[9999]"
        style={{ pointerEvents: 'auto', borderRadius: '24px' }}
        onPointerDownCapture={(e) => console.log("🎯 Clic capturé sur DialogContent")}
      >
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold flex items-center justify-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
            Nouvelle Course !
          </DialogTitle>
          <DialogDescription className="text-center">
            À {incomingOrder.distance || 'quelques minutes'} de votre position
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Prix - Affichage Uniquement du Gain Net Chauffeur (40% du prix client) */}
          <div className="text-center">
            <span className="text-4xl font-extrabold text-green-600">{(incomingOrder.price * 0.40).toFixed(2)} €</span>
            <div className="flex items-center justify-center gap-2 mt-1">
              <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest bg-secondary px-2 py-0.5 rounded">Gain Net</span>
            </div>
          </div>

          {/* Trajet */}
          <div className="space-y-4 bg-secondary/20 p-4 rounded-xl">
            <div className="flex gap-3">
              <MapPin className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground font-bold uppercase">Départ</p>
                <p className="font-medium text-sm">{incomingOrder.pickupLocation.address}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Navigation className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground font-bold uppercase">Arrivée</p>
                <p className="font-medium text-sm">{incomingOrder.dropoffLocation.address}</p>
              </div>
            </div>
          </div>

          {/* Timer Visuel */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><Timer className="h-3 w-3" /> Temps restant</span>
              <span>{Math.ceil((progress / 100) * 45)}s</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>

        <DialogFooter className="grid grid-cols-2 gap-4 pt-4 !pointer-events-auto">
          <Button
            variant="outline"
            className="w-full h-14 text-red-500 hover:text-red-600 hover:bg-red-50 border-2 border-red-100 font-bold"
            onClick={(e) => {
              console.log("👆 Refuser cliqué");
              e.stopPropagation();
              handleReject();
            }}
            onPointerDown={(e) => e.stopPropagation()}
            disabled={loading}
          >
            {loading ? "..." : "Refuser"}
          </Button>
          <Button
            className="w-full h-14 bg-green-600 hover:bg-green-700 text-white font-bold text-lg shadow-lg active:scale-95 transition-transform"
            onClick={(e) => {
              console.log("👆 Accepter cliqué");
              e.stopPropagation();
              handleAccept();
            }}
            onPointerDown={(e) => e.stopPropagation()}
            disabled={loading}
          >
            {loading ? "Chargement..." : "ACCEPTER"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
