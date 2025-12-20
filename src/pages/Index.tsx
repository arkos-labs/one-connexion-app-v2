import { motion } from "framer-motion";
import { Truck, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MainLayout } from "@/components/layout/MainLayout";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <MainLayout>
      <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
        {/* Logo */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="relative flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-accent shadow-glow">
            <Truck className="h-12 w-12 text-accent-foreground" strokeWidth={1.5} />
          </div>
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h1 className="text-4xl font-bold tracking-tight mb-2">
            <span className="text-foreground">One</span>
            <span className="text-gradient ml-2">Connexion</span>
          </h1>
          <p className="text-muted-foreground max-w-sm mx-auto">
            Plateforme de transport premium pour chauffeurs professionnels
          </p>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-10"
        >
          <Button asChild size="lg" className="gap-2 px-8 bg-accent hover:bg-accent/90 text-accent-foreground">
            <Link to="/driver">
              Accéder à l'app chauffeur
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </motion.div>

        {/* Version */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-16 text-xs text-muted-foreground/50"
        >
          v2.0.0 • Premium Edition
        </motion.p>
      </div>
    </MainLayout>
  );
};

export default Index;
