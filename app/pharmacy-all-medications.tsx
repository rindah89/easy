import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { 
  View, 
  ScrollView, 
  StyleSheet, 
  TouchableOpacity, 
  FlatList, 
  Image, 
  Dimensions,
  RefreshControl,
  TextInput,
  ActivityIndicator,
  Alert,
  Modal,
  Animated
} from 'react-native';
import { useTheme, MD3Theme } from 'react-native-paper';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Text as CustomText } from '../components/CustomText';
import { Button } from '../components/Button';
import { Card } from '../components/CustomCard';
import { Divider } from '../components/CustomDivider';
import { Chip } from '../components/CustomChip';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCart } from '../context/CartContext';

const { width } = Dimensions.get('window');
const COLUMN_COUNT = 2;
const ITEM_WIDTH = (width - 48) / COLUMN_COUNT;

interface Medication {
  id: number;
  name: string;
  price: number;
  description: string;
  image: string;
  category: string;
  stock: number;
  rating: number;
  reviews: number;
}

interface Category {
  id: number;
  name: string;
  icon: string;
}

// Custom Cart Modal Component
const CartAddedModal = ({ 
  visible, 
  onClose, 
  medicationName, 
  quantity, 
  totalPrice, 
  category 
}: { 
  visible: boolean;
  onClose: () => void;
  medicationName: string;
  quantity: number;
  totalPrice: number;
  category: string;
}) => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  
  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        })
      ]).start();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, fadeAnim, scaleAnim]);

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={cartModalStyles.overlay}>
        <Animated.View 
          style={[
            cartModalStyles.modalContainer, 
            { 
              backgroundColor: theme.colors.background,
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
              paddingBottom: insets.bottom + 20
            }
          ]}
        >
          <View style={cartModalStyles.modalHeader}>
            <TouchableOpacity 
              style={cartModalStyles.closeButton}
              onPress={onClose}
            >
              <MaterialCommunityIcons name="close" size={24} color={theme.colors.onSurface} />
            </TouchableOpacity>
            <View style={cartModalStyles.modalHeaderCenter}>
              <View style={cartModalStyles.modalIndicator} />
            </View>
            <View style={cartModalStyles.headerSpacer} />
          </View>
          
          <View style={cartModalStyles.modalContent}>
            <View style={cartModalStyles.successIconContainer}>
              <MaterialCommunityIcons 
                name="check-circle" 
                size={60} 
                color={theme.colors.primary} 
              />
            </View>
            
            <CustomText variant="headlineSmall" style={cartModalStyles.modalTitle}>
              Added to Cart
            </CustomText>
            
            <View style={cartModalStyles.modalDetails}>
              <CustomText variant="titleMedium" style={cartModalStyles.productName}>
                {medicationName}
              </CustomText>
              
              <View style={cartModalStyles.detailRow}>
                <CustomText variant="bodyMedium" style={cartModalStyles.detailLabel}>
                  Quantity:
                </CustomText>
                <CustomText variant="bodyMedium" style={cartModalStyles.detailValue}>
                  {quantity} {quantity === 1 ? 'unit' : 'units'}
                </CustomText>
              </View>
              
              <View style={cartModalStyles.detailRow}>
                <CustomText variant="bodyMedium" style={cartModalStyles.detailLabel}>
                  Category:
                </CustomText>
                <CustomText variant="bodyMedium" style={cartModalStyles.detailValue}>
                  {category}
                </CustomText>
              </View>
              
              <View style={cartModalStyles.priceSeparator} />
              
              <View style={cartModalStyles.detailRow}>
                <CustomText variant="bodyMedium" style={cartModalStyles.detailLabel}>
                  Total Price:
                </CustomText>
                <CustomText variant="titleMedium" style={[cartModalStyles.totalPrice, { color: theme.colors.primary }]}>
                  XAF {totalPrice.toLocaleString()}
                </CustomText>
              </View>
            </View>
          </View>
          
          <View style={cartModalStyles.modalActions}>
            <Button
              mode="outlined"
              onPress={onClose}
              style={cartModalStyles.modalButton}
            >
              Continue Shopping
            </Button>
            
            <Button
              mode="contained"
              onPress={() => {
                onClose();
                router.push('/(tabs)/cart');
              }}
              style={cartModalStyles.modalButton}
              icon="cart"
            >
              View Cart
            </Button>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

// Modal specific styles
const cartModalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContainer: {
    width: '90%',
    maxWidth: 400,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 8,
  },
  modalHeaderCenter: {
    flex: 1,
    alignItems: 'center',
  },
  modalIndicator: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#DDDDDD',
  },
  closeButton: {
    padding: 8,
    marginRight: 8,
  },
  headerSpacer: {
    width: 40, // Same width as the close button area
  },
  modalContent: {
    padding: 16,
    paddingTop: 0,
  },
  successIconContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  modalDetails: {
    marginBottom: 24,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 16,
  },
  productName: {
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailLabel: {
    color: '#666666',
  },
  detailValue: {
    fontWeight: '500',
  },
  priceSeparator: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 12,
  },
  totalPrice: {
    fontWeight: 'bold',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 6,
  },
});

// Add this function outside the main component
const EmptyListComponent = ({ 
  onClearFilters, 
  theme 
}: { 
  onClearFilters: () => void; 
  theme: MD3Theme;
}) => (
  <View style={styles.emptyContainer}>
    <MaterialCommunityIcons name="pill" size={64} color={theme.colors.outline} />
    <CustomText variant="titleMedium" style={styles.emptyTitle}>
      No medications found
    </CustomText>
    <CustomText variant="bodyMedium" style={styles.emptyDescription}>
      Try adjusting your search or filters
    </CustomText>
    <Button
      mode="contained"
      onPress={onClearFilters}
      style={styles.clearButton}
    >
      Clear Filters
    </Button>
  </View>
);

// Custom SearchBar component
const CustomSearchBar = ({ 
  value, 
  onChangeText, 
  placeholder,
  style
}: { 
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  style?: any;
}) => {
  const theme = useTheme();
  
  return (
    <View style={[styles.searchBarContainer, style]}>
      <Ionicons name="search" size={20} color={theme.colors.primary} style={styles.searchIcon} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder || "Search..."}
        style={styles.searchInput}
        placeholderTextColor={theme.colors.outline}
      />
      {value ? (
        <TouchableOpacity onPress={() => onChangeText('')}>
          <Ionicons name="close-circle" size={20} color={theme.colors.outline} />
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

// Custom menu component using a simple modal approach
const SortMenu = ({ 
  visible, 
  onDismiss, 
  onSelect,
  currentSort
}: { 
  visible: boolean;
  onDismiss: () => void;
  onSelect: (sort: 'price_low' | 'price_high' | 'rating' | 'popularity') => void;
  currentSort: 'price_low' | 'price_high' | 'rating' | 'popularity';
}) => {
  if (!visible) return null;
  
  const theme = useTheme();
  
  return (
    <View style={styles.menuOverlay}>
      <TouchableOpacity style={styles.menuBackground} onPress={onDismiss} />
      <View style={styles.menuContainer}>
        <CustomText variant="titleMedium" style={styles.menuTitle}>Sort By</CustomText>
        <TouchableOpacity 
          style={styles.menuItem} 
          onPress={() => { onSelect('popularity'); onDismiss(); }}
        >
          <CustomText style={currentSort === 'popularity' ? styles.selectedMenuItem : null}>
            Most Popular
          </CustomText>
          {currentSort === 'popularity' && (
            <Ionicons name="checkmark" size={18} color={theme.colors.primary} />
          )}
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.menuItem} 
          onPress={() => { onSelect('price_low'); onDismiss(); }}
        >
          <CustomText style={currentSort === 'price_low' ? styles.selectedMenuItem : null}>
            Price: Low to High
          </CustomText>
          {currentSort === 'price_low' && (
            <Ionicons name="checkmark" size={18} color={theme.colors.primary} />
          )}
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.menuItem} 
          onPress={() => { onSelect('price_high'); onDismiss(); }}
        >
          <CustomText style={currentSort === 'price_high' ? styles.selectedMenuItem : null}>
            Price: High to Low
          </CustomText>
          {currentSort === 'price_high' && (
            <Ionicons name="checkmark" size={18} color={theme.colors.primary} />
          )}
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.menuItem} 
          onPress={() => { onSelect('rating'); onDismiss(); }}
        >
          <CustomText style={currentSort === 'rating' ? styles.selectedMenuItem : null}>
            Highest Rated
          </CustomText>
          {currentSort === 'rating' && (
            <Ionicons name="checkmark" size={18} color={theme.colors.primary} />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const PharmacyAllMedicationsScreen = () => {
  const theme = useTheme();
  const params = useLocalSearchParams<{ category?: string }>();
  const { cartItems, addToCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleMenu, setVisibleMenu] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'price_low' | 'price_high' | 'rating' | 'popularity'>('popularity');
  const [refreshing, setRefreshing] = useState(false);
  const [addingToCart, setAddingToCart] = useState<number | null>(null);
  // Add state to track quantity for each medication
  const [quantities, setQuantities] = useState<Record<number, number>>({});
  
  // Add state for cart modal
  const [cartModalVisible, setCartModalVisible] = useState(false);
  const [cartModalDetails, setCartModalDetails] = useState({
    medicationName: '',
    quantity: 0,
    totalPrice: 0,
    category: ''
  });

  // Check for category parameter in the URL
  useEffect(() => {
    if (params.category) {
      setSelectedCategory(params.category);
    }
  }, [params.category]);

  // Initialize quantities for each medication
  useEffect(() => {
    const initialQuantities: Record<number, number> = {};
    medications.forEach(med => {
      initialQuantities[med.id] = 1; // Default quantity is 1
    });
    setQuantities(initialQuantities);
  }, []);

  // Helper function to update quantity for a specific medication
  const updateQuantity = (medicationId: number, newQuantity: number) => {
    if (newQuantity < 1) return; // Don't allow quantities less than 1
    
    setQuantities(prev => ({
      ...prev,
      [medicationId]: newQuantity
    }));
  };

  // Mock data - in a real app, this would come from an API
  const [medications, setMedications] = useState<Medication[]>([
    {
      id: 1,
      name: 'Paracetamol',
      price: 5500,
      description: 'Pain reliever and fever reducer',
      image: 'https://placehold.co/200x200/png',
      category: 'Pain Relief',
      stock: 45,
      rating: 4.5,
      reviews: 128,
    },
    {
      id: 2,
      name: 'Vitamin C',
      price: 8000,
      description: 'Immune system support',
      image: 'https://placehold.co/200x200/png',
      category: 'Vitamins',
      stock: 32,
      rating: 4.8,
      reviews: 95,
    },
    {
      id: 3,
      name: 'Allergy Relief',
      price: 12500,
      description: 'Fast-acting antihistamine',
      image: 'https://placehold.co/200x200/png',
      category: 'Allergy',
      stock: 18,
      rating: 4.2,
      reviews: 64,
    },
    {
      id: 4,
      name: 'First Aid Kit',
      price: 25000,
      description: 'Essential home first aid supplies',
      image: 'https://placehold.co/200x200/png',
      category: 'First Aid',
      stock: 15,
      rating: 4.7,
      reviews: 42,
    },
    {
      id: 5,
      name: 'Cold & Flu Relief',
      price: 15000,
      description: 'Symptom relief for cold and flu',
      image: 'https://placehold.co/200x200/png',
      category: 'Cold & Flu',
      stock: 28,
      rating: 4.4,
      reviews: 87,
    },
    {
      id: 6,
      name: 'Digestive Health',
      price: 13500,
      description: 'Relief from digestive issues',
      image: 'https://placehold.co/200x200/png',
      category: 'Digestion',
      stock: 23,
      rating: 4.3,
      reviews: 56,
    },
    {
      id: 7,
      name: 'Multivitamin',
      price: 18000,
      description: 'Complete daily multivitamin',
      image: 'https://placehold.co/200x200/png',
      category: 'Vitamins',
      stock: 40,
      rating: 4.6,
      reviews: 112,
    },
    {
      id: 8,
      name: 'Skin Ointment',
      price: 9500,
      description: 'For minor skin irritations',
      image: 'https://placehold.co/200x200/png',
      category: 'Skin Care',
      stock: 35,
      rating: 4.1,
      reviews: 78,
    },
    {
      id: 9,
      name: 'Eye Drops',
      price: 6800,
      description: 'Relieves dry eyes',
      image: 'https://placehold.co/200x200/png',
      category: 'Eye Care',
      stock: 20,
      rating: 4.4,
      reviews: 63,
    },
    {
      id: 10,
      name: 'Cough Syrup',
      price: 11000,
      description: 'Relieves cough and sore throat',
      image: 'https://placehold.co/200x200/png',
      category: 'Cold & Flu',
      stock: 25,
      rating: 4.2,
      reviews: 92,
    },
    {
      id: 11,
      name: 'Bandages',
      price: 4500,
      description: 'Assorted sizes adhesive bandages',
      image: 'https://placehold.co/200x200/png',
      category: 'First Aid',
      stock: 50,
      rating: 4.7,
      reviews: 38,
    },
    {
      id: 12,
      name: 'Ibuprofen',
      price: 7500,
      description: 'Anti-inflammatory pain reliever',
      image: 'https://placehold.co/200x200/png',
      category: 'Pain Relief',
      stock: 38,
      rating: 4.6,
      reviews: 116,
    },
  ]);

  const [categories, setCategories] = useState<Category[]>([
    { id: 1, name: 'All', icon: 'pill' },
    { id: 2, name: 'Pain Relief', icon: 'pill' },
    { id: 3, name: 'Cold & Flu', icon: 'virus' },
    { id: 4, name: 'Vitamins', icon: 'pill' },
    { id: 5, name: 'First Aid', icon: 'medical-bag' },
    { id: 6, name: 'Skin Care', icon: 'lotion-plus' },
    { id: 7, name: 'Digestion', icon: 'stomach' },
    { id: 8, name: 'Allergy', icon: 'flower' },
    { id: 9, name: 'Eye Care', icon: 'eye' },
  ]);

  // Filter medications based on search query and selected category
  const filteredMedications = medications.filter(medication => {
    const matchesSearch = medication.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          medication.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === null || selectedCategory === 'All' || medication.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Sort medications based on selected sort option
  const sortedMedications = [...filteredMedications].sort((a, b) => {
    switch (sortBy) {
      case 'price_low':
        return a.price - b.price;
      case 'price_high':
        return b.price - a.price;
      case 'rating':
        return b.rating - a.rating;
      case 'popularity':
        return b.reviews - a.reviews;
      default:
        return 0;
    }
  });

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // In a real app, this would refetch data from an API
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  const navigateToMedication = (medication: Medication) => {
    router.push({
      pathname: '/pharmacy-medication',
      params: { medicationId: medication.id }
    });
  };

  // Get the cart item count for displaying on the cart badge
  const cartItemCount = useMemo(() => {
    return cartItems.length;
  }, [cartItems]);

  const handleAddToCart = async (medication: Medication) => {
    // Check if medication is in stock
    if (medication.stock <= 0) {
      Alert.alert(
        "Out of Stock",
        `${medication.name} is currently out of stock. Please check back later.`
      );
      return;
    }

    // Get current quantity for this medication
    const quantity = quantities[medication.id] || 1;
    
    // Check if user is trying to add more than available stock
    if (quantity > medication.stock) {
      Alert.alert(
        "Insufficient Stock",
        `Only ${medication.stock} units of ${medication.name} are available.`
      );
      return;
    }

    setAddingToCart(medication.id);
    try {
      // Check if this exact medication is already in the cart
      const existingMedItem = cartItems.find(item => 
        item.productType === 'medication' && 
        item.id.includes(`medication_${medication.id}`)
      );

      if (existingMedItem) {
        // If it exists, update the quantity and total price
        const updatedItem = {
          ...existingMedItem,
          totalQuantity: existingMedItem.totalQuantity + quantity,
          totalPrice: existingMedItem.totalPrice + (medication.price * quantity)
        };
        
        console.log('Updating medication quantity in cart:', medication.name);
        await addToCart(updatedItem);
        
        // Show the modal instead of Alert
        setCartModalDetails({
          medicationName: medication.name,
          quantity: quantity,
          totalPrice: medication.price * quantity,
          category: medication.category
        });
        setCartModalVisible(true);
      } else {
        // Create a new cart item
        const cartItem = {
          id: `medication_${medication.id}_${Date.now()}`,
          productName: medication.name,
          pricePerMeter: medication.price,
          totalPrice: medication.price * quantity,
          totalQuantity: quantity,
          totalMeters: quantity,
          currency: 'XAF',
          colorDetails: [
            {
              color: '#f0f0f0',
              label: medication.category,
              quantity: quantity,
              length: 1
            }
          ],
          notes: medication.description,
          addedAt: new Date().toISOString(),
          productType: 'medication',
          image: medication.image,
          category: medication.category,
          brand: '',
        };
        
        console.log('Adding new medication to cart:', medication.name);
        await addToCart(cartItem);
        
        // Show the modal instead of Alert
        setCartModalDetails({
          medicationName: medication.name,
          quantity: quantity,
          totalPrice: medication.price * quantity,
          category: medication.category
        });
        setCartModalVisible(true);
      }
      
      // Reset quantity to 1 after adding to cart
      updateQuantity(medication.id, 1);
    } catch (error) {
      console.error('Failed to add to cart:', error);
      Alert.alert(
        "Error",
        `Failed to add ${medication.name} to cart. ${error instanceof Error ? error.message : 'Please try again.'}`
      );
    } finally {
      setAddingToCart(null);
    }
  };

  // Function to check if a medication is already in the cart
  const isInCart = useCallback((medicationId: number): boolean => {
    return cartItems.some(item => item.id.includes(`medication_${medicationId}`));
  }, [cartItems]);

  // Rendering the medication item
  const renderMedicationItem = ({ item }: { item: Medication }) => {
    const medicationInCart = isInCart(item.id);
    const currentQuantity = quantities[item.id] || 1;

    return (
      <Card 
        style={styles.medicationCard} 
        onPress={() => navigateToMedication(item)}
      >
        <Image 
          source={{ uri: item.image }} 
          style={styles.medicationImage} 
          resizeMode="cover"
        />
        <View style={styles.medicationContent}>
          <View style={styles.medCategoryChip}>
            <CustomText variant="bodySmall">{item.category}</CustomText>
          </View>
          <CustomText variant="titleMedium" numberOfLines={1} style={styles.medicationName}>
            {item.name}
          </CustomText>
          <CustomText variant="bodySmall" numberOfLines={2} style={styles.medicationDescription}>
            {item.description}
          </CustomText>
          
          <View style={styles.ratingContainer}>
            <MaterialCommunityIcons name="star" size={16} color="#FFC107" />
            <CustomText variant="bodySmall" style={styles.ratingText}>
              {item.rating} ({item.reviews})
            </CustomText>
          </View>
          
          {/* Quantity selector */}
          <View style={styles.quantityContainer}>
            <CustomText variant="bodySmall" style={styles.quantityLabel}>Quantity:</CustomText>
            <View style={styles.quantityControls}>
              <TouchableOpacity
                style={[styles.quantityButton, { backgroundColor: theme.colors.surface }]}
                onPress={() => updateQuantity(item.id, currentQuantity - 1)}
                disabled={currentQuantity <= 1}
              >
                <MaterialCommunityIcons 
                  name="minus" 
                  size={16} 
                  color={currentQuantity <= 1 ? theme.colors.onSurfaceVariant : theme.colors.primary} 
                />
              </TouchableOpacity>
              
              <CustomText variant="bodyMedium" style={styles.quantityText}>
                {currentQuantity}
              </CustomText>
              
              <TouchableOpacity
                style={[styles.quantityButton, { backgroundColor: theme.colors.surface }]}
                onPress={() => updateQuantity(item.id, currentQuantity + 1)}
                disabled={currentQuantity >= item.stock}
              >
                <MaterialCommunityIcons 
                  name="plus" 
                  size={16} 
                  color={currentQuantity >= item.stock ? theme.colors.onSurfaceVariant : theme.colors.primary} 
                />
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.priceRow}>
            <CustomText variant="titleMedium" style={styles.price}>
              XAF {(item.price * currentQuantity).toLocaleString()}
            </CustomText>
            {medicationInCart ? (
              <TouchableOpacity 
                style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
                onPress={() => router.push('/(tabs)/cart')}
              >
                <MaterialCommunityIcons name="cart-check" size={20} color="white" />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity 
                style={styles.addButton}
                onPress={() => handleAddToCart(item)}
                disabled={addingToCart === item.id}
              >
                {addingToCart === item.id ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color="white" />
                  </View>
                ) : (
                  <MaterialCommunityIcons name="cart-plus" size={20} color="white" />
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Card>
    );
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory(null);
    setSortBy('popularity');
  };

  return (
    <SafeAreaView style={styles.container} edges={['right', 'left', 'top']}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity 
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color={theme.colors.primary} />
          </TouchableOpacity>
          <CustomText variant="headlineMedium" style={styles.heading}>
            All Medications
          </CustomText>
          <TouchableOpacity 
            onPress={() => router.push('/(tabs)/cart')}
            style={styles.cartButton}
          >
            <MaterialCommunityIcons name="cart-outline" size={24} color={theme.colors.primary} />
            {cartItemCount > 0 && (
              <View style={styles.cartBadge}>
                <CustomText variant="bodySmall" style={styles.cartBadgeText}>
                  {cartItemCount}
                </CustomText>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <CustomSearchBar
          placeholder="Search medications..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
        />
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => setVisibleMenu(true)}
        >
          <MaterialCommunityIcons name="tune-vertical" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      <SortMenu 
        visible={visibleMenu}
        onDismiss={() => setVisibleMenu(false)}
        onSelect={setSortBy}
        currentSort={sortBy}
      />

      {/* Categories */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesContainer}
      >
        {categories.map((category) => (
          <Chip
            key={category.id}
            selected={selectedCategory === category.name}
            onPress={() => setSelectedCategory(selectedCategory === category.name ? null : category.name)}
            style={styles.categoryChip}
            selectedColor={theme.colors.primary}
          >
            {category.name}
          </Chip>
        ))}
      </ScrollView>

      {/* Results Counter */}
      <View style={styles.resultsContainer}>
        <CustomText variant="bodyMedium">
          {sortedMedications.length} {sortedMedications.length === 1 ? 'result' : 'results'}
        </CustomText>
        <View style={styles.sortLabel}>
          <CustomText variant="bodySmall">Sorted by: </CustomText>
          <CustomText variant="bodyMedium" style={{ fontWeight: '500' }}>
            {sortBy === 'price_low' ? 'Price: Low to High' : 
             sortBy === 'price_high' ? 'Price: High to Low' : 
             sortBy === 'rating' ? 'Highest Rated' : 'Most Popular'}
          </CustomText>
        </View>
      </View>

      {/* Medications Grid */}
      <FlatList
        data={sortedMedications}
        renderItem={renderMedicationItem}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        contentContainerStyle={styles.medicationsGrid}
        columnWrapperStyle={styles.row}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
          />
        }
        ListEmptyComponent={<EmptyListComponent onClearFilters={clearFilters} theme={theme} />}
      />
      
      {/* Cart Added Modal */}
      <CartAddedModal
        visible={cartModalVisible}
        onClose={() => setCartModalVisible(false)}
        medicationName={cartModalDetails.medicationName}
        quantity={cartModalDetails.quantity}
        totalPrice={cartModalDetails.totalPrice}
        category={cartModalDetails.category}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 4,
  },
  heading: {
    fontWeight: 'bold',
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignItems: 'center',
  },
  searchBarContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEEEEE',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 16,
  },
  searchBar: {
    flex: 1,
    marginRight: 8,
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#EEEEEE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoriesContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    paddingBottom: 16,
  },
  categoryChip: {
    marginRight: 8,
    height: 36,
  },
  resultsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  sortLabel: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  medicationsGrid: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  medicationCard: {
    width: ITEM_WIDTH,
    borderRadius: 12,
    overflow: 'hidden',
  },
  medicationImage: {
    width: '100%',
    height: 120,
  },
  medicationContent: {
    padding: 10,
  },
  medCategoryChip: {
    alignSelf: 'flex-start',
    marginBottom: 4,
    height: 24,
    backgroundColor: '#f0f0f0',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  medicationName: {
    fontWeight: '500',
    marginBottom: 4,
  },
  medicationDescription: {
    marginBottom: 8,
    opacity: 0.7,
    fontSize: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingText: {
    marginLeft: 4,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontWeight: 'bold',
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    marginTop: 16,
    textAlign: 'center',
  },
  emptyDescription: {
    textAlign: 'center',
    marginTop: 8,
  },
  clearButton: {
    marginTop: 16,
  },
  menuOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  menuBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  menuContainer: {
    position: 'absolute',
    top: 120,
    right: 16,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    width: 240,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  menuTitle: {
    marginBottom: 8,
    fontWeight: 'bold',
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  selectedMenuItem: {
    color: '#4A6FFF',
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartButton: {
    position: 'relative',
    padding: 4,
  },
  cartBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#FF5252',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  cartBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  // New styles for quantity controls
  quantityContainer: {
    marginBottom: 8,
  },
  quantityLabel: {
    marginBottom: 4,
    color: '#666666',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 4,
  },
  quantityText: {
    marginHorizontal: 8,
    minWidth: 20,
    textAlign: 'center',
  },
});

export default PharmacyAllMedicationsScreen; 