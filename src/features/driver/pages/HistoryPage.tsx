import { useAppStore } from "@/stores/useAppStore";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Calendar,
    MapPin,
    Clock,
    Euro,
    Search,
    Filter,
    ArrowDownRight,
    ArrowRight
} from "lucide-react";
import { useState } from "react";

export const HistoryPage = () => {
    const { history } = useAppStore();
    const [searchTerm, setSearchTerm] = useState("");

    // Fonction utilitaire pour le formatage des dates
    const formatDate = (dateString?: string) => {
        if (!dateString) return "Date inconnue";
        return new Date(dateString).toLocaleDateString("fr-FR", {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Filtrage simple (par nom client ou adresse)
    const filteredHistory = history.filter(ride =>
        ride.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ride.pickupLocation.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ride.dropoffLocation.address.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-6 max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500">

            {/* En-tête avec Recherche */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Historique des courses</h1>
                    <p className="text-muted-foreground">Retrouvez le détail de vos {history.length} courses passées.</p>
                </div>

                <div className="flex gap-2 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Rechercher une course..."
                            className="pl-9 bg-background"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Button variant="outline" size="icon">
                        <Filter className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Liste des courses */}
            <div className="space-y-4">
                {filteredHistory.length === 0 ? (
                    <div className="text-center py-20 bg-secondary/20 rounded-3xl border-2 border-dashed">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-secondary mb-4">
                            <Calendar className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-medium">Aucune course trouvée</h3>
                        <p className="text-muted-foreground max-w-sm mx-auto mt-2">
                            Vos courses terminées apparaîtront ici. Commencez à rouler pour remplir votre historique.
                        </p>
                    </div>
                ) : (
                    filteredHistory.map((ride, index) => (
                        <Card key={ride.id || index} className="overflow-hidden hover:shadow-md transition-shadow">
                            <CardContent className="p-0">
                                <div className="flex flex-col md:flex-row">

                                    {/* Colonne Gauche : Date & Prix */}
                                    <div className="p-4 md:w-48 flex flex-row md:flex-col justify-between items-center md:items-start bg-secondary/30 md:border-r">
                                        <div className="space-y-1">
                                            <div className="flex items-center text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                                <Calendar className="mr-1 h-3 w-3" />
                                                {ride.completedAt ? new Date(ride.completedAt).toLocaleDateString() : 'Aujourd\'hui'}
                                            </div>
                                            <div className="text-sm font-medium">
                                                {ride.completedAt ? new Date(ride.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                                            </div>
                                        </div>

                                        <div className="text-right md:text-left mt-0 md:mt-4">
                                            <span className="text-xl font-bold text-green-600">
                                                {ride.price.toFixed(2)} €
                                            </span>
                                            {/* Payment method removed */}
                                        </div>
                                    </div>

                                    {/* Colonne Droite : Détails Trajet */}
                                    <div className="flex-1 p-4 md:p-5 flex flex-col justify-center gap-4">

                                        {/* Trajet Visuel */}
                                        <div className="relative pl-2 md:pl-0">

                                            {/* Ligne connecteur mobile */}
                                            <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-border md:hidden" />

                                            <div className="grid md:grid-cols-2 gap-4 md:gap-8">
                                                {/* Départ */}
                                                <div className="flex gap-3 items-start relative">
                                                    <div className="mt-1 h-2 w-2 rounded-full bg-blue-500 ring-4 ring-blue-500/20 shrink-0 md:hidden" />
                                                    <div>
                                                        <p className="text-xs text-muted-foreground mb-0.5 flex items-center">
                                                            <MapPin className="h-3 w-3 mr-1 inline md:hidden" />
                                                            Point de départ
                                                        </p>
                                                        <p className="font-medium text-sm leading-tight">{ride.pickupLocation.address}</p>
                                                    </div>
                                                    <div className="hidden md:block absolute -right-4 top-1/2 -translate-y-1/2 text-muted-foreground/30">
                                                        <ArrowRight className="h-5 w-5" />
                                                    </div>
                                                </div>

                                                {/* Arrivée */}
                                                <div className="flex gap-3 items-start">
                                                    <div className="mt-1 h-2 w-2 rounded-full bg-black ring-4 ring-black/10 shrink-0 md:hidden" />
                                                    <div>
                                                        <p className="text-xs text-muted-foreground mb-0.5">Destination</p>
                                                        <p className="font-medium text-sm leading-tight">{ride.dropoffLocation.address}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Footer Carte : Client + Actions */}
                                        <div className="pt-3 mt-1 border-t flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className="h-6 w-6 rounded-full bg-accent/10 flex items-center justify-center text-xs font-bold text-accent">
                                                    {ride.clientName.charAt(0)}
                                                </div>
                                                <span className="text-sm text-muted-foreground">{ride.clientName}</span>
                                            </div>

                                            <Button variant="ghost" size="sm" className="h-8 text-xs hover:bg-accent/5 hover:text-accent">
                                                Signaler un problème
                                            </Button>
                                        </div>

                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
};
