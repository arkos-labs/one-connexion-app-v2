import {
    Users,
    Car,
    Map as MapIcon,
    TrendingUp,
    Activity,
    ArrowUpRight,
    Clock,
    ShieldCheck
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';

const data = [
    { name: '08:00', total: 40 },
    { name: '10:00', total: 70 },
    { name: '12:00', total: 90 },
    { name: '14:00', total: 60 },
    { name: '16:00', total: 110 },
    { name: '18:00', total: 150 },
    { name: '20:00', total: 100 },
];

export const DashboardHome = () => {
    return (
        <div className="p-6 space-y-8 bg-background/50 min-h-full">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-black tracking-tighter">Command Center</h1>
                <p className="text-muted-foreground">Vue d'ensemble de l'activité en temps réel.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-card/40 border-border/10 backdrop-blur-sm">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Courses Actives</p>
                                <h3 className="text-2xl font-black mt-1">24</h3>
                            </div>
                            <div className="p-2 bg-primary/10 text-primary rounded-xl">
                                <Activity className="h-5 w-5" />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center gap-1 text-xs text-green-500 font-bold">
                            <ArrowUpRight className="h-3 w-3" /> +12% vs hier
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-card/40 border-border/10 backdrop-blur-sm">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Chauffeurs Online</p>
                                <h3 className="text-2xl font-black mt-1">18</h3>
                            </div>
                            <div className="p-2 bg-green-500/10 text-green-500 rounded-xl">
                                <Car className="h-5 w-5" />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center gap-1 text-xs text-muted-foreground">
                            85% de la flotte active
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-card/40 border-border/10 backdrop-blur-sm">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">CA Journée</p>
                                <h3 className="text-2xl font-black mt-1">1,240 €</h3>
                            </div>
                            <div className="p-2 bg-blue-500/10 text-blue-500 rounded-xl">
                                <TrendingUp className="h-5 w-5" />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center gap-1 text-xs text-green-500 font-bold">
                            <ArrowUpRight className="h-3 w-3" /> +5% vs moyenne
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-card/40 border-border/10 backdrop-blur-sm">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Satisfaction</p>
                                <h3 className="text-2xl font-black mt-1">4.92</h3>
                            </div>
                            <div className="p-2 bg-yellow-500/10 text-yellow-500 rounded-xl">
                                <ShieldCheck className="h-5 w-5" />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center gap-1 text-xs text-muted-foreground font-medium">
                            Basé sur 120 avis
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Chart */}
                <Card className="lg:col-span-2 bg-card/40 border-border/10 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                            <Activity className="h-4 w-4" /> Volume des courses (24h)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] w-full mt-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={data}>
                                    <defs>
                                        <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.3} />
                                    <XAxis
                                        dataKey="name"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'hsl(var(--background))',
                                            borderColor: 'hsl(var(--border))',
                                            borderRadius: '12px',
                                            fontSize: '12px'
                                        }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="total"
                                        stroke="hsl(var(--primary))"
                                        strokeWidth={4}
                                        fillOpacity={1}
                                        fill="url(#colorTotal)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Live Feed */}
                <Card className="bg-card/40 border-border/10 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                            <Clock className="h-4 w-4" /> Activité Récente
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="flex items-center gap-3 p-3 rounded-xl hover:bg-secondary/30 transition-colors border border-transparent hover:border-border/10">
                                <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center text-[10px] font-bold">
                                    {i}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-bold truncate">Course acceptée #82{i}</p>
                                    <p className="text-[10px] text-muted-foreground">Il y a {i * 2} min • Chauffeur ID: 22{i}</p>
                                </div>
                                <Badge variant="outline" className="text-[9px] h-5 bg-green-500/5 text-green-500 border-green-500/20">
                                    OK
                                </Badge>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

const Badge = ({ children, variant, className }: any) => (
    <span className={`px-2 py-0.5 rounded-full font-bold ${className}`}>
        {children}
    </span>
);
