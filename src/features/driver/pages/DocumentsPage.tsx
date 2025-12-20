import { useState, useRef } from "react";
import {
    FileText,
    CheckCircle2,
    AlertCircle,
    Clock,
    UploadCloud,
    ChevronRight,
    FileImage,
    X,
    Trash2
} from "lucide-react";
import { useAppStore } from "@/stores/useAppStore";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export const DocumentsPage = () => {
    const { documents, updateDocumentStatus } = useAppStore();

    // États locaux pour gérer l'upload
    const [selectedDoc, setSelectedDoc] = useState<string | null>(null);
    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [selectedFile, setSelectedFile] = useState<File | null>(null); // Added back for file selection feature

    // Référence pour simuler le clic sur l'input file caché
    const fileInputRef = useRef<HTMLInputElement>(null);

    // TRI INTELLIGENT : On sépare les urgences des documents valides
    // Filter out "Carte VTC" as requested previously
    const filteredDocs = documents.filter(d => d.name !== "Carte VTC");
    const actionRequiredDocs = filteredDocs.filter(d => ['expired', 'missing', 'rejected'].includes(d.status));
    const validDocs = filteredDocs.filter(d => ['verified', 'pending'].includes(d.status));

    // Ouvre la modale
    const handleOpenUpload = (docId: string) => {
        setSelectedDoc(docId);
        setUploadProgress(0); // Reset de la barre
        setSelectedFile(null); // Reset file
        setIsUploadOpen(true);
    };

    // Déclenché quand l'utilisateur choisit un fichier
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    // Logique de simulation d'upload (Barre de progression)
    const simulateUpload = () => {
        let progress = 0;
        // On incrémente la barre toutes les 100ms
        const interval = setInterval(() => {
            progress += 10;
            setUploadProgress(progress);

            if (progress >= 100) {
                clearInterval(interval);

                // Délai pour laisser voir le 100%
                setTimeout(() => {
                    if (selectedDoc) {
                        // ACTION CRITIQUE : Mise à jour du store
                        updateDocumentStatus(selectedDoc, 'pending');

                        toast({
                            title: "Document envoyé 📨",
                            description: `Fichier ${selectedFile?.name || 'reçu'} envoyé pour validation.`,
                        });

                        setIsUploadOpen(false); // Fermer la modale
                    }
                }, 500);
            }
        }, 150); // Vitesse de l'upload
    };

    const handleStartUpload = () => {
        if (!selectedFile) return;
        simulateUpload();
    }

    // Sous-composant pour afficher une ligne de document
    const DocumentCard = ({ doc }: { doc: any }) => {
        const isActionRequired = ['expired', 'missing', 'rejected'].includes(doc.status);

        // Config visuelle selon le statut
        const getStatusConfig = (status: string) => {
            switch (status) {
                case 'verified': return { icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-900/20', label: 'Validé' };
                case 'pending': return { icon: Clock, color: 'text-orange-600', bg: 'bg-orange-100 dark:bg-orange-900/20', label: 'En examen' };
                case 'expired': return { icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-100 dark:bg-red-900/20', label: 'Expiré' };
                case 'missing': return { icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-100 dark:bg-red-900/20', label: 'Manquant' };
                default: return { icon: FileText, color: 'text-gray-600', bg: 'bg-gray-100', label: 'Inconnu' };
            }
        };

        const config = getStatusConfig(doc.status);
        const Icon = config.icon;

        return (
            <div
                className={cn(
                    "flex items-center p-4 bg-card rounded-xl border transition-all hover:shadow-sm",
                    isActionRequired ? "border-red-200 dark:border-red-900/50 bg-red-50/10" : "border-border"
                )}
            >
                {/* Icône à gauche */}
                <div className={cn("h-12 w-12 rounded-full flex items-center justify-center shrink-0 mr-4", config.bg)}>
                    <Icon className={cn("h-6 w-6", config.color)} />
                </div>

                {/* Textes */}
                <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                        <h3 className="font-semibold text-sm truncate pr-2">{doc.name}</h3>
                        {isActionRequired && (
                            <Badge variant="destructive" className="text-[10px] h-5">Action requise</Badge>
                        )}
                    </div>

                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                        {/* Removed label span as per previous request */}
                        {doc.expiryDate && (
                            <span>Expire le {doc.expiryDate}</span>
                        )}
                        {/* Fallback if no expiry but needs status text? No, kept clean as requested */}
                    </p>
                </div>

                <div className="ml-4 shrink-0">
                    {isActionRequired ? (
                        <Button size="sm" onClick={() => handleOpenUpload(doc.id)}>
                            <UploadCloud className="h-4 w-4 mr-2 md:inline hidden" />
                            Mettre à jour
                        </Button>
                    ) : (
                        <Button variant="outline" size="sm" onClick={() => handleOpenUpload(doc.id)} className="text-muted-foreground">
                            <UploadCloud className="h-4 w-4 mr-2 md:inline hidden" />
                            Modifier
                        </Button>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-24">

            {/* --- Header --- */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Espace Documents</h1>
                    <p className="text-muted-foreground">Gérez vos justificatifs pour rester conforme.</p>
                </div>

                {/* Résumé global en haut à droite */}
                <Card className={cn(
                    "px-4 py-2 flex items-center gap-3 border-l-4 shadow-sm",
                    actionRequiredDocs.length > 0
                        ? "border-l-red-500 bg-red-50 dark:bg-red-900/10"
                        : "border-l-green-500 bg-green-50 dark:bg-green-900/10"
                )}>
                    <div className={cn(
                        "p-2 rounded-full",
                        actionRequiredDocs.length > 0 ? "bg-white/50 text-red-600" : "bg-white/50 text-green-600"
                    )}>
                        {actionRequiredDocs.length > 0 ? <AlertCircle className="h-5 w-5" /> : <CheckCircle2 className="h-5 w-5" />}
                    </div>
                    <div>
                        <p className={cn("font-bold text-sm", actionRequiredDocs.length > 0 ? "text-red-700" : "text-green-700")}>
                            {actionRequiredDocs.length > 0 ? "Dossier incomplet" : "Tout est en ordre"}
                        </p>
                        <p className="text-xs opacity-80">
                            {actionRequiredDocs.length > 0
                                ? `${actionRequiredDocs.length} document(s) à traiter`
                                : "Vous pouvez rouler sereinement"}
                        </p>
                    </div>
                </Card>
            </div>

            {/* --- Section 1 : Urgences --- */}
            {actionRequiredDocs.length > 0 && (
                <div className="space-y-3">
                    <h2 className="text-sm font-bold text-red-600 uppercase tracking-wider flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" /> À traiter en priorité
                    </h2>
                    <div className="grid gap-3">
                        {actionRequiredDocs.map(doc => <DocumentCard key={doc.id} doc={doc} />)}
                    </div>
                </div>
            )}

            {/* --- Section 2 : Documents OK --- */}
            <div className="space-y-3">
                <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Documents Valides</h2>
                <div className="grid gap-3">
                    {validDocs.map(doc => <DocumentCard key={doc.id} doc={doc} />)}

                    {validDocs.length === 0 && actionRequiredDocs.length === 0 && (
                        <div className="text-center py-10 text-muted-foreground border-2 border-dashed rounded-xl">
                            <FileText className="h-10 w-10 mx-auto mb-2 opacity-20" />
                            <p>Aucun document trouvé.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* --- MODALE D'UPLOAD --- */}
            <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Mise à jour du document</DialogTitle>
                        <DialogDescription>
                            Prenez une photo claire ou importez un PDF.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        {uploadProgress === 0 ? (
                            selectedFile ? (
                                // File Selected View
                                <div className="border border-border rounded-xl p-4 bg-secondary/20">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                                                <FileText className="h-5 w-5" />
                                            </div>
                                            <div className="overflow-hidden">
                                                <p className="text-sm font-medium truncate max-w-[200px]">{selectedFile.name}</p>
                                                <p className="text-xs text-muted-foreground">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                                            </div>
                                        </div>
                                        <Button variant="ghost" size="icon" onClick={() => setSelectedFile(null)} className="text-muted-foreground hover:text-destructive">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <Button className="w-full" onClick={handleStartUpload}>
                                        <UploadCloud className="mr-2 h-4 w-4" />
                                        Envoyer le document
                                    </Button>
                                </div>
                            ) : (
                                // ZONE CLICK & DROP
                                <div
                                    className="border-2 border-dashed border-muted-foreground/25 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-secondary/50 transition-colors group"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    {/* Input caché */}
                                    <input
                                        type="file"
                                        className="hidden"
                                        ref={fileInputRef}
                                        accept="image/*,.pdf"
                                        onChange={handleFileChange}
                                    />
                                    <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mb-3 text-primary group-hover:scale-110 transition-transform">
                                        <UploadCloud className="h-6 w-6" />
                                    </div>
                                    <p className="font-semibold text-sm">Cliquez pour importer</p>
                                    <p className="text-xs text-muted-foreground mt-1">JPG, PNG ou PDF (Max 5Mo)</p>
                                </div>
                            )) : (
                            // BARRE DE PROGRESSION
                            <div className="space-y-4 py-6">
                                <div className="flex items-center justify-between text-sm mb-1">
                                    <span className="flex items-center gap-2">
                                        <FileImage className="h-4 w-4 text-primary" />
                                        Envoi en cours...
                                    </span>
                                    <span className="font-bold">{uploadProgress}%</span>
                                </div>
                                <Progress value={uploadProgress} className="h-2" />
                                <p className="text-xs text-muted-foreground text-center animate-pulse">
                                    Vérification de la lisibilité...
                                </p>
                            </div>
                        )}
                    </div>

                    <DialogFooter className="sm:justify-start">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => setIsUploadOpen(false)}
                            disabled={uploadProgress > 0 && uploadProgress < 100}
                        >
                            Annuler
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};
