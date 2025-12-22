import { Order } from "../types";

export type UserRole = "driver" | "dispatcher" | "admin";
export type DriverStatus = "online" | "busy" | "offline";

export interface User {
    id: string;
    email: string;
    fullName: string;
    role: UserRole;
    avatarUrl?: string;
}

export interface DriverDocument {
    id: string;
    name: string;
    status: 'verified' | 'pending' | 'expired' | 'missing';
    expiryDate?: string;
}

export interface DriverPreferences {
    vehicleType: "car" | "bike" | "scooter";
    navigationApp: "waze" | "google_maps" | "apple_maps";
    soundEnabled: boolean;
    darkMode: boolean;
    autoAccept: boolean;
}

export interface Vehicle {
    model: string;
    plate: string;
    color: string;
}

export interface ChatMessage {
    id: string;
    sender: 'driver' | 'dispatch';
    text: string;
    timestamp: string;
}

// ============ AUTH SLICE ============
export interface AuthSlice {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    isSplashComplete: boolean;

    // Actions
    setUser: (user: User | null) => void;
    setIsLoading: (loading: boolean) => void;
    setSplashComplete: (complete: boolean) => void;
    signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    signUp: (data: { email: string; password: string; fullName: string; vehicleType: DriverPreferences['vehicleType'] }) => Promise<{ success: boolean; error?: string }>;
    logout: () => Promise<boolean>;
}

// ============ DRIVER SLICE ============
export interface DriverSlice {
    // Status & Location (NOT persisted)
    driverStatus: DriverStatus;
    isOnDuty: boolean;
    driverLocation: { lat: number; lng: number };

    // Profile & Vehicle (persisted)
    vehicle: Vehicle | null;
    documents: DriverDocument[];
    preferences: DriverPreferences;

    // Chat (NOT persisted)
    messages: ChatMessage[];

    // Actions
    setDriverStatus: (status: DriverStatus) => void;
    setIsOnDuty: (isOnDuty: boolean) => boolean;
    setDriverLocation: (location: { lat: number; lng: number }) => void;
    updatePreferences: (prefs: Partial<DriverPreferences>) => void;
    updatePreference: <K extends keyof DriverPreferences>(key: K, value: DriverPreferences[K]) => void;
    updateDocumentStatus: (docId: string, status: DriverDocument['status']) => void;
    addMessage: (text: string, sender: 'driver' | 'dispatch') => void;
    clearMessages: () => void;
}

// ============ ORDER SLICE ============
export interface OrderSlice {
    // Orders state (NOT persisted - critical security requirement)
    orders: Order[];
    currentOrder: Order | null;
    history: Order[];
    earningsInCents: number; // Store in cents to avoid floating point errors
    lastCompletedOrder: Order | null;
    refusedOrderIds: string[]; // Blacklist des commandes refusées (évite le spam)

    // Actions
    acceptOrder: (orderId: string) => Promise<void>;
    updateOrderStatus: (orderId: string, status: Order['status']) => Promise<void>;
    completeOrder: (proof?: Order['proof']) => Promise<void>;
    rejectOrder: (orderId: string) => Promise<void>;
    initializeOrders: () => Promise<void>;
    subscribeToNewOrders: () => () => void; // Returns unsubscribe function
    triggerNewOrder: () => void;
    clearSummary: () => void;

    // Computed getters
    getEarnings: () => number; // Returns earnings in euros
}

// Combined store type
export type AppStore = AuthSlice & DriverSlice & OrderSlice;
