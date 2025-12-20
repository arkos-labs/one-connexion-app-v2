# 🔔 useIncomingOrderAlert - Documentation

## 📌 Vue d'ensemble

Hook React pour gérer les alertes de nouvelles commandes avec :
- 🔊 Son en boucle
- 📳 Vibration répétée
- 🛡️ Gestion de l'Auto-Play Policy
- ✅ API Vibration défensive

## 🆕 Améliorations v2.0

### 1. **Gestion de l'Auto-Play Policy** 🔊

**Problème** : Les navigateurs modernes bloquent l'auto-play audio sans interaction utilisateur.

**Solution** : Initialisation audio au premier passage "En Ligne"

```typescript
useEffect(() => {
    if (isOnDuty && !audioInitialized) {
        initializeAudio(); // Déclenché par l'action utilisateur (toggle)
    }
}, [isOnDuty, audioInitialized]);
```

**Processus** :
1. Utilisateur passe en ligne (action utilisateur ✅)
2. Audio initialisé avec volume 0
3. Test de lecture silencieux
4. Si succès → Audio prêt pour les alertes
5. Si échec → Fallback lors de la première alerte

### 2. **API Vibration Défensive** 📳

**Vérifications** :
```typescript
// 1. Vérifier la compatibilité
if (!('vibrate' in navigator)) {
    console.log("ℹ️ API Vibration non supportée");
    return;
}

// 2. Try-catch pour éviter les crashes
try {
    const vibrated = navigator.vibrate([500, 200, 500]);
    if (!vibrated) {
        console.log("ℹ️ Vibration refusée");
    }
} catch (error) {
    console.warn("⚠️ Erreur vibration:", error);
}
```

### 3. **Prévention des Fuites Mémoire** 🧹

**Nettoyage automatique** :
```typescript
useEffect(() => {
    // ...
    return () => stopAlert(); // Cleanup au démontage
}, [pendingOrder, driverStatus]);
```

**Arrêt complet** :
- Audio pausé et remis à 0
- Interval de vibration cleared
- Vibration stoppée immédiatement

### 4. **Logs de Débogage** 🐛

**Logs ajoutés** :
```
🔊 Initialisation audio...
✅ Audio initialisé avec succès
⚠️ Auto-play bloqué, l'audio sera initialisé à la première alerte
🔊 Alerte audio démarrée
📳 Vibration démarrée
🔇 Alerte audio arrêtée
📴 Vibration arrêtée
ℹ️ API Vibration non supportée sur cet appareil
```

## 🏗️ Architecture

### États

```typescript
const [audioInitialized, setAudioInitialized] = useState(false);
const audioRef = useRef<HTMLAudioElement | null>(null);
const vibrationInterval = useRef<NodeJS.Timeout | null>(null);
```

### Flux de Données

```
1. Utilisateur passe en ligne
   ↓
2. initializeAudio() appelé
   ↓
3. Audio préchargé et testé
   ↓
4. Nouvelle commande arrive
   ↓
5. startAlert() appelé
   ↓
6. Son joué + Vibration démarrée
   ↓
7. Commande acceptée/rejetée
   ↓
8. stopAlert() appelé
   ↓
9. Son arrêté + Vibration stoppée
```

## 🎯 Utilisation

### Dans un Composant

```typescript
import { useIncomingOrderAlert } from '@/hooks/useIncomingOrderAlert';

function DriverHomeScreen() {
  const { isAlertActive, audioInitialized, hasVibrationSupport } = useIncomingOrderAlert();

  return (
    <div>
      {isAlertActive && <div>🔔 Nouvelle commande !</div>}
      {!audioInitialized && <div>⚠️ Audio non initialisé</div>}
      {!hasVibrationSupport && <div>ℹ️ Vibration non supportée</div>}
    </div>
  );
}
```

### Valeurs Retournées

```typescript
{
  isAlertActive: boolean,        // Alerte en cours ?
  audioInitialized: boolean,     // Audio prêt ?
  hasVibrationSupport: boolean   // Vibration supportée ?
}
```

## 🔧 Configuration

### Changer le Son

```typescript
const RINGTONE_URL = "https://example.com/custom-sound.mp3";
```

### Modifier le Pattern de Vibration

```typescript
// Pattern actuel : [500ms vibre, 200ms pause, 500ms vibre]
navigator.vibrate([500, 200, 500]);

// Exemples :
navigator.vibrate([200, 100, 200]); // Court et rapide
navigator.vibrate([1000, 500, 1000]); // Long et intense
navigator.vibrate([100, 50, 100, 50, 100]); // Triple vibration
```

### Modifier l'Intervalle de Répétition

```typescript
// Actuel : 1.5 secondes
vibrationInterval.current = setInterval(() => {
    navigator.vibrate([500, 200, 500]);
}, 1500); // ← Changer ici (en ms)
```

### Modifier le Volume

```typescript
audioRef.current.volume = 1.0; // ← 0.0 à 1.0
```

## 🛡️ Gestion des Erreurs

### Auto-Play Bloqué

**Scénario** : Navigateur bloque l'auto-play

**Gestion** :
```typescript
audioRef.current.play()
    .catch(err => {
        console.warn("⚠️ Lecture audio bloquée");
        // Fallback : Réessayer après un délai
        setTimeout(() => {
            audioRef.current?.play().catch(() => {
                console.warn("⚠️ Impossible de jouer l'audio");
            });
        }, 100);
    });
```

**Solution utilisateur** :
- Interagir avec la page (clic, tap)
- Passer en ligne/hors ligne pour réinitialiser

### Vibration Non Supportée

**Détection** :
```typescript
if (!('vibrate' in navigator)) {
    console.log("ℹ️ API Vibration non supportée");
    return; // Pas de crash
}
```

**Appareils concernés** :
- Desktop (la plupart)
- Certains navigateurs iOS
- Navigateurs anciens

### Erreur Pendant la Vibration

**Protection** :
```typescript
try {
    navigator.vibrate([500, 200, 500]);
} catch (error) {
    console.warn("⚠️ Erreur vibration:", error);
    // Arrêter l'interval pour éviter les erreurs répétées
    clearInterval(vibrationInterval.current);
}
```

## 📊 Compatibilité

### Audio

| Navigateur | Support | Auto-Play |
|------------|---------|-----------|
| Chrome | ✅ | ⚠️ Bloqué sans interaction |
| Firefox | ✅ | ⚠️ Bloqué sans interaction |
| Safari | ✅ | ⚠️ Bloqué sans interaction |
| Edge | ✅ | ⚠️ Bloqué sans interaction |

### Vibration

| Appareil | Support |
|----------|---------|
| Android Chrome | ✅ |
| Android Firefox | ✅ |
| iOS Safari | ❌ |
| Desktop | ❌ |

## 🐛 Débogage

### Vérifier l'État

```typescript
const { isAlertActive, audioInitialized, hasVibrationSupport } = useIncomingOrderAlert();

console.log('Alerte active:', isAlertActive);
console.log('Audio initialisé:', audioInitialized);
console.log('Vibration supportée:', hasVibrationSupport);
```

### Tester l'Audio

```typescript
// Dans la console du navigateur
const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3");
audio.play()
    .then(() => console.log("✅ Audio fonctionne"))
    .catch(err => console.log("❌ Audio bloqué:", err));
```

### Tester la Vibration

```typescript
// Dans la console du navigateur
if ('vibrate' in navigator) {
    navigator.vibrate([500, 200, 500]);
    console.log("✅ Vibration testée");
} else {
    console.log("❌ Vibration non supportée");
}
```

## 🎯 Cas d'Usage

### 1. Nouvelle Commande Arrive

```
1. Commande ajoutée à orders[]
2. pendingOrder détecté
3. driverStatus === 'online'
4. startAlert() appelé
5. 🔊 Son joué en boucle
6. 📳 Vibration répétée toutes les 1.5s
```

### 2. Commande Acceptée

```
1. acceptOrder() appelé
2. pendingOrder devient null
3. stopAlert() appelé
4. 🔇 Son arrêté
5. 📴 Vibration stoppée
```

### 3. Commande Rejetée

```
1. rejectOrder() appelé
2. pendingOrder retiré de orders[]
3. stopAlert() appelé
4. 🔇 Son arrêté
5. 📴 Vibration stoppée
```

### 4. Chauffeur Passe Hors Ligne

```
1. setIsOnDuty(false)
2. driverStatus !== 'online'
3. stopAlert() appelé
4. 🔇 Son arrêté
5. 📴 Vibration stoppée
```

## 🚀 Performance

### Optimisations

1. **Initialisation Lazy** :
   - Audio créé uniquement au premier passage en ligne
   - Pas de création inutile si jamais en ligne

2. **Cleanup Automatique** :
   - Intervals cleared au démontage
   - Audio pausé et remis à 0
   - Pas de fuites mémoire

3. **Logs Conditionnels** :
   - Logs uniquement en développement
   - Pas de pollution console en production

### Métriques

- **Taille** : ~5KB
- **CPU** : Minimal (interval 1.5s)
- **Mémoire** : < 1MB (audio préchargé)
- **Batterie** : Vibration optimisée

## 📚 Ressources

- [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- [Vibration API](https://developer.mozilla.org/en-US/docs/Web/API/Vibration_API)
- [Autoplay Policy](https://developer.chrome.com/blog/autoplay/)

## 🔄 Migration v1 → v2

### Changements

1. **Initialisation audio** : Maintenant au premier passage en ligne
2. **API Vibration** : Vérifications défensives ajoutées
3. **Retour de valeurs** : Hook retourne maintenant un objet avec état

### Code à Mettre à Jour

**Avant** :
```typescript
useIncomingOrderAlert(); // Pas de retour
```

**Maintenant** :
```typescript
const { isAlertActive, audioInitialized } = useIncomingOrderAlert();
// Utiliser les valeurs si nécessaire
```

---

**Version** : 2.0  
**Date** : 2025-12-20  
**Auteur** : Arkos Labs
