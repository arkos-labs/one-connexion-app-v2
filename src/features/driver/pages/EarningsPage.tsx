import { useMemo } from "react";
import { useAppStore } from "@/stores/useAppStore";
import {
    ArrowLeft,
    Download,
    Wallet
} from "lucide-react";
import { toast } from "sonner";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNavigate } from "react-router-dom";

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
                const netEarnings = (ride.priceInCents * 0.4) / 100;
                dataMap.set(dayName, dataMap.get(dayName)! + netEarnings);
            }
        });

        return orderedDays.map(name => ({ name, total: dataMap.get(name) || 0 }));
    }, [history]);

    const weeklyTotal = chartData.reduce((acc, curr) => acc + curr.total, 0) * 100;
    const maxValue = Math.max(...chartData.map(d => d.total));

    const handleExport = () => {
        try {
            const doc = new jsPDF();

            doc.setFontSize(20);
            doc.text("Relevé de Gains - One Connexion", 14, 22);

            doc.setFontSize(11);
            doc.setTextColor(100);
            doc.text(`Date d'export : ${new Date().toLocaleDateString('fr-FR')}`, 14, 30);
            doc.text(`Solde disponible : ${formatPrice(earningsInCents)}`, 14, 36);

            const tableColumn = ["Date", "ID Course", "Montant", "Statut"];
            const tableRows = history.map(ride => [
                new Date(ride.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }) + ' ' + new Date(ride.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
                "#" + ride.id.slice(0, 8),
                formatPrice((ride.priceInCents * 0.4)),
                "Terminée"
            ]);

            autoTable(doc, {
                head: [tableColumn],
                body: tableRows,
                startY: 45,
                theme: 'grid',
                styles: { fontSize: 10, cellPadding: 3 },
                headStyles: { fillColor: [234, 179, 8] }
            });

            doc.save(`releve-gains-${new Date().toISOString().split('T')[0]}.pdf`);
            toast.success("Export téléchargé avec succès !");
        } catch (error) {
            console.error(error);
            toast.error("Erreur lors de la génération du PDF");
        }
    };

    return (
        <div className="flex flex-col h-full bg-slate-950">
            {/* Header */}
            <div className="sticky top-0 z-30 px-6 pt-8 pb-4 bg-slate-950/95 backdrop-blur-xl border-b border-slate-800/50">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate('/driver')}
                            className="rounded-xl hover:bg-slate-800"
                        >
                            <ArrowLeft className="h-5 w-5 text-white" />
                        </Button>
                        <h1 className="text-lg font-bold text-white">Mes Revenus</h1>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        className="rounded-full gap-2 bg-slate-800/50 border-slate-700/50 text-white hover:bg-slate-700"
                        onClick={handleExport}
                    >
                        <Download className="h-4 w-4" />
                        Exporter
                    </Button>
                </div>
            </div>

            <ScrollArea className="flex-1 px-6">
                <div className="space-y-6 pt-6 pb-24">

                    {/* Card Principale - Revenus du Mois */}
                    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-2 border-slate-700/50 p-6 shadow-2xl">
                        {/* Icône Wallet en arrière-plan */}
                        <div className="absolute top-4 right-4 opacity-10">
                            <Wallet className="h-32 w-32 text-yellow-500" />
                        </div>

                        <div className="relative z-10">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Revenus du mois</p>
                            <h2 className="text-5xl font-black text-white mb-6">
                                {formatPrice(earningsInCents)}
                            </h2>

                            {/* Bouton CTA */}
                            <Button className="w-full h-14 text-base font-bold rounded-2xl bg-gradient-to-r from-yellow-500 via-yellow-600 to-yellow-500 hover:from-yellow-400 hover:via-yellow-500 hover:to-yellow-400 text-slate-900 shadow-lg shadow-yellow-500/30 transition-all hover:scale-[1.02] active:scale-[0.98]">
                                Demander un virement express
                            </Button>
                        </div>
                    </div>

                    {/* Stats Rapides */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-900/50 backdrop-blur-sm border-2 border-slate-800/50 rounded-2xl p-4">
                            <p className="text-xs text-slate-400 font-bold uppercase mb-2">Revenus disponibles</p>
                            <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-500">
                                {formatPrice(earningsInCents)}
                            </span>
                        </div>
                        <div className="bg-slate-900/50 backdrop-blur-sm border-2 border-slate-800/50 rounded-2xl p-4">
                            <p className="text-xs text-slate-400 font-bold uppercase mb-2">Courses réalisées</p>
                            <span className="text-2xl font-black text-white">
                                {history.length}
                            </span>
                        </div>
                    </div>

                    {/* Graphique en Barres */}
                    <div className="bg-slate-900/50 backdrop-blur-sm border-2 border-slate-800/50 rounded-3xl p-6">
                        <div className="h-48 flex items-end justify-between gap-2">
                            {chartData.map((day, idx) => {
                                const heightPercent = maxValue > 0 ? (day.total / maxValue) * 100 : 0;
                                return (
                                    <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                                        <div className="w-full flex items-end justify-center" style={{ height: '160px' }}>
                                            <div
                                                className="w-full bg-gradient-to-t from-yellow-500 to-yellow-400 rounded-t-lg transition-all hover:from-yellow-400 hover:to-yellow-300"
                                                style={{ height: `${heightPercent}%`, minHeight: day.total > 0 ? '8px' : '0px' }}
                                            ></div>
                                        </div>
                                        <span className="text-xs font-semibold text-slate-400">{day.name}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Label */}
                    <h3 className="font-bold text-xs uppercase tracking-widest text-slate-400 px-2">
                        VERSEMENTS DE COURSES RÉCENTES
                    </h3>

                    {/* Liste de Courses */}
                    <div className="space-y-3">
                        {history.length === 0 ? (
                            <p className="text-center text-slate-400 p-4">Aucune transaction récente</p>
                        ) : (
                            history.slice(0, 5).map((ride, i) => (
                                <div key={ride.id} className="flex items-center justify-between p-4 bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 rounded-2xl hover:bg-slate-800/50 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center shadow-lg shadow-yellow-500/20">
                                            <Wallet className="h-5 w-5 text-slate-900" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm text-white">Course #{ride.id.slice(0, 3)} - {new Date(ride.createdAt).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric' })}</p>
                                            <p className="text-xs text-slate-400">
                                                Terminée
                                            </p>
                                        </div>
                                    </div>
                                    <span className="font-bold text-lg text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-500">
                                        {formatPrice(ride.priceInCents * 0.4)}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>

                </div>
            </ScrollArea>
        </div>
    );
};
