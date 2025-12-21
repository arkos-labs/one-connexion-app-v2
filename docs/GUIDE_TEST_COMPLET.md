# 🧪 GUIDE DE TEST COMPLET - SANS VALIDATION EMAIL

## 🎯 Objectif
Tester l'intégralité du flux de l'application sans avoir à valider les emails.

---

## 📋 ÉTAPE 1 : Configuration Supabase (À FAIRE UNE SEULE FOIS)

### 1.1 Désactiver la validation email
1. Ouvrir **Supabase Dashboard**
2. Aller dans **Authentication** → **Settings**
3. Trouver **Email Auth**
4. **Désactiver** "Confirm email"
5. Cliquer sur **Save**

### 1.2 Exécuter le script de test
1. Ouvrir **Supabase Dashboard** → **SQL Editor**
2. Copier le contenu de `docs/test_complet_sans_email.sql`
3. Cliquer sur **Run**
4. Vérifier les messages de succès :
   ```
   ✅ Utilisateur créé avec ID: ...
   ✅ Chauffeur créé avec ID: ...
   ✅ Commande test créée avec ID: ...
   ```

---

## 🚀 ÉTAPE 2 : Test du Flux Complet

### 2.1 Connexion Chauffeur
**App Chauffeur** (http://localhost:5173)

1. Ouvrir l'application
2. Cliquer sur "Se connecter"
3. Saisir :
   - **Email** : `chauffeur.test@oneconnexion.com`
   - **Mot de passe** : `Test1234!`
4. Cliquer sur "Connexion"

**✅ Vérifications :**
- [ ] La connexion réussit
- [ ] L'écran principal s'affiche
- [ ] Le nom "Jean Testeur" apparaît (si affiché)

---

### 2.2 Passer en Ligne
**App Chauffeur**

1. Cliquer sur le bouton pour passer en ligne
2. Observer le changement de statut

**✅ Vérifications :**
- [ ] Le point devient vert
- [ ] Le message "Vous êtes visible" s'affiche
- [ ] Le message "Recherche de courses..." apparaît

**Console (F12) :**
```
✅ Rechercher : "🟢 [DriverSlice] Chauffeur en ligne"
```

---

### 2.3 Assigner une Course
**Site Admin** (http://localhost:5174)

1. Ouvrir la page **Dispatch**
2. Vérifier que "Jean Testeur" apparaît dans la colonne "Chauffeurs"
3. Dans la colonne "À Dispatcher", trouver la commande TEST-XXXX
4. Cliquer sur "Choisir" à côté de "Jean Testeur"

**✅ Vérifications :**
- [ ] La commande passe dans "En cours d'acceptation"
- [ ] Le nom "Jean Testeur" s'affiche
- [ ] Le statut "En attente" clignote

**Console Admin (F12) :**
```
✅ Rechercher : "Course attribuée au chauffeur"
```

---

### 2.4 Accepter la Course
**App Chauffeur**

1. Observer l'apparition de la modale de nouvelle course
2. Lire les détails (prix, adresses)
3. Cliquer sur **"Accepter"**

**✅ Vérifications :**
- [ ] La modale apparaît automatiquement
- [ ] Le prix affiché est 35.00€
- [ ] Le gain affiché est 14.00€ (40%)
- [ ] Après acceptation, la carte affiche l'itinéraire
- [ ] Le bouton "Je suis arrivé" est visible

**Console Chauffeur (F12) :**
```
✅ Rechercher : 
- "📥 [OrderService] Nouvelle commande reçue"
- "✅ [OrderSlice] Commande acceptée"
```

**Console Admin (F12) :**
```
✅ Rechercher : "🔄 [OrderService] Commande mise à jour"
```

**Admin - Vérifications :**
- [ ] La commande passe dans "En Cours (Live)"
- [ ] Le badge affiche "Approche" (bleu)
- [ ] La distance et l'ETA s'affichent

---

### 2.5 Simuler le Trajet vers le Retrait
**App Chauffeur**

1. Cliquer sur le bouton **⚡** (en bas à droite de la carte)
2. Observer le marqueur du chauffeur se déplacer

**✅ Vérifications :**
- [ ] Le marqueur bleu se déplace vers le point de retrait
- [ ] La ligne d'itinéraire se met à jour

**Admin - Vérifications :**
- [ ] La distance diminue progressivement
- [ ] L'ETA se met à jour
- [ ] La position du chauffeur se met à jour sur la carte (si carte visible)

**Console Chauffeur (F12) :**
```
✅ Rechercher : "📍 [LocationSync] Synchronisation position chauffeur..."
```

---

### 2.6 Arrivée au Point de Retrait
**App Chauffeur**

1. Attendre que le chauffeur soit proche du point de retrait
2. Glisser le bouton **"Je suis arrivé"**

**✅ Vérifications :**
- [ ] Le statut change à "Sur place (Retrait)"
- [ ] Le bouton devient "Confirmer la Prise en charge"

**Console Chauffeur (F12) :**
```
✅ Rechercher : "📍 [OrderSlice] Arrivé au point de retrait"
```

**Admin - Vérifications :**
- [ ] Le badge passe à **"Sur Place"** (orange)
- [ ] La distance affiche **"0 m"**
- [ ] L'ETA affiche **"Sur place"**
- [ ] Le label affiche **"📍 Est arrivé au retrait"**

---

### 2.7 Prise en Charge du Colis
**App Chauffeur**

1. Glisser le bouton **"Confirmer la Prise en charge"**

**✅ Vérifications :**
- [ ] Le statut change à "En route vers la livraison"
- [ ] La destination change (adresse de livraison)
- [ ] Le bouton devient "Terminer la Course"

**Console Chauffeur (F12) :**
```
✅ Rechercher : "📦 [OrderSlice] Colis récupéré"
```

**Admin - Vérifications :**
- [ ] Le badge passe à **"En Livraison"** (violet)
- [ ] Le label affiche **"Vers Livraison"**
- [ ] La distance se recalcule vers la nouvelle destination

---

### 2.8 Simuler le Trajet vers la Livraison
**App Chauffeur**

1. Cliquer sur le bouton **⚡**
2. Observer le déplacement vers la destination finale

**✅ Vérifications :**
- [ ] Le marqueur se déplace vers le point de livraison
- [ ] La distance diminue

**Admin - Vérifications :**
- [ ] La distance diminue progressivement
- [ ] L'ETA se met à jour

---

### 2.9 Terminer la Course
**App Chauffeur**

1. Attendre d'être proche de la destination
2. Glisser **"Terminer la Course"**
3. Choisir **"Photo"** ou **"Signature"**
4. Pour Photo : Prendre une photo ou sélectionner une image
5. Pour Signature : Dessiner une signature
6. Cliquer sur **"Valider"**

**✅ Vérifications :**
- [ ] La modale de preuve s'ouvre
- [ ] La photo/signature est capturée
- [ ] Le résumé de course s'affiche
- [ ] Les gains affichent **14.00€**

**Console Chauffeur (F12) :**
```
✅ Rechercher : 
- "✅ [OrderSlice] Commande livrée avec succès"
- "💰 [OrderSlice] Gains chauffeur: +14.00€"
```

**Admin - Vérifications :**
- [ ] Le badge passe à **"Livré"** (vert foncé)
- [ ] Le label affiche **"✅ Course Terminée"**
- [ ] La distance affiche **"0 m"**

---

### 2.10 Vérifier le Résumé
**App Chauffeur**

1. Observer le résumé de course
2. Vérifier les informations

**✅ Vérifications :**
- [ ] Prix total : 35.00€
- [ ] Votre gain : 14.00€
- [ ] Distance parcourue affichée
- [ ] Durée affichée
- [ ] Bouton "Continuer" visible

---

### 2.11 Retour en Ligne
**App Chauffeur**

1. Cliquer sur **"Continuer"**

**✅ Vérifications :**
- [ ] Le résumé se ferme
- [ ] Le chauffeur repasse en ligne
- [ ] Le message "Recherche de courses..." réapparaît
- [ ] Les gains totaux affichent 14.00€

---

## 📊 Résultats Attendus

### Gains
- **Prix de la course** : 35.00€
- **Part chauffeur (40%)** : 14.00€
- **Part plateforme (60%)** : 21.00€

### Temps de réponse
- **Acceptation → Admin** : < 1 seconde
- **Changement de statut → Admin** : < 2 secondes
- **Mise à jour GPS → Admin** : 3 secondes (intervalle)

### Statuts observés
1. ⏳ **En cours d'acceptation** (bleu clair, clignotant)
2. 🚗 **Approche** (bleu)
3. 📍 **Sur Place** (orange)
4. 🚚 **En Livraison** (violet)
5. ✅ **Livré** (vert foncé)

---

## 🐛 Dépannage

### Problème : La modale n'apparaît pas
**Solution :**
1. Vérifier que le chauffeur est en ligne
2. Vérifier la console pour les erreurs
3. Vérifier que la commande a bien `driver_id` renseigné dans Supabase

### Problème : L'admin ne voit pas les mises à jour
**Solution :**
1. Vérifier la console admin pour "SUBSCRIBED"
2. Faire `git pull` dans le dossier admin
3. Vérifier que Realtime est activé dans Supabase

### Problème : Les gains ne sont pas crédités
**Solution :**
1. Vérifier la console pour "💰 [OrderSlice] Gains chauffeur"
2. Vérifier que le calcul affiche bien 14.00€
3. Vérifier que `earningsInCents` est mis à jour dans le store

### Problème : Le GPS ne se met pas à jour
**Solution :**
1. Vérifier la console pour "[LocationSync]"
2. Vérifier que `useDriverLocationSync` est appelé
3. Vérifier que le chauffeur a une position valide

---

## 🔄 Réinitialiser le Test

Pour recommencer le test :

1. **Supabase SQL Editor** :
```sql
-- Supprimer les données de test
DELETE FROM auth.users WHERE email = 'chauffeur.test@oneconnexion.com';
DELETE FROM public.orders WHERE reference LIKE 'TEST-%';
```

2. **Réexécuter** `docs/test_complet_sans_email.sql`

---

## ✅ Checklist Finale

- [ ] Connexion réussie
- [ ] Passage en ligne réussi
- [ ] Course assignée visible
- [ ] Course acceptée
- [ ] Statut "Approche" visible admin
- [ ] Simulation trajet fonctionne
- [ ] Statut "Sur Place" visible admin
- [ ] Prise en charge réussie
- [ ] Statut "En Livraison" visible admin
- [ ] Livraison terminée
- [ ] Statut "Livré" visible admin
- [ ] Gains crédités (14.00€)
- [ ] Résumé affiché
- [ ] Retour en ligne réussi

**Si toutes les cases sont cochées : 🎉 SUCCÈS COMPLET !**
