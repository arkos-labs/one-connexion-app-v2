import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { MapPin, Calendar, CreditCard, Star, Car } from "lucide-react";
import {
    Sheet,
    SheetContent,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAppStore } from "@/stores/useAppStore";

interface DriverProfileProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export const DriverProfile = ({ open, onOpenChange }: DriverProfileProps) => {
    const { user, history, earnings, driverStatus } = useAppStore();

    // Mock Data pour le profil (en attendant l'auth complète)
    const driverInfo = {
        name: user?.fullName || "Chauffeur Connecté",
        rating: 4.92,
        trips: history.length,
        vehicle: "Tesla Model 3 • AB-123-CD",
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="left" className="w-[85%] sm:max-w-[400px] p-0 border-r border-border/50">

                {/* Header Profil */}
                <div className="bg-secondary/30 p-6 pt-12 flex flex-col items-center border-b border-border/50">
                    <div className="relative mb-4">
                        <Avatar className="h-24 w-24 border-4 border-background shadow-xl">
                            <AvatarImage src="https://github.com/shadcn.png" />
                            <AvatarFallback>DR</AvatarFallback>
                        </Avatar>
                        <Badge className="absolute -bottom-2 -right-2 px-2 py-1 bg-yellow-500 text-white border-2 border-background">
                            {driverInfo.rating} <Star className="h-3 w-3 ml-1 fill-current" />
                        </Badge>
                    </div>

                    <h2 className="text-xl font-bold">{driverInfo.name}</h2>
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                        <Car className="h-3 w-3" /> {driverInfo.vehicle}
                    </p>

                    <div className="grid grid-cols-3 gap-4 w-full mt-6 text-center">
                        <div>
                            <p className="text-2xl font-bold">{driverInfo.trips}</p>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Courses</p>
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{earnings.toFixed(0)}€</p>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Gains</p>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-green-500">{driverStatus === 'online' ? 'ON' : 'OFF'}</p>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Statut</p>
                        </div>
                    </div>
                </div>

                {/* Historique des Courses */}
                <div className="p-4 bg-background">
                    <h3 className="font-semibold text-sm mb-4 flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-primary" />
                        Historique Récent
                    </h3>

                    <ScrollArea className="h-[calc(100vh-380px)] pr-4">
                        <div className="space-y-4">
                            {history.length === 0 ? (
                                <div className="text-center py-10 text-muted-foreground">
                                    <p>Aucune course terminée.</p>
                                    <p className="text-xs">Passez en ligne pour commencer !</p>
                                </div>
                            ) : (
                                history.map((order) => (
                                    <div key={order.id} className="group flex flex-col gap-3 rounded-xl border border-border/50 p-4 hover:bg-secondary/20 transition-colors">
                                        <div className="flex justify-between items-start">
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline" className="text-[10px] h-5">
                                                    {order.completedAt ? format(new Date(order.completedAt), "HH:mm", { locale: fr }) : "-"}
                                                </Badge>
                                                <span className="text-sm font-medium">{order.price.toFixed(2)}€</span>
                                            </div>
                                            <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20 border-0 text-[10px]">
                                                Terminée
                                            </Badge>
                                        </div>

                                        <div className="relative pl-4 space-y-4 border-l border-border/50 ml-1">
                                            {/* Points visuels timeline */}
                                            <div className="absolute -left-[5px] top-0 h-2.5 w-2.5 rounded-full border-2 border-background bg-blue-500 ring-1 ring-border" />
                                            <div className="absolute -left-[5px] bottom-0 h-2.5 w-2.5 rounded-full border-2 border-background bg-green-500 ring-1 ring-border" />

                                            <div>
                                                <p className="text-xs text-muted-foreground">Retrait</p>
                                                <p className="text-xs font-medium line-clamp-1">{order.pickupLocation.address}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-muted-foreground">Destination</p>
                                                <p className="text-xs font-medium line-clamp-1">{order.dropoffLocation.address}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </ScrollArea>
                </div>

            </SheetContent>
        </Sheet>
    );
};
