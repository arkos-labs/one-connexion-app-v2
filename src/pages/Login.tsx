import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff, Lock, Mail, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAppStore } from "@/stores/useAppStore";

const Login = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const { setUser, setSplashComplete } = useAppStore();

    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        email: "driver@one-connexion.com", // Pré-rempli pour la démo
        password: ""
    });

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // Simulation d'appel API
        setTimeout(() => {
            setIsLoading(false);

            if (formData.password.length < 4) {
                toast({
                    variant: "destructive",
                    title: "Erreur de connexion",
                    description: "Le mot de passe est trop court.",
                });
                return;
            }

            // Succès : On met à jour le Store
            setUser({
                id: "driver-01",
                email: formData.email,
                fullName: "Thomas Anderson",
                role: "driver",
                avatarUrl: "https://github.com/shadcn.png"
            });

            // On s'assure que le splash screen ne bloque pas
            setSplashComplete(true);

            toast({
                title: "Connexion réussie",
                description: "Bienvenue sur le réseau One Connexion.",
                className: "bg-green-600 text-white border-none"
            });

            navigate("/driver");
        }, 1500);
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-background relative overflow-hidden">
            {/* Background Animé (Abstrait) */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] rounded-full bg-blue-500/10 blur-[100px] animate-pulse" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-purple-500/10 blur-[100px] animate-pulse" style={{ animationDelay: "2s" }} />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="z-10 w-full max-w-md px-4"
            >
                <div className="mb-8 text-center">
                    <h1 className="text-4xl font-black tracking-tighter bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        ONE CONNEXION
                    </h1>
                    <p className="text-muted-foreground mt-2">Application Chauffeur v2.0</p>
                </div>

                <Card className="border-border/50 bg-card/50 backdrop-blur-xl shadow-2xl">
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-2xl font-bold text-center">Identifiez-vous</CardTitle>
                        <CardDescription className="text-center">
                            Entrez vos identifiants pour accéder à la flotte
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleLogin} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email Professionnel</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="nom@exemple.com"
                                        className="pl-9 bg-background/50"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password">Mot de passe</Label>
                                    <a href="#" className="text-xs text-primary hover:underline">Oublié ?</a>
                                </div>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        className="pl-9 bg-background/50 pr-9"
                                        placeholder="••••••••"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>

                            <Button
                                type="submit"
                                className="w-full h-11 text-base font-medium shadow-lg hover:shadow-xl transition-all mt-4 bg-gradient-to-r from-blue-600 to-blue-700"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Connexion...
                                    </>
                                ) : (
                                    <>
                                        Se connecter <ChevronRight className="ml-2 h-4 w-4" />
                                    </>
                                )}
                            </Button>
                        </form>

                        <div className="mt-6 text-center text-xs text-muted-foreground">
                            <p>En vous connectant, vous acceptez nos</p>
                            <div className="flex justify-center gap-2 mt-1">
                                <a href="#" className="underline hover:text-primary">Conditions Générales</a>
                                <span>•</span>
                                <a href="#" className="underline hover:text-primary">Politique de Confidentialité</a>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
};

export default Login;
