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
import { useTranslation } from 'react-i18next';

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

// Component for section headers
function SectionHeader({ title, actionText, onAction }: { title: string; actionText?: string; onAction?: () => void }) {
  return (
    <View style={styles.sectionHeader}>
      <CustomText variant="titleMedium" style={styles.sectionTitle}>{title}</CustomText>
      {actionText && onAction && (
        <TouchableOpacity onPress={onAction}>
          <CustomText variant="labelLarge" style={styles.actionText}>{actionText}</CustomText>
        </TouchableOpacity>
      )}
    </View>
  );
}

// Component for featured carousel
function FeaturedCarousel({ items }: { items: Promotion[] }) {
  const theme = useTheme();
  const { t } = useTranslation();
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
  const { t } = useTranslation();
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
              {t('pharmacy.prescriptionUploadSuccess')}
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
              {t('pharmacy.prescriptionUploadMessage')}
            </CustomText>
            
            <View style={prescriptionModalStyles.timelineContainer}>
              <View style={prescriptionModalStyles.timelineItem}>
                <View style={[prescriptionModalStyles.timelinePoint, { backgroundColor: theme.colors.primary }]} />
                <View style={prescriptionModalStyles.timelineContent}>
                  <CustomText variant="bodyMedium" style={prescriptionModalStyles.timelineTitle}>{t('pharmacy.prescriptionDetails.received')}</CustomText>
                  <CustomText variant="bodySmall" style={prescriptionModalStyles.timelineDescription}>{t('pharmacy.prescriptionDetails.receivedTime')}</CustomText>
                </View>
              </View>
              
              <View style={[prescriptionModalStyles.timelineLine, { backgroundColor: theme.colors.outlineVariant }]} />
              
              <View style={prescriptionModalStyles.timelineItem}>
                <View style={[prescriptionModalStyles.timelinePoint, { backgroundColor: theme.colors.outlineVariant }]} />
                <View style={prescriptionModalStyles.timelineContent}>
                  <CustomText variant="bodyMedium" style={prescriptionModalStyles.timelineTitle}>{t('pharmacy.prescriptionDetails.review')}</CustomText>
                  <CustomText variant="bodySmall" style={prescriptionModalStyles.timelineDescription}>{t('pharmacy.prescriptionDetails.reviewTime')}</CustomText>
                </View>
              </View>
              
              <View style={[prescriptionModalStyles.timelineLine, { backgroundColor: theme.colors.outlineVariant }]} />
              
              <View style={prescriptionModalStyles.timelineItem}>
                <View style={[prescriptionModalStyles.timelinePoint, { backgroundColor: theme.colors.outlineVariant }]} />
                <View style={prescriptionModalStyles.timelineContent}>
                  <CustomText variant="bodyMedium" style={prescriptionModalStyles.timelineTitle}>{t('pharmacy.prescriptionDetails.delivery')}</CustomText>
                  <CustomText variant="bodySmall" style={prescriptionModalStyles.timelineDescription}>{t('pharmacy.prescriptionDetails.deliveryTime')}</CustomText>
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
              {t('pharmacy.continueShopping')}
            </Button>
            
            <Button
              mode="contained"
              onPress={onViewOrders}
              style={prescriptionModalStyles.modalButton}
              icon="clipboard-text-outline"
            >
              {t('pharmacy.viewOrders')}
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
  const { t } = useTranslation();
  
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
              {t('pharmacy.promoCard.title')}
            </CustomText>
            <CustomText variant="bodyLarge" style={promoCardStyles.description}>
              {t('pharmacy.promoCard.description')}
            </CustomText>
            <CustomText variant="bodyMedium" style={promoCardStyles.subtitle}>
              {t('pharmacy.healthCheckIncluded')}
            </CustomText>
            
            <Button 
              mode="contained" 
              onPress={() => console.log('Health package promo clicked')}
              style={promoCardStyles.button}
            >
              {t('pharmacy.promoCard.button')}
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
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);
  const [prescriptionModalVisible, setPrescriptionModalVisible] = useState(false);
  const [prescriptionImage, setPrescriptionImage] = useState<string | null>(null);
  
  // Prepare promotions with translations
  const promotions: Promotion[] = [
    {
      id: '1',
      title: t('pharmacy.promotions.healthEssentials.title'),
      description: t('pharmacy.promotions.healthEssentials.description'),
      image: { uri: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=600' },
      action: t('pharmacy.promotions.shopNow'),
    },
    {
      id: '2',
      title: t('pharmacy.promotions.diabetesCare.title'),
      description: t('pharmacy.promotions.diabetesCare.description'),
      image: { uri: 'https://images.unsplash.com/photo-1631815589068-dc4c4c204a30?q=80&w=600' },
      action: t('pharmacy.promotions.learnMore'),
    },
    {
      id: '3',
      title: t('pharmacy.promotions.babyMother.title'),
      description: t('pharmacy.promotions.babyMother.description'),
      image: { uri: 'https://images.unsplash.com/photo-1515942400420-2b98fed1f515?q=80&w=600' },
      action: t('pharmacy.promotions.viewOffers'),
    },
  ];
  
  const [featuredMedications, setFeaturedMedications] = useState<Medication[]>([
    {
      id: 1,
      name: t('pharmacy.medications1.paracetamol.name'),
      price: 5500,
      description: t('pharmacy.medications1.paracetamol.description'),
      image: 'https://placehold.co/200x200/png',
      category: t('pharmacy.categories.painRelief')
    },
    {
      id: 2,
      name: t('pharmacy.medications1.vitaminC.name'),
      price: 8000,
      description: t('pharmacy.medications1.vitaminC.description'),
      image: 'https://placehold.co/200x200/png',
      category: t('pharmacy.categories.vitamins')
    },
    {
      id: 3,
      name: t('pharmacy.medications1.allergyRelief.name'),
      price: 12500,
      description: t('pharmacy.medications1.allergyRelief.description'),
      image: 'https://placehold.co/200x200/png',
      category: t('pharmacy.categories.allergy')
    },
    {
      id: 4,
      name: t('pharmacy.medications1.firstAidKit.name'),
      price: 25000,
      description: t('pharmacy.medications1.firstAidKit.description'),
      image: 'https://placehold.co/200x200/png',
      category: t('pharmacy.categories.firstAid')
    },
  ]);

  const [categories, setCategories] = useState<Category[]>([
    { id: 1, name: t('pharmacy.categories.painRelief'), icon: 'pill' },
    { id: 2, name: t('pharmacy.categories.coldAndFlu'), icon: 'virus' },
    { id: 3, name: t('pharmacy.categories.vitamins'), icon: 'pill' },
    { id: 4, name: t('pharmacy.categories.firstAid'), icon: 'medical-bag' },
    { id: 5, name: t('pharmacy.categories.skinCare'), icon: 'lotion-plus' },
    { id: 6, name: t('pharmacy.categories.digestion'), icon: 'stomach' },
  ]);

  const [labTests, setLabTests] = useState<LabTest[]>([
    { id: 1, name: t('pharmacy.labTests1.completeBloodCount'), price: 35000, turnaround: t('pharmacy.labTests1.turnaround.oneDay') },
    { id: 2, name: t('pharmacy.labTests1.diabetesScreening'), price: 45000, turnaround: t('pharmacy.labTests1.turnaround.oneDay') },
    { id: 3, name: t('pharmacy.labTests1.cholesterolPanel'), price: 40000, turnaround: t('pharmacy.labTests1.turnaround.oneDay') },
    { id: 4, name: t('pharmacy.labTests1.thyroidFunction'), price: 70000, turnaround: t('pharmacy.labTests1.turnaround.twoDays') },
  ]);

  const pickPrescriptionImage = async () => {
    setLoading(true);
    try {
      // Request permissions
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert(
            t('common.permissionDenied'), 
            t('pharmacy.permissionMessages.cameraRoll')
          );
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
      Alert.alert(
        t('common.error'), 
        t('pharmacy.permissionMessages.uploadError')
      );
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
            <CustomText variant="headlineMedium" style={styles.heading}>{t('pharmacy.medications')}</CustomText>
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
                <CustomText style={{ color: theme.colors.onPrimary }}>{t('pharmacy.findMedication')}</CustomText>
              </View>
            </Button>
            
            <Button 
              mode="outlined" 
              onPress={() => router.push('/pharmacy-orders')}
              style={styles.prescriptionsButton}
              icon="file-document-outline"
            >
              {t('pharmacy.prescription1')}
            </Button>
          </View>
        </View>

        {/* Promotions Carousel */}
        <FeaturedCarousel items={promotions} />

        {/* Quick Actions */}
        <SectionHeader title={t('pharmacy.quickServices')} />
        <View style={styles.quickActions}>
          <Card style={styles.actionCard} onPress={pickPrescriptionImage}>
            <Card.Content style={styles.actionCardContent}>
              <FontAwesome5 name="prescription" size={32} color={theme.colors.primary} />
              <CustomText variant="bodyLarge" style={styles.actionTitle}>{t('pharmacy.uploadPrescription')}</CustomText>
              <CustomText variant="bodySmall">{t('pharmacy.getMedicinesDelivered')}</CustomText>
            </Card.Content>
          </Card>

          <Card style={styles.actionCard} onPress={bookLabSampleCollection}>
            <Card.Content style={styles.actionCardContent}>
              <MaterialCommunityIcons name="test-tube" size={32} color={theme.colors.primary} />
              <CustomText variant="bodyLarge" style={styles.actionTitle}>{t('pharmacy.bookLabTest')}</CustomText>
              <CustomText variant="bodySmall">{t('pharmacy.homeSampleCollection')}</CustomText>
            </Card.Content>
          </Card>
        </View>

        {/* Categories Section */}
        <SectionHeader title={t('pharmacy.popularCategories')} />
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
          title={t('pharmacy.popularMedications')} 
          actionText={t('pharmacy.viewAll')} 
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
                  <CustomText variant="titleMedium" style={styles.price}>{t('common.currency', { price: medication.price.toLocaleString() })}</CustomText>
                  <Button 
                    mode="contained" 
                    onPress={() => navigateToMedication(medication)}
                    style={styles.addToCartButton}
                  >
                    {t('pharmacy.viewDetails')}
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
          title={t('pharmacy.labTests')} 
          actionText={t('pharmacy.viewAll')} 
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
                  <View style={{ flex: 1, marginRight: 12 }}>
                    <CustomText variant="titleMedium" numberOfLines={2} ellipsizeMode="tail" style={{ marginBottom: 4 }}>{test.name}</CustomText>
                    <CustomText variant="bodySmall">{t('pharmacy.labTestDetails.resultsIn', { time: test.turnaround })}</CustomText>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <CustomText variant="titleMedium" style={styles.price}>{t('common.currency', { price: test.price.toLocaleString() })}</CustomText>
                    <View style={styles.discountBadge}>
                      <CustomText variant="bodySmall" style={{ color: 'white' }}>{t('pharmacy.labTestDetails.discount', { discount: 10 })}</CustomText>
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
              <CustomText style={{ color: theme.colors.onPrimary }}>{t('pharmacy.bookSampleCollection')}</CustomText>
            </View>
          </Button>
        </View>
      </ScrollView>

      {/* Loading overlay */}
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <CustomText style={styles.loadingText}>{t('common.loading')}</CustomText>
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
    alignItems: 'flex-start',
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
  title: {
    fontWeight: 'bold',
    marginBottom: 16,
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchBarPlaceholder: {
    color: '#666',
    flex: 1,
  },
  actionText: {
    color: '#0066cc',
    fontWeight: '500',
  },
});

export default PharmacyScreen; 