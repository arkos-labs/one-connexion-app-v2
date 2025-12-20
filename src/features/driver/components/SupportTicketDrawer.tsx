
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerFooter, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface SupportTicketDrawerProps {
    isOpen: boolean;
    onClose: () => void;
}

export const SupportTicketDrawer = ({ isOpen, onClose }: SupportTicketDrawerProps) => {
    return (
        <Drawer open={isOpen} onOpenChange={onClose}>
            <DrawerContent>
                <div className="mx-auto w-full max-w-sm">
                    <DrawerHeader>
                        <DrawerTitle>Ouvrir un ticket</DrawerTitle>
                    </DrawerHeader>
                    <div className="p-4 pb-0 space-y-4">
                        <div className="space-y-2">
                            <Label>Sujet</Label>
                            <Input placeholder="Ex: Problème de paiement" />
                        </div>
                        <div className="space-y-2">
                            <Label>Description</Label>
                            <Textarea placeholder="Décrivez votre problème en détail..." />
                        </div>
                    </div>
                    <DrawerFooter>
                        <Button onClick={onClose}>Envoyer</Button>
                        <Button variant="outline" onClick={onClose}>Annuler</Button>
                    </DrawerFooter>
                </div>
            </DrawerContent>
        </Drawer>
    );
};
