import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, View, ScrollView, Image, TouchableOpacity, Dimensions, FlatList, TextInput, Animated, Modal } from 'react-native';
import { useTheme } from 'react-native-paper';
import { Button } from '../../components/Button';
import { Text } from '../../components/CustomText';
import { Card } from '../../components/CustomCard';
import { Chip } from '../../components/CustomChip';
import { Divider } from '../../components/CustomDivider';
import { IconButton } from '../../components/CustomIconButton';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';

const { width } = Dimensions.get('window');

interface CarOption {
  id: string;
  name: string;
  category: string;
  price: number;
  image: string;
  seats: number;
  transmission: 'Automatic' | 'Manual';
  fuelType: string;
  available: boolean;
  features: string[];
}

interface Promotion {
  id: string;
  title: string;
  description: string;
  image: string;
  action: string;
}

const carOptions: CarOption[] = [
  {
    id: 'car1',
    name: 'Toyota Corolla',
    category: 'Sedan',
    price: 45000,
    image: 'https://images.unsplash.com/photo-1590362891991-f776e747a588?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80',
    seats: 5,
    transmission: 'Automatic',
    fuelType: 'Gasoline',
    available: true,
    features: ['Bluetooth', 'Air Conditioning', 'USB Charging']
  },
  {
    id: 'car2',
    name: 'Honda Civic',
    category: 'Sedan',
    price: 50000,
    image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80',
    seats: 5,
    transmission: 'Automatic',
    fuelType: 'Gasoline',
    available: true,
    features: ['Bluetooth', 'Air Conditioning', 'Backup Camera', 'USB Charging']
  },
  {
    id: 'car3',
    name: 'Mercedes GLC',
    category: 'SUV',
    price: 65000,
    image: 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80',
    seats: 5,
    transmission: 'Automatic',
    fuelType: 'Gasoline',
    available: true,
    features: ['Bluetooth', 'Air Conditioning', 'Backup Camera', 'Navigation', 'Sunroof']
  },
  {
    id: 'car4',
    name: 'Toyota Hilux',
    category: 'Pickup',
    price: 75000,
    image: 'https://images.unsplash.com/photo-1559416523-140ddc3d238c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80',
    seats: 5,
    transmission: 'Manual',
    fuelType: 'Diesel',
    available: false,
    features: ['Bluetooth', 'Air Conditioning', '4x4', 'Towing Package']
  },
  {
    id: 'car5',
    name: 'Mercedes C-Class',
    category: 'Luxury',
    price: 95000,
    image: 'https://images.unsplash.com/photo-1553440569-bcc63803a83d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80',
    seats: 5,
    transmission: 'Automatic',
    fuelType: 'Gasoline',
    available: true,
    features: ['Bluetooth', 'Air Conditioning', 'Leather Seats', 'Navigation', 'Premium Sound']
  },
  {
    id: 'car6',
    name: 'Toyota Land Cruiser',
    category: 'SUV',
    price: 85000,
    image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80',
    seats: 7,
    transmission: 'Automatic',
    fuelType: 'Diesel',
    available: true,
    features: ['Bluetooth', 'Air Conditioning', '4x4', 'Navigation', 'Premium Sound', 'Third Row Seats']
  }
];

// Helper function to translate categories
const translateCategory = (category: string, t: any): string => {
  switch (category.toLowerCase()) {
    case 'all': return t('carRental.categories.all');
    case 'sedan': return t('carRental.categories.sedan');
    case 'suv': return t('carRental.categories.suv');
    case 'pickup': return t('carRental.categories.pickup');
    case 'luxury': return t('carRental.categories.luxury');
    default: return category;
  }
};

const categories = ['All', 'Sedan', 'SUV', 'Pickup', 'Luxury'];

// Featured promotions
const promotions: Promotion[] = [
  {
    id: '1',
    title: 'Weekend Special!',
    description: 'Get 20% off on all weekend rentals',
    image: 'https://images.unsplash.com/photo-1546614042-7df3c24c9e5d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80',
    action: 'Book Now',
  },
  {
    id: '2',
    title: 'Premium SUVs',
    description: 'Luxury SUVs now available at special rates',
    image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80',
    action: 'View Options',
  },
  {
    id: '3',
    title: 'Extended Rentals',
    description: 'Discounted rates for rentals over 7 days',
    image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80',
    action: 'Learn More',
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
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const { t } = useTranslation();

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

  // Helper function to get translated promo content
  const getTranslatedPromoContent = (item: Promotion) => {
    if (item.id === '1') {
      return {
        title: t('carRental.featured.weekendSpecial.title'),
        description: t('carRental.featured.weekendSpecial.description'),
        action: t('carRental.featured.weekendSpecial.action')
      };
    } else if (item.id === '2') {
      return {
        title: t('carRental.featured.premiumSUVs.title'),
        description: t('carRental.featured.premiumSUVs.description'),
        action: t('carRental.featured.premiumSUVs.action')
      };
    } else {
      return {
        title: t('carRental.featured.extendedRentals.title'),
        description: t('carRental.featured.extendedRentals.description'),
        action: t('carRental.featured.extendedRentals.action')
      };
    }
  };

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
        renderItem={({ item }) => {
          const translatedContent = getTranslatedPromoContent(item);
          return (
            <View style={[styles.carouselItem, { width }]}>
              <Image source={{ uri: item.image }} style={styles.carouselImage} />
              <View style={styles.carouselContent}>
                <Text variant="headlineSmall" style={styles.carouselTitle}>{translatedContent.title}</Text>
                <Text variant="bodyMedium" style={styles.carouselDescription}>{translatedContent.description}</Text>
                <Button 
                  mode="contained" 
                  style={styles.carouselButton}
                  onPress={() => {
                    console.log(`Action pressed: ${translatedContent.action}`);
                  }}
                >
                  {translatedContent.action}
                </Button>
              </View>
            </View>
          );
        }}
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

// Custom search bar component
const CustomSearchBar = ({ 
  value, 
  onChangeText, 
  placeholder 
}: { 
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}) => {
  const theme = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const { t } = useTranslation();
  
  return (
    <View 
      style={[
        styles.searchBarContainer, 
        isFocused && { borderColor: theme.colors.primary, borderWidth: 1 }
      ]}
    >
      <MaterialCommunityIcons 
        name="magnify" 
        size={20} 
        color={isFocused ? theme.colors.primary : theme.colors.outline} 
        style={styles.searchIcon} 
      />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder || t('carRental.search')}
        style={styles.searchInput}
        placeholderTextColor={theme.colors.outline}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        returnKeyType="search"
      />
      {value ? (
        <TouchableOpacity onPress={() => onChangeText('')}>
          <MaterialCommunityIcons name="close-circle" size={20} color={theme.colors.outline} />
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

// Component for popular cars row
function PopularCarsRow({ cars, onSelect }: { cars: CarOption[]; onSelect: (car: CarOption) => void }) {
  const { t } = useTranslation();
  
  return (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false} 
      style={styles.popularCarsContainer}
      contentContainerStyle={styles.popularCarsContent}
    >
      {cars.map((car) => (
        <Card key={car.id} style={styles.popularCarCard} onPress={() => onSelect(car)}>
          <Card.Cover source={{ uri: car.image }} style={styles.popularCarImage} />
          <Card.Content style={styles.popularCarContent}>
            <Text variant="titleSmall" numberOfLines={1} style={styles.popularCarName}>{car.name}</Text>
            <Text variant="bodySmall" style={styles.popularCarCategory}>
              {translateCategory(car.category, t)}
            </Text>
            <View style={styles.popularCarFooter}>
              <Text variant="titleMedium" style={styles.popularCarPrice}>
                {car.price.toLocaleString()} XAF/{t('carRental.car.day')}
              </Text>
              <View style={styles.popularCarStatus}>
                <View 
                  style={[
                    styles.availabilityIndicator, 
                    { backgroundColor: car.available ? '#4CAF50' : '#F44336' }
                  ]} 
                />
                <Text variant="bodySmall">
                  {car.available ? t('carRental.car.available') : t('carRental.car.unavailable')}
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>
      ))}
    </ScrollView>
  );
}

// Detail modal for car viewing
function CarDetailModal({ 
  visible, 
  onClose, 
  car,
  onBookNow
}: { 
  visible: boolean; 
  onClose: () => void;
  car: CarOption | null;
  onBookNow: (car: CarOption) => void;
}) {
  const theme = useTheme();
  const { t } = useTranslation();
  
  if (!car) return null;
  
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <IconButton 
              icon="close" 
              size={24}
              onPress={onClose} 
            />
            <Text variant="titleLarge" style={styles.modalTitle}>{car.name}</Text>
            <View style={{ width: 40 }} />
          </View>
          
          <ScrollView style={styles.modalContent}>
            <Image source={{ uri: car.image }} style={styles.modalImage} />
            
            <View style={styles.modalDetailsSection}>
              <View style={styles.modalHeaderDetails}>
                <Text variant="headlineSmall" style={styles.modalPrice}>
                  {car.price.toLocaleString()} XAF/{t('carRental.car.day')}
                </Text>
                <Chip style={styles.categoryChip}>{translateCategory(car.category, t)}</Chip>
              </View>
              
              <View style={styles.availabilityCard}>
                <View style={styles.availabilityRow}>
                  <MaterialCommunityIcons 
                    name={car.available ? "check-circle" : "close-circle"} 
                    size={24} 
                    color={car.available ? theme.colors.primary : theme.colors.error} 
                  />
                  <Text variant="bodyLarge" style={{ marginLeft: 8, fontWeight: '500' }}>
                    {car.available ? t('carRental.car.available') : t('carRental.car.unavailable')}
                  </Text>
                </View>
                <Text variant="bodySmall" style={{ marginTop: 4, opacity: 0.7 }}>
                  {car.available 
                    ? 'This vehicle is ready for immediate booking'
                    : 'This vehicle is currently unavailable for booking'}
                </Text>
              </View>
              
              <Divider style={styles.divider} />
              
              <Text variant="titleMedium" style={styles.sectionTitle}>{t('carRental.car.specifications')}</Text>
              <View style={styles.specificationsContainer}>
                <View style={styles.specItem}>
                  <MaterialCommunityIcons name="car-seat" size={24} color={theme.colors.primary} />
                  <Text variant="titleSmall" style={styles.specValue}>{car.seats}</Text>
                  <Text variant="bodySmall" style={styles.specLabel}>{t('carRental.car.seats')}</Text>
                </View>
                <View style={styles.specItem}>
                  <MaterialCommunityIcons 
                    name={car.transmission === 'Automatic' ? 'car-shift-pattern' : 'car-clutch'} 
                    size={24} 
                    color={theme.colors.primary} 
                  />
                  <Text variant="titleSmall" style={styles.specValue}>{car.transmission}</Text>
                  <Text variant="bodySmall" style={styles.specLabel}>{t('carRental.car.transmission')}</Text>
                </View>
                <View style={styles.specItem}>
                  <MaterialCommunityIcons name="gas-station" size={24} color={theme.colors.primary} />
                  <Text variant="titleSmall" style={styles.specValue}>{car.fuelType}</Text>
                  <Text variant="bodySmall" style={styles.specLabel}>{t('carRental.car.fuelType')}</Text>
                </View>
              </View>
              
              <Divider style={styles.divider} />
              
              <Text variant="titleMedium" style={styles.sectionTitle}>{t('carRental.car.features')}</Text>
              <View style={styles.featuresContainer}>
                {car.features.map((feature, index) => (
                  <View key={index} style={styles.featureItemDetailed}>
                    <MaterialCommunityIcons name="check-circle" size={18} color={theme.colors.primary} />
                    <Text variant="bodyMedium" style={styles.featureTextDetailed}>{feature}</Text>
                  </View>
                ))}
              </View>
            </View>
          </ScrollView>
          
          <View style={styles.modalActions}>
            <Button
              mode="contained"
              onPress={() => onBookNow(car)}
              disabled={!car.available}
              style={[styles.modalButton, { opacity: car.available ? 1 : 0.7 }]}
            >
              {car.available ? t('carRental.bookNow') : t('carRental.car.notAvailable')}
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// Promotional Card Component
function PromoCard() {
  const theme = useTheme();
  const { t } = useTranslation();
  
  return (
    <View style={styles.promoCardContainer}>
      <LinearGradient
        colors={['#4A6FFF', '#4A00E0']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.promoGradient}
      >
        <View style={styles.promoContent}>
          <View style={styles.promoTextContent}>
            <Text variant="titleLarge" style={styles.promoTitle}>{t('carRental.promo.title')}</Text>
            <Text variant="bodyMedium" style={styles.promoDescription}>
              {t('carRental.promo.description')}
            </Text>
            <Text variant="labelLarge" style={styles.promoCode}>{t('carRental.promo.code')}</Text>
          </View>
          
          <View style={styles.promoImageContainer}>
            <MaterialCommunityIcons name="tag-multiple" size={80} color="rgba(255,255,255,0.3)" style={styles.promoIcon} />
          </View>
        </View>
        
        <Button 
          mode="contained" 
          onPress={() => console.log('Promo applied')}
          style={styles.promoButton}
          buttonColor="#FFFFFF"
          textColor="#4A6FFF"
        >
          {t('carRental.promo.action')}
        </Button>
      </LinearGradient>
    </View>
  );
}

export default function CarRentalScreen() {
  const theme = useTheme();
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedCar, setSelectedCar] = useState<CarOption | null>(null);
  const { t } = useTranslation();

  // Filter cars based on search query and selected category
  const filteredCars = carOptions.filter((car) => {
    const matchesSearch = 
      car.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      car.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || car.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Get popular cars (could be based on different criteria like rating or bookings)
  const popularCars = carOptions.filter(car => car.available).slice(0, 4);

  // Handle car selection
  const handleSelectCar = (car: CarOption) => {
    setSelectedCar(car);
    setDetailModalVisible(true);
  };

  // Navigate to booking
  const navigateToBooking = (car: CarOption) => {
    setDetailModalVisible(false);
    router.push({
      pathname: "/(tabs)/car-booking",
      params: {
        carId: car.id,
        carName: car.name,
        carImage: car.image,
        carPrice: car.price.toString(),
        carCategory: car.category
      }
    } as any);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar style="dark" />
      
      <View style={styles.header}>
        <IconButton
          icon="arrow-left"
          size={24}
          onPress={() => router.back()}
        />
        <Text variant="titleLarge" style={styles.headerTitle}>{t('carRental.title')}</Text>
        <IconButton
          icon="heart-outline"
          size={24}
          onPress={() => console.log('Favorites')}
        />
      </View>
      
      <View style={styles.searchContainer}>
        <CustomSearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder={t('carRental.search')}
        />
      </View>
      
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Carousel */}
        <FeaturedCarousel items={promotions} />
        
        {/* Categories */}
        <SectionHeader title={t('carRental.browseByCategory')} />
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContainer}
        >
          {categories.map(category => (
            <Chip
              key={category}
              selected={selectedCategory === category}
              onPress={() => setSelectedCategory(category)}
              style={styles.categoryChip}
              selectedColor={theme.colors.primary}
            >
              {translateCategory(category, t)}
            </Chip>
          ))}
        </ScrollView>
        
        {/* Popular Cars */}
        <SectionHeader 
          title={t('carRental.popularCars')} 
          actionText={t('carRental.seeAll')} 
          onAction={() => console.log('See all popular cars')} 
        />
        <PopularCarsRow cars={popularCars} onSelect={handleSelectCar} />
        
        {/* Promotional Card */}
        <PromoCard />
        
        {/* Available Cars */}
        <SectionHeader title={`${translateCategory(selectedCategory, t)} ${t('carRental.allCars')}`} />
        <View style={styles.carsGrid}>
          {filteredCars.length === 0 ? (
            <View style={styles.noResultsContainer}>
              <MaterialCommunityIcons name="car-off" size={64} color={theme.colors.outline} />
              <Text variant="titleMedium" style={styles.noResultsText}>{t('carRental.noResults.title')}</Text>
              <Text variant="bodyMedium" style={styles.noResultsSubtext}>
                {t('carRental.noResults.subtitle')}
              </Text>
            </View>
          ) : (
            filteredCars.map((car) => (
              <Card 
                key={car.id} 
                style={styles.carCard}
                onPress={() => handleSelectCar(car)}
              >
                <Card.Cover source={{ uri: car.image }} style={styles.carImage} />
                <Card.Content style={styles.carContent}>
                  <View style={styles.carHeader}>
                    <Text variant="titleMedium" style={styles.carName}>{car.name}</Text>
                    <Chip size={20} style={styles.carCategoryChip}>{translateCategory(car.category, t)}</Chip>
                  </View>
                  <Text variant="titleMedium" style={[styles.carPrice, { color: theme.colors.primary }]}>
                    {car.price.toLocaleString()} XAF/{t('carRental.car.day')}
                  </Text>
                  
                  <View style={styles.carFeatures}>
                    <View style={styles.featureItem}>
                      <MaterialCommunityIcons name="car-seat" size={16} color={theme.colors.primary} />
                      <Text variant="bodySmall" style={styles.featureText}>{car.seats} {t('carRental.car.seats')}</Text>
                    </View>
                    <View style={styles.featureItem}>
                      <MaterialCommunityIcons 
                        name={car.transmission === 'Automatic' ? 'car-shift-pattern' : 'car-clutch'} 
                        size={16} 
                        color={theme.colors.primary} 
                      />
                      <Text variant="bodySmall" style={styles.featureText}>{car.transmission}</Text>
                    </View>
                  </View>
                  
                  <View style={styles.availabilityContainer}>
                    <View 
                      style={[
                        styles.availabilityIndicator, 
                        { backgroundColor: car.available ? theme.colors.primary : theme.colors.error }
                      ]} 
                    />
                    <Text variant="bodySmall" style={styles.availabilityText}>
                      {car.available ? t('carRental.car.available') : t('carRental.car.unavailable')}
                    </Text>
                  </View>
                </Card.Content>
                <Card.Actions>
                  <Button 
                    mode="contained" 
                    onPress={() => handleSelectCar(car)}
                    disabled={!car.available}
                    fullWidth
                  >
                    {car.available ? t('carRental.car.viewDetails') : t('carRental.car.notAvailable')}
                  </Button>
                </Card.Actions>
              </Card>
            ))
          )}
        </View>
        
        {/* Bottom padding */}
        <View style={{ height: 20 }} />
      </ScrollView>
      
      {/* Car Detail Modal */}
      <CarDetailModal
        visible={detailModalVisible}
        onClose={() => setDetailModalVisible(false)}
        car={selectedCar}
        onBookNow={navigateToBooking}
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
    paddingVertical: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    height: 48,
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
  categoriesContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  categoryChip: {
    marginRight: 8,
  },
  carsGrid: {
    padding: 16,
    paddingTop: 8,
  },
  carCard: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  carImage: {
    height: 180,
  },
  carContent: {
    padding: 12,
  },
  carHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  carName: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  carCategoryChip: {
    height: 24,
    marginLeft: 8,
  },
  carPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  carFeatures: {
    flexDirection: 'row',
    marginTop: 4,
    marginBottom: 8,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  featureText: {
    fontSize: 12,
    marginLeft: 4,
  },
  availabilityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  availabilityIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  availabilityText: {
    fontSize: 12,
    opacity: 0.7,
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
  popularCarsContainer: {
    marginBottom: 16,
  },
  popularCarsContent: {
    paddingHorizontal: 16,
  },
  popularCarCard: {
    width: 220,
    marginRight: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  popularCarImage: {
    height: 120,
  },
  popularCarContent: {
    padding: 12,
  },
  popularCarName: {
    fontWeight: '600',
    marginBottom: 4,
  },
  popularCarCategory: {
    opacity: 0.7,
    marginBottom: 8,
  },
  popularCarFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  popularCarPrice: {
    fontWeight: '600',
    fontSize: 16,
    color: '#4A6FFF',
  },
  popularCarStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  noResultsContainer: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noResultsText: {
    marginTop: 16,
    fontWeight: 'bold',
  },
  noResultsSubtext: {
    textAlign: 'center',
    opacity: 0.7,
    marginTop: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
  },
  modalContent: {
    flex: 1,
  },
  modalImage: {
    width: '100%',
    height: 200,
  },
  modalDetailsSection: {
    padding: 16,
  },
  modalHeaderDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalPrice: {
    fontWeight: 'bold',
    color: '#4A6FFF',
  },
  availabilityCard: {
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  availabilityRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  divider: {
    marginVertical: 16,
  },
  specificationsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  specItem: {
    alignItems: 'center',
    flex: 1,
  },
  specValue: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 8,
  },
  specLabel: {
    fontSize: 12,
    opacity: 0.7,
  },
  featuresContainer: {
    marginBottom: 16,
  },
  featureItemDetailed: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureTextDetailed: {
    fontSize: 14,
    marginLeft: 8,
  },
  modalActions: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  modalButton: {
    borderRadius: 12,
  },
  promoCardContainer: {
    marginHorizontal: 16,
    marginVertical: 16,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  promoGradient: {
    borderRadius: 16,
    padding: 16,
  },
  promoContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  promoTextContent: {
    flex: 2,
  },
  promoTitle: {
    color: 'white',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  promoDescription: {
    color: 'white',
    opacity: 0.9,
    marginBottom: 8,
  },
  promoCode: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  promoImageContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  promoIcon: {
    position: 'absolute',
    right: -20,
    top: -20,
  },
  promoButton: {
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
}); 