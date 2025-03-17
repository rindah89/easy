import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, Image, TouchableOpacity, FlatList, ImageSourcePropType, Dimensions, Alert, Modal } from 'react-native';
import { useTheme } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '../components/CustomText';
import { Card } from '../components/CustomCard';
import { SearchBar } from '../components/CustomSearchBar';
import { IconButton } from '../components/CustomIconButton';
import { Divider } from '../components/CustomDivider';
import { Chip } from '../components/CustomChip';
import { Badge } from '../components/CustomBadge';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Button } from '../components/Button';
import { useCart, CartItem, CartItemColorDetail } from '../context/CartContext';

// Helper function to generate a unique UUID
const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// Interfaces
interface Restaurant {
  id: string;
  name: string;
  image: ImageSourcePropType;
  cuisine: string;
  rating: number;
  deliveryTime: string;
  deliveryFee: string;
  minOrder: string;
  description?: string;
  address?: string;
  openingHours?: string;
  featured?: boolean;
  distance?: string;
}

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: string;
  image: ImageSourcePropType;
  category: string;
  popular?: boolean;
  vegetarian?: boolean;
  spicy?: boolean;
}

interface MenuCategory {
  id: string;
  name: string;
  items: MenuItem[];
}

// Mock restaurant data
const restaurantsData: Record<string, Restaurant> = {
  '1': {
    id: '1',
    name: 'Pizzeria Italiana',
    image: { uri: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=400' },
    cuisine: 'Italian',
    rating: 4.7,
    deliveryTime: '25-35 min',
    deliveryFee: '800 XAF',
    minOrder: '3000 XAF',
    description: 'Authentic Italian pizzeria serving traditional wood-fired pizzas, pasta, and Italian specialties.',
    address: '123 Main Street, Douala',
    openingHours: '10:00 AM - 10:00 PM',
    distance: '1.2 km',
  },
  '2': {
    id: '2',
    name: 'Golden Dragon',
    image: { uri: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=400' },
    cuisine: 'Chinese',
    rating: 4.5,
    deliveryTime: '30-45 min',
    deliveryFee: '600 XAF',
    minOrder: '3500 XAF',
    description: 'Traditional Chinese restaurant offering a variety of authentic dishes from different regions of China.',
    address: '456 Dragon Street, Douala',
    openingHours: '11:00 AM - 11:00 PM',
    featured: true,
    distance: '2.5 km',
  },
  '3': {
    id: '3',
    name: 'Sushi Master',
    image: { uri: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?q=80&w=400' },
    cuisine: 'Japanese',
    rating: 4.9,
    deliveryTime: '35-50 min',
    deliveryFee: '1200 XAF',
    minOrder: '6000 XAF',
    description: 'Premium Japanese restaurant specializing in fresh sushi, sashimi, and other Japanese delicacies.',
    address: '789 Ocean Avenue, Douala',
    openingHours: '12:00 PM - 10:00 PM',
    distance: '3.7 km',
  },
  '4': {
    id: '4',
    name: 'Burger House',
    image: { uri: 'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?q=80&w=400' },
    cuisine: 'American',
    rating: 4.5,
    deliveryTime: '20-30 min',
    deliveryFee: '500 XAF',
    minOrder: '2500 XAF',
    description: 'Classic American burger joint offering a variety of gourmet burgers, fries, and milkshakes.',
    address: '321 Burger Lane, Douala',
    openingHours: '10:00 AM - 11:00 PM',
    featured: true,
    distance: '0.8 km',
  },
  '5': {
    id: '5',
    name: 'Thai Spice',
    image: { uri: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?q=80&w=400' },
    cuisine: 'Thai',
    rating: 4.6,
    deliveryTime: '30-45 min',
    deliveryFee: '700 XAF',
    minOrder: '3000 XAF',
    description: 'Authentic Thai restaurant offering traditional dishes with fresh ingredients and aromatic spices.',
    address: '567 Spice Road, Douala',
    openingHours: '11:00 AM - 10:00 PM',
    distance: '1.9 km',
  },
};

// Mock menu data for each restaurant
const menuData: Record<string, MenuCategory[]> = {
  '1': [
    {
      id: 'pizzas',
      name: 'Pizzas',
      items: [
        {
          id: '1',
          name: 'Margherita Pizza',
          description: 'Classic pizza with tomato sauce, mozzarella, and fresh basil',
          price: '5500 XAF',
          image: { uri: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?q=80&w=300' },
          category: 'Pizzas',
          popular: true,
          vegetarian: true,
        },
        {
          id: '2',
          name: 'Pepperoni Pizza',
          description: 'Tomato sauce, mozzarella cheese, and pepperoni',
          price: '6000 XAF',
          image: { uri: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?q=80&w=300' },
          category: 'Pizzas',
          popular: true,
        },
        {
          id: '3',
          name: 'Quattro Formaggi',
          description: 'Four cheese pizza with mozzarella, gorgonzola, fontina, and parmesan',
          price: '6800 XAF',
          image: { uri: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=300' },
          category: 'Pizzas',
          vegetarian: true,
        },
      ],
    },
    {
      id: 'pasta',
      name: 'Pasta',
      items: [
        {
          id: '4',
          name: 'Spaghetti Carbonara',
          description: 'Spaghetti with pancetta, eggs, pecorino cheese, and black pepper',
          price: '4800 XAF',
          image: { uri: 'https://images.unsplash.com/photo-1600803907087-f56d462fd26b?q=80&w=300' },
          category: 'Pasta',
        },
        {
          id: '5',
          name: 'Fettuccine Alfredo',
          description: 'Fettuccine pasta with creamy parmesan sauce',
          price: '5200 XAF',
          image: { uri: 'https://images.unsplash.com/photo-1645112411341-6c4fd023882c?q=80&w=300' },
          category: 'Pasta',
          vegetarian: true,
        },
      ],
    },
    {
      id: 'desserts',
      name: 'Desserts',
      items: [
        {
          id: '6',
          name: 'Tiramisu',
          description: 'Classic Italian dessert with coffee-soaked ladyfingers and mascarpone cream',
          price: '3500 XAF',
          image: { uri: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?q=80&w=300' },
          category: 'Desserts',
          vegetarian: true,
        },
      ],
    },
  ],
  '3': [
    {
      id: 'sushi',
      name: 'Sushi',
      items: [
        {
          id: '7',
          name: 'Sushi Platter',
          description: 'Assorted fresh nigiri and maki rolls (12 pieces)',
          price: '9900 XAF',
          image: { uri: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?q=80&w=300' },
          category: 'Sushi',
          popular: true,
        },
        {
          id: '8',
          name: 'Salmon Nigiri',
          description: 'Fresh salmon over pressed vinegared rice (4 pieces)',
          price: '4200 XAF',
          image: { uri: 'https://images.unsplash.com/photo-1583623025817-d180a2221d0a?q=80&w=300' },
          category: 'Sushi',
        },
      ],
    },
    {
      id: 'soups',
      name: 'Soups & Noodles',
      items: [
        {
          id: '9',
          name: 'Miso Soup',
          description: 'Traditional Japanese soup with tofu, seaweed, and green onions',
          price: '1800 XAF',
          image: { uri: 'https://images.unsplash.com/photo-1557872943-16a5ac26437e?q=80&w=300' },
          category: 'Soups',
          vegetarian: true,
        },
      ],
    },
  ],
  '4': [
    {
      id: 'burgers',
      name: 'Burgers',
      items: [
        {
          id: '10',
          name: 'Classic Beef Burger',
          description: 'Beef patty with lettuce, tomato, onion, and special sauce',
          price: '4200 XAF',
          image: { uri: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=300' },
          category: 'Burgers',
          popular: true,
        },
        {
          id: '11',
          name: 'Cheeseburger',
          description: 'Beef patty with cheddar cheese, lettuce, tomato, onion, and special sauce',
          price: '4600 XAF',
          image: { uri: 'https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?q=80&w=300' },
          category: 'Burgers',
          popular: true,
        },
      ],
    },
    {
      id: 'sides',
      name: 'Sides',
      items: [
        {
          id: '12',
          name: 'French Fries',
          description: 'Crispy golden French fries with sea salt',
          price: '1800 XAF',
          image: { uri: 'https://images.unsplash.com/photo-1630384060421-cb20d0e0649d?q=80&w=300' },
          category: 'Sides',
          vegetarian: true,
        },
      ],
    },
  ],
  '2': [
    {
      id: 'starters',
      name: 'Starters',
      items: [
        {
          id: '13',
          name: 'Spring Rolls',
          description: 'Crispy vegetable spring rolls with sweet chili sauce (4 pieces)',
          price: '2800 XAF',
          image: { uri: 'https://images.unsplash.com/photo-1606333259737-23e282db1b34?q=80&w=300' },
          category: 'Starters',
          vegetarian: true,
        },
      ],
    },
    {
      id: 'main',
      name: 'Main Courses',
      items: [
        {
          id: '14',
          name: 'Kung Pao Chicken',
          description: 'Spicy stir-fried chicken with peanuts, vegetables, and chili peppers',
          price: '5200 XAF',
          image: { uri: 'https://images.unsplash.com/photo-1525755662778-989d0524087e?q=80&w=300' },
          category: 'Main Courses',
          popular: true,
          spicy: true,
        },
        {
          id: '15',
          name: 'Beef with Broccoli',
          description: 'Sliced beef stir-fried with broccoli in savory sauce',
          price: '5500 XAF',
          image: { uri: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?q=80&w=300' },
          category: 'Main Courses',
        },
      ],
    },
  ],
  '5': [
    {
      id: 'curry',
      name: 'Curries',
      items: [
        {
          id: '16',
          name: 'Green Curry',
          description: 'Spicy Thai green curry with choice of chicken or vegetables',
          price: '4800 XAF',
          image: { uri: 'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?q=80&w=300' },
          category: 'Curries',
          popular: true,
          spicy: true,
        },
        {
          id: '17',
          name: 'Massaman Curry',
          description: 'Rich, mildly spicy curry with potatoes, onions, and peanuts',
          price: '5200 XAF',
          image: { uri: 'https://images.unsplash.com/photo-1574484284002-952d92456975?q=80&w=300' },
          category: 'Curries',
        },
      ],
    },
    {
      id: 'noodles',
      name: 'Noodles',
      items: [
        {
          id: '18',
          name: 'Pad Thai',
          description: 'Stir-fried rice noodles with eggs, tofu, bean sprouts, and peanuts',
          price: '3800 XAF',
          image: { uri: 'https://images.unsplash.com/photo-1559314809-0d155014e29e?q=80&w=300' },
          category: 'Noodles',
          popular: true,
          vegetarian: true,
        },
      ],
    },
  ],
};

// Success Modal Component
const SuccessModal = ({ 
  visible, 
  onClose, 
  itemCount, 
  onContinueShopping,
  onViewCart 
}: { 
  visible: boolean; 
  onClose: () => void;
  itemCount: number;
  onContinueShopping: () => void;
  onViewCart: () => void;
}) => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContainer, { marginTop: insets.top + 20 }]}>
          <View style={styles.modalIconContainer}>
            <MaterialCommunityIcons 
              name="check-circle" 
              size={60} 
              color={theme.colors.primary} 
            />
          </View>
          
          <Text variant="headlineSmall" style={styles.modalTitle}>
            Success!
          </Text>
          
          <Text variant="bodyLarge" style={styles.modalDescription}>
            {itemCount} {itemCount === 1 ? 'item' : 'items'} added to your cart
          </Text>
          
          <View style={styles.modalButtonsContainer}>
            <Button
              mode="outlined"
              onPress={onContinueShopping}
              style={[styles.modalButton, styles.outlinedButton]}
            >
              Continue Shopping
            </Button>
            
            <Button
              mode="contained"
              onPress={onViewCart}
              style={styles.modalButton}
            >
              View Cart
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// Main component
export default function RestaurantMenu() {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ restaurantId: string; highlightedMealId?: string }>();
  const { addToCart, cartItems: existingCartItems } = useCart();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [menuCategories, setMenuCategories] = useState<MenuCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [localCartItems, setLocalCartItems] = useState<Record<string, number>>({});
  const [totalAmount, setTotalAmount] = useState(0);
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  
  // Get total cart items
  const totalCartItems = Object.values(localCartItems).reduce((acc, curr) => acc + curr, 0);
  
  // Load restaurant and menu data based on restaurant ID
  useEffect(() => {
    if (params.restaurantId) {
      const restaurantData = restaurantsData[params.restaurantId];
      const menuCategoriesData = menuData[params.restaurantId] || [];
      
      setRestaurant(restaurantData);
      setMenuCategories(menuCategoriesData);
      
      if (menuCategoriesData.length > 0 && !selectedCategory) {
        setSelectedCategory(menuCategoriesData[0].id);
      }
      
      // If a highlighted meal is specified, find its category and select it
      if (params.highlightedMealId) {
        for (const category of menuCategoriesData) {
          const foundItem = category.items.find(item => item.id === params.highlightedMealId);
          if (foundItem) {
            setSelectedCategory(category.id);
            break;
          }
        }
      }
    }
  }, [params.restaurantId, params.highlightedMealId]);
  
  // Calculate total amount whenever cart changes
  useEffect(() => {
    let total = 0;
    
    Object.entries(localCartItems).forEach(([itemId, quantity]) => {
      // Find the menu item by ID
      for (const category of menuCategories) {
        const item = category.items.find(item => item.id === itemId);
        if (item) {
          // Extract numeric value from price string (e.g., "5500 XAF" -> 5500)
          const priceValue = parseInt(item.price.split(' ')[0]);
          total += priceValue * quantity;
          break;
        }
      }
    });
    
    setTotalAmount(total);
  }, [localCartItems, menuCategories]);
  
  // Filter menu items based on search query
  const getFilteredMenuItems = () => {
    if (!searchQuery) {
      return menuCategories;
    }
    
    const query = searchQuery.toLowerCase();
    return menuCategories.map(category => {
      const filteredItems = category.items.filter(item => 
        item.name.toLowerCase().includes(query) || 
        item.description.toLowerCase().includes(query)
      );
      
      return {
        ...category,
        items: filteredItems
      };
    }).filter(category => category.items.length > 0);
  };
  
  // Add item to local cart
  const addToLocalCart = (itemId: string) => {
    try {
      setLocalCartItems(prev => {
        const currentQuantity = prev[itemId] || 0;
        return {
          ...prev,
          [itemId]: currentQuantity + 1
        };
      });
    } catch (error) {
      console.error('Failed to add item to cart:', error);
    }
  };
  
  // Remove item from local cart
  const removeFromLocalCart = (itemId: string) => {
    setLocalCartItems(prev => {
      const currentQuantity = prev[itemId] || 0;
      if (currentQuantity <= 1) {
        const { [itemId]: _, ...rest } = prev;
        return rest;
      }
      return {
        ...prev,
        [itemId]: currentQuantity - 1
      };
    });
  };
  
  // Find menu item by ID
  const findMenuItem = (itemId: string): MenuItem | undefined => {
    for (const category of menuCategories) {
      const item = category.items.find(item => item.id === itemId);
      if (item) return item;
    }
    return undefined;
  };

  // Convert menu item to CartItem format
  const convertToCartItem = (menuItem: MenuItem, quantity: number): CartItem => {
    // Extract price value and currency
    const priceMatch = menuItem.price.match(/(\d+)\s+([A-Z]+)/);
    const priceValue = priceMatch ? parseInt(priceMatch[1]) : 0;
    const currency = priceMatch ? priceMatch[2] : 'XAF';

    // Create a color detail for food items (using a placeholder for required fields)
    const colorDetail: CartItemColorDetail = {
      color: "default",
      label: "Standard",
      quantity: quantity,
      length: 1 // Not applicable for food, but required
    };

    return {
      id: `food-${menuItem.id}-${generateUUID()}`, // Ensure unique ID
      productName: menuItem.name,
      pricePerMeter: priceValue, // Using price as pricePerMeter (required field)
      currency: currency,
      totalPrice: priceValue * quantity,
      totalQuantity: quantity,
      totalMeters: 1, // Not applicable for food, but required
      colorDetails: [colorDetail],
      notes: menuItem.description,
      addedAt: new Date().toISOString(),
      productType: 'food',
      image: typeof menuItem.image === 'string' ? menuItem.image : 
             (menuItem.image as any).uri || '',
      category: menuItem.category,
      // Additional fields that make sense for food
      servingSize: "1 portion",
      brand: restaurant?.name || "",
    };
  };

  // Add all items to the cart context
  const addAllToCart = async () => {
    try {
      // For each item in the local cart
      for (const [itemId, quantity] of Object.entries(localCartItems)) {
        const menuItem = findMenuItem(itemId);
        if (!menuItem) continue;

        const cartItem = convertToCartItem(menuItem, quantity);
        await addToCart(cartItem);
      }

      // Show success modal
      setSuccessModalVisible(true);
    } catch (error) {
      console.error('Failed to add items to cart:', error);
      Alert.alert("Error", "Failed to add items to cart. Please try again.");
    }
  };
  
  // Handle continue shopping
  const handleContinueShopping = () => {
    setSuccessModalVisible(false);
    setLocalCartItems({});
  };
  
  // Handle view cart
  const handleViewCart = () => {
    setSuccessModalVisible(false);
    router.push('/(tabs)/cart');
  };
  
  // Navigate to cart
  const navigateToCart = () => {
    router.push('/(tabs)/cart');
  };
  
  if (!restaurant) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.loadingContainer}>
          <Text>Loading restaurant information...</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  const filteredMenuCategories = getFilteredMenuItems();
  
  return (
    <SafeAreaView 
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={['top', 'left', 'right']}
    >
      <StatusBar style="dark" />
      
      {/* Header with back button */}
      <View style={styles.header}>
        <IconButton 
          icon="arrow-left" 
          size={24}
          onPress={() => router.back()} 
        />
        <Text variant="titleMedium" style={styles.headerTitle}>Restaurant Menu</Text>
        <View style={styles.cartIconContainer}>
          <IconButton 
            icon="cart-outline" 
            size={24}
            onPress={navigateToCart} 
          />
          {existingCartItems.length > 0 && (
            <Badge count={existingCartItems.length} style={styles.cartBadge} />
          )}
        </View>
      </View>
      
      {/* Restaurant banner image */}
      <View style={styles.bannerContainer}>
        <Image source={restaurant.image} style={styles.bannerImage} />
        
        {/* Info overlay */}
        <View style={styles.bannerOverlay}>
          <View style={styles.restaurantInfo}>
            <Text variant="headlineMedium" style={styles.restaurantName}>{restaurant.name}</Text>
            <View style={styles.restaurantMeta}>
              <Text variant="bodyMedium" style={styles.cuisineText}>{restaurant.cuisine}</Text>
              <View style={styles.ratingContainer}>
                <MaterialCommunityIcons name="star" size={16} color="#FFD700" />
                <Text variant="bodyMedium" style={styles.ratingText}>{restaurant.rating}</Text>
              </View>
            </View>
            
            <View style={styles.detailsRow}>
              <View style={styles.detailItem}>
                <MaterialCommunityIcons name="clock-outline" size={14} color="white" />
                <Text variant="bodySmall" style={styles.detailText}>{restaurant.deliveryTime}</Text>
              </View>
              <View style={styles.detailItem}>
                <MaterialCommunityIcons name="bike" size={14} color="white" />
                <Text variant="bodySmall" style={styles.detailText}>{restaurant.deliveryFee}</Text>
              </View>
              <View style={styles.detailItem}>
                <MaterialCommunityIcons name="map-marker-outline" size={14} color="white" />
                <Text variant="bodySmall" style={styles.detailText}>{restaurant.distance}</Text>
              </View>
            </View>
          </View>
        </View>
      </View>
      
      {/* Restaurant details section */}
      <View style={styles.infoSection}>
        <Text variant="bodyMedium" style={styles.description}>
          {restaurant.description}
        </Text>
        
        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <MaterialCommunityIcons name="map-marker" size={16} color={theme.colors.primary} />
            <Text variant="bodySmall" style={styles.infoText}>{restaurant.address}</Text>
          </View>
          <View style={styles.infoItem}>
            <MaterialCommunityIcons name="clock" size={16} color={theme.colors.primary} />
            <Text variant="bodySmall" style={styles.infoText}>{restaurant.openingHours}</Text>
          </View>
        </View>
      </View>
      
      {/* Search bar */}
      <View style={styles.searchContainer}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search menu items..."
        />
      </View>
      
      {/* Menu categories tabs */}
      {!searchQuery && (
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={styles.categoriesScroll}
          contentContainerStyle={styles.categoriesContainer}
        >
          {menuCategories.map((category) => (
            <Chip
              key={category.id}
              label={category.name}
              selected={selectedCategory === category.id}
              onPress={() => setSelectedCategory(category.id)}
              style={styles.categoryChip}
            />
          ))}
        </ScrollView>
      )}
      
      {/* Menu items */}
      <ScrollView style={styles.menuScrollView} showsVerticalScrollIndicator={false}>
        {filteredMenuCategories.map((category) => (
          <View key={category.id} style={[
            styles.categorySection,
            (!searchQuery && selectedCategory !== category.id) && styles.hiddenCategory
          ]}>
            <Text variant="titleMedium" style={styles.categoryTitle}>{category.name}</Text>
            
            {category.items.map((item) => {
              const isHighlighted = params.highlightedMealId === item.id;
              const cartQuantity = localCartItems[item.id] || 0;
              
              return (
                <Card
                  key={item.id}
                  style={[
                    styles.menuItemCard,
                    isHighlighted && styles.highlightedCard
                  ]}
                >
                  <View style={styles.menuItemContent}>
                    <View style={styles.menuItemDetails}>
                      <View style={styles.menuItemHeader}>
                        <Text variant="titleSmall" style={styles.menuItemName}>{item.name}</Text>
                        {item.popular && (
                          <Badge label="Popular" style={styles.popularBadge} />
                        )}
                      </View>
                      
                      <Text variant="bodySmall" style={styles.menuItemDescription} numberOfLines={2}>
                        {item.description}
                      </Text>
                      
                      <View style={styles.menuItemFooter}>
                        <Text variant="titleMedium" style={styles.price}>{item.price}</Text>
                        
                        <View style={styles.dietaryContainer}>
                          {item.vegetarian && (
                            <MaterialCommunityIcons name="leaf" size={16} color="green" style={styles.dietaryIcon} />
                          )}
                          {item.spicy && (
                            <MaterialCommunityIcons name="fire" size={16} color="red" style={styles.dietaryIcon} />
                          )}
                        </View>
                      </View>
                      
                      {cartQuantity > 0 && (
                        <View style={styles.quantityControl}>
                          <TouchableOpacity 
                            style={styles.quantityButton} 
                            onPress={() => removeFromLocalCart(item.id)}
                          >
                            <MaterialCommunityIcons name="minus" size={16} color="white" />
                          </TouchableOpacity>
                          <Text variant="bodyMedium" style={styles.quantityText}>{cartQuantity}</Text>
                          <TouchableOpacity 
                            style={styles.quantityButton} 
                            onPress={() => addToLocalCart(item.id)}
                          >
                            <MaterialCommunityIcons name="plus" size={16} color="white" />
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                    
                    <View style={styles.menuItemImageContainer}>
                      <Image source={item.image} style={styles.menuItemImage} />
                      
                      {cartQuantity === 0 && (
                        <TouchableOpacity 
                          style={styles.addButton} 
                          onPress={() => addToLocalCart(item.id)}
                        >
                          <MaterialCommunityIcons name="plus" size={20} color="white" />
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                </Card>
              );
            })}
          </View>
        ))}
        
        {/* Bottom space for checkout button */}
        <View style={{ height: 100 }} />
      </ScrollView>
      
      {/* Add to Cart floating button */}
      {totalCartItems > 0 && (
        <View style={[styles.checkoutContainer, { paddingBottom: insets.bottom + 10 }]}>
          <Button
            mode="contained"
            onPress={addAllToCart}
            style={styles.checkoutButton}
          >
            <View style={styles.checkoutContent}>
              <View style={styles.checkoutInfo}>
                <Text variant="labelLarge" style={styles.checkoutCount}>
                  {totalCartItems} item{totalCartItems > 1 ? 's' : ''}
                </Text>
                <Text variant="titleMedium" style={styles.checkoutAmount}>
                  {totalAmount} XAF
                </Text>
              </View>
              <Text variant="labelLarge" style={styles.checkoutText}>
                Add to Cart
              </Text>
            </View>
          </Button>
        </View>
      )}
      
      {/* Success Modal */}
      <SuccessModal
        visible={successModalVisible}
        onClose={() => setSuccessModalVisible(false)}
        itemCount={totalCartItems}
        onContinueShopping={handleContinueShopping}
        onViewCart={handleViewCart}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  headerTitle: {
    fontWeight: '600',
  },
  cartIconContainer: {
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
  },
  bannerContainer: {
    position: 'relative',
    height: 180,
    width: '100%',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  bannerOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 16,
  },
  restaurantInfo: {
    flex: 1,
  },
  restaurantName: {
    color: 'white',
    fontWeight: 'bold',
  },
  restaurantMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  cuisineText: {
    color: 'white',
    marginRight: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  ratingText: {
    color: 'white',
    marginLeft: 4,
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  detailText: {
    color: 'white',
    marginLeft: 4,
  },
  infoSection: {
    padding: 16,
  },
  description: {
    marginBottom: 12,
    lineHeight: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    marginLeft: 4,
    color: '#666',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  categoriesScroll: {
    maxHeight: 50,
  },
  categoriesContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  categoryChip: {
    marginRight: 8,
  },
  menuScrollView: {
    flex: 1,
  },
  categorySection: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  hiddenCategory: {
    display: 'none',
  },
  categoryTitle: {
    fontWeight: '600',
    marginBottom: 12,
  },
  menuItemCard: {
    marginBottom: 12,
    borderRadius: 8,
    overflow: 'hidden',
  },
  highlightedCard: {
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  menuItemContent: {
    flexDirection: 'row',
    padding: 12,
  },
  menuItemDetails: {
    flex: 1,
    marginRight: 8,
  },
  menuItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  menuItemName: {
    fontWeight: '600',
    marginRight: 8,
  },
  popularBadge: {
    backgroundColor: '#FFD700',
  },
  menuItemDescription: {
    color: '#666',
    marginBottom: 8,
  },
  menuItemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontWeight: '600',
  },
  dietaryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dietaryIcon: {
    marginLeft: 8,
  },
  menuItemImageContainer: {
    position: 'relative',
    width: 100,
    height: 100,
    borderRadius: 8,
    overflow: 'hidden',
  },
  menuItemImage: {
    width: '100%',
    height: '100%',
  },
  addButton: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: '#FF5252',
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  quantityButton: {
    backgroundColor: '#FF5252',
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityText: {
    marginHorizontal: 12,
    fontWeight: '600',
  },
  checkoutContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  checkoutButton: {
    width: '100%',
  },
  checkoutContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  checkoutInfo: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  checkoutCount: {
    color: 'white',
  },
  checkoutAmount: {
    color: 'white',
    fontWeight: 'bold',
  },
  checkoutText: {
    color: 'white',
    fontWeight: 'bold',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalIconContainer: {
    marginBottom: 16,
  },
  modalTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalDescription: {
    marginBottom: 20,
    textAlign: 'center',
    opacity: 0.8,
  },
  modalButtonsContainer: {
    width: '100%',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  modalButton: {
    marginVertical: 6,
    width: '100%',
  },
  outlinedButton: {
    borderWidth: 1,
  },
}); 