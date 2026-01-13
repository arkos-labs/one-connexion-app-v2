import { useState, useEffect } from "react";
import { motion, PanInfo, useMotionValue } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";

interface SwipeablePagesProps {
    children: React.ReactNode;
}

// Ordre des pages pour la navigation par swipe
const PAGE_ORDER = [
    "/driver/map",
    "/driver/history",
    "/driver/earnings",
    "/driver/vehicle",
    "/driver/documents",
    "/settings",
];

export const SwipeablePages = ({ children }: SwipeablePagesProps) => {
    const navigate = useNavigate();
    const location = useLocation();
    const x = useMotionValue(0);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isDragging, setIsDragging] = useState(false);

    // Mettre à jour l'index quand la route change
    useEffect(() => {
        const index = PAGE_ORDER.indexOf(location.pathname);
        if (index !== -1) {
            setCurrentIndex(index);
        }
    }, [location.pathname]);

    // Gestion du début du drag
    const handleDragStart = () => {
        setIsDragging(true);
    };

    // Gestion du swipe
    const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
        setIsDragging(false);

        const threshold = 80; // Distance minimale pour déclencher le swipe
        const velocity = Math.abs(info.velocity.x);
        const offset = info.offset.x;

        // Vérifier que c'est un swipe horizontal (et non vertical)
        const isHorizontalSwipe = Math.abs(offset) > Math.abs(info.offset.y);

        if (!isHorizontalSwipe) {
            x.set(0); // Reset position
            return;
        }

        // Swipe vers la droite (page précédente)
        if ((offset > threshold && velocity > 200) || offset > 150) {
            if (currentIndex > 0) {
                navigate(PAGE_ORDER[currentIndex - 1]);
            }
        }
        // Swipe vers la gauche (page suivante)
        else if ((offset < -threshold && velocity > 200) || offset < -150) {
            if (currentIndex < PAGE_ORDER.length - 1) {
                navigate(PAGE_ORDER[currentIndex + 1]);
            }
        }

        // Reset position
        x.set(0);
    };

    return (
        <>
            {/* Contenu avec swipe - SANS wrapper qui cache */}
            <motion.div
                drag="x"
                dragDirectionLock
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.3}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                style={{ x }}
                animate={{ opacity: isDragging ? 0.9 : 1 }}
                transition={{ duration: 0.2 }}
                className="h-full w-full"
            >
                {children}
            </motion.div>

            {/* Indicateurs de page (dots) - Position absolue par rapport au parent */}
            {PAGE_ORDER.length > 1 && (
                <div className="fixed bottom-6 left-0 right-0 flex justify-center gap-2 z-[600] pointer-events-none">
                    {PAGE_ORDER.map((_, index) => (
                        <motion.div
                            key={index}
                            initial={false}
                            animate={{
                                width: index === currentIndex ? 32 : 8,
                                opacity: index === currentIndex ? 1 : 0.5,
                            }}
                            transition={{ duration: 0.3 }}
                            className={`h-2 rounded-full ${index === currentIndex
                                    ? "bg-gradient-to-r from-yellow-400 to-yellow-600 shadow-lg shadow-yellow-500/50"
                                    : "bg-slate-600"
                                }`}
                        />
                    ))}
                </div>
            )}
        </>
    );
};
