import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, Image, TouchableOpacity, FlatList, ImageSourcePropType, Modal, Animated } from 'react-native';
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
import { useCart, CartItem } from '../context/CartContext';
import { Button } from '../components/Button';

interface GroceryItem {
  id: string;
  name: string;
  image: ImageSourcePropType;
  price: string;
  category: string;
  organic: boolean;
  sale?: boolean;
}

interface GroceryCategory {
  id: string;
  name: string;
}

interface Supermarket {
  id: string;
  name: string;
  image: ImageSourcePropType;
}

const supermarkets: Supermarket[] = [
  {
    id: '1',
    name: 'Carrefour',
    image: require('../assets/images/carrefour-supermarket.jpg'),
  },
  {
    id: '2',
    name: 'Santa Lucia',
    image: require('../assets/images/santa-lucia-supermarket.jpg'),
  },
  {
    id: '3',
    name: 'BAO',
    image: require('../assets/images/bao-supermarkt.png'),
  },
  {
    id: '4',
    name: 'Super U',
    image: require('../assets/images/superU-supermarket.jpg'),
  },
];

const categories: GroceryCategory[] = [
  { id: 'all', name: 'All' },
  { id: 'produce', name: 'Produce' },
  { id: 'dairy', name: 'Dairy' },
  { id: 'bakery', name: 'Bakery' },
  { id: 'meat', name: 'Meat & Seafood' },
  { id: 'frozen', name: 'Frozen' },
  { id: 'pantry', name: 'Pantry' },
  { id: 'beverages', name: 'Beverages' },
];

const groceryItems: GroceryItem[] = [
  {
    id: '1',
    name: 'Organic Bananas',
    image: { uri: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?q=80&w=400' },
    price: '450 XAF/kg',
    category: 'produce',
    organic: true,
  },
  {
    id: '2',
    name: 'Avocados',
    image: { uri: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?q=80&w=400' },
    price: '1200 XAF each',
    category: 'produce',
    organic: false,
    sale: true,
  },
  {
    id: '3',
    name: 'Whole Milk',
    image: { uri: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?q=80&w=400' },
    price: '2100 XAF/L',
    category: 'dairy',
    organic: false,
  },
  {
    id: '4',
    name: 'Organic Eggs',
    image: { uri: 'https://images.unsplash.com/photo-1506976785307-87f514b751ba?q=80&w=400' },
    price: '3000 XAF/dozen',
    category: 'dairy',
    organic: true,
  },
  {
    id: '5',
    name: 'Sourdough Bread',
    image: { uri: 'https://images.unsplash.com/photo-1585478259715-4d3a5f3fb3c2?q=80&w=400' },
    price: '2500 XAF',
    category: 'bakery',
    organic: false,
  },
  {
    id: '6',
    name: 'Grilled Chicken Breast',
    image: { uri: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?q=80&w=400' },
    price: '5400 XAF/kg',
    category: 'meat',
    organic: false,
  },
  {
    id: '7',
    name: 'Organic Strawberries',
    image: { uri: 'https://images.unsplash.com/photo-1518635017498-87f514b751ba?q=80&w=400' },
    price: '3600 XAF/500g',
    category: 'produce',
    organic: true,
    sale: true,
  },
  {
    id: '8',
    name: 'Frozen Pizza',
    image: { uri: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=400' },
    price: '3900 XAF',
    category: 'frozen',
    organic: false,
  },
];

interface CartQuantityModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (quantity: number) => void;
  item: GroceryItem;
}

const CartQuantityModal = ({ visible, onClose, onConfirm, item }: CartQuantityModalProps) => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [quantity, setQuantity] = useState(1);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const scaleAnim = React.useRef(new Animated.Value(0.9)).current;
  
  // Extract the base price value from the item price string
  const getPriceValue = () => {
    const priceString = item.price.split(' ')[0];
    return parseFloat(priceString);
  };
  
  // Calculate total price based on quantity
  const calculateTotalPrice = () => {
    return (getPriceValue() * quantity).toFixed(0);
  };
  
  useEffect(() => {
    if (visible) {
      setQuantity(1); // Reset quantity when modal opens
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

  const increaseQuantity = () => {
    setQuantity(prev => prev + 1);
  };

  const decreaseQuantity = () => {
    setQuantity(prev => (prev > 1 ? prev - 1 : 1));
  };

  const handleConfirm = () => {
    onConfirm(quantity);
  };

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
            <View style={cartModalStyles.modalIndicator} />
            <TouchableOpacity 
              style={cartModalStyles.closeButton}
              onPress={onClose}
            >
              <MaterialCommunityIcons name="close" size={24} color={theme.colors.onSurface} />
            </TouchableOpacity>
          </View>
          
          <View style={cartModalStyles.modalContent}>
            <Text variant="headlineSmall" style={cartModalStyles.modalTitle}>
              Add to Cart
            </Text>
            
            <View style={cartModalStyles.itemPreview}>
              <Image 
                source={item.image} 
                style={cartModalStyles.itemImage} 
                resizeMode="cover"
              />
              
              <View style={cartModalStyles.itemDetails}>
                <Text variant="titleMedium" numberOfLines={2} style={cartModalStyles.productName}>
                  {item.name}
                </Text>
                
                <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                  {item.price}
                </Text>
                
                {item.organic && (
                  <View style={[cartModalStyles.organicBadge, { backgroundColor: theme.colors.primary }]}>
                    <Text variant="labelSmall" color={theme.colors.onPrimary}>
                      Organic
                    </Text>
                  </View>
                )}
              </View>
            </View>
            
            <View style={cartModalStyles.quantitySelector}>
              <Text variant="bodyLarge">Quantity:</Text>
              <View style={cartModalStyles.quantityControls}>
                <TouchableOpacity 
                  style={[cartModalStyles.quantityButton, { backgroundColor: theme.colors.surfaceVariant }]} 
                  onPress={decreaseQuantity}
                >
                  <MaterialCommunityIcons name="minus" size={20} color={theme.colors.onSurfaceVariant} />
                </TouchableOpacity>
                
                <Text variant="titleMedium" style={cartModalStyles.quantityText}>
                  {quantity}
                </Text>
                
                <TouchableOpacity 
                  style={[cartModalStyles.quantityButton, { backgroundColor: theme.colors.surfaceVariant }]}
                  onPress={increaseQuantity}
                >
                  <MaterialCommunityIcons name="plus" size={20} color={theme.colors.onSurfaceVariant} />
                </TouchableOpacity>
              </View>
            </View>
            
            <Text variant="titleMedium" style={[cartModalStyles.totalPrice, { color: theme.colors.primary }]}>
              Total: {calculateTotalPrice()} XAF
            </Text>
          </View>
          
          <View style={cartModalStyles.modalActions}>
            <Button
              mode="outlined"
              onPress={onClose}
              style={cartModalStyles.modalButton}
            >
              Cancel
            </Button>
            
            <Button
              mode="contained"
              onPress={handleConfirm}
              style={cartModalStyles.modalButton}
            >
              Add to Cart
            </Button>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

interface CartAddedSuccessModalProps {
  visible: boolean;
  onClose: () => void;
  productName: string;
  quantity: number;
  price: string;
  onViewCart: () => void;
}

const CartAddedSuccessModal = ({ 
  visible, 
  onClose, 
  productName, 
  quantity, 
  price,
  onViewCart 
}: CartAddedSuccessModalProps) => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const scaleAnim = React.useRef(new Animated.Value(0.9)).current;
  
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
            <View style={cartModalStyles.modalIndicator} />
            <TouchableOpacity 
              style={cartModalStyles.closeButton}
              onPress={onClose}
            >
              <MaterialCommunityIcons name="close" size={24} color={theme.colors.onSurface} />
            </TouchableOpacity>
          </View>
          
          <View style={cartModalStyles.modalContent}>
            <View style={cartModalStyles.successIconContainer}>
              <MaterialCommunityIcons 
                name="check-circle" 
                size={60} 
                color={theme.colors.primary} 
              />
            </View>
            
            <Text variant="headlineSmall" style={cartModalStyles.modalTitle}>
              Added to Cart
            </Text>
            
            <View style={cartModalStyles.modalDetails}>
              <Text variant="titleMedium" style={cartModalStyles.productName}>
                {productName}
              </Text>
              
              <Text variant="bodyMedium" style={cartModalStyles.modalDetailText}>
                Quantity: {quantity} item{quantity > 1 ? 's' : ''}
              </Text>
              
              <Text variant="titleMedium" style={[cartModalStyles.totalPrice, { color: theme.colors.primary }]}>
                {price}
              </Text>
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
              onPress={onViewCart}
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

const cartModalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  modalContainer: {
    width: '100%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
    position: 'relative',
  },
  modalIndicator: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#e0e0e0',
    marginBottom: 8,
  },
  closeButton: {
    position: 'absolute',
    right: 0,
    top: -8,
    padding: 8,
  },
  modalContent: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  modalTitle: {
    marginBottom: 16,
    textAlign: 'center',
  },
  successIconContainer: {
    marginBottom: 16,
  },
  modalDetails: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 24,
  },
  productName: {
    marginBottom: 8,
    textAlign: 'center',
  },
  modalDetailText: {
    marginBottom: 4,
    textAlign: 'center',
  },
  colorMessage: {
    textAlign: 'center',
    marginVertical: 8,
  },
  totalPrice: {
    marginTop: 16,
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 8,
  },
  itemPreview: {
    flexDirection: 'row',
    width: '100%',
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    marginBottom: 16,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  itemDetails: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginVertical: 16,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityText: {
    marginHorizontal: 16,
  },
  organicBadge: {
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginTop: 6,
    alignSelf: 'flex-start',
  },
});

export default function GroceryShopping() {
  const theme = useTheme();
  const router = useRouter();
  const { supermarketId } = useLocalSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const { cartItems, addToCart: addItemToCart, getCartCount } = useCart();
  const [cartCount, setCartCount] = useState(0);
  const [selectedSupermarket, setSelectedSupermarket] = useState<Supermarket | null>(null);
  
  // Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<GroceryItem | null>(null);
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [addedItem, setAddedItem] = useState<{
    name: string;
    quantity: number;
    price: string;
  } | null>(null);

  useEffect(() => {
    // Update cart count from the global cart context
    setCartCount(getCartCount());
  }, [cartItems, getCartCount]);

  useEffect(() => {
    if (supermarketId) {
      const foundSupermarket = supermarkets.find(s => s.id === supermarketId);
      if (foundSupermarket) {
        setSelectedSupermarket(foundSupermarket);
      }
    }
  }, [supermarketId]);

  const filteredItems = groceryItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const openAddToCartModal = (item: GroceryItem) => {
    setSelectedItem(item);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  const closeSuccessModal = () => {
    setSuccessModalVisible(false);
  };

  const handleAddToCart = async (quantity: number) => {
    if (!selectedItem) return;
    
    // Close quantity modal
    setModalVisible(false);
    
    try {
      // Create cart item from grocery item
      const priceValue = parseFloat(selectedItem.price.split(' ')[0]);
      const currency = 'XAF';
      const totalPrice = priceValue * quantity;
      
      // For groceries, we need to adapt to the CartItem structure
      // totalMeters is required but not applicable for groceries, so use a minimal valid value
      const totalMeters = 1; // Minimum valid value to pass validation
      
      const newCartItem: CartItem = {
        id: `grocery-${selectedItem.id}-${Date.now()}`,
        productName: selectedItem.name,
        pricePerMeter: priceValue,
        currency,
        totalPrice: totalPrice,
        totalQuantity: quantity,
        totalMeters: totalMeters, // Required field, using minimal valid value
        colorDetails: [
          {
            color: selectedItem.organic ? 'green' : 'default',
            label: 'Default',
            quantity: quantity,
            length: 1, // Required field, using minimal valid value
          }
        ],
        notes: selectedItem.organic ? 'Organic product' : '',
        addedAt: new Date().toISOString(),
        productType: 'grocery',
        image: typeof selectedItem.image === 'object' && 'uri' in selectedItem.image 
          ? selectedItem.image.uri 
          : undefined,
        category: selectedItem.category,
        // Add any other required fields for grocery items
        brand: selectedSupermarket?.name || '',
        weight: 1000, // Default weight in grams, if needed
      };
      
      // Add to cart
      await addItemToCart(newCartItem);
      
      // Show success modal
      setAddedItem({
        name: selectedItem.name,
        quantity,
        price: `${currency} ${totalPrice.toFixed(0)}`,
      });
      setSuccessModalVisible(true);
      
      // Update cart count
      setCartCount(getCartCount());
    } catch (error) {
      console.error('Failed to add item to cart:', error);
      // Handle error (could add an error toast/notification here)
    }
  };

  const goBack = () => {
    router.back();
  };

  const goToCart = () => {
    router.push('/(tabs)/cart');
  };

  return (
    <SafeAreaView 
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={['top', 'left', 'right']}
    >
      <StatusBar style="dark" />

      <View style={styles.header}>
        <IconButton 
          icon="arrow-left" 
          onPress={goBack} 
          style={styles.backButton}
        />
        <Text variant="titleLarge" style={styles.title}>
          {selectedSupermarket?.name || 'Grocery Shopping'}
        </Text>
        <TouchableOpacity onPress={goToCart} style={styles.cartButton}>
          <IconButton 
            icon="cart" 
            onPress={goToCart}
          />
          {cartCount > 0 && (
            <Badge style={styles.cartBadge}>{cartCount}</Badge>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search groceries..."
        />
      </View>

      <View style={styles.categorySection}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={styles.categoriesContainer}
          contentContainerStyle={styles.categoriesContentContainer}
        >
          {categories.map(category => (
            <Chip
              key={category.id}
              selected={selectedCategory === category.id}
              onPress={() => setSelectedCategory(category.id)}
              style={styles.categoryChip}
            >
              {category.name}
            </Chip>
          ))}
        </ScrollView>

        <Divider style={styles.categoryDivider} />
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.groceryItemsContainer}>
          {filteredItems.map((item) => (
            <Card 
              key={item.id} 
              style={styles.groceryItemCard}
            >
              {item.sale && (
                <View style={styles.saleContainer}>
                  <Text variant="bodySmall" style={styles.saleText}>SALE</Text>
                </View>
              )}
              <Card.Cover source={item.image} style={styles.groceryItemImage} />
              <Card.Content>
                <View style={styles.groceryItemTitleContainer}>
                  <Text variant="titleSmall" numberOfLines={1} style={styles.groceryItemTitle}>
                    {item.name}
                  </Text>
                  {item.organic && (
                    <View style={[styles.organicBadge, { backgroundColor: theme.colors.primary }]}>
                      <Text variant="labelSmall" color={theme.colors.onPrimary}>
                        Organic
                      </Text>
                    </View>
                  )}
                </View>
                <Text variant="bodyMedium" color={theme.colors.onSurfaceVariant}>
                  {item.price}
                </Text>
              </Card.Content>
              <Card.Actions>
                <TouchableOpacity 
                  style={[styles.addToCartButton, { backgroundColor: theme.colors.primary }]} 
                  onPress={() => openAddToCartModal(item)}
                >
                  <Text variant="labelMedium" color={theme.colors.onPrimary}>
                    Add to Cart
                  </Text>
                </TouchableOpacity>
              </Card.Actions>
            </Card>
          ))}
        </View>
      </ScrollView>

      {/* Quantity Selection Modal */}
      {selectedItem && (
        <CartQuantityModal 
          visible={modalVisible}
          onClose={closeModal}
          onConfirm={handleAddToCart}
          item={selectedItem}
        />
      )}

      {/* Success Modal - Show after item is added to cart */}
      <CartAddedSuccessModal 
        visible={successModalVisible}
        onClose={closeSuccessModal}
        productName={addedItem?.name || ''}
        quantity={addedItem?.quantity || 0}
        price={addedItem?.price || ''}
        onViewCart={() => {
          closeSuccessModal();
          goToCart();
        }}
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
    paddingTop: 16,
    paddingBottom: 8,
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    flex: 1,
    textAlign: 'center',
  },
  cartButton: {
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  categorySection: {
    paddingHorizontal: 0,
    paddingVertical: 0,
    marginBottom: 0,
  },
  categoriesContainer: {
    paddingHorizontal: 16,
    paddingVertical: 0,
    marginBottom: 0,
  },
  categoriesContentContainer: {
    paddingVertical: 0,
    height: 36,
  },
  categoryChip: {
    marginRight: 8,
  },
  categoryDivider: {
    marginTop: 15,
  },
  scrollView: {
    flex: 1,
  },
  groceryItemsContainer: {
    padding: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  groceryItemCard: {
    width: '48%',
    marginBottom: 16,
    position: 'relative',
  },
  groceryItemImage: {
    height: 120,
    resizeMode: 'cover',
    backgroundColor: '#f5f5f5',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  groceryItemTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    marginBottom: 4,
  },
  groceryItemTitle: {
    flex: 1,
  },
  organicBadge: {
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 4,
  },
  addToCartButton: {
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignSelf: 'flex-end',
  },
  saleContainer: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'red',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    zIndex: 1,
  },
  saleText: {
    color: 'white',
    fontWeight: 'bold',
  },
}); 