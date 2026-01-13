import {
    History,
    FileText,
    Settings,
    HelpCircle,
    LogOut,
    Star,
    Wallet,
    Car
} from "lucide-react";
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarHeader,
    SidebarFooter,
    useSidebar,
} from "@/components/ui/sidebar";
import { useAppStore } from "@/stores/useAppStore";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "@/hooks/use-toast";

const MENU_ITEMS = [
    { title: "Historique", url: "/driver/history", icon: History },
    { title: "Mes Revenus", url: "/driver/earnings", icon: Wallet },
    { title: "Mon Véhicule", url: "/driver/vehicle", icon: Car },
    { title: "Documents", url: "/driver/documents", icon: FileText, notification: true },
    { title: "Préférences", url: "/settings", icon: Settings },
];

export function AppSidebar() {
    const { user, history, logout } = useAppStore();
    const { setOpenMobile } = useSidebar();

    const rating = 4.92;
    const version = "Version 2.4.0 (Build 302)";

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

    const handleLinkClick = () => {
        // Fermer le sidebar sur mobile après un clic
        setOpenMobile(false);
    };

    return (
        <Sidebar
            className="border-r-0 bg-slate-900/95 backdrop-blur-xl"
            style={
                {
                    "--sidebar-background": "222 47% 11%",
                    "--sidebar-foreground": "210 40% 98%",
                    "--sidebar-primary": "210 40% 98%",
                    "--sidebar-primary-foreground": "222 47% 11%",
                    "--sidebar-accent": "217 33% 17%",
                    "--sidebar-accent-foreground": "210 40% 98%",
                    "--sidebar-border": "217 33% 20%",
                    "--sidebar-ring": "160 84% 39%",
                } as React.CSSProperties
            }
        >
            {/* === HEADER: Profil === */}
            <SidebarHeader className="pt-8 pb-6 flex flex-col items-center bg-gradient-to-b from-slate-800/50 to-transparent">
                <div className="relative mb-3 flex flex-col items-center">
                    {/* Avatar avec bordure dorée */}
                    <div className="p-1 rounded-full bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 shadow-lg shadow-yellow-500/20">
                        <Avatar className="h-24 w-24 border-4 border-slate-900">
                            <AvatarImage src="https://github.com/shadcn.png" />
                            <AvatarFallback className="bg-slate-800 text-white text-2xl font-bold">DR</AvatarFallback>
                        </Avatar>
                    </div>

                    {/* Badge Note - Superposé en bas */}
                    <div className="absolute -bottom-2 bg-gradient-to-r from-yellow-400 to-yellow-500 text-slate-900 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-lg shadow-yellow-500/30">
                        {rating} <Star className="h-3 w-3 fill-slate-900 text-slate-900" />
                    </div>
                </div>

                <div className="text-center w-full mt-4">
                    <h2 className="text-lg font-bold tracking-tight text-white">
                        {user?.fullName || "James Chauffeur"}
                    </h2>

                    {/* Badge courses */}
                    <div className="flex justify-center mt-2">
                        <span className="text-xs text-yellow-500 font-semibold bg-yellow-500/10 border border-yellow-500/20 px-4 py-1.5 rounded-full">
                            {history.length} courses au total
                        </span>
                    </div>
                </div>
            </SidebarHeader>

            {/* === CONTENU: Menu === */}
            <SidebarContent className="px-3 py-4">
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu className="gap-1">
                            {MENU_ITEMS.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton
                                        asChild
                                        size="lg"
                                        className="h-12 hover:bg-slate-800/50 data-[active=true]:bg-slate-800/70 transition-all rounded-xl group"
                                    >
                                        <Link to={item.url} onClick={handleLinkClick} className="flex items-center gap-3 px-3 w-full">
                                            <item.icon className="h-5 w-5 text-slate-400 group-hover:text-yellow-500 transition-colors" />
                                            <span className="font-medium text-sm text-slate-300 group-hover:text-white flex-1 transition-colors">
                                                {item.title}
                                            </span>

                                            {/* Notification badge */}
                                            {item.notification && (
                                                <span className="h-2 w-2 rounded-full bg-red-500 shadow-lg shadow-red-500/50 animate-pulse" />
                                            )}
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            {/* === FOOTER: Déconnexion & Version === */}
            <SidebarFooter className="p-4 mt-auto border-t border-slate-800/50">
                <div className="flex flex-col gap-4">
                    <button
                        onClick={handleLogout}
                        className="flex items-center justify-center gap-2 text-red-400 hover:text-red-300 font-semibold transition-colors bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-xl py-2.5 px-4"
                    >
                        <LogOut className="h-4 w-4 rotate-180" />
                        <span className="text-sm">Se déconnecter</span>
                    </button>

                    <p className="text-[10px] text-center text-slate-500 font-medium">
                        {version}
                    </p>
                </div>
            </SidebarFooter>
        </Sidebar>
    );
}
