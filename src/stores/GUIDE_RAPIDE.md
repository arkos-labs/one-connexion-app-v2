# 🚀 GUIDE RAPIDE - Store v4

## 📌 En Bref

Le store a été refactorisé en **3 slices** sécurisés :
- 🔐 **AuthSlice** - Authentification
- 🚗 **DriverSlice** - Chauffeur + Location  
- 📦 **OrderSlice** - Courses + Gains

---

## 🔥 Utilisation Rapide

### Import
```typescript
import { useAuth, useDriver, useOrders } from '@/stores';
```

### Dans un Composant
```typescript
function MonComposant() {
  // Auth
  const { user, logout } = useAuth();
  
  // Driver
  const { isOnDuty, setIsOnDuty, preferences } = useDriver();
  
  // Orders
  const { currentOrder, earnings, acceptOrder } = useOrders();
  
  return (
    <div>
      <p>Chauffeur: {user?.fullName}</p>
      <p>Statut: {isOnDuty ? 'En ligne' : 'Hors ligne'}</p>
      <p>Gains: €{earnings.toFixed(2)}</p>
    </div>
  );
}
```

---

## ⚠️ IMPORTANT : Changements

### 1. Gains
```typescript
// ❌ AVANT
const gains = useAppStore(state => state.earnings);

// ✅ MAINTENANT
const { earnings } = useOrders();
```

### 2. Types
```typescript
// ❌ AVANT
messages: any[]

// ✅ MAINTENANT  
messages: ChatMessage[]
```

---

## 🔒 Sécurité

### ✅ CE QUI EST SAUVEGARDÉ
- User, preferences, vehicle, documents
- Historique des courses
- Gains totaux

### ❌ CE QUI N'EST PAS SAUVEGARDÉ
- **Course active** (évite courses fantômes)
- **Localisation** (données temps réel)
- **Statut en ligne** (évite statut fantôme)

---

## 💰 Prix

Les prix sont stockés en **centimes** pour éviter les erreurs :
```typescript
// €15.50 = 1550 centimes (stocké)
// getEarnings() → 15.50 (affiché)
```

---

## 📚 Documentation Complète

- **[RESUME_FR.md](./RESUME_FR.md)** - Explication détaillée 🇫🇷
- **[README.md](./README.md)** - Documentation technique
- **[MIGRATION.md](./MIGRATION.md)** - Guide de migration

---

## 🧪 Tests

```bash
# Exécuter les tests
npm test

# Interface UI
npm run test:ui
```

---

## ✅ Checklist Migration

- [ ] Remplacer `earnings` par `getEarnings()`
- [ ] Utiliser `ChatMessage` au lieu de `any`
- [ ] Tester que les courses ne persistent pas après redémarrage
- [ ] Vérifier les calculs de prix

---

**Version** : v4  
**Statut** : ✅ Prêt à utiliser
