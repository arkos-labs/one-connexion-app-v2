import { CarFront, Zap, Droplets, Info } from "lucide-react";
import { useAppStore } from "@/stores/useAppStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const VehiclePage = () => {
    const { vehicle } = useAppStore();

    if (!vehicle) return <div className="p-8 text-center">Aucun véhicule assigné</div>;

    return (
        <div className="p-6 max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h1 className="text-2xl font-bold mb-6">Mon Véhicule</h1>

            <Card className="overflow-hidden border-2 border-primary/10">
                <div className="h-40 bg-gradient-to-r from-secondary to-secondary/30 flex items-center justify-center relative">
                    <CarFront className="h-24 w-24 text-muted-foreground/40" />
                    <Badge className="absolute top-4 right-4 text-xs" variant="secondary">Actif</Badge>
                </div>

                <CardHeader>
                    <CardTitle className="text-2xl">{vehicle.model}</CardTitle>
                    <p className="text-muted-foreground">Berline Confort • {vehicle.color}</p>
                </CardHeader>

                <CardContent className="grid gap-6">
                    {/* Plaque d'immatriculation style réaliste */}
                    <div className="bg-white border-2 border-black rounded px-2 py-1 w-fit mx-auto shadow-sm flex items-center gap-2">
                        <div className="bg-blue-700 h-8 w-4 rounded-sm flex flex-col items-center justify-center">
                            <span className="text-[6px] text-white font-bold">F</span>
                        </div>
                        <span className="text-xl font-mono font-black tracking-widest text-black">
                            {vehicle.plate.replace(/-/g, ' ')}
                        </span>
                        <div className="bg-blue-700 h-8 w-4 rounded-sm"></div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-4">
                        <div className="bg-secondary/30 p-4 rounded-xl flex flex-col items-center text-center">
                            <Zap className="h-6 w-6 text-yellow-500 mb-2" />
                            <span className="text-xs text-muted-foreground uppercase font-bold">Catégorie</span>
                            <span className="font-medium">Électrique / Hybride</span>
                        </div>
                        <div className="bg-secondary/30 p-4 rounded-xl flex flex-col items-center text-center">
                            <Droplets className="h-6 w-6 text-blue-500 mb-2" />
                            <span className="text-xs text-muted-foreground uppercase font-bold">Entretien</span>
                            <span className="font-medium">À jour</span>
                        </div>
                    </div>

                    <div className="flex items-start gap-3 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg text-sm text-blue-700 dark:text-blue-300">
                        <Info className="h-5 w-5 shrink-0 mt-0.5" />
                        <p>Pour changer de véhicule, veuillez contacter le support ou soumettre une nouvelle carte grise dans l'onglet Documents.</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
