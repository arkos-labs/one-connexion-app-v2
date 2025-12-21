export interface Order {
  id: string;
  pickupLocation: {
    lat: number;
    lng: number;
    address: string;
  };
  dropoffLocation: {
    lat: number;
    lng: number;
    address: string;
  };
  clientName: string;
  price: number;
  priceInCents: number; // For consistency with store
  distance: string;
  status: 'pending' | 'assigned' | 'accepted' | 'arrived_pickup' | 'in_progress' | 'completed' | 'cancelled';
  assignedDriverId?: string;
  createdAt: string; // ISO string
  completedAt?: string;
  paymentMethod?: 'card' | 'cash';
  pickupAddress: string; // Flat field for easier access in lists
  dropoffAddress: string; // Flat field for easier access in lists
  proof?: {
    type: 'signature' | 'photo';
    dataUrl: string;
    timestamp: string;
  };
}

export interface DriverProfile {
  id: string;
  name: string;
  phone: string;
  vehicleInfo: string;
  rating: number;
  totalEarnings: number;
}
