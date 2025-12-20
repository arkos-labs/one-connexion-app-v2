import {
    Bell,
    Shield,
    Moon,
    Smartphone,
    LogOut,
    ChevronRight,
    Mail,
    Lock,
    MapPin
} from "lucide-react";
import { useAppStore } from "@/stores/useAppStore";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";

export const SettingsPage = () => {
    const { user, preferences, updatePreference, logout, currentOrder } = useAppStore();

    const handleNavigationChange = (value: string) => {
        updatePreference('navigationApp', value);
        toast({
            title: "Préférence GPS mise à jour",
            description: `Le bouton GPS ouvrira désormais ${value === 'waze' ? 'Waze' : value === 'apple_maps' ? 'Apple Maps' : 'Google Maps'}.`
        });
    };

    const handleAutoAccept = (checked: boolean) => {
        updatePreference('autoAccept', checked);
        toast({
            title: checked ? "Acceptation Auto activée ⚡" : "Acceptation Auto désactivée",
            description: checked ? "Les courses proches seront acceptées automatiquement." : "Vous devrez accepter chaque course manuellement."
        });
    };

    const handleLogout = () => {
        const success = logout();
        if (!success) {
            toast({
                title: "Action refusée",
                description: "Veuillez terminer votre course active avant de vous déconnecter.",
                variant: "destructive",
            });
        }
    };

    return (
        <div className="p-6 max-w-3xl mx-auto pb-24 animate-in fade-in duration-500">

            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight">Paramètres</h1>
                <p className="text-muted-foreground">Personnalisez votre expérience de conduite.</p>
            </div>

            {/* 1. Carte de Profil */}
            <Card className="mb-8 overflow-hidden border-none shadow-md bg-gradient-to-r from-zinc-900 to-zinc-800 text-white">
                <div className="p-6 flex items-center gap-5">
                    <Avatar className="h-20 w-20 border-4 border-white/10 shadow-xl">
                        <AvatarImage src={user?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.fullName}`} />
                        <AvatarFallback className="bg-primary text-xl font-bold">{user?.fullName?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                        <h2 className="text-2xl font-bold">{user?.fullName || "Coursier"}</h2>
                        <div className="flex items-center gap-2 text-zinc-400 text-sm mb-2">
                            <Mail className="h-3 w-3" />
                            {user?.email}
                        </div>
                        <div className="flex gap-2">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-primary text-primary-foreground uppercase tracking-wider">
                                {user?.role === 'driver' ? 'Coursier Pro' : 'Utilisateur'}
                            </span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white/20 text-white uppercase tracking-wider">
                                ID: {user?.id?.slice(0, 6)}...
                            </span>
                        </div>
                    </div>
                </div>
            </Card>

            <div className="space-y-6">

                {/* 2. Navigation & Conduite */}
                <section>
                    <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3 px-1">
                        Conduite & GPS
                    </h3>
                    <Card className="divide-y">
                        {/* Choix du GPS */}
                        <div className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="p-2.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-xl">
                                    <MapPin className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="font-medium text-sm">Application GPS par défaut</p>
                                    <p className="text-xs text-muted-foreground">Celle qui s'ouvrira pour le guidage</p>
                                </div>
                            </div>
                            <Select
                                value={preferences.navigationApp}
                                onValueChange={handleNavigationChange}
                            >
                                <SelectTrigger className="w-[140px] h-9 text-xs font-medium">
                                    <SelectValue placeholder="Choisir" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="google_maps">Google Maps</SelectItem>
                                    <SelectItem value="waze">Waze</SelectItem>
                                    <SelectItem value="apple_maps">Apple Maps</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Auto Accept */}
                        <div className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="p-2.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 rounded-xl">
                                    <Smartphone className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="font-medium text-sm">Acceptation Automatique</p>
                                    <p className="text-xs text-muted-foreground">Accepter les courses dans un rayon de 2km</p>
                                </div>
                            </div>
                            <Switch
                                checked={preferences.autoAccept}
                                onCheckedChange={handleAutoAccept}
                            />
                        </div>
                    </Card>
                </section>

                {/* 3. Apparence & Système */}
                <section>
                    <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3 px-1">
                        Interface
                    </h3>
                    <Card className="divide-y">


                        <div className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="p-2.5 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-xl">
                                    <Bell className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="font-medium text-sm">Sons & Notifications</p>
                                    <p className="text-xs text-muted-foreground">Sonnerie à l'approche d'une commande</p>
                                </div>
                            </div>
                            <Switch
                                checked={preferences.soundEnabled}
                                onCheckedChange={(c) => updatePreference('soundEnabled', c)}
                            />
                        </div>
                    </Card>
                </section>

                {/* 4. Sécurité & Compte */}
                <section>
                    <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3 px-1">
                        Sécurité
                    </h3>
                    <Card className="divide-y">
                        <div className="p-4 flex items-center justify-between cursor-pointer hover:bg-secondary/50 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="p-2.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 rounded-xl">
                                    <Lock className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="font-medium text-sm">Mot de passe</p>
                                    <p className="text-xs text-muted-foreground">Dernière modification il y a 30 jours</p>
                                </div>
                            </div>
                            <Button variant="ghost" size="sm" className="h-8">Modifier</Button>
                        </div>

                        <div className="p-4 flex items-center justify-between cursor-pointer hover:bg-secondary/50 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="p-2.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 rounded-xl">
                                    <Shield className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="font-medium text-sm">Données personnelles</p>
                                    <p className="text-xs text-muted-foreground">Demander une copie de mes données</p>
                                </div>
                            </div>
                            <ChevronRight className="h-5 w-5 text-muted-foreground" />
                        </div>
                    </Card>
                </section>

                {/* Zone de Danger (Déconnexion) */}
                <div className="pt-6">
                    <Button
                        variant="destructive"
                        className="w-full h-12 text-base font-semibold shadow-sm"
                        onClick={handleLogout}
                    >
                        <LogOut className="mr-2 h-5 w-5" />
                        Se déconnecter
                    </Button>
                    <p className="text-center text-[10px] text-muted-foreground mt-4">
                        Version 2.4.0 (Build 20241220) • ArkOS Labs
                    </p>
                </div>

            </div>
        </div>
    );
};
