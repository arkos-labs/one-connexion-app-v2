import { useState, useEffect, useRef } from "react";
import { Send, X, Headset, ShieldAlert, CheckCircle2, Check, Loader2 } from "lucide-react";
import { useAppStore } from "@/stores/useAppStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerClose } from "@/components/ui/drawer";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { chatService, ChatMessage, ChatThread } from "@/services/chatService";
import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";

interface ClientChatProps {
    isOpen: boolean;
    onClose: () => void;
}

const QUICK_REPLIES = [
    "J'ai un problème mécanique",
    "Client agressif",
    "Retard dû au trafic",
    "Je demande une annulation"
];

export const ClientChat = ({ isOpen, onClose }: ClientChatProps) => {
    const user = useAppStore((state) => state.user);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [currentThread, setCurrentThread] = useState<ChatThread | null>(null);
    const [inputText, setInputText] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const scrollRef = useRef<HTMLDivElement>(null);

    // Initialisation du thread et des messages
    useEffect(() => {
        if (isOpen && user?.id) {
            loadConversation();
        }
    }, [isOpen, user?.id]);

    // Scroll automatique
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, isOpen]);

    // Écoute temps réel
    useEffect(() => {
        if (!currentThread) return;

        const channel = supabase
            .channel(`thread-${currentThread.id}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'messages',
                filter: `thread_id=eq.${currentThread.id}`
            }, (payload) => {
                const newMsg = payload.new as ChatMessage;
                setMessages(prev => {
                    if (prev.some(m => m.id === newMsg.id)) return prev;
                    return [...prev, newMsg];
                });

                // Marquer comme lu si c'est un message admin
                if (newMsg.sender_type === 'admin') {
                    chatService.markAsRead(currentThread.id);
                }
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [currentThread]);

    const loadConversation = async () => {
        if (!user?.id) return;
        setIsLoading(true);
        try {
            let thread = await chatService.getActiveThread(user.id);
            // @ts-ignore - messages populated by query
            if (thread && thread.messages) {
                // @ts-ignore
                setMessages(thread.messages.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()));
                setCurrentThread(thread);
            }
        } catch (error) {
            console.error("Failed to load chat", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSend = async (text: string = inputText) => {
        if (!text.trim() || !user?.id) return;

        const msgContent = text.trim();
        setInputText(""); // Optimistic clear

        const tempId = 'temp-' + Date.now();
        // @ts-ignore
        const optimisticMsg: ChatMessage = {
            id: tempId,
            thread_id: currentThread?.id || 'temp-thread',
            driver_id: user.id,
            sender_type: 'driver',
            content: msgContent,
            is_read: false,
            created_at: new Date().toISOString()
        };

        setMessages(prev => [...prev, optimisticMsg]);

        try {
            let threadId = currentThread?.id;

            // Si pas de thread, on en crée un
            if (!threadId) {
                const newThread = await chatService.createThread(user.id);
                threadId = newThread.id;
                setCurrentThread(newThread);
            }

            const realMsg = await chatService.sendMessage(threadId!, user.id, msgContent);

            // Replace optimistic with real
            // @ts-ignore
            setMessages(prev => prev.map(m => m.id === tempId ? realMsg : m));

        } catch (error) {
            console.error("Failed to send message", error);
            toast({
                title: "Erreur",
                description: "Message non envoyé. Vérifiez votre connexion.",
                variant: "destructive"
            });
            setInputText(msgContent); // Restore text on error
            setMessages(prev => prev.filter(m => m.id !== tempId));
        }
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
                            <p className="text-xs text-muted-foreground">En ligne - Rép. &lt; 2 min</p>
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
                        <div className="flex justify-center mb-6">
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-50 text-yellow-800 rounded-lg border border-yellow-100 text-xs font-medium">
                                <ShieldAlert className="h-4 w-4" />
                                <span>Conversation sécurisée avec le dispatch.</span>
                            </div>
                        </div>

                        {messages.length === 0 && !isLoading && (
                            <div className="text-center text-muted-foreground mt-10 opacity-50">
                                <Headset className="h-12 w-12 mx-auto mb-2" />
                                <p className="text-sm">Une question ? Écrivez au support.</p>
                            </div>
                        )}

                        {messages.map((msg) => {
                            const isMe = msg.sender_type === 'driver';
                            return (
                                <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[85%] flex gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                                        <div
                                            className={`px-4 py-3 text-sm shadow-sm ${isMe
                                                ? 'bg-blue-600 text-white rounded-2xl rounded-tr-sm'
                                                : 'bg-white dark:bg-zinc-800 border border-border rounded-2xl rounded-tl-sm text-zinc-800 dark:text-zinc-100'
                                                }`}
                                        >
                                            <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                                            <div className={`flex items-center gap-1 mt-1 text-[10px] opacity-70 ${isMe ? 'justify-end text-blue-100' : 'justify-start text-muted-foreground'}`}>
                                                <span>{formatTime(msg.created_at)}</span>
                                                {isMe && (msg.is_read ? <CheckCircle2 className="h-3 w-3" /> : <Check className="h-3 w-3" />)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        <div ref={scrollRef} />
                    </div>
                </ScrollArea>

                {/* ZONE DE SAISIE */}
                <div className="p-4 border-t bg-background space-y-3 pb-8 md:pb-4">
                    <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                        {QUICK_REPLIES.map((reply) => (
                            <button
                                key={reply}
                                onClick={() => handleSend(reply)}
                                className="whitespace-nowrap flex-shrink-0 px-3 py-1.5 rounded-full bg-secondary border text-[11px] font-medium hover:bg-secondary/80 transition-colors"
                            >
                                {reply}
                            </button>
                        ))}
                    </div>

                    <div className="flex gap-2 items-end">
                        <Input
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            placeholder="Écrivez votre message..."
                            className="rounded-xl bg-secondary/30 border-transparent focus-visible:bg-background focus-visible:border-primary h-12 text-base"
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        />

                        <Button
                            onClick={() => handleSend()}
                            size="icon"
                            className="rounded-xl h-12 w-12 shrink-0 bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-all"
                            disabled={!inputText.trim()}
                        >
                            <Send className="h-5 w-5" />
                        </Button>
                    </div>
                </div>
            </DrawerContent>
        </Drawer>
    );
};
