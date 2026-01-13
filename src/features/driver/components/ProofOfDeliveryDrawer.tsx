import { useState, useRef } from "react";
import SignatureCanvas from 'react-signature-canvas';
import {
    Drawer,
    DrawerContent,
    DrawerClose
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Camera, QrCode, Check, RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface ProofOfDeliveryDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (proofType: 'signature' | 'photo', proofData: string) => void;
}

type Mode = 'selection' | 'signature' | 'photo';

export const ProofOfDeliveryDrawer = ({ isOpen, onClose, onConfirm }: ProofOfDeliveryDrawerProps) => {
    const [mode, setMode] = useState<Mode>('selection');
    const sigCanvas = useRef<SignatureCanvas>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);

    // Réinitialiser l'état à la fermeture
    const handleClose = () => {
        setMode('selection');
        setCapturedPhoto(null);
        onClose();
    };

    // --- LOGIQUE SIGNATURE ---
    const clearSignature = () => {
        sigCanvas.current?.clear();
    };

    const confirmSignature = () => {
        if (!sigCanvas.current || sigCanvas.current.isEmpty()) {
            toast.error("Veuillez faire signer le client avant de valider.");
            return;
        }

        try {
            const canvas = sigCanvas.current.getCanvas();
            const dataURL = canvas.toDataURL('image/png');

            if (dataURL) {
                toast.success("Signature capturée avec succès !", {
                    description: "La livraison est terminée."
                });
                onConfirm('signature', dataURL);
                handleClose();
            }
        } catch (error) {
            console.error("Erreur lors de la capture de la signature:", error);
            toast.error("Erreur lors de la capture de la signature");
        }
    };

    // --- LOGIQUE PHOTO ---
    const handlePhotoClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            toast.error("Veuillez sélectionner une image");
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const result = e.target?.result as string;
            setCapturedPhoto(result);
            toast.success("Photo capturée !");
        };
        reader.onerror = () => {
            toast.error("Erreur lors de la lecture de l'image");
        };
        reader.readAsDataURL(file);
    };

    const retakePhoto = () => {
        setCapturedPhoto(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const confirmPhoto = () => {
        if (capturedPhoto) {
            toast.success("Photo capturée avec succès !", {
                description: "La livraison est terminée."
            });
            onConfirm('photo', capturedPhoto);
            handleClose();
        }
    };

    return (
        <Drawer open={isOpen} onOpenChange={(o) => !o && handleClose()}>
            <DrawerContent className="bg-slate-900/98 backdrop-blur-xl border-t-2 border-slate-700/50">
                <div className="mx-auto w-full max-w-sm pb-8">

                    {/* Header */}
                    <div className="p-6 pb-4 border-b border-slate-800/50">
                        <h2 className="text-center text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-500">
                            Course Active - Validation Livraison
                        </h2>
                        <p className="text-center text-sm text-slate-400 mt-2">
                            Validez la livraison avec une preuve de remise pour terminer la course
                        </p>
                    </div>

                    <div className="p-6">

                        {/* --- MODE SÉLECTION --- */}
                        {mode === 'selection' && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    {/* Prendre une Photo */}
                                    <button
                                        onClick={() => setMode('photo')}
                                        className="aspect-square bg-slate-800/50 hover:bg-slate-700 border-2 border-slate-700/50 hover:border-yellow-500/50 rounded-2xl flex flex-col items-center justify-center gap-3 transition-all group"
                                    >
                                        <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center shadow-lg shadow-yellow-500/20 group-hover:scale-110 transition-transform">
                                            <Camera className="h-8 w-8 text-slate-900" />
                                        </div>
                                        <span className="text-sm font-semibold text-white">Prendre<br />une Photo</span>
                                    </button>

                                    {/* Scanner un Code */}
                                    <button
                                        onClick={() => setMode('signature')}
                                        className="aspect-square bg-slate-800/50 hover:bg-slate-700 border-2 border-slate-700/50 hover:border-yellow-500/50 rounded-2xl flex flex-col items-center justify-center gap-3 transition-all group"
                                    >
                                        <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center shadow-lg shadow-yellow-500/20 group-hover:scale-110 transition-transform">
                                            <QrCode className="h-8 w-8 text-slate-900" />
                                        </div>
                                        <span className="text-sm font-semibold text-white">Scanner<br />un Code</span>
                                    </button>
                                </div>

                                {/* Indicateur de progression (3 points) */}
                                <div className="flex justify-center gap-2 pt-4">
                                    <div className="h-2 w-2 rounded-full bg-yellow-500"></div>
                                    <div className="h-2 w-2 rounded-full bg-slate-700"></div>
                                    <div className="h-2 w-2 rounded-full bg-slate-700"></div>
                                </div>

                                {/* Bouton Confirmer et Terminer */}
                                <Button
                                    onClick={handleClose}
                                    className="w-full h-14 text-base font-bold rounded-2xl bg-gradient-to-r from-yellow-500 via-yellow-600 to-yellow-500 hover:from-yellow-400 hover:via-yellow-500 hover:to-yellow-400 text-slate-900 shadow-lg shadow-yellow-500/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    Confirmer et Terminer
                                </Button>
                            </div>
                        )}

                        {/* --- MODE SIGNATURE (QR Code) --- */}
                        {mode === 'signature' && (
                            <div className="space-y-4">
                                <div className="bg-slate-800/30 backdrop-blur-sm border-2 border-dashed border-slate-700/50 rounded-2xl h-64 w-full relative touch-none">
                                    <SignatureCanvas
                                        ref={sigCanvas}
                                        penColor="#fbbf24"
                                        backgroundColor="transparent"
                                        canvasProps={{ className: 'absolute inset-0 w-full h-full rounded-2xl' }}
                                    />
                                    <div className="absolute bottom-3 right-3 text-xs text-slate-500 pointer-events-none">
                                        Zone de signature / QR Code
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <Button
                                        variant="outline"
                                        onClick={clearSignature}
                                        className="flex-1 h-12 bg-slate-800/50 border-slate-700/50 text-white hover:bg-slate-700"
                                    >
                                        <RefreshCw className="h-4 w-4 mr-2" /> Effacer
                                    </Button>
                                    <Button
                                        onClick={confirmSignature}
                                        className="flex-1 h-12 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-slate-900 font-bold"
                                    >
                                        <Check className="h-4 w-4 mr-2" /> Valider
                                    </Button>
                                </div>
                                <Button
                                    variant="ghost"
                                    onClick={() => { setMode('selection'); setCapturedPhoto(null); }}
                                    className="w-full text-slate-400 hover:text-white"
                                >
                                    Retour au choix
                                </Button>
                            </div>
                        )}

                        {/* --- MODE PHOTO --- */}
                        {mode === 'photo' && (
                            <div className="space-y-4">
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    capture="environment"
                                    onChange={handleFileChange}
                                    className="hidden"
                                />

                                {!capturedPhoto ? (
                                    <div className="space-y-4">
                                        <div
                                            className="aspect-[4/3] bg-slate-800/30 backdrop-blur-sm rounded-2xl relative overflow-hidden flex items-center justify-center border-2 border-dashed border-slate-700/50 cursor-pointer hover:border-yellow-500/50 transition-all"
                                            onClick={handlePhotoClick}
                                        >
                                            <div className="absolute inset-8 border-2 border-yellow-500/30 rounded-xl pointer-events-none" />

                                            <div className="flex flex-col items-center gap-3 z-10">
                                                <div className="h-20 w-20 rounded-full bg-gradient-to-br from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 flex items-center justify-center shadow-lg shadow-yellow-500/30 transition-all">
                                                    <Camera className="h-10 w-10 text-slate-900" />
                                                </div>
                                                <p className="text-sm font-semibold text-white">
                                                    Appuyez pour prendre une photo
                                                </p>
                                            </div>
                                        </div>

                                        <p className="text-xs text-center text-slate-500">
                                            Votre navigateur ouvrira l'appareil photo de votre téléphone
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="aspect-[4/3] rounded-2xl overflow-hidden border-2 border-yellow-500 relative">
                                            <img
                                                src={capturedPhoto}
                                                alt="Photo capturée"
                                                className="w-full h-full object-cover"
                                            />
                                            <div className="absolute bottom-0 inset-x-0 bg-black/70 text-white text-xs p-2 text-center">
                                                ✓ Photo capturée
                                            </div>
                                        </div>
                                        <div className="flex gap-3">
                                            <Button
                                                variant="outline"
                                                onClick={retakePhoto}
                                                className="flex-1 h-12 bg-slate-800/50 border-slate-700/50 text-white hover:bg-slate-700"
                                            >
                                                <RefreshCw className="h-4 w-4 mr-2" /> Reprendre
                                            </Button>
                                            <Button
                                                onClick={confirmPhoto}
                                                className="flex-1 h-12 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-slate-900 font-bold"
                                            >
                                                <Check className="h-4 w-4 mr-2" /> Valider
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                <Button
                                    variant="ghost"
                                    onClick={() => { setMode('selection'); setCapturedPhoto(null); }}
                                    className="w-full text-slate-400 hover:text-white"
                                >
                                    Retour au choix
                                </Button>
                            </div>
                        )}

                    </div>
                </div>
            </DrawerContent>
        </Drawer>
    );
};
