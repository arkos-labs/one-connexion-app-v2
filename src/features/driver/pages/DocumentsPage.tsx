import { useAppStore } from "@/stores/useAppStore";
import {
    FileText,
    ArrowLeft,
    CheckCircle2,
    AlertCircle,
    Clock,
    Upload,
    AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

export const DocumentsPage = () => {
    const navigate = useNavigate();
    const { documents, updateDocumentStatus, driverStatus } = useAppStore();

    const handleUploadSimulation = (docId: string, docName: string) => {
        toast({
            title: "Envoi en cours...",
            description: `Chargement de "${docName}"`
        });

        setTimeout(() => {
            updateDocumentStatus(docId, 'pending');
            toast({
                title: "Document envoyé",
                description: "En attente de validation par l'admin",
                variant: "default"
            });
        }, 1500);
    };

    const getStatusConfig = (status: string) => {
        switch (status) {
            case 'verified':
                return {
                    icon: <CheckCircle2 className="h-5 w-5 text-emerald-400" />,
                    label: '✓ vérifié',
                    textColor: 'text-emerald-400',
                    borderColor: 'border-emerald-500/30',
                    bgGradient: 'from-emerald-900/20 to-slate-900/50',
                    action: false
                };
            case 'expired':
                return {
                    icon: <AlertCircle className="h-5 w-5 text-red-400" />,
                    label: '⚠ expiré',
                    textColor: 'text-red-400',
                    borderColor: 'border-red-500/30',
                    bgGradient: 'from-red-900/20 to-slate-900/50',
                    action: true
                };
            case 'pending':
                return {
                    icon: <Clock className="h-5 w-5 text-orange-400" />,
                    label: '⏳ en attente',
                    textColor: 'text-orange-400',
                    borderColor: 'border-orange-500/30',
                    bgGradient: 'from-orange-900/20 to-slate-900/50',
                    action: false
                };
            default:
                return {
                    icon: <AlertCircle className="h-5 w-5 text-slate-400" />,
                    label: 'manquant',
                    textColor: 'text-slate-400',
                    borderColor: 'border-slate-700/50',
                    bgGradient: 'from-slate-900/50 to-slate-900/50',
                    action: true
                };
        }
    };

    const allVerified = documents.every(d => d.status === 'verified');
    const hasExpired = documents.some(d => d.status === 'expired');

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
                        <h1 className="text-lg font-bold text-white">Mes Documents</h1>
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

                    {/* Alerte Action Requise */}
                    {!allVerified && (
                        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-yellow-900/40 via-orange-900/30 to-slate-900/50 border-2 border-yellow-500/30 p-5 shadow-xl">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center shadow-lg shadow-yellow-500/20 shrink-0">
                                    <AlertTriangle className="h-6 w-6 text-slate-900" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-white text-sm mb-1">Action requise</h3>
                                    <p className="text-xs text-slate-300">
                                        Certains pièces doivent être mises à jour ou sont en attente
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Label */}
                    <h3 className="font-bold text-xs uppercase tracking-widest text-slate-400 px-2">
                        LISTE DES PIÈCES
                    </h3>

                    {/* Liste des Documents */}
                    <div className="space-y-3">
                        {documents.map((doc) => {
                            const config = getStatusConfig(doc.status);
                            return (
                                <div
                                    key={doc.id}
                                    className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${config.bgGradient} border-2 ${config.borderColor} p-4 transition-all hover:scale-[1.02]`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3 flex-1">
                                            <div className={`h-10 w-10 rounded-full flex items-center justify-center ${doc.status === 'verified' ? 'bg-emerald-500/20' :
                                                    doc.status === 'expired' ? 'bg-red-500/20' :
                                                        doc.status === 'pending' ? 'bg-orange-500/20' :
                                                            'bg-slate-700/50'
                                                }`}>
                                                <FileText className={`h-5 w-5 ${doc.status === 'verified' ? 'text-emerald-400' :
                                                        doc.status === 'expired' ? 'text-red-400' :
                                                            doc.status === 'pending' ? 'text-orange-400' :
                                                                'text-slate-400'
                                                    }`} />
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-bold text-sm text-white">{doc.name}</p>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <span className={`text-xs font-semibold ${config.textColor}`}>
                                                        {config.label}
                                                    </span>
                                                    {doc.expiryDate && (
                                                        <>
                                                            <span className="text-slate-500">•</span>
                                                            <span className="text-xs text-slate-400">
                                                                Exp. le {doc.expiryDate}
                                                            </span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Bouton Upload pour documents expirés */}
                                        {config.action && (
                                            <Button
                                                size="sm"
                                                onClick={() => handleUploadSimulation(doc.id, doc.name)}
                                                className="h-9 px-4 rounded-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-slate-900 font-bold shadow-lg shadow-yellow-500/30"
                                            >
                                                <Upload className="h-4 w-4 mr-1" />
                                                Uploader
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                </div>
            </ScrollArea>
        </div>
    );
};
