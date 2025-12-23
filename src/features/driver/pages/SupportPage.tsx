import { useState } from "react";
import {
    Mail,
    MessageSquarePlus,
    Search,
    HelpCircle,
    FileQuestion,
    Wallet,
    FileText,
    AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { SupportTicketDrawer } from "../components/SupportTicketDrawer";

export const SupportPage = () => {
    const [isTicketOpen, setIsTicketOpen] = useState(false);

    return (
        <div className="p-6 max-w-4xl mx-auto pb-24 animate-in fade-in duration-500">

            {/* En-tête */}
            <div className="text-center space-y-4 py-8 mb-4">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <HelpCircle className="h-8 w-8 text-primary" />
                </div>
                <h1 className="text-3xl font-bold tracking-tight">Centre d'Aide</h1>
                <div className="relative max-w-md mx-auto mt-6">
                    <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                    <Input className="pl-10 h-12 bg-background shadow-sm" placeholder="Rechercher une solution..." />
                </div>
            </div>

            {/* --- CARTES D'ACTIONS (2 Cartes) --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10 max-w-2xl mx-auto">

                {/* 1. CARTE TICKET */}
                <Card
                    className="text-center hover:border-blue-500/50 hover:bg-blue-50/10 transition-all cursor-pointer group border-l-4 border-l-transparent hover:border-l-blue-500 shadow-sm"
                    onClick={() => setIsTicketOpen(true)}
                >
                    <CardContent className="pt-6 flex flex-col items-center gap-3">
                        <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 group-hover:scale-110 transition-transform">
                            <MessageSquarePlus className="h-6 w-6" />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg">Support Chauffeur</h3>
                            <p className="text-xs text-muted-foreground">Problème technique ou compte</p>
                        </div>
                        <Button variant="outline" size="sm" className="w-full mt-2 border-blue-200 text-blue-700 hover:bg-blue-50">
                            Ouvrir un ticket
                        </Button>
                    </CardContent>
                </Card>

                {/* 2. CARTE EMAIL */}
                <Card className="text-center hover:border-purple-500/50 transition-all cursor-pointer group border-l-4 border-l-transparent hover:border-l-purple-500 shadow-sm">
                    <CardContent className="pt-6 flex flex-col items-center gap-3">
                        <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 group-hover:scale-110 transition-transform">
                            <Mail className="h-6 w-6" />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg">Administratif</h3>
                            <p className="text-xs text-muted-foreground">Documents & Paie</p>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            className="w-full mt-2"
                            onClick={() => window.location.href = "mailto:support@oneconnexion.com"}
                        >
                            Nous écrire
                        </Button>
                    </CardContent>
                </Card>
            </div>

            {/* --- FAQ ENRICHIE (5 Questions) --- */}
            <div className="space-y-6">
                <h2 className="text-xl font-bold flex items-center gap-2 px-1">
                    <FileQuestion className="h-5 w-5 text-primary" /> Questions Fréquentes
                </h2>

                <Accordion type="single" collapsible className="w-full bg-card rounded-xl border shadow-sm px-2">

                    {/* Question 1 : Paiement */}
                    <AccordionItem value="item-1" className="border-b px-2">
                        <AccordionTrigger className="hover:no-underline py-4 font-medium flex gap-3 text-left">
                            <Wallet className="h-4 w-4 text-muted-foreground shrink-0" />
                            Quand reçois-je mes virements ?
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground pb-4 pl-9 border-l-2 border-primary/20 ml-2">
                            Les virements sont effectués <strong>une fois par mois</strong>, généralement entre le 1er et le 5 du mois suivant. Le délai d'affichage sur votre compte dépend ensuite de votre banque (24 à 48h).
                        </AccordionContent>
                    </AccordionItem>

                    {/* Question 2 : RIB */}
                    <AccordionItem value="item-2" className="border-b px-2">
                        <AccordionTrigger className="hover:no-underline py-4 font-medium flex gap-3 text-left">
                            <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                            Comment changer mon RIB ?
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground pb-4 pl-9 border-l-2 border-primary/20 ml-2">
                            Pour des raisons de sécurité, le changement de RIB ne se fait pas directement dans l'application. Veuillez envoyer votre nouveau RIB par email au service administratif ou ouvrir un ticket "Compte".
                        </AccordionContent>
                    </AccordionItem>

                    {/* Question 3 : Calcul des gains */}
                    <AccordionItem value="item-3" className="border-b px-2">
                        <AccordionTrigger className="hover:no-underline py-4 font-medium flex gap-3 text-left">
                            <Wallet className="h-4 w-4 text-muted-foreground shrink-0" />
                            Comment sont calculés mes gains ?
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground pb-4 pl-9 border-l-2 border-primary/20 ml-2">
                            Le prix de chaque course est fixe et affiché avant acceptation. Ce montant est <strong>net pour vous</strong> (commission déjà déduite). En cas d'attente prolongée chez le client (&gt; 10 min), un supplément peut être appliqué automatiquement.
                        </AccordionContent>
                    </AccordionItem>

                    {/* Question 4 : Objet perdu (MODIFIÉE) */}
                    <AccordionItem value="item-4" className="border-b px-2">
                        <AccordionTrigger className="hover:no-underline py-4 font-medium flex gap-3 text-left">
                            <AlertTriangle className="h-4 w-4 text-muted-foreground shrink-0" />
                            Un client a oublié un objet, que faire ?
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground pb-4 pl-9 border-l-2 border-primary/20 ml-2">
                            Signalez l'objet immédiatement via un Ticket Support. <strong>Vous devez ensuite le déposer au siège de l'entreprise sous 24h.</strong> Ne tentez pas de recontacter le client directement pour des raisons de confidentialité.
                        </AccordionContent>
                    </AccordionItem>

                    {/* Question 5 : Documents */}
                    <AccordionItem value="item-5" className="border-b-0 px-2">
                        <AccordionTrigger className="hover:no-underline py-4 font-medium flex gap-3 text-left">
                            <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                            Quels documents doivent être à jour ?
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground pb-4 pl-9 border-l-2 border-primary/20 ml-2">
                            Vous devez maintenir valides : votre Permis de conduire, votre Carte VTC (recto-verso), l'Assurance RC Pro et l'Assurance/Carte Verte du véhicule. Vous recevrez une notification 30 jours avant chaque expiration.
                        </AccordionContent>
                    </AccordionItem>

                </Accordion>
            </div>

            {/* Drawer Ticket */}
            <SupportTicketDrawer
                isOpen={isTicketOpen}
                onClose={() => setIsTicketOpen(false)}
            />

        </div>
    );
};
