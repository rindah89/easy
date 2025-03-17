export interface Driver {
  id: string;
  name: string;
  rating: number;
  trips: number;
  vehicle: string;
  licensePlate: string;
  photoUrl: string;
  eta: number; // estimated time of arrival in minutes
}

export interface RideType {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  eta: number; // estimated time in minutes
  image: string; // image source URL
  capacity: number;
}

// Mock data for drivers
export const mockDrivers: Driver[] = [
  {
    id: 'd1',
    name: 'Jean Etienne',
    rating: 4.8,
    trips: 1245,
    vehicle: 'Toyota Corolla (Black)',
    licensePlate: 'LT 308 SW',
    photoUrl: 'https://randomuser.me/api/portraits/men/32.jpg',
    eta: 3
  },
  {
    id: 'd2',
    name: 'Marie Ngono',
    rating: 4.9,
    trips: 2341,
    vehicle: 'Honda Accord (White)',
    licensePlate: 'CE 567 LT',
    photoUrl: 'https://randomuser.me/api/portraits/women/44.jpg',
    eta: 5
  },
  {
    id: 'd3',
    name: 'Michel Ekambi',
    rating: 4.7,
    trips: 893,
    vehicle: 'Hyundai Elantra (Blue)',
    licensePlate: 'SW 2022 CE',
    photoUrl: 'https://randomuser.me/api/portraits/men/67.jpg',
    eta: 7
  },
  {
    id: 'd4',
    name: 'Sophie Mbarga',
    rating: 4.95,
    trips: 1587,
    vehicle: 'Yamaha YBR (Red)',
    licensePlate: 'MOTO 01',
    photoUrl: 'https://randomuser.me/api/portraits/women/28.jpg',
    eta: 2
  },
  {
    id: 'd5',
    name: 'Daniel Waffo',
    rating: 4.6,
    trips: 742,
    vehicle: 'Mercedes C-Class (Black)',
    licensePlate: 'LT 555 SW',
    photoUrl: 'https://randomuser.me/api/portraits/men/91.jpg',
    eta: 8
  }
];

// Mock data for ride types
export const rideTypes: RideType[] = [
  {
    id: 'standard',
    name: 'Standard',
    description: 'Affordable, everyday rides',
    price: 2500,
    currency: 'XAF',
    eta: 5,
    image: 'https://pngimg.com/d/hyundai_PNG11210.png',
    capacity: 4
  },
  {
    id: 'premium',
    name: 'Premium',
    description: 'High-end cars with top-rated drivers',
    price: 5000,
    currency: 'XAF',
    eta: 8,
    image: 'https://pngimg.com/d/mercedes_PNG80143.png',
    capacity: 4
  },
  {
    id: 'bike',
    name: 'Moto',
    description: 'Quick rides on motorbike, perfect for traffic',
    price: 1500,
    currency: 'XAF',
    eta: 3,
    image: 'https://pngimg.com/d/motorcycle_PNG3156.png',
    capacity: 1
  }
];

// Mock locations
export const popularLocations = [
  { id: '1', name: 'Home', address: '123 Rue de la Paix, Bonanjo, Douala', isSaved: true },
  { id: '2', name: 'Work', address: 'Akwa Business Center, Douala', isSaved: true },
  { id: '3', name: 'Marché Central', address: 'Marché Central, Douala', isSaved: false },
  { id: '4', name: 'Airport', address: 'Aéroport International de Douala', isSaved: false },
  { id: '5', name: 'Shopping Mall', address: 'Douala Grand Mall, Bonapriso', isSaved: false },
];

// Recent rides
export const recentRides = [
  { 
    id: 'r1', 
    pickup: '123 Rue de la Paix, Bonanjo, Douala', 
    destination: 'Marché Central, Douala',
    date: '2023-03-10',
    price: 2800,
    driverId: 'd1'
  },
  { 
    id: 'r2', 
    pickup: 'Akwa Business Center, Douala', 
    destination: 'Bonapriso, Douala',
    date: '2023-03-08',
    price: 2500,
    driverId: 'd3'
  },
  { 
    id: 'r3', 
    pickup: 'Aéroport International de Douala', 
    destination: 'Hôtel Akwa Palace, Douala',
    date: '2023-03-01',
    price: 4500,
    driverId: 'd2'
  },
]; 