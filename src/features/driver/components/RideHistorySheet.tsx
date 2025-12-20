import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useAppStore } from "@/stores/useAppStore";
import { format } from "date-fns"; // Assurez-vous d'avoir date-fns ou utilisez Intl
import { fr } from "date-fns/locale";
import { ArrowRight, Calendar, Clock, Euro, MapPin, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RideHistorySheetProps {
    isOpen: boolean;
    onClose: () => void;
}

export const RideHistorySheet = ({ isOpen, onClose }: RideHistorySheetProps) => {
    const { history } = useAppStore();

    // Fonction utilitaire pour formater la date si date-fns n'est pas dispo, sinon adapter
    const formatDate = (dateString?: string) => {
        if (!dateString) return "Date inconnue";
        return new Date(dateString).toLocaleDateString("fr-FR", {
            day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
        });
    };

    return (
        <Sheet open={isOpen} onOpenChange={onClose}>
            <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl p-0 flex flex-col">

                {/* En-tête Fixe */}
                <div className="p-5 border-b flex items-center justify-between bg-background/80 backdrop-blur-sm sticky top-0 z-10 rounded-t-3xl">
                    <div>
                        <SheetTitle className="text-xl font-bold">Historique</SheetTitle>
                        <p className="text-sm text-muted-foreground">{history.length} courses réalisées</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full bg-secondary/50">
                        <X className="h-5 w-5" />
                    </Button>
                </div>

                {/* Liste Défilante */}
                <ScrollArea className="flex-1 p-4 bg-secondary/10">
                    <div className="space-y-4 pb-10">
                        {history.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                                <Calendar className="h-12 w-12 mb-2 opacity-20" />
                                <p>Aucune course terminée</p>
                            </div>
                        ) : (
                            history.map((ride, index) => (
                                <div
                                    key={ride.id || index}
                                    className="bg-card rounded-2xl p-4 border shadow-sm flex flex-col gap-3"
                                >
                                    {/* Ligne 1: Date et Prix */}
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-secondary/50 px-2 py-1 rounded-md">
                                            <Clock className="h-3 w-3" />
                                            {/* Utilisation de completedAt s'il existe, sinon fallback */}
                                            <span>{formatDate(ride.completedAt || new Date().toISOString())}</span>
                                        </div>
                                        <div className="flex items-center text-green-600 font-bold bg-green-500/10 px-3 py-1 rounded-full">
                                            <span>+{ride.price.toFixed(2)}</span>
                                            <Euro className="h-3 w-3 ml-0.5" />
                                        </div>
                                    </div>

                                    {/* Ligne 2: Trajet */}
                                    <div className="relative pl-4 space-y-4 border-l-2 border-dashed border-border/60 ml-1">
                                        {/* Départ */}
                                        <div className="relative">
                                            <div className="absolute -left-[21px] top-1 h-3 w-3 rounded-full border-2 border-background bg-accent ring-1 ring-accent/30" />
                                            <p className="text-xs text-muted-foreground">Départ</p>
                                            <p className="text-sm font-medium leading-tight line-clamp-1">{ride.pickupLocation.address}</p>
                                        </div>
                                        {/* Arrivée */}
                                        <div className="relative">
                                            <div className="absolute -left-[21px] top-1 h-3 w-3 rounded-full border-2 border-background bg-foreground ring-1 ring-foreground/30" />
                                            <p className="text-xs text-muted-foreground">Destination</p>
                                            <p className="text-sm font-medium leading-tight line-clamp-1">{ride.dropoffLocation.address}</p>
                                        </div>
                                    </div>

                                    {/* Ligne 3: Client */}
                                    <div className="flex items-center justify-between pt-2 border-t mt-1">
                                        <span className="text-xs text-muted-foreground">Client: {ride.clientName}</span>
                                        <div className="flex items-center gap-1 text-xs font-medium text-accent">
                                            <span>Voir reçu</span>
                                            <ArrowRight className="h-3 w-3" />
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </ScrollArea>
            </SheetContent>
        </Sheet>
    );
};
