import { motion } from "framer-motion";
import { Power } from "lucide-react";
import { useAppStore } from "@/stores/useAppStore";

export const DriverStatusToggle = () => {
  const { isOnDuty, driverStatus, setIsOnDuty } = useAppStore();

  const handleToggle = () => {
    setIsOnDuty(!isOnDuty);
  };

  return (
    <motion.button
      onClick={handleToggle}
      className={`relative flex h-20 w-20 items-center justify-center rounded-full transition-colors ${
        isOnDuty
          ? "bg-accent shadow-glow"
          : "bg-secondary border border-border/50"
      }`}
      whileTap={{ scale: 0.95 }}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", damping: 15 }}
    >
      {/* Pulse ring when online */}
      {isOnDuty && (
        <motion.div
          className="absolute inset-0 rounded-full bg-accent/30"
          initial={{ scale: 1, opacity: 0.5 }}
          animate={{ scale: 1.5, opacity: 0 }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}

      <Power
        className={`h-8 w-8 ${
          isOnDuty ? "text-accent-foreground" : "text-muted-foreground"
        }`}
      />
    </motion.button>
  );
};

export const DriverStatusBadge = () => {
  const { isOnDuty, driverStatus } = useAppStore();

  const statusConfig = {
    online: { label: "En ligne", color: "bg-accent", textColor: "text-accent" },
    busy: { label: "En course", color: "bg-warning", textColor: "text-warning" },
    offline: { label: "Hors ligne", color: "bg-muted-foreground/50", textColor: "text-muted-foreground" },
  };

  const config = statusConfig[driverStatus];

  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <div className={`h-2.5 w-2.5 rounded-full ${config.color}`} />
        {isOnDuty && (
          <div className={`absolute inset-0 rounded-full ${config.color} animate-ping`} />
        )}
      </div>
      <span className={`text-sm font-medium ${config.textColor}`}>
        {config.label}
      </span>
    </div>
  );
};
