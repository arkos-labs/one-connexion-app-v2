import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, Phone, User, MessageSquare, X, Headset } from "lucide-react";
import { useState } from "react";
import { Order } from "@/types";

interface ClientChatProps {
    isOpen: boolean;
    onClose: () => void;
    order: Order | null;
}

export const ClientChat = ({ isOpen, onClose, order }: ClientChatProps) => {
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([
        { id: 1, text: "Bonjour, j'arrive dans 5 minutes.", sender: 'driver', time: '12:30' },
        { id: 2, text: "D'accord, je vous attends devant.", sender: 'client', time: '12:31' },
    ]);

    const handleSend = () => {
        if (!message.trim()) return;
        setMessages([...messages, {
            id: Date.now(),
            text: message,
            sender: 'driver',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
        setMessage("");
    };

    if (!order) return null;

    return (
        <Sheet open={isOpen} onOpenChange={onClose}>
            <SheetContent side="bottom" className="h-[80vh] sm:h-[600px] p-0 rounded-t-3xl flex flex-col bg-background/95 backdrop-blur-xl border-t border-border/50">

                {/* HEADER */}
                <div className="p-4 border-b border-border/50 flex items-center justify-between shrink-0 glass">
                    <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 border border-border">
                            <AvatarImage src="https://github.com/shadcn.png" />
                            <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
                        </Avatar>
                        <div>
                            <h3 className="font-bold text-sm">{order.clientName}</h3>
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> En ligne
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-1">
                        {/* Redirection vers le Dispatch ici aussi */}
                        <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full text-destructive hover:bg-destructive/10" onClick={() => window.open(`tel:+33100000000`)}>
                            <Headset className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full" onClick={onClose}>
                            <X className="h-5 w-5" />
                        </Button>
                    </div>
                </div>

                {/* MESSAGES */}
                <ScrollArea className="flex-1 p-4 bg-secondary/20">
                    <div className="space-y-4">
                        {messages.map((msg) => (
                            <div key={msg.id} className={`flex ${msg.sender === 'driver' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] rounded-2xl p-3 shadow-sm ${msg.sender === 'driver'
                                        ? 'bg-primary text-primary-foreground rounded-br-none'
                                        : 'bg-card border border-border rounded-bl-none'
                                    }`}>
                                    <p className="text-sm">{msg.text}</p>
                                    <span className="text-[10px] opacity-70 mt-1 block text-right">{msg.time}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </ScrollArea>

                {/* FOOTER INPUT */}
                <div className="p-4 border-t border-border/50 bg-background pb-8">
                    {/* Quick Replies */}
                    <div className="flex gap-2 mb-3 overflow-x-auto pb-2 scrollbar-none">
                        {["J'arrive", "Je suis là", "Ok, merci"].map(text => (
                            <button
                                key={text}
                                onClick={() => setMessage(text)}
                                className="px-3 py-1 rounded-full bg-secondary text-xs font-medium whitespace-nowrap hover:bg-secondary/80 transition-colors"
                            >
                                {text}
                            </button>
                        ))}
                    </div>

                    <form
                        onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                        className="flex gap-2"
                    >
                        <Input
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Écrivez un message..."
                            className="rounded-full bg-secondary/50 border-transparent focus:border-primary focus:bg-background transition-all"
                        />
                        <Button type="submit" size="icon" className="rounded-full h-10 w-10 shrink-0">
                            <Send className="h-4 w-4" />
                        </Button>
                    </form>
                </div>

            </SheetContent>
        </Sheet>
    );
};
