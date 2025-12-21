import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAppStore } from "@/stores/useAppStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Lock, Mail, Eye, EyeOff, ChevronRight, Zap } from "lucide-react";
import { toast } from "sonner";

const Login = () => {
    const navigate = useNavigate();
    const { setUser } = useAppStore(); // Assuming login action is effectively setUser based on store provided earlier or need to extract it

    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const [formData, setFormData] = useState({
        email: "coursier@demo.com", // Pré-rempli pour la démo
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
        <div className="min-h-screen w-full flex">

            {/* CÔTÉ GAUCHE : Image / Branding (Caché sur mobile) */}
            <div className="hidden lg:flex w-1/2 bg-zinc-900 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20 mix-blend-overlay z-10" />
                <img
                    src="https://images.unsplash.com/photo-1616401784845-18088ae9123c?q=80&w=1000&auto=format&fit=crop"
                    alt="Courier working"
                    className="w-full h-full object-cover opacity-60"
                />
                <div className="absolute bottom-10 left-10 z-20 text-white">
                    <h2 className="text-4xl font-bold mb-2">One Connexion</h2>
                    <p className="text-zinc-300 text-lg max-w-md">
                        Rejoignez l'élite des coursiers. Gérez vos livraisons, suivez vos revenus et profitez d'une liberté totale.
                    </p>
                </div>
            </div>

            {/* CÔTÉ DROIT : Formulaire */}
            <div className="flex-1 flex items-center justify-center p-8 bg-background">
                <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-right-8 duration-700">

                    {/* Header Mobile */}
                    <div className="text-center lg:text-left">
                        <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground mb-4 shadow-lg shadow-primary/30">
                            <Lock className="h-6 w-6" />
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight">Espace Coursier</h1>
                        <p className="text-muted-foreground mt-2">Connectez-vous pour commencer votre service.</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">

                        {/* Email */}
                        <div className="space-y-2">
                            <Label htmlFor="email">Email professionnel</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="nom@exemple.com"
                                    className="pl-10 h-11 bg-secondary/30"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        {/* Mot de passe */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password">Mot de passe</Label>
                                <a href="#" className="text-xs font-medium text-primary hover:underline">Oublié ?</a>
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    className="pl-10 pr-10 h-11 bg-secondary/30"
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

                        {/* Bouton Action */}
                        <div className="space-y-3">
                            <Button
                                type="submit"
                                className="w-full h-12 text-base shadow-lg shadow-primary/20 transition-all hover:scale-[1.01]"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                        Connexion...
                                    </>
                                ) : (
                                    <>
                                        Accéder à mon compte
                                        <ChevronRight className="ml-2 h-5 w-5" />
                                    </>
                                )}
                            </Button>

                            {/* BOUTON DÉMO / SANS AUTH */}
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setUser({
                                        id: "demo-id",
                                        email: "chauffeur@demo.com",
                                        fullName: "Chauffeur Démo",
                                        role: "driver"
                                    });
                                    toast.success("Mode Démo activé");
                                    navigate("/driver");
                                }}
                                className="w-full h-12 border-dashed border-2 hover:bg-secondary/50 text-muted-foreground font-bold"
                            >
                                <Zap className="mr-2 h-4 w-4 text-yellow-500" />
                                Accès Rapide (Mode Démo)
                            </Button>
                        </div>
                    </form>

                    {/* Footer Inscription */}
                    <div className="text-center pt-2">
                        <p className="text-sm text-muted-foreground">
                            Pas encore partenaire ?{" "}
                            <Link to="/register" className="font-semibold text-primary hover:underline">
                                Devenir coursier
                            </Link>
                        </p>
                    </div>

                    {/* Footer Légal */}
                    <div className="flex justify-center gap-6 pt-8 text-xs text-muted-foreground/50">
                        <a href="#" className="hover:text-muted-foreground">Conditions</a>
                        <a href="#" className="hover:text-muted-foreground">Confidentialité</a>
                        <a href="#" className="hover:text-muted-foreground">Aide</a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
