import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppPreferences {
    navigationApp: 'waze' | 'google_maps' | 'apple_maps';
    theme: 'dark' | 'light' | 'system';
    notifications: boolean;
    autoAccept: boolean;
}

interface AppPreferencesStore {
    preferences: AppPreferences;
    setPreference: (key: keyof AppPreferences, value: any) => void;
    openGPS: (lat: number, lng: number) => void;
}

export const useAppPreferences = create<AppPreferencesStore>()(
    persist(
        (set, get) => ({
            preferences: {
                navigationApp: 'google_maps',
                theme: 'dark',
                notifications: true,
                autoAccept: false,
            },
            setPreference: (key, value) =>
                set((state) => ({ preferences: { ...state.preferences, [key]: value } })),

            openGPS: (lat, lng) => {
                const { navigationApp } = get().preferences;
                let url = '';

                switch (navigationApp) {
                    case 'waze':
                        url = `https://waze.com/ul?ll=${lat},${lng}&navigate=yes`;
                        break;
                    case 'apple_maps':
                        url = `http://maps.apple.com/?daddr=${lat},${lng}`;
                        break;
                    case 'google_maps':
                    default:
                        url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
                        break;
                }

                window.open(url, '_blank');
            }
        }),
        {
            name: 'driver-preferences',
        }
    )
);
