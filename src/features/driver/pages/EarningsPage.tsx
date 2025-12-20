import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp, Calendar, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export const EarningsPage = () => {
    return (
        <div className="p-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight">Mes Revenus</h1>
                <Button variant="outline" size="sm">
                    <Calendar className="mr-2 h-4 w-4" />
                    Cette semaine
                </Button>
            </div>

            {/* Résumé des Gains */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="bg-primary text-primary-foreground border-none shadow-lg">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-primary-foreground/80">Solde actuel</CardTitle>
                        <DollarSign className="h-4 w-4 text-primary-foreground/80" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">145.50 €</div>
                        <p className="text-xs text-primary-foreground/60 mt-1">Disponible pour virement</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Gains du jour</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">+ 45.50 €</div>
                        <p className="text-xs text-muted-foreground">+20.1% par rapport à hier</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Courses réalisées</CardTitle>
                        <div className="h-4 w-4 text-muted-foreground font-bold">#</div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">12</div>
                        <p className="text-xs text-muted-foreground">Objectif journalier: 15</p>
                    </CardContent>
                </Card>
            </div>

            {/* Liste des transactions récentes (Simulée) */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Dernières transactions</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {[1, 2, 3].map((_, i) => (
                            <div key={i} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center">
                                        <ArrowUpRight className="h-5 w-5 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-sm">Course #123{i}</p>
                                        <p className="text-xs text-muted-foreground">Aujourd'hui, 14:30</p>
                                    </div>
                                </div>
                                <span className="font-bold text-green-600">+ 15.20 €</span>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
