import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAppStore } from '@/stores/useAppStore';
import { toast } from '@/hooks/use-toast';

export const useMessageNotifications = () => {
    const user = useAppStore((state) => state.user);

    useEffect(() => {
        if (!user?.id) return;

        const channel = supabase
            .channel('driver_message_notifications')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                    filter: `driver_id=eq.${user.id}`,
                },
                (payload) => {
                    const newMessage = payload.new;
                    // Alert only if message is from admin
                    if (newMessage.sender_type === 'admin') {
                        // Play sound
                        try {
                            const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
                            audio.play().catch(e => console.error("Audio play failed", e));
                        } catch (e) {
                            console.error("Audio error", e);
                        }

                        // Show notification
                        toast({
                            title: "Nouveau message Support",
                            description: newMessage.content.substring(0, 50) + (newMessage.content.length > 50 ? '...' : ''),
                            duration: 5000,
                        });
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user?.id]);
};
