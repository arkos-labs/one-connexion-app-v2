import { useAppStore } from "@/stores/useAppStore";
import {
    ArrowLeft,
    Shield,
    Fuel,
    Calendar,
    FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNavigate } from "react-router-dom";

export const VehiclePage = () => {
    const navigate = useNavigate();
    const { vehicle, driverStatus } = useAppStore();

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
                        <h1 className="text-lg font-bold text-white">Mon Véhicule</h1>
                    </div>
                    {/* Badge HORS LIGNE */}
                    <div className={`text-xs font-bold px-4 py-2 rounded-full flex items-center gap-2 ${driverStatus === 'online'
                            ? 'bg-gradient-to-r from-emerald-400 to-emerald-500 text-slate-900'
                            : 'bg-slate-800/50 text-slate-400'
                        }`}>
                        <div className="h-2 w-2 rounded-full bg-slate-900 animate-pulse"></div>
                        {driverStatus === 'online' ? 'EN LIGNE' : 'HORS LIGNE'}
                    </div>
                </div>
            </div>

            <ScrollArea className="flex-1 px-6">
                <div className="space-y-6 pt-6 pb-24">

                    {/* Card Principale - Véhicule */}
                    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-2 border-slate-700/50 p-6 shadow-2xl">

                        {/* Badge Véhicule Approuvé */}
                        <div className="flex justify-center mb-4">
                            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider bg-gradient-to-r from-yellow-400 to-yellow-500 px-4 py-1.5 rounded-full shadow-lg shadow-yellow-500/30">
                                Véhicule Approuvé
                            </span>
                        </div>

                        {/* Modèle */}
                        <h2 className="text-center text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-500 mb-2">
                            {vehicle?.model || "Toyota Prius"}
                        </h2>
                        <p className="text-center text-sm text-slate-400 mb-6">
                            {vehicle?.color || "Noir Métallisé"}
                        </p>

                        {/* Plaque d'Immatriculation */}
                        <div className="flex justify-center">
                            <div className="bg-slate-900 border-4 border-yellow-500/50 rounded-2xl px-8 py-4 shadow-xl shadow-yellow-500/20">
                                <span className="text-2xl font-mono font-black tracking-widest text-yellow-400 uppercase">
                                    {vehicle?.plate || "AB - 123 - CD"}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Grid d'Informations (2x2) */}
                    <div className="grid grid-cols-2 gap-4">
                        {/* ASSURANCE */}
                        <div className="bg-slate-900/50 backdrop-blur-sm border-2 border-yellow-500/30 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 hover:border-yellow-500/50 transition-colors">
                            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center shadow-lg shadow-yellow-500/20">
                                <Shield className="h-6 w-6 text-slate-900" />
                            </div>
                            <p className="text-[10px] uppercase font-bold text-yellow-400 tracking-wider">ASSURANCE</p>
                            <p className="text-sm font-bold text-white">À jour</p>
                        </div>

                        {/* TYPE */}
                        <div className="bg-slate-900/50 backdrop-blur-sm border-2 border-yellow-500/30 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 hover:border-yellow-500/50 transition-colors">
                            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center shadow-lg shadow-yellow-500/20">
                                <Fuel className="h-6 w-6 text-slate-900" />
                            </div>
                            <p className="text-[10px] uppercase font-bold text-yellow-400 tracking-wider">TYPE</p>
                            <p className="text-sm font-bold text-white">Hybride</p>
                        </div>

                        {/* MISE EN CIRC. */}
                        <div className="bg-slate-900/50 backdrop-blur-sm border-2 border-yellow-500/30 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 hover:border-yellow-500/50 transition-colors">
                            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center shadow-lg shadow-yellow-500/20">
                                <Calendar className="h-6 w-6 text-slate-900" />
                            </div>
                            <p className="text-[10px] uppercase font-bold text-yellow-400 tracking-wider">MISE EN CIRC.</p>
                            <p className="text-sm font-bold text-white">2023</p>
                        </div>

                        {/* CARTE GRISE */}
                        <div className="bg-slate-900/50 backdrop-blur-sm border-2 border-yellow-500/30 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 hover:border-yellow-500/50 transition-colors">
                            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center shadow-lg shadow-yellow-500/20">
                                <FileText className="h-6 w-6 text-slate-900" />
                            </div>
                            <p className="text-[10px] uppercase font-bold text-yellow-400 tracking-wider">CARTE GRISE</p>
                            <p className="text-sm font-bold text-white">Électrique</p>
                        </div>
                    </div>

                </div>
            </ScrollArea>
        </div>
    );
};
