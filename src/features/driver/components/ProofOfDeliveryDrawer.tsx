import { useState, useRef } from "react";
import SignatureCanvas from 'react-signature-canvas';
import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerDescription,
    DrawerFooter,
    DrawerClose
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Camera, PenTool, X, Check, RefreshCw, ImagePlus } from "lucide-react";
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
            // Récupère l'image de la signature en base64
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

    // --- LOGIQUE PHOTO (Input File avec capture) ---
    const handlePhotoClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Vérifier que c'est une image
        if (!file.type.startsWith('image/')) {
            toast.error("Veuillez sélectionner une image");
            return;
        }

        // Convertir en base64
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
            <DrawerContent className="max-h-[90vh] overflow-y-auto">
                <div className="mx-auto w-full max-w-sm pb-8">

                    <DrawerHeader className="text-left">
                        <DrawerTitle>Preuve de livraison</DrawerTitle>
                        <DrawerDescription>
                            {mode === 'selection' && "Choisissez une méthode pour valider la remise du colis."}
                            {mode === 'signature' && "Demandez au client de signer dans le cadre ci-dessous."}
                            {mode === 'photo' && "Prenez une photo du colis déposé en lieu sûr."}
                        </DrawerDescription>
                    </DrawerHeader>

                    <div className="p-4">

                        {/* --- MODE SÉLECTION --- */}
                        {mode === 'selection' && (
                            <div className="grid grid-cols-2 gap-4 py-4">
                                <Button
                                    variant="outline"
                                    className="h-32 flex flex-col gap-3 hover:bg-blue-50 hover:border-blue-500 transition-all"
                                    onClick={() => setMode('signature')}
                                >
                                    <div className="p-3 bg-blue-100 text-blue-600 rounded-full">
                                        <PenTool className="h-8 w-8" />
                                    </div>
                                    <span className="font-semibold">Signature</span>
                                </Button>
                                <Button
                                    variant="outline"
                                    className="h-32 flex flex-col gap-3 hover:bg-green-50 hover:border-green-500 transition-all"
                                    onClick={() => setMode('photo')}
                                >
                                    <div className="p-3 bg-green-100 text-green-600 rounded-full">
                                        <Camera className="h-8 w-8" />
                                    </div>
                                    <span className="font-semibold">Photo</span>
                                </Button>
                            </div>
                        )}

                        {/* --- MODE SIGNATURE --- */}
                        {mode === 'signature' && (
                            <div className="space-y-4">
                                <div className="border-2 border-dashed border-zinc-300 rounded-xl bg-zinc-50 h-64 w-full relative touch-none">
                                    <SignatureCanvas
                                        ref={sigCanvas}
                                        penColor="black"
                                        backgroundColor="transparent"
                                        canvasProps={{ className: 'absolute inset-0 w-full h-full rounded-xl' }}
                                    />
                                    <div className="absolute bottom-2 right-2 text-[10px] text-muted-foreground pointer-events-none">
                                        Zone de signature
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="outline" onClick={clearSignature} className="flex-1">
                                        <RefreshCw className="h-4 w-4 mr-2" /> Effacer
                                    </Button>
                                    <Button onClick={confirmSignature} className="flex-1 bg-blue-600 hover:bg-blue-700">
                                        <Check className="h-4 w-4 mr-2" /> Valider
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* --- MODE PHOTO (Input File avec Capture) --- */}
                        {mode === 'photo' && (
                            <div className="space-y-4">
                                {/* Input caché pour la capture photo */}
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    capture="environment"
                                    onChange={handleFileChange}
                                    className="hidden"
                                />

                                {!capturedPhoto ? (
                                    // Interface de capture
                                    <div className="space-y-4">
                                        <div
                                            className="aspect-[4/3] bg-gradient-to-br from-green-50 to-blue-50 rounded-xl relative overflow-hidden flex items-center justify-center border-2 border-dashed border-green-300 cursor-pointer hover:border-green-500 transition-all"
                                            onClick={handlePhotoClick}
                                        >
                                            {/* Viseur décoratif */}
                                            <div className="absolute inset-8 border-2 border-green-300/50 rounded-lg pointer-events-none" />

                                            {/* Bouton central */}
                                            <div className="flex flex-col items-center gap-3 z-10">
                                                <div className="h-20 w-20 rounded-full bg-green-600 hover:bg-green-700 flex items-center justify-center shadow-lg transition-all">
                                                    <Camera className="h-10 w-10 text-white" />
                                                </div>
                                                <p className="text-sm font-semibold text-green-700">
                                                    Appuyez pour prendre une photo
                                                </p>
                                            </div>

                                            <p className="absolute bottom-4 text-xs text-green-600 bg-white/80 px-3 py-1 rounded-full">
                                                📸 Caméra du téléphone
                                            </p>
                                        </div>

                                        <p className="text-xs text-center text-muted-foreground">
                                            Votre navigateur ouvrira l'appareil photo de votre téléphone
                                        </p>
                                    </div>
                                ) : (
                                    // Prévisualisation de la photo
                                    <div className="space-y-4 animate-in fade-in">
                                        <div className="aspect-[4/3] rounded-xl overflow-hidden border-2 border-green-500 relative">
                                            <img
                                                src={capturedPhoto}
                                                alt="Photo capturée"
                                                className="w-full h-full object-cover"
                                            />
                                            <div className="absolute bottom-0 inset-x-0 bg-black/50 text-white text-xs p-2 text-center flex items-center justify-center gap-2">
                                                <ImagePlus className="h-4 w-4" /> Photo capturée
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button variant="outline" onClick={retakePhoto} className="flex-1">
                                                <RefreshCw className="h-4 w-4 mr-2" /> Reprendre
                                            </Button>
                                            <Button onClick={confirmPhoto} className="flex-1 bg-green-600 hover:bg-green-700">
                                                <Check className="h-4 w-4 mr-2" /> Valider la preuve
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                    </div>

                    <DrawerFooter>
                        {mode !== 'selection' && (
                            <Button variant="ghost" onClick={() => { setMode('selection'); setCapturedPhoto(null); }}>
                                Retour au choix
                            </Button>
                        )}
                        <DrawerClose asChild>
                            <Button variant="outline">
                                <X className="h-4 w-4 mr-2" /> Annuler
                            </Button>
                        </DrawerClose>
                    </DrawerFooter>
                </div>
            </DrawerContent>
        </Drawer>
    );
};
