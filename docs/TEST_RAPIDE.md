# 🚀 TEST RAPIDE - 3 ÉTAPES

## 📋 Étape 1 : Créer une Commande dans Supabase

1. **Ouvrez Supabase Dashboard** : https://supabase.com/dashboard
2. **Sélectionnez votre projet**
3. **Allez dans "SQL Editor"** (menu de gauche)
4. **Copiez-collez cette commande** :

```sql
INSERT INTO orders (
    status,
    pickup_address,
    pickup_lat,
    pickup_lng,
    delivery_address,
    delivery_lat,
    delivery_lng,
    pickup_contact_name,
    price,
    created_at
) VALUES (
    'pending_acceptance',
    '12 Rue de Rivoli, 75001 Paris',
    48.8566,
    2.3522,
    '45 Avenue des Champs-Élysées, 75008 Paris',
    48.8698,
    2.3078,
    'Marie Dubois - TEST',
    25.50,
    NOW()
);
```

5. **Cliquez sur "Run"** (ou Ctrl+Enter)

✅ **Résultat** : Une commande de test est créée !

---

## 📱 Étape 2 : Tester dans l'App Chauffeur

1. **Ouvrez l'application chauffeur** (déjà lancée sur http://localhost:5173)
2. **Assurez-vous d'être en ligne** (statut online)
3. **Attendez quelques secondes** → Une notification apparaît ! 🔔

4. **Acceptez la course** :
   - Cliquez sur "Accepter"
   - ✅ L'admin voit : "Course acceptée" + votre position GPS

5. **Récupérez le colis** :
   - Cliquez sur l'icône 🎯 (mode test) pour bypass la proximité
   - Glissez le slider "Confirmer le Retrait"
   - ✅ L'admin voit : "Colis récupéré" + position + timestamp

6. **Livrez** :
   - Glissez le slider "Terminer la Course"
   - Prenez une photo OU faites une signature
   - Cliquez sur "Confirmer"
   - ✅ L'admin voit : "Livré" + preuve + position

---

## 👀 Étape 3 : Vérifier Côté Admin (Supabase)

1. **Retournez dans Supabase**
2. **Allez dans "Table Editor"** → Table `orders`
3. **Trouvez votre commande** (client: "Marie Dubois - TEST")
4. **Vérifiez les colonnes** :

| Colonne | Valeur Attendue |
|---------|----------------|
| `status` | `delivered` |
| `driver_current_lat` | Votre position GPS |
| `driver_current_lng` | Votre position GPS |
| `accepted_at` | Timestamp d'acceptation |
| `picked_up_at` | Timestamp de récupération |
| `delivered_at` | Timestamp de livraison |
| `proof_type` | `photo` ou `signature` |
| `proof_data` | Base64 de l'image |

✅ **Toutes les données sont là !**

---

## 🔍 Vérifier les Logs

### Dans la Console du Navigateur (F12)

Vous devriez voir :

```
🚗 [OrderSlice] Acceptation de la commande abc123
📡 [OrderService] Mise à jour commande abc123
✅ [OrderService] Commande abc123 mise à jour avec succès
✅ [OrderSlice] Commande acceptée, admin notifié en temps réel
📍 [LocationSync] Synchronisation position chauffeur...
✅ [LocationSync] Position synchronisée avec succès
📦 [OrderSlice] Colis récupéré à 13:30:45
🎯 [OrderSlice] Finalisation de la commande abc123
💰 [OrderSlice] Gains chauffeur: +10.20€ (40% de 25.50€)
✅ [OrderSlice] Commande livrée avec succès, admin notifié
```

---

## 🎉 C'est Tout !

**Vous venez de tester le parcours complet du chauffeur avec suivi en temps réel !**

### Récapitulatif de ce qui s'est passé :

1. ✅ Commande créée dans Supabase
2. ✅ Chauffeur notifié en temps réel
3. ✅ Acceptation → Admin voit la position
4. ✅ Récupération → Admin voit le timestamp
5. ✅ Livraison → Admin voit la preuve
6. ✅ Gains calculés (40% = 10.20€)

---

## 🔄 Pour Tester à Nouveau

### Nettoyer la commande de test :

```sql
DELETE FROM orders 
WHERE pickup_contact_name = 'Marie Dubois - TEST';
```

### Créer une nouvelle commande :

Relancez la commande INSERT de l'Étape 1 !

---

## 📁 Fichiers Utiles

- `docs/quick_test.sql` - Cette commande SQL
- `docs/test_orders.sql` - 5 commandes de test
- `docs/TESTING_GUIDE.md` - Guide complet
- `RÉSUMÉ_FINAL.md` - Résumé de tout le système

---

**Bon test ! 🚀**
