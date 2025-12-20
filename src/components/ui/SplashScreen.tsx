import { motion } from "framer-motion";
import { Truck } from "lucide-react";

interface SplashScreenProps {
  onComplete?: () => void;
}

export const SplashScreen = ({ onComplete }: SplashScreenProps) => {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background"
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      onAnimationComplete={onComplete}
    >
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-radial from-accent/10 via-transparent to-transparent" />
      
      {/* Logo Animation */}
      <motion.div
        className="relative"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Pulse Ring */}
        <motion.div
          className="absolute inset-0 rounded-full bg-accent/20"
          initial={{ scale: 1, opacity: 0.5 }}
          animate={{ scale: 2, opacity: 0 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
        />
        
        {/* Logo Container */}
        <div className="relative flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-accent shadow-glow">
          <Truck className="h-12 w-12 text-accent-foreground" strokeWidth={1.5} />
        </div>
      </motion.div>

      {/* Brand Name */}
      <motion.div
        className="mt-8 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <h1 className="text-3xl font-bold tracking-tight">
          <span className="text-foreground">One</span>
          <span className="text-gradient ml-1">Connexion</span>
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Plateforme de transport premium
        </p>
      </motion.div>

      {/* Loading Indicator */}
      <motion.div
        className="mt-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <div className="flex items-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="h-2 w-2 rounded-full bg-accent"
              initial={{ opacity: 0.3 }}
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            />
          ))}
        </div>
      </motion.div>

      {/* Version Tag */}
      <motion.p
        className="absolute bottom-8 text-xs text-muted-foreground/50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        v2.0.0 • Premium Edition
      </motion.p>
    </motion.div>
  );
};
