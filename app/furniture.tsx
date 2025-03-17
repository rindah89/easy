import React, { useState, useRef, useMemo, useEffect, useContext } from 'react';
import { View, ScrollView, StyleSheet, Image, TouchableOpacity, Dimensions, Animated, Modal, TextInput, FlatList, Platform, Alert } from 'react-native';
import { useTheme } from 'react-native-paper';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Text } from '../components/CustomText';
import { Button } from '../components/Button';
import { Card } from '../components/CustomCard';
import { Divider } from '../components/CustomDivider';
import { IconButton } from '../components/CustomIconButton';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCart } from '../context/CartContext';
import DateTimePicker from '@react-native-community/datetimepicker';

const { width } = Dimensions.get('window');

interface Category {
  id: number;
  name: string;
  icon: any; // Using any to avoid TypeScript errors with MaterialCommunityIcons
}

interface FurnitureItem {
  id: number;
  name: string;
  price: number;
  description: string;
  image: string;
  category: string;
}

interface Promotion {
  id: string;
  title: string;
  description: string;
  image: { uri: string };
  action: string;
  serviceId?: string; // Optional service id to pre-select
}

// Service interface for design services
interface DesignService {
  id: string;
  title: string;
  description: string;
  price: string;
  duration: string;
  image: { uri: string };
}

// Define design services data
const designServices: DesignService[] = [
  {
    id: 'service1',
    title: 'Basic Design Consultation',
    description: 'A 1-hour virtual consultation to discuss your space and design ideas. Includes mood board and basic recommendations.',
    price: 'XAF 25,000',
    duration: '1 hour',
    image: { uri: 'https://images.unsplash.com/photo-1486304873000-235643847519?q=80&w=600' },
  },
  {
    id: 'service2',
    title: 'Full Room Design Package',
    description: 'Complete design solution for one room including furniture layout, color scheme, and shopping list.',
    price: 'XAF 150,000',
    duration: '2 weeks',
    image: { uri: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?q=80&w=600' },
  },
  {
    id: 'service3',
    title: 'Luxury Home Makeover',
    description: 'Comprehensive redesign of your entire home with premium furniture selections and custom solutions.',
    price: 'XAF 1,200,000',
    duration: '4-6 weeks',
    image: { uri: 'https://images.unsplash.com/photo-1600607686527-6fb886090705?q=80&w=600' },
  },
  {
    id: 'service4',
    title: 'Commercial Space Design',
    description: 'Professional design services for offices, restaurants, and retail spaces to impress clients and enhance productivity.',
    price: 'XAF 2,500,000+',
    duration: 'Varies',
    image: { uri: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=600' },
  },
];

// Promotional data for carousel
const furniturePromotions: Promotion[] = [
  {
    id: '1',
    title: 'Summer Collection',
    description: 'Enjoy 30% off on our new summer luxury furniture',
    image: { uri: 'https://images.unsplash.com/photo-1600585152220-90363fe7e115?q=80&w=600' },
    action: 'Shop Now',
  },
  {
    id: '2',
    title: 'Interior Design Services',
    description: 'Book a consultation with our expert interior designers',
    image: { uri: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=600' },
    action: 'Book Now',
    serviceId: 'service1', // Reference to Basic Design Consultation
  },
  {
    id: '3',
    title: 'Premium Kitchen Fixtures',
    description: 'Transform your kitchen with our luxury fixtures and appliances',
    image: { uri: 'https://images.unsplash.com/photo-1556912167-f556f1f39fdf?q=80&w=600' },
    action: 'View Collection',
  },
];

// Component for section headers
function SectionHeader({ title, actionText, onAction }: { title: string; actionText?: string; onAction?: () => void }) {
  const theme = useTheme();
  
  return (
    <View style={styles.sectionHeader}>
      <Text variant="titleMedium" style={styles.sectionTitle}>{title}</Text>
      {actionText && (
        <TouchableOpacity onPress={onAction}>
          <Text variant="bodyMedium" style={{ color: theme.colors.primary }}>{actionText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// Component for featured carousel
function FeaturedCarousel({ items }: { items: Promotion[] }) {
  const theme = useTheme();
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const { setConsultationModalVisible, setSelectedService, openConsultationModal } = React.useContext(FurnitureContext);

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    { useNativeDriver: false }
  );
  
  const handlePromotionAction = (item: Promotion) => {
    console.log(`Action pressed: ${item.action}`);
    
    // Check if this is a design service promotion
    if (item.title.includes('Interior Design') || item.action === 'Book Now') {
      // Find the matching service if serviceId is provided
      if (item.serviceId) {
        const service = designServices.find(s => s.id === item.serviceId);
        if (service) {
          console.log('Opening modal with specific service:', service.title);
          openConsultationModal(service);
        } else {
          console.log('Service ID not found, using default');
          openConsultationModal(null);
        }
      } else {
        // Default to showing the selection modal if no specific service is mentioned
        console.log('No service ID specified, showing selection modal');
        openConsultationModal(null);
      }
    } else if (item.action === 'Shop Now') {
      // Handle Shop Now action - navigate to collection
      console.log('Navigate to shop collection');
      router.push('/furniture-all-items');
    } else if (item.action === 'View Collection') {
      // Handle View Collection - filter by category
      if (item.title.includes('Kitchen')) {
        console.log('Navigate to Kitchen collection');
        router.push({ pathname: '/furniture', params: { category: 'Kitchen' } });
      } else {
        console.log('Navigate to general collection');
        router.push('/furniture-all-items');
      }
    }
  };

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
                onPress={() => handlePromotionAction(item)}
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

// Create a context for furniture screen state
const FurnitureContext = React.createContext<{
  setConsultationModalVisible: React.Dispatch<React.SetStateAction<boolean>>;
  selectedService: DesignService | null;
  setSelectedService: React.Dispatch<React.SetStateAction<DesignService | null>>;
  openConsultationModal: (service: DesignService | null) => void;
}>({
  setConsultationModalVisible: () => {},
  selectedService: null,
  setSelectedService: () => {},
  openConsultationModal: () => {},
});

// Sample data for categories
const categories: Category[] = [
  { id: 1, name: 'Living Room', icon: 'sofa-outline' as const },
  { id: 2, name: 'Bedroom', icon: 'bed-empty' as const },
  { id: 3, name: 'Dining', icon: 'table-furniture' as const },
  { id: 4, name: 'Kitchen', icon: 'fridge-outline' as const },
  { id: 5, name: 'Bathroom', icon: 'shower' as const },
  { id: 6, name: 'Office', icon: 'desk-lamp' as const },
  { id: 7, name: 'Outdoor', icon: 'umbrella-outline' as const },
  { id: 8, name: 'Lighting', icon: 'ceiling-light' as const },
  { id: 9, name: 'Paints', icon: 'palette' as const },
  { id: 10, name: 'Fixtures', icon: 'water-pump' as const }, // Changed from 'faucet' to 'water-pump'
];

// Sample data for featured furniture items
const featuredItems: FurnitureItem[] = [
  {
    id: 1,
    name: 'Milano Leather Sofa',
    price: 1250000,
    description: 'Premium Italian leather sofa with memory foam cushions for ultimate comfort.',
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc',
    category: 'Living Room',
  },
  {
    id: 2,
    name: 'Carrera Marble Sink',
    price: 450000,
    description: 'Hand-crafted Italian marble sink with brushed gold fixtures.',
    image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a',
    category: 'Bathroom',
  },
  {
    id: 3,
    name: 'Modern King Bed Frame',
    price: 650000,
    description: 'Contemporary platform bed frame with built-in LED lighting.',
    image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85',
    category: 'Bedroom',
  },
  {
    id: 4,
    name: 'Smart Toilet with Bidet',
    price: 800000,
    description: 'Feature-rich smart toilet with heated seat, bidet, and touchless flush.',
    image: 'https://images.unsplash.com/photo-1584622781564-1d987f7333c1',
    category: 'Bathroom',
  },
];

// Sample data for popular items
const popularItems: FurnitureItem[] = [
  {
    id: 5,
    name: 'Scandinavian Dining Table',
    price: 650000,
    description: 'Minimalist oak dining table that seats up to 8 people.',
    image: 'https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc',
    category: 'Dining',
  },
  {
    id: 6,
    name: 'Crystal Chandelier',
    price: 1250000,
    description: 'Hand-crafted crystal chandelier with dimmable LED lighting.',
    image: 'https://images.unsplash.com/photo-1543248939-ff40856f65d4',
    category: 'Lighting',
  },
  {
    id: 7,
    name: 'Executive Office Desk',
    price: 900000,
    description: 'Solid walnut executive desk with built-in wireless charging.',
    image: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd',
    category: 'Office',
  },
  {
    id: 8,
    name: 'Gourmet Kitchen Island',
    price: 1650000,
    description: 'Professional-grade kitchen island with marble countertop and built-in sink.',
    image: 'https://images.unsplash.com/photo-1556910096-6f5e72db6803',
    category: 'Kitchen',
  },
  {
    id: 13,
    name: 'Premium Matte Wall Paint',
    price: 45000,
    description: 'Ultra-premium interior matte paint with zero VOC and exceptional coverage.',
    image: 'https://images.unsplash.com/photo-1562259929-b4e1fd3aef09',
    category: 'Paints',
  },
  {
    id: 14,
    name: 'Freestanding Copper Bathtub',
    price: 2650000,
    description: 'Handcrafted copper bathtub with vintage finish and modern drainage system.',
    image: 'https://images.unsplash.com/photo-1507652313519-d4e9174996dd',
    category: 'Bathroom',
  },
  {
    id: 15,
    name: 'Rainfall Shower System',
    price: 950000,
    description: 'Complete shower system with thermostatic control, rainfall head, and body jets.',
    image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a',
    category: 'Bathroom',
  },
  {
    id: 16,
    name: 'Designer Vessel Sink',
    price: 400000,
    description: 'Artisanal glass vessel sink with hand-painted details and brass drain.',
    image: 'https://images.unsplash.com/photo-1507089947368-19c1da9775ae',
    category: 'Fixtures',
  },
];

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
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const clearButtonOpacity = useRef(new Animated.Value(0)).current;

  // Handle animation for clear button
  useEffect(() => {
    Animated.timing(clearButtonOpacity, {
      toValue: value.length > 0 ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [value, clearButtonOpacity]);

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  const clearText = () => {
    onChangeText('');
    // Focus the input after clearing
    inputRef.current?.focus();
  };

  return (
    <View 
      style={[
        styles.searchBarContainer, 
        style,
        isFocused && { borderColor: theme.colors.primary, borderWidth: 1 }
      ]}
    >
      <Ionicons 
        name="search" 
        size={20} 
        color={isFocused ? theme.colors.primary : theme.colors.outline} 
        style={styles.searchIcon} 
      />
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder || "Search luxury home products..."}
        style={styles.searchInput}
        placeholderTextColor={theme.colors.outline}
        onFocus={handleFocus}
        onBlur={handleBlur}
        returnKeyType="search"
        clearButtonMode="never" // We'll handle this manually for Android compatibility
      />
      <Animated.View style={{ opacity: clearButtonOpacity }}>
        {value ? (
          <TouchableOpacity onPress={clearText}>
            <Ionicons name="close-circle" size={20} color={theme.colors.outline} />
          </TouchableOpacity>
        ) : null}
      </Animated.View>
    </View>
  );
};

// Cart Added Modal Component
const CartAddedModal = ({ 
  visible, 
  onClose, 
  productName, 
  quantity, 
  totalPrice, 
  category 
}: { 
  visible: boolean;
  onClose: () => void;
  productName: string;
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

  // Find product image if available
  const product = featuredItems.find(item => item.name === productName) || 
                  popularItems.find(item => item.name === productName);
  const productImage = product?.image || 'https://placehold.co/400x400/png';

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
              source={{ uri: productImage }} 
              style={cartModalStyles.productImage}
              resizeMode="cover"
            />
          </View>
          
          <View style={cartModalStyles.modalContent}>
            <Text variant="headlineSmall" style={cartModalStyles.modalTitle}>
              Added to Cart
            </Text>
            
            <View style={cartModalStyles.modalDetails}>
              <Text variant="titleMedium" style={cartModalStyles.productName}>
                {productName}
              </Text>
              
              <View style={cartModalStyles.detailsGrid}>
                <View style={cartModalStyles.detailItem}>
                  <MaterialCommunityIcons 
                    name="numeric" 
                    size={20} 
                    color={theme.colors.primary} 
                    style={cartModalStyles.detailIcon}
                  />
                  <View>
                    <Text variant="bodySmall" style={cartModalStyles.detailLabel}>
                      Quantity
                    </Text>
                    <Text variant="bodyLarge" style={cartModalStyles.detailValue}>
                      {quantity} {quantity === 1 ? 'unit' : 'units'}
                    </Text>
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
                    <Text variant="bodySmall" style={cartModalStyles.detailLabel}>
                      Category
                    </Text>
                    <Text variant="bodyLarge" style={cartModalStyles.detailValue}>
                      {category}
                    </Text>
                  </View>
                </View>
              </View>
              
              <View style={cartModalStyles.priceSeparator} />
              
              <View style={cartModalStyles.priceRow}>
                <Text variant="bodyMedium" style={cartModalStyles.totalLabel}>
                  Total Price:
                </Text>
                <Text variant="headlineSmall" style={[cartModalStyles.totalPrice, { color: theme.colors.primary }]}>
                  XAF {Math.round(totalPrice).toLocaleString()}
                </Text>
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

// Error Modal Component for error handling
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
            
            <Text variant="headlineSmall" style={errorModalStyles.modalTitle}>
              {title}
            </Text>
            
            <Text variant="bodyMedium" style={errorModalStyles.message}>
              {message}
            </Text>
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

// Add a new ServiceSelectionModal component above the ConsultationBookingModal component
const ServiceSelectionModal = ({
  visible,
  onClose,
  onServiceSelect,
  services
}: {
  visible: boolean;
  onClose: () => void;
  onServiceSelect: (service: DesignService) => void;
  services: DesignService[];
}) => {
  const theme = useTheme();
  
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)'
      }}>
        <View style={{
          width: '90%',
          maxHeight: '80%',
          backgroundColor: theme.colors.background,
          borderRadius: 20,
          padding: 20,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          elevation: 5
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
            <Text variant="titleLarge" style={{ flex: 1, fontWeight: 'bold' }}>Select a Design Service</Text>
            <TouchableOpacity onPress={onClose}>
              <MaterialCommunityIcons name="close" size={24} color={theme.colors.onSurface} />
            </TouchableOpacity>
          </View>
          
          <Text variant="bodyMedium" style={{ marginBottom: 16 }}>
            Choose the design service that best suits your needs:
          </Text>
          
          <ScrollView style={{ maxHeight: 400 }}>
            {services.map((service) => (
              <TouchableOpacity 
                key={service.id}
                style={{
                  marginBottom: 16,
                  backgroundColor: theme.colors.surfaceVariant,
                  borderRadius: 12,
                  overflow: 'hidden'
                }}
                onPress={() => onServiceSelect(service)}
              >
                <Image 
                  source={service.image} 
                  style={{ width: '100%', height: 120 }}
                  resizeMode="cover"
                />
                <View style={{ padding: 16 }}>
                  <Text variant="titleMedium" style={{ fontWeight: '600', marginBottom: 8 }}>
                    {service.title}
                  </Text>
                  <Text variant="bodySmall" style={{ marginBottom: 12 }}>
                    {service.description}
                  </Text>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <MaterialCommunityIcons name="currency-usd" size={16} color={theme.colors.primary} />
                      <Text variant="bodySmall" style={{ marginLeft: 4 }}>{service.price}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <MaterialCommunityIcons name="clock-outline" size={16} color={theme.colors.primary} />
                      <Text variant="bodySmall" style={{ marginLeft: 4 }}>{service.duration}</Text>
                    </View>
                  </View>
                </View>
                <View style={{ 
                  position: 'absolute', 
                  top: 10, 
                  right: 10, 
                  backgroundColor: theme.colors.primaryContainer,
                  borderRadius: 20,
                  padding: 8
                }}>
                  <MaterialCommunityIcons name="arrow-right" size={16} color={theme.colors.primary} />
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
          
          <Button
            mode="outlined"
            onPress={onClose}
            style={{ marginTop: 16 }}
          >
            Cancel
          </Button>
        </View>
      </View>
    </Modal>
  );
};

// Replace the entire ConsultationBookingModal implementation with a simplified version
export const ConsultationBookingModal = ({
  visible,
  onClose,
  service = null
}: {
  visible: boolean;
  onClose: () => void;
  service?: DesignService | null;
}) => {
  const theme = useTheme();
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [notes, setNotes] = useState('');
  const [step, setStep] = useState(1);
  
  // Pick a date 
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  
  // Get the selected service
  const selectedServiceData = service || designServices[0];
  
  // Handle date selection
  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }));
    }
  };
  
  // Handle time selection
  const handleTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (selectedTime) {
      setTime(selectedTime.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      }));
    }
  };
  
  // Handle submit
  const handleSubmit = () => {
    if (date && time) {
      setStep(2);
    } else {
      // Show error - date and time required
      Alert.alert("Missing Information", "Please select a date and time for your consultation.");
    }
  };
  
  // Success view
  if (step === 2) {
    return (
      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={onClose}
      >
        <View style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'rgba(0,0,0,0.5)'
        }}>
          <View style={{
            width: '85%',
            backgroundColor: theme.colors.background,
            borderRadius: 20,
            padding: 20,
            alignItems: 'center',
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 5
          }}>
            <MaterialCommunityIcons 
              name="check-circle" 
              size={60} 
              color={theme.colors.primary} 
              style={{ marginBottom: 20 }}
            />
            
            <Text variant="headlineSmall" style={{ marginBottom: 16, fontWeight: 'bold', textAlign: 'center' }}>
              Booking Confirmed!
            </Text>
            
            <Text variant="bodyLarge" style={{ marginBottom: 12, textAlign: 'center' }}>
              Thank you for booking a consultation with our interior design team.
            </Text>
            
            <Text variant="bodyMedium" style={{ marginBottom: 24, textAlign: 'center', color: '#666' }}>
              One of our design consultants will contact you to confirm your appointment.
            </Text>
            
            <View style={{ 
              width: '100%',
              backgroundColor: '#f5f5f5',
              borderRadius: 12,
              padding: 16,
              marginBottom: 24
            }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text variant="bodyMedium" style={{ fontWeight: '500', color: '#666' }}>
                  Service:
                </Text>
                <Text variant="bodyMedium" style={{ fontWeight: '500' }}>
                  {selectedServiceData.title}
                </Text>
              </View>
              
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text variant="bodyMedium" style={{ fontWeight: '500', color: '#666' }}>
                  Date & Time:
                </Text>
                <Text variant="bodyMedium" style={{ fontWeight: '500' }}>
                  {date} at {time}
                </Text>
              </View>
              
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text variant="bodyMedium" style={{ fontWeight: '500', color: '#666' }}>
                  Booking ID:
                </Text>
                <Text variant="bodyMedium" style={{ fontWeight: '500', fontFamily: 'monospace' }}>
                  {`DC-${Math.random().toString(36).substring(2, 8).toUpperCase()}`}
                </Text>
              </View>
            </View>
            
            <Button
              mode="contained"
              onPress={onClose}
              style={{ width: '100%' }}
              icon="check"
            >
              Done
            </Button>
          </View>
        </View>
      </Modal>
    );
  }
  
  // Booking form view
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)'
      }}>
        <View style={{
          width: '85%',
          backgroundColor: theme.colors.background,
          borderRadius: 20,
          padding: 20,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          elevation: 5
        }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}>
            <Text variant="titleLarge" style={{ flex: 1, textAlign: 'center', fontWeight: 'bold' }}>
              Book a Consultation
            </Text>
            <TouchableOpacity onPress={onClose} style={{ position: 'absolute', right: 0, top: 0 }}>
              <MaterialCommunityIcons name="close" size={24} color={theme.colors.onSurface} />
            </TouchableOpacity>
          </View>
          
          <View style={{ 
            backgroundColor: '#f5f5f5', 
            borderRadius: 12, 
            padding: 16, 
            marginBottom: 16 
          }}>
            <Text variant="titleMedium" style={{ fontWeight: '600', marginBottom: 8 }}>
              {selectedServiceData.title}
            </Text>
            <Text variant="bodyMedium" style={{ marginBottom: 10 }}>
              {selectedServiceData.description}
            </Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <MaterialCommunityIcons name="currency-usd" size={18} color={theme.colors.primary} />
                <Text variant="bodySmall" style={{ marginLeft: 4 }}>{selectedServiceData.price}</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <MaterialCommunityIcons name="clock-outline" size={18} color={theme.colors.primary} />
                <Text variant="bodySmall" style={{ marginLeft: 4 }}>{selectedServiceData.duration}</Text>
              </View>
            </View>
          </View>
          
          <Text variant="titleMedium" style={{ marginBottom: 16, marginTop: 8, fontWeight: '500' }}>
            Schedule Your Consultation
          </Text>
          
          <View style={{ marginBottom: 16 }}>
            <Text variant="bodyMedium" style={{ marginBottom: 8, fontWeight: '500' }}>Date</Text>
            <TouchableOpacity 
              onPress={() => setShowDatePicker(true)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                borderRadius: 8,
                backgroundColor: theme.colors.surfaceVariant,
                padding: 12,
                paddingLeft: 40,
                position: 'relative'
              }}
            >
              <MaterialCommunityIcons 
                name="calendar" 
                size={20}
                color={theme.colors.primary}
                style={{ position: 'absolute', left: 12 }}
              />
              <Text style={{ flex: 1, color: date ? theme.colors.onSurface : theme.colors.outline }}>
                {date || "Select a date"}
              </Text>
              <MaterialCommunityIcons name="chevron-down" size={20} color={theme.colors.outline} />
            </TouchableOpacity>
          </View>
          
          <View style={{ marginBottom: 16 }}>
            <Text variant="bodyMedium" style={{ marginBottom: 8, fontWeight: '500' }}>Time</Text>
            <TouchableOpacity 
              onPress={() => setShowTimePicker(true)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                borderRadius: 8,
                backgroundColor: theme.colors.surfaceVariant,
                padding: 12,
                paddingLeft: 40,
                position: 'relative'
              }}
            >
              <MaterialCommunityIcons 
                name="clock-outline" 
                size={20}
                color={theme.colors.primary}
                style={{ position: 'absolute', left: 12 }}
              />
              <Text style={{ flex: 1, color: time ? theme.colors.onSurface : theme.colors.outline }}>
                {time || "Select a time"}
              </Text>
              <MaterialCommunityIcons name="chevron-down" size={20} color={theme.colors.outline} />
            </TouchableOpacity>
          </View>
          
          <View style={{ marginBottom: 24 }}>
            <Text variant="bodyMedium" style={{ marginBottom: 8, fontWeight: '500' }}>Notes (Optional)</Text>
            <TextInput
              style={{
                borderRadius: 8,
                backgroundColor: theme.colors.surfaceVariant,
                padding: 12,
                paddingLeft: 40,
                height: 100,
                textAlignVertical: 'top',
                position: 'relative'
              }}
              multiline={true}
              numberOfLines={4}
              value={notes}
              onChangeText={setNotes}
              placeholder="Tell us about your space, needs, or any questions"
              placeholderTextColor={theme.colors.outline}
            />
            <MaterialCommunityIcons 
              name="text-box-outline" 
              size={20}
              color={theme.colors.primary}
              style={{ position: 'absolute', left: 12, top: 38 }}
            />
          </View>
          
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Button
              mode="outlined"
              onPress={onClose}
              style={{ flex: 1, marginRight: 8 }}
            >
              Cancel
            </Button>
            
            <Button
              mode="contained"
              onPress={handleSubmit}
              style={{ flex: 1, marginLeft: 8 }}
              icon="calendar-check"
            >
              Book Now
            </Button>
          </View>
        </View>
      </View>
      
      {/* Date Picker */}
      {showDatePicker && (
        <DateTimePicker
          value={new Date()}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={handleDateChange}
          minimumDate={new Date()}
        />
      )}
      
      {/* Time Picker */}
      {showTimePicker && (
        <DateTimePicker
          value={new Date()}
          mode="time"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={handleTimeChange}
          minuteInterval={15}
        />
      )}
    </Modal>
  );
};

// Fix the service selection issue in the ServiceCard component
const ServiceCard = ({ service, onPress }: { service: DesignService, onPress: () => void }) => {
  const { openConsultationModal } = useContext(FurnitureContext);
  const theme = useTheme();
  
  return (
    <Card 
      style={styles.serviceCard} 
      onPress={() => {
        console.log('Service card clicked:', service.title);
        // Pass the full service object to skip the selection modal
        openConsultationModal(service);
      }}
    >
      <Card.Cover source={service.image} style={styles.serviceImage} />
      <Card.Content style={styles.serviceContent}>
        <Text variant="titleMedium" style={styles.serviceTitle}>{service.title}</Text>
        <Text variant="bodySmall" style={styles.serviceDescription} numberOfLines={2}>{service.description}</Text>
        <View style={styles.serviceMeta}>
          <Text variant="bodyMedium" style={{ color: theme.colors.primary, fontWeight: 'bold' }}>{service.price}</Text>
          <View style={styles.serviceDuration}>
            <MaterialCommunityIcons name="clock-outline" size={16} color={theme.colors.outline} />
            <Text variant="bodySmall" style={styles.durationText}>{service.duration}</Text>
          </View>
        </View>
      </Card.Content>
    </Card>
  );
};

const FurnitureScreen = () => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const [quantity, setQuantity] = useState(1);
  const params = useLocalSearchParams();
  const itemId = params.id ? parseInt(params.id as string) : undefined;
  const { cartItems, addToCart } = useCart();
  const [addingToCart, setAddingToCart] = useState(false);

  // Add state for cart modal
  const [cartModalVisible, setCartModalVisible] = useState(false);
  const [cartModalDetails, setCartModalDetails] = useState({
    productName: '',
    quantity: 0,
    totalPrice: 0,
    category: ''
  });

  // Add state for service selection and consultation booking modals
  const [serviceSelectionModalVisible, setServiceSelectionModalVisible] = useState(false);
  const [consultationModalVisible, setConsultationModalVisible] = useState(false);
  const [selectedService, setSelectedService] = useState<DesignService | null>(null);

  // Add state for error modal
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [errorModalDetails, setErrorModalDetails] = useState({
    title: '',
    message: '',
    actionButtonText: 'OK'
  });

  // Create context value - make sure selectedService is properly passed
  const furnitureContextValue = useMemo(() => ({
    setConsultationModalVisible,
    selectedService,
    setSelectedService,
    openConsultationModal
  }), [consultationModalVisible, selectedService, serviceSelectionModalVisible]);

  // Update the openConsultationModal function to show the service selection modal first
  const openConsultationModal = (service: DesignService | null = null) => {
    console.log('Opening flow with service:', service?.title || 'None selected');
    if (service) {
      // If a specific service is already selected (like from a service card),
      // bypass the selection modal and go straight to booking
      setSelectedService(service);
      setConsultationModalVisible(true);
    } else {
      // Otherwise, show the service selection modal first
      setServiceSelectionModalVisible(true);
    }
  };

  // Handle service selection from the selection modal
  const handleServiceSelect = (service: DesignService) => {
    console.log('Service selected:', service.title);
    setSelectedService(service);
    setServiceSelectionModalVisible(false);
    setConsultationModalVisible(true);
  };

  // Filter items based on search query
  const filteredFeaturedItems = useMemo(() => {
    if (!searchQuery.trim()) return featuredItems;
    
    return featuredItems.filter(item => 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const filteredPopularItems = useMemo(() => {
    if (!searchQuery.trim()) return popularItems;
    
    return popularItems.filter(item => 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  // Check if we have any search results
  const hasSearchResults = useMemo(() => {
    return filteredFeaturedItems.length > 0 || filteredPopularItems.length > 0;
  }, [filteredFeaturedItems, filteredPopularItems]);

  // Function to show error modal
  const showErrorModal = (title: string, message: string, actionButtonText: string = 'OK') => {
    setErrorModalDetails({
      title,
      message,
      actionButtonText
    });
    setErrorModalVisible(true);
  };
  
  // Find the selected item if an ID is provided
  const selectedItem = useMemo(() => {
    if (!itemId) return null;
    
    // Look in featured items
    const foundInFeatured = featuredItems.find(item => item.id === itemId);
    if (foundInFeatured) return foundInFeatured;
    
    // Look in popular items
    const foundInPopular = popularItems.find(item => item.id === itemId);
    if (foundInPopular) return foundInPopular;
    
    return null;
  }, [itemId]);

  const navigateToCategory = (category: Category) => {
    router.push({
      pathname: '/furniture',
      params: { category: category.name }
    });
  };

  const navigateToItem = (item: FurnitureItem) => {
    router.push({
      pathname: '/furniture',
      params: { id: item.id.toString() }
    });
  };

  const navigateToAllItems = () => {
    router.push('/furniture-all-items');
  };

  const navigateToCart = () => {
    router.push('/(tabs)/cart');
  };
  
  const increaseQuantity = () => {
    setQuantity(prev => prev + 1);
  };
  
  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  // Check if item is already in cart
  const isInCart = (furnitureId: number): boolean => {
    return cartItems.some(item => 
      item.productType === 'furniture' && 
      item.id.includes(`furniture_${furnitureId}`)
    );
  };
  
  const addToCartHandler = async () => {
    if (!selectedItem) return;
    
    setAddingToCart(true);
    
    try {
      // Check if this exact furniture item is already in the cart
      const existingItemIndex = cartItems.findIndex(item => 
        item.productType === 'furniture' && 
        item.id.includes(`furniture_${selectedItem.id}`)
      );
      
      if (existingItemIndex !== -1) {
        // If it exists, update the quantity and total price
        const existingItem = cartItems[existingItemIndex];
        const newTotalQuantity = existingItem.totalQuantity + quantity;
        
        const updatedItem = {
          ...existingItem,
          totalQuantity: newTotalQuantity,
          totalPrice: existingItem.totalPrice + (selectedItem.price * quantity),
          colorDetails: [
            {
              color: '#f0f0f0',
              label: selectedItem.category,
              quantity: newTotalQuantity,
              length: 1
            }
          ]
        };
        
        // Use addToCart to update the item
        await addToCart(updatedItem);
      } else {
        // Create a new cart item
        const cartItem = {
          id: `furniture_${selectedItem.id}_${Date.now()}`,
          productName: selectedItem.name,
          pricePerMeter: selectedItem.price,
          totalPrice: selectedItem.price * quantity,
          totalQuantity: quantity,
          totalMeters: quantity,
          currency: 'XAF',
          colorDetails: [
            {
              color: '#f0f0f0',
              label: selectedItem.category,
              quantity: quantity,
              length: 1
            }
          ],
          notes: selectedItem.description,
          addedAt: new Date().toISOString(),
          productType: 'furniture',
          image: selectedItem.image,
          category: selectedItem.category,
          dimensions: selectedItem.description
        };
        
        await addToCart(cartItem);
      }
      
      // Show the modal
      setCartModalDetails({
        productName: selectedItem.name,
        quantity: quantity,
        totalPrice: selectedItem.price * quantity,
        category: selectedItem.category
      });
      setCartModalVisible(true);
      
      // Reset quantity to 1 after adding to cart
      setQuantity(1);
    } catch (error) {
      console.error('Failed to add to cart:', error);
      showErrorModal(
        "Error",
        `Failed to add ${selectedItem.name} to cart. ${error instanceof Error ? error.message : 'Please try again.'}`
      );
    } finally {
      setAddingToCart(false);
    }
  };

  // If an item ID was provided, render the item detail view
  if (selectedItem) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.onSurface} />
          </TouchableOpacity>
          <Text variant="titleLarge" style={styles.headerTitle}>Product Details</Text>
          <TouchableOpacity onPress={navigateToCart} style={styles.cartButton}>
            <Ionicons name="cart-outline" size={24} color={theme.colors.primary} />
            {cartItems.length > 0 && (
              <View style={styles.cartBadge}>
                <Text variant="bodySmall" style={styles.cartBadgeText}>
                  {cartItems.length}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
        
        <ScrollView 
          style={styles.scrollView} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <Image 
            source={{ uri: selectedItem.image }} 
            style={styles.detailImage}
            resizeMode="cover"
          />
          
          <View style={styles.detailContent}>
            <Text variant="headlineSmall" style={styles.detailName}>{selectedItem.name}</Text>
            <Text variant="titleLarge" style={styles.detailPrice}>{Math.round(selectedItem.price).toLocaleString()} XAF</Text>
            <Text variant="bodySmall" style={styles.detailCategory}>{selectedItem.category}</Text>
            
            <Divider style={styles.divider} />
            
            <Text variant="titleMedium" style={styles.sectionTitle}>Description</Text>
            <Text variant="bodyMedium" style={styles.detailDescription}>{selectedItem.description}</Text>
            
            <Divider style={styles.divider} />
            
            <View style={styles.quantityContainer}>
              <Text variant="titleMedium">Quantity</Text>
              <View style={styles.quantityControls}>
                <TouchableOpacity 
                  onPress={decreaseQuantity}
                  style={[styles.quantityButton, { backgroundColor: theme.colors.surfaceVariant }]}
                  disabled={quantity <= 1}
                >
                  <MaterialCommunityIcons name="minus" size={20} color={quantity <= 1 ? theme.colors.outlineVariant : theme.colors.onSurface} />
                </TouchableOpacity>
                <Text variant="bodyLarge" style={styles.quantityText}>{quantity}</Text>
                <TouchableOpacity 
                  onPress={increaseQuantity}
                  style={[styles.quantityButton, { backgroundColor: theme.colors.surfaceVariant }]}
                >
                  <MaterialCommunityIcons name="plus" size={20} color={theme.colors.onSurface} />
                </TouchableOpacity>
              </View>
            </View>
            
            <View style={styles.buttonContainer}>
              {isInCart(selectedItem.id) ? (
                <View style={styles.cartButtonContainer}>
                  <Button 
                    mode="contained" 
                    onPress={addToCartHandler}
                    loading={addingToCart}
                    disabled={addingToCart}
                    style={[styles.addToCartButton, { flex: 1 }]}
                    icon="cart-plus"
                  >
                    Add to Cart - {Math.round(selectedItem.price * quantity).toLocaleString()} XAF
                  </Button>
                  
                  <TouchableOpacity
                    style={styles.viewCartButton}
                    onPress={navigateToCart}
                  >
                    <MaterialCommunityIcons name="cart-outline" size={24} color={theme.colors.primary} />
                  </TouchableOpacity>
                </View>
              ) : (
                <Button 
                  mode="contained" 
                  onPress={addToCartHandler}
                  loading={addingToCart}
                  disabled={addingToCart}
                  style={styles.addToCartButton}
                  icon="cart-outline"
                >
                  Add to Cart - {Math.round(selectedItem.price * quantity).toLocaleString()} XAF
                </Button>
              )}
            </View>
          </View>
        </ScrollView>

        {/* Cart Added Modal */}
        <CartAddedModal
          visible={cartModalVisible}
          onClose={() => setCartModalVisible(false)}
          productName={cartModalDetails.productName}
          quantity={cartModalDetails.quantity}
          totalPrice={cartModalDetails.totalPrice}
          category={cartModalDetails.category}
        />

        {/* Error Modal */}
        <ErrorModal
          visible={errorModalVisible}
          onClose={() => setErrorModalVisible(false)}
          title={errorModalDetails.title}
          message={errorModalDetails.message}
          actionButtonText={errorModalDetails.actionButtonText}
        />
      </SafeAreaView>
    );
  }

  // Otherwise, render the default furniture browsing view
  return (
    <FurnitureContext.Provider value={furnitureContextValue}>
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.onSurface} />
          </TouchableOpacity>
          <Text variant="titleLarge" style={styles.headerTitle}>Luxury Home & Decor</Text>
          <TouchableOpacity onPress={navigateToCart} style={styles.cartButton}>
            <Ionicons name="cart-outline" size={24} color={theme.colors.primary} />
            {cartItems.length > 0 && (
              <View style={styles.cartBadge}>
                <Text variant="bodySmall" style={styles.cartBadgeText}>
                  {cartItems.length}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <CustomSearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search luxury home products..."
          style={styles.searchBar}
        />

        <ScrollView 
          style={styles.scrollView} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Promotions Carousel */}
          <FeaturedCarousel items={furniturePromotions} />

          {!hasSearchResults && searchQuery.trim() ? (
            <View style={styles.noResultsContainer}>
              <MaterialCommunityIcons name="magnify-close" size={64} color={theme.colors.outlineVariant} />
              <Text variant="bodyLarge" style={styles.noResultsText}>No items found</Text>
              <Text variant="bodyMedium" style={styles.noResultsSubtext}>
                Try adjusting your search terms or browse our categories
              </Text>
            </View>
          ) : (
            <>
              {/* Categories */}
              <SectionHeader title="Categories" />
              <View style={styles.categoriesWrapper}>
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.categoriesContainer}
                >
                  {categories.map((category) => (
                    <TouchableOpacity 
                      key={category.id}
                      style={styles.categoryItem}
                      onPress={() => navigateToCategory(category)}
                    >
                      <View style={[styles.categoryIconContainer, { backgroundColor: theme.colors.primaryContainer }]}>
                        <MaterialCommunityIcons name={category.icon} size={24} color={theme.colors.primary} />
                      </View>
                      <Text variant="bodySmall" style={styles.categoryName}>{category.name}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Design Services Section */}
              <Divider style={styles.divider} />
              <SectionHeader 
                title="Design Services" 
                actionText="View All" 
                onAction={() => router.push('/furniture/design-services')} 
              />
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.servicesContainer}
              >
                {designServices.map((service) => (
                  <ServiceCard 
                    key={service.id}
                    service={service}
                    onPress={() => {
                      console.log('Service card clicked:', service.title);
                      openConsultationModal(service);
                    }}
                  />
                ))}
              </ScrollView>

              <Divider style={styles.divider} />

              {/* Featured Items */}
              {filteredFeaturedItems.length > 0 && (
                <View style={styles.sectionContainer}>
                  <SectionHeader 
                    title="Featured Items" 
                    actionText="See All" 
                    onAction={navigateToAllItems} 
                  />
                  <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.itemsContainer}
                  >
                    {filteredFeaturedItems.map((item) => (
                      <Card 
                        key={item.id} 
                        style={styles.itemCard}
                        onPress={() => navigateToItem(item)}
                      >
                        <Card.Cover source={{ uri: item.image }} style={styles.itemImage} />
                        <Card.Content style={styles.itemContent}>
                          <Text variant="bodyMedium" numberOfLines={1} style={styles.itemName}>{item.name}</Text>
                          <Text variant="bodyLarge" style={styles.itemPrice}>{Math.round(item.price).toLocaleString()} XAF</Text>
                          <Text variant="bodySmall" style={styles.itemCategory}>{item.category}</Text>
                        </Card.Content>
                      </Card>
                    ))}
                  </ScrollView>
                </View>
              )}

              {filteredFeaturedItems.length > 0 && filteredPopularItems.length > 0 && (
                <Divider style={styles.divider} />
              )}

              {/* Popular Items */}
              {filteredPopularItems.length > 0 && (
                <View style={styles.sectionContainer}>
                  <SectionHeader 
                    title="Popular Items" 
                    actionText="See All" 
                    onAction={navigateToAllItems} 
                  />
                  <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.itemsContainer}
                  >
                    {filteredPopularItems.map((item) => (
                      <Card 
                        key={item.id} 
                        style={styles.itemCard}
                        onPress={() => navigateToItem(item)}
                      >
                        <Card.Cover source={{ uri: item.image }} style={styles.itemImage} />
                        <Card.Content style={styles.itemContent}>
                          <Text variant="bodyMedium" numberOfLines={1} style={styles.itemName}>{item.name}</Text>
                          <Text variant="bodyLarge" style={styles.itemPrice}>{Math.round(item.price).toLocaleString()} XAF</Text>
                          <Text variant="bodySmall" style={styles.itemCategory}>{item.category}</Text>
                        </Card.Content>
                      </Card>
                    ))}
                  </ScrollView>
                </View>
              )}
            </>
          )}
        </ScrollView>

        {/* Call to action button for consultation */}
        <TouchableOpacity 
          style={[styles.consultationFAB, { backgroundColor: theme.colors.primary }]}
          onPress={() => {
            console.log('FAB button clicked');
            openConsultationModal(null); // Pass null to show selection modal first
          }}
        >
          <MaterialCommunityIcons name="account-tie" size={24} color="white" />
          <Text style={styles.consultationFABText}>Book a Consultation</Text>
        </TouchableOpacity>

        {/* Cart Added Modal */}
        <CartAddedModal
          visible={cartModalVisible}
          onClose={() => setCartModalVisible(false)}
          productName={cartModalDetails.productName}
          quantity={cartModalDetails.quantity}
          totalPrice={cartModalDetails.totalPrice}
          category={cartModalDetails.category}
        />

        {/* Error Modal */}
        <ErrorModal
          visible={errorModalVisible}
          onClose={() => setErrorModalVisible(false)}
          title={errorModalDetails.title}
          message={errorModalDetails.message}
          actionButtonText={errorModalDetails.actionButtonText}
        />

        {/* Service Selection Modal */}
        <ServiceSelectionModal
          visible={serviceSelectionModalVisible}
          onClose={() => setServiceSelectionModalVisible(false)}
          onServiceSelect={handleServiceSelect}
          services={designServices}
        />

        {/* Consultation Booking Modal */}
        <ConsultationBookingModal
          visible={consultationModalVisible}
          onClose={() => {
            console.log('Closing consultation modal');
            setConsultationModalVisible(false);
          }}
          service={selectedService}
        />
      </SafeAreaView>
    </FurnitureContext.Provider>
  );
};

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
  backButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
  },
  cartButton: {
    padding: 8,
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingHorizontal: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    height: 48,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    height: 48,
  },
  searchBar: {
    marginBottom: 16,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  sectionContainer: {
    marginVertical: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
    paddingTop: 8,
  },
  sectionTitle: {
    fontWeight: '700',
  },
  categoriesWrapper: {
    marginBottom: 8,
  },
  categoriesContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  categoryItem: {
    alignItems: 'center',
    marginRight: 20,
    width: 70,
  },
  categoryIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  categoryName: {
    textAlign: 'center',
  },
  divider: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
  itemsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  itemCard: {
    width: 160,
    marginRight: 16,
    borderRadius: 12,
  },
  itemImage: {
    height: 120,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  itemContent: {
    padding: 10,
  },
  itemName: {
    marginBottom: 4,
  },
  itemPrice: {
    fontWeight: 'bold',
    marginBottom: 2,
  },
  itemCategory: {
    opacity: 0.7,
  },
  
  // Additional styles for item detail view
  detailImage: {
    width: '100%',
    height: 300,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  detailContent: {
    padding: 16,
  },
  detailName: {
    marginBottom: 8,
    fontWeight: 'bold',
  },
  detailPrice: {
    marginBottom: 4,
    fontWeight: 'bold',
    color: '#4A6FFF',
  },
  detailCategory: {
    marginBottom: 16,
    opacity: 0.7,
  },
  detailDescription: {
    lineHeight: 22,
    marginBottom: 16,
  },
  quantityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    fontWeight: 'bold',
  },
  buttonContainer: {
    marginTop: 24,
    marginBottom: 16,
  },
  addToCartButton: {
    width: '100%',
    borderRadius: 8,
    padding: 4,
  },
  cartBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
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
  noResultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    marginTop: 80,
    minHeight: 300,
  },
  noResultsText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: 'bold',
  },
  noResultsSubtext: {
    marginTop: 8,
    textAlign: 'center',
    opacity: 0.7,
    paddingHorizontal: 24,
  },
  // Carousel styles
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
  // Design services styles
  servicesContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  consultationFAB: {
    position: 'absolute',
    right: 16,
    bottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 30,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  consultationFABText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  serviceCard: {
    width: 240,
    marginRight: 16,
    borderRadius: 12,
  },
  serviceImage: {
    height: 120,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  serviceContent: {
    padding: 12,
  },
  serviceTitle: {
    fontWeight: '600',
    marginBottom: 4,
  },
  serviceDescription: {
    marginBottom: 8,
    opacity: 0.7,
  },
  serviceMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  serviceDuration: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  durationText: {
    marginLeft: 4,
    opacity: 0.7,
  },
});

export default FurnitureScreen; 