/**
 * Store Module Exports
 * 
 * This module provides a clean, organized export structure for the Zustand store.
 * Use the selector hooks for optimized performance.
 */

// Main store and selector hooks
export {
    useAppStore,
    useAuth,
    useDriver,
    useOrders,
} from './useAppStore';

// Types
export type {
    AppStore,
    AuthSlice,
    DriverSlice,
    OrderSlice,
    User,
    UserRole,
    DriverStatus,
    DriverDocument,
    DriverPreferences,
    Vehicle,
    ChatMessage,
} from './types';
