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
} from "@/components/ui/sidebar";
import { useAppStore } from "@/stores/useAppStore";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";

// Items réduits : Historique, Documents, Préférences, Aide
const MENU_ITEMS = [
    { title: "Historique", url: "/driver/history", icon: History },
    { title: "Mes Revenus", url: "/driver/earnings", icon: Wallet },
    { title: "Mon Véhicule", url: "/driver/vehicle", icon: Car },
    { title: "Documents", url: "/driver/documents", icon: FileText },
    { title: "Préférences", url: "/settings", icon: Settings },
    { title: "Aide & Support", url: "/support", icon: HelpCircle },
];

export function AppSidebar() {
    const { user, history, logout, currentOrder } = useAppStore();

    // Mock Rating (car pas encore dans user)
    const rating = 4.92;

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
        <Sidebar>
            {/* === HEADER: Profil Simplifié === */}
            <SidebarHeader className="p-6 flex flex-col items-center border-b border-border/10">
                <div className="relative mb-3">
                    <Avatar className="h-20 w-20 border-4 border-background shadow-lg">
                        <AvatarImage src="https://github.com/shadcn.png" />
                        <AvatarFallback>DR</AvatarFallback>
                    </Avatar>
                    <Badge className="absolute -bottom-2 -right-2 px-2 py-0.5 bg-yellow-500 text-white border-2 border-background flex gap-1">
                        {rating} <Star className="h-3 w-3 fill-current" />
                    </Badge>
                </div>

                <div className="text-center">
                    <h2 className="text-lg font-bold tracking-tight">{user?.fullName || "Chauffeur"}</h2>
                    <p className="text-xs text-muted-foreground mt-1 font-medium bg-secondary/50 px-2 py-1 rounded-full">
                        {history.length} courses au total
                    </p>
                </div>
            </SidebarHeader>

            {/* === CONTENU: Menu Réduit === */}
            <SidebarContent className="pt-4">
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {MENU_ITEMS.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild size="lg">
                                        <Link to={item.url} className="flex items-center gap-4 px-4">
                                            <item.icon className="h-5 w-5 opacity-70" />
                                            <span className="font-medium">{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            {/* === FOOTER: Déconnexion === */}
            <SidebarFooter className="p-4 border-t border-border/10">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            onClick={handleLogout}
                            size="lg"
                            className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 w-full justify-center gap-2 font-semibold"
                        >
                            <LogOut className="h-4 w-4" />
                            <span>Se déconnecter</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    );
}
