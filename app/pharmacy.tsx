import React, { useState, useEffect, useRef } from 'react';
import { View, ScrollView, StyleSheet, Image, Alert, Platform, TouchableOpacity, ActivityIndicator, Modal, Animated, Dimensions } from 'react-native';
import { useTheme } from 'react-native-paper';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { Text as CustomText } from '../components/CustomText';
import { Button } from '../components/Button';
import { Card } from '../components/CustomCard';
import { Divider } from '../components/CustomDivider';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

interface Category {
  id: number;
  name: string;
  icon: string;
}

interface Medication {
  id: number;
  name: string;
  price: number;
  description: string;
  image: string;
  category: string;
}

interface LabTest {
  id: number;
  name: string;
  price: number;
  turnaround: string;
}

interface Promotion {
  id: string;
  title: string;
  description: string;
  image: { uri: string };
  action: string;
}

// Promotional data for carousel
const pharmacyPromotions: Promotion[] = [
  {
    id: '1',
    title: 'Health Essentials',
    description: 'Get 25% off on all vitamins and supplements',
    image: { uri: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=600' },
    action: 'Shop Now',
  },
  {
    id: '2',
    title: 'Diabetes Care',
    description: 'Free glucose monitoring with any purchase over XAF 30,000',
    image: { uri: 'https://images.unsplash.com/photo-1631815589068-dc4c4c204a30?q=80&w=600' },
    action: 'Learn More',
  },
  {
    id: '3',
    title: 'Baby & Mother',
    description: 'Special discounts on baby care products this week',
    image: { uri: 'https://images.unsplash.com/photo-1515942400420-2b98fed1f515?q=80&w=600' },
    action: 'View Offers',
  },
];

// Component for section headers
function SectionHeader({ title, actionText, onAction }: { title: string; actionText?: string; onAction?: () => void }) {
  return (
    <View style={styles.sectionHeader}>
      <CustomText variant="titleLarge" style={styles.sectionTitle}>{title}</CustomText>
      {actionText && (
        <TouchableOpacity onPress={onAction}>
          <CustomText variant="bodyMedium" style={styles.sectionAction}>{actionText}</CustomText>
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
              <CustomText variant="headlineSmall" style={styles.carouselTitle}>{item.title}</CustomText>
              <CustomText variant="bodyMedium" style={styles.carouselDescription}>{item.description}</CustomText>
              <Button 
                mode="contained" 
                style={styles.carouselButton}
                onPress={() => {
                  console.log(`Action pressed: ${item.action}`);
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

const PrescriptionSuccessModal = ({ 
  visible, 
  onClose,
  onViewOrders,
  prescriptionImage
}: {
  visible: boolean;
  onClose: () => void;
  onViewOrders: () => void;
  prescriptionImage?: string;
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
      <View style={prescriptionModalStyles.overlay}>
        <Animated.View 
          style={[
            prescriptionModalStyles.modalContainer, 
            { 
              backgroundColor: theme.colors.background,
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
              paddingBottom: insets.bottom > 0 ? insets.bottom : 20
            }
          ]}
        >
          <View style={prescriptionModalStyles.modalHeader}>
            <TouchableOpacity 
              style={prescriptionModalStyles.closeButton}
              onPress={onClose}
            >
              <MaterialCommunityIcons name="close" size={24} color={theme.colors.onSurface} />
            </TouchableOpacity>
            <View style={prescriptionModalStyles.modalHeaderCenter}>
              <View style={prescriptionModalStyles.modalIndicator} />
            </View>
            <View style={prescriptionModalStyles.headerSpacer} />
          </View>
          
          <View style={prescriptionModalStyles.modalContent}>
            <View style={prescriptionModalStyles.successIconContainer}>
              <MaterialCommunityIcons 
                name="check-circle" 
                size={60} 
                color={theme.colors.primary} 
              />
            </View>
            
            <CustomText variant="headlineSmall" style={prescriptionModalStyles.modalTitle}>
              Prescription Received
            </CustomText>
            
            <View style={prescriptionModalStyles.prescriptionImageContainer}>
              {prescriptionImage && (
                <Image 
                  source={{ uri: prescriptionImage }} 
                  style={prescriptionModalStyles.prescriptionImage}
                  resizeMode="cover"
                />
              )}
            </View>
            
            <CustomText variant="bodyMedium" style={prescriptionModalStyles.modalDescription}>
              Your prescription has been uploaded successfully. Our pharmacists will review it and contact you shortly to confirm your order.
            </CustomText>
            
            <View style={prescriptionModalStyles.timelineContainer}>
              <View style={prescriptionModalStyles.timelineItem}>
                <View style={[prescriptionModalStyles.timelinePoint, { backgroundColor: theme.colors.primary }]} />
                <View style={prescriptionModalStyles.timelineContent}>
                  <CustomText variant="bodyMedium" style={prescriptionModalStyles.timelineTitle}>Prescription Received</CustomText>
                  <CustomText variant="bodySmall" style={prescriptionModalStyles.timelineDescription}>Just now</CustomText>
                </View>
              </View>
              
              <View style={[prescriptionModalStyles.timelineLine, { backgroundColor: theme.colors.outlineVariant }]} />
              
              <View style={prescriptionModalStyles.timelineItem}>
                <View style={[prescriptionModalStyles.timelinePoint, { backgroundColor: theme.colors.outlineVariant }]} />
                <View style={prescriptionModalStyles.timelineContent}>
                  <CustomText variant="bodyMedium" style={prescriptionModalStyles.timelineTitle}>Pharmacist Review</CustomText>
                  <CustomText variant="bodySmall" style={prescriptionModalStyles.timelineDescription}>Within 30 minutes</CustomText>
                </View>
              </View>
              
              <View style={[prescriptionModalStyles.timelineLine, { backgroundColor: theme.colors.outlineVariant }]} />
              
              <View style={prescriptionModalStyles.timelineItem}>
                <View style={[prescriptionModalStyles.timelinePoint, { backgroundColor: theme.colors.outlineVariant }]} />
                <View style={prescriptionModalStyles.timelineContent}>
                  <CustomText variant="bodyMedium" style={prescriptionModalStyles.timelineTitle}>Delivery</CustomText>
                  <CustomText variant="bodySmall" style={prescriptionModalStyles.timelineDescription}>Same day if ordered before 4 PM</CustomText>
                </View>
              </View>
            </View>
          </View>
          
          <View style={prescriptionModalStyles.modalActions}>
            <Button
              mode="outlined"
              onPress={onClose}
              style={prescriptionModalStyles.modalButton}
            >
              Continue Shopping
            </Button>
            
            <Button
              mode="contained"
              onPress={onViewOrders}
              style={prescriptionModalStyles.modalButton}
              icon="clipboard-text-outline"
            >
              View Orders
            </Button>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const prescriptionModalStyles = StyleSheet.create({
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
    width: 40,
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
    marginBottom: 16,
    textAlign: 'center',
  },
  modalDescription: {
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  prescriptionImageContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  prescriptionImage: {
    width: '100%',
    height: 150,
    borderRadius: 8,
  },
  timelineContainer: {
    marginBottom: 24,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  timelinePoint: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 5,
    marginRight: 12,
  },
  timelineLine: {
    width: 2,
    height: 30,
    marginLeft: 5,
    marginVertical: 2,
  },
  timelineContent: {
    flex: 1,
    marginBottom: 12,
  },
  timelineTitle: {
    fontWeight: '500',
    marginBottom: 2,
  },
  timelineDescription: {
    color: '#666666',
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

// Promotional Card Component
const PharmacyPromoCard = () => {
  const theme = useTheme();
  
  return (
    <View style={promoCardStyles.container}>
      <LinearGradient
        colors={['#5E35B1', '#3F51B5']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={promoCardStyles.gradient}
      >
        <View style={promoCardStyles.contentContainer}>
          <View style={promoCardStyles.textContainer}>
            <CustomText variant="titleLarge" style={promoCardStyles.title}>
              Health Check Package
            </CustomText>
            <CustomText variant="bodyLarge" style={promoCardStyles.description}>
              Complete health screening at 30% OFF
            </CustomText>
            <CustomText variant="bodyMedium" style={promoCardStyles.subtitle}>
              Includes blood work, vitals & consultation
            </CustomText>
            
            <Button 
              mode="contained" 
              onPress={() => console.log('Health package promo clicked')}
              style={promoCardStyles.button}
            >
              Book Now
            </Button>
          </View>
          
          <View style={promoCardStyles.iconContainer}>
            <MaterialCommunityIcons 
              name="medical-bag" 
              size={80} 
              color="rgba(255,255,255,0.2)" 
              style={promoCardStyles.backgroundIcon}
            />
            <MaterialCommunityIcons 
              name="heart-pulse" 
              size={40} 
              color="rgba(255,255,255,0.9)" 
              style={promoCardStyles.foregroundIcon}
            />
          </View>
        </View>
      </LinearGradient>
    </View>
  );
};

const promoCardStyles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginBottom: 24,
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: 'hidden',
  },
  gradient: {
    borderRadius: 16,
    padding: 20,
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textContainer: {
    flex: 2,
  },
  title: {
    color: 'white',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  description: {
    color: 'white',
    fontWeight: '600',
    marginBottom: 4,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 16,
  },
  button: {
    alignSelf: 'flex-start',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 4,
    backgroundColor: 'white',
  },
  iconContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  backgroundIcon: {
    position: 'absolute',
    right: -20,
    top: -20,
  },
  foregroundIcon: {
    position: 'absolute',
    right: 10,
    bottom: 0,
  },
});

const PharmacyScreen = () => {
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [prescriptionModalVisible, setPrescriptionModalVisible] = useState(false);
  const [prescriptionImage, setPrescriptionImage] = useState<string | null>(null);
  const [featuredMedications, setFeaturedMedications] = useState<Medication[]>([
    {
      id: 1,
      name: 'Paracetamol',
      price: 5500,
      description: 'Pain reliever and fever reducer',
      image: 'https://placehold.co/200x200/png',
      category: 'Pain Relief'
    },
    {
      id: 2,
      name: 'Vitamin C',
      price: 8000,
      description: 'Immune system support',
      image: 'https://placehold.co/200x200/png',
      category: 'Vitamins'
    },
    {
      id: 3,
      name: 'Allergy Relief',
      price: 12500,
      description: 'Fast-acting antihistamine',
      image: 'https://placehold.co/200x200/png',
      category: 'Allergy'
    },
    {
      id: 4,
      name: 'First Aid Kit',
      price: 25000,
      description: 'Essential home first aid supplies',
      image: 'https://placehold.co/200x200/png',
      category: 'First Aid'
    },
  ]);

  const [categories, setCategories] = useState<Category[]>([
    { id: 1, name: 'Pain Relief', icon: 'pill' },
    { id: 2, name: 'Cold & Flu', icon: 'virus' },
    { id: 3, name: 'Vitamins', icon: 'pill' },
    { id: 4, name: 'First Aid', icon: 'medical-bag' },
    { id: 5, name: 'Skin Care', icon: 'lotion-plus' },
    { id: 6, name: 'Digestion', icon: 'stomach' },
  ]);

  const [labTests, setLabTests] = useState<LabTest[]>([
    { id: 1, name: 'Complete Blood Count', price: 35000, turnaround: '24 hours' },
    { id: 2, name: 'Diabetes Screening', price: 45000, turnaround: '24 hours' },
    { id: 3, name: 'Cholesterol Panel', price: 40000, turnaround: '24 hours' },
    { id: 4, name: 'Thyroid Function', price: 70000, turnaround: '48 hours' },
  ]);

  const pickPrescriptionImage = async () => {
    setLoading(true);
    try {
      // Request permissions
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission Denied', 'We need camera roll permissions to upload your prescription.');
          setLoading(false);
          return;
        }
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        // Save the image URI for display in the modal
        setPrescriptionImage(result.assets[0].uri);
        // Show custom modal instead of Alert
        setPrescriptionModalVisible(true);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'There was an error uploading your prescription. Please try again.');
    }
    setLoading(false);
  };

  const handleCloseModal = () => {
    setPrescriptionModalVisible(false);
  };

  const handleViewOrders = () => {
    setPrescriptionModalVisible(false);
    router.push('/pharmacy-orders');
  };

  const navigateToCategory = (category: Category) => {
    router.push({
      pathname: '/pharmacy-all-medications' as any,
      params: { category: category.name }
    });
  };

  const navigateToMedication = (medication: Medication) => {
    router.push({
      pathname: '/pharmacy-medication',
      params: { medicationId: medication.id }
    });
  };

  const navigateToLabTest = (test: LabTest) => {
    router.push({
      pathname: '/pharmacy-lab-test' as any,
      params: { testId: test.id }
    });
  };

  const navigateToAllMedications = () => {
    router.push({
      pathname: '/pharmacy-all-medications' as any,
      params: { category: 'All' }
    });
  };

  const navigateToAllLabTests = () => {
    router.push('/pharmacy-all-lab-tests');
  };

  const bookLabSampleCollection = () => {
    router.push('/pharmacy-book-sample-collection' as any);
  };

  return (
    <SafeAreaView style={styles.container} edges={['right', 'left', 'top']}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <TouchableOpacity 
              onPress={() => router.back()}
              style={[styles.backButton, { padding: 8 }]}
            >
              <Ionicons name="arrow-back" size={24} color={theme.colors.primary} />
            </TouchableOpacity>
            <CustomText variant="headlineMedium" style={styles.heading}>Pharmacy</CustomText>
            <View style={styles.headerIcons}>
              <TouchableOpacity style={styles.headerIcon}>
                <MaterialCommunityIcons name="bell-outline" size={24} color={theme.colors.onSurface} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.headerIcon}>
                <MaterialCommunityIcons name="cart-outline" size={24} color={theme.colors.onSurface} />
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.searchContainer}>
            <Button 
              mode="contained" 
              onPress={() => router.push({
                pathname: '/pharmacy-all-medications' as any,
                params: { category: 'All' }
              })}
              style={styles.searchButton}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="search" size={16} color={theme.colors.onPrimary} style={{ marginRight: 8 }} />
                <CustomText style={{ color: theme.colors.onPrimary }}>Search medications...</CustomText>
              </View>
            </Button>
            
            <Button 
              mode="outlined" 
              onPress={() => router.push('/pharmacy-orders')}
              style={styles.prescriptionsButton}
              icon="file-document-outline"
            >
              My Prescriptions
            </Button>
          </View>
        </View>

        {/* Promotions Carousel */}
        <FeaturedCarousel items={pharmacyPromotions} />

        {/* Quick Actions */}
        <SectionHeader title="Quick Services" />
        <View style={styles.quickActions}>
          <Card style={styles.actionCard} onPress={pickPrescriptionImage}>
            <Card.Content style={styles.actionCardContent}>
              <FontAwesome5 name="prescription" size={32} color={theme.colors.primary} />
              <CustomText variant="bodyLarge" style={styles.actionTitle}>Upload Prescription</CustomText>
              <CustomText variant="bodySmall">Get your medicines delivered</CustomText>
            </Card.Content>
          </Card>

          <Card style={styles.actionCard} onPress={bookLabSampleCollection}>
            <Card.Content style={styles.actionCardContent}>
              <MaterialCommunityIcons name="test-tube" size={32} color={theme.colors.primary} />
              <CustomText variant="bodyLarge" style={styles.actionTitle}>Book Lab Test</CustomText>
              <CustomText variant="bodySmall">Home sample collection</CustomText>
            </Card.Content>
          </Card>
        </View>

        {/* Categories Section */}
        <SectionHeader title="Categories" />
        <View style={styles.categoriesScrollContainer}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesContainer}
          >
            {categories.map((category) => (
              <Card 
                key={category.id} 
                style={styles.categoryCard} 
                onPress={() => navigateToCategory(category)}
              >
                <Card.Content style={styles.categoryCardContent}>
                  <MaterialCommunityIcons name={category.icon as any} size={32} color={theme.colors.primary} />
                  <CustomText variant="bodyMedium" style={styles.categoryName}>{category.name}</CustomText>
                </Card.Content>
              </Card>
            ))}
          </ScrollView>
        </View>

        {/* Featured Medications */}
        <SectionHeader 
          title="Popular Medications" 
          actionText="View All" 
          onAction={navigateToAllMedications} 
        />
        <View style={styles.medicationsScrollContainer}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.medicationsContainer}
          >
            {featuredMedications.map((medication) => (
              <Card 
                key={medication.id} 
                style={styles.medicationCard} 
                onPress={() => navigateToMedication(medication)}
              >
                <Card.Cover source={{ uri: medication.image }} style={styles.medicationImage} />
                <Card.Content style={styles.medicationContent}>
                  <View style={styles.categoryChip}>
                    <CustomText variant="bodySmall">{medication.category}</CustomText>
                  </View>
                  <CustomText variant="titleMedium" numberOfLines={1}>{medication.name}</CustomText>
                  <CustomText variant="bodySmall" numberOfLines={2} style={styles.medicationDescription}>
                    {medication.description}
                  </CustomText>
                  <CustomText variant="titleMedium" style={styles.price}>XAF {medication.price.toLocaleString()}</CustomText>
                  <Button 
                    mode="contained" 
                    onPress={() => navigateToMedication(medication)}
                    style={styles.addToCartButton}
                  >
                    View Details
                  </Button>
                </Card.Content>
              </Card>
            ))}
          </ScrollView>
        </View>

        {/* Promotional Card - Added before Lab Tests */}
        <PharmacyPromoCard />

        {/* Lab Tests Section */}
        <SectionHeader 
          title="Lab Tests" 
          actionText="View All" 
          onAction={navigateToAllLabTests} 
        />
        <View style={styles.labTestsContainer}>
          {labTests.map((test) => (
            <Card 
              key={test.id} 
              style={styles.labTestCard} 
              onPress={() => navigateToLabTest(test)}
            >
              <Card.Content>
                <View style={styles.labTestContent}>
                  <View>
                    <CustomText variant="titleMedium">{test.name}</CustomText>
                    <CustomText variant="bodySmall">Results in: {test.turnaround}</CustomText>
                  </View>
                  <View>
                    <CustomText variant="titleMedium" style={styles.price}>XAF {test.price.toLocaleString()}</CustomText>
                    <View style={styles.discountBadge}>
                      <CustomText variant="bodySmall" style={{ color: 'white' }}>10% OFF</CustomText>
                    </View>
                  </View>
                </View>
              </Card.Content>
            </Card>
          ))}
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
          <Button 
            mode="contained" 
            onPress={bookLabSampleCollection}
            style={[styles.bookSampleButton, { marginLeft: 8 }]}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <MaterialCommunityIcons name="calendar-clock" size={20} color={theme.colors.onPrimary} style={{ marginRight: 8 }} />
              <CustomText style={{ color: theme.colors.onPrimary }}>Book Sample Collection</CustomText>
            </View>
          </Button>
        </View>
      </ScrollView>

      {/* Loading overlay */}
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <CustomText style={styles.loadingText}>Processing...</CustomText>
        </View>
      )}

      <PrescriptionSuccessModal
        visible={prescriptionModalVisible}
        onClose={handleCloseModal}
        onViewOrders={handleViewOrders}
        prescriptionImage={prescriptionImage || undefined}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    paddingBottom: 32,
  },
  header: {
    padding: 16,
    marginBottom: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerIcons: {
    flexDirection: 'row',
  },
  headerIcon: {
    marginLeft: 16,
  },
  backButton: {
    marginLeft: -8,
    marginRight: 8,
  },
  heading: {
    fontWeight: 'bold',
    marginBottom: 8,
    flex: 1,
    paddingLeft: 8,
  },
  searchContainer: {
    marginTop: 8,
  },
  searchButton: {
    borderRadius: 8,
    marginBottom: 10,
  },
  prescriptionsButton: {
    borderRadius: 8,
    borderColor: '#E53935',
    borderWidth: 1,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  actionCard: {
    width: '48%',
    borderRadius: 12,
  },
  actionCardContent: {
    alignItems: 'center',
    padding: 12,
  },
  actionTitle: {
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 4,
    fontWeight: '600',
    fontSize: 14,
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
  categoriesScrollContainer: {
    marginBottom: 16,
  },
  categoriesContainer: {
    paddingHorizontal: 16,
    paddingRight: 8,
  },
  categoryCard: {
    width: 100,
    marginRight: 12,
    borderRadius: 12,
  },
  categoryCardContent: {
    alignItems: 'center',
    padding: 12,
  },
  categoryName: {
    textAlign: 'center',
    marginTop: 8,
  },
  medicationsScrollContainer: {
    marginBottom: 24,
  },
  medicationsContainer: {
    paddingHorizontal: 16,
    paddingRight: 8,
  },
  medicationCard: {
    width: 180,
    marginRight: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  medicationImage: {
    height: 120,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  medicationContent: {
    padding: 12,
  },
  categoryChip: {
    alignSelf: 'flex-start',
    marginBottom: 8,
    height: 24,
    backgroundColor: '#f0f0f0',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  medicationDescription: {
    marginTop: 4,
    marginBottom: 8,
    opacity: 0.7,
  },
  price: {
    fontWeight: 'bold',
    marginVertical: 8,
  },
  addToCartButton: {
    marginTop: 8,
    borderRadius: 8,
  },
  labTestsContainer: {
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  labTestCard: {
    marginBottom: 12,
    borderRadius: 12,
  },
  labTestContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  discountBadge: {
    alignSelf: 'flex-end',
    marginTop: 4,
    backgroundColor: '#4CAF50',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 12,
  },
  bookSampleButton: {
    borderRadius: 8,
    marginTop: 8,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  loadingText: {
    color: 'white',
    marginTop: 12,
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
});

export default PharmacyScreen; 