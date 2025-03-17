import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, ScrollView, Image, Alert, Dimensions, ActivityIndicator as RNActivityIndicator, TouchableOpacity, Modal, Animated } from 'react-native';
import { useTheme } from 'react-native-paper';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons, MaterialCommunityIcons, AntDesign, FontAwesome } from '@expo/vector-icons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '../components/Button';
import { Text as CustomText } from '../components/CustomText';
import { Card } from '../components/CustomCard';
import { Divider } from '../components/CustomDivider';
import { useCart } from '../context/CartContext';

// Define TypeScript interfaces
interface MedicationAlternative {
  id: number;
  name: string;
  price: number;
}

interface Medication {
  id: number;
  name: string;
  price: number;
  description: string;
  longDescription: string;
  image: string;
  category: string;
  dosage: string;
  form: string;
  quantity: number;
  manufacturer: string;
  requiresPrescription: boolean;
  sideEffects: string[];
  rating: number;
  reviews: number;
  inStock: boolean;
  alternatives: MedicationAlternative[];
}

// Error Modal Component
const ErrorModal = ({ 
  visible, 
  onClose, 
  title,
  message,
  actionButtonText = "OK"
}: { 
  visible: boolean;
  onClose: () => void;
  title: string;
  message: string;
  actionButtonText?: string;
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
      <View style={errorModalStyles.overlay}>
        <Animated.View 
          style={[
            errorModalStyles.modalContainer, 
            { 
              backgroundColor: theme.colors.background,
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
              paddingBottom: insets.bottom > 0 ? insets.bottom : 20
            }
          ]}
        >
          <View style={errorModalStyles.modalHeader}>
            <TouchableOpacity 
              style={errorModalStyles.closeButton}
              onPress={onClose}
            >
              <MaterialCommunityIcons name="close" size={24} color={theme.colors.onSurface} />
            </TouchableOpacity>
            <View style={errorModalStyles.modalHeaderCenter}>
              <View style={errorModalStyles.modalIndicator} />
            </View>
            <View style={errorModalStyles.headerSpacer} />
          </View>
          
          <View style={errorModalStyles.modalContent}>
            <View style={errorModalStyles.iconContainer}>
              <MaterialCommunityIcons 
                name="alert-circle" 
                size={60} 
                color={theme.colors.error} 
              />
            </View>
            
            <CustomText variant="headlineSmall" style={errorModalStyles.modalTitle}>
              {title}
            </CustomText>
            
            <CustomText variant="bodyMedium" style={errorModalStyles.message}>
              {message}
            </CustomText>
          </View>
          
          <View style={errorModalStyles.modalActions}>
            <Button
              mode="contained"
              onPress={onClose}
              style={errorModalStyles.actionButton}
            >
              {actionButtonText}
            </Button>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

// Error modal specific styles
const errorModalStyles = StyleSheet.create({
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
    alignItems: 'center',
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  message: {
    textAlign: 'center',
    marginBottom: 16,
  },
  modalActions: {
    padding: 16,
    paddingTop: 0,
  },
  actionButton: {
    borderRadius: 8,
  },
});

// Cart Added Modal Component
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
  const checkmarkScale = useRef(new Animated.Value(0)).current;
  const checkmarkOpacity = useRef(new Animated.Value(0)).current;
  
  // Get medication image if available
  const medication = visible ? MEDICATIONS.find(med => med.name === medicationName) : null;
  const medicationImage = medication?.image || 'https://placehold.co/400x400/png';
  
  useEffect(() => {
    if (visible) {
      // Reset animations
      checkmarkScale.setValue(0);
      checkmarkOpacity.setValue(0);
      
      // Modal appearance animation
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
      
      // Checkmark animation with slight delay
      setTimeout(() => {
        Animated.parallel([
          Animated.spring(checkmarkScale, {
            toValue: 1,
            friction: 5,
            tension: 40,
            useNativeDriver: true,
          }),
          Animated.timing(checkmarkOpacity, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          })
        ]).start();
      }, 200);
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, fadeAnim, scaleAnim, checkmarkScale, checkmarkOpacity]);

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
              paddingBottom: insets.bottom > 0 ? insets.bottom : 20
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
          
          <View style={cartModalStyles.heroSection}>
            <Animated.View 
              style={[
                cartModalStyles.successIconOverlay,
                {
                  opacity: checkmarkOpacity,
                  transform: [{ scale: checkmarkScale }]
                }
              ]}
            >
              <MaterialCommunityIcons 
                name="check-circle" 
                size={64} 
                color="#FFFFFF" 
              />
            </Animated.View>
            <Image 
              source={{ uri: medicationImage }} 
              style={cartModalStyles.productImage}
              resizeMode="cover"
            />
          </View>
          
          <View style={cartModalStyles.modalContent}>
            <CustomText variant="headlineSmall" style={cartModalStyles.modalTitle}>
              Added to Cart
            </CustomText>
            
            <View style={cartModalStyles.modalDetails}>
              <CustomText variant="titleMedium" style={cartModalStyles.productName}>
                {medicationName}
              </CustomText>
              
              <View style={cartModalStyles.detailsGrid}>
                <View style={cartModalStyles.detailItem}>
                  <MaterialCommunityIcons 
                    name="numeric" 
                    size={20} 
                    color={theme.colors.primary} 
                    style={cartModalStyles.detailIcon}
                  />
                  <View>
                    <CustomText variant="bodySmall" style={cartModalStyles.detailLabel}>
                      Quantity
                    </CustomText>
                    <CustomText variant="bodyLarge" style={cartModalStyles.detailValue}>
                      {quantity} {quantity === 1 ? 'unit' : 'units'}
                    </CustomText>
                  </View>
                </View>
                
                <View style={cartModalStyles.detailItem}>
                  <MaterialCommunityIcons 
                    name="tag" 
                    size={20} 
                    color={theme.colors.primary} 
                    style={cartModalStyles.detailIcon}
                  />
                  <View>
                    <CustomText variant="bodySmall" style={cartModalStyles.detailLabel}>
                      Category
                    </CustomText>
                    <CustomText variant="bodyLarge" style={cartModalStyles.detailValue}>
                      {category}
                    </CustomText>
                  </View>
                </View>
              </View>
              
              <View style={cartModalStyles.priceSeparator} />
              
              <View style={cartModalStyles.priceRow}>
                <CustomText variant="bodyMedium" style={cartModalStyles.totalLabel}>
                  Total Price:
                </CustomText>
                <CustomText variant="headlineSmall" style={[cartModalStyles.totalPrice, { color: theme.colors.primary }]}>
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
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContainer: {
    width: '90%',
    maxWidth: 400,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
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
    borderRadius: 4,
    backgroundColor: '#DDDDDD',
  },
  closeButton: {
    padding: 8,
    marginRight: 8,
  },
  headerSpacer: {
    width: 40, // Same width as the close button area
  },
  heroSection: {
    position: 'relative',
    width: '100%',
    height: 180,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  successIconOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(76, 175, 80, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  modalContent: {
    padding: 20,
  },
  modalTitle: {
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalDetails: {
    backgroundColor: '#f9f9f9',
    borderRadius: 16,
    padding: 20,
  },
  productName: {
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
  },
  detailsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  detailItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  detailIcon: {
    marginRight: 12,
  },
  detailLabel: {
    color: '#666666',
    marginBottom: 2,
  },
  detailValue: {
    fontWeight: '500',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    color: '#666666',
    fontWeight: '500',
  },
  priceSeparator: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 16,
  },
  totalPrice: {
    fontWeight: 'bold',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 0,
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 6,
    borderRadius: 12,
    paddingVertical: 4,
  },
});

// Sample medication data
const MEDICATIONS: Medication[] = [
  {
    id: 1,
    name: 'Paracetamol',
    price: 5500,
    description: 'Pain reliever and fever reducer',
    longDescription: 'Paracetamol is a pain reliever and fever reducer. It is used to treat many conditions such as headache, muscle aches, arthritis, backache, toothaches, colds, and fevers. It works by inhibiting the production of certain chemical messengers in the brain that signal pain and fever.',
    image: 'https://placehold.co/500x500/png',
    category: 'Pain Relief',
    dosage: '500mg',
    form: 'Tablets',
    quantity: 20,
    manufacturer: 'CamPharma Labs',
    requiresPrescription: false,
    sideEffects: [
      'Nausea',
      'Stomach pain',
      'Loss of appetite',
      'Headache',
      'Dizziness'
    ],
    rating: 4.5,
    reviews: 127,
    inStock: true,
    alternatives: [
      { id: 5, name: 'Ibuprofen 400mg', price: 7500 },
      { id: 6, name: 'Aspirin 300mg', price: 4800 }
    ]
  },
  {
    id: 2,
    name: 'Vitamin C',
    price: 8500,
    description: 'Immune system support',
    longDescription: 'Vitamin C is an essential nutrient involved in the repair of tissue and the enzymatic production of certain neurotransmitters. It is required for the functioning of several enzymes and is important for immune system function. It also functions as an antioxidant.',
    image: 'https://placehold.co/500x500/png',
    category: 'Vitamins',
    dosage: '1000mg',
    form: 'Chewable Tablets',
    quantity: 30,
    manufacturer: 'Douala HealthPlus',
    requiresPrescription: false,
    sideEffects: [
      'Nausea',
      'Vomiting',
      'Heartburn',
      'Stomach cramps',
      'Headache'
    ],
    rating: 4.7,
    reviews: 89,
    inStock: true,
    alternatives: [
      { id: 7, name: 'Multivitamin Complex', price: 12000 },
      { id: 8, name: 'Zinc + Vitamin C', price: 10500 }
    ]
  },
  {
    id: 3,
    name: 'Allergy Relief',
    price: 12500,
    description: 'Fast-acting antihistamine',
    longDescription: 'Allergy Relief is an antihistamine that reduces the effects of natural chemical histamine in the body. Histamine can produce symptoms of sneezing, itching, watery eyes, and runny nose. It is used to treat the symptoms of allergies, such as sneezing, watery eyes, and runny nose.',
    image: 'https://placehold.co/500x500/png',
    category: 'Allergy',
    dosage: '10mg',
    form: 'Tablets',
    quantity: 14,
    manufacturer: 'AllerCare Cameroon',
    requiresPrescription: false,
    sideEffects: [
      'Drowsiness',
      'Dry mouth',
      'Headache',
      'Nervousness',
      'Dizziness'
    ],
    rating: 4.2,
    reviews: 56,
    inStock: true,
    alternatives: [
      { id: 9, name: 'Nasal Spray', price: 15000 },
      { id: 10, name: 'Allergy Eye Drops', price: 9500 }
    ]
  },
  {
    id: 4,
    name: 'First Aid Kit',
    price: 24000,
    description: 'Essential home first aid supplies',
    longDescription: 'This comprehensive First Aid Kit contains essential supplies for treating minor injuries at home. It includes bandages, antiseptic wipes, gauze pads, adhesive tape, scissors, tweezers, gloves, and more. Keep it accessible in your home for emergency situations.',
    image: 'https://placehold.co/500x500/png',
    category: 'First Aid',
    dosage: 'N/A',
    form: 'Kit',
    quantity: 1,
    manufacturer: 'SafetyFirst Douala',
    requiresPrescription: false,
    sideEffects: [],
    rating: 4.8,
    reviews: 203,
    inStock: true,
    alternatives: [
      { id: 11, name: 'Travel First Aid Kit', price: 14000 },
      { id: 12, name: 'Sports First Aid Kit', price: 29000 }
    ]
  }
];

const PharmacyMedicationScreen = () => {
  const theme = useTheme();
  const { medicationId } = useLocalSearchParams();
  const { cartItems, addToCart } = useCart();
  const [loading, setLoading] = useState(true);
  const [medication, setMedication] = useState<Medication | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  
  // Add state for cart modal
  const [cartModalVisible, setCartModalVisible] = useState(false);
  const [cartModalDetails, setCartModalDetails] = useState({
    medicationName: '',
    quantity: 0,
    totalPrice: 0,
    category: ''
  });

  // Add state for error modal
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [errorModalDetails, setErrorModalDetails] = useState({
    title: '',
    message: '',
    actionButtonText: 'OK'
  });

  // Function to show error modal
  const showErrorModal = (title: string, message: string, actionButtonText: string = 'OK') => {
    setErrorModalDetails({
      title,
      message,
      actionButtonText
    });
    setErrorModalVisible(true);
  };

  useEffect(() => {
    // Simulate API fetch
    const timer = setTimeout(() => {
      const foundMedication = MEDICATIONS.find(med => med.id === Number(medicationId));
      
      if (foundMedication) {
        setMedication(foundMedication);
      } else {
        showErrorModal('Error', 'Medication not found', 'Go Back');
      }
      
      setLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, [medicationId]);

  const incrementQuantity = () => {
    if (quantity < 10 && medication && quantity < medication.quantity) {
      setQuantity(quantity + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  // Check if medication is already in cart
  const isInCart = (medicationId: number): boolean => {
    return cartItems.some(item => 
      item.productType === 'medication' && 
      item.id.includes(`medication_${medicationId}`)
    );
  };

  const handleAddToCart = async () => {
    if (!medication) return;
    
    // Check if medication is in stock
    if (!medication.inStock) {
      showErrorModal(
        "Out of Stock",
        `${medication.name} is currently out of stock. Please check back later.`
      );
      return;
    }
    
    // Check if user is trying to add more than available stock
    if (quantity > medication.quantity) {
      showErrorModal(
        "Insufficient Stock",
        `Only ${medication.quantity} units of ${medication.name} are available.`
      );
      return;
    }
    
    setAddingToCart(true);
    
    try {
      // Check if this exact medication is already in the cart
      const existingMedItemIndex = cartItems.findIndex(item => 
        item.productType === 'medication' && 
        item.id.includes(`medication_${medication.id}`)
      );
      
      console.log('Current cart items:', JSON.stringify(cartItems));
      console.log('Adding medication:', medication.name, 'Quantity:', quantity);
      console.log('Existing item index:', existingMedItemIndex);

      if (existingMedItemIndex !== -1) {
        // If it exists, update the quantity and total price
        const existingItem = cartItems[existingMedItemIndex];
        const updatedItem = {
          ...existingItem,
          totalQuantity: existingItem.totalQuantity + quantity,
          totalPrice: existingItem.totalPrice + (medication.price * quantity),
          colorDetails: [
            {
              color: '#f0f0f0',
              label: medication.category,
              quantity: existingItem.totalQuantity + quantity,
              length: 1
            }
          ]
        };
        
        console.log('Updating cart item:', JSON.stringify(updatedItem));
        
        // Create a new cart array with the updated item
        const updatedCart = [...cartItems];
        updatedCart[existingMedItemIndex] = updatedItem;
        
        // Use addToCart to update the entire cart
        await addToCart(updatedItem);
        console.log('Updated cart after add:', JSON.stringify(cartItems));
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
          brand: medication.manufacturer,
        };
        
        console.log('Adding new cart item:', JSON.stringify(cartItem));
        await addToCart(cartItem);
        console.log('Cart after adding new item:', JSON.stringify(cartItems));
      }
      
      // Show the modal
      setCartModalDetails({
        medicationName: medication.name,
        quantity: quantity,
        totalPrice: medication.price * quantity,
        category: medication.category
      });
      setCartModalVisible(true);
      
      // Reset quantity to 1 after adding to cart
      setQuantity(1);
    } catch (error) {
      console.error('Failed to add to cart:', error);
      showErrorModal(
        "Error",
        `Failed to add ${medication.name} to cart. ${error instanceof Error ? error.message : 'Please try again.'}`
      );
    } finally {
      setAddingToCart(false);
    }
  };

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    
    return (
      <View style={styles.starsContainer}>
        {[...Array(fullStars)].map((_, i) => (
          <FontAwesome key={`full-${i}`} name="star" size={16} color="#FFD700" style={styles.star} />
        ))}
        
        {halfStar && (
          <FontAwesome key="half" name="star-half-full" size={16} color="#FFD700" style={styles.star} />
        )}
        
        {[...Array(emptyStars)].map((_, i) => (
          <FontAwesome key={`empty-${i}`} name="star-o" size={16} color="#FFD700" style={styles.star} />
        ))}
        
        {medication && (
          <CustomText variant="bodyMedium" style={styles.reviewCount}>({medication.reviews})</CustomText>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['right', 'left', 'top']}>
      <View style={styles.header}>
        <Button 
          mode="text" 
          icon="arrow-left"
          onPress={() => router.back()}
          style={styles.backButton}
        >
          {''}
        </Button>
        <CustomText variant="headlineSmall" style={styles.headerTitle}>Medication Details</CustomText>
        
        {/* Add Cart Button to Header */}
        <TouchableOpacity 
          onPress={() => router.push('/(tabs)/cart')}
          style={styles.cartButton}
        >
          <MaterialCommunityIcons name="cart-outline" size={24} color={theme.colors.primary} />
          {cartItems.length > 0 && (
            <View style={styles.cartBadge}>
              <CustomText variant="bodySmall" style={styles.cartBadgeText}>
                {cartItems.length}
              </CustomText>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <RNActivityIndicator size="large" color={theme.colors.primary} />
          <CustomText variant="bodyMedium" style={styles.loadingText}>Loading medication details...</CustomText>
        </View>
      ) : medication ? (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Product Image */}
          <View style={styles.imageContainer}>
            <Image 
              source={{ uri: medication.image }} 
              style={styles.medicationImage} 
              resizeMode="cover"
            />
          </View>

          {/* Product Information */}
          <View style={styles.infoContainer}>
            <View 
              style={[
                styles.categoryChip,
                { backgroundColor: `${theme.colors.primary}20` }
              ]}
            >
              <CustomText variant="bodySmall" style={{ color: theme.colors.primary }}>
                {medication.category}
              </CustomText>
            </View>

            <CustomText variant="headlineMedium" style={styles.medicationName}>{medication.name}</CustomText>
            
            <View style={styles.detailRow}>
              <CustomText variant="bodyMedium" style={styles.dosageText}>
                {medication.dosage} • {medication.form} • {medication.quantity} {medication.form === 'Kit' ? 'items' : 'units'}
              </CustomText>
            </View>

            <View style={styles.ratingContainer}>
              {renderStars(medication.rating)}
            </View>

            <View style={styles.priceContainer}>
              <CustomText variant="headlineSmall" style={styles.price}>XAF {medication.price.toLocaleString()}</CustomText>
              {medication.inStock ? (
                <View style={styles.inStockContainer}>
                  <MaterialCommunityIcons name="check-circle" size={16} color="#4CAF50" />
                  <CustomText variant="bodyMedium" style={styles.inStockText}>In Stock</CustomText>
                </View>
              ) : (
                <View style={styles.outOfStockContainer}>
                  <MaterialCommunityIcons name="alert-circle" size={16} color={theme.colors.error} />
                  <CustomText variant="bodyMedium" style={styles.outOfStockText}>Out of Stock</CustomText>
                </View>
              )}
            </View>
          </View>

          <Divider style={styles.divider} />

          {/* Quantity Selector */}
          <View style={styles.quantityContainer}>
            <CustomText variant="bodyMedium">Quantity:</CustomText>
            <View style={styles.quantitySelector}>
              <Button 
                mode="outlined" 
                onPress={decrementQuantity}
                style={styles.quantityButton}
                disabled={quantity <= 1}
              >
                -
              </Button>
              <CustomText variant="titleMedium" style={styles.quantityText}>{quantity}</CustomText>
              <Button 
                mode="outlined" 
                onPress={incrementQuantity}
                style={styles.quantityButton}
                disabled={quantity >= 10 || !medication.inStock || (medication && quantity >= medication.quantity)}
              >
                +
              </Button>
            </View>
          </View>

          {/* Add to Cart Button */}
          {isInCart(medication.id) ? (
            <View style={styles.cartButtonContainer}>
              <Button
                mode="contained"
                onPress={handleAddToCart}
                loading={addingToCart}
                disabled={addingToCart || !medication.inStock}
                style={[styles.addToCartButton, { flex: 1 }]}
                icon="cart-plus"
              >
                Add to Cart
              </Button>
              
              <TouchableOpacity
                style={styles.viewCartButton}
                onPress={() => router.push('/(tabs)/cart')}
              >
                <MaterialCommunityIcons name="cart-outline" size={24} color={theme.colors.primary} />
              </TouchableOpacity>
            </View>
          ) : (
            <Button
              mode="contained"
              onPress={handleAddToCart}
              loading={addingToCart}
              disabled={addingToCart || !medication.inStock}
              style={styles.addToCartButton}
              icon="cart-outline"
            >
              {medication.inStock ? 'Add to Cart' : 'Out of Stock'}
            </Button>
          )}

          <Divider style={styles.divider} />

          {/* Description */}
          <Card style={styles.card}>
            <Card.Content>
              <CustomText variant="titleMedium" style={styles.sectionTitle}>Description</CustomText>
              <CustomText variant="bodyMedium" style={styles.descriptionText}>
                {medication.longDescription}
              </CustomText>
            </Card.Content>
          </Card>

          {/* Details */}
          <Card style={styles.card}>
            <Card.Content>
              <CustomText variant="titleMedium" style={styles.sectionTitle}>Product Details</CustomText>
              
              <View style={styles.detailItem}>
                <CustomText variant="bodyMedium" style={styles.detailLabel}>Manufacturer</CustomText>
                <CustomText variant="bodyMedium">{medication.manufacturer}</CustomText>
              </View>
              
              <View style={styles.detailItem}>
                <CustomText variant="bodyMedium" style={styles.detailLabel}>Form</CustomText>
                <CustomText variant="bodyMedium">{medication.form}</CustomText>
              </View>
              
              <View style={styles.detailItem}>
                <CustomText variant="bodyMedium" style={styles.detailLabel}>Dosage</CustomText>
                <CustomText variant="bodyMedium">{medication.dosage}</CustomText>
              </View>
              
              <View style={styles.detailItem}>
                <CustomText variant="bodyMedium" style={styles.detailLabel}>Quantity in Pack</CustomText>
                <CustomText variant="bodyMedium">{medication.quantity} {medication.form === 'Kit' ? 'items' : 'units'}</CustomText>
              </View>
              
              <View style={styles.detailItem}>
                <CustomText variant="bodyMedium" style={styles.detailLabel}>Prescription Required</CustomText>
                <CustomText variant="bodyMedium">{medication.requiresPrescription ? 'Yes' : 'No'}</CustomText>
              </View>
            </Card.Content>
          </Card>

          {/* Side Effects */}
          {medication.sideEffects.length > 0 && (
            <Card style={styles.card}>
              <Card.Content>
                <CustomText variant="titleMedium" style={styles.sectionTitle}>Possible Side Effects</CustomText>
                <View style={styles.sideEffectsContainer}>
                  {medication.sideEffects.map((effect, index) => (
                    <View key={index} style={styles.sideEffectItem}>
                      <MaterialCommunityIcons name="alert-circle-outline" size={16} color={theme.colors.primary} />
                      <CustomText variant="bodyMedium" style={styles.sideEffectText}>{effect}</CustomText>
                    </View>
                  ))}
                </View>
              </Card.Content>
            </Card>
          )}

          {/* Similar Products */}
          {medication.alternatives.length > 0 && (
            <Card style={styles.card}>
              <Card.Content>
                <CustomText variant="titleMedium" style={styles.sectionTitle}>Similar Products</CustomText>
                <View style={styles.alternativesContainer}>
                  {medication.alternatives.map((alt) => (
                    <TouchableOpacity 
                      key={alt.id} 
                      style={styles.alternativeItem}
                      onPress={() => {
                        // Navigate to the alternative medication
                        router.push({
                          pathname: '/pharmacy-medication',
                          params: { medicationId: alt.id }
                        });
                      }}
                    >
                      <CustomText variant="bodyMedium" style={styles.alternativeName}>{alt.name}</CustomText>
                      <CustomText variant="bodyMedium" style={styles.alternativePrice}>XAF {alt.price.toLocaleString()}</CustomText>
                    </TouchableOpacity>
                  ))}
                </View>
              </Card.Content>
            </Card>
          )}

          {/* Disclaimer */}
          <View style={styles.disclaimerContainer}>
            <MaterialCommunityIcons name="shield-check" size={20} color={theme.colors.outline} />
            <CustomText variant="bodySmall" style={styles.disclaimerText}>
              The information provided is for educational purposes only and is not intended as medical advice.
              Consult with a healthcare professional before starting any medication.
            </CustomText>
          </View>
        </ScrollView>
      ) : (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={60} color={theme.colors.error} />
          <CustomText variant="titleMedium">Medication not found</CustomText>
          <Button 
            mode="contained" 
            onPress={() => router.back()}
            style={styles.backToPharmacyButton}
          >
            Back to Pharmacy
          </Button>
        </View>
      )}
      
      {/* Cart Added Modal */}
      <CartAddedModal
        visible={cartModalVisible}
        onClose={() => setCartModalVisible(false)}
        medicationName={cartModalDetails.medicationName}
        quantity={cartModalDetails.quantity}
        totalPrice={cartModalDetails.totalPrice}
        category={cartModalDetails.category}
      />

      {/* Error Modal */}
      <ErrorModal
        visible={errorModalVisible}
        onClose={() => {
          setErrorModalVisible(false);
          if (errorModalDetails.title === 'Error' && errorModalDetails.message === 'Medication not found') {
            router.back();
          }
        }}
        title={errorModalDetails.title}
        message={errorModalDetails.message}
        actionButtonText={errorModalDetails.actionButtonText}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    marginRight: 48, // Offset for the button on the right
  },
  backButton: {
    marginLeft: -8,
  },
  cartButton: {
    position: 'relative',
    padding: 8,
  },
  cartBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
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
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  medicationImage: {
    width: '100%',
    height: 250,
    borderRadius: 12,
  },
  infoContainer: {
    marginBottom: 16,
  },
  categoryChip: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    marginBottom: 8,
  },
  medicationName: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  detailRow: {
    marginBottom: 8,
  },
  dosageText: {
    color: '#666',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  starsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  star: {
    marginRight: 4,
  },
  reviewCount: {
    marginLeft: 4,
    color: '#666',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  price: {
    fontWeight: 'bold',
  },
  inStockContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  inStockText: {
    color: '#4CAF50',
    marginLeft: 4,
  },
  outOfStockContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  outOfStockText: {
    color: '#F44336',
    marginLeft: 4,
  },
  divider: {
    marginVertical: 16,
  },
  quantityContainer: {
    marginBottom: 16,
  },
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  quantityButton: {
    minWidth: 48,
    marginHorizontal: 0,
  },
  quantityText: {
    marginHorizontal: 16,
    minWidth: 24,
    textAlign: 'center',
  },
  addToCartButton: {
    borderRadius: 8,
  },
  card: {
    marginBottom: 16,
    borderRadius: 12,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 12,
  },
  descriptionText: {
    lineHeight: 22,
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  detailLabel: {
    color: '#666',
  },
  sideEffectsContainer: {
    marginTop: 8,
  },
  sideEffectItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  sideEffectText: {
    marginLeft: 8,
  },
  alternativesContainer: {
    marginTop: 8,
  },
  alternativeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  alternativeName: {
    flex: 1,
  },
  alternativePrice: {
    fontWeight: 'bold',
  },
  disclaimerContainer: {
    flexDirection: 'row',
    backgroundColor: '#F5F5F5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  disclaimerText: {
    flex: 1,
    marginLeft: 8,
    color: '#666',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 16,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  backToPharmacyButton: {
    marginTop: 16,
  },
  cartButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  viewCartButton: {
    backgroundColor: '#f0f0f0',
    width: 48,
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
});

export default PharmacyMedicationScreen; 