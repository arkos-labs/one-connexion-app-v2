import { useAppStore } from "@/stores/useAppStore";
import {
    ArrowLeft,
    MapPin,
    Navigation,
    User
} from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState } from "react";

export const HistoryPage = () => {
    const navigate = useNavigate();
    const { history: rawHistory } = useAppStore();
    const history = rawHistory;
    const [activeFilter, setActiveFilter] = useState<'all' | 'completed' | 'early'>('completed');

    const formatPrice = (cents: number) => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'EUR',
        }).format(cents / 100);
    };

    // Mock clients names
    const clientNames = ["Mathis Dupont", "Sophie Martin", "Lucas Bernard", "Emma Dubois"];

    return (
        <div className="flex flex-col h-full bg-slate-950">
            {/* Header */}
            <div className="sticky top-0 z-30 px-6 pt-8 pb-4 bg-slate-950/95 backdrop-blur-xl border-b border-slate-800/50">
                <div className="flex items-center justify-between mb-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate('/driver')}
                        className="rounded-xl hover:bg-slate-800"
                    >
                        <ArrowLeft className="h-5 w-5 text-white" />
                    </Button>
                    <h1 className="text-lg font-bold text-white">Historique des Courses</h1>
                    <div className="w-10"></div> {/* Spacer */}
                </div>

                {/* Filtres */}
                <div className="flex gap-2 justify-center">
                    <button
                        onClick={() => setActiveFilter('completed')}
                        className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${activeFilter === 'completed'
                                ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-slate-900'
                                : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700'
                            }`}
                    >
                        Terminée
                    </button>
                    <button
                        onClick={() => setActiveFilter('all')}
                        className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${activeFilter === 'all'
                                ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-slate-900'
                                : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700'
                            }`}
                    >
                        Tous
                    </button>
                    <button
                        onClick={() => setActiveFilter('early')}
                        className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${activeFilter === 'early'
                                ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-slate-900'
                                : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700'
                            }`}
                    >
                        Tôt
                    </button>
                </div>
            </div>

            <ScrollArea className="flex-1 px-6">
                <div className="space-y-4 pt-6 pb-24">

                    {history.length === 0 ? (
                        <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 rounded-3xl p-10 text-center">
                            <div className="h-16 w-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                <User className="h-6 w-6 text-slate-400" />
                            </div>
                            <h3 className="font-semibold text-white">Aucune course</h3>
                            <p className="text-slate-400 text-sm mt-1">Vous n'avez pas encore effectué de course.</p>
                        </div>
                    ) : (
                        history.map((ride, idx) => {
                            // Alternance de style : certaines cards ont un dégradé doré
                            const hasGoldGradient = idx % 3 === 0;

                            return (
                                <div
                                    key={ride.id || idx}
                                    className={`relative rounded-3xl p-5 transition-all duration-300 hover:scale-[1.02] ${hasGoldGradient
                                            ? 'bg-gradient-to-br from-yellow-900/30 via-yellow-800/20 to-slate-900/50 border-2 border-yellow-500/20'
                                            : 'bg-slate-900/50 backdrop-blur-sm border-2 border-slate-800/50'
                                        }`}
                                >
                                    {/* Top Row: Client & Prix */}
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex gap-3">
                                            <Avatar className="h-12 w-12 border-2 border-slate-700">
                                                <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${idx}`} />
                                                <AvatarFallback className="bg-slate-800 text-white font-bold">
                                                    {clientNames[idx % clientNames.length].split(' ').map(n => n[0]).join('')}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <h4 className="font-bold text-sm text-white">{clientNames[idx % clientNames.length]}</h4>
                                                <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                                                    <span>{format(new Date(ride.createdAt), "dd/MM/yyyy")}</span>
                                                    <span>•</span>
                                                    <span>{format(new Date(ride.createdAt), "HH:mm")}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-500">
                                                {formatPrice(ride.priceInCents)}
                                            </span>
                                            <span className="text-[10px] font-bold text-slate-900 bg-gradient-to-r from-yellow-400 to-yellow-500 px-3 py-1 rounded-full mt-1">
                                                TERMINÉE
                                            </span>
                                        </div>
                                    </div>

                                    {/* Route */}
                                    <div className="space-y-3">
                                        {/* Départ */}
                                        <div className="flex items-start gap-3">
                                            <div className="h-8 w-8 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0 mt-0.5">
                                                <MapPin className="h-4 w-4 text-blue-400" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-[10px] text-blue-400 font-bold uppercase tracking-wider mb-0.5">DÉPART</p>
                                                <p className="text-sm font-medium text-white leading-tight line-clamp-1">
                                                    {ride.pickupAddress}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Arrivée */}
                                        <div className="flex items-start gap-3">
                                            <div className="h-8 w-8 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0 mt-0.5">
                                                <Navigation className="h-4 w-4 text-emerald-400" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider mb-0.5">ARRIVÉE</p>
                                                <p className="text-sm font-medium text-white leading-tight line-clamp-1">
                                                    {ride.dropoffAddress}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </ScrollArea>
        </div>
    );
};
