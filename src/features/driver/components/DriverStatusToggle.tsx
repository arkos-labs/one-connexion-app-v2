import { motion } from "framer-motion";
import { Power } from "lucide-react";
import { useAppStore } from "@/stores/useAppStore";
import { cn } from "@/lib/utils";

import { toast } from "@/hooks/use-toast";

export const DriverStatusToggle = () => {
    const currentOrder = useAppStore((state) => state.currentOrder);
    const isOnDuty = useAppStore((state) => state.isOnDuty);
    const setIsOnDuty = useAppStore((state) => state.setIsOnDuty);

    const toggle = () => {
        // Ne pas permettre de toggle si une course est en cours
        if (currentOrder) {
            toast({
                title: "Course en cours",
                description: "Veuillez terminer votre course avant de changer votre statut.",
                variant: "destructive",
            });
            return;
        }

        const success = setIsOnDuty(!isOnDuty);
        if (!success) {
            toast({
                title: "Action refusée",
                description: "Veuillez terminer votre course active avant de vous mettre hors ligne.",
                variant: "destructive",
            });
        }
    };

    // Déterminer le statut à afficher
    const displayStatus = currentOrder ? "course" : (isOnDuty ? "online" : "offline");
    const statusText = currentOrder ? "En Course" : (isOnDuty ? "En Ligne" : "Hors Ligne");
    const isActive = currentOrder || isOnDuty;

    return (
        <div
            onClick={toggle}
            className={cn(
                "relative flex h-12 w-48 items-center rounded-full border-2 p-1 transition-colors duration-500 shadow-xl",
                currentOrder
                    ? "bg-orange-600 border-orange-500 shadow-orange-900/20 cursor-not-allowed" // EN COURSE
                    : isOnDuty
                        ? "bg-green-600 border-green-500 shadow-green-900/20 cursor-pointer" // EN LIGNE
                        : "bg-slate-950 border-slate-800 cursor-pointer" // HORS LIGNE
            )}
        >
            {/* Texte Arrière-plan (Centré) */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span
                    className={cn(
                        "font-black text-xs uppercase tracking-[0.2em] transition-all duration-500 transform",
                        isActive ? "text-white translate-x-[-12px]" : "text-slate-500 translate-x-[12px]"
                    )}
                >
                    {statusText}
                </span>
            </div>

            {/* Le Curseur Glissant (Thumb) */}
            <motion.div
                className="z-10 h-full aspect-square rounded-full bg-white shadow-lg flex items-center justify-center"
                layout
                transition={{ type: "spring", stiffness: 700, damping: 30 }}
                style={{
                    marginLeft: isActive ? "auto" : "0",
                    marginRight: isActive ? "0" : "auto"
                }}
            >
                <Power className={cn(
                    "h-4 w-4 transition-colors duration-300",
                    currentOrder ? "text-orange-600" : (isOnDuty ? "text-green-600" : "text-slate-400")
                )} />
            </motion.div>
        </div>
    );
};

// Alias pour compatibilité
export const DriverStatusBadge = DriverStatusToggle;
