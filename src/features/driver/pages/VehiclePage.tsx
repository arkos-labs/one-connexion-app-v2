import { useAppStore } from "@/stores/useAppStore";
import {
    Car,
    ArrowLeft,
    Settings2,
    Shield,
    Fuel,
    Calendar,
    PenLine,
    CheckCircle2,
    AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";

export const VehiclePage = () => {
    const navigate = useNavigate();
    const { vehicle } = useAppStore();

    return (
        <div className="flex flex-col h-full bg-background/50 backdrop-blur-xl">
            {/* Header */}
            <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-md border-b border-border/10 p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate('/driver')}
                            className="rounded-full"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <h1 className="text-2xl font-bold tracking-tight">Mon Véhicule</h1>
                    </div>
                    <Button variant="outline" size="icon" className="rounded-full h-9 w-9 border-border/10">
                        <Settings2 className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <ScrollArea className="flex-1 px-4 py-6">
                <div className="max-w-3xl mx-auto space-y-8">

                    {/* Main Vehicle Display */}
                    <div className="relative pt-10 pb-6">
                        <div className="absolute top-0 right-0 -mr-10 opacity-5">
                            <Car className="h-64 w-64 rotate-12" />
                        </div>

                        <div className="relative text-center space-y-2">
                            <Badge variant="outline" className="rounded-full px-4 py-1 border-primary/20 bg-primary/5 text-primary">
                                Berline Premium
                            </Badge>
                            <h2 className="text-4xl font-black tracking-tighter">
                                {vehicle?.model || "Mercedes Classe E"}
                            </h2>
                            <p className="text-muted-foreground font-medium uppercase tracking-widest text-sm">
                                {vehicle?.color || "Noir Profond"}
                            </p>

                            <div className="mt-8 inline-block bg-background border-4 border-foreground/5 rounded-xl px-10 py-3 shadow-xl">
                                <span className="text-2xl font-mono font-black tracking-widest uppercase">
                                    {vehicle?.plate || "AA-123-BB"}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Specs Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <Card className="bg-card/40 border-border/10">
                            <CardContent className="p-4 flex items-center gap-3">
                                <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                                    <Shield className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase font-bold text-muted-foreground">Assurance</p>
                                    <p className="text-sm font-bold">À jour</p>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="bg-card/40 border-border/10">
                            <CardContent className="p-4 flex items-center gap-3">
                                <div className="h-10 w-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500">
                                    <Fuel className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase font-bold text-muted-foreground">Type</p>
                                    <p className="text-sm font-bold">Hybride</p>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="bg-card/40 border-border/10">
                            <CardContent className="p-4 flex items-center gap-3">
                                <div className="h-10 w-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500">
                                    <Calendar className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase font-bold text-muted-foreground">Mise en circ.</p>
                                    <p className="text-sm font-bold">2023</p>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="bg-card/40 border-border/10">
                            <CardContent className="p-4 flex items-center gap-3">
                                <div className="h-10 w-10 rounded-xl bg-green-500/10 flex items-center justify-center text-green-500">
                                    <CheckCircle2 className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase font-bold text-muted-foreground">Crit'Air</p>
                                    <p className="text-sm font-bold">Électrique</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Maintenance Section */}
                    <section className="space-y-4">
                        <div className="flex items-center justify-between px-2">
                            <h3 className="font-bold text-sm uppercase tracking-widest text-muted-foreground">Maintenance & État</h3>
                            <Button variant="link" size="sm" className="text-xs h-auto p-0">Historique</Button>
                        </div>

                        <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-3xl p-6 flex items-start gap-4">
                            <div className="h-12 w-12 rounded-2xl bg-yellow-500/10 flex items-center justify-center text-yellow-500">
                                <AlertTriangle className="h-6 w-6" />
                            </div>
                            <div className="flex-1">
                                <h4 className="font-bold text-sm">Révision conseillée</h4>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Votre prochaine révision est prévue dans environ 1 200 km. Pensez à prendre rendez-vous.
                                </p>
                                <Button variant="secondary" size="sm" className="mt-4 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-600 border-none font-bold rounded-lg text-xs">
                                    Prendre rendez-vous
                                </Button>
                            </div>
                        </div>
                    </section>

                    {/* Actions */}
                    <div className="pt-4 space-y-3">
                        <Button className="w-full h-14 rounded-2xl gap-3 font-bold text-base shadow-xl active:scale-95 transition-transform">
                            <PenLine className="h-5 w-5" />
                            Modifier les informations
                        </Button>
                        <p className="text-center text-[10px] text-muted-foreground px-10">
                            Toute modification majeure (plaque, modèle) nécessitera une nouvelle validation des documents par nos équipes.
                        </p>
                    </div>

                </div>
            </ScrollArea>
        </div>
    );
};
