# 🚗 Système de Suivi en Temps Réel du Chauffeur

## 📋 Vue d'ensemble

Ce document explique comment le parcours du chauffeur est synchronisé en temps réel avec l'admin via Supabase Realtime.

## 🎯 Fonctionnalités implémentées

### 1. **Acceptation de la course** ✅
- **Action chauffeur** : Accepte une course
- **Mise à jour** : 
  - Statut → `driver_accepted`
  - Position GPS du chauffeur enregistrée
  - Timestamp d'acceptation
- **Admin voit** : Course acceptée + position initiale du chauffeur

### 2. **Récupération du colis** 📦
- **Action chauffeur** : Confirme le retrait (slide to confirm)
- **Mise à jour** :
  - Statut → `in_progress`
  - Position GPS au moment du retrait
  - Timestamp de récupération (`picked_up_at`)
- **Admin voit** : Colis récupéré + position du chauffeur

### 3. **Livraison** 🎯
- **Action chauffeur** : Finalise la livraison avec preuve (photo/signature)
- **Mise à jour** :
  - Statut → `delivered`
  - Position GPS de livraison
  - Timestamp de livraison
  - Preuve de livraison (photo ou signature)
- **Admin voit** : Livraison complétée + preuve + position finale

### 4. **Suivi continu pendant la course** 📍
- **Fréquence** : Toutes les 10 secondes
- **Données envoyées** :
  - Position GPS actuelle du chauffeur
  - Timestamp de mise à jour
- **Admin voit** : Position du chauffeur mise à jour en temps réel sur la carte

## 🔧 Architecture technique

### Services modifiés

#### `orderService.ts`
```typescript
// Nouvelle méthode pour mettre à jour avec géolocalisation
updateStatusWithLocation(
  orderId: string,
  status: string,
  driverLocation: { lat: number; lng: number },
  additionalData?: any
)
```

**Fonctionnalités** :
- ✅ Logs détaillés pour debugging
- ✅ Mise à jour de `driver_current_lat` et `driver_current_lng`
- ✅ Timestamps automatiques
- ✅ Gestion d'erreurs robuste

#### `orderSlice.ts`
Toutes les actions de commande ont été améliorées :

1. **`acceptOrder`**
   - Utilise `updateStatusWithLocation`
   - Enregistre la position d'acceptation
   - Log : `🚗 [OrderSlice] Acceptation de la commande`

2. **`updateOrderStatus`**
   - Détecte automatiquement si c'est une récupération
   - Ajoute `picked_up_at` pour le statut `in_progress`
   - Log : `📦 [OrderSlice] Colis récupéré`

3. **`completeOrder`**
   - Enregistre la position de livraison
   - Stocke la preuve (photo/signature)
   - Calcule les gains (40% du prix)
   - Log : `💰 [OrderSlice] Gains chauffeur: +X.XX€`

### Nouveaux hooks

#### `useDriverLocationSync`
**Rôle** : Synchronise automatiquement la position du chauffeur pendant une course active

**Comportement** :
- ⏱️ Mise à jour toutes les 10 secondes
- 🎯 Actif uniquement si `currentOrder` existe et `isOnDuty === true`
- 🔒 Évite les mises à jour trop fréquentes (throttling)
- 📡 Utilise `updateStatusWithLocation` sans changer le statut

**Logs** :
```
📍 [LocationSync] Synchronisation position chauffeur...
✅ [LocationSync] Position synchronisée avec succès
```

#### `useOrderProgressNotifications`
**Rôle** : Affiche des notifications au chauffeur lors des changements de statut

**Messages** :
- `accepted` → "✅ Course acceptée - En route vers le point de retrait"
- `in_progress` → "📦 Colis récupéré - En route vers la livraison"
- `completed` → "🎉 Livraison terminée avec succès"

## 📊 Flux de données

```
┌─────────────────┐
│  CHAUFFEUR APP  │
└────────┬────────┘
         │
         │ 1. Action (accepter/récupérer/livrer)
         ▼
┌─────────────────────────┐
│   orderSlice.ts         │
│   - acceptOrder()       │
│   - updateOrderStatus() │
│   - completeOrder()     │
└────────┬────────────────┘
         │
         │ 2. Appel service avec géolocalisation
         ▼
┌─────────────────────────────────┐
│   orderService.ts               │
│   - updateStatusWithLocation()  │
└────────┬────────────────────────┘
         │
         │ 3. Mise à jour Supabase
         ▼
┌─────────────────────────────────┐
│   SUPABASE DATABASE             │
│   Table: orders                 │
│   - status                      │
│   - driver_current_lat          │
│   - driver_current_lng          │
│   - picked_up_at                │
│   - delivered_at                │
│   - proof_type, proof_data      │
└────────┬────────────────────────┘
         │
         │ 4. Realtime notification
         ▼
┌─────────────────┐
│   ADMIN PANEL   │
│   (Web)         │
│   - Voit tout   │
│     en direct   │
└─────────────────┘
```

## 🔍 Colonnes de base de données requises

Pour que le système fonctionne, la table `orders` doit avoir ces colonnes :

```sql
-- Colonnes existantes
id
status
driver_id
pickup_address, pickup_lat, pickup_lng
delivery_address, delivery_lat, delivery_lng
price
created_at
updated_at

-- Nouvelles colonnes pour le tracking
driver_current_lat FLOAT          -- Position actuelle du chauffeur
driver_current_lng FLOAT          -- Position actuelle du chauffeur
accepted_at TIMESTAMP             -- Quand le chauffeur a accepté
picked_up_at TIMESTAMP            -- Quand le colis a été récupéré
delivered_at TIMESTAMP            -- Quand la livraison est terminée
proof_type VARCHAR                -- 'signature' ou 'photo'
proof_data TEXT                   -- Base64 de la preuve
last_location_update TIMESTAMP    -- Dernière sync de position
```

## 🎨 Logs de debugging

Le système génère des logs détaillés pour faciliter le debugging :

### OrderService
```
📡 [OrderService] Mise à jour commande abc123: { status: 'driver_accepted', ... }
✅ [OrderService] Commande abc123 mise à jour avec succès
📍 [OrderService] Mise à jour avec localisation pour abc123
🔔 [OrderService] Abonnement aux nouvelles commandes...
📥 [OrderService] Nouvelle commande reçue: { ... }
🔄 [OrderService] Commande mise à jour: { ... }
```

### OrderSlice
```
🚗 [OrderSlice] Acceptation de la commande abc123
✅ [OrderSlice] Commande acceptée, admin notifié en temps réel
📝 [OrderSlice] Mise à jour statut: in_progress -> in_progress
📦 [OrderSlice] Colis récupéré à 14:30:45
🎯 [OrderSlice] Finalisation de la commande abc123
💰 [OrderSlice] Gains chauffeur: +10.20€ (40% de 25.50€)
✅ [OrderSlice] Commande livrée avec succès, admin notifié
```

### LocationSync
```
📍 [LocationSync] Synchronisation position chauffeur...
✅ [LocationSync] Position synchronisée avec succès
```

## 🚀 Utilisation

### Côté Chauffeur
1. Le chauffeur accepte une course → Admin voit l'acceptation + position
2. Le chauffeur se déplace → Position mise à jour toutes les 10s
3. Le chauffeur récupère le colis → Admin voit la récupération + position
4. Le chauffeur se déplace vers la livraison → Position mise à jour toutes les 10s
5. Le chauffeur livre → Admin voit la livraison + preuve + position finale

### Côté Admin
L'admin doit s'abonner aux changements de la table `orders` via Supabase Realtime :

```typescript
supabase
  .channel('admin_orders')
  .on('postgres_changes', {
    event: 'UPDATE',
    schema: 'public',
    table: 'orders'
  }, (payload) => {
    // Mettre à jour l'interface admin
    const order = payload.new;
    console.log('Mise à jour reçue:', order);
    // Afficher sur la carte, mettre à jour le statut, etc.
  })
  .subscribe();
```

## ✅ Avantages

1. **Transparence totale** : L'admin voit tout en temps réel
2. **Traçabilité** : Chaque étape est horodatée et géolocalisée
3. **Preuve de livraison** : Photo ou signature stockée
4. **Debugging facile** : Logs détaillés à chaque étape
5. **Performance** : Throttling pour éviter les mises à jour excessives
6. **Robustesse** : Gestion d'erreurs complète

## 🔒 Sécurité

- ✅ Seules les commandes actives sont synchronisées
- ✅ Le chauffeur doit être `isOnDuty` pour que la sync fonctionne
- ✅ Les données de géolocalisation ne sont envoyées que pendant les courses
- ✅ Pas de stockage de l'historique complet des positions (privacy)

## 📱 Compatibilité

- ✅ Web (React)
- ✅ Mobile (Capacitor)
- ✅ Fonctionne en arrière-plan pendant une course active
