import { useEffect } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Euro, MapPin, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Order } from "@/types";
import { useAppStore } from "@/stores/useAppStore";
import confetti from "canvas-confetti";

// Son simple en base64 (bruit de caisse enregistreuse court) ou lien vers mp3
const CASH_SOUND_URL = "https://assets.mixkit.co/active_storage/sfx/2003/2003-preview.mp3";

export const RideSummary = ({ order }: { order: Order }) => {
    const { clearSummary } = useAppStore();

    useEffect(() => {
        // 1. Jouer le son
        const audio = new Audio(CASH_SOUND_URL);
        audio.volume = 0.5;
        audio.play().catch(e => console.log("Audio play blocked", e));

        // 2. Lancer des confettis
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.8 },
            colors: ['#22c55e', '#ffffff'] // Vert et Blanc
        });
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute inset-0 z-50 flex items-end justify-center pb-6 px-4 bg-background/80 backdrop-blur-sm"
        >
            <div className="w-full max-w-md bg-card border border-border rounded-3xl shadow-2xl overflow-hidden">
                {/* Header Vert Succès */}
                <div className="bg-green-600 p-6 text-white text-center relative overflow-hidden">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                        className="flex justify-center mb-2"
                    >
                        <div className="bg-white/20 p-3 rounded-full">
                            <CheckCircle2 className="h-10 w-10 text-white" />
                        </div>
                    </motion.div>
                    <h2 className="text-2xl font-bold">Course Terminée !</h2>
                    <p className="text-green-100">Paiement reçu</p>
                </div>

                {/* Corps du résumé */}
                <div className="p-6 space-y-6">

                    {/* Le Montant (Héros) */}
                    <div className="text-center">
                        <span className="text-muted-foreground text-sm uppercase tracking-wider font-semibold">Gain total</span>
                        <div className="flex items-center justify-center text-4xl font-extrabold text-foreground mt-1">
                            <span>{order.price.toFixed(2)}</span>
                            <Euro className="h-8 w-8 ml-1 text-green-600" />
                        </div>
                    </div>

                    {/* Détails trajet */}
                    <div className="bg-secondary/50 rounded-xl p-4 space-y-3">
                        <div className="flex items-start gap-3">
                            <div className="mt-1"><div className="h-2 w-2 rounded-full bg-green-500 ring-4 ring-green-500/20" /></div>
                            <div>
                                <p className="text-xs text-muted-foreground">Départ</p>
                                <p className="text-sm font-medium leading-tight">{order.pickupLocation.address}</p>
                            </div>
                        </div>
                        <div className="w-0.5 h-4 bg-border ml-[5px]" /> {/* Ligne connecteur */}
                        <div className="flex items-start gap-3">
                            <div className="mt-1"><div className="h-2 w-2 rounded-full bg-red-500 ring-4 ring-red-500/20" /></div>
                            <div>
                                <p className="text-xs text-muted-foreground">Arrivée</p>
                                <p className="text-sm font-medium leading-tight">{order.dropoffLocation.address}</p>
                            </div>
                        </div>
                    </div>

                    {/* Bouton Action */}
                    <Button
                        className="w-full h-12 text-lg font-semibold rounded-xl"
                        size="lg"
                        onClick={clearSummary}
                    >
                        Continuer
                    </Button>
                </div>
            </div>
        </motion.div>
    );
};
