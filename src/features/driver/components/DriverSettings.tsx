import { Car, Bike, Navigation, Volume2, Moon, Smartphone } from "lucide-react";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { useAppStore } from "@/stores/useAppStore";

interface DriverSettingsProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export const DriverSettings = ({ open, onOpenChange }: DriverSettingsProps) => {
    const { preferences, updatePreferences } = useAppStore();

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent
                side="bottom"
                className="h-[92vh] rounded-t-[32px] px-6 pb-12 pt-8 sm:max-w-md sm:mx-auto overflow-y-auto outline-none border-t-0 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.2)]"
            >
                <SheetHeader className="mb-8 text-left">
                    <SheetTitle className="text-2xl font-black tracking-tight">Préférences</SheetTitle>
                    <SheetDescription className="text-base">
                        Configuration du poste de pilotage.
                    </SheetDescription>
                </SheetHeader>

                <div className="space-y-8 pb-20">
                    {/* Section Véhicule */}
                    <div className="space-y-4">
                        <Label className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                            <Car className="h-4 w-4" /> Véhicule
                        </Label>
                        <RadioGroup
                            defaultValue={preferences.vehicleType}
                            onValueChange={(val: any) => updatePreferences({ vehicleType: val })}
                            className="grid grid-cols-3 gap-3"
                        >
                            <div className="relative">
                                <RadioGroupItem value="car" id="car" className="peer sr-only" />
                                <Label
                                    htmlFor="car"
                                    className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-border/50 bg-secondary/20 p-4 hover:bg-secondary/40 peer-data-[state=checked]:bg-primary peer-data-[state=checked]:text-primary-foreground peer-data-[state=checked]:border-primary cursor-pointer transition-all duration-200"
                                >
                                    <Car className="h-6 w-6" />
                                    <span className="text-xs font-bold">Auto</span>
                                </Label>
                            </div>
                            <div className="relative">
                                <RadioGroupItem value="scooter" id="scooter" className="peer sr-only" />
                                <Label
                                    htmlFor="scooter"
                                    className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-border/50 bg-secondary/20 p-4 hover:bg-secondary/40 peer-data-[state=checked]:bg-primary peer-data-[state=checked]:text-primary-foreground peer-data-[state=checked]:border-primary cursor-pointer transition-all duration-200"
                                >
                                    <Bike className="h-6 w-6" />
                                    <span className="text-xs font-bold">Moto</span>
                                </Label>
                            </div>
                            <div className="relative">
                                <RadioGroupItem value="bike" id="bike" className="peer sr-only" />
                                <Label
                                    htmlFor="bike"
                                    className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-border/50 bg-secondary/20 p-4 hover:bg-secondary/40 peer-data-[state=checked]:bg-primary peer-data-[state=checked]:text-primary-foreground peer-data-[state=checked]:border-primary cursor-pointer transition-all duration-200"
                                >
                                    <Navigation className="h-6 w-6" />
                                    <span className="text-xs font-bold">Vélo</span>
                                </Label>
                            </div>
                        </RadioGroup>
                    </div>

                    <Separator className="bg-border/30" />

                    {/* Section GPS */}
                    <div className="space-y-4">
                        <Label className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                            <Smartphone className="h-4 w-4" /> Navigation
                        </Label>
                        <RadioGroup
                            defaultValue={preferences.navigationApp}
                            onValueChange={(val: any) => updatePreferences({ navigationApp: val })}
                            className="flex flex-col gap-2"
                        >
                            {[
                                { id: "waze", label: "Waze" },
                                { id: "google_maps", label: "Google Maps" },
                                { id: "apple_maps", label: "Apple Plans" }
                            ].map((app) => (
                                <div key={app.id} className="relative flex items-center space-x-3 rounded-xl border border-border/40 p-4 hover:bg-secondary/10 transition-colors">
                                    <RadioGroupItem value={app.id} id={app.id} />
                                    <Label htmlFor={app.id} className="flex-1 cursor-pointer font-medium text-sm">{app.label}</Label>
                                </div>
                            ))}
                        </RadioGroup>
                    </div>

                    <Separator className="bg-border/30" />

                    {/* Section Options */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <Label className="text-base font-semibold">Sons & Alertes</Label>
                                <p className="text-xs text-muted-foreground">Notification sonore des commandes</p>
                            </div>
                            <Switch
                                checked={preferences.soundEnabled}
                                onCheckedChange={(val) => updatePreferences({ soundEnabled: val })}
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <Label className="text-base font-semibold">Mode Sombre</Label>
                                <p className="text-xs text-muted-foreground">Interface nuit automatique</p>
                            </div>
                            <Switch
                                checked={preferences.darkMode}
                                onCheckedChange={(val) => updatePreferences({ darkMode: val })}
                            />
                        </div>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
};
