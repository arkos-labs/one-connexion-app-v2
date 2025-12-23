import { supabase } from "@/lib/supabase";

export interface ChatMessage {
    id: string;
    thread_id: string;
    sender_type: 'driver' | 'admin' | 'dispatch'; // dispatch is alias for admin
    content: string;
    created_at: string;
    is_read: boolean;
}

export interface ChatThread {
    id: string;
    subject: string;
    status: 'open' | 'closed' | 'resolved';
    updated_at: string;
    unread_count?: number;
    last_message?: ChatMessage;
}

export const chatService = {
    /**
     * Récupère le fil de discussion actif du chauffeur avec le support
     * S'il n'existe pas, on pourra le créer à l'envoi du premier message
     */
    getActiveThread: async (driverId: string) => {
        const { data, error } = await supabase
            .from('threads')
            .select(`
                *,
                messages (
                    id,
                    content,
                    created_at,
                    sender_type,
                    is_read
                )
            `)
            .eq('driver_id', driverId) // Cette colonne doit être ajoutée en DB
            .eq('type', 'driver_support')
            .order('updated_at', { ascending: false })
            .limit(1)
            .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 = not found
            console.error("Error fetching thread:", error);
            throw error;
        }

        return data;
    },

    /**
     * Crée un nouveau fil de discussion
     */
    createThread: async (driverId: string, subject: string = "Support Chauffeur") => {
        // 1. Créer le thread
        const { data: thread, error } = await supabase
            .from('threads')
            .insert({
                driver_id: driverId,
                subject,
                type: 'driver_support',
                status: 'open'
            })
            .select()
            .single();

        if (error) throw error;
        return thread;
    },

    /**
     * Envoie un message dans un fil existant
     */
    sendMessage: async (threadId: string, driverId: string, content: string) => {
        const { data, error } = await supabase
            .from('messages')
            .insert({
                thread_id: threadId,
                driver_id: driverId,
                sender_type: 'driver',
                content,
                is_read: false
            })
            .select()
            .single();

        if (error) throw error;

        // Mettre à jour la date du thread
        await supabase
            .from('threads')
            .update({ updated_at: new Date().toISOString(), status: 'open' })
            .eq('id', threadId);

        return data;
    },

    /**
     * Marque les messages comme lus
     */
    markAsRead: async (threadId: string) => {
        await supabase
            .from('messages')
            .update({ is_read: true })
            .eq('thread_id', threadId)
            .eq('sender_type', 'admin'); // On marque comme lu ce qui vient de l'admin
    }
};
