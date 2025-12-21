import { useEffect, useState } from "react";
import {
    Activity,
    Clock,
    ShieldCheck,
    Navigation,
    Package,
    AlertCircle,
    TrendingUp,
    Car,
    LayoutDashboard,
    ListFilter,
    RefreshCcw
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { adminService } from "@/services/adminService";
import { supabase } from "@/lib/supabase";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { DispatchMap } from "./DispatchMap";

export const DashboardHome = () => {
    const [stats, setStats] = useState({
        onlineDrivers: 0,
        activeOrders: 0,
        pendingOrders: 0
    });
    const [recentActivity, setRecentActivity] = useState<any[]>([]);
    const [drivers, setDrivers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const fetchBoardData = async (silent = false) => {
        if (!silent) setLoading(true);
        else setIsRefreshing(true);
        
        try {
            const [dashboardStats, activeOrders, driversStatus] = await Promise.all([
                adminService.getDashboardStats(),
                adminService.fetchAllActiveOrders(),
                adminService.getDriversStatus()
            ]);
            
            setStats(dashboardStats);
            setRecentActivity(activeOrders);
            setDrivers(driversStatus);
        } catch (error) {
            console.error("Error fetching dashboard data:", error);
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        fetchBoardData();

        const channel = supabase
            .channel('admin_dashboard')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => fetchBoardData(true))
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'drivers' }, () => fetchBoardData(true))
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'driver_locations' }, () => fetchBoardData(true))
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending_acceptance': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
            case 'driver_accepted': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
            case 'arrived_pickup': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
            case 'in_progress': return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
            case 'delivered': return 'bg-green-500/10 text-green-500 border-green-500/20';
            default: return 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'pending_acceptance': return 'En attente';
            case 'driver_accepted': return 'Accepté';
            case 'arrived_pickup': return 'Arrivé au retrait';
            case 'in_progress': return 'Colis Récupéré';
            case 'delivered': return 'Livré';
            case 'assigned': return 'Assigné';
            default: return status;
        }
    };

    if (loading) {
        return (
            <div className="p-6 flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-6 space-y-6 bg-background/50 min-h-screen">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="h-12 w-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center shadow-inner">
                        <Activity className="h-6 w-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
                            Dashboard Dispatch
                            {isRefreshing && <RefreshCcw className="h-4 w-4 animate-spin text-primary" />}
                        </h1>
                        <p className="text-sm text-muted-foreground font-medium">Control Center & Real-time Logistics</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => fetchBoardData(true)}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary hover:bg-secondary/80 transition-all font-bold text-xs uppercase border border-border/10 shadow-sm"
                    >
                        <RefreshCcw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                        {isRefreshing ? 'Actualisation...' : 'Actualiser'}
                    </button>
                    <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary/50 border border-border/10">
                        <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Live Sync Active</span>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border-none shadow-sm bg-card/50 backdrop-blur-md">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div className="p-3 bg-blue-500/10 text-blue-500 rounded-2xl">
                                <Navigation className="h-6 w-6" />
                            </div>
                            <TrendingUp className="h-4 w-4 text-green-500" />
                        </div>
                        <div className="mt-4">
                            <p className="text-3xl font-black tabular-nums">{stats.onlineDrivers}</p>
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Chauffeurs en ligne</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm bg-card/50 backdrop-blur-md">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div className="p-3 bg-orange-500/10 text-orange-500 rounded-2xl">
                                <Car className="h-6 w-6" />
                            </div>
                            <Activity className="h-4 w-4 text-orange-500 animate-pulse" />
                        </div>
                        <div className="mt-4">
                            <p className="text-3xl font-black tabular-nums">{stats.activeOrders}</p>
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Courses en cours</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm bg-card/50 backdrop-blur-md">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div className="p-3 bg-yellow-500/10 text-yellow-500 rounded-2xl">
                                <Package className="h-6 w-6" />
                            </div>
                            <Clock className="h-4 w-4 text-yellow-500" />
                        </div>
                        <div className="mt-4">
                            <p className="text-3xl font-black tabular-nums">{stats.pendingOrders}</p>
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Commandes en attente</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm bg-card/50 backdrop-blur-md">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div className="p-3 bg-green-500/10 text-green-500 rounded-2xl">
                                <ShieldCheck className="h-6 w-6" />
                            </div>
                            <TrendingUp className="h-4 w-4 text-green-500" />
                        </div>
                        <div className="mt-4">
                            <p className="text-3xl font-black tabular-nums">98.5%</p>
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Taux de succès</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2 border-none shadow-xl bg-card/30 backdrop-blur overflow-hidden h-[600px] flex flex-col">
                    <CardHeader className="flex flex-row items-center justify-between border-b border-border/10 bg-card/50 px-6 py-4">
                        <div className="flex items-center gap-2">
                            <Navigation className="h-4 w-4 text-primary" />
                            <CardTitle className="text-sm font-black uppercase tracking-widest">Carte Logistique Live</CardTitle>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1.5 px-2 py-1 bg-green-500/10 text-green-500 rounded-full border border-green-500/20">
                                <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                                <span className="text-[10px] font-black uppercase">{drivers.filter(d => d.is_online).length} ONLINE</span>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0 flex-1 relative">
                        <DispatchMap drivers={drivers} orders={recentActivity} />
                    </CardContent>
                </Card>

                <Card className="border-none shadow-xl bg-card/30 backdrop-blur flex flex-col h-[600px]">
                    <CardHeader className="border-b border-border/10 bg-card/50 px-6 py-4 flex flex-row items-center justify-between">
                        <div className="flex items-center gap-2">
                            <ListFilter className="h-4 w-4 text-primary" />
                            <CardTitle className="text-sm font-black uppercase tracking-widest">Activité Mission</CardTitle>
                        </div>
                        <Badge variant="outline" className="font-mono text-[10px]">REALTIME</Badge>
                    </CardHeader>
                    <CardContent className="p-0 flex-1 overflow-y-auto custom-scrollbar">
                        {recentActivity.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center p-8 text-center space-y-4 opacity-50">
                                <div className="p-4 bg-zinc-500/10 rounded-full">
                                    <Package className="h-8 w-8 text-muted-foreground" />
                                </div>
                                <p className="text-sm font-medium">Aucune mission active</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-border/10">
                                {recentActivity.map((order) => (
                                    <div key={order.id} className="p-4 hover:bg-white/5 transition-colors group">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-black group-hover:text-primary transition-colors tracking-tighter">#{order.id.slice(0, 12)}</p>
                                                <Badge className={`${getStatusColor(order.status)} border px-1.5 py-0 text-[9px] font-bold uppercase`}>
                                                    {getStatusLabel(order.status)}
                                                </Badge>
                                            </div>
                                            <p className="text-xs font-black tabular-nums">{order.price} €</p>
                                        </div>
                                        
                                        <div className="space-y-3 mt-3">
                                            <div className="flex items-center gap-2 group/loc">
                                                <div className="h-5 w-5 bg-blue-500/10 text-blue-500 rounded-md flex items-center justify-center shrink-0">
                                                    <Navigation className="h-3 3" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-[9px] font-bold text-muted-foreground uppercase leading-none mb-1">Retrait</p>
                                                    <p className="text-[11px] font-medium truncate">{order.pickup_address}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 group/loc">
                                                <div className="h-5 w-5 bg-green-500/10 text-green-500 rounded-md flex items-center justify-center shrink-0">
                                                    <Package className="h-3 w-3" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-[9px] font-bold text-muted-foreground uppercase leading-none mb-1">Livraison</p>
                                                    <p className="text-[11px] font-medium truncate">{order.delivery_address || order.dropoff_address}</p>
                                                </div>
                                            </div>

                                            {order.status === 'in_progress' && order.picked_up_at && (
                                                <div className="flex items-center gap-2 mt-1">
                                                    <div className="h-4 w-4 bg-purple-500/10 text-purple-500 rounded flex items-center justify-center shrink-0">
                                                        <Clock className="h-2.5 w-2.5" />
                                                    </div>
                                                    <span className="text-[10px] font-bold text-purple-500 uppercase tracking-tighter">
                                                        Récupéré à {format(new Date(order.picked_up_at), "HH:mm")}
                                                    </span>
                                                </div>
                                            )}

                                            {order.driver_id && (
                                                <div className="mt-3 pt-3 border-t border-border/5 flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <div className="h-6 w-6 rounded-full bg-secondary flex items-center justify-center text-[10px] font-bold">
                                                            {order.driver_first_name?.[0] || 'DR'}
                                                        </div>
                                                        <span className="text-[10px] font-bold">{order.driver_first_name} {order.driver_last_name}</span>
                                                    </div>
                                                    
                                                    {order.driver_current_lat ? (
                                                        <div className="flex items-center gap-2 group/loc">
                                                            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                                                            <span className="text-[10px] font-black tabular-nums uppercase">SUIVI LIVE</span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-[9px] text-muted-foreground italic">Pas de GPS</span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                    <CardContent className="p-4 border-t border-border/10 bg-card/50">
                        <div className="flex items-center justify-between text-[10px] font-black uppercase text-muted-foreground tracking-widest">
                            <span className="flex items-center gap-1.5">
                                <Clock className="h-3 w-3" />
                                MAJ: {format(new Date(), "HH:mm:ss", { locale: fr })}
                            </span>
                            <span className="flex items-center gap-1.5">
                                <AlertCircle className="h-3 w-3" />
                                Latency: ~120ms
                            </span>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};
