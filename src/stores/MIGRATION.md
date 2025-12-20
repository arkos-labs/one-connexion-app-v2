# Migration Guide: v3 → v4 Store Architecture

## 🎯 Overview

This guide helps you migrate from the monolithic store (v3) to the new sliced architecture (v4).

## 📋 What Changed

### Store Structure

**Before (v3):**
```typescript
// Single monolithic store
const useAppStore = create(persist((set, get) => ({
  user: null,
  driverLocation: { lat: 0, lng: 0 },
  orders: [],
  earnings: 0, // Float - prone to errors!
  // ... everything mixed together
})));
```

**After (v4):**
```typescript
// Sliced architecture
const useAppStore = create(persist(
  (...args) => ({
    ...createAuthSlice(...args),
    ...createDriverSlice(...args),
    ...createOrderSlice(...args),
  })
));
```

### Price Storage

**Before:**
```typescript
earnings: 0 // Float (€)
// Problem: 0.1 + 0.2 = 0.30000000000000004
```

**After:**
```typescript
earningsInCents: 0 // Integer (cents)
// Solution: 10 + 20 = 30 (exact)
```

## 🔄 Code Changes Required

### 1. Import Changes

**Before:**
```typescript
import { useAppStore } from '@/stores/useAppStore';
```

**After (Option 1 - Same as before):**
```typescript
import { useAppStore } from '@/stores';
```

**After (Option 2 - Optimized with selectors):**
```typescript
import { useAuth, useDriver, useOrders } from '@/stores';
```

### 2. Accessing Earnings

**Before:**
```typescript
const earnings = useAppStore((state) => state.earnings);
// earnings is a float
```

**After:**
```typescript
const earnings = useAppStore((state) => state.getEarnings());
// OR
const { earnings } = useOrders();
// earnings is converted from cents to euros
```

### 3. Type Imports

**Before:**
```typescript
import { UserRole, DriverStatus } from '@/stores/useAppStore';
```

**After:**
```typescript
import { UserRole, DriverStatus } from '@/stores';
// OR
import type { UserRole, DriverStatus } from '@/stores';
```

### 4. Messages Type

**Before:**
```typescript
messages: any[] // ❌ No type safety
```

**After:**
```typescript
messages: ChatMessage[] // ✅ Fully typed
```

## 🔍 Component Migration Examples

### Example 1: Driver Home Screen

**Before:**
```typescript
function DriverHomeScreen() {
  const user = useAppStore((state) => state.user);
  const isOnDuty = useAppStore((state) => state.isOnDuty);
  const currentOrder = useAppStore((state) => state.currentOrder);
  const earnings = useAppStore((state) => state.earnings);
  
  return (
    <div>
      <h1>{user?.fullName}</h1>
      <p>Status: {isOnDuty ? 'Online' : 'Offline'}</p>
      <p>Earnings: €{earnings.toFixed(2)}</p>
    </div>
  );
}
```

**After (Optimized):**
```typescript
function DriverHomeScreen() {
  const { user } = useAuth();
  const { isOnDuty } = useDriver();
  const { currentOrder, earnings } = useOrders();
  
  return (
    <div>
      <h1>{user?.fullName}</h1>
      <p>Status: {isOnDuty ? 'Online' : 'Offline'}</p>
      <p>Earnings: €{earnings.toFixed(2)}</p>
    </div>
  );
}
```

### Example 2: Preferences Screen

**Before:**
```typescript
function PreferencesScreen() {
  const preferences = useAppStore((state) => state.preferences);
  const updatePreference = useAppStore((state) => state.updatePreference);
  
  return (
    <Switch
      checked={preferences.soundEnabled}
      onChange={(checked) => updatePreference('soundEnabled', checked)}
    />
  );
}
```

**After (Same API):**
```typescript
function PreferencesScreen() {
  const { preferences, updatePreference } = useDriver();
  
  return (
    <Switch
      checked={preferences.soundEnabled}
      onChange={(checked) => updatePreference('soundEnabled', checked)}
    />
  );
}
```

### Example 3: Order Management

**Before:**
```typescript
function OrderCard({ orderId }: { orderId: string }) {
  const acceptOrder = useAppStore((state) => state.acceptOrder);
  const rejectOrder = useAppStore((state) => state.rejectOrder);
  
  return (
    <div>
      <button onClick={() => acceptOrder(orderId)}>Accept</button>
      <button onClick={() => rejectOrder(orderId)}>Reject</button>
    </div>
  );
}
```

**After (Same API):**
```typescript
function OrderCard({ orderId }: { orderId: string }) {
  const { acceptOrder, rejectOrder } = useOrders();
  
  return (
    <div>
      <button onClick={() => acceptOrder(orderId)}>Accept</button>
      <button onClick={() => rejectOrder(orderId)}>Reject</button>
    </div>
  );
}
```

## ⚠️ Breaking Changes

### 1. `earnings` → `getEarnings()`

**Before:**
```typescript
const earnings = useAppStore((state) => state.earnings);
```

**After:**
```typescript
const earnings = useAppStore((state) => state.getEarnings());
// OR
const { earnings } = useOrders(); // Already converted
```

### 2. Direct `earningsInCents` Access

If you need the raw cents value:

```typescript
const earningsInCents = useAppStore((state) => state.earningsInCents);
```

### 3. Persistence Behavior

**What's no longer persisted:**
- `currentOrder` - Will be `null` after app restart
- `orders` - Will be empty `[]` after app restart
- `driverLocation` - Will reset to default
- `driverStatus` - Will be `"offline"`
- `isOnDuty` - Will be `false`
- `messages` - Will be empty `[]`

**Impact:** Drivers must explicitly go online after app restart. This is intentional for security.

## ✅ Automatic Migration

The store automatically migrates your data on first load:

```typescript
// Old localStorage (v3)
{
  "earnings": 125.50,
  "currentOrder": { ... },
  "driverStatus": "online"
}

// Automatically becomes (v4)
{
  "earningsInCents": 12550,
  // currentOrder removed
  // driverStatus removed
}
```

## 🧪 Testing Your Migration

### 1. Check TypeScript Errors

```bash
npm run build
```

All type errors should be resolved. If you see errors about `earnings`, change to `getEarnings()`.

### 2. Test Persistence

1. Log in and accept an order
2. Close the app (or refresh)
3. Reopen the app
4. **Expected:** User still logged in, but no active order (security feature)

### 3. Test Earnings Calculation

```typescript
// In your browser console
const store = useAppStore.getState();

// Accept and complete a few orders
store.acceptOrder('order-1');
store.completeOrder();

// Check earnings
console.log(store.getEarnings()); // Should be exact, no floating errors
```

## 🐛 Common Migration Issues

### Issue 1: "Property 'earnings' does not exist"

**Error:**
```
Property 'earnings' does not exist on type 'AppStore'
```

**Fix:**
```typescript
// Change this:
const earnings = useAppStore((state) => state.earnings);

// To this:
const earnings = useAppStore((state) => state.getEarnings());
```

### Issue 2: "Type 'any' is not assignable"

**Error:**
```
Type 'any' is not assignable to type 'ChatMessage'
```

**Fix:**
```typescript
// Change this:
messages: any[]

// To this:
import { ChatMessage } from '@/stores';
messages: ChatMessage[]
```

### Issue 3: Orders persist after restart

**Cause:** Using old localStorage key

**Fix:**
```typescript
// Clear old storage
localStorage.removeItem('one-connexion-store-v3');
// The new key is 'one-connexion-store-v4'
```

## 📊 Performance Improvements

### Before (Re-renders on any change)
```typescript
function MyComponent() {
  const store = useAppStore(); // Re-renders on ANY store change
  return <div>{store.user?.name}</div>;
}
```

### After (Optimized)
```typescript
function MyComponent() {
  const { user } = useAuth(); // Only re-renders on auth changes
  return <div>{user?.name}</div>;
}
```

## 🎉 Migration Checklist

- [ ] Update all `earnings` to `getEarnings()`
- [ ] Replace `any` types with `ChatMessage`
- [ ] Consider using selector hooks (`useAuth`, `useDriver`, `useOrders`)
- [ ] Test that orders don't persist after restart (expected behavior)
- [ ] Test that earnings are calculated correctly
- [ ] Run TypeScript build to catch any errors
- [ ] Test on mobile devices
- [ ] Clear old localStorage if needed

## 📞 Need Help?

If you encounter issues:

1. Check the [README.md](./README.md) for architecture details
2. Review the TypeScript interfaces in [types.ts](./types.ts)
3. Look at inline comments in slice files
4. Test in isolation with the examples above

## 🚀 Next Steps

After migration:

1. **Optimize components** - Use selector hooks
2. **Add tests** - Test persistence behavior
3. **Monitor errors** - Check for floating-point issues
4. **Document** - Add comments for future maintainers
