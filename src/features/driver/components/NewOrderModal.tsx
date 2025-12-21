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

  // Use prop order or first pending order from store
  const incomingOrder = order !== undefined ? order : (orders.length > 0 ? orders[0] : null);

  useEffect(() => {
    if (!incomingOrder) {
      setProgress(100);
      return;
    }

    // Timer de 30 secondes pour accepter
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev <= 0) {
          if (onReject) onReject(incomingOrder.id);
          else rejectOrder(incomingOrder.id);
          return 0;
        }
        return prev - (100 / 300); // ~30 secondes (100% / 300 ticks de 100ms)
      });
    }, 100);

    return () => clearInterval(timer);
  }, [incomingOrder, rejectOrder, onReject]);

  if (!incomingOrder) return null;

  const handleAccept = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onAccept) onAccept(incomingOrder.id);
    else acceptOrder(incomingOrder.id);
  };

  const handleReject = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onReject) onReject(incomingOrder.id);
    else rejectOrder(incomingOrder.id);
  };

  return (
    <Dialog open={!!incomingOrder} onOpenChange={() => { }}>
      <DialogContent className="sm:max-w-md border-none shadow-2xl bg-card" onInteractOutside={(e) => e.preventDefault()}>
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
          {/* Prix */}
          <div className="text-center">
            <span className="text-4xl font-extrabold text-primary">{(incomingOrder.price * 0.40).toFixed(2)} €</span>
            <span className="text-sm text-muted-foreground ml-1">Net chauffeur</span>
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
              <span>{Math.ceil((progress / 100) * 30)}s</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>

        <DialogFooter className="grid grid-cols-2 gap-3 sm:justify-between">
          <Button variant="outline" className="w-full h-12 text-red-500 hover:text-red-600 hover:bg-red-50" onClick={handleReject}>
            Refuser
          </Button>
          <Button className="w-full h-12 bg-green-600 hover:bg-green-700 text-white font-bold text-lg" onClick={handleAccept}>
            ACCEPTER
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
