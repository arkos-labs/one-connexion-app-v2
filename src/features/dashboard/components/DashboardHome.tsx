import { motion } from "framer-motion";
import { Truck, Users, MapPin, Activity, TrendingUp, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const stats = [
  {
    title: "Chauffeurs Actifs",
    value: "24",
    change: "+3",
    icon: Users,
    trend: "up",
  },
  {
    title: "Courses en cours",
    value: "12",
    change: "+5",
    icon: Truck,
    trend: "up",
  },
  {
    title: "Zones couvertes",
    value: "8",
    change: "0",
    icon: MapPin,
    trend: "neutral",
  },
  {
    title: "Temps moyen",
    value: "23min",
    change: "-2min",
    icon: Clock,
    trend: "up",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut" as const,
    },
  },
};

export const DashboardHome = () => {
  return (
    <div className="min-h-screen p-4 md:p-8">
      {/* Header */}
      <motion.header
        className="mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-2xl md:text-3xl font-bold">
          <span className="text-foreground">Tableau de bord</span>
        </h1>
        <p className="mt-1 text-muted-foreground">
          Vue d'ensemble en temps réel
        </p>
      </motion.header>

      {/* Stats Grid */}
      <motion.div
        className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {stats.map((stat, index) => (
          <motion.div key={stat.title} variants={itemVariants}>
            <Card className="glass border-border/30 hover:border-accent/30 transition-colors">
              <CardContent className="p-4 md:p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs md:text-sm text-muted-foreground mb-1">
                      {stat.title}
                    </p>
                    <p className="text-2xl md:text-3xl font-bold">{stat.value}</p>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                    <stat.icon className="h-5 w-5 text-accent" />
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-1">
                  {stat.trend === "up" && (
                    <TrendingUp className="h-3 w-3 text-accent" />
                  )}
                  <span
                    className={`text-xs ${
                      stat.trend === "up"
                        ? "text-accent"
                        : "text-muted-foreground"
                    }`}
                  >
                    {stat.change}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    vs hier
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        variants={itemVariants}
        initial="hidden"
        animate="visible"
        className="mb-8"
      >
        <Card className="glass border-border/30">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="h-5 w-5 text-accent" />
              Actions rapides
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button variant="secondary" className="gap-2">
              <Truck className="h-4 w-4" />
              Nouvelle course
            </Button>
            <Button variant="secondary" className="gap-2">
              <Users className="h-4 w-4" />
              Gérer chauffeurs
            </Button>
            <Button variant="secondary" className="gap-2">
              <MapPin className="h-4 w-4" />
              Vue carte
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* Live Activity Placeholder */}
      <motion.div
        variants={itemVariants}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.4 }}
      >
        <Card className="glass border-border/30">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <div className="relative">
                  <div className="status-online" />
                  <div className="absolute inset-0 rounded-full bg-accent/30 animate-ping" />
                </div>
                Activité en direct
              </CardTitle>
              <span className="text-xs text-muted-foreground">
                Mise à jour automatique
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
                <Activity className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">
                Connectez Lovable Cloud pour activer le temps réel
              </p>
              <Button variant="outline" className="mt-4 gap-2">
                Configurer le backend
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};
