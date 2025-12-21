import { useAppStore } from "@/stores/useAppStore";
import {
    Calendar,
    ChevronRight,
    MapPin,
    Clock,
    CreditCard,
    Search,
    Filter,
    ArrowLeft
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";

export const HistoryPage = () => {
    const navigate = useNavigate();
    const { history } = useAppStore();

    const formatPrice = (cents: number) => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'EUR',
        }).format(cents / 100);
    };

    return (
        <div className="flex flex-col h-full bg-background/50 backdrop-blur-xl">
            {/* Header Sticky */}
            <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-md border-b border-border/10 p-4">
                <div className="flex items-center gap-4 mb-6">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate('/driver')}
                        className="rounded-full hover:bg-secondary/80"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <h1 className="text-2xl font-bold tracking-tight">Historique</h1>
                </div>

                {/* Search & Filter Bar */}
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Rechercher une course..."
                            className="pl-9 bg-secondary/30 border-none rounded-xl"
                        />
                    </div>
                    <Button variant="outline" size="icon" className="rounded-xl border-dashed">
                        <Filter className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <ScrollArea className="flex-1 px-4 py-6">
                <div className="max-w-2xl mx-auto space-y-4">
                    {history.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                            <div className="h-20 w-20 rounded-full bg-secondary/50 flex items-center justify-center">
                                <Clock className="h-10 w-10 text-muted-foreground" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold">Aucune course terminée</h3>
                                <p className="text-muted-foreground text-sm">
                                    Vos courses terminées apparaîtront ici.
                                </p>
                            </div>
                        </div>
                    ) : (
                        history.map((ride) => (
                            <div
                                key={ride.id}
                                className="group relative bg-card/40 hover:bg-card/60 border border-border/10 rounded-2xl p-4 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 active:scale-[0.98] cursor-pointer"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-2">
                                        <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                            <Calendar className="h-4 w-4" />
                                        </div>
                                        <span className="font-semibold text-sm">
                                            {format(new Date(ride.createdAt), "dd MMMM yyyy", { locale: fr })}
                                        </span>
                                    </div>
                                    <Badge variant="secondary" className="bg-green-500/10 text-green-500 border-none font-bold">
                                        {formatPrice(ride.priceInCents)}
                                    </Badge>
                                </div>

                                <div className="space-y-3 relative pl-4 border-l-2 border-dashed border-border/30 ml-2">
                                    <div className="relative">
                                        <div className="absolute -left-[23px] top-1 h-3 w-3 rounded-full bg-primary border-4 border-background shadow-sm" />
                                        <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-0.5">Départ</p>
                                        <p className="text-sm font-medium line-clamp-1">{ride.pickupAddress}</p>
                                    </div>

                                    <div className="relative pt-2">
                                        <div className="absolute -left-[23px] top-3 h-3 w-3 rounded-full bg-yellow-500 border-4 border-background shadow-sm" />
                                        <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-0.5">Arrivée</p>
                                        <p className="text-sm font-medium line-clamp-1">{ride.dropoffAddress}</p>
                                    </div>
                                </div>

                                <div className="mt-4 pt-4 border-t border-border/10 flex items-center justify-between text-xs text-muted-foreground">
                                    <div className="flex gap-4">
                                        <span className="flex items-center gap-1.5 font-medium">
                                            <Clock className="h-3 w-3" /> 14 min
                                        </span>
                                        <span className="flex items-center gap-1.5 font-medium">
                                            <CreditCard className="h-3 w-3" /> {ride.paymentMethod === 'card' ? 'Carte' : 'Espèces'}
                                        </span>
                                    </div>
                                    <ChevronRight className="h-4 w-4 opacity-30 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </ScrollArea>
        </div>
    );
};
