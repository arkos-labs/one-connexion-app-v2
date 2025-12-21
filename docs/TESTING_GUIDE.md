# 🧪 Guide de Test - Système de Tracking en Temps Réel

## 🎯 Objectif
Tester le parcours complet du chauffeur avec suivi en temps réel par l'admin :
1. **Acceptation** de la course
2. **Récupération** du colis
3. **Livraison** avec preuve

---

## 📋 Méthode 1 : Via la Console du Navigateur (Recommandé)

### Étape 1 : Ouvrir la Console
1. Lancez l'application chauffeur : `npm run dev`
2. Ouvrez la console du navigateur (F12)

### Étape 2 : Créer les Commandes de Test

```javascript
// Créer les 5 commandes de test d'un coup
await window.testOrders.createAll()

// OU créer une seule commande (index 0-4)
await window.testOrders.createOne(0)  // Commande 1
await window.testOrders.createOne(1)  // Commande 2
// etc.
```

### Étape 3 : Tester le Parcours

#### 3.1 Accepter une Course
1. Une notification apparaît avec la nouvelle commande
2. Cliquez sur **"Accepter"**
3. ✅ **L'admin voit** : Course acceptée + position du chauffeur

#### 3.2 Récupérer le Colis
1. Rapprochez-vous du point de retrait (ou activez le mode test avec l'icône cible 🎯)
2. Glissez le slider **"Confirmer le Retrait"**
3. ✅ **L'admin voit** : Colis récupéré + position du chauffeur + timestamp

#### 3.3 Livrer
1. Rapprochez-vous du point de livraison (ou mode test)
2. Glissez le slider **"Terminer la Course"**
3. Prenez une photo OU faites une signature
4. Confirmez
5. ✅ **L'admin voit** : Livraison complétée + preuve + position finale

### Étape 4 : Nettoyer les Tests

```javascript
// Supprimer toutes les commandes en attente
await window.testOrders.clear()
```

---

## 📋 Méthode 2 : Via SQL (Supabase Dashboard)

### Étape 1 : Ouvrir Supabase
1. Allez sur [Supabase Dashboard](https://supabase.com/dashboard)
2. Sélectionnez votre projet
3. Allez dans **SQL Editor**

### Étape 2 : Exécuter le Script
1. Ouvrez le fichier `docs/test_orders.sql`
2. Copiez tout le contenu
3. Collez dans l'éditeur SQL
4. Cliquez sur **"Run"**

### Étape 3 : Vérifier
```sql
SELECT 
    id,
    status,
    pickup_contact_name AS client,
    pickup_address AS depart,
    delivery_address AS arrivee,
    price AS "prix (€)"
FROM orders
WHERE status = 'pending_acceptance'
ORDER BY created_at DESC;
```

---

## 🔍 Vérification Côté Admin

### Ouvrir la Console Admin
```javascript
// S'abonner aux mises à jour en temps réel
const subscription = supabase
  .channel('admin_tracking')
  .on('postgres_changes', {
    event: 'UPDATE',
    schema: 'public',
    table: 'orders'
  }, (payload) => {
    console.log('📡 Mise à jour reçue:', payload.new);
    console.log('Statut:', payload.new.status);
    console.log('Position chauffeur:', {
      lat: payload.new.driver_current_lat,
      lng: payload.new.driver_current_lng
    });
  })
  .subscribe();
```

### Données Visibles par l'Admin

#### Lors de l'Acceptation
```json
{
  "status": "driver_accepted",
  "driver_id": "xxx",
  "driver_current_lat": 48.8566,
  "driver_current_lng": 2.3522,
  "accepted_at": "2025-12-21T13:20:00Z"
}
```

#### Lors de la Récupération
```json
{
  "status": "in_progress",
  "driver_current_lat": 48.8566,
  "driver_current_lng": 2.3522,
  "picked_up_at": "2025-12-21T13:25:00Z"
}
```

#### Lors de la Livraison
```json
{
  "status": "delivered",
  "driver_current_lat": 48.8698,
  "driver_current_lng": 2.3078,
  "delivered_at": "2025-12-21T13:35:00Z",
  "proof_type": "photo",
  "proof_data": "data:image/jpeg;base64,..."
}
```

---

## 📊 Les 5 Commandes de Test

| # | Client | Départ | Arrivée | Prix |
|---|--------|--------|---------|------|
| 1 | Marie Dubois | Rue de Rivoli | Champs-Élysées | 25.50€ |
| 2 | Jean Martin | La Défense | Rue de la Paix | 32.00€ |
| 3 | Sophie Laurent | Montmartre | St-Germain | 28.75€ |
| 4 | Pierre Durand | Quartier Latin | Rue Mouffetard | 18.50€ |
| 5 | Claire Rousseau | Montparnasse | Versailles | 45.00€ |

---

## 🎮 Mode Test (Bypass Proximité)

Pour tester sans se déplacer physiquement :

1. Cliquez sur l'icône **🎯 (cible)** à côté du bouton GPS
2. Le mode test est activé (bouton orange)
3. Vous pouvez maintenant glisser le slider même si vous n'êtes pas à proximité
4. Cliquez à nouveau pour désactiver

---

## 📝 Logs à Surveiller

### Console Chauffeur
```
🚗 [OrderSlice] Acceptation de la commande abc123
✅ [OrderSlice] Commande acceptée, admin notifié en temps réel
📍 [LocationSync] Synchronisation position chauffeur...
✅ [LocationSync] Position synchronisée avec succès
📦 [OrderSlice] Colis récupéré à 13:25:30
🎯 [OrderSlice] Finalisation de la commande abc123
💰 [OrderSlice] Gains chauffeur: +10.20€ (40% de 25.50€)
✅ [OrderSlice] Commande livrée avec succès, admin notifié
```

### Console Admin
```
📡 Mise à jour reçue: { status: 'driver_accepted', ... }
📡 Mise à jour reçue: { status: 'in_progress', ... }
📡 Mise à jour reçue: { status: 'delivered', ... }
```

---

## ✅ Checklist de Test

- [ ] Les 5 commandes sont créées
- [ ] Le chauffeur reçoit une notification sonore + vibration
- [ ] L'acceptation met à jour le statut en temps réel
- [ ] La position du chauffeur est synchronisée toutes les 10s
- [ ] La récupération enregistre le timestamp et la position
- [ ] La livraison enregistre la preuve (photo/signature)
- [ ] Les gains du chauffeur sont calculés (40%)
- [ ] L'admin voit toutes les mises à jour en temps réel
- [ ] Les logs sont clairs et informatifs

---

## 🐛 Dépannage

### Les commandes n'apparaissent pas
1. Vérifiez que le chauffeur est **en ligne** (statut online)
2. Vérifiez la connexion Supabase Realtime
3. Regardez les logs dans la console

### La position ne se met pas à jour
1. Vérifiez que la géolocalisation est activée
2. Vérifiez les logs `[LocationSync]`
3. Vérifiez que `currentOrder` existe

### L'admin ne voit pas les mises à jour
1. Vérifiez l'abonnement Realtime côté admin
2. Vérifiez les permissions RLS sur la table `orders`
3. Regardez les logs réseau (onglet Network)

---

## 🚀 Commandes Rapides

```javascript
// Créer 5 commandes
await window.testOrders.createAll()

// Nettoyer
await window.testOrders.clear()

// Créer une commande spécifique
await window.testOrders.createOne(2)  // Sophie Laurent
```

---

**Bon test ! 🎉**
