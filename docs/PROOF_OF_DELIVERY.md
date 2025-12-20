# Système de Preuve de Livraison 📦

## Vue d'ensemble

Le système de preuve de livraison permet aux chauffeurs de capturer une preuve lors de la finalisation d'une livraison. Deux méthodes sont disponibles :

1. **Signature du client** ✍️
2. **Photo du colis déposé** 📸

## Composants

### ProofOfDeliveryDrawer

Composant principal qui gère l'interface de capture de preuve.

**Props:**
- `isOpen: boolean` - Contrôle l'ouverture/fermeture du drawer
- `onClose: () => void` - Callback appelé lors de la fermeture
- `onConfirm: (proofType: 'signature' | 'photo', proofData: string) => void` - Callback appelé lors de la validation avec le type et les données de la preuve

**Modes:**
- `selection` - Écran de choix entre signature et photo
- `signature` - Interface de capture de signature
- `photo` - Interface de capture de photo (simulée)

## Flux d'utilisation

### 1. Scénario Signature

```
1. Le chauffeur clique sur "Terminer la livraison"
2. Le drawer s'ouvre en mode "selection"
3. Le chauffeur sélectionne "Signature"
4. Le client signe avec son doigt sur l'écran tactile
5. Le chauffeur clique sur "Valider"
6. La signature est capturée en base64 (PNG)
7. La course est marquée comme terminée
```

### 2. Scénario Photo

```
1. Le chauffeur clique sur "Terminer la livraison"
2. Le drawer s'ouvre en mode "selection"
3. Le chauffeur sélectionne "Photo"
4. Un simulateur d'appareil photo s'affiche
5. Le chauffeur clique sur le déclencheur
6. Une photo simulée est générée (1.5s de chargement)
7. Le chauffeur peut reprendre la photo ou la valider
8. La photo est capturée (URL)
9. La course est marquée comme terminée
```

## Intégration dans ActiveOrderCard

Le composant `ActiveOrderCard` a été modifié pour :

1. Ouvrir le drawer au lieu de terminer directement la course
2. Intercepter la validation de la preuve
3. Logger les données de preuve (à envoyer au backend)
4. Terminer la course uniquement après validation de la preuve

```typescript
const handleProofConfirmed = (proofType: 'signature' | 'photo', proofData: string) => {
  console.log("Preuve capturée :", proofType, proofData);
  // TODO: Envoyer au backend
  onStatusChange(order.id, 'completed');
};
```

## Fonctionnalités

### Signature
- Canvas tactile avec `react-signature-canvas`
- Bouton "Effacer" pour recommencer
- Validation uniquement si la signature n'est pas vide
- Export en PNG base64 (trimmed pour optimiser la taille)

### Photo (Simulation)
- Simulateur d'appareil photo avec viseur
- Animation de chargement (1.5s)
- Prévisualisation de la photo capturée
- Possibilité de reprendre la photo
- Placeholder utilisé pour la démo

### UX/UI
- Animations fluides avec Framer Motion
- Feedback visuel avec toasts (Sonner)
- Design responsive et mobile-first
- Icônes Lucide pour une interface cohérente
- Bouton "Retour au choix" pour changer de méthode

## Prochaines étapes

### Pour une implémentation en production :

1. **Remplacer la simulation photo par une vraie caméra**
   ```typescript
   // Utiliser l'API MediaDevices
   const stream = await navigator.mediaDevices.getUserMedia({ 
     video: { facingMode: 'environment' } 
   });
   ```

2. **Envoyer les données au backend**
   ```typescript
   await supabase
     .from('order_proofs')
     .insert({
       order_id: order.id,
       proof_type: proofType,
       proof_data: proofData,
       captured_at: new Date().toISOString()
     });
   ```

3. **Optimiser le stockage**
   - Compresser les images avant l'upload
   - Utiliser Supabase Storage pour les fichiers
   - Stocker uniquement l'URL dans la base de données

4. **Ajouter la validation**
   - Vérifier la qualité de la signature
   - Vérifier la netteté de la photo
   - Ajouter des métadonnées (timestamp, GPS, etc.)

## Dépendances

```json
{
  "react-signature-canvas": "^1.0.6",
  "@types/react-signature-canvas": "^1.0.5" // Optionnel
}
```

## Notes techniques

- Le canvas de signature utilise `touch-none` pour éviter le scroll pendant la signature
- Les animations utilisent `animate-in fade-in` de Tailwind
- Le drawer se réinitialise automatiquement à la fermeture
- La validation est bloquée si aucune preuve n'est capturée
