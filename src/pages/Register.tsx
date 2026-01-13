import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAppStore } from "@/stores/useAppStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Loader2,
    User,
    Mail,
    Lock,
    Bike,
    Car,
    Zap,
    ChevronRight,
    ArrowLeft,
    Eye,
    EyeOff
} from "lucide-react";
import { toast } from "sonner";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const Register = () => {
    const navigate = useNavigate();
    const { signUp, isLoading } = useAppStore();

    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        password: "",
        vehicleType: "car" as "car" | "bike" | "scooter"
    });

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.password.length < 6) {
            toast.error("Mot de passe trop court", {
                description: "Le mot de passe doit contenir au moins 6 caractères."
            });
            return;
        }

        const result = await signUp({
            email: formData.email,
            password: formData.password,
            fullName: formData.fullName,
            vehicleType: formData.vehicleType
        });

        if (result.success) {
            toast.success("Bienvenue dans l'équipe !", {
                description: "Votre compte a été créé avec succès."
            });
            navigate("/driver");
        } else {
            toast.error("Échec de l'inscription", {
                description: result.error || "Une erreur est survenue lors de la création de votre compte."
            });
        }
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
            <div className="relative z-10 w-full max-w-md mx-4 my-8">

                {/* Card avec glassmorphism */}
                <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-3xl shadow-2xl p-8 sm:p-10">

                    {/* Bouton retour */}
                    <Link
                        to="/login"
                        className="inline-flex items-center text-sm font-medium text-slate-400 hover:text-yellow-500 transition-colors mb-6 group"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
                        Retour à la connexion
                    </Link>

                    {/* Titre */}
                    <div className="mb-8">
                        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                            Devenir Partenaire
                        </h1>
                        <p className="text-slate-400 text-sm">
                            Remplissez vos informations pour commencer à livrer.
                        </p>
                    </div>

                    {/* Formulaire */}
                    <form onSubmit={handleRegister} className="space-y-5">

                        {/* Nom complet */}
                        <div className="space-y-2">
                            <Label htmlFor="fullName" className="text-slate-300 text-sm font-medium">
                                Nom complet
                            </Label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <User className="h-5 w-5 text-slate-500 group-focus-within:text-yellow-500 transition-colors" />
                                </div>
                                <Input
                                    id="fullName"
                                    placeholder="Jean Dupont"
                                    className="pl-12 h-14 bg-slate-800/50 border-2 border-slate-700/50 text-white placeholder:text-slate-500 focus:border-yellow-500/50 focus:ring-2 focus:ring-yellow-500/20 rounded-2xl transition-all"
                                    value={formData.fullName}
                                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

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
                                    placeholder="jean.dupont@exemple.fr"
                                    className="pl-12 h-14 bg-slate-800/50 border-2 border-slate-700/50 text-white placeholder:text-slate-500 focus:border-yellow-500/50 focus:ring-2 focus:ring-yellow-500/20 rounded-2xl transition-all"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        {/* Mot de passe */}
                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-slate-300 text-sm font-medium">
                                Mot de passe
                            </Label>
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

                        {/* Sélection de véhicule */}
                        <div className="space-y-3 pt-2">
                            <RadioGroup
                                defaultValue="car"
                                className="grid grid-cols-3 gap-3"
                                onValueChange={(val) => setFormData({ ...formData, vehicleType: val as any })}
                            >
                                {/* Option Vélo */}
                                <div>
                                    <RadioGroupItem value="bike" id="bike" className="peer sr-only" />
                                    <Label
                                        htmlFor="bike"
                                        className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-slate-700/50 bg-slate-800/30 p-4 hover:bg-slate-800/50 hover:border-slate-600 peer-data-[state=checked]:border-yellow-500 peer-data-[state=checked]:bg-yellow-500/10 cursor-pointer transition-all h-full group"
                                    >
                                        <div className="p-2.5 rounded-xl bg-slate-700/50 group-hover:bg-slate-700 peer-data-[state=checked]:bg-yellow-500/20 text-slate-300 peer-data-[state=checked]:text-yellow-500 transition-colors">
                                            <Bike className="h-6 w-6" />
                                        </div>
                                        <span className="text-xs font-medium text-slate-300 peer-data-[state=checked]:text-yellow-500">Vélo</span>
                                    </Label>
                                </div>

                                {/* Option Scooter */}
                                <div>
                                    <RadioGroupItem value="scooter" id="scooter" className="peer sr-only" />
                                    <Label
                                        htmlFor="scooter"
                                        className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-slate-700/50 bg-slate-800/30 p-4 hover:bg-slate-800/50 hover:border-slate-600 peer-data-[state=checked]:border-yellow-500 peer-data-[state=checked]:bg-yellow-500/10 cursor-pointer transition-all h-full group"
                                    >
                                        <div className="p-2.5 rounded-xl bg-slate-700/50 group-hover:bg-slate-700 peer-data-[state=checked]:bg-yellow-500/20 text-slate-300 peer-data-[state=checked]:text-yellow-500 transition-colors">
                                            <Zap className="h-6 w-6" />
                                        </div>
                                        <span className="text-xs font-medium text-slate-300 peer-data-[state=checked]:text-yellow-500">Scooter</span>
                                    </Label>
                                </div>

                                {/* Option Voiture */}
                                <div>
                                    <RadioGroupItem value="car" id="car" className="peer sr-only" />
                                    <Label
                                        htmlFor="car"
                                        className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-slate-700/50 bg-slate-800/30 p-4 hover:bg-slate-800/50 hover:border-slate-600 peer-data-[state=checked]:border-yellow-500 peer-data-[state=checked]:bg-yellow-500/10 cursor-pointer transition-all h-full group"
                                    >
                                        <div className="p-2.5 rounded-xl bg-slate-700/50 group-hover:bg-slate-700 peer-data-[state=checked]:bg-yellow-500/20 text-slate-300 peer-data-[state=checked]:text-yellow-500 transition-colors">
                                            <Car className="h-6 w-6" />
                                        </div>
                                        <span className="text-xs font-medium text-slate-300 peer-data-[state=checked]:text-yellow-500">Voiture</span>
                                    </Label>
                                </div>
                            </RadioGroup>
                        </div>

                        {/* Bouton de création de compte */}
                        <div className="pt-4">
                            <Button
                                type="submit"
                                className="w-full h-14 text-base font-semibold bg-gradient-to-r from-yellow-500 via-yellow-600 to-yellow-500 hover:from-yellow-400 hover:via-yellow-500 hover:to-yellow-400 text-slate-900 shadow-lg shadow-yellow-500/30 rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98] border-0"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                        Création en cours...
                                    </>
                                ) : (
                                    <>
                                        Créer mon compte
                                        <ChevronRight className="ml-2 h-5 w-5" />
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Register;
