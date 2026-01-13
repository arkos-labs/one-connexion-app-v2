import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAppStore } from "@/stores/useAppStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Lock, Mail, Eye, EyeOff, ChevronRight } from "lucide-react";
import { toast } from "sonner";

const Login = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const [formData, setFormData] = useState({
        email: "coursier@demo.com",
        password: "password123"
    });

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const result = await useAppStore.getState().signIn(formData.email, formData.password);

        if (result.success) {
            toast.success("Bon retour parmi nous !", {
                description: "Connexion sécurisée établie."
            });
            navigate("/driver");
        } else {
            toast.error("Échec de connexion", {
                description: result.error || "Vérifiez vos identifiants."
            });
        }
        setIsLoading(false);
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">

            {/* Vagues dorées en arrière-plan */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <svg className="absolute bottom-0 right-0 w-full h-full opacity-20" viewBox="0 0 1440 800" preserveAspectRatio="none">
                    <path
                        fill="url(#gold-gradient)"
                        d="M0,400 C320,300 420,500 720,400 C1020,300 1120,500 1440,400 L1440,800 L0,800 Z"
                    />
                    <defs>
                        <linearGradient id="gold-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.3" />
                            <stop offset="100%" stopColor="#FFD700" stopOpacity="0.1" />
                        </linearGradient>
                    </defs>
                </svg>
                <svg className="absolute top-0 left-0 w-full h-full opacity-10" viewBox="0 0 1440 800" preserveAspectRatio="none">
                    <path
                        fill="url(#gold-gradient-2)"
                        d="M0,200 C360,100 540,300 900,200 C1260,100 1380,300 1440,200 L1440,0 L0,0 Z"
                    />
                    <defs>
                        <linearGradient id="gold-gradient-2" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#FFD700" stopOpacity="0.2" />
                            <stop offset="100%" stopColor="#D4AF37" stopOpacity="0.1" />
                        </linearGradient>
                    </defs>
                </svg>
            </div>

            {/* Container principal du formulaire */}
            <div className="relative z-10 w-full max-w-md mx-4">

                {/* Card avec glassmorphism */}
                <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-3xl shadow-2xl p-8 sm:p-12">

                    {/* Logo avec cadenas doré */}
                    <div className="flex justify-center mb-8">
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/20 to-yellow-600/20 rounded-full blur-xl"></div>
                            <div className="relative h-20 w-20 rounded-full bg-gradient-to-br from-slate-800 to-slate-900 border-2 border-yellow-500/30 flex items-center justify-center">
                                <Lock className="h-10 w-10 text-yellow-500" />
                            </div>
                        </div>
                    </div>

                    {/* Titre */}
                    <div className="text-center mb-8">
                        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                            Espace Coursier
                        </h1>
                        <p className="text-slate-400 text-sm">
                            Connectez-vous pour commencer votre service.
                        </p>
                    </div>

                    {/* Formulaire */}
                    <form onSubmit={handleLogin} className="space-y-6">

                        {/* Email professionnel */}
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-slate-300 text-sm font-medium">
                                Email professionnel
                            </Label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-slate-500 group-focus-within:text-yellow-500 transition-colors" />
                                </div>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="coursier@demo.com"
                                    className="pl-12 h-14 bg-slate-800/50 border-2 border-slate-700/50 text-white placeholder:text-slate-500 focus:border-yellow-500/50 focus:ring-2 focus:ring-yellow-500/20 rounded-2xl transition-all"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        {/* Mot de passe */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password" className="text-slate-300 text-sm font-medium">
                                    Mot de passe
                                </Label>
                                <a href="#" className="text-xs font-medium text-yellow-500 hover:text-yellow-400 transition-colors">
                                    Oublié ?
                                </a>
                            </div>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-slate-500 group-focus-within:text-yellow-500 transition-colors" />
                                </div>
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    className="pl-12 pr-12 h-14 bg-slate-800/50 border-2 border-slate-700/50 text-white placeholder:text-slate-500 focus:border-yellow-500/50 focus:ring-2 focus:ring-yellow-500/20 rounded-2xl transition-all"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-yellow-500 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>

                        {/* Bouton de connexion */}
                        <Button
                            type="submit"
                            className="w-full h-14 text-base font-semibold bg-gradient-to-r from-yellow-500 via-yellow-600 to-yellow-500 hover:from-yellow-400 hover:via-yellow-500 hover:to-yellow-400 text-slate-900 shadow-lg shadow-yellow-500/30 rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98] border-0"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    Connexion en cours...
                                </>
                            ) : (
                                <>
                                    Accéder à mon compte
                                    <ChevronRight className="ml-2 h-5 w-5" />
                                </>
                            )}
                        </Button>
                    </form>

                    {/* Footer - Devenir coursier */}
                    <div className="mt-8 text-center">
                        <p className="text-sm text-slate-400">
                            Pas encore partenaire ?{" "}
                            <Link
                                to="/register"
                                className="font-semibold text-yellow-500 hover:text-yellow-400 transition-colors"
                            >
                                Devenir coursier
                            </Link>
                        </p>
                    </div>

                    {/* Liens légaux */}
                    <div className="mt-6 flex items-center justify-center gap-4 text-xs text-slate-500">
                        <a href="#" className="hover:text-yellow-500 transition-colors">Conditions</a>
                        <span>•</span>
                        <a href="#" className="hover:text-yellow-500 transition-colors">Confidentialité</a>
                        <span>•</span>
                        <a href="#" className="hover:text-yellow-500 transition-colors">Aide</a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
