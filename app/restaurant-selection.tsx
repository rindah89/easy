import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, ScrollView, Image, TouchableOpacity, FlatList, ImageSourcePropType, Dimensions, Animated, Modal, TextInput, TouchableWithoutFeedback } from 'react-native';
import { useTheme } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
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
import { 
  fetchUserAddresses, 
  createAddress, 
  setDefaultAddress, 
  deleteAddress,
  UserAddress,
  CreateAddressParams
} from '../services/addressService';
import { useAuth } from '../context/AuthContext';

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
  featured?: boolean;
  distance?: string;
}

interface FeaturedMeal {
  id: string;
  name: string;
  image: ImageSourcePropType;
  price: string;
  restaurant: string;
  restaurantId: string;
  discount?: string;
  rating?: number;
}

interface CuisineCategory {
  id: string;
  name: string;
  image: ImageSourcePropType;
}

interface Promotion {
  id: string;
  title: string;
  description: string;
  image: ImageSourcePropType;
  action: string;
}

// New interface for delivery addresses
interface DeliveryAddress {
  id: string;
  name: string;
  address: string;
  isDefault: boolean;
}

// Mock Data
const cuisineCategories: CuisineCategory[] = [
  { id: 'all', name: 'All', image: { uri: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=200' } },
  { id: 'italian', name: 'Italian', image: { uri: 'https://images.unsplash.com/photo-1595295333158-4742f28fbd85?q=80&w=200' } },
  { id: 'chinese', name: 'Chinese', image: { uri: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?q=80&w=200' } },
  { id: 'japanese', name: 'Japanese', image: { uri: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?q=80&w=200' } },
  { id: 'mexican', name: 'Mexican', image: { uri: 'https://images.unsplash.com/photo-1599974579688-8dbdd335c77f?q=80&w=200' } },
  { id: 'indian', name: 'Indian', image: { uri: 'https://images.unsplash.com/photo-1585937421612-70a008356c36?q=80&w=200' } },
  { id: 'thai', name: 'Thai', image: { uri: 'https://images.unsplash.com/photo-1569562211093-4ed0d0758f12?q=80&w=200' } },
  { id: 'burger', name: 'Burger', image: { uri: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=200' } },
];

const featuredMeals: FeaturedMeal[] = [
  {
    id: '1',
    name: 'Margherita Pizza',
    image: { uri: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?q=80&w=300' },
    price: '5500 XAF',
    restaurant: 'Pizzeria Italiana',
    restaurantId: '1',
    rating: 4.7,
  },
  {
    id: '2',
    name: 'Sushi Platter',
    image: { uri: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?q=80&w=300' },
    price: '9900 XAF',
    restaurant: 'Sushi Master',
    restaurantId: '3',
    discount: '15%',
    rating: 4.9,
  },
  {
    id: '3',
    name: 'Beef Burger',
    image: { uri: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=300' },
    price: '4200 XAF',
    restaurant: 'Burger House',
    restaurantId: '4',
    rating: 4.5,
  },
  {
    id: '4',
    name: 'Pad Thai',
    image: { uri: 'https://images.unsplash.com/photo-1559314809-0d155014e29e?q=80&w=300' },
    price: '3800 XAF',
    restaurant: 'Thai Spice',
    restaurantId: '5',
    rating: 4.6,
  },
];

const popularRestaurants: Restaurant[] = [
  {
    id: '1',
    name: 'Pizzeria Italiana',
    image: { uri: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=400' },
    cuisine: 'Italian',
    rating: 4.7,
    deliveryTime: '25-35 min',
    deliveryFee: '800 XAF',
    minOrder: '3000 XAF',
    distance: '1.2 km',
  },
  {
    id: '2',
    name: 'Golden Dragon',
    image: { uri: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=400' },
    cuisine: 'Chinese',
    rating: 4.5,
    deliveryTime: '30-45 min',
    deliveryFee: '600 XAF',
    minOrder: '3500 XAF',
    featured: true,
    distance: '2.5 km',
  },
  {
    id: '3',
    name: 'Sushi Master',
    image: { uri: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?q=80&w=400' },
    cuisine: 'Japanese',
    rating: 4.9,
    deliveryTime: '35-50 min',
    deliveryFee: '1200 XAF',
    minOrder: '6000 XAF',
    distance: '3.7 km',
  },
  {
    id: '4',
    name: 'Burger House',
    image: { uri: 'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?q=80&w=400' },
    cuisine: 'American',
    rating: 4.5,
    deliveryTime: '20-30 min',
    deliveryFee: '500 XAF',
    minOrder: '2500 XAF',
    featured: true,
    distance: '0.8 km',
  },
  {
    id: '5',
    name: 'Thai Spice',
    image: { uri: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?q=80&w=400' },
    cuisine: 'Thai',
    rating: 4.6,
    deliveryTime: '30-45 min',
    deliveryFee: '700 XAF',
    minOrder: '3000 XAF',
    distance: '1.9 km',
  },
];

const promotions: Promotion[] = [
  {
    id: '1',
    title: 'Free Delivery!',
    description: 'Enjoy free delivery on your first order',
    image: { uri: 'https://images.unsplash.com/photo-1513639776629-7350151ca211?q=80&w=600' },
    action: 'Order Now',
  },
  {
    id: '2',
    title: '20% OFF',
    description: 'Use code WELCOME for 20% off your first order',
    image: { uri: 'https://images.unsplash.com/photo-1544148103-0773bf10d330?q=80&w=600' },
    action: 'Get Offer',
  },
  {
    id: '3',
    title: 'Happy Hour',
    description: '2 for 1 on selected items between 2-5pm',
    image: { uri: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?q=80&w=600' },
    action: 'View Deals',
  },
];

// Component for section headers
function SectionHeader({ title, actionText, onAction }: { title: string; actionText?: string; onAction?: () => void }) {
  return (
    <View style={styles.sectionHeader}>
      <Text variant="titleMedium" style={styles.sectionTitle}>{title}</Text>
      {actionText && (
        <TouchableOpacity onPress={onAction}>
          <Text variant="bodyMedium" style={styles.sectionAction}>{actionText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// Component for featured carousel
function FeaturedCarousel({ items }: { items: Promotion[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const { width } = Dimensions.get('window');

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    { useNativeDriver: false }
  );

  useEffect(() => {
    const intervalId = setInterval(() => {
      setActiveIndex((prevIndex) => (prevIndex + 1) % items.length);
    }, 5000);
    return () => clearInterval(intervalId);
  }, [items.length]);

  return (
    <View style={styles.carouselContainer}>
      <Animated.FlatList
        data={items}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        onMomentumScrollEnd={(e) => {
          const newIndex = Math.round(e.nativeEvent.contentOffset.x / width);
          setActiveIndex(newIndex);
        }}
        renderItem={({ item }) => (
          <View style={[styles.carouselItem, { width }]}>
            <Image source={item.image} style={styles.carouselImage} />
            <View style={styles.carouselContent}>
              <Text variant="headlineSmall" style={styles.carouselTitle}>{item.title}</Text>
              <Text variant="bodyMedium" style={styles.carouselDescription}>{item.description}</Text>
              <Button 
                mode="contained" 
                style={styles.carouselButton}
                onPress={() => {
                  console.log(`Action pressed: ${item.action}`);
                  // Handle the action based on the button text
                  switch(item.action) {
                    case 'Order Now':
                      // Navigate to ordering screen or show restaurants
                      break;
                    case 'Get Offer':
                      // Show offer details
                      break;
                    case 'View Deals':
                      // Navigate to deals page
                      break;
                    default:
                      // Default action
                      break;
                  }
                }}
              >
                {item.action}
              </Button>
            </View>
          </View>
        )}
        keyExtractor={(item) => item.id}
      />
      <View style={styles.paginationContainer}>
        {items.map((_, index) => (
          <View
            key={index}
            style={[
              styles.paginationDot,
              { opacity: index === activeIndex ? 1 : 0.5 }
            ]}
          />
        ))}
      </View>
    </View>
  );
}

// Component for cuisine categories
function CuisineCategories({ 
  categories, 
  selectedCategory, 
  onSelectCategory 
}: { 
  categories: CuisineCategory[]; 
  selectedCategory: string; 
  onSelectCategory: (id: string) => void 
}) {
  return (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false} 
      style={styles.categoriesContainer}
      contentContainerStyle={styles.categoriesContent}
    >
      {categories.map((category) => (
        <TouchableOpacity 
          key={category.id} 
          style={[
            styles.categoryItem,
            selectedCategory === category.id && styles.selectedCategory
          ]}
          onPress={() => onSelectCategory(category.id)}
        >
          <Image source={category.image} style={styles.categoryImage} />
          <Text 
            variant="bodyMedium" 
            style={[
              styles.categoryName,
              selectedCategory === category.id && styles.selectedCategoryText
            ]}
          >
            {category.name}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

// Component for featured meals row
function FeaturedMealsRow({ meals, onSelect }: { meals: FeaturedMeal[]; onSelect: (meal: FeaturedMeal) => void }) {
  return (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false} 
      style={styles.mealsContainer}
      contentContainerStyle={styles.mealsContent}
    >
      {meals.map((meal) => (
        <Card key={meal.id} style={styles.mealCard} onPress={() => onSelect(meal)}>
          <View style={styles.mealImageContainer}>
            <Image source={meal.image} style={styles.mealImage} />
            {meal.discount && (
              <View style={styles.discountBadge}>
                <Text variant="labelSmall" style={styles.discountText}>{meal.discount} OFF</Text>
              </View>
            )}
          </View>
          <Card.Content style={styles.mealContent}>
            <Text variant="titleSmall" numberOfLines={1} style={styles.mealName}>{meal.name}</Text>
            <Text variant="bodySmall" style={styles.mealRestaurant}>{meal.restaurant}</Text>
            <View style={styles.mealFooter}>
              <Text variant="titleMedium" style={styles.mealPrice}>{meal.price}</Text>
              <View style={styles.mealRating}>
                <MaterialCommunityIcons name="star" size={14} color="#FFD700" />
                <Text variant="bodySmall">{meal.rating}</Text>
              </View>
            </View>
          </Card.Content>
          <TouchableOpacity style={styles.addMealButton} onPress={() => onSelect(meal)}>
            <MaterialCommunityIcons name="plus" size={20} color="white" />
          </TouchableOpacity>
        </Card>
      ))}
    </ScrollView>
  );
}

// Component for restaurant cards
function RestaurantsList({ 
  restaurants, 
  onSelectRestaurant 
}: { 
  restaurants: Restaurant[]; 
  onSelectRestaurant: (restaurant: Restaurant) => void 
}) {
  return (
    <View style={styles.restaurantsContainer}>
      {restaurants.map((restaurant) => (
        <Card 
          key={restaurant.id} 
          style={styles.restaurantCard} 
          onPress={() => onSelectRestaurant(restaurant)}
        >
          <View style={styles.restaurantImageContainer}>
            <Card.Cover source={restaurant.image} style={styles.restaurantImage} />
            {restaurant.featured && (
              <View style={styles.featuredBadge}>
                <Text variant="labelSmall" style={styles.featuredText}>Featured</Text>
              </View>
            )}
          </View>
          <Card.Content style={styles.restaurantContent}>
            <View style={styles.restaurantHeader}>
              <Text variant="titleMedium" style={styles.restaurantName}>{restaurant.name}</Text>
              <View style={styles.ratingContainer}>
                <MaterialCommunityIcons name="star" size={16} color="#FFD700" />
                <Text variant="bodyMedium">{restaurant.rating}</Text>
              </View>
            </View>
            <Text variant="bodySmall" style={styles.restaurantCuisine}>{restaurant.cuisine}</Text>
            <View style={styles.restaurantDetails}>
              <View style={styles.restaurantDetail}>
                <MaterialCommunityIcons name="clock-outline" size={14} color="#666" />
                <Text variant="bodySmall" style={styles.detailText}>{restaurant.deliveryTime}</Text>
              </View>
              <View style={styles.restaurantDetail}>
                <MaterialCommunityIcons name="bike-fast" size={14} color="#666" />
                <Text variant="bodySmall" style={styles.detailText}>{restaurant.deliveryFee}</Text>
              </View>
              <View style={styles.restaurantDetail}>
                <MaterialCommunityIcons name="map-marker-outline" size={14} color="#666" />
                <Text variant="bodySmall" style={styles.detailText}>{restaurant.distance}</Text>
              </View>
            </View>
          </Card.Content>
        </Card>
      ))}
    </View>
  );
}

// Component for Address Modal
function AddressModal({ 
  visible, 
  onClose, 
  onSave,
  addresses,
  setAddresses,
  selectedAddress,
  setSelectedAddress,
  isLoading,
  onUseCurrentLocation,
  useGpsLocation
}: { 
  visible: boolean; 
  onClose: () => void;
  onSave: (address: UserAddress) => void;
  addresses: UserAddress[];
  setAddresses: React.Dispatch<React.SetStateAction<UserAddress[]>>;
  selectedAddress: UserAddress | null;
  setSelectedAddress: React.Dispatch<React.SetStateAction<UserAddress | null>>;
  isLoading: boolean;
  onUseCurrentLocation: () => void;
  useGpsLocation: boolean;
}) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const userId = user?.id || '';
  
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [addingAddress, setAddingAddress] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form state
  const [newAddressName, setNewAddressName] = useState('');
  const [newAddressDetails, setNewAddressDetails] = useState('');
  const [city, setCity] = useState('Douala');
  const [state, setState] = useState('Littoral');
  
  // Reset form when modal is opened
  useEffect(() => {
    if (visible) {
      // Only reset the form when the modal is first opened, not when isAddingNew changes
      if (!isAddingNew) {
        setNewAddressName('');
        setNewAddressDetails('');
        setCity('Douala');
        setState('Littoral');
        setError(null);
      }
      // Don't reset isAddingNew here, as it causes the form to close when entering data
    }
  }, [visible]);
  
  // Handle city selection and auto-complete region
  const handleCityChange = (selectedCity: string) => {
    setCity(selectedCity);
    
    // Auto-complete region based on selected city
    if (selectedCity === 'Douala') {
      setState('Littoral');
    } else if (selectedCity === 'Yaounde') {
      setState('Center');
    } else {
      setState('');
    }
  };
  
  // Handle save new address
  const handleSaveAddress = async () => {
    if (!newAddressName.trim() || !newAddressDetails.trim() || !city.trim() || !state.trim()) {
      setError('Please fill all required fields');
      return;
    }
    
    if (!userId) {
      setError('You must be logged in to save addresses');
      return;
    }
    
    setAddingAddress(true);
    setError(null);
    
    try {
      // Create new address using our service
      const newAddressData: CreateAddressParams = {
        userId,
        addressName: newAddressName.trim(),
        address: newAddressDetails.trim(),
        city: city.trim(),
        state: state.trim(),
        isDefault: addresses.length === 0 // First address is default
      };
      
      const { address, error } = await createAddress(newAddressData);
      
      if (error) throw error;
      if (!address) throw new Error('Failed to create address');
      
      // Update local state
      const updatedAddresses = [...addresses, address];
      setAddresses(updatedAddresses);
      setSelectedAddress(address);
      
      // Close the add form AFTER successful save
      setIsAddingNew(false);
      
      // Call the onSave prop with the new address
      onSave(address);
    } catch (error) {
      console.error('Error saving address:', error);
      setError('Failed to save address. Please try again.');
    } finally {
      setAddingAddress(false);
    }
  };
  
  // Handle select address
  const handleSelectAddress = (address: UserAddress) => {
    setSelectedAddress(address);
    onClose();
  };
  
  // Handle set as default
  const handleSetDefault = async (addressId: string) => {
    if (!userId) return;
    
    try {
      const { error } = await setDefaultAddress(addressId, userId);
      if (error) throw error;
      
      // Update local state
      const updatedAddresses = addresses.map(addr => ({
        ...addr,
        isDefault: addr.id === addressId
      }));
      setAddresses(updatedAddresses);
    } catch (error) {
      console.error('Error setting default address:', error);
    }
  };
  
  // Handle delete address
  const handleDeleteAddress = async (addressId: string) => {
    try {
      const { error } = await deleteAddress(addressId);
      if (error) throw error;
      
      // Update local state
      const updatedAddresses = addresses.filter(addr => addr.id !== addressId);
      setAddresses(updatedAddresses);
      
      // If the deleted address was selected, select another one
      if (selectedAddress?.id === addressId) {
        setSelectedAddress(updatedAddresses.length > 0 ? updatedAddresses[0] : null);
      }
    } catch (error) {
      console.error('Error deleting address:', error);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View 
          style={[
            styles.addressModalContainer, 
            { 
              paddingTop: insets.top + 10,
              paddingBottom: insets.bottom + 10 
            }
          ]}
        >
          <View style={styles.addressModalHeader}>
            <Text variant="titleLarge" style={styles.addressModalTitle}>
              {isAddingNew ? "Add New Address" : "Delivery Addresses"}
            </Text>
            <IconButton 
              icon="close" 
              size={24}
              onPress={onClose} 
            />
          </View>
          
          <Divider style={styles.addressDivider} />
          
          {/* Error message */}
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}
          
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <Text>Loading addresses...</Text>
            </View>
          ) : isAddingNew ? (
            <ScrollView 
              style={styles.addAddressForm}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ paddingBottom: 20 }}
            >
              <TouchableWithoutFeedback>
                <View>
                  <TextInput
                    style={styles.addressInput}
                    placeholder="Address Name (e.g. Home, Work) *"
                    value={newAddressName}
                    onChangeText={setNewAddressName}
                    onBlur={() => {}}
                  />
                  
                  <TextInput
                    style={[styles.addressInput, styles.addressDetailsInput]}
                    placeholder="Full Address *"
                    value={newAddressDetails}
                    onChangeText={setNewAddressDetails}
                    multiline
                    numberOfLines={3}
                    onBlur={() => {}}
                  />
                  
                  <Text variant="bodySmall" style={styles.inputLabel}>City *</Text>
                  <View style={styles.citySelectionContainer}>
                    <TouchableOpacity
                      style={[
                        styles.cityOption,
                        city === 'Douala' && [styles.selectedCityOption, { backgroundColor: theme.colors.primary }]
                      ]}
                      onPress={() => handleCityChange('Douala')}
                    >
                      <Text style={[
                        styles.cityOptionText,
                        city === 'Douala' && styles.selectedCityOptionText
                      ]}>Douala</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={[
                        styles.cityOption,
                        city === 'Yaounde' && [styles.selectedCityOption, { backgroundColor: theme.colors.primary }]
                      ]}
                      onPress={() => handleCityChange('Yaounde')}
                    >
                      <Text style={[
                        styles.cityOptionText,
                        city === 'Yaounde' && styles.selectedCityOptionText
                      ]}>Yaounde</Text>
                    </TouchableOpacity>
                  </View>
                  
                  <TextInput
                    style={styles.addressInput}
                    placeholder="Region *"
                    value={state}
                    onChangeText={setState}
                    editable={false}
                    onBlur={() => {}}
                  />
                  
                  <View style={styles.addressFormButtons}>
                    <Button
                      mode="outlined"
                      onPress={() => setIsAddingNew(false)}
                      style={[styles.addressButton, styles.cancelButton]}
                      disabled={addingAddress}
                    >
                      Cancel
                    </Button>
                    
                    <Button
                      mode="contained"
                      onPress={handleSaveAddress}
                      style={styles.addressButton}
                      loading={addingAddress}
                      disabled={addingAddress || !newAddressName.trim() || !newAddressDetails.trim() || !city.trim() || !state.trim()}
                    >
                      Save Address
                    </Button>
                  </View>
                </View>
              </TouchableWithoutFeedback>
            </ScrollView>
          ) : (
            <>
              <ScrollView style={styles.addressList}>
                {/* Current Location Option - Always available */}
                <TouchableOpacity 
                  style={[
                    styles.addressItem,
                    useGpsLocation && [
                      styles.selectedAddressItem, 
                      { borderColor: theme.colors.primary, backgroundColor: `${theme.colors.primary}10` }
                    ],
                    styles.currentLocationItem
                  ]}
                  onPress={() => {
                    setSelectedAddress(null);
                    onUseCurrentLocation();
                  }}
                >
                  <View style={styles.addressInfo}>
                    <View style={styles.addressNameRow}>
                      <MaterialCommunityIcons 
                        name="map-marker" 
                        size={20} 
                        color={theme.colors.primary} 
                        style={styles.locationIcon} 
                      />
                      <Text variant="titleSmall" style={styles.addressName}>
                        Current Location
                      </Text>
                      {useGpsLocation && (
                        <Badge style={[styles.defaultBadge, { backgroundColor: theme.colors.primary }]}>Default</Badge>
                      )}
                    </View>
                    <Text variant="bodySmall" style={styles.addressText}>
                      Use your device's current location
                    </Text>
                  </View>
                </TouchableOpacity>
                
                {/* Divider between current location and saved addresses */}
                {addresses.length > 0 && (
                  <View style={styles.addressDividerContainer}>
                    <Text variant="bodySmall" style={styles.dividerText}>Saved Addresses</Text>
                    <Divider style={styles.addressListDivider} />
                  </View>
                )}
                
                {addresses.length === 0 ? (
                  <View style={styles.emptyStateContainer}>
                    <MaterialCommunityIcons 
                      name="map-marker-off" 
                      size={64} 
                      color={theme.colors.primary} 
                      style={styles.emptyStateIcon}
                    />
                    <Text variant="titleMedium" style={styles.emptyStateTitle}>
                      No saved addresses
                    </Text>
                    <Text variant="bodyMedium" style={styles.emptyStateText}>
                      Add your first delivery address to get started
                    </Text>
                  </View>
                ) : (
                  addresses.map((address) => (
                    <TouchableOpacity 
                      key={address.id}
                      style={[
                        styles.addressItem,
                        selectedAddress?.id === address.id && styles.selectedAddressItem
                      ]}
                      onPress={() => handleSelectAddress(address)}
                    >
                      <View style={styles.addressInfo}>
                        <View style={styles.addressNameRow}>
                          <Text variant="titleSmall" style={styles.addressName}>
                            {address.addressName}
                          </Text>
                          {address.isDefault && (
                            <Badge style={styles.defaultBadge}>Default</Badge>
                          )}
                        </View>
                        <Text variant="bodySmall" style={styles.addressText}>
                          {address.address}
                        </Text>
                        <Text variant="bodySmall" style={styles.addressText}>
                          {address.city}, {address.state}
                        </Text>
                      </View>
                      
                      <View style={styles.addressActions}>
                        {!address.isDefault && (
                          <TouchableOpacity 
                            style={styles.defaultButton}
                            onPress={() => handleSetDefault(address.id)}
                          >
                            <Text variant="labelSmall" style={styles.defaultButtonText}>
                              Set as default
                            </Text>
                          </TouchableOpacity>
                        )}
                        <TouchableOpacity
                          style={styles.deleteButton}
                          onPress={() => handleDeleteAddress(address.id)}
                        >
                          <MaterialCommunityIcons name="delete" size={18} color="#FF5252" />
                        </TouchableOpacity>
                      </View>
                    </TouchableOpacity>
                  ))
                )}
              </ScrollView>
              
              <Button
                mode="contained"
                icon="plus"
                onPress={() => setIsAddingNew(true)}
                style={styles.addAddressButton}
              >
                Add New Address
              </Button>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

// Main component
export default function RestaurantSelection() {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const userId = user?.id;
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCuisine, setSelectedCuisine] = useState('all');
  const [recentlyViewed, setRecentlyViewed] = useState<Restaurant[]>([]);
  const [isAddressModalVisible, setIsAddressModalVisible] = useState(false);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  
  // Delivery address state
  const [deliveryAddresses, setDeliveryAddresses] = useState<UserAddress[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<UserAddress | null>(null);
  const [useGpsLocation, setUseGpsLocation] = useState(true);
  
  // Load user addresses from Supabase
  useEffect(() => {
    async function loadAddresses() {
      if (!userId) return;
      
      setLoadingAddresses(true);
      try {
        const { addresses, error } = await fetchUserAddresses(userId);
        if (error) throw error;
        
        setDeliveryAddresses(addresses);
        
        // Select default address if available
        if (addresses.length > 0) {
          const defaultAddress = addresses.find(addr => addr.isDefault) || addresses[0];
          setSelectedAddress(defaultAddress);
          setUseGpsLocation(false);
        } else {
          // If no saved addresses, use current location as default
          setSelectedAddress(null);
          setUseGpsLocation(true);
        }
      } catch (error) {
        console.error('Error loading addresses:', error);
        // In case of error, use current location as default
        setSelectedAddress(null);
        setUseGpsLocation(true);
      } finally {
        setLoadingAddresses(false);
      }
    }
    
    loadAddresses();
  }, [userId]);

  // Filter restaurants based on search query and selected cuisine
  const filteredRestaurants = popularRestaurants.filter((restaurant) => {
    const matchesSearch = restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         restaurant.cuisine.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCuisine = selectedCuisine === 'all' || restaurant.cuisine.toLowerCase() === selectedCuisine.toLowerCase();
    return matchesSearch && matchesCuisine;
  });

  // Handle save address
  const handleSaveAddress = (address: UserAddress) => {
    // Only close the modal when an address is successfully saved
    if (address) {
      setIsAddressModalVisible(false);
      setUseGpsLocation(false);
    }
  };

  // Navigate to restaurant menu
  const navigateToRestaurantMenu = (restaurant: Restaurant) => {
    // Add to recently viewed
    const newRecentlyViewed = [
      restaurant,
      ...recentlyViewed.filter(item => item.id !== restaurant.id)
    ].slice(0, 5); // Keep only 5 most recent
    
    setRecentlyViewed(newRecentlyViewed);
    
    // Navigate to restaurant menu
    router.push({
      pathname: '/restaurant-menu',
      params: { 
        restaurantId: restaurant.id,
        deliveryAddressId: selectedAddress?.id
      }
    });
  };

  // Handle featured meal selection
  const handleMealSelect = (meal: FeaturedMeal) => {
    router.push({
      pathname: '/restaurant-menu',
      params: { 
        restaurantId: meal.restaurantId,
        highlightedMealId: meal.id,
        deliveryAddressId: selectedAddress?.id
      }
    });
  };

  // Get display address text
  const getAddressDisplayText = () => {
    if (useGpsLocation) return 'Current Location';
    if (selectedAddress) return selectedAddress.addressName;
    return 'Select Address';
  };

  // Handle use current location
  const handleUseCurrentLocation = () => {
    setSelectedAddress(null);
    setUseGpsLocation(true);
    setIsAddressModalVisible(false);
  };

  return (
    <SafeAreaView 
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={['top', 'left', 'right']}
    >
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.locationContainer}>
          <MaterialCommunityIcons 
            name={useGpsLocation ? "map-marker" : "home-map-marker"} 
            size={24} 
            color={theme.colors.primary} 
          />
          <View>
            <Text variant="bodySmall" style={styles.deliverToText}>Deliver to</Text>
            <TouchableOpacity 
              style={styles.locationSelector}
              onPress={() => setIsAddressModalVisible(true)}
            >
              <Text variant="bodyMedium" style={styles.locationText}>
                {getAddressDisplayText()}
              </Text>
              <MaterialCommunityIcons name="chevron-down" size={18} color={theme.colors.primary} />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.headerIcons}>
          <IconButton icon="bell-outline" onPress={() => {}} />
          <IconButton icon="heart-outline" onPress={() => {}} />
        </View>
      </View>
      
      {/* Search */}
      <View style={styles.searchContainer}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search restaurants or dishes..."
        />
      </View>
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Hero Carousel */}
        <FeaturedCarousel items={promotions} />
        
        {/* Cuisine Categories */}
        <SectionHeader title="Browse by Cuisine" />
        <CuisineCategories 
          categories={cuisineCategories}
          selectedCategory={selectedCuisine}
          onSelectCategory={setSelectedCuisine}
        />
        
        {/* Featured Meals Section */}
        <SectionHeader title="Popular Dishes" actionText="See All" onAction={() => router.push('/all-dishes')} />
        <FeaturedMealsRow meals={featuredMeals} onSelect={handleMealSelect} />
        
        {/* Popular Restaurants */}
        <SectionHeader title="Popular Restaurants" actionText="See All" onAction={() => router.push('/all-restaurants')} />
        <RestaurantsList 
          restaurants={filteredRestaurants} 
          onSelectRestaurant={navigateToRestaurantMenu}
        />
        
        {/* Recently Viewed - Only show if there are items */}
        {recentlyViewed.length > 0 && (
          <>
            <SectionHeader title="Recently Viewed" />
            <RestaurantsList 
              restaurants={recentlyViewed} 
              onSelectRestaurant={navigateToRestaurantMenu}
            />
          </>
        )}
        
        {/* Bottom padding */}
        <View style={{ height: 20 }} />
      </ScrollView>
      
      {/* Address Modal */}
      <AddressModal 
        visible={isAddressModalVisible}
        onClose={() => setIsAddressModalVisible(false)}
        onSave={handleSaveAddress}
        addresses={deliveryAddresses}
        setAddresses={setDeliveryAddresses}
        selectedAddress={selectedAddress}
        setSelectedAddress={setSelectedAddress}
        isLoading={loadingAddresses}
        onUseCurrentLocation={handleUseCurrentLocation}
        useGpsLocation={useGpsLocation}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deliverToText: {
    color: '#666',
  },
  locationSelector: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontWeight: '600',
    marginRight: 4,
  },
  headerIcons: {
    flexDirection: 'row',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  scrollView: {
    flex: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  sectionTitle: {
    fontWeight: '600',
  },
  sectionAction: {
    color: '#666',
  },
  carouselContainer: {
    height: 180,
    marginBottom: 16,
  },
  carouselItem: {
    position: 'relative',
  },
  carouselImage: {
    width: '100%',
    height: 180,
    borderRadius: 0,
  },
  carouselContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  carouselTitle: {
    color: 'white',
    fontWeight: 'bold',
  },
  carouselDescription: {
    color: 'white',
    marginBottom: 8,
  },
  carouselButton: {
    alignSelf: 'flex-start',
  },
  paginationContainer: {
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'white',
    marginHorizontal: 4,
  },
  categoriesContainer: {
    marginBottom: 16,
  },
  categoriesContent: {
    paddingHorizontal: 16,
  },
  categoryItem: {
    alignItems: 'center',
    marginRight: 16,
    opacity: 0.7,
  },
  selectedCategory: {
    opacity: 1,
  },
  categoryImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  categoryName: {
    marginTop: 4,
    textAlign: 'center',
  },
  selectedCategoryText: {
    fontWeight: 'bold',
  },
  mealsContainer: {
    marginBottom: 24,
  },
  mealsContent: {
    paddingHorizontal: 16,
  },
  mealCard: {
    width: 160,
    marginRight: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  mealImageContainer: {
    position: 'relative',
  },
  mealImage: {
    width: '100%',
    height: 120,
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#FF5252',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  discountText: {
    color: 'white',
    fontWeight: 'bold',
  },
  mealContent: {
    padding: 8,
  },
  mealName: {
    fontWeight: '600',
  },
  mealRestaurant: {
    color: '#666',
    marginBottom: 4,
  },
  mealFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  mealPrice: {
    fontWeight: '600',
    fontSize: 14,
  },
  mealRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addMealButton: {
    position: 'absolute',
    right: 8,
    top: 8,
    backgroundColor: '#FF5252',
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  restaurantsContainer: {
    paddingHorizontal: 16,
  },
  restaurantCard: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  restaurantImageContainer: {
    position: 'relative',
  },
  restaurantImage: {
    height: 150,
  },
  featuredBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#FF9800',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  featuredText: {
    color: 'white',
    fontWeight: 'bold',
  },
  restaurantContent: {
    padding: 12,
  },
  restaurantHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  restaurantName: {
    fontWeight: '600',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEFD5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  restaurantCuisine: {
    color: '#666',
    marginBottom: 8,
  },
  restaurantDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  restaurantDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
    marginBottom: 4,
  },
  detailText: {
    marginLeft: 4,
    color: '#666',
  },
  // Address Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  addressModalContainer: {
    flex: 1,
    backgroundColor: 'white',
    marginTop: 60,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 16,
  },
  addressModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  addressModalTitle: {
    fontWeight: 'bold',
  },
  addressDivider: {
    marginBottom: 16,
  },
  addressList: {
    flex: 1,
    marginBottom: 16,
  },
  addressItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
    marginBottom: 12,
  },
  selectedAddressItem: {
    borderColor: '#4A6FFF',
    backgroundColor: 'rgba(74, 111, 255, 0.05)',
  },
  addressInfo: {
    flex: 1,
    marginRight: 8,
  },
  addressNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  addressName: {
    fontWeight: '600',
    marginRight: 8,
  },
  addressText: {
    color: '#666',
  },
  defaultBadge: {
    backgroundColor: '#4CAF50',
  },
  addressActions: {
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  defaultButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginBottom: 8,
  },
  defaultButtonText: {
    color: '#4A6FFF',
  },
  deleteButton: {
    padding: 4,
  },
  addAddressButton: {
    marginBottom: 16,
  },
  addAddressForm: {
    flex: 1,
  },
  addressInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  addressDetailsInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  addressFormButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  addressButton: {
    flex: 1,
    marginHorizontal: 5,
  },
  cancelButton: {
    borderColor: '#ddd',
  },
  errorContainer: {
    backgroundColor: '#FFEEEE',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: '#FF5252',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 30,
  },
  emptyStateIcon: {
    marginBottom: 16,
    opacity: 0.7,
  },
  emptyStateTitle: {
    marginBottom: 8,
    fontWeight: '600',
  },
  emptyStateText: {
    textAlign: 'center',
    opacity: 0.7,
    maxWidth: '80%',
    marginBottom: 30,
  },
  currentLocationItem: {
    borderColor: '#4A6FFF',
    backgroundColor: 'rgba(74, 111, 255, 0.05)',
    marginBottom: 16,
  },
  addressDividerContainer: {
    marginBottom: 16,
  },
  dividerText: {
    fontWeight: '600',
    marginBottom: 8,
  },
  addressListDivider: {
    marginBottom: 16,
  },
  locationIcon: {
    marginRight: 8,
  },
  inputLabel: {
    marginBottom: 8,
    color: '#666',
  },
  citySelectionContainer: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 16,
    overflow: 'hidden',
  },
  cityOption: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedCityOption: {
    // Background color will be applied directly using theme.colors.primary
  },
  cityOptionText: {
    fontWeight: '600',
    fontSize: 16,
  },
  selectedCityOptionText: {
    color: 'white',
  },
}); 