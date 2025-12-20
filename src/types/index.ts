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
  distance: string;
  status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
}

export interface DriverProfile {
  id: string;
  name: string;
  phone: string;
  vehicleInfo: string;
  rating: number;
  totalEarnings: number;
}
