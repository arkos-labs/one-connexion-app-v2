import { useState, useEffect, useRef } from "react";
import { Send, X, Headset, ShieldAlert, CheckCircle2 } from "lucide-react";
import { useAppStore } from "@/stores/useAppStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerClose } from "@/components/ui/drawer";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface ClientChatProps {
    isOpen: boolean;
    onClose: () => void;
}

// Suggestions pour aller vite (mais la saisie libre reste prioritaire)
const QUICK_REPLIES = [
    "J'ai un problème mécanique",
    "Client agressif",
    "Retard dû au trafic",
    "Je demande une annulation"
];

export const ClientChat = ({ isOpen, onClose }: ClientChatProps) => {
    const { messages, addMessage } = useAppStore();

    // État pour le texte écrit par le chauffeur
    const [inputText, setInputText] = useState("");

    const scrollRef = useRef<HTMLDivElement>(null);

    // Faire descendre l'ascenseur quand un message arrive
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, isOpen]);

    // FONCTION D'ENVOI DU TEXTE LIBRE
    const handleSend = () => {
        if (!inputText.trim()) return; // On n'envoie pas de vide

        // Ajoute le message au store (Driver -> Dispatch)
        addMessage(inputText, 'driver');

        // Vide le champ
        setInputText("");
    };

    const handleQuickReply = (text: string) => {
        addMessage(text, 'driver');
    };

    const formatTime = (isoString: string) => {
        return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DrawerContent className="h-[85vh] flex flex-col focus:outline-none bg-background">

                {/* HEADER */}
                <div className="flex items-center justify-between p-4 border-b bg-card shadow-sm z-10">
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <Avatar className="h-12 w-12 border-2 border-primary/20">
                                <AvatarFallback className="bg-zinc-800 text-white">
                                    <Headset className="h-6 w-6" />
                                </AvatarFallback>
                            </Avatar>
                            <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-background" />
                        </div>
                        <div>
                            <DrawerTitle className="text-lg font-bold flex items-center gap-2">
                                Régulation
                                <Badge variant="outline" className="text-[10px] h-5 border-blue-200 text-blue-700 bg-blue-50">SUPPORT</Badge>
                            </DrawerTitle>
                            <p className="text-xs text-muted-foreground">Temps de réponse estimé : &lt; 2 min</p>
                        </div>
                    </div>
                    <DrawerClose asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-secondary">
                            <X className="h-4 w-4" />
                        </Button>
                    </DrawerClose>
                </div>

                {/* ZONE DE LECTURE */}
                <ScrollArea className="flex-1 p-4 bg-secondary/5">
                    <div className="space-y-4 pb-4">

                        {/* Info Sécurité */}
                        <div className="flex justify-center mb-6">
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-50 text-yellow-800 rounded-lg border border-yellow-100 text-xs font-medium">
                                <ShieldAlert className="h-4 w-4" />
                                <span>Conversation surveillée par le superviseur.</span>
                            </div>
                        </div>

                        {messages.length === 0 && (
                            <div className="text-center text-muted-foreground mt-10 opacity-50">
                                <Headset className="h-12 w-12 mx-auto mb-2" />
                                <p className="text-sm">Décrivez votre problème à l'opérateur.</p>
                            </div>
                        )}

                        {messages.map((msg) => {
                            const isMe = msg.sender === 'driver';
                            return (
                                <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[85%] flex gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>

                                        {/* Bulle de Message */}
                                        <div
                                            className={`px-4 py-3 text-sm shadow-sm ${isMe
                                                    ? 'bg-blue-600 text-white rounded-2xl rounded-tr-sm' // Bleu pour le chauffeur
                                                    : 'bg-white dark:bg-zinc-800 border border-border rounded-2xl rounded-tl-sm' // Blanc pour Dispatch
                                                }`}
                                        >
                                            <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                                            <div className={`flex items-center gap-1 mt-1 text-[10px] opacity-70 ${isMe ? 'justify-end text-blue-100' : 'justify-start text-muted-foreground'}`}>
                                                <span>{formatTime(msg.timestamp)}</span>
                                                {isMe && <CheckCircle2 className="h-3 w-3" />}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        <div ref={scrollRef} />
                    </div>
                </ScrollArea>

                {/* ZONE DE SAISIE (FOOTER) */}
                <div className="p-4 border-t bg-background space-y-3 pb-8 md:pb-4">

                    {/* Suggestions (Optionnel) */}
                    <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                        {QUICK_REPLIES.map((reply) => (
                            <button
                                key={reply}
                                onClick={() => handleQuickReply(reply)}
                                className="whitespace-nowrap flex-shrink-0 px-3 py-1.5 rounded-full bg-secondary border text-[11px] font-medium hover:bg-secondary/80 transition-colors"
                            >
                                {reply}
                            </button>
                        ))}
                    </div>

                    {/* CHAMP DE TEXTE LIBRE */}
                    <div className="flex gap-2 items-end">
                        <Input
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            placeholder="Écrivez votre message..."
                            className="rounded-xl bg-secondary/30 border-transparent focus-visible:bg-background focus-visible:border-primary h-12 text-base"
                            // Permet d'envoyer avec la touche Entrée
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        />

                        <Button
                            onClick={handleSend}
                            size="icon"
                            className="rounded-xl h-12 w-12 shrink-0 bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-all"
                            disabled={!inputText.trim()} // Désactivé si vide
                        >
                            <Send className="h-5 w-5" />
                        </Button>
                    </div>
                </div>
            </DrawerContent>
        </Drawer>
    );
};
