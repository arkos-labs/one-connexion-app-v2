import { useState, useEffect } from "react";
import { MapPin, Navigation, Phone, MessageSquare, Package, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { SlideToAction } from "./SlideToAction";
import { Order } from "@/types";

interface ActiveOrderCardProps {
  order: Order;
  onStatusChange: (orderId: string, status: 'in_progress' | 'completed') => void;
}

export const ActiveOrderCard = ({ order, onStatusChange }: ActiveOrderCardProps) => {
  const isPickupPhase = order.status === 'accepted';
  const isDeliveryPhase = order.status === 'in_progress';

  // Reset du slider à chaque changement d'étape
  const [key, setKey] = useState(0);
  useEffect(() => {
    setKey(prev => prev + 1);
  }, [order.status]);

  const handleSlideConfirm = () => {
    if (isPickupPhase) {
      onStatusChange(order.id, 'in_progress');
    } else if (isDeliveryPhase) {
      onStatusChange(order.id, 'completed');
    }
  };

  const currentStep = {
    title: isPickupPhase ? "Aller au Restaurant" : "Aller chez le Client",
    address: isPickupPhase ? order.pickupLocation.address : order.dropoffLocation.address,
    icon: isPickupPhase ? MapPin : Navigation,
    color: isPickupPhase ? "text-blue-500" : "text-green-500",
    badge: isPickupPhase ? "Retrait" : "Livraison",
    slideLabel: isPickupPhase ? "Glisser après Retrait" : "Glisser pour Terminer"
  };

  return (
    <Card className="fixed bottom-0 left-0 right-0 z-[9999] rounded-t-3xl border-t border-border/50 bg-background/95 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.3)] backdrop-blur-xl md:absolute md:bottom-4 md:left-4 md:right-4 md:m-0 md:rounded-3xl md:border md:w-auto">

      {/* Barre de Status (Header) */}
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <div className={`flex h-12 w-12 items-center justify-center rounded-full shadow-inner ${isPickupPhase ? 'bg-blue-100' : 'bg-green-100'}`}>
            <currentStep.icon className={`h-6 w-6 ${currentStep.color}`} />
          </div>
          <div className="flex flex-col">
            <h3 className="text-base font-bold text-foreground leading-tight">{currentStep.title}</h3>
            <p className="text-xs text-muted-foreground truncate max-w-[200px]">
              {currentStep.address}
            </p>
          </div>
        </div>
        <div className="text-right flex flex-col items-end">
          <span className="text-lg font-black text-primary tracking-tight">{order.price.toFixed(2)}€</span>
          <Badge variant={isPickupPhase ? "default" : "secondary"} className="text-[10px] px-2 py-0.5 h-5">
            {currentStep.badge}
          </Badge>
        </div>
      </div>

      <Separator className="bg-border/50" />

      <CardContent className="space-y-4 p-5">
        {/* Info Client Compacte */}
        <div className="flex items-center justify-between rounded-xl bg-secondary/40 p-3 border border-border/30">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-background font-bold text-muted-foreground shadow-sm border border-border/20">
              {order.clientName.charAt(0)}
            </div>
            <div>
              <p className="text-sm font-semibold">{order.clientName}</p>
              <div className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Premium</p>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button size="icon" variant="outline" className="h-9 w-9 rounded-full bg-background/50 hover:bg-background">
              <Phone className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="outline" className="h-9 w-9 rounded-full bg-background/50 hover:bg-background">
              <MessageSquare className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>

      {/* Footer avec Safe Area pour Mobile */}
      <CardFooter className="pb-8 pt-0 px-5 md:pb-5">
        <SlideToAction
          key={key}
          onConfirm={handleSlideConfirm}
          label={currentStep.slideLabel}
          isComplete={false}
          className="shadow-lg border-primary/20"
        />
      </CardFooter>
    </Card>
  );
};
