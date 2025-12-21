import { useAppStore } from "@/stores/useAppStore";
import {
    FileText,
    ArrowLeft,
    CheckCircle2,
    AlertCircle,
    Clock,
    Upload,
    Plus,
    ShieldCheck,
    ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

export const DocumentsPage = () => {
    const navigate = useNavigate();
    const { documents, updateDocumentStatus } = useAppStore();

    const handleUploadSimulation = (docId: string, docName: string) => {
        toast({
            title: "Envoi en cours...",
            description: `Chargement de "${docName}"`
        });

        // Simulation d'un délai d'upload
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
                    icon: <CheckCircle2 className="h-5 w-5 text-green-500" />,
                    label: 'Vérifié',
                    color: 'bg-green-500/10 text-green-500',
                    action: false
                };
            case 'expired':
                return {
                    icon: <AlertCircle className="h-5 w-5 text-red-500" />,
                    label: 'Expiré',
                    color: 'bg-red-500/10 text-red-500',
                    action: true
                };
            case 'pending':
                return {
                    icon: <Clock className="h-5 w-5 text-orange-500" />,
                    label: 'En attente',
                    color: 'bg-orange-500/10 text-orange-500',
                    action: false
                };
            default:
                return {
                    icon: <AlertCircle className="h-5 w-5 text-muted-foreground" />,
                    label: 'Manquant',
                    color: 'bg-secondary text-muted-foreground',
                    action: true
                };
        }
    };

    const allVerified = documents.every(d => d.status === 'verified');

    return (
        <div className="flex flex-col h-full bg-background/50 backdrop-blur-xl">
            {/* Header */}
            <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-md border-b border-border/10 p-4">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate('/driver')}
                        className="rounded-full"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <h1 className="text-2xl font-bold tracking-tight">Documents</h1>
                </div>
            </div>

            <ScrollArea className="flex-1 px-4 py-6">
                <div className="max-w-3xl mx-auto space-y-6">

                    {/* Status Header */}
                    <div className={`p-6 rounded-3xl border flex items-center gap-4 transition-all duration-500 ${allVerified ? 'bg-green-500/5 border-green-500/20' : 'bg-orange-500/5 border-orange-500/20'
                        }`}>
                        <div className={`h-16 w-16 rounded-2xl flex items-center justify-center transition-transform hover:scale-110 ${allVerified ? 'bg-green-500/20 text-green-500' : 'bg-orange-500/20 text-orange-500'
                            }`}>
                            <ShieldCheck className="h-8 w-8" />
                        </div>
                        <div className="flex-1">
                            <h2 className="text-lg font-bold">
                                {allVerified ? 'Compte Vérifié' : 'Action requise'}
                            </h2>
                            <p className="text-sm text-muted-foreground">
                                {allVerified
                                    ? 'Tous vos documents sont à jour. Vous pouvez rouler sereinement.'
                                    : 'Certains documents ont besoin de votre attention.'}
                            </p>
                        </div>
                        {allVerified && (
                            <Badge className="bg-green-500 animate-pulse">ACTIF</Badge>
                        )}
                    </div>

                    <div className="space-y-4 pt-4">
                        <h3 className="font-bold text-sm uppercase tracking-widest text-muted-foreground px-2">Liste des pièces</h3>

                        <div className="grid gap-3">
                            {documents.map((doc) => {
                                const config = getStatusConfig(doc.status);
                                return (
                                    <div
                                        key={doc.id}
                                        className="group bg-card/30 hover:bg-card/50 border border-border/10 rounded-2xl p-4 flex items-center justify-between transition-all"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="h-12 w-12 rounded-xl bg-background border border-border/50 flex items-center justify-center">
                                                <FileText className="h-6 w-6 text-muted-foreground/50 group-hover:text-primary transition-colors" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-sm">{doc.name}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <Badge variant="secondary" className={`${config.color} border-none text-[10px] py-0 px-1.5 font-bold uppercase`}>
                                                        {config.label}
                                                    </Badge>
                                                    {doc.expiryDate && (
                                                        <span className="text-[10px] text-muted-foreground">
                                                            Exp. le {doc.expiryDate}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            {config.icon}
                                            {config.action ? (
                                                <Button
                                                    size="icon"
                                                    variant="secondary"
                                                    className="h-8 w-8 rounded-full"
                                                    onClick={() => handleUploadSimulation(doc.id, doc.name)}
                                                >
                                                    <Upload className="h-4 w-4" />
                                                </Button>
                                            ) : (
                                                <ChevronRight className="h-4 w-4 text-muted-foreground/30" />
                                            )}
                                        </div>
                                    </div>
                                );
                            })}

                            <Button
                                variant="outline"
                                className="w-full border-dashed border-2 h-14 rounded-2xl gap-2 hover:bg-secondary/50 text-muted-foreground"
                            >
                                <Plus className="h-4 w-4" />
                                Ajouter un autre document
                            </Button>
                        </div>
                    </div>

                    {/* Tips Section */}
                    <div className="bg-secondary/20 p-6 rounded-3xl space-y-3">
                        <h4 className="font-bold text-xs uppercase tracking-widest text-muted-foreground">💡 Conseils pour la validation</h4>
                        <ul className="text-xs text-muted-foreground space-y-2 list-disc pl-4">
                            <li>Assurez-vous que l'image est nette et bien éclairée.</li>
                            <li>Toutes les informations doivent être lisibles.</li>
                            <li>Le document ne doit pas être rogné (les 4 coins visibles).</li>
                            <li>La validation prend généralement moins de 24h.</li>
                        </ul>
                    </div>

                </div>
            </ScrollArea>
        </div>
    );
};
