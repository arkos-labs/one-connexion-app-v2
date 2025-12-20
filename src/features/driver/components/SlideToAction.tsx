import { useState, useRef, useEffect, memo } from "react";
import { motion, useAnimation, PanInfo } from "framer-motion";
import { ChevronRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface SlideToActionProps {
  onConfirm: () => void;
  label?: string;
  isComplete?: boolean;
  className?: string;
}

const SlideToActionComponent = ({ onConfirm, label = "Glisser pour valider", isComplete = false, className }: SlideToActionProps) => {
  const [confirmed, setConfirmed] = useState(false);
  const controls = useAnimation();
  const constraintsRef = useRef<HTMLDivElement>(null);

  // Calculate width dynamically on drag end to ensure it works even if mounted during animation
  const handleDragEnd = async (_: any, info: PanInfo) => {
    if (!constraintsRef.current) return;

    // Width of container - Width of button (48px) - Padding (both sides ~8px)
    // Using simple offset measurement
    const containerWidth = constraintsRef.current.offsetWidth;
    const dragWidth = containerWidth - 56; // 56px accounting for button size + potential padding

    if (info.offset.x > dragWidth * 0.5) { // Threshold reduced to 50% for better UX
      setConfirmed(true);
      await controls.start({ x: dragWidth });
      onConfirm(); // Fire immediatly
    } else {
      controls.start({ x: 0 });
    }
  };

  return (
    <div
      ref={constraintsRef}
      className={cn(
        "relative h-14 w-full rounded-full bg-secondary/50 p-1 backdrop-blur-sm border border-border/50 overflow-hidden",
        isComplete && "bg-green-500/20 border-green-500/50",
        className
      )}
    >
      {/* Texte de fond */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <span className={cn(
          "text-sm font-semibold uppercase tracking-wider transition-opacity duration-300",
          confirmed ? "opacity-0" : "text-muted-foreground opacity-50"
        )}>
          {label}
        </span>
      </div>

      {/* Texte de succès */}
      <div className={cn(
        "absolute inset-0 flex items-center justify-center transition-opacity duration-300 pointer-events-none",
        confirmed ? "opacity-100" : "opacity-0"
      )}>
        <span className="text-sm font-bold text-green-500 uppercase tracking-widest flex items-center gap-2">
          <Check className="h-4 w-4" /> Validé
        </span>
      </div>

      {/* Le Bouton Glissant */}
      <motion.div
        drag="x"
        dragConstraints={constraintsRef}
        dragElastic={0.05} // Reduced elasticity
        dragMomentum={false}
        onDragEnd={handleDragEnd}
        animate={controls}
        whileTap={{ scale: 1.05, cursor: "grabbing" }}
        className={cn(
          "flex h-12 w-12 cursor-grab items-center justify-center rounded-full shadow-lg active:cursor-grabbing z-10",
          confirmed ? "bg-green-500 text-white" : "bg-primary text-primary-foreground"
        )}
      >
        {confirmed ? <Check className="h-6 w-6" /> : <ChevronRight className="h-6 w-6" />}
      </motion.div>
    </div>
  );
};

export const SlideToAction = memo(SlideToActionComponent);
