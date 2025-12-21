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
        <div className="min-h-screen w-full flex bg-background">
            {/* CÔTÉ GAUCHE : Branding & Photo (Desktop) */}
            <div className="hidden lg:flex w-1/2 bg-zinc-900 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/30 via-transparent to-purple-600/30 z-10" />
                <img
                    src="/assets/images/driver_register.png"
                    alt="Devenir coursier"
                    className="w-full h-full object-cover opacity-70 animate-pulse-slow"
                />
                <div className="absolute inset-0 bg-black/20 z-10" />

                <div className="absolute bottom-12 left-12 z-20 space-y-6">
                    <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 max-w-md">
                        <h2 className="text-4xl font-bold text-white mb-4">Rejoignez le Futur de la Livraison</h2>
                        <ul className="space-y-3 text-zinc-100">
                            <li className="flex items-center gap-3">
                                <div className="h-2 w-2 rounded-full bg-blue-400" />
                                <span>Gagnez jusqu'à 25€ / heure</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <div className="h-2 w-2 rounded-full bg-blue-400" />
                                <span>Liberté totale d'horaires</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <div className="h-2 w-2 rounded-full bg-blue-400" />
                                <span>Support technique 24/7</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* CÔTÉ DROIT : Formulaire */}
            <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12">
                <div className="w-full max-w-md space-y-8">

                    {/* Header */}
                    <div className="space-y-2">
                        <Link
                            to="/login"
                            className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors mb-4 group"
                        >
                            <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
                            Retour à la connexion
                        </Link>
                        <h1 className="text-3xl font-bold tracking-tight">Devenir Partenaire</h1>
                        <p className="text-muted-foreground">Remplissez vos informations pour commencer à livrer.</p>
                    </div>

                    <form onSubmit={handleRegister} className="space-y-5">
                        {/* Nom Complet */}
                        <div className="space-y-2">
                            <Label htmlFor="fullName">Nom complet</Label>
                            <div className="relative">
                                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="fullName"
                                    placeholder="Jean Dupont"
                                    className="pl-10 h-12 bg-secondary/30"
                                    value={formData.fullName}
                                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div className="space-y-2">
                            <Label htmlFor="email">Email professionnel</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="jean.dupont@exemple.fr"
                                    className="pl-10 h-12 bg-secondary/30"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        {/* Mot de passe */}
                        <div className="space-y-2">
                            <Label htmlFor="password">Mot de passe</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    className="pl-10 pr-10 h-12 bg-secondary/30"
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

                        {/* Type de Véhicule */}
                        <div className="space-y-3">
                            <Label>Type de véhicule</Label>
                            <RadioGroup
                                defaultValue="car"
                                className="grid grid-cols-3 gap-4"
                                onValueChange={(val) => setFormData({ ...formData, vehicleType: val as any })}
                            >
                                <div>
                                    <RadioGroupItem value="bike" id="bike" className="peer sr-only" />
                                    <Label
                                        htmlFor="bike"
                                        className="flex flex-col items-center justify-between rounded-xl border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer transition-all"
                                    >
                                        <Bike className="mb-2 h-6 w-6" />
                                        <span className="text-xs font-semibold">Vélo</span>
                                    </Label>
                                </div>
                                <div>
                                    <RadioGroupItem value="scooter" id="scooter" className="peer sr-only" />
                                    <Label
                                        htmlFor="scooter"
                                        className="flex flex-col items-center justify-between rounded-xl border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer transition-all"
                                    >
                                        <Zap className="mb-2 h-6 w-6" />
                                        <span className="text-xs font-semibold">Scooter</span>
                                    </Label>
                                </div>
                                <div>
                                    <RadioGroupItem value="car" id="car" className="peer sr-only" />
                                    <Label
                                        htmlFor="car"
                                        className="flex flex-col items-center justify-between rounded-xl border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer transition-all"
                                    >
                                        <Car className="mb-2 h-6 w-6" />
                                        <span className="text-xs font-semibold">Voiture</span>
                                    </Label>
                                </div>
                            </RadioGroup>
                        </div>

                        {/* Bouton Inscription */}
                        <Button
                            type="submit"
                            className="w-full h-12 text-base shadow-xl shadow-primary/20 mt-2 transition-all hover:scale-[1.02]"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    Création du compte...
                                </>
                            ) : (
                                <>
                                    Créer mon compte
                                    <ChevronRight className="ml-2 h-5 w-5" />
                                </>
                            )}
                        </Button>
                    </form>

                    {/* Footer Termes */}
                    <p className="text-center text-xs text-muted-foreground px-6">
                        En vous inscrivant, vous acceptez nos{" "}
                        <a href="#" className="underline hover:text-primary">Conditions Générales</a> et notre{" "}
                        <a href="#" className="underline hover:text-primary">Politique de Confidentialité</a>.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;
