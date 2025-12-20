import { motion } from "framer-motion";
import { Power } from "lucide-react";
import { useAppStore } from "@/stores/useAppStore";
import { cn } from "@/lib/utils";

export const DriverStatusToggle = () => {
    const { isOnDuty, setDriverStatus } = useAppStore();

    const toggle = () => setDriverStatus(isOnDuty ? "offline" : "online");

    return (
        <div
            onClick={toggle}
            className={cn(
                "relative flex h-12 w-48 cursor-pointer items-center rounded-full border-2 p-1 transition-colors duration-500 shadow-xl",
                isOnDuty
                    ? "bg-green-600 border-green-500 shadow-green-900/20"
                    : "bg-slate-950 border-slate-800"
            )}
        >
            {/* Texte Arrière-plan (Centré) */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span
                    className={cn(
                        "font-black text-xs uppercase tracking-[0.2em] transition-all duration-500 transform",
                        isOnDuty ? "text-white translate-x-[-12px]" : "text-slate-500 translate-x-[12px]"
                    )}
                >
                    {isOnDuty ? "En Ligne" : "Hors Ligne"}
                </span>
            </div>

            {/* Le Curseur Glissant (Thumb) */}
            <motion.div
                className="z-10 h-full aspect-square rounded-full bg-white shadow-lg flex items-center justify-center"
                layout
                transition={{ type: "spring", stiffness: 700, damping: 30 }}
                // L'astuce Flexbox : justify-start (gauche) ou justify-end (droite) géré par le parent
                style={{
                    marginLeft: isOnDuty ? "auto" : "0",
                    marginRight: isOnDuty ? "0" : "auto"
                }}
            >
                <Power className={cn(
                    "h-4 w-4 transition-colors duration-300",
                    isOnDuty ? "text-green-600" : "text-slate-400"
                )} />
            </motion.div>
        </div>
    );
};

// Alias pour compatibilité
export const DriverStatusBadge = DriverStatusToggle;
