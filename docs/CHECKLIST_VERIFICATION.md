# 🚀 CHECKLIST DE VÉRIFICATION - FLUIDITÉ DES PROJETS

## ✅ **1. Base de Données Supabase**

### Actions à effectuer :
1. **Ouvrir Supabase SQL Editor**
2. **Exécuter le script** `docs/verification_complete.sql`
3. **Vérifier les résultats** :
   - ✅ Toutes les colonnes existent (8 colonnes attendues)
   - ✅ Au moins une politique RLS active
   - ✅ Au moins un chauffeur en ligne
   - ✅ Realtime activé sur `orders` et `drivers`

### Si des colonnes manquent :
```sql
-- Exécuter docs/final_fix.sql
```

---

## ✅ **2. Application Chauffeur**

### Vérifications en cours d'exécution :
- [ ] Le serveur dev tourne (`npm run dev`) ✅ CONFIRMÉ
- [ ] Aucune erreur dans la console
- [ ] Le chauffeur peut se connecter
- [ ] Le chauffeur peut passer en ligne
- [ ] Les courses assignées apparaissent

### Test de bout en bout :
1. **Passer en ligne** dans l'app chauffeur
2. **Assigner une course** depuis l'admin
3. **Vérifier** que la modale apparaît dans l'app chauffeur
4. **Accepter** la course
5. **Vérifier** que l'admin voit le statut "Approche"
6. **Cliquer** "Je suis arrivé"
7. **Vérifier** que l'admin voit "Sur Place" (badge orange)
8. **Cliquer** "Confirmer la Prise en charge"
9. **Vérifier** que l'admin voit "En Livraison" (badge violet)
10. **Terminer** la course avec preuve
11. **Vérifier** que l'admin voit "Livré" (badge vert)

---

## ✅ **3. Site Admin**

### Vérifications :
- [ ] Le serveur dev tourne (`npm run dev`) ✅ CONFIRMÉ
- [ ] Vous avez fait `git pull` pour récupérer les dernières corrections
- [ ] La page Dispatch affiche 4 colonnes
- [ ] Les chauffeurs en ligne sont visibles
- [ ] Les courses assignées apparaissent dans "En cours d'acceptation"

### Test de bout en bout :
1. **Créer une commande** (ou utiliser une existante)
2. **L'assigner** à un chauffeur en ligne
3. **Vérifier** qu'elle passe dans "En cours d'acceptation"
4. **Attendre** que le chauffeur accepte
5. **Vérifier** qu'elle passe dans "En Cours (Live)"
6. **Observer** les mises à jour en temps réel :
   - Distance qui diminue
   - ETA qui se met à jour
   - Changements de statut (Approche → Sur Place → En Livraison → Livré)

---

## ✅ **4. Synchronisation Temps Réel**

### Points critiques :
- [ ] **GPS du chauffeur** se met à jour toutes les 3 secondes
- [ ] **Distance et ETA** se recalculent automatiquement
- [ ] **Changements de statut** apparaissent instantanément
- [ ] **Pas de latence** supérieure à 1-2 secondes

### Si la synchronisation ne fonctionne pas :
1. Vérifier la console du chauffeur pour les logs `[LocationSync]`
2. Vérifier la console de l'admin pour les logs `[Realtime]`
3. Vérifier que Realtime est activé dans Supabase

---

## 🐛 **Problèmes Connus et Solutions**

### **Problème 1 : Le chauffeur ne reçoit pas la course**
**Cause** : Mauvaise colonne utilisée (`assigned_driver_id` au lieu de `driver_id`)
**Solution** : ✅ CORRIGÉ dans le dernier commit

### **Problème 2 : Les courses "Livrées" disparaissent**
**Cause** : Filtre excluait le statut `completed`
**Solution** : ✅ CORRIGÉ dans le dernier commit

### **Problème 3 : L'admin ne voit pas "Sur Place"**
**Cause** : Statut `arrived_pickup` non géré
**Solution** : ✅ CORRIGÉ dans le dernier commit

### **Problème 4 : Erreurs RLS (Row Level Security)**
**Cause** : Politiques trop restrictives
**Solution** : Exécuter `docs/final_fix.sql` qui ajoute une politique permissive pour le développement

---

## 📊 **Logs à Surveiller**

### Dans l'App Chauffeur (Console navigateur) :
```
✅ Rechercher :
- "📍 [LocationSync] Synchronisation position chauffeur..."
- "✅ [OrderSlice] Statut mis à jour, admin notifié"
- "📥 [OrderService] Nouvelle commande reçue"

❌ Éviter :
- "❌ [OrderService] Erreur mise à jour"
- "❌ [LocationSync] Erreur synchronisation"
```

### Dans le Site Admin (Console navigateur) :
```
✅ Rechercher :
- "📡 [OrderService] Statut abonnement Realtime: SUBSCRIBED"
- "🔄 [OrderService] Commande mise à jour"

❌ Éviter :
- "Error: Failed to subscribe"
- "PGRST" (erreurs Postgres)
```

---

## 🎯 **Prochaines Étapes Recommandées**

1. **Exécuter** `docs/verification_complete.sql` dans Supabase
2. **Faire** `git pull` dans le dossier `web-site-one-connexion`
3. **Tester** le flux complet (étapes ci-dessus)
4. **Signaler** tout comportement anormal

---

## 📞 **Support**

Si un problème persiste :
1. Copier les logs d'erreur de la console
2. Indiquer à quelle étape le problème survient
3. Préciser si c'est côté chauffeur ou admin
