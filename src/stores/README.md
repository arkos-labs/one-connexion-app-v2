# Store Architecture Documentation

## 📋 Overview

The application store has been refactored from a monolithic structure to a **secure, sliced architecture** using Zustand. This design improves maintainability, security, and prevents critical bugs like "ghost orders" and floating-point price errors.

## 🏗️ Architecture

### Slices

The store is divided into **3 independent slices**:

1. **AuthSlice** - User authentication and session management
2. **DriverSlice** - Driver status, location, profile, and preferences
3. **OrderSlice** - Order lifecycle and earnings management

```
┌─────────────────────────────────────────────────────────┐
│                    AppStore (Combined)                   │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  AuthSlice   │  │ DriverSlice  │  │  OrderSlice  │  │
│  │              │  │              │  │              │  │
│  │ • user       │  │ • status     │  │ • orders     │  │
│  │ • auth       │  │ • location   │  │ • current    │  │
│  │ • loading    │  │ • vehicle    │  │ • history    │  │
│  │ • splash     │  │ • docs       │  │ • earnings   │  │
│  │              │  │ • prefs      │  │              │  │
│  │              │  │ • messages   │  │              │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## 🔒 Security & Persistence Strategy

### ✅ What IS Persisted

| Data | Slice | Reason |
|------|-------|--------|
| `user` | Auth | Maintain user session |
| `isAuthenticated` | Auth | Session state |
| `preferences` | Driver | User settings |
| `vehicle` | Driver | Profile data |
| `documents` | Driver | Profile data |
| `history` | Order | Completed orders record |
| `earningsInCents` | Order | Total earnings (as integer) |

### ❌ What is NOT Persisted (Critical)

| Data | Slice | Reason |
|------|-------|--------|
| `driverLocation` | Driver | **Real-time data** - Stale after restart |
| `driverStatus` | Driver | **Prevents ghost "online" status** |
| `isOnDuty` | Driver | **Prevents ghost "online" status** |
| `currentOrder` | Order | **Prevents ghost active orders** 🚨 |
| `orders` | Order | **Prevents ghost pending orders** 🚨 |
| `messages` | Driver | Session-based chat |
| `lastCompletedOrder` | Order | UI state only |

### 🚨 Critical Security Rules

1. **NEVER persist `currentOrder`** - Could cause a driver to resume a "ghost" order after app restart
2. **NEVER persist `driverLocation`** - Location must be real-time, not stale
3. **NEVER persist `isOnDuty`** - Prevents drivers appearing online when they're not
4. **Store prices in cents** - Avoid floating-point errors (0.1 + 0.2 = 0.30000000000000004)

## 💰 Price Handling

### Problem: Floating-Point Errors

```javascript
// ❌ BAD - Floating point error
0.1 + 0.2 // = 0.30000000000000004
```

### Solution: Store as Cents (Integers)

```javascript
// ✅ GOOD - Integer arithmetic
10 + 20 // = 30 (cents) = €0.30
```

### Implementation

- **Storage**: All prices stored as **cents** (integers) in `earningsInCents`
- **Calculations**: Use **Decimal.js** for precision
- **Display**: Convert to euros using `getEarnings()` getter

```typescript
// Example: Adding €15.50 to earnings
const priceInCents = new Decimal(15.50)
  .times(100)
  .toDecimalPlaces(0)
  .toNumber(); // = 1550

earningsInCents += priceInCents;

// Display
const displayEarnings = new Decimal(earningsInCents)
  .dividedBy(100)
  .toDecimalPlaces(2)
  .toNumber(); // = €15.50
```

## 📦 File Structure

```
src/stores/
├── index.ts                    # Barrel exports
├── useAppStore.ts              # Main store (combines slices)
├── types.ts                    # TypeScript interfaces
└── slices/
    ├── authSlice.ts            # Authentication slice
    ├── driverSlice.ts          # Driver management slice
    └── orderSlice.ts           # Order management slice
```

## 🎯 Usage Examples

### Basic Usage (Full Store)

```typescript
import { useAppStore } from '@/stores';

function MyComponent() {
  const user = useAppStore((state) => state.user);
  const acceptOrder = useAppStore((state) => state.acceptOrder);
  
  return <div>{user?.fullName}</div>;
}
```

### Optimized Usage (Selector Hooks)

```typescript
import { useAuth, useDriver, useOrders } from '@/stores';

function MyComponent() {
  // Only re-renders when auth state changes
  const { user, logout } = useAuth();
  
  // Only re-renders when driver state changes
  const { isOnDuty, setIsOnDuty } = useDriver();
  
  // Only re-renders when orders change
  const { currentOrder, acceptOrder } = useOrders();
  
  return <div>...</div>;
}
```

### Accessing Earnings

```typescript
import { useOrders } from '@/stores';

function EarningsDisplay() {
  const { earnings } = useOrders(); // Already converted to euros
  
  return <div>€{earnings.toFixed(2)}</div>;
}
```

## 🔄 Migration from v3 to v4

The store automatically migrates from the old structure:

1. **Converts** `earnings` (float) → `earningsInCents` (int)
2. **Removes** persisted fields that shouldn't be persisted:
   - `currentOrder`
   - `driverStatus`
   - `isOnDuty`
   - `driverLocation`
   - `orders`
   - `messages`

## 🧪 Testing Considerations

### Testing Persistence

```typescript
// Clear localStorage between tests
beforeEach(() => {
  localStorage.clear();
});

// Test that critical fields are NOT persisted
it('should not persist currentOrder', () => {
  const { result } = renderHook(() => useAppStore());
  
  act(() => {
    result.current.acceptOrder('order-123');
  });
  
  // Simulate app restart
  const persistedData = JSON.parse(
    localStorage.getItem('one-connexion-store-v4') || '{}'
  );
  
  expect(persistedData.state.currentOrder).toBeUndefined();
});
```

### Testing Price Calculations

```typescript
it('should handle price calculations without floating-point errors', () => {
  const { result } = renderHook(() => useAppStore());
  
  // Add €0.10 + €0.20
  act(() => {
    result.current.acceptOrder('order-1'); // €0.10
    result.current.completeOrder();
    result.current.acceptOrder('order-2'); // €0.20
    result.current.completeOrder();
  });
  
  expect(result.current.getEarnings()).toBe(0.30); // Exact, no floating error
});
```

## 🚀 Performance Optimization

### Use Selector Hooks

Instead of:
```typescript
// ❌ Re-renders on ANY store change
const store = useAppStore();
```

Use:
```typescript
// ✅ Only re-renders on auth changes
const { user } = useAuth();
```

### Shallow Comparison

```typescript
import { shallow } from 'zustand/shallow';

const { orders, currentOrder } = useAppStore(
  (state) => ({ 
    orders: state.orders, 
    currentOrder: state.currentOrder 
  }),
  shallow
);
```

## 🔧 Maintenance

### Adding New State

1. **Determine the slice** - Auth, Driver, or Order?
2. **Update the slice interface** in `types.ts`
3. **Implement in the slice** file
4. **Decide on persistence** - Should it be persisted?
5. **Update `partialize`** if persisting

### Adding New Actions

1. **Add to slice interface** in `types.ts`
2. **Implement in slice** file
3. **Export via selector hook** if needed

## 📚 Best Practices

1. ✅ **Use selector hooks** for performance
2. ✅ **Store prices in cents** (integers)
3. ✅ **Use Decimal.js** for calculations
4. ✅ **Never persist volatile data** (location, active orders)
5. ✅ **Type everything** - No `any` types
6. ✅ **Document security decisions** in comments
7. ✅ **Test persistence behavior**

## 🐛 Common Pitfalls

### ❌ Don't Do This

```typescript
// Floating-point arithmetic
earnings += order.price; // Can cause errors

// Persisting active orders
partialize: (state) => ({
  currentOrder: state.currentOrder // DANGEROUS!
});

// Using 'any' type
const handleOrder = (order: any) => { ... }
```

### ✅ Do This Instead

```typescript
// Integer arithmetic with Decimal.js
const priceInCents = new Decimal(order.price).times(100).toNumber();
earningsInCents += priceInCents;

// Never persist active orders
partialize: (state) => ({
  history: state.history, // Only completed orders
  earningsInCents: state.earningsInCents
});

// Strict typing
const handleOrder = (order: Order) => { ... }
```

## 📞 Support

For questions or issues with the store architecture, refer to:
- This documentation
- TypeScript interfaces in `types.ts`
- Inline comments in slice files
