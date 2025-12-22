import { useMemo } from "react";
import { useAppStore } from "@/stores/useAppStore";
import {
    TrendingUp,
    ArrowLeft,
    Wallet,
    Calendar,
    ArrowUpRight,
    Download,
    Info
} from "lucide-react";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import { toast } from "sonner";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";



export const EarningsPage = () => {
    const navigate = useNavigate();
    const { earningsInCents, history: rawHistory } = useAppStore();
    const history = rawHistory || [];

    const formatPrice = (cents: number) => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'EUR',
        }).format(cents / 100);
    };

    const chartData = useMemo(() => {
        const days = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
        const orderedDays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
        const dataMap = new Map(orderedDays.map(d => [d, 0]));

        history.forEach(ride => {
            const date = new Date(ride.createdAt);
            const dayName = days[date.getDay()];
            if (dataMap.has(dayName)) {
                dataMap.set(dayName, dataMap.get(dayName)! + (ride.priceInCents / 100));
            }
        });

        return orderedDays.map(name => ({ name, total: dataMap.get(name) || 0 }));
    }, [history]);

    const weeklyTotal = chartData.reduce((acc, curr) => acc + curr.total, 0) * 100;

    const handleExport = () => {
        try {
            const doc = new jsPDF();

            // Header
            doc.setFontSize(20);
            doc.text("Relevé de Gains - One Connexion", 14, 22);

            doc.setFontSize(11);
            doc.setTextColor(100);
            doc.text(`Date d'export : ${new Date().toLocaleDateString('fr-FR')}`, 14, 30);
            doc.text(`Solde disponible : ${formatPrice(earningsInCents)}`, 14, 36);

            // Table
            const tableColumn = ["Date", "ID Course", "Montant", "Statut"];
            const tableRows = history.map(ride => [
                new Date(ride.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }) + ' ' + new Date(ride.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
                "#" + ride.id.slice(0, 8),
                formatPrice(ride.priceInCents),
                "Terminée"
            ]);

            autoTable(doc, {
                head: [tableColumn],
                body: tableRows,
                startY: 45,
                theme: 'grid',
                styles: { fontSize: 10, cellPadding: 3 },
                headStyles: { fillColor: [22, 163, 74] } // Green color
            });

            doc.save(`releve-gains-${new Date().toISOString().split('T')[0]}.pdf`);
            toast.success("Export téléchargé avec succès !");
        } catch (error) {
            console.error(error);
            toast.error("Erreur lors de la génération du PDF");
        }
    };

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
                        <h1 className="text-2xl font-bold tracking-tight">Mes Revenus</h1>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        className="rounded-full gap-2 border-border/10"
                        onClick={handleExport}
                    >
                        <Download className="h-4 w-4" />
                        Exporter
                    </Button>
                </div>
            </div>

            <ScrollArea className="flex-1 px-4 py-6">
                <div className="max-w-4xl mx-auto space-y-6">

                    {/* Main Balance Card */}
                    <Card className="relative overflow-hidden border-none bg-gradient-to-br from-primary/95 to-primary shadow-2xl text-primary-foreground">
                        <div className="absolute top-0 right-0 p-8 opacity-10">
                            <Wallet className="h-32 w-32" />
                        </div>
                        <CardHeader className="pb-2">
                            <p className="text-sm font-medium opacity-80 uppercase tracking-widest">Solde disponible</p>
                            <CardTitle className="text-4xl font-black">
                                {formatPrice(earningsInCents)}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-2 mt-2">
                                <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30 border-none">
                                    Prochain virement : Lundi
                                </Badge>
                            </div>
                            <Button className="w-full mt-6 bg-white text-primary hover:bg-white/90 font-bold rounded-xl h-12 shadow-lg">
                                Demander un virement express
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <Card className="bg-card/40 border-border/10">
                            <CardContent className="p-4">
                                <p className="text-xs text-muted-foreground font-bold uppercase mb-1">Cette semaine</p>
                                <div className="flex items-end justify-between">
                                    <span className="text-xl font-bold">{formatPrice(weeklyTotal)}</span>
                                    <span className="text-xs text-green-500 font-bold flex items-center gap-1">
                                        +12% <TrendingUp className="h-3 w-3" />
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="bg-card/40 border-border/10">
                            <CardContent className="p-4">
                                <p className="text-xs text-muted-foreground font-bold uppercase mb-1">Courses</p>
                                <div className="flex items-end justify-between">
                                    <span className="text-xl font-bold">{history.length}</span>
                                    <span className="text-xs text-muted-foreground font-medium">7 derniers jours</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Chart Section */}
                    <Card className="bg-card/40 border-border/10">
                        <CardHeader className="flex flex-row items-center justify-between pb-8">
                            <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                <Calendar className="h-4 w-4" /> Activité Hebdomadaire
                            </CardTitle>
                            <Info className="h-4 w-4 text-muted-foreground/50" />
                        </CardHeader>
                        <CardContent>
                            <div className="h-[250px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.3} />
                                        <XAxis
                                            dataKey="name"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                                        />
                                        <YAxis
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                                        />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: 'hsl(var(--background))',
                                                borderColor: 'hsl(var(--border))',
                                                borderRadius: '12px',
                                                fontSize: '12px'
                                            }}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="total"
                                            stroke="hsl(var(--primary))"
                                            strokeWidth={3}
                                            fillOpacity={1}
                                            fill="url(#colorTotal)"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Recent List Placeholder */}
                    <div className="space-y-4">
                        <h3 className="font-bold text-sm uppercase tracking-widest text-muted-foreground px-2">Dernières transactions</h3>
                        <div className="space-y-2">
                            <div className="space-y-2">
                                {history.length === 0 ? (
                                    <p className="text-center text-muted-foreground p-4">Aucune transaction récente</p>
                                ) : (
                                    history.slice(0, 5).map((ride, i) => (
                                        <div key={ride.id} className="flex items-center justify-between p-4 bg-card/20 rounded-2xl border border-border/5">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center">
                                                    <ArrowUpRight className="h-5 w-5 text-green-500" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-sm">Course #{ride.id.slice(0, 6)}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        Terminée • {new Date(ride.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                                                    </p>
                                                </div>
                                            </div>
                                            <span className="font-bold text-sm text-green-500">
                                                {formatPrice(ride.priceInCents)}
                                            </span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                </div>
            </ScrollArea>
        </div>
    );
};
