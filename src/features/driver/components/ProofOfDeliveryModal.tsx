
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Camera, PenTool, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProofOfDeliveryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

export const ProofOfDeliveryModal = ({ isOpen, onClose, onConfirm }: ProofOfDeliveryModalProps) => {
    const [method, setMethod] = useState<'signature' | 'photo' | null>(null);

    const handleConfirm = () => {
        // Here we would handle the actual upload logic
        onConfirm();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Preuve de livraison</DialogTitle>
                    <DialogDescription>
                        Une signature ou une photo est requise pour valider la course.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-2 gap-4 py-4">
                    <div
                        className={cn(
                            "border-2 rounded-xl p-4 flex flex-col items-center gap-3 cursor-pointer transition-all hover:bg-secondary/50",
                            method === 'signature' ? "border-primary bg-primary/5" : "border-muted-foreground/20 border-dashed"
                        )}
                        onClick={() => setMethod('signature')}
                    >
                        <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center">
                            <PenTool className="h-5 w-5" />
                        </div>
                        <span className="font-semibold text-sm">Signature</span>
                    </div>

                    <div
                        className={cn(
                            "border-2 rounded-xl p-4 flex flex-col items-center gap-3 cursor-pointer transition-all hover:bg-secondary/50",
                            method === 'photo' ? "border-primary bg-primary/5" : "border-muted-foreground/20 border-dashed"
                        )}
                        onClick={() => setMethod('photo')}
                    >
                        <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 flex items-center justify-center">
                            <Camera className="h-5 w-5" />
                        </div>
                        <span className="font-semibold text-sm">Photo</span>
                    </div>
                </div>

                {/* Simulated Input Area */}
                {method === 'signature' && (
                    <div className="border rounded-md h-32 bg-secondary/20 flex items-center justify-center text-muted-foreground text-sm italic mb-4">
                        Zone de signature tactile (Simulation)
                    </div>
                )}
                {method === 'photo' && (
                    <div className="border rounded-md h-32 bg-secondary/20 flex items-center justify-center text-muted-foreground text-sm italic mb-4">
                        <Camera className="mr-2 h-4 w-4" /> Appareil photo actif
                    </div>
                )}

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">Retour</Button>
                    <Button
                        onClick={handleConfirm}
                        className="w-full sm:w-auto"
                        disabled={!method}
                    >
                        <CheckCircle2 className="mr-2 h-4 w-4" /> Valider la livraison
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
