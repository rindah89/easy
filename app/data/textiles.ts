// Define interfaces for data types
export interface Textile {
  id: string;
  name: string;
  type: string;
  description: string;
  price: number;
  currency: string;
  imageUrl: any;
  rating: number;
  reviewCount: number;
  available: boolean;
  tags: string[];
  colors: Array<{ label: string; value: string }>;
  fabricWeight: string;
  fabricWidth: string;
  minimumOrder: string;
}

// Sample textile data
export const textiles: Textile[] = [
  {
    id: '1',
    name: 'Premium Merino Wool',
    type: 'Wool',
    description: 'Luxurious fine merino wool fabric, ideal for suits and formal wear. Soft texture with excellent drape and breathability.',
    price: 8000,
    currency: 'XAF',
    imageUrl: require('../../assets/images/merino-wool.jpg'),
    rating: 4.8,
    reviewCount: 124,
    available: true,
    tags: ['Premium', 'Suit', 'Formal'],
    colors: [
      { label: 'Navy Blue', value: '#1a2b4c' },
      { label: 'Charcoal', value: '#36454f' },
      { label: 'Black', value: '#000000' },
      { label: 'Grey', value: '#808080' }
    ],
    fabricWeight: '240 g/m²',
    fabricWidth: '150cm',
    minimumOrder: '1m'
  },
  {
    id: '2',
    name: 'Egyptian Cotton Shirting',
    type: 'Cotton',
    description: 'High thread count Egyptian cotton fabric perfect for bespoke shirts. Breathable with a silky smooth finish.',
    price: 5500,
    currency: 'XAF',
    imageUrl: require('../../assets/images/egyptian cotton.jpg'),
    rating: 4.6,
    reviewCount: 87,
    available: true,
    tags: ['Premium', 'Shirt', 'Breathable'],
    colors: [
      { label: 'White', value: '#ffffff' },
      { label: 'Light Blue', value: '#add8e6' },
      { label: 'Pink', value: '#ffc0cb' },
      { label: 'Striped', value: '#f5f5f5' }
    ],
    fabricWeight: '120 g/m²',
    fabricWidth: '150cm',
    minimumOrder: '0.5m'
  },
  {
    id: '3',
    name: 'Italian Linen Blend',
    type: 'Linen',
    description: 'Premium Italian linen-cotton blend, perfect for summer suits and jackets. Lightweight with natural texture.',
    price: 6700,
    currency: 'XAF',
    imageUrl: require('../../assets/images/italian-linen.jpg'),
    rating: 4.7,
    reviewCount: 62,
    available: true,
    tags: ['Summer', 'Breathable', 'Jacket'],
    colors: [
      { label: 'Beige', value: '#f5f5dc' },
      { label: 'Light Grey', value: '#d3d3d3' },
      { label: 'Olive', value: '#808000' },
      { label: 'Natural', value: '#fdf5e6' }
    ],
    fabricWeight: '210 g/m²',
    fabricWidth: '140cm',
    minimumOrder: '1m'
  },
  {
    id: '4',
    name: 'Silk Duchesse Satin',
    type: 'Silk',
    description: 'Luxurious silk duchesse satin with a lustrous finish. Ideal for evening wear and special occasion garments.',
    price: 12000,
    currency: 'XAF',
    imageUrl: require('../../assets/images/silk-duchess-satin.jpg'),
    rating: 4.9,
    reviewCount: 43,
    available: true,
    tags: ['Luxury', 'Evening', 'Formal'],
    colors: [
      { label: 'Black', value: '#000000' },
      { label: 'Ivory', value: '#fffff0' },
      { label: 'Navy', value: '#000080' },
      { label: 'Burgundy', value: '#800020' }
    ],
    fabricWeight: '80 g/m²',
    fabricWidth: '114cm',
    minimumOrder: '0.5m'
  },
  {
    id: '5',
    name: 'Harris Tweed',
    type: 'Wool',
    description: 'Authentic Harris Tweed, hand-woven in the Outer Hebrides. Durable and perfect for jackets and outerwear.',
    price: 9500,
    currency: 'XAF',
    imageUrl: require('../../assets/images/harris-tweed.jpg'),
    rating: 4.8,
    reviewCount: 96,
    available: true,
    tags: ['Premium', 'Jacket', 'Outerwear'],
    colors: [
      { label: 'Brown Herringbone', value: '#8b4513' },
      { label: 'Green Check', value: '#006400' },
      { label: 'Grey Herringbone', value: '#708090' }
    ],
    fabricWeight: '450 g/m²',
    fabricWidth: '150cm',
    minimumOrder: '1m'
  },
];

// Add a default export (non-React) to satisfy Expo Router
export default { 
  name: "TextilesData",
  description: "This is not a route, just a data file"
}; 