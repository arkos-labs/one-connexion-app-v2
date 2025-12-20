import { describe, it, expect, beforeEach } from 'vitest';
import { useAppStore } from '../useAppStore';
import Decimal from 'decimal.js';

describe('Store Architecture - Slices Pattern', () => {
    beforeEach(() => {
        // Clear localStorage before each test
        localStorage.clear();
        // Reset store to initial state
        useAppStore.setState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            isSplashComplete: false,
            driverStatus: 'offline',
            isOnDuty: false,
            driverLocation: { lat: 48.8566, lng: 2.3522 },
            orders: [],
            currentOrder: null,
            history: [],
            earningsInCents: 0,
            lastCompletedOrder: null,
            messages: [],
        });
    });

    describe('AuthSlice', () => {
        it('should set user and authentication status', () => {
            const { setUser } = useAppStore.getState();

            const mockUser = {
                id: '123',
                email: 'test@example.com',
                fullName: 'Test Driver',
                role: 'driver' as const,
            };

            setUser(mockUser);

            const state = useAppStore.getState();
            expect(state.user).toEqual(mockUser);
            expect(state.isAuthenticated).toBe(true);
        });

        it('should prevent logout when active order exists', () => {
            const { setUser, acceptOrder, logout } = useAppStore.getState();

            // Set user
            setUser({
                id: '123',
                email: 'test@example.com',
                fullName: 'Test Driver',
                role: 'driver',
            });

            // Add and accept an order
            useAppStore.setState({
                orders: [{
                    id: 'order-1',
                    clientName: 'Client Test',
                    pickupLocation: { lat: 48.8566, lng: 2.3522, address: 'Paris' },
                    dropoffLocation: { lat: 48.8606, lng: 2.3376, address: 'Louvre' },
                    price: 15.50,
                    distance: '2.5 km',
                    status: 'pending',
                }]
            });
            acceptOrder('order-1');

            // Try to logout
            const result = logout();

            expect(result).toBe(false);
            expect(useAppStore.getState().isAuthenticated).toBe(true);
        });

        it('should allow logout when no active order', () => {
            const { setUser, logout } = useAppStore.getState();

            setUser({
                id: '123',
                email: 'test@example.com',
                fullName: 'Test Driver',
                role: 'driver',
            });

            const result = logout();

            expect(result).toBe(true);
            expect(useAppStore.getState().isAuthenticated).toBe(false);
            expect(useAppStore.getState().user).toBeNull();
        });
    });

    describe('DriverSlice', () => {
        it('should update driver status', () => {
            const { setDriverStatus } = useAppStore.getState();

            setDriverStatus('online');

            const state = useAppStore.getState();
            expect(state.driverStatus).toBe('online');
            expect(state.isOnDuty).toBe(true);
        });

        it('should keep driver on duty when status is busy', () => {
            const { setDriverStatus } = useAppStore.getState();

            setDriverStatus('busy');

            const state = useAppStore.getState();
            expect(state.driverStatus).toBe('busy');
            expect(state.isOnDuty).toBe(true); // Should stay on duty when busy
        });

        it('should prevent going offline when active order exists', () => {
            const { setIsOnDuty, acceptOrder } = useAppStore.getState();

            // Set online
            setIsOnDuty(true);

            // Add and accept an order
            useAppStore.setState({
                orders: [{
                    id: 'order-1',
                    clientName: 'Client Test',
                    pickupLocation: { lat: 48.8566, lng: 2.3522, address: 'Paris' },
                    dropoffLocation: { lat: 48.8606, lng: 2.3376, address: 'Louvre' },
                    price: 15.50,
                    distance: '2.5 km',
                    status: 'pending',
                }]
            });
            acceptOrder('order-1');

            // Try to go offline
            const result = setIsOnDuty(false);

            expect(result).toBe(false);
            expect(useAppStore.getState().isOnDuty).toBe(true);
        });

        it('should update driver location', () => {
            const { setDriverLocation } = useAppStore.getState();

            const newLocation = { lat: 48.8738, lng: 2.2950 };
            setDriverLocation(newLocation);

            expect(useAppStore.getState().driverLocation).toEqual(newLocation);
        });

        it('should update preferences', () => {
            const { updatePreference } = useAppStore.getState();

            updatePreference('soundEnabled', false);

            expect(useAppStore.getState().preferences.soundEnabled).toBe(false);
        });
    });

    describe('OrderSlice', () => {
        it('should accept an order', () => {
            const { acceptOrder } = useAppStore.getState();

            useAppStore.setState({
                orders: [{
                    id: 'order-1',
                    clientName: 'Client Test',
                    pickupLocation: { lat: 48.8566, lng: 2.3522, address: 'Paris' },
                    dropoffLocation: { lat: 48.8606, lng: 2.3376, address: 'Louvre' },
                    price: 15.50,
                    distance: '2.5 km',
                    status: 'pending',
                }]
            });

            acceptOrder('order-1');

            const state = useAppStore.getState();
            expect(state.currentOrder).toBeDefined();
            expect(state.currentOrder?.status).toBe('accepted');
            expect(state.orders).toHaveLength(0);
            expect(state.driverStatus).toBe('busy');
        });

        it('should complete an order and update earnings', () => {
            const { acceptOrder, completeOrder } = useAppStore.getState();

            useAppStore.setState({
                orders: [{
                    id: 'order-1',
                    clientName: 'Client Test',
                    pickupLocation: { lat: 48.8566, lng: 2.3522, address: 'Paris' },
                    dropoffLocation: { lat: 48.8606, lng: 2.3376, address: 'Louvre' },
                    price: 15.50,
                    distance: '2.5 km',
                    status: 'pending',
                }]
            });

            acceptOrder('order-1');
            completeOrder();

            const state = useAppStore.getState();
            expect(state.currentOrder).toBeNull();
            expect(state.history).toHaveLength(1);
            expect(state.earningsInCents).toBe(1550); // €15.50 = 1550 cents
            expect(state.getEarnings()).toBe(15.50);
            expect(state.driverStatus).toBe('online');
        });

        it('should handle multiple orders without floating-point errors', () => {
            const { acceptOrder, completeOrder } = useAppStore.getState();

            // Order 1: €0.10
            useAppStore.setState({
                orders: [{
                    id: 'order-1',
                    clientName: 'Client 1',
                    pickupLocation: { lat: 48.8566, lng: 2.3522, address: 'Paris' },
                    dropoffLocation: { lat: 48.8606, lng: 2.3376, address: 'Louvre' },
                    price: 0.10,
                    distance: '1 km',
                    status: 'pending',
                }]
            });
            acceptOrder('order-1');
            completeOrder();

            // Order 2: €0.20
            useAppStore.setState({
                orders: [{
                    id: 'order-2',
                    clientName: 'Client 2',
                    pickupLocation: { lat: 48.8566, lng: 2.3522, address: 'Paris' },
                    dropoffLocation: { lat: 48.8606, lng: 2.3376, address: 'Louvre' },
                    price: 0.20,
                    distance: '1 km',
                    status: 'pending',
                }]
            });
            acceptOrder('order-2');
            completeOrder();

            const state = useAppStore.getState();

            // Should be exactly 0.30, not 0.30000000000000004
            expect(state.getEarnings()).toBe(0.30);
            expect(state.earningsInCents).toBe(30);
        });

        it('should reject an order', () => {
            const { rejectOrder } = useAppStore.getState();

            useAppStore.setState({
                orders: [
                    {
                        id: 'order-1',
                        clientName: 'Client 1',
                        pickupLocation: { lat: 48.8566, lng: 2.3522, address: 'Paris' },
                        dropoffLocation: { lat: 48.8606, lng: 2.3376, address: 'Louvre' },
                        price: 15.50,
                        distance: '2.5 km',
                        status: 'pending',
                    },
                    {
                        id: 'order-2',
                        clientName: 'Client 2',
                        pickupLocation: { lat: 48.8566, lng: 2.3522, address: 'Paris' },
                        dropoffLocation: { lat: 48.8606, lng: 2.3376, address: 'Louvre' },
                        price: 20.00,
                        distance: '3 km',
                        status: 'pending',
                    }
                ]
            });

            rejectOrder('order-1');

            const state = useAppStore.getState();
            expect(state.orders).toHaveLength(1);
            expect(state.orders[0].id).toBe('order-2');
        });
    });

    describe('Persistence', () => {
        it('should persist user and preferences', () => {
            const { setUser, updatePreference } = useAppStore.getState();

            setUser({
                id: '123',
                email: 'test@example.com',
                fullName: 'Test Driver',
                role: 'driver',
            });

            updatePreference('soundEnabled', false);

            // Get persisted data
            const persistedData = JSON.parse(
                localStorage.getItem('one-connexion-store-v4') || '{}'
            );

            expect(persistedData.state.user).toBeDefined();
            expect(persistedData.state.preferences.soundEnabled).toBe(false);
        });

        it('should NOT persist currentOrder (security)', () => {
            const { acceptOrder } = useAppStore.getState();

            useAppStore.setState({
                orders: [{
                    id: 'order-1',
                    clientName: 'Client Test',
                    pickupLocation: { lat: 48.8566, lng: 2.3522, address: 'Paris' },
                    dropoffLocation: { lat: 48.8606, lng: 2.3376, address: 'Louvre' },
                    price: 15.50,
                    distance: '2.5 km',
                    status: 'pending',
                }]
            });

            acceptOrder('order-1');

            // Get persisted data
            const persistedData = JSON.parse(
                localStorage.getItem('one-connexion-store-v4') || '{}'
            );

            expect(persistedData.state.currentOrder).toBeUndefined();
        });

        it('should NOT persist driverLocation (security)', () => {
            const { setDriverLocation } = useAppStore.getState();

            setDriverLocation({ lat: 48.8738, lng: 2.2950 });

            // Get persisted data
            const persistedData = JSON.parse(
                localStorage.getItem('one-connexion-store-v4') || '{}'
            );

            expect(persistedData.state.driverLocation).toBeUndefined();
        });

        it('should NOT persist isOnDuty (security)', () => {
            const { setIsOnDuty } = useAppStore.getState();

            setIsOnDuty(true);

            // Get persisted data
            const persistedData = JSON.parse(
                localStorage.getItem('one-connexion-store-v4') || '{}'
            );

            expect(persistedData.state.isOnDuty).toBeUndefined();
        });
    });

    describe('Price Calculations with Decimal.js', () => {
        it('should use Decimal.js for precise calculations', () => {
            // Test that we avoid floating-point errors
            const price1 = new Decimal(0.1);
            const price2 = new Decimal(0.2);
            const sum = price1.plus(price2);

            expect(sum.toNumber()).toBe(0.3); // Exact, not 0.30000000000000004
        });

        it('should convert euros to cents correctly', () => {
            const euros = 15.50;
            const cents = new Decimal(euros).times(100).toDecimalPlaces(0).toNumber();

            expect(cents).toBe(1550);
        });

        it('should convert cents to euros correctly', () => {
            const cents = 1550;
            const euros = new Decimal(cents).dividedBy(100).toDecimalPlaces(2).toNumber();

            expect(euros).toBe(15.50);
        });
    });
});
