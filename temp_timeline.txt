import { OrderEvent, ORDER_EVENT_LABELS, ORDER_EVENT_ICONS } from '@/types/order_events';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock } from 'lucide-react';

interface OrderTimelineProps {
    events: OrderEvent[];
    loading?: boolean;
}

export const OrderTimeline = ({ events, loading }: OrderTimelineProps) => {
    if (loading) {
        return (
            <Card className="p-6">
                <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            </Card>
        );
    }

    if (!events || events.length === 0) {
        return (
            <Card className="p-6">
                <p className="text-center text-muted-foreground py-8">
                    Aucun événement enregistré pour cette commande.
                </p>
            </Card>
        );
    }

    return (
        <Card className="p-6">
            <h3 className="text-lg font-semibold text-primary mb-6 flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Historique de la commande
            </h3>

            <div className="relative">
                {/* Ligne verticale */}
                <div className="absolute left-[15px] top-2 bottom-2 w-0.5 bg-border"></div>

                {/* Événements */}
                <div className="space-y-6">
                    {events.map((event, index) => (
                        <div key={event.id} className="relative pl-10">
                            {/* Point sur la timeline */}
                            <div className="absolute left-0 top-1 w-8 h-8 rounded-full bg-background border-2 border-primary flex items-center justify-center text-lg">
                                {ORDER_EVENT_ICONS[event.event_type] || '📌'}
                            </div>

                            {/* Contenu de l'événement */}
                            <div className="bg-muted/30 rounded-lg p-4 hover:bg-muted/50 transition-colors">
                                <div className="flex items-start justify-between gap-4 mb-2">
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-sm">
                                            {ORDER_EVENT_LABELS[event.event_type] || event.event_type}
                                        </h4>
                                        {event.description && (
                                            <p className="text-sm text-muted-foreground mt-1">
                                                {event.description}
                                            </p>
                                        )}
                                    </div>
                                    <Badge variant="outline" className="text-xs whitespace-nowrap">
                                        {new Date(event.created_at).toLocaleString('fr-FR', {
                                            day: '2-digit',
                                            month: 'short',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}
                                    </Badge>
                                </div>

                                {/* Métadonnées optionnelles */}
                                {event.metadata && Object.keys(event.metadata).length > 0 && (
                                    <div className="mt-2 pt-2 border-t border-border/50">
                                        <details className="text-xs text-muted-foreground">
                                            <summary className="cursor-pointer hover:text-foreground">
                                                Détails techniques
                                            </summary>
                                            <pre className="mt-2 p-2 bg-background rounded text-xs overflow-auto">
                                                {JSON.stringify(event.metadata, null, 2)}
                                            </pre>
                                        </details>
                                    </div>
                                )}

                                {/* Acteur */}
                                {event.actor_type && (
                                    <div className="mt-2 text-xs text-muted-foreground">
                                        Par: <span className="font-medium capitalize">{event.actor_type}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </Card>
    );
};
