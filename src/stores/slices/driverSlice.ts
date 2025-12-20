import { StateCreator } from "zustand";
import { AppStore, DriverSlice } from "../types";

/**
 * DriverSlice - Manages driver status, location, profile, and preferences
 * 
 * SECURITY NOTES:
 * - driverLocation is NOT persisted (real-time data only)
 * - driverStatus and isOnDuty are NOT persisted (prevents ghost online status)
 * - Only preferences, vehicle, and documents are persisted
 */
export const createDriverSlice: StateCreator<
    AppStore,
    [],
    [],
    DriverSlice
> = (set, get) => ({
    // Real-time state (NOT persisted)
    driverStatus: "offline",
    isOnDuty: false,
    driverLocation: { lat: 48.8566, lng: 2.3522 }, // Default: Paris center

    // Profile data (persisted)
    vehicle: {
        model: "Toyota Prius",
        plate: "AB-123-CD",
        color: "Gris Minéral"
    },

    documents: [
        {
            id: "1",
            name: "Permis de conduire",
            status: "verified",
            expiryDate: "2025-01-01"
        },
        {
            id: "2",
            name: "Carte VTC",
            status: "verified",
            expiryDate: "2024-12-15"
        },
        {
            id: "3",
            name: "Assurance RC Pro",
            status: "expired",
            expiryDate: "2023-11-20"
        },
        {
            id: "4",
            name: "Kbis",
            status: "pending"
        },
        {
            id: "5",
            name: "Assurance Véhicule",
            status: "missing"
        },
    ],

    preferences: {
        vehicleType: "car",
        navigationApp: "google_maps",
        soundEnabled: true,
        darkMode: false,
        autoAccept: false,
    },

    // Chat messages (NOT persisted)
    messages: [],

    // Actions
    setDriverStatus: (status) => set({
        driverStatus: status,
        // Keep driver on duty when online OR busy (during active order)
        isOnDuty: status === 'online' || status === 'busy'
    }),

    setIsOnDuty: (isOnDuty) => {
        const state = get();

        // SECURITY: Prevent going offline if driver has an active order
        if (!isOnDuty && state.currentOrder) {
            console.warn("Cannot go offline: Active order in progress");
            return false;
        }

        set({
            isOnDuty,
            driverStatus: isOnDuty ? "online" : "offline"
        });

        return true;
    },

    setDriverLocation: (location) => set({ driverLocation: location }),

    updatePreferences: (prefs) => set((state) => ({
        preferences: { ...state.preferences, ...prefs }
    })),

    updatePreference: (key, value) => set((state) => ({
        preferences: { ...state.preferences, [key]: value }
    })),

    updateDocumentStatus: (docId, status) => set((state) => ({
        documents: state.documents.map(doc =>
            doc.id === docId ? { ...doc, status } : doc
        )
    })),

    addMessage: (text, sender) => {
        const newMessage = {
            id: Math.random().toString(36).substring(2, 11),
            sender,
            text,
            timestamp: new Date().toISOString()
        };

        set((state) => ({
            messages: [...state.messages, newMessage]
        }));

        // Auto-response from dispatch
        if (sender === 'driver') {
            setTimeout(() => {
                const responses = [
                    "Bien reçu 10-4. On note l'information.",
                    "C'est noté. Restez en attente.",
                    "Nous contactons le client pour vous.",
                    "Merci pour le signalement. Continuez la mission.",
                    "Pouvez-vous confirmer votre position ?",
                    "Information transmise au superviseur."
                ];
                const randomResponse = responses[Math.floor(Math.random() * responses.length)];
                get().addMessage(randomResponse, 'dispatch');
            }, 4000);
        }
    },

    clearMessages: () => set({ messages: [] }),
});
