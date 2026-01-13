import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/stores/useAppStore";
import { Order } from "@/types";
import { MapPin, Navigation, X } from "lucide-react";
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

    // Timer de 30 secondes pour accepter
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev <= 0) {
          clearInterval(timer);
          console.log("⏱️ [NewOrderModal] Temps écoulé (30s), refus automatique");
          if (onReject) onReject(incomingOrder.id);
          else rejectOrder(incomingOrder.id);
          return 0;
        }
        return prev - (100 / 300); // 30 secondes (10 ticks/s * 30 = 300 ticks)
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

  const timeRemaining = Math.ceil((progress / 100) * 30);

  return (
    <Dialog open={!!incomingOrder} onOpenChange={() => { }}>
      <DialogContent
        className="max-w-[90%] sm:max-w-md border-2 border-slate-700/50 shadow-2xl bg-slate-900/98 backdrop-blur-xl p-0 !z-[9999] overflow-hidden"
        style={{ pointerEvents: 'auto', borderRadius: '24px' }}
      >
        {/* Header avec bouton fermer */}
        <DialogHeader className="relative bg-gradient-to-b from-slate-800/50 to-transparent p-4 pb-3 border-b border-slate-800/50">
          <button
            onClick={handleReject}
            className="absolute top-3 right-3 h-8 w-8 rounded-full bg-slate-800/50 hover:bg-slate-700 flex items-center justify-center transition-colors"
          >
            <X className="h-4 w-4 text-slate-400" />
          </button>
          <DialogTitle className="text-center text-sm font-medium text-slate-400 uppercase tracking-wider">
            Nouvelle Course - Offre
          </DialogTitle>
        </DialogHeader>

        <div className="p-6 space-y-5">

          {/* Prix principal - ÉNORME et doré */}
          <div className="text-center py-4">
            <div className="relative inline-block">
              {/* Effet de brillance en arrière-plan */}
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 via-yellow-500/30 to-yellow-400/20 blur-3xl"></div>

              <div className="relative">
                <span className="text-6xl font-black bg-gradient-to-br from-yellow-300 via-yellow-400 to-yellow-600 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(234,179,8,0.5)]">
                  {(incomingOrder.price * 0.40).toFixed(2)} €
                </span>
              </div>
            </div>

            {/* Badge CASH NET */}
            <div className="flex justify-center mt-3">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider bg-gradient-to-r from-yellow-400 to-yellow-500 px-4 py-1.5 rounded-full shadow-lg shadow-yellow-500/30">
                CASH NET
              </span>
            </div>
          </div>

          {/* Informations de trajet */}
          <div className="space-y-3 bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 p-4 rounded-2xl">
            {/* Départ */}
            <div className="flex gap-3 items-start">
              <div className="h-8 w-8 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0 mt-0.5">
                <MapPin className="h-4 w-4 text-blue-400" />
              </div>
              <div className="flex-1">
                <p className="text-[10px] text-blue-400 font-bold uppercase tracking-wider mb-0.5">DÉPART</p>
                <p className="font-medium text-sm text-white leading-tight">{incomingOrder.pickupLocation.address}</p>
              </div>
            </div>

            {/* Barre de progression du temps */}
            <div className="relative py-2">
              <div className="h-0.5 bg-slate-700/50 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-yellow-400 to-yellow-500 transition-all duration-100 ease-linear"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <div className="absolute right-0 -top-1 text-xs font-bold text-yellow-500">
                {timeRemaining}s
              </div>
            </div>

            {/* Arrivée */}
            <div className="flex gap-3 items-start">
              <div className="h-8 w-8 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0 mt-0.5">
                <Navigation className="h-4 w-4 text-emerald-400" />
              </div>
              <div className="flex-1">
                <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider mb-0.5">ARRIVÉE</p>
                <p className="font-medium text-sm text-white leading-tight">{incomingOrder.dropoffLocation.address}</p>
              </div>
            </div>
          </div>

          {/* Boutons d'action */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            {/* Bouton Refuser */}
            <Button
              variant="outline"
              className="h-12 border-2 border-yellow-500/30 bg-transparent hover:bg-yellow-500/10 text-yellow-500 hover:text-yellow-400 font-semibold rounded-xl transition-all"
              onClick={(e) => {
                e.stopPropagation();
                handleReject();
              }}
              disabled={loading}
            >
              {loading ? "..." : "Refuser"}
            </Button>

            {/* Bouton ACCEPTER */}
            <Button
              className="h-12 bg-gradient-to-r from-yellow-500 via-yellow-600 to-yellow-500 hover:from-yellow-400 hover:via-yellow-500 hover:to-yellow-400 text-slate-900 font-bold text-base shadow-lg shadow-yellow-500/30 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] border-0"
              onClick={(e) => {
                e.stopPropagation();
                handleAccept();
              }}
              disabled={loading}
            >
              {loading ? "Chargement..." : "ACCEPTER"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
