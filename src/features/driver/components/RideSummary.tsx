import { useEffect } from "react";
import { motion } from "framer-motion";
import { MapPin, Navigation, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Order } from "@/types";
import { useAppStore } from "@/stores/useAppStore";
import confetti from "canvas-confetti";

// Son de caisse enregistreuse
const CASH_SOUND_URL = "https://assets.mixkit.co/active_storage/sfx/2003/2003-preview.mp3";

export const RideSummary = ({ order }: { order: Order }) => {
    const { clearSummary, driverStatus } = useAppStore();

    useEffect(() => {
        // 1. Jouer le son
        const audio = new Audio(CASH_SOUND_URL);
        audio.volume = 0.5;
        audio.play().catch(e => console.log("Audio play blocked", e));

        // 2. Lancer des confettis dorés
        confetti({
            particleCount: 150,
            spread: 80,
            origin: { y: 0.6 },
            colors: ['#fbbf24', '#f59e0b', '#ffffff', '#fef3c7']
        });
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl"
        >
            <div className="relative w-full max-w-md">

                {/* Header flottant */}
                <div className="absolute -top-16 left-4 right-4 z-10 flex items-center justify-between">
                    {/* Bouton Menu */}
                    <button className="h-10 w-10 rounded-xl bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 flex items-center justify-center hover:bg-slate-800 transition-colors">
                        <Menu className="h-5 w-5 text-white" />
                    </button>

                    {/* Badge EN LIGNE */}
                    <div className="bg-gradient-to-r from-emerald-400 to-emerald-500 text-slate-900 text-xs font-bold px-4 py-2 rounded-full shadow-lg shadow-emerald-500/30 flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-slate-900 animate-pulse"></div>
                        EN LIGNE
                    </div>
                </div>

                {/* Card principale */}
                <div className="bg-slate-900/95 backdrop-blur-xl border-2 border-slate-700/50 rounded-3xl shadow-2xl overflow-hidden">

                    {/* Titre */}
                    <div className="bg-gradient-to-b from-slate-800/50 to-transparent p-6 pb-4 border-b border-slate-800/50">
                        <h2 className="text-center text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-500">
                            Course Terminée !
                        </h2>
                    </div>

                    <div className="p-6 space-y-6">

                        {/* Prix - ÉNORME et doré */}
                        <div className="text-center py-4">
                            <div className="relative inline-block">
                                {/* Effet de brillance */}
                                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 via-yellow-500/30 to-yellow-400/20 blur-3xl"></div>

                                <div className="relative">
                                    <span className="text-6xl font-black bg-gradient-to-br from-yellow-300 via-yellow-400 to-yellow-600 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(234,179,8,0.5)]">
                                        {order.price.toFixed(2)} €
                                    </span>
                                </div>
                            </div>

                            {/* Badge GAIN TOTAL */}
                            <div className="flex justify-center mt-3">
                                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider bg-gradient-to-r from-yellow-400 to-yellow-500 px-4 py-1.5 rounded-full shadow-lg shadow-yellow-500/30">
                                    GAIN TOTAL
                                </span>
                            </div>
                        </div>

                        {/* Détails du trajet */}
                        <div className="space-y-3 bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 p-4 rounded-2xl">
                            {/* Départ */}
                            <div className="flex gap-3 items-start">
                                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center shrink-0 shadow-lg shadow-yellow-500/20">
                                    <MapPin className="h-5 w-5 text-slate-900" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-[10px] text-yellow-400 font-bold uppercase tracking-wider mb-0.5">DÉPART</p>
                                    <p className="font-medium text-sm text-white leading-tight">{order.pickupLocation.address}</p>
                                </div>
                            </div>

                            {/* Arrivée */}
                            <div className="flex gap-3 items-start">
                                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center shrink-0 shadow-lg shadow-yellow-500/20">
                                    <Navigation className="h-5 w-5 text-slate-900" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-[10px] text-yellow-400 font-bold uppercase tracking-wider mb-0.5">ARRIVÉE</p>
                                    <p className="font-medium text-sm text-white leading-tight">{order.dropoffLocation.address}</p>
                                </div>
                            </div>
                        </div>

                        {/* Bouton CONTINUER */}
                        <Button
                            onClick={clearSummary}
                            className="w-full h-14 text-base font-bold rounded-2xl bg-gradient-to-r from-yellow-500 via-yellow-600 to-yellow-500 hover:from-yellow-400 hover:via-yellow-500 hover:to-yellow-400 text-slate-900 shadow-lg shadow-yellow-500/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
                        >
                            CONTINUER
                        </Button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};
