import { SidebarTrigger } from "@/components/ui/sidebar";
import { Switch } from "@/components/ui/switch";
import { useAppStore } from "@/stores/useAppStore";
import { MapPin, Navigation } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

export const DriverTopBar = () => {
    const { driverStatus, setDriverStatus, currentOrder } = useAppStore();
    const location = useLocation();

    const isOnline = driverStatus === 'online';
    const isMapPage = location.pathname === '/driver' || location.pathname === '/driver/map';

    // Vérifie si une course est vraiment active (acceptée ou en cours)
    const hasActiveRide = currentOrder && (currentOrder.status === 'accepted' || currentOrder.status === 'in_progress');

    const handleStatusToggle = (checked: boolean) => {
        setDriverStatus(checked ? 'online' : 'offline');
    };

    return (
        <header className="relative w-full z-50 shrink-0 flex h-16 items-center border-b bg-background/95 backdrop-blur px-4 shadow-sm justify-between transition-all">
            {/* 1. Zone Gauche : Menu + Retour Carte */}
            <div className="flex items-center gap-2 z-10 shrink-0">
                <SidebarTrigger />

                {!isMapPage && (
                    <Link
                        to="/driver"
                        className={cn(
                            "flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-full transition-all shadow-sm border",
                            hasActiveRide
                                ? "bg-green-600 text-white hover:bg-green-700 border-green-700 animate-in fade-in" // Style Urgent
                                : "bg-primary/10 text-primary hover:bg-primary/20 border-transparent" // Style Normal
                        )}
                    >
                        {hasActiveRide ? (
                            <>
                                <Navigation className="h-3 w-3 animate-pulse" />
                                <span className="hidden sm:inline">Course en cours</span>
                                <span className="sm:hidden">Retour GPS</span>
                            </>
                        ) : (
                            <>
                                <MapPin className="h-3 w-3" />
                                <span className="hidden sm:inline">Carte</span>
                            </>
                        )}
                    </Link>
                )}

                {/* On masque le titre sur mobile pour laisser la place au switch centré */}
                <span className="font-semibold hidden md:inline-block ml-2">One Connexion</span>
            </div>

            {/* 2. Statut Global (CENTRÉ ABSOLUMENT) */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-3 bg-secondary/30 p-1.5 rounded-full border border-border/50 shadow-sm z-0">
                <span className={`text-xs font-bold uppercase tracking-wider px-2 whitespace-nowrap ${isOnline ? 'text-green-600' : 'text-muted-foreground'}`}>
                    {isOnline ? 'En ligne' : 'Hors ligne'}
                </span>
                <div className="flex items-center gap-2">
                    <Switch
                        checked={isOnline}
                        onCheckedChange={handleStatusToggle}
                        className="data-[state=checked]:bg-green-600"
                    />
                </div>
            </div>

            {/* 3. Zone Droite */}
            <div className="w-8 shrink-0 z-10" />
        </header>
    );
};
