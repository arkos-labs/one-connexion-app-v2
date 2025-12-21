# 👨‍✈️ GUIDE D'IMPLÉMENTATION : SÉLECTION DU CHAUFFEUR

Ce guide contient le code à copier dans votre projet **Site Web Admin** pour permettre la sélection de chauffeur.

## 1. Créer le composant `AssignDriverModal.tsx`

Créez ce fichier dans `src/components/admin/AssignDriverModal.tsx` (ou équivalent).

```tsx
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";
import { User, Car } from "lucide-react";

interface Driver {
  id: string;
  email: string;
  raw_user_meta_data?: {
    full_name?: string;
  };
}

interface AssignDriverModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string | null;
  onSuccess: () => void;
}

export function AssignDriverModal({ isOpen, onClose, orderId, onSuccess }: AssignDriverModalProps) {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(false);

  // 1. Charger la liste des chauffeurs (utilisateurs auth)
  useEffect(() => {
    if (isOpen) {
      fetchDrivers();
    }
  }, [isOpen]);

  const fetchDrivers = async () => {
    // Note: Pour lister les users, il faut idéalement utiliser une fonction RPC admin
    // Ou avoir une table publique 'profiles'.
    // ICI : Exemple simplifié si vous avez une table 'drivers' ou 'profiles'
    // Sinon, utilisez l'astuce de la fonction RPC 'get_all_drivers'
    
    // Exemple avec table profiles
    const { data } = await supabase.from('profiles').select('*').eq('role', 'driver');
    if (data) setDrivers(data);
  };

  // 2. Assigner le chauffeur via la fonction SQL sécurisée
  const handleAssign = async (driverId: string) => {
    if (!orderId) return;
    setLoading(true);

    try {
      const { error } = await supabase.rpc('assign_driver_to_order', {
        p_order_id: orderId,
        p_driver_id: driverId
      });

      if (error) throw error;
      
      onSuccess();
      onClose();
      alert("✅ Chauffeur assigné avec succès !");
    } catch (e) {
      console.error(e);
      alert("Erreur lors de l'assignation");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Choisir un chauffeur</DialogTitle>
        </DialogHeader>

        <div className="space-y-2 mt-4 max-h-[60vh] overflow-y-auto">
          {drivers.length === 0 && <p className="text-center text-gray-500">Chargement...</p>}
          
          {drivers.map(driver => (
            <div key={driver.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-2 rounded-full">
                  <Car className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">{driver.raw_user_meta_data?.full_name || driver.email}</p>
                  <p className="text-xs text-gray-500">Disponible</p>
                </div>
              </div>
              
              <Button 
                size="sm" 
                onClick={() => handleAssign(driver.id)}
                disabled={loading}
              >
                {loading ? '...' : 'Assigner'}
              </Button>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

## 2. Intégrer dans votre page Admin (`Dispatch.tsx` ou `AdminDashboard.tsx`)

```tsx
// ... imports
import { AssignDriverModal } from "./components/admin/AssignDriverModal";

export default function Dispatch() {
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  return (
    <div>
      {/* ... Votre liste de commandes ... */}
      
      {/* Exemple de bouton dans une liste de commandes */}
      <Button onClick={() => setSelectedOrderId(order.id)}>
          Choisir Chauffeur
      </Button>


      {/* La Modale (à mettre en bas du composant) */}
      <AssignDriverModal
        isOpen={!!selectedOrderId}
        onClose={() => setSelectedOrderId(null)}
        orderId={selectedOrderId}
        onSuccess={() => {
            // Rafraîchir la liste des commandes ici
            console.log("Rafraîchir !");
        }}
      />
    </div>
  )
}
```
