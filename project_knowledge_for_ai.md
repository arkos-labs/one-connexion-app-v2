# CONTEXTE PROJET : ONE CONNEXION (Loom Connect)

## 1. Stack Technique
- **Framework** : React 18 + Vite
- **Langage** : TypeScript
- **State Management** : Zustand (avec persistence)
- **UI/Styling** : Tailwind CSS, Shadcn/UI (Radix Primitives), Lucide React
- **Maps** : Leaflet / React-Leaflet
- **Animations** : Framer Motion
- **Backend/BaaS** : Supabase (Auth, Database, Realtime)

## 2. Structure des Dossiers Clés
- `src/features/driver` : Logique spécifique aux chauffeurs (Map, Home, Modals).
- `src/stores/useAppStore.ts` : Store principal (User, Orders, Driver Status, simulation).
- `src/hooks/useDriverPosition.ts` : Gestion GPS et simulation de trajet.
- `src/hooks/useDriverAlerts.ts` : Système sensoriel (Sons + Toasts).
- `src/services/supabaseQueries.ts` : Requêtes BDD.

## 3. Règles de Développement (Conventions)
- **Imports** : Utiliser les alias absolus `@/` (ex: `@/components/ui/button`).
- **Composants** : Petits, fonctionnels, typés via Interfaces.
- **Tailwind** : Utiliser les classes utilitaires pour tout le styling.
- **Zustand** : actions inclues dans le store, sélecteurs pour la performance.

## 4. Métier & Flux (État actuel)
- **Rôles** : Driver, Dispatcher, Admin.
- **Statuts Chauffeur** : `offline` | `online` (disponible) | `busy` (en course).
- **Cycle Commande** : 
  1. `pending` (En attente) -> Notification "Ding" + Toast.
  2. `accepted` (Acceptée) -> Phase d'approche (Pickup).
  3. `in_progress` (En cours) -> Le client est à bord.
  4. `completed` -> Paiement + Historique.

## 5. Fonctionnalités "Pro" Actives
- **Simulation** : `triggerNewOrder` génère des commandes fake autour de Paris.
- **Voyage** : `simulateTravel` déplace la voiture sur la carte (interpolation).
- **Sens** : Feedback sonore et visuel pour l'engagement utilisateur.
- **UI** : "Slide to Action" pour les interactions critiques.
