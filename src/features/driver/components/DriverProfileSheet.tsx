import { useState } from "react";
import { X, Car, FileText, Settings, ChevronRight, AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAppStore } from "@/stores/useAppStore";
import { toast } from "@/hooks/use-toast";

interface DriverProfileSheetProps {
    isOpen: boolean;
    onClose: () => void;
}

export const DriverProfileSheet = ({ isOpen, onClose }: DriverProfileSheetProps) => {
    const {
        user,
        vehicle,
        documents,
        preferences,
        updatePreference,
        updateDocumentStatus,
        logout,
        currentOrder
    } = useAppStore();

    if (!isOpen) return null;

    const handleUploadSimulation = (docId: string) => {
        toast({ title: "Envoi du document...", description: "Analyse en cours" });
        // Simulation d'un délai d'upload et de validation API
        setTimeout(() => {
            updateDocumentStatus(docId, 'pending');
            toast({ title: "Document envoyé", description: "En attente de validation par l'admin" });
        }, 1500);
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'verified': return <CheckCircle2 className="h-5 w-5 text-green-500" />;
            case 'expired': return <AlertCircle className="h-5 w-5 text-red-500" />;
            case 'pending': return <Clock className="h-5 w-5 text-orange-500" />;
            default: return <AlertCircle className="h-5 w-5 text-muted-foreground" />;
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex justify-end">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

            {/* Panel */}
            <div className="relative w-full max-w-md bg-background h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">

                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b">
                    <h2 className="text-lg font-bold">Mon Espace</h2>
                    <Button variant="ghost" size="icon" onClick={onClose}>
                        <X className="h-5 w-5" />
                    </Button>
                </div>

                <ScrollArea className="flex-1 p-4">
                    <div className="space-y-6 pb-10">

                        {/* Profil */}
                        <div className="flex items-center gap-4">
                            <div className="h-16 w-16 rounded-full bg-secondary flex items-center justify-center text-xl font-bold text-muted-foreground">
                                {user?.fullName?.charAt(0) || "C"}
                            </div>
                            <div>
                                <p className="font-bold text-lg">{user?.fullName || "Chauffeur"}</p>
                                <p className="text-sm text-muted-foreground">{user?.email}</p>
                                <div className="mt-1 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-accent/10 text-accent">
                                    4.9 ★ Excellent
                                </div>
                            </div>
                        </div>

                        {/* Véhicule */}
                        <section>
                            <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider flex items-center gap-2">
                                <Car className="h-4 w-4" /> Véhicule Actif
                            </h3>
                            <div className="bg-secondary/30 rounded-xl p-4 border border-border/50">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-bold text-lg">{vehicle?.model}</p>
                                        <p className="text-sm text-muted-foreground">{vehicle?.color}</p>
                                    </div>
                                    <div className="bg-background px-2 py-1 rounded border text-sm font-mono font-bold">
                                        {vehicle?.plate}
                                    </div>
                                </div>
                                <Button
                                    variant="link"
                                    className="px-0 pt-2 h-auto text-xs text-primary"
                                    onClick={() => window.location.href = "mailto:support@oneconnexion.com?subject=Modification Véhicule"}
                                >
                                    Demander une modification
                                </Button>
                            </div>
                        </section>

                        {/* Documents */}
                        <section>
                            <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider flex items-center gap-2">
                                <FileText className="h-4 w-4" /> Documents
                            </h3>
                            <div className="space-y-2">
                                {documents.map((doc) => (
                                    <div key={doc.id} className="bg-card rounded-xl p-3 border flex items-center justify-between">
                                        <div className="flex flex-col">
                                            <span className="font-medium text-sm">{doc.name}</span>
                                            <span className="text-xs text-muted-foreground">
                                                {doc.status === 'expired' ? `Expiré le ${doc.expiryDate}` :
                                                    doc.status === 'verified' ? 'Validé' : 'En attente'}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            {getStatusIcon(doc.status)}
                                            {(doc.status === 'expired' || doc.status === 'missing') && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="h-7 text-xs"
                                                    onClick={() => handleUploadSimulation(doc.id)}
                                                >
                                                    Mettre à jour
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Préférences */}
                        <section>
                            <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider flex items-center gap-2">
                                <Settings className="h-4 w-4" /> Préférences
                            </h3>
                            <div className="bg-card rounded-xl border divide-y">
                                <div className="p-4 flex items-center justify-between">
                                    <div>
                                        <p className="font-medium text-sm">Navigation par défaut</p>
                                        <p className="text-xs text-muted-foreground">App ouverte par le bouton GPS</p>
                                    </div>
                                    <select
                                        className="bg-transparent text-sm font-medium focus:outline-none text-right"
                                        value={preferences.navigationApp}
                                        onChange={(e) => updatePreference('navigationApp', e.target.value)}
                                    >
                                        <option value="google_maps">Google Maps</option>
                                        <option value="waze">Waze</option>
                                        <option value="apple_maps">Apple Maps</option>
                                    </select>
                                </div>
                                <div className="p-4 flex items-center justify-between">
                                    <div>
                                        <p className="font-medium text-sm">Acceptation Auto</p>
                                        <p className="text-xs text-muted-foreground">Accepter les courses proches</p>
                                    </div>
                                    <Switch
                                        checked={preferences.autoAccept}
                                        onCheckedChange={(c) => updatePreference('autoAccept', c)}
                                    />
                                </div>
                            </div>
                        </section>

                        {/* Logout */}
                        <Button
                            variant="destructive"
                            className="w-full mt-4"
                            onClick={() => {
                                const success = logout();
                                if (success) {
                                    onClose();
                                    toast({ title: "Déconnexion", description: "À bientôt !" });
                                } else {
                                    toast({
                                        title: "Action refusée",
                                        description: "Veuillez terminer votre course active avant de vous déconnecter.",
                                        variant: "destructive",
                                    });
                                }
                            }}
                        >
                            Se déconnecter
                        </Button>

                    </div>
                </ScrollArea>
            </div>
        </div>
    );
};
