import { useState, useRef } from "react";
import { motion, useMotionValue, useTransform, PanInfo } from "framer-motion";
import { ChevronRight, Check, X } from "lucide-react";

interface SlideToActionProps {
  onComplete: () => void;
  label: string;
  completeLabel: string;
  variant?: "success" | "danger";
  disabled?: boolean;
}

export const SlideToAction = ({
  onComplete,
  label,
  completeLabel,
  variant = "success",
  disabled = false,
}: SlideToActionProps) => {
  const [isComplete, setIsComplete] = useState(false);
  const constraintsRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  
  const trackWidth = 280;
  const thumbSize = 56;
  const maxSlide = trackWidth - thumbSize - 8;

  const backgroundOpacity = useTransform(x, [0, maxSlide], [0, 1]);
  const labelOpacity = useTransform(x, [0, maxSlide * 0.5], [1, 0]);
  const checkOpacity = useTransform(x, [maxSlide * 0.7, maxSlide], [0, 1]);

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.x >= maxSlide * 0.8) {
      setIsComplete(true);
      onComplete();
    }
  };

  const bgColor = variant === "success" ? "bg-accent" : "bg-destructive";
  const thumbColor = variant === "success" ? "bg-accent" : "bg-destructive";

  if (isComplete) {
    return (
      <motion.div
        className={`relative flex h-16 w-[280px] items-center justify-center rounded-full ${bgColor}`}
        initial={{ scale: 1 }}
        animate={{ scale: [1, 1.02, 1] }}
        transition={{ duration: 0.3 }}
      >
        <motion.div
          className="flex items-center gap-2 text-accent-foreground font-medium"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <Check className="h-5 w-5" />
          {completeLabel}
        </motion.div>
      </motion.div>
    );
  }

  return (
    <div
      ref={constraintsRef}
      className={`relative flex h-16 w-[280px] items-center rounded-full border border-border/50 bg-secondary/50 backdrop-blur-sm ${
        disabled ? "opacity-50" : ""
      }`}
    >
      {/* Progress Background */}
      <motion.div
        className={`absolute inset-1 rounded-full ${bgColor}`}
        style={{ opacity: backgroundOpacity, originX: 0 }}
      />

      {/* Label */}
      <motion.span
        className="absolute inset-0 flex items-center justify-center text-sm font-medium text-muted-foreground"
        style={{ opacity: labelOpacity }}
      >
        {label}
      </motion.span>

      {/* Complete Check */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        style={{ opacity: checkOpacity }}
      >
        <Check className="h-5 w-5 text-accent-foreground" />
      </motion.div>

      {/* Draggable Thumb */}
      <motion.div
        className={`absolute left-1 flex h-14 w-14 cursor-grab items-center justify-center rounded-full ${thumbColor} shadow-lg active:cursor-grabbing`}
        drag={disabled ? false : "x"}
        dragConstraints={{ left: 0, right: maxSlide }}
        dragElastic={0}
        dragMomentum={false}
        style={{ x }}
        onDragEnd={handleDragEnd}
        whileTap={{ scale: 0.95 }}
      >
        <ChevronRight className="h-6 w-6 text-accent-foreground" />
      </motion.div>
    </div>
  );
};
