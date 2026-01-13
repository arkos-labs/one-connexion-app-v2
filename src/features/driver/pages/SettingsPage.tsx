import {
    Bell,
    Moon,
    LogOut,
    ChevronRight,
    Mail,
    MessageSquare,
    Volume2,
    User,
    ArrowLeft
} from "lucide-react";
import { useAppStore } from "@/stores/useAppStore";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNavigate } from "react-router-dom";

export const SettingsPage = () => {
    const navigate = useNavigate();
    const { user, preferences, updatePreference, logout, currentOrder } = useAppStore();

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
        <div className="flex flex-col h-full bg-slate-950">
            {/* Header */}
            <div className="sticky top-0 z-30 px-6 pt-8 pb-4 bg-slate-950/95 backdrop-blur-xl border-b border-slate-800/50">
                <div className="flex items-center gap-4 mb-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate('/driver')}
                        className="rounded-xl hover:bg-slate-800"
                    >
                        <ArrowLeft className="h-5 w-5 text-white" />
                    </Button>
                    <div>
                        <h1 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-500">
                            Paramètres
                        </h1>
                        <p className="text-xs text-slate-400">Personnalisez votre expérience de conduite</p>
                    </div>
                </div>
            </div>

            <ScrollArea className="flex-1 px-6">
                <div className="space-y-6 pt-6 pb-24">

                    {/* Section Profil */}
                    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-2 border-slate-700/50 p-6 shadow-2xl">
                        <div className="flex items-center gap-4 mb-4">
                            <Avatar className="h-16 w-16 border-4 border-yellow-500/50 shadow-lg shadow-yellow-500/20">
                                <AvatarImage src={user?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.fullName}`} />
                                <AvatarFallback className="bg-gradient-to-br from-yellow-400 to-yellow-600 text-slate-900 text-xl font-bold">
                                    {user?.fullName?.charAt(0) || 'C'}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                                <h2 className="text-xl font-bold text-white">{user?.fullName || "Chauffeur"}</h2>
                                <p className="text-xs text-slate-400">{user?.email}</p>
                            </div>
                        </div>
                        <Button className="w-full h-10 rounded-xl border-2 border-yellow-500/50 bg-transparent hover:bg-yellow-500/10 text-yellow-400 font-semibold">
                            Modifier le profil
                        </Button>
                    </div>

                    {/* PRÉFÉRENCES */}
                    <div>
                        <h3 className="font-bold text-xs uppercase tracking-widest text-slate-400 px-2 mb-3">
                            PRÉFÉRENCES
                        </h3>

                        <div className="space-y-3">
                            {/* Recevoir les notifications push */}
                            <div className="bg-slate-900/50 backdrop-blur-sm border-2 border-slate-800/50 rounded-2xl p-4 flex items-center justify-between hover:border-yellow-500/30 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
                                        <Bell className="h-5 w-5 text-yellow-400" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-sm text-white">Recevoir les notifications push</p>
                                    </div>
                                </div>
                                <Switch
                                    checked={preferences.soundEnabled}
                                    onCheckedChange={(c) => updatePreference('soundEnabled', c)}
                                    className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-yellow-500 data-[state=checked]:to-yellow-600"
                                />
                            </div>

                            {/* Notifications par SMS et EMAIL */}
                            <div className="bg-slate-900/50 backdrop-blur-sm border-2 border-slate-800/50 rounded-2xl p-4 flex items-center justify-between hover:border-yellow-500/30 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
                                        <MessageSquare className="h-5 w-5 text-yellow-400" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-sm text-white">Notifications par SMS et EMAIL</p>
                                    </div>
                                </div>
                                <Switch
                                    checked={true}
                                    className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-yellow-500 data-[state=checked]:to-yellow-600"
                                />
                            </div>

                            {/* Mode Sombre */}
                            <div className="bg-slate-900/50 backdrop-blur-sm border-2 border-slate-800/50 rounded-2xl p-4 flex items-center justify-between hover:border-yellow-500/30 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
                                        <Moon className="h-5 w-5 text-yellow-400" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-sm text-white">Mode Sombre</p>
                                    </div>
                                </div>
                                <Switch
                                    checked={true}
                                    className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-yellow-500 data-[state=checked]:to-yellow-600"
                                />
                            </div>

                            {/* Sons & Notifications */}
                            <div className="bg-slate-900/50 backdrop-blur-sm border-2 border-slate-800/50 rounded-2xl p-4 flex items-center justify-between hover:border-yellow-500/30 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
                                        <Volume2 className="h-5 w-5 text-yellow-400" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-sm text-white">Sons & Notifications</p>
                                    </div>
                                </div>
                                <Switch
                                    checked={preferences.soundEnabled}
                                    onCheckedChange={(c) => updatePreference('soundEnabled', c)}
                                    className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-yellow-500 data-[state=checked]:to-yellow-600"
                                />
                            </div>
                        </div>
                    </div>

                    {/* AIDE */}
                    <div>
                        <h3 className="font-bold text-xs uppercase tracking-widest text-slate-400 px-2 mb-3">
                            AIDE
                        </h3>

                        <div className="bg-slate-900/50 backdrop-blur-sm border-2 border-slate-800/50 rounded-2xl p-4 flex items-center justify-between hover:border-yellow-500/30 transition-colors cursor-pointer">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
                                    <MessageSquare className="h-5 w-5 text-yellow-400" />
                                </div>
                                <div>
                                    <p className="font-semibold text-sm text-white">Contacter le support</p>
                                </div>
                            </div>
                            <ChevronRight className="h-5 w-5 text-slate-400" />
                        </div>
                    </div>

                    {/* Bouton Déconnexion */}
                    <Button
                        variant="destructive"
                        className="w-full h-14 text-base font-bold rounded-2xl bg-red-600 hover:bg-red-700 text-white shadow-lg"
                        onClick={handleLogout}
                    >
                        <LogOut className="mr-2 h-5 w-5" />
                        Déconnexion
                    </Button>

                </div>
            </ScrollArea>
        </div>
    );
};
